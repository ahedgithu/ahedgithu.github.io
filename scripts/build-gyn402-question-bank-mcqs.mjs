import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultSource = 'G:\\school\\study mode\\subjects\\402\\gyn\\GYNA402_Question_Bank.json'
const sourcePath = path.resolve(process.argv[2] || defaultSource)
const targetPaths = [
  path.join(repoRoot, 'src', 'gyn402-question-bank-mcqs.js'),
  path.join(repoRoot, 'public', 'src', 'gyn402-question-bank-mcqs.js')
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
  if (!Array.isArray(data)) {
    throw new Error('Invalid JSON structure: expected a question array')
  }

  return data.map((rawQuestion) => {
    const originalNumber = Number(rawQuestion.number)
    const optionKeys = Object.keys(rawQuestion.options || {}).sort()
    const answerKey = cleanText(rawQuestion.answer_letter).toUpperCase()
    const answerIndex = optionKeys.indexOf(answerKey)
    const choices = optionKeys.map((key) => cleanText(rawQuestion.options[key]))
    const question = cleanText(rawQuestion.question)
    const section = cleanText(rawQuestion.section)
    const topic = cleanText(rawQuestion.topic)
    const questionType = cleanText(rawQuestion.type).toLowerCase()

    if (!Number.isInteger(originalNumber) || !question || !section || !topic || choices.length < 2) {
      throw new Error(`Question ${rawQuestion.number || '?'} is incomplete`)
    }
    if (!['mcq', 'matching'].includes(questionType)) {
      throw new Error(`Question ${originalNumber} has unsupported type "${questionType}"`)
    }
    if (answerIndex < 0 || !choices[answerIndex]) {
      throw new Error(`Question ${originalNumber} has an invalid answer key`)
    }

    return {
      id: `gyn402-question-bank-q${String(originalNumber).padStart(3, '0')}`,
      originalNumber: String(originalNumber),
      category: topic,
      organ: 'Gynecology & Obstetrics',
      question,
      choices,
      answerIndex,
      explanation: `Answer: ${cleanText(rawQuestion.answer_text) || choices[answerIndex]}`,
      source: `GYNA402 Question Bank - Q${originalNumber}`,
      section,
      topic,
      questionType,
      topicTags: ['GYNA402', section, topic, questionType]
    }
  })
}

function chunkQuestions(questions, size) {
  const chunks = []
  for (let index = 0; index < questions.length; index += size) {
    chunks.push(questions.slice(index, index + size))
  }
  return chunks
}

function buildCollectionGroups(questions, sourceId) {
  const topicMap = new Map()
  questions.forEach((question) => {
    const topicQuestions = topicMap.get(question.topic) || []
    topicQuestions.push(question)
    topicMap.set(question.topic, topicQuestions)
  })

  return Array.from(topicMap, ([label, topicQuestions]) => {
    const groupId = slugify(label) || 'gyn402'
    const chunks = chunkQuestions(topicQuestions, 20)
    const parts = chunks.map((partQuestions, partIndex) => {
      const firstQuestion = partQuestions[0]
      const lastQuestion = partQuestions.at(-1)
      return {
        id: `gyn402-question-bank-${groupId}-p${String(partIndex + 1).padStart(2, '0')}`,
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
      questionCount: topicQuestions.length,
      parts
    }
  })
}

function buildGeneratedSource(questions, groups, sourceHash) {
  const source = {
    id: 'gyn402-question-bank',
    label: 'GYNA402 Question Bank',
    description: `${questions.length} answered questions - ${groups.length} topics`,
    shuffleQuestions: false,
    shuffleOptions: false,
    mcqs: questions,
    heldForReview: [],
    collection: {
      prompt: 'Choose a GYN 402 topic or a revision mode.',
      groupNoun: 'topic',
      groupEyebrow: 'GYNA402 question bank',
      mixedMeta: 'Random questions from the complete GYNA402 question bank.',
      mixedSizes: [
        { id: 'quick-20', label: 'Quick 20', size: 20, description: 'A short mixed GYN 402 session.' },
        { id: 'standard-30', label: 'Standard 30', size: 30, description: 'Balanced GYN 402 practice.' },
        { id: 'full-343', label: 'Full 343', size: questions.length, description: 'Solve the complete GYNA402 question bank.' }
      ],
      wrongReviewId: 'gyn402-question-bank-wrong-review',
      groups
    }
  }

  return `// Generated by scripts/build-gyn402-question-bank-mcqs.mjs.
// Source SHA-256: ${sourceHash}
// Included: ${questions.length} answer-keyed GYN 402 questions.
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
const questions = parseSource(sourceContent)
const sourceId = 'gyn402-question-bank'
const groups = buildCollectionGroups(questions, sourceId)

if (questions.length !== 343) {
  throw new Error(`Expected 343 questions, got ${questions.length}`)
}
if (new Set(questions.map((question) => question.id)).size !== questions.length) {
  throw new Error('Generated question IDs are not unique')
}
if (questions.some((question) => !Number.isInteger(question.answerIndex) || !question.choices[question.answerIndex])) {
  throw new Error('Generated questions contain an invalid answer')
}

const generatedSource = buildGeneratedSource(questions, groups, sourceHash)
await Promise.all(targetPaths.map((targetPath) => writeFile(targetPath, generatedSource, 'utf8')))

console.log(JSON.stringify({
  sourcePath,
  sourceHash,
  included: questions.length,
  heldForReview: 0,
  topics: groups.length,
  outputs: targetPaths
}, null, 2))
