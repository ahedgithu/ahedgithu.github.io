import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultSourcePath = 'G:\\school\\study mode\\subjects\\med1\\kellawi mcqs\\Gastroenterology_MCQ_Bank_JS.json'
const sourcePath = path.resolve(process.argv[2] || defaultSourcePath)
const targetPaths = [
  path.join(repoRoot, 'src', 'med1-kellawi-mcqs.js'),
  path.join(repoRoot, 'public', 'src', 'med1-kellawi-mcqs.js')
]

const topicDefinitions = new Map([
  ['Diseases Of The Pancreas', { id: 'pancreas', label: 'Diseases of the Pancreas' }],
  ['Diseases Of The Esophagus', { id: 'esophagus', label: 'Diseases of the Esophagus' }],
  ['Acute Viral Hepatitis And Investigation Of Liver Diseases', { id: 'acute-hepatitis', label: 'Acute Viral Hepatitis & Liver Investigations' }],
  ['Nafld And Nash', { id: 'nafld-nash', label: 'NAFLD & NASH' }],
  ['Autoimmune Liver Disease', { id: 'autoimmune-liver', label: 'Autoimmune Liver Disease' }],
  ['Diseases Of The Small Intestine', { id: 'small-intestine', label: 'Diseases of the Small Intestine' }],
  ['Liver Cirrhosis And Portal Hypertension', { id: 'cirrhosis-portal-hypertension', label: 'Liver Cirrhosis & Portal Hypertension' }]
])

function cleanText(value = '') {
  return String(value)
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:?!])/g, '$1')
    .trim()
}

function getAnswerIndex(answer, choices) {
  if (Number.isInteger(answer)) {
    return answer >= 0 && answer < choices.length ? answer : -1
  }

  const match = cleanText(answer).match(/^([A-H])(?:[.)]|$)/i)
  if (!match) return -1
  const answerIndex = match[1].toUpperCase().charCodeAt(0) - 65
  return answerIndex < choices.length ? answerIndex : -1
}

function createParts(group, questions) {
  const partCount = Math.max(1, Math.ceil(questions.length / 25))
  const baseSize = Math.floor(questions.length / partCount)
  const remainder = questions.length % partCount
  const parts = []
  let offset = 0

  for (let partIndex = 0; partIndex < partCount; partIndex += 1) {
    const partSize = baseSize + (partIndex < remainder ? 1 : 0)
    const partQuestions = questions.slice(offset, offset + partSize)
    if (partQuestions.length === 0) continue
    const firstNumber = partQuestions[0].originalNumber
    const lastNumber = partQuestions.at(-1).originalNumber

    parts.push({
      id: `med1-kellawi-${group.id}-p${String(parts.length + 1).padStart(2, '0')}`,
      label: `Part ${parts.length + 1} · Q${firstNumber}–${lastNumber}`,
      description: `${group.label} questions`,
      range: `Q${firstNumber}–${lastNumber}`,
      questionStart: Number(firstNumber),
      questionEnd: Number(lastNumber),
      parentSourceId: 'med1-kellawi-gastroenterology',
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

const sourceContent = await readFile(sourcePath, 'utf8')
const sourceRows = JSON.parse(sourceContent)
if (!Array.isArray(sourceRows)) throw new Error('Expected the Kellawi source root to be an array')

const questions = []
const heldForReview = []
let originalNumber = 0

for (const row of sourceRows) {
  const topic = topicDefinitions.get(row.topic)
  if (!topic) throw new Error(`Unknown Kellawi topic: ${row.topic}`)
  if (!Array.isArray(row.questions)) throw new Error(`Missing questions array for ${row.topic}`)

  for (const item of row.questions) {
    originalNumber += 1
    const choices = Array.isArray(item.choices) ? item.choices.map(cleanText) : []
    const answerIndex = getAnswerIndex(item.correctAnswer, choices)
    let reason = ''

    if (!cleanText(item.question)) {
      reason = 'Missing question text'
    } else if (choices.length < 2) {
      reason = 'No answer choices supplied'
    } else if (answerIndex < 0) {
      reason = `Answer references a missing or unresolved option: ${cleanText(item.correctAnswer)}`
    }

    if (reason) {
      heldForReview.push({
        category: topic.label,
        originalNumber: String(originalNumber),
        question: cleanText(item.question),
        choices,
        answer: cleanText(item.correctAnswer),
        rationale: cleanText(item.explanation),
        source: cleanText(row.source),
        reason
      })
      continue
    }

    questions.push({
      id: `med1-kellawi-q${String(originalNumber).padStart(3, '0')}`,
      originalNumber: String(originalNumber),
      category: topic.label,
      organ: topic.label,
      question: cleanText(item.question),
      choices,
      answerIndex,
      explanation: cleanText(item.explanation) || `Answer: ${choices[answerIndex]}.`,
      source: cleanText(row.source),
      section: `${topic.label} · ${cleanText(row.source)}`,
      topicTags: ['MED-1', 'Kellawi Gastroenterology MCQs', topic.label]
    })
  }
}

if (originalNumber !== 210) throw new Error(`Expected 210 source records, found ${originalNumber}`)
if (questions.length !== 155) throw new Error(`Expected 155 answer-safe questions, found ${questions.length}`)
if (heldForReview.length !== 55) throw new Error(`Expected 55 held records, found ${heldForReview.length}`)
if (new Set(questions.map((question) => question.id)).size !== questions.length) {
  throw new Error('Generated Kellawi question IDs are not unique')
}
if (questions.some((question) => question.choices.length < 2 || !question.choices[question.answerIndex])) {
  throw new Error('Generated Kellawi bank contains an invalid included answer')
}

const groups = [...topicDefinitions.values()].map((topic) => {
  const topicQuestions = questions.filter((question) => question.category === topic.label)
  return {
    id: topic.id,
    label: topic.label,
    questionCount: topicQuestions.length,
    parts: createParts(topic, topicQuestions)
  }
})
const partCount = groups.reduce((total, group) => total + group.parts.length, 0)
const sourceHash = createHash('sha256').update(sourceContent).digest('hex')

const source = {
  id: 'med1-kellawi-gastroenterology',
  label: 'Kellawi Gastroenterology MCQs',
  description: `${questions.length} answer-safe questions · ${groups.length} topics · ${partCount} short parts`,
  sourceFile: path.basename(sourcePath),
  sourceHash,
  shuffleQuestions: false,
  shuffleOptions: false,
  mcqs: questions,
  heldForReview,
  collection: {
    prompt: 'Choose a Kellawi gastroenterology topic or a revision mode.',
    groupNoun: 'topic',
    groupEyebrow: 'MED-1 Kellawi gastroenterology',
    mixedMeta: 'Random questions from the Kellawi gastroenterology question bank.',
    mixedSizes: [
      { id: 'quick-20', label: 'Quick 20', size: 20, description: 'A short mixed revision session.' },
      { id: 'standard-30', label: 'Standard 30', size: 30, description: 'Balanced mixed practice.' },
      { id: 'exam-50', label: 'Exam 50', size: 50, description: 'A longer mixed exam session.' }
    ],
    wrongReviewId: 'med1-kellawi-wrong-review',
    groups
  }
}

const generatedSource = `// Generated by scripts/build-med1-kellawi-mcqs.mjs.
// Gastroenterology_MCQ_Bank_JS.json SHA-256: ${sourceHash}
// Included: ${questions.length} answer-safe MED-1 questions; ${heldForReview.length} records held for review.
(() => {
  const quizzes = window.mcqQuizzes || (window.mcqQuizzes = {})
  const quiz = quizzes["MED 401-1 MCQs"] || (quizzes["MED 401-1 MCQs"] = { alwaysShowSourcePicker: true, sources: [] })
  quiz.alwaysShowSourcePicker = true

  const source = ${JSON.stringify(source, null, 2)}
  quiz.sources = (quiz.sources || []).filter((item) => item.id !== source.id)
  quiz.sources.push(source)
})()
`

await Promise.all(targetPaths.map((targetPath) => writeFile(targetPath, generatedSource, 'utf8')))
console.log(JSON.stringify({
  sourcePath,
  sourceHash,
  sourceRecords: originalNumber,
  included: questions.length,
  heldForReview: heldForReview.length,
  groups: Object.fromEntries(groups.map((group) => [group.label, group.questionCount])),
  outputs: targetPaths
}, null, 2))
