import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultSource = 'G:\\school\\study mode\\subjects\\402\\freshyl\\zatoona psychiatry mcqs.json'
const sourcePath = path.resolve(process.argv[2] || defaultSource)
const targetPaths = [
  path.join(repoRoot, 'src', 'med402-zatoona-psychiatry-mcqs.js'),
  path.join(repoRoot, 'public', 'src', 'med402-zatoona-psychiatry-mcqs.js')
]

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:?!])/g, '$1')
    .trim()
}

function parseSource(sourceContent) {
  const data = JSON.parse(sourceContent)
  if (!data.rounds || !Array.isArray(data.rounds)) {
    throw new Error('Invalid JSON structure: missing rounds array')
  }

  const questions = []
  const heldForReview = []
  const roundPartsMap = []
  let globalQIndex = 1

  data.rounds.forEach((round, roundIndex) => {
    const roundName = round.round_name || `Round ${roundIndex + 1}`
    const roundQuestions = []

    for (const q of round.questions || []) {
      const qNum = String(q.q || '')
      const questionText = cleanText(q.question)
      const opts = q.options || {}
      const optKeys = Object.keys(opts).sort()
      const rawAns = String(q.answer || '').trim()

      if (optKeys.length === 0) {
        heldForReview.push({
          round: roundName,
          originalNumber: qNum,
          question: questionText,
          answer: rawAns,
          reason: 'No options provided in source record'
        })
        continue
      }

      if (rawAns.includes('(?') || rawAns.toLowerCase().includes('uncertain')) {
        heldForReview.push({
          round: roundName,
          originalNumber: qNum,
          question: questionText,
          choices: optKeys.map((k) => cleanText(opts[k])),
          answer: rawAns,
          reason: `Uncertain answer marked in source: ${JSON.stringify(rawAns)}`
        })
        continue
      }

      let answerIndex = -1
      if (/^[a-e]$/i.test(rawAns)) {
        const key = rawAns.toLowerCase()
        answerIndex = optKeys.indexOf(key)
      } else {
        const matches = []
        optKeys.forEach((k, idx) => {
          if (cleanText(opts[k]) === cleanText(rawAns)) matches.push(idx)
        })
        if (matches.length === 1) {
          answerIndex = matches[0]
        } else {
          heldForReview.push({
            round: roundName,
            originalNumber: qNum,
            question: questionText,
            choices: optKeys.map((k) => cleanText(opts[k])),
            answer: rawAns,
            reason: matches.length === 0 ? 'Answer text does not match any choice' : 'Multiple choices match answer text'
          })
          continue
        }
      }

      if (answerIndex < 0 || answerIndex >= optKeys.length) {
        heldForReview.push({
          round: roundName,
          originalNumber: qNum,
          question: questionText,
          choices: optKeys.map((k) => cleanText(opts[k])),
          answer: rawAns,
          reason: 'Answer key could not be mapped to choice index'
        })
        continue
      }

      const choices = optKeys.map((k) => cleanText(opts[k]))
      const parsedQuestion = {
        id: `med402-zatoona-psych-q${String(globalQIndex++).padStart(3, '0')}`,
        originalNumber: qNum,
        category: 'Psychiatry',
        organ: 'Psychiatry',
        question: questionText,
        choices,
        answerIndex,
        explanation: `Answer: ${choices[answerIndex]}.`,
        source: `${roundName} - Q${qNum}`,
        section: `Psychiatry - ${roundName}`,
        topicTags: ['MED402-2', 'Psychiatry']
      }

      questions.push(parsedQuestion)
      roundQuestions.push(parsedQuestion)
    }

    roundPartsMap.push({
      roundName,
      roundIndex,
      questions: roundQuestions
    })
  })

  return { questions, heldForReview, roundPartsMap }
}

function buildParts(roundPartsMap, sourceId) {
  const totalRounds = roundPartsMap.length
  return roundPartsMap.map(({ roundName, roundIndex, questions }) => {
    const partNum = roundIndex + 1
    const firstQ = questions[0]?.originalNumber || '1'
    const lastQ = questions.at(-1)?.originalNumber || String(questions.length)

    return {
      id: `med402-zatoona-psychiatry-p${String(partNum).padStart(2, '0')}`,
      label: `Part ${partNum} - ${roundName}`,
      description: `${roundName} (${questions.length} Qs)`,
      range: `Q${firstQ}-Q${lastQ}`,
      questionStart: Number(firstQ),
      questionEnd: Number(lastQ),
      parentSourceId: sourceId,
      groupId: 'psychiatry',
      groupLabel: 'Psychiatry',
      partIndex: roundIndex,
      partCount: totalRounds,
      shuffleQuestions: false,
      shuffleOptions: false,
      mcqs: questions
    }
  })
}

function buildGeneratedSource(questions, heldForReview, parts, sourceHash) {
  const sourceId = 'med402-zatoona-psychiatry-mcqs'

  return `// Generated by scripts/build-med402-zatoona-psychiatry-mcqs.mjs.
// Source SHA-256: ${sourceHash}
// Included: ${questions.length} answer-keyed zatoona psychiatry questions.
(() => {
  const quizzes = window.mcqQuizzes402 || (window.mcqQuizzes402 = {})
  const quiz = quizzes["MED 402-2 MCQs"] || (quizzes["MED 402-2 MCQs"] = { alwaysShowSourcePicker: true, sources: [] })
  quiz.alwaysShowSourcePicker = true

  const source = ${JSON.stringify({
    id: sourceId,
    label: 'zatoona psychiatry mcqs',
    description: `${questions.length} questions - 1 section - ${parts.length} short parts`,
    shuffleQuestions: false,
    shuffleOptions: false,
    mcqs: questions,
    heldForReview,
    collection: {
      prompt: 'Choose a psychiatry round exam or a revision mode.',
      groupNoun: 'section',
      groupEyebrow: 'MED402-2 psychiatry',
      mixedMeta: 'Random questions from zatoona psychiatry mcqs.',
      mixedSizes: [
        { id: 'quick-20', label: 'Quick 20', size: 20, description: 'A short mixed psychiatry session.' },
        { id: 'standard-30', label: 'Standard 30', size: 30, description: 'Balanced psychiatry practice.' },
        { id: 'full-148', label: 'Full 148', size: questions.length, description: 'Solve all zatoona psychiatry questions.' }
      ],
      wrongReviewId: 'med402-zatoona-psychiatry-wrong-review',
      groups: [
        {
          id: 'psychiatry',
          label: 'Psychiatry',
          questionCount: questions.length,
          parts
        }
      ]
    }
  }, null, 2)}

  quiz.sources = (quiz.sources || []).filter((item) => item.id !== source.id)
  quiz.sources.push(source)
})()
`
}

const sourceContent = await readFile(sourcePath, 'utf8')
const sourceHash = createHash('sha256').update(sourceContent).digest('hex')
const { questions, heldForReview, roundPartsMap } = parseSource(sourceContent)
const sourceId = 'med402-zatoona-psychiatry-mcqs'
const parts = buildParts(roundPartsMap, sourceId)

const totalRecords = questions.length + heldForReview.length
if (totalRecords !== 158) {
  throw new Error(`Expected 158 total records, got ${totalRecords} (${questions.length} included, ${heldForReview.length} held)`)
}
if (questions.length !== 148 || heldForReview.length !== 10) {
  throw new Error(`Expected 148 included and 10 held, got ${questions.length} included and ${heldForReview.length} held`)
}
if (new Set(questions.map((q) => q.id)).size !== questions.length) {
  throw new Error('Generated question IDs are not unique')
}
if (questions.some((q) => q.choices.length < 1 || !q.choices[q.answerIndex])) {
  throw new Error('Generated questions contain an invalid answer')
}

const generatedSource = buildGeneratedSource(questions, heldForReview, parts, sourceHash)
await Promise.all(targetPaths.map((targetPath) => writeFile(targetPath, generatedSource, 'utf8')))

console.log(JSON.stringify({
  sourcePath,
  sourceHash,
  included: questions.length,
  heldForReview: heldForReview.length,
  outputs: targetPaths
}, null, 2))
