import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultSourcePath = 'C:\\Users\\ahmed\\Downloads\\Telegram Desktop\\gastroenterology_mcqs_verified.json'
const sourcePath = path.resolve(process.argv[2] || defaultSourcePath)
const targetPaths = [
  path.join(repoRoot, 'src', 'med1-alshamel-mcqs.js'),
  path.join(repoRoot, 'public', 'src', 'med1-alshamel-mcqs.js')
]

const groupDefinitions = new Map([
  ['Document (34).docx', { id: 'liver-investigations', label: 'Liver Investigations & LFTs' }],
  ['Liver and PortalHTN disease.docx', { id: 'portal-hypertension', label: 'Cirrhosis & Portal Hypertension' }],
  ['Esophagus الكامل.docx', { id: 'esophagus', label: 'Esophageal Diseases' }],
  ['Acute viral hepatitis.docx', { id: 'viral-hepatitis', label: 'Acute Viral Hepatitis' }],
  ['AIH الشامل.docx', { id: 'autoimmune-hepatitis', label: 'Autoimmune Hepatitis' }],
  ['Small intestines disease الشامل.docx', { id: 'small-intestine', label: 'Small Intestinal Diseases' }]
])

function cleanText(value = '') {
  return String(value)
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:?!])/g, '$1')
    .trim()
}

function preserveText(value = '') {
  return String(value).trim()
}

function getAnswerIndex(answer, choices) {
  const match = cleanText(answer).match(/^([A-E])$/i)
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
      id: `med1-alshamel-${group.id}-p${String(parts.length + 1).padStart(2, '0')}`,
      label: `Part ${parts.length + 1} · Q${firstNumber}–${lastNumber}`,
      description: `${group.label} questions`,
      range: `Q${firstNumber}–${lastNumber}`,
      questionStart: Number(firstNumber),
      questionEnd: Number(lastNumber),
      parentSourceId: 'med1-alshamel-gastroenterology',
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
const sourceData = JSON.parse(sourceContent)
if (!Array.isArray(sourceData.questions)) throw new Error('Expected a questions array')
if (sourceData.questions.length !== 404) {
  throw new Error(`Expected 404 source records, found ${sourceData.questions.length}`)
}

const questions = []
const heldForReview = []

sourceData.questions.forEach((record, index) => {
  const originalNumber = index + 1
  const group = groupDefinitions.get(record.sourceDocument)
  if (!group) throw new Error(`Unknown source document at Q${originalNumber}: ${record.sourceDocument}`)

  const choices = Array.isArray(record.choices) ? record.choices.map(preserveText) : []
  const answerIndex = getAnswerIndex(record.correctAnswer, choices)
  let reason = ''

  if (!preserveText(record.question)) {
    reason = 'Missing question text'
  } else if (choices.length < 2) {
    reason = 'No answer choices supplied'
  } else if (answerIndex < 0) {
    reason = `Answer references a missing or unresolved option: ${cleanText(record.correctAnswer)}`
  }

  if (reason) {
    heldForReview.push({
      originalNumber: String(originalNumber),
      category: group.label,
      question: preserveText(record.question),
      choices,
      answer: cleanText(record.correctAnswer),
      section: cleanText(record.section),
      sourceDocument: 'University Source',
      reason
    })
    return
  }

  questions.push({
    id: `med1-alshamel-q${String(originalNumber).padStart(3, '0')}`,
    originalNumber: String(originalNumber),
    category: group.label,
    organ: group.label,
    question: preserveText(record.question),
    choices,
    answerIndex,
    explanation: cleanText(record.explanation) && cleanText(record.explanation) !== 'null'
      ? cleanText(record.explanation)
      : `Answer: ${choices[answerIndex]}.`,
    source: 'University Source',
    section: cleanText(record.section) || group.label,
    topicTags: ['MED-1', 'الشامل', group.label, cleanText(record.section)].filter(Boolean)
  })
})

if (questions.length !== 390) throw new Error(`Expected 390 answer-safe questions, found ${questions.length}`)
if (heldForReview.length !== 14) throw new Error(`Expected 14 held records, found ${heldForReview.length}`)
if (new Set(questions.map((question) => question.id)).size !== questions.length) {
  throw new Error('Generated question IDs are not unique')
}
if (questions.some((question) => question.choices.length < 2 || !question.choices[question.answerIndex])) {
  throw new Error('Generated الشامل bank contains an invalid included answer')
}

const groups = [...groupDefinitions.values()].map((group) => {
  const groupQuestions = questions.filter((question) => question.category === group.label)
  return {
    id: group.id,
    label: group.label,
    questionCount: groupQuestions.length,
    parts: createParts(group, groupQuestions)
  }
})
const partCount = groups.reduce((total, group) => total + group.parts.length, 0)
const sourceHash = createHash('sha256').update(sourceContent).digest('hex')

const source = {
  id: 'med1-alshamel-gastroenterology',
  label: 'الشامل',
  description: `${questions.length} answer-safe questions · ${groups.length} topic packs · ${partCount} short parts`,
  sourceFile: 'University Source',
  sourceHash,
  shuffleQuestions: false,
  shuffleOptions: false,
  mcqs: questions,
  heldForReview,
  collection: {
    prompt: 'Choose a الشامل topic pack or a mixed revision mode.',
    groupNoun: 'topic pack',
    groupEyebrow: 'MED-1 · الشامل',
    mixedMeta: 'Random questions from the الشامل gastroenterology question bank.',
    mixedSizes: [
      { id: 'quick-20', label: 'Quick 20', size: 20, description: 'A short mixed revision session.' },
      { id: 'standard-30', label: 'Standard 30', size: 30, description: 'Balanced mixed practice.' },
      { id: 'exam-50', label: 'Exam 50', size: 50, description: 'A longer mixed exam session.' }
    ],
    wrongReviewId: 'med1-alshamel-wrong-review',
    groups
  }
}

const generatedSource = `// Generated by scripts/build-med1-alshamel-mcqs.mjs.
// University Source input SHA-256: ${sourceHash}
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
  sourceRecords: sourceData.questions.length,
  included: questions.length,
  heldForReview: heldForReview.length,
  groups: Object.fromEntries(groups.map((group) => [group.label, group.questionCount])),
  outputs: targetPaths
}, null, 2))
