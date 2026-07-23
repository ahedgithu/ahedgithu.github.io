import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultSourceRoot = 'G:\\school\\study mode\\subjects\\MED-2\\mcqs'
const sourceRoot = path.resolve(process.argv[2] || defaultSourceRoot)
const sourceDefinitions = [
  {
    id: 'med2-cardio-question-bank',
    label: 'Cardiology Question Bank',
    fileName: 'Cardio_Question_Bank_Training_New.md',
    prefix: 'med2-cardio',
    expectedCount: 235,
    groupEyebrow: 'MED-2 cardiology',
    groupNoun: 'topic',
    prompt: 'Choose a cardiology topic or a revision mode.',
    mixedMeta: 'Random questions from pulmonary embolism, rheumatic fever, hypertension, and valvular disease.',
    wrongReviewId: 'med2-cardio-wrong-review',
    groups: [
      { id: 'pulmonary-embolism', label: 'Pulmonary Embolism', start: 1, end: 50 },
      { id: 'rheumatic-fever', label: 'Rheumatic Fever', start: 51, end: 90 },
      { id: 'systemic-hypertension', label: 'Systemic Hypertension', start: 91, end: 150 },
      { id: 'mitral-valve-diseases', label: 'Mitral Valve Diseases', start: 151, end: 190 },
      { id: 'aortic-valve-diseases', label: 'Aortic Valve Diseases', start: 191, end: 235 }
    ]
  },
  {
    id: 'med2-chest-question-bank',
    label: 'Chest Medicine Question Bank',
    fileName: 'Chest_Question_Bank_Training_New.md',
    prefix: 'med2-chest',
    expectedCount: 300,
    groupEyebrow: 'MED-2 chest medicine',
    groupNoun: 'topic',
    prompt: 'Choose a chest medicine topic or a revision mode.',
    mixedMeta: 'Random questions from symptomatology, pulmonary function tests, airway disease, and bronchial asthma.',
    wrongReviewId: 'med2-chest-wrong-review',
    groups: [
      { id: 'symptomatology', label: 'Cough, Sputum, Hemoptysis & Dyspnea', start: 1, end: 70 },
      { id: 'pulmonary-function-tests', label: 'Pulmonary Function Tests', start: 71, end: 150 },
      { id: 'upper-lower-airway', label: 'Upper & Lower Airway Diseases', start: 151, end: 170 },
      { id: 'small-airway', label: 'Small Airway Diseases', start: 171, end: 190 },
      { id: 'subglottic-vocal-cord', label: 'Subglottic Stenosis & Vocal Cord Dysfunction', start: 191, end: 200 },
      { id: 'bronchial-asthma', label: 'Bronchial Asthma, Steps & Biologics', start: 201, end: 300 }
    ]
  }
]
const targetPaths = [
  path.join(repoRoot, 'src', 'med2-cardio-chest-mcqs.js'),
  path.join(repoRoot, 'public', 'src', 'med2-cardio-chest-mcqs.js')
]

function cleanText(value = '') {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:?!])/g, '$1')
    .trim()
}

function getGroup(definition, questionNumber) {
  return definition.groups.find((group) => questionNumber >= group.start && questionNumber <= group.end)
}

function parseQuestionBlock(block, definition, questionNumber) {
  const lines = block.replace(/\r\n/g, '\n').split('\n')
  const questionLines = []
  const choices = []
  let activeChoice = null
  let answer = ''
  let rationale = ''
  let source = ''
  let readingChoices = false

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line === '---' || line === '</details>') continue
    if (/^<details>|^<summary>/i.test(line)) continue

    const answerMatch = line.match(/^\*\*(?:Correct answer|Answer):\*\*\s*(.+)$/i)
    if (answerMatch) {
      answer = cleanText(answerMatch[1])
      activeChoice = null
      continue
    }

    const rationaleMatch = line.match(/^\*\*Rationale:\*\*\s*(.+)$/i)
    if (rationaleMatch) {
      rationale = cleanText(rationaleMatch[1])
      activeChoice = null
      continue
    }

    const sourceMatch = line.match(/^\*\*Source:\*\*\s*(.+)$/i)
    if (sourceMatch) {
      source = cleanText(sourceMatch[1])
      activeChoice = null
      continue
    }

    const choiceMatch = line.match(/^- \*\*([A-H])\.\*\*\s*(.*)$/)
    if (choiceMatch) {
      readingChoices = true
      activeChoice = {
        letter: choiceMatch[1],
        text: cleanText(choiceMatch[2])
      }
      choices.push(activeChoice)
      continue
    }

    if (activeChoice && readingChoices && !line.startsWith('**')) {
      activeChoice.text = cleanText(`${activeChoice.text} ${line}`)
      continue
    }

    if (!readingChoices && !line.startsWith('<!--')) questionLines.push(line)
  }

  const group = getGroup(definition, questionNumber)
  if (!group) throw new Error(`${definition.label} Q${questionNumber} is outside the configured topic ranges`)

  return {
    originalNumber: String(questionNumber),
    category: group.label,
    question: cleanText(questionLines.join(' ')),
    choices,
    answer,
    rationale,
    source
  }
}

function parseSource(markdown, definition) {
  const matches = [...markdown.matchAll(/^### Q0*(\d+)[^\n]*$/gm)]
  const parsed = []
  const heldForReview = []

  matches.forEach((match, index) => {
    const questionNumber = Number(match[1])
    const block = markdown.slice(match.index + match[0].length, matches[index + 1]?.index ?? markdown.length)
    const record = parseQuestionBlock(block, definition, questionNumber)
    const answerMatch = record.answer.match(/^([A-H])\.\s*(.*)$/)
    let reason = ''
    let answerIndex = -1

    if (!record.question || record.choices.length < 2 || !record.answer || !record.source) {
      reason = `Incomplete source record: ${record.choices.length} choices`
    } else if (!answerMatch) {
      reason = /(?:^|;\s*)[A-H]\s+[TF](?:;|$)/.test(record.answer)
        ? 'Multi-statement true/false answer cannot be represented as one correct option'
        : `Unresolved answer format: ${record.answer}`
    } else {
      answerIndex = record.choices.findIndex((choice) => choice.letter === answerMatch[1])
      if (answerIndex < 0) reason = `Answer references missing option ${answerMatch[1]}`
    }

    if (reason) {
      heldForReview.push({
        category: record.category,
        originalNumber: record.originalNumber,
        question: record.question,
        choices: record.choices.map((choice) => choice.text),
        answer: record.answer,
        rationale: record.rationale,
        source: record.source,
        reason
      })
      return
    }

    parsed.push({
      id: `${definition.prefix}-q${String(questionNumber).padStart(3, '0')}`,
      originalNumber: record.originalNumber,
      category: record.category,
      organ: record.category,
      question: record.question,
      choices: record.choices.map((choice) => choice.text),
      answerIndex,
      explanation: record.rationale || `Answer: ${record.choices[answerIndex].text}.`,
      source: record.source,
      section: `${record.category} · ${record.source}`,
      topicTags: ['MED-2', definition.label, record.category]
    })
  })

  return { questions: parsed, heldForReview, rawCount: matches.length }
}

function createParts(group, questions, sourceId) {
  const parts = []
  const partCount = Math.ceil(questions.length / 25)
  const baseSize = Math.floor(questions.length / partCount)
  const remainder = questions.length % partCount
  let offset = 0

  for (let partIndex = 0; partIndex < partCount; partIndex += 1) {
    const partSize = baseSize + (partIndex < remainder ? 1 : 0)
    const partQuestions = questions.slice(offset, offset + partSize)
    const firstNumber = partQuestions[0].originalNumber
    const lastNumber = partQuestions.at(-1).originalNumber
    parts.push({
      id: `${sourceId}-${group.id}-p${String(parts.length + 1).padStart(2, '0')}`,
      label: `Part ${parts.length + 1} · Q${firstNumber}–${lastNumber}`,
      description: `${group.label} questions`,
      range: `Q${firstNumber}–${lastNumber}`,
      questionStart: Number(firstNumber),
      questionEnd: Number(lastNumber),
      parentSourceId: sourceId,
      groupId: group.id,
      groupLabel: group.label,
      partIndex: parts.length,
      shuffleQuestions: false,
      shuffleOptions: false,
      mcqs: partQuestions
    })
    offset += partSize
  }

  parts.forEach((part) => {
    part.partCount = parts.length
  })
  return parts
}

function buildSource(definition, parsed, sourceHash) {
  const groups = definition.groups.map((group) => {
    const questions = parsed.questions.filter((question) => (
      Number(question.originalNumber) >= group.start && Number(question.originalNumber) <= group.end
    ))
    return {
      id: group.id,
      label: group.label,
      questionCount: questions.length,
      parts: createParts(group, questions, definition.id)
    }
  })
  const partCount = groups.reduce((total, group) => total + group.parts.length, 0)

  return {
    id: definition.id,
    label: definition.label,
    description: `${parsed.questions.length} answer-safe questions · ${groups.length} topics · ${partCount} short parts`,
    sourceFile: definition.fileName,
    sourceHash,
    shuffleQuestions: false,
    shuffleOptions: false,
    mcqs: parsed.questions,
    heldForReview: parsed.heldForReview,
    collection: {
      prompt: definition.prompt,
      groupNoun: definition.groupNoun,
      groupEyebrow: definition.groupEyebrow,
      mixedMeta: definition.mixedMeta,
      mixedSizes: [
        { id: 'quick-20', label: 'Quick 20', size: 20, description: 'A short mixed revision session.' },
        { id: 'standard-30', label: 'Standard 30', size: 30, description: 'Balanced mixed practice.' },
        { id: 'exam-50', label: 'Exam 50', size: 50, description: 'A longer mixed exam session.' }
      ],
      wrongReviewId: definition.wrongReviewId,
      groups
    }
  }
}

const generatedSources = []
const report = {}

for (const definition of sourceDefinitions) {
  const sourcePath = path.join(sourceRoot, definition.fileName)
  const markdown = await readFile(sourcePath, 'utf8')
  const parsed = parseSource(markdown, definition)
  const allNumbers = [
    ...parsed.questions.map((question) => Number(question.originalNumber)),
    ...parsed.heldForReview.map((question) => Number(question.originalNumber))
  ].sort((a, b) => a - b)
  const expectedNumbers = Array.from({ length: definition.expectedCount }, (_, index) => index + 1)

  if (parsed.rawCount !== definition.expectedCount) {
    throw new Error(`${definition.label} source count mismatch: expected ${definition.expectedCount}, got ${parsed.rawCount}`)
  }
  if (JSON.stringify(allNumbers) !== JSON.stringify(expectedNumbers)) {
    throw new Error(`${definition.label} numbering is incomplete, duplicated, or out of order`)
  }
  if (new Set(parsed.questions.map((question) => question.id)).size !== parsed.questions.length) {
    throw new Error(`${definition.label} generated question IDs are not unique`)
  }
  if (parsed.questions.some((question) => question.choices.length < 2 || !question.choices[question.answerIndex])) {
    throw new Error(`${definition.label} contains an invalid included answer`)
  }

  const sourceHash = createHash('sha256').update(markdown).digest('hex')
  generatedSources.push(buildSource(definition, parsed, sourceHash))
  report[definition.label] = {
    sourcePath,
    sourceHash,
    sourceRecords: parsed.rawCount,
    included: parsed.questions.length,
    heldForReview: parsed.heldForReview.map((question) => `Q${question.originalNumber}: ${question.reason}`),
    groups: Object.fromEntries(definition.groups.map((group) => [
      group.label,
      parsed.questions.filter((question) => (
        Number(question.originalNumber) >= group.start && Number(question.originalNumber) <= group.end
      )).length
    ]))
  }
}

const generatedSource = `// Generated by scripts/build-med2-cardio-chest-mcqs.mjs.
// Cardio SHA-256: ${generatedSources[0].sourceHash}
// Chest SHA-256: ${generatedSources[1].sourceHash}
// Included: ${generatedSources.reduce((total, source) => total + source.mcqs.length, 0)} answer-safe MED-2 questions; ${generatedSources.reduce((total, source) => total + source.heldForReview.length, 0)} records held for review.
(() => {
  const quizzes = window.mcqQuizzes || (window.mcqQuizzes = {})
  const quiz = quizzes["MED 401-2 MCQs"] || (quizzes["MED 401-2 MCQs"] = { alwaysShowSourcePicker: true, sources: [] })
  quiz.alwaysShowSourcePicker = true

  const sources = ${JSON.stringify(generatedSources, null, 2)}
  const sourceIds = new Set(sources.map((source) => source.id))
  quiz.sources = (quiz.sources || []).filter((source) => !sourceIds.has(source.id))
  quiz.sources.push(...sources)
})()
`

await Promise.all(targetPaths.map((targetPath) => writeFile(targetPath, generatedSource, 'utf8')))
console.log(JSON.stringify({ report, outputs: targetPaths }, null, 2))
