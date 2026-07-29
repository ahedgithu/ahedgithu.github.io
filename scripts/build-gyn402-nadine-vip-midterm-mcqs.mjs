import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultSource = 'C:\\Users\\ahmed\\Downloads\\Telegram Desktop\\dr nadine VIP midterm questions.json'
const sourcePath = path.resolve(process.argv[2] || defaultSource)
const targetPaths = [
  path.join(repoRoot, 'src', 'gyn402-nadine-vip-midterm-mcqs.js'),
  path.join(repoRoot, 'public', 'src', 'gyn402-nadine-vip-midterm-mcqs.js')
]

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:?!])/g, '$1')
    .trim()
}

function slugify(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function parseSource(sourceContent) {
  const data = JSON.parse(sourceContent)
  if (!Array.isArray(data.questions)) {
    throw new Error('Invalid JSON structure: missing questions array')
  }

  const questions = data.questions.map((rawQuestion) => {
    const originalNumber = Number(rawQuestion.number)
    const optionKeys = Object.keys(rawQuestion.options || {}).sort()
    const answerKey = cleanText(rawQuestion.answer).toLowerCase()
    const answerIndex = optionKeys.indexOf(answerKey)
    const choices = optionKeys.map((key) => cleanText(rawQuestion.options[key]))
    const context = [rawQuestion.note, rawQuestion.shared_stem]
      .map(cleanText)
      .filter(Boolean)
    const question = [...context, cleanText(rawQuestion.stem)].join(' ')
    const section = cleanText(rawQuestion.section) || 'Core midterm questions'

    if (!Number.isInteger(originalNumber) || !question || choices.length < 2) {
      throw new Error(`Question ${rawQuestion.number || '?'} is incomplete`)
    }
    if (answerIndex < 0 || !choices[answerIndex]) {
      throw new Error(`Question ${originalNumber} has an invalid answer key`)
    }

    return {
      id: `gyn402-nadine-vip-q${String(originalNumber).padStart(3, '0')}`,
      originalNumber: String(originalNumber),
      category: section,
      organ: 'Gynecology & Obstetrics',
      question,
      choices,
      answerIndex,
      explanation: `Answer: ${cleanText(rawQuestion.answer_text) || choices[answerIndex]}`,
      source: `Dr Nadine VIP Midterm - Q${originalNumber}`,
      section,
      topicTags: ['GYNA402', 'Midterm', section]
    }
  })

  return {
    title: cleanText(data.title) || 'Midterm 402 Quiz',
    declaredTotal: Number(data.total_questions),
    questions
  }
}

function chunkQuestions(questions, size) {
  const chunks = []
  for (let index = 0; index < questions.length; index += size) {
    chunks.push(questions.slice(index, index + size))
  }
  return chunks
}

function buildCollectionGroups(questions, sourceId) {
  const sectionMap = new Map()
  questions.forEach((question) => {
    const sectionQuestions = sectionMap.get(question.section) || []
    sectionQuestions.push(question)
    sectionMap.set(question.section, sectionQuestions)
  })

  return Array.from(sectionMap, ([label, sectionQuestions]) => {
    const groupId = slugify(label) || 'midterm'
    const chunks = chunkQuestions(sectionQuestions, 20)
    const parts = chunks.map((partQuestions, partIndex) => {
      const firstQuestion = partQuestions[0]
      const lastQuestion = partQuestions.at(-1)
      return {
        id: `gyn402-nadine-vip-${groupId}-p${String(partIndex + 1).padStart(2, '0')}`,
        label: chunks.length > 1 ? `Part ${partIndex + 1}` : label,
        description: `${partQuestions.length} questions`,
        range: `Q${firstQuestion.originalNumber}-Q${lastQuestion.originalNumber}`,
        questionStart: Number(firstQuestion.originalNumber),
        questionEnd: Number(lastQuestion.originalNumber),
        parentSourceId: sourceId,
        groupId,
        groupLabel: label,
        partIndex,
        partCount: chunks.length,
        shuffleQuestions: false,
        shuffleOptions: false,
        mcqs: partQuestions
      }
    })

    return {
      id: groupId,
      label,
      questionCount: sectionQuestions.length,
      parts
    }
  })
}

function buildGeneratedSource(title, questions, groups, sourceHash) {
  const source = {
    id: 'gyn402-nadine-vip-midterm',
    label: 'Dr Nadine VIP Midterm',
    description: `${questions.length} answered questions - ${groups.length} sections`,
    shuffleQuestions: false,
    shuffleOptions: false,
    mcqs: questions,
    heldForReview: [],
    collection: {
      prompt: 'Choose a midterm section or a revision mode.',
      groupNoun: 'section',
      groupEyebrow: 'GYN 402 midterm',
      mixedMeta: `Random questions from ${title}.`,
      mixedSizes: [
        { id: 'quick-20', label: 'Quick 20', size: 20, description: 'A short mixed GYN 402 session.' },
        { id: 'standard-30', label: 'Standard 30', size: 30, description: 'Balanced GYN 402 midterm practice.' },
        { id: 'full-100', label: 'Full 100', size: questions.length, description: 'Solve the complete Dr Nadine VIP midterm bank.' }
      ],
      wrongReviewId: 'gyn402-nadine-vip-wrong-review',
      groups
    }
  }

  return `// Generated by scripts/build-gyn402-nadine-vip-midterm-mcqs.mjs.
// Source SHA-256: ${sourceHash}
// Included: ${questions.length} answer-keyed GYN 402 midterm questions.
(() => {
  const quizzes = window.mcqQuizzes402 || (window.mcqQuizzes402 = {})
  const quiz = quizzes["GYN 402 MCQs"] || (quizzes["GYN 402 MCQs"] = { alwaysShowSourcePicker: true, sources: [] })
  quiz.alwaysShowSourcePicker = true

  const source = ${JSON.stringify(source, null, 2)}

  quiz.sources = (quiz.sources || []).filter((item) => item.id !== source.id)
  quiz.sources.push(source)
})()
`
}

const sourceContent = await readFile(sourcePath, 'utf8')
const sourceHash = createHash('sha256').update(sourceContent).digest('hex')
const { title, declaredTotal, questions } = parseSource(sourceContent)
const sourceId = 'gyn402-nadine-vip-midterm'
const groups = buildCollectionGroups(questions, sourceId)

if (declaredTotal !== 100 || questions.length !== 100) {
  throw new Error(`Expected 100 questions, got declared=${declaredTotal}, parsed=${questions.length}`)
}
if (new Set(questions.map((question) => question.id)).size !== questions.length) {
  throw new Error('Generated question IDs are not unique')
}
if (questions.some((question) => !Number.isInteger(question.answerIndex) || !question.choices[question.answerIndex])) {
  throw new Error('Generated questions contain an invalid answer')
}

const generatedSource = buildGeneratedSource(title, questions, groups, sourceHash)
await Promise.all(targetPaths.map((targetPath) => writeFile(targetPath, generatedSource, 'utf8')))

console.log(JSON.stringify({
  sourcePath,
  sourceHash,
  included: questions.length,
  heldForReview: 0,
  sections: groups.length,
  outputs: targetPaths
}, null, 2))
