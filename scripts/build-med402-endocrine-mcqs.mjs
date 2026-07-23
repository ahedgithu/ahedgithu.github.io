import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultSource = 'G:\\school\\study mode\\subjects\\402\\new mcqs\\Endocrine_Question_Bank.md'
const sourcePath = path.resolve(process.argv[2] || defaultSource)
const targetPaths = [
  path.join(repoRoot, 'src', 'med402-endocrine-mcqs.js'),
  path.join(repoRoot, 'public', 'src', 'med402-endocrine-mcqs.js')
]

const chapterDefinitions = [
  {
    heading: 'ANTERIOR PITUITARY',
    id: 'anterior-pituitary',
    label: 'Anterior Pituitary',
    expectedCount: 132
  },
  {
    heading: 'POSTERIOR PITUITARY',
    id: 'posterior-pituitary',
    label: 'Posterior Pituitary',
    expectedCount: 32
  },
  {
    heading: 'DIABETES MELLITUS',
    id: 'diabetes-mellitus',
    label: 'Diabetes Mellitus',
    expectedCount: 197
  }
]

function cleanText(value) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:?!])/g, '$1')
    .trim()
}

function normalizeForMatch(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function parseQuestionBlock(block, chapter, pageIndex) {
  const lines = block.replace(/\r\n/g, '\n').split('\n')
  const number = Number(lines.shift()?.trim())
  const stemLines = []
  const choices = []
  let activeChoice = null
  let source = ''

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    const sourceMatch = line.match(/^\*Source:\s*(.+)\*$/)
    if (sourceMatch) {
      source = cleanText(sourceMatch[1])
      activeChoice = null
      continue
    }

    const choiceMatch = line.match(/^- ([A-H])\.\s*(.*)$/)
    if (choiceMatch) {
      activeChoice = {
        letter: choiceMatch[1],
        text: cleanText(choiceMatch[2])
      }
      choices.push(activeChoice)
      continue
    }

    if (activeChoice) {
      activeChoice.text = cleanText(`${activeChoice.text} ${line}`)
      continue
    }

    if (/^All relevant questions from the 11 uploaded references/i.test(line)) continue
    stemLines.push(line)
  }

  let question = cleanText(stemLines.join(' '))
  question = question.replace(new RegExp(`^${number}[.)]?\\s+`), '')

  if (!choices.length) {
    const inlineChoices = [...question.matchAll(/\(([A-H])\)\s*/gi)]
    if (inlineChoices.length >= 2) {
      const fullText = question
      question = cleanText(fullText.slice(0, inlineChoices[0].index))
      inlineChoices.forEach((match, index) => {
        const start = match.index + match[0].length
        const end = inlineChoices[index + 1]?.index ?? fullText.length
        choices.push({
          letter: match[1].toUpperCase(),
          text: cleanText(fullText.slice(start, end))
        })
      })
    }
  }

  if (!number) throw new Error(`Invalid ${chapter.label} question number on source block ${pageIndex + 1}`)

  return {
    number,
    question,
    choices,
    source
  }
}

function resolveAnswerIndex(answerText, choices, chapterLabel, questionNumber) {
  const explicitLetter = answerText.match(/^([A-H])(?:\s*-\s*|\.\s*|\s*$)(.*)$/)
  if (explicitLetter) {
    const answerIndex = choices.findIndex((choice) => choice.letter === explicitLetter[1])
    if (answerIndex < 0) {
      throw new Error(`${chapterLabel} question ${questionNumber} references missing option ${explicitLetter[1]}`)
    }
    return answerIndex
  }

  const normalizedAnswer = normalizeForMatch(answerText)
  const exactMatches = choices
    .map((choice, index) => ({ index, value: normalizeForMatch(choice.text) }))
    .filter((choice) => choice.value === normalizedAnswer)

  if (exactMatches.length === 1) return exactMatches[0].index

  const partialMatches = choices
    .map((choice, index) => ({ index, value: normalizeForMatch(choice.text) }))
    .filter((choice) => (
      choice.value.length >= 5 &&
      normalizedAnswer.length >= 5 &&
      (choice.value.includes(normalizedAnswer) || normalizedAnswer.includes(choice.value))
    ))

  if (partialMatches.length === 1) return partialMatches[0].index

  throw new Error(
    `${chapterLabel} question ${questionNumber} has an unresolved answer "${answerText}" ` +
    `for choices ${choices.map((choice) => `${choice.letter}. ${choice.text}`).join(' | ')}`
  )
}

function parseSource(markdown) {
  const chapterMatches = [...markdown.matchAll(/^# (ANTERIOR PITUITARY|POSTERIOR PITUITARY|DIABETES MELLITUS) MED1$/gm)]
  const parsedByChapter = Object.fromEntries(chapterDefinitions.map((chapter) => [chapter.heading, []]))
  const rawCounts = Object.fromEntries(chapterDefinitions.map((chapter) => [chapter.heading, 0]))
  const heldForReview = []

  chapterMatches.forEach((match, pageIndex) => {
    const chapter = chapterDefinitions.find((item) => item.heading === match[1])
    const block = markdown.slice(match.index + match[0].length, chapterMatches[pageIndex + 1]?.index ?? markdown.length)
    const answerMarkerIndex = block.indexOf('### ANSWERS')
    if (answerMarkerIndex < 0) throw new Error(`${chapter.label} source block ${pageIndex + 1} has no answer section`)

    const questionsText = block.slice(0, answerMarkerIndex)
    const answersText = block.slice(answerMarkerIndex + '### ANSWERS'.length)
    const questionMatches = [...questionsText.matchAll(/^(\d+)\s*$/gm)]
    const answers = new Map(
      [...answersText.matchAll(/^- (\d+)\)\s*(.+)$/gm)]
        .map((answerMatch) => [Number(answerMatch[1]), cleanText(answerMatch[2])])
    )

    const questions = questionMatches.map((questionMatch, questionIndex) => {
      const questionBlock = questionsText.slice(
        questionMatch.index,
        questionMatches[questionIndex + 1]?.index ?? questionsText.length
      )
      return parseQuestionBlock(questionBlock, chapter, pageIndex)
    })

    if (questions.length !== answers.size) {
      throw new Error(
        `${chapter.label} source block ${pageIndex + 1} has ${questions.length} questions and ${answers.size} answers`
      )
    }

    questions.forEach((question) => {
      rawCounts[chapter.heading] += 1
      const answerText = answers.get(question.number)
      if (!answerText) throw new Error(`${chapter.label} question ${question.number} has no answer`)
      if (!question.question || question.choices.length < 2 || !question.source) {
        heldForReview.push({
          chapter: chapter.label,
          originalNumber: String(question.number),
          question: question.question,
          choices: question.choices.map((choice) => choice.text),
          answer: answerText,
          source: question.source,
          reason: `Incomplete source record: ${question.choices.length} choices`
        })
        return
      }
      let answerIndex
      try {
        answerIndex = resolveAnswerIndex(answerText, question.choices, chapter.label, question.number)
      } catch (error) {
        heldForReview.push({
          chapter: chapter.label,
          originalNumber: String(question.number),
          question: question.question,
          choices: question.choices.map((choice) => choice.text),
          answer: answerText,
          source: question.source,
          reason: error.message
        })
        return
      }

      parsedByChapter[chapter.heading].push({
        id: `med402-endo-${chapter.id}-q${String(question.number).padStart(3, '0')}`,
        originalNumber: String(question.number),
        category: chapter.label,
        organ: chapter.label,
        question: question.question,
        choices: question.choices.map((choice) => choice.text),
        answerIndex,
        explanation: `Answer: ${question.choices[answerIndex].text}.`,
        source: question.source,
        section: `${chapter.label} · ${question.source}`,
        topicTags: ['MED402-1', 'Endocrinology', chapter.label]
      })
    })
  })

  return {
    chapters: chapterDefinitions.map((chapter) => ({
      ...chapter,
      rawCount: rawCounts[chapter.heading],
      questions: parsedByChapter[chapter.heading]
    })),
    heldForReview
  }
}

function createParts(chapter, sourceId) {
  const partSize = chapter.questions.length > 30 ? 30 : Math.ceil(chapter.questions.length / 2)
  const partSizes = []
  for (let offset = 0; offset < chapter.questions.length; offset += partSize) {
    partSizes.push(Math.min(partSize, chapter.questions.length - offset))
  }

  let offset = 0
  const parts = partSizes.map((size, index) => {
    const questions = chapter.questions.slice(offset, offset + size)
    const firstNumber = questions[0].originalNumber
    const lastNumber = questions.at(-1).originalNumber
    offset += size
    return {
      id: `med402-endo-${chapter.id}-p${String(index + 1).padStart(2, '0')}`,
      label: `Part ${index + 1} · Q${firstNumber}–${lastNumber}`,
      description: `${chapter.label} questions`,
      range: `Q${firstNumber}–${lastNumber}`,
      questionStart: Number(firstNumber),
      questionEnd: Number(lastNumber),
      parentSourceId: sourceId,
      groupId: chapter.id,
      groupLabel: chapter.label,
      partIndex: index,
      partCount: partSizes.length,
      shuffleQuestions: false,
      shuffleOptions: false,
      mcqs: questions
    }
  })

  if (offset !== chapter.questions.length || parts.some((part) => !part.mcqs.length)) {
    throw new Error(`${chapter.label} part sizes do not cover all ${chapter.questions.length} questions`)
  }
  return parts
}

function buildGeneratedSource(chapters, heldForReview, sourceHash) {
  const sourceId = 'med402-endocrine-question-bank'
  const questions = chapters.flatMap((chapter) => chapter.questions)
  const groups = chapters.map((chapter) => ({
    id: chapter.id,
    label: chapter.label,
    questionCount: chapter.questions.length,
    parts: createParts(chapter, sourceId)
  }))
  const partCount = groups.reduce((total, group) => total + group.parts.length, 0)

  return `// Generated by scripts/build-med402-endocrine-mcqs.mjs.
// Source SHA-256: ${sourceHash}
// Included: ${questions.length} answer-keyed endocrine questions across ${chapters.length} chapters.
(() => {
  const quizzes = window.mcqQuizzes402 || (window.mcqQuizzes402 = {})
  const quiz = quizzes["MED 402-1 MCQs"] || (quizzes["MED 402-1 MCQs"] = { alwaysShowSourcePicker: true, sources: [] })
  quiz.alwaysShowSourcePicker = true

  const source = ${JSON.stringify({
    id: sourceId,
    label: 'Endocrine Question Bank',
    description: `${questions.length} questions · ${chapters.length} chapters · ${partCount} short parts`,
    shuffleQuestions: false,
    shuffleOptions: false,
    mcqs: questions,
    heldForReview,
    collection: {
      prompt: 'Choose an endocrine chapter or a revision mode.',
      groupNoun: 'chapter',
      groupEyebrow: 'MED402-1 endocrinology',
      mixedMeta: 'Random questions from anterior pituitary, posterior pituitary, and diabetes mellitus.',
      mixedSizes: [
        { id: 'quick-20', label: 'Quick 20', size: 20, description: 'A short mixed endocrine session.' },
        { id: 'standard-30', label: 'Standard 30', size: 30, description: 'Balanced endocrine practice.' },
        { id: 'exam-50', label: 'Exam 50', size: 50, description: 'A longer mixed endocrine session.' }
      ],
      wrongReviewId: 'med402-endocrine-wrong-review',
      groups
    }
  }, null, 2)}

  quiz.sources = (quiz.sources || []).filter((item) => item.id !== source.id)
  quiz.sources.push(source)
})()
`
}

const markdown = await readFile(sourcePath, 'utf8')
const { chapters, heldForReview } = parseSource(markdown)
const questions = chapters.flatMap((chapter) => chapter.questions)

for (const chapter of chapters) {
  if (chapter.rawCount !== chapter.expectedCount) {
    throw new Error(`${chapter.label} source count mismatch: expected ${chapter.expectedCount}, got ${chapter.rawCount}`)
  }
  const expectedNumbers = Array.from({ length: chapter.expectedCount }, (_, index) => index + 1)
  const heldNumbers = heldForReview
    .filter((question) => question.chapter === chapter.label)
    .map((question) => Number(question.originalNumber))
  const actualNumbers = [
    ...chapter.questions.map((question) => Number(question.originalNumber)),
    ...heldNumbers
  ].sort((a, b) => a - b)
  if (JSON.stringify(actualNumbers) !== JSON.stringify(expectedNumbers)) {
    throw new Error(`${chapter.label} numbering is incomplete or out of order`)
  }
}

if (questions.length + heldForReview.length !== 361) {
  throw new Error(`Expected 361 source records, got ${questions.length} included and ${heldForReview.length} held`)
}
if (new Set(questions.map((question) => question.id)).size !== questions.length) {
  throw new Error('Generated MED402 endocrine question IDs are not unique')
}
if (questions.some((question) => question.choices.length < 2 || !question.choices[question.answerIndex])) {
  throw new Error('Generated MED402 endocrine questions contain an invalid answer')
}

const sourceHash = createHash('sha256').update(markdown).digest('hex')
const generatedSource = buildGeneratedSource(chapters, heldForReview, sourceHash)
await Promise.all(targetPaths.map((targetPath) => writeFile(targetPath, generatedSource, 'utf8')))

console.log(JSON.stringify({
  sourcePath,
  sourceHash,
  included: questions.length,
  heldForReview: heldForReview.map((question) => `${question.chapter} Q${question.originalNumber}: ${question.reason}`),
  chapters: Object.fromEntries(chapters.map((chapter) => [chapter.label, chapter.questions.length])),
  outputs: targetPaths
}, null, 2))
