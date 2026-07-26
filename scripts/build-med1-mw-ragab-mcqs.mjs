import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultSourcePath = 'G:\\school\\study mode\\subjects\\med1\\mw ragab mcqs\\mw ragab comperhensive.json'
const sourcePath = path.resolve(process.argv[2] || defaultSourcePath)
const targetPaths = [
  path.join(repoRoot, 'src', 'med1-mw-ragab-mcqs.js'),
  path.join(repoRoot, 'public', 'src', 'med1-mw-ragab-mcqs.js')
]

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
      id: `med1-mw-ragab-${group.id}-p${String(parts.length + 1).padStart(2, '0')}`,
      label: `Part ${parts.length + 1} · Q${firstNumber}–${lastNumber}`,
      description: `${group.label} questions`,
      range: `Q${firstNumber}–${lastNumber}`,
      questionStart: Number(firstNumber),
      questionEnd: Number(lastNumber),
      parentSourceId: 'med1-mw-ragab-comperhensive',
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
const parsedJson = JSON.parse(sourceContent)
const sourceQuestions = Array.isArray(parsedJson.questions) ? parsedJson.questions : []

const questions = []
const heldForReview = []
let originalNumber = 0

for (const item of sourceQuestions) {
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
      category: 'Gastroenterology & Hepatology',
      originalNumber: String(originalNumber),
      question: cleanText(item.question),
      choices,
      answer: cleanText(item.correctAnswer),
      rationale: cleanText(item.explanation),
      source: 'Mw ragab comperhensive',
      reason
    })
    continue
  }

  questions.push({
    id: `med1-mw-ragab-q${String(originalNumber).padStart(3, '0')}`,
    originalNumber: String(originalNumber),
    category: 'Gastroenterology & Hepatology',
    organ: 'Gastroenterology & Hepatology',
    question: cleanText(item.question),
    choices,
    answerIndex,
    explanation: cleanText(item.explanation) || `Answer: ${choices[answerIndex]}.`,
    source: 'Mw ragab comperhensive',
    section: 'Gastroenterology & Hepatology · Mw ragab comperhensive',
    topicTags: ['MED-1', 'Mw ragab comperhensive', 'Gastroenterology & Hepatology']
  })
}

if (originalNumber !== 74) throw new Error(`Expected 74 source records, found ${originalNumber}`)
if (questions.length !== 74) throw new Error(`Expected 74 answer-safe questions, found ${questions.length}`)
if (heldForReview.length !== 0) throw new Error(`Expected 0 held records, found ${heldForReview.length}`)
if (new Set(questions.map((question) => question.id)).size !== questions.length) {
  throw new Error('Generated question IDs are not unique')
}
if (questions.some((question) => question.choices.length < 2 || !question.choices[question.answerIndex])) {
  throw new Error('Generated bank contains an invalid included answer')
}

const groupDef = { id: 'gastroenterology-hepatology', label: 'Gastroenterology & Hepatology' }
const group = {
  id: groupDef.id,
  label: groupDef.label,
  questionCount: questions.length,
  parts: createParts(groupDef, questions)
}
const groups = [group]
const partCount = group.parts.length
const sourceHash = createHash('sha256').update(sourceContent).digest('hex')

const source = {
  id: 'med1-mw-ragab-comperhensive',
  label: 'Mw ragab comperhensive',
  description: `${questions.length} answer-safe questions · 1 topic · ${partCount} short parts`,
  sourceFile: path.basename(sourcePath),
  sourceHash,
  shuffleQuestions: false,
  shuffleOptions: false,
  mcqs: questions,
  heldForReview,
  collection: {
    prompt: 'Choose a gastroenterology & hepatology topic or a revision mode.',
    groupNoun: 'topic',
    groupEyebrow: 'MED-1 Mw ragab comperhensive',
    mixedMeta: 'Random questions from the Mw ragab comperhensive question bank.',
    mixedSizes: [
      { id: 'quick-20', label: 'Quick 20', size: 20, description: 'A short mixed revision session.' },
      { id: 'standard-30', label: 'Standard 30', size: 30, description: 'Balanced mixed practice.' },
      { id: 'exam-50', label: 'Exam 50', size: 50, description: 'A longer mixed exam session.' }
    ],
    wrongReviewId: 'med1-mw-ragab-wrong-review',
    groups
  }
}

const generatedSource = `// Generated by scripts/build-med1-mw-ragab-mcqs.mjs.
// mw ragab comperhensive.json SHA-256: ${sourceHash}
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
  groups: Object.fromEntries(groups.map((g) => [g.label, g.questionCount])),
  outputs: targetPaths
}, null, 2))
