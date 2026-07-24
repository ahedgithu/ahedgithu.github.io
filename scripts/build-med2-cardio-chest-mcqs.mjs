import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultSourceRoot = 'G:\\school\\study mode\\subjects\\MED-2'
const sourceRoot = path.resolve(process.argv[2] || defaultSourceRoot)

const sourceDefinitions = [
  {
    id: 'med2-cardio-question-bank',
    label: 'Cardiology Question Bank',
    fileRelPath: path.join('mcqs', 'Cardio_Question_Bank_Training_New.md'),
    prefix: 'med2-cardio',
    expectedCount: 235,
    groupEyebrow: 'MED-2 cardiology',
    groupNoun: 'topic',
    prompt: 'Choose a cardiology topic or a revision mode.',
    mixedMeta: 'Random questions from pulmonary embolism, rheumatic fever, hypertension, and valvular disease.',
    wrongReviewId: 'med2-cardio-wrong-review',
    format: 'standard',
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
    fileRelPath: path.join('mcqs', 'Chest_Question_Bank_Training_New.md'),
    prefix: 'med2-chest',
    expectedCount: 300,
    groupEyebrow: 'MED-2 chest medicine',
    groupNoun: 'topic',
    prompt: 'Choose a chest medicine topic or a revision mode.',
    mixedMeta: 'Random questions from symptomatology, pulmonary function tests, airway disease, and bronchial asthma.',
    wrongReviewId: 'med2-chest-wrong-review',
    format: 'standard',
    groups: [
      { id: 'symptomatology', label: 'Cough, Sputum, Hemoptysis & Dyspnea', start: 1, end: 70 },
      { id: 'pulmonary-function-tests', label: 'Pulmonary Function Tests', start: 71, end: 150 },
      { id: 'upper-lower-airway', label: 'Upper & Lower Airway Diseases', start: 151, end: 170 },
      { id: 'small-airway', label: 'Small Airway Diseases', start: 171, end: 190 },
      { id: 'subglottic-vocal-cord', label: 'Subglottic Stenosis & Vocal Cord Dysfunction', start: 191, end: 200 },
      { id: 'bronchial-asthma', label: 'Bronchial Asthma, Steps & Biologics', start: 201, end: 300 }
    ]
  },
  {
    id: 'med2-past-exams-golden-quizzes',
    label: 'PAST exams and golden quizes',
    fileRelPath: path.join('past exams', 'Cardio_Chest_Question_Bank.md'),
    prefix: 'med2-past-exams',
    expectedCount: 81,
    groupEyebrow: 'MED-2 past exams & golden quizzes',
    groupNoun: 'topic',
    prompt: 'Choose a past exam topic or a revision mode.',
    mixedMeta: 'Random questions from past exams and golden quizzes.',
    wrongReviewId: 'med2-past-exams-wrong-review',
    format: 'past-exams',
    groups: [
      { id: 'systemic-hypertension', label: 'Systemic Hypertension', start: 1, end: 8 },
      { id: 'rheumatic-fever', label: 'Rheumatic Fever', start: 9, end: 20 },
      { id: 'pulmonary-embolism', label: 'Pulmonary Embolism', start: 21, end: 30 },
      { id: 'mitral-valve-diseases', label: 'Mitral Valve Diseases', start: 31, end: 36 },
      { id: 'aortic-valve-diseases', label: 'Aortic Valve Diseases', start: 37, end: 42 },
      { id: 'symptomatology-cough', label: 'Symptomatology of Cough', start: 43, end: 49 },
      { id: 'pulmonary-function-tests', label: 'Pulmonary Function Tests', start: 50, end: 58 },
      { id: 'upper-lower-airway', label: 'Upper & Lower Airway Diseases', start: 59, end: 63 },
      { id: 'bronchial-asthma', label: 'Bronchial Asthma', start: 64, end: 81 }
    ]
  },
  {
    id: 'med2-mo-ragab-past-exams',
    label: 'Mo.ragab repeated past exams',
    fileRelPaths: [
      path.join('mo ragab', 'jason ready', 'PE_RF_HTN.json'),
      path.join('mo ragab', 'jason ready', 'Valvular_Heart_Diseases.json')
    ],
    prefix: 'med2-mo-ragab',
    expectedCount: 157,
    groupEyebrow: 'MED-2 Mo.ragab past exams',
    groupNoun: 'topic',
    prompt: 'Choose a topic from Dr. Mohamed Ragab repeated past exams.',
    mixedMeta: 'Random questions from Dr. Mohamed Ragab past exam questions.',
    wrongReviewId: 'med2-mo-ragab-wrong-review',
    format: 'json',
    groups: [
      { id: 'pulmonary-embolism', label: 'Pulmonary Embolism', start: 1, end: 45 },
      { id: 'systemic-hypertension', label: 'Systemic Hypertension', start: 46, end: 71 },
      { id: 'rheumatic-fever', label: 'Rheumatic Fever', start: 72, end: 98 },
      { id: 'aortic-stenosis', label: 'Aortic Stenosis', start: 99, end: 117 },
      { id: 'aortic-regurgitation', label: 'Aortic Regurgitation', start: 118, end: 131 },
      { id: 'mitral-stenosis', label: 'Mitral Stenosis', start: 132, end: 144 },
      { id: 'mitral-regurgitation', label: 'Mitral Regurgitation', start: 145, end: 157 }
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

function parseQuestionBlockStandard(block, definition, questionNumber) {
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

function parseStandardSource(markdown, definition) {
  const matches = [...markdown.matchAll(/^### Q0*(\d+)[^\n]*$/gm)]
  const parsed = []
  const heldForReview = []

  matches.forEach((match, index) => {
    const questionNumber = Number(match[1])
    const block = markdown.slice(match.index + match[0].length, matches[index + 1]?.index ?? markdown.length)
    const record = parseQuestionBlockStandard(block, definition, questionNumber)
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

function parsePastExamsSource(markdown, definition) {
  const blocks = markdown.split(/(?=^Q\d+\.)/m).slice(1)
  const parsed = []
  const heldForReview = []

  blocks.forEach((blockRaw, index) => {
    const block = blockRaw.trim()
    const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    const qMatch = lines[0].match(/^Q(\d+)\.\s*(.*)/)
    if (!qMatch) return

    const questionNumber = Number(qMatch[1])
    let questionText = qMatch[2]

    const choices = []
    let answerText = ''
    let whyText = ''
    let sourceText = ''
    let mode = 'q'

    for (let i = 1; i < lines.length; i += 1) {
      const line = lines[i]
      if (/^CARDIO & CHEST QUESTION BANK Page/i.test(line)) continue
      if (/^[A-Z\s&]{4,}$/.test(line) && !line.startsWith('Source:') && !line.startsWith('CORRECT') && !line.startsWith('ANSWER')) continue

      const choiceMatch = line.match(/^([A-E])\.\s*(.*)/)
      const whyMatch = line.match(/^Why this answer\?\s*(.*)/i)
      const sourceMatch = line.match(/^Source:\s*(.*)/i)
      const isAnswerHeader = /^CORRECT$/i.test(line) || /^ANSWER$/i.test(line)

      if (choiceMatch && mode !== 'why' && mode !== 'source' && mode !== 'answer') {
        mode = 'choice'
        choices.push({ letter: choiceMatch[1].toUpperCase(), text: cleanText(choiceMatch[2]) })
      } else if (isAnswerHeader) {
        mode = 'answer'
      } else if (whyMatch) {
        mode = 'why'
        whyText = cleanText(whyMatch[1])
      } else if (sourceMatch) {
        mode = 'source'
        sourceText = cleanText(sourceMatch[1])
      } else if (mode === 'q') {
        questionText = cleanText(`${questionText} ${line}`)
      } else if (mode === 'choice') {
        if (choices.length > 0) {
          choices[choices.length - 1].text = cleanText(`${choices[choices.length - 1].text} ${line}`)
        }
      } else if (mode === 'answer') {
        answerText = cleanText(`${answerText} ${line}`)
      } else if (mode === 'why') {
        whyText = cleanText(`${whyText} ${line}`)
      } else if (mode === 'source') {
        sourceText = cleanText(`${sourceText} ${line}`)
      }
    }

    const group = getGroup(definition, questionNumber)
    if (!group) throw new Error(`${definition.label} Q${questionNumber} is outside configured topic ranges`)

    const ansLetterMatch = answerText.match(/^([A-E])\./i)
    let answerIndex = -1
    if (ansLetterMatch) {
      answerIndex = choices.findIndex((choice) => choice.letter === ansLetterMatch[1].toUpperCase())
    }

    let reason = ''
    if (!questionText || choices.length < 2 || !answerText || !sourceText) {
      reason = `Incomplete past exam record: ${choices.length} choices`
    } else if (answerIndex < 0) {
      reason = `Unresolved answer option: ${answerText}`
    }

    if (reason) {
      heldForReview.push({
        category: group.label,
        originalNumber: String(questionNumber),
        question: questionText,
        choices: choices.map((c) => c.text),
        answer: answerText,
        rationale: whyText,
        source: sourceText,
        reason
      })
      return
    }

    parsed.push({
      id: `${definition.prefix}-q${String(questionNumber).padStart(3, '0')}`,
      originalNumber: String(questionNumber),
      category: group.label,
      organ: group.label,
      question: cleanText(questionText),
      choices: choices.map((c) => cleanText(c.text)),
      answerIndex,
      explanation: whyText || `Answer: ${choices[answerIndex].text}.`,
      source: sourceText,
      section: `${group.label} · ${sourceText}`,
      topicTags: ['MED-2', definition.label, group.label]
    })
  })

  return { questions: parsed, heldForReview, rawCount: blocks.length }
}

function parseJsonSources(jsonItems, definition) {
  const parsed = []
  const heldForReview = []

  jsonItems.forEach((item, index) => {
    const questionNumber = index + 1
    const group = getGroup(definition, questionNumber)
    if (!group) throw new Error(`${definition.label} Q${questionNumber} is outside configured topic ranges`)

    let reason = ''
    if (
      !item.question ||
      !Array.isArray(item.choices) ||
      item.choices.length < 2 ||
      typeof item.answerIndex !== 'number' ||
      item.answerIndex < 0 ||
      item.answerIndex >= item.choices.length
    ) {
      reason = 'Invalid JSON question format'
    }

    if (reason) {
      heldForReview.push({
        category: group.label,
        originalNumber: String(questionNumber),
        question: item.question || '',
        choices: item.choices || [],
        answer: String(item.answerIndex),
        rationale: item.explanation || '',
        source: 'Dr. Mohamed Ragab Past Exams',
        reason
      })
      return
    }

    const sourceLabel = 'Dr. Mohamed Ragab Past Exams'
    parsed.push({
      id: `${definition.prefix}-q${String(questionNumber).padStart(3, '0')}`,
      originalNumber: String(questionNumber),
      category: group.label,
      organ: group.label,
      question: cleanText(item.question),
      choices: item.choices.map((c) => cleanText(c)),
      answerIndex: item.answerIndex,
      explanation: cleanText(item.explanation || `Answer: ${item.choices[item.answerIndex]}.`),
      source: sourceLabel,
      section: `${group.label} · ${sourceLabel}`,
      topicTags: ['MED-2', definition.label, group.label]
    })
  })

  return { questions: parsed, heldForReview, rawCount: jsonItems.length }
}

function createParts(group, questions, sourceId) {
  const parts = []
  const partCount = Math.max(1, Math.ceil(questions.length / 25))
  const baseSize = Math.floor(questions.length / partCount)
  const remainder = questions.length % partCount
  let offset = 0

  for (let partIndex = 0; partIndex < partCount; partIndex += 1) {
    const partSize = baseSize + (partIndex < remainder ? 1 : 0)
    const partQuestions = questions.slice(offset, offset + partSize)
    if (partQuestions.length === 0) continue
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
    sourceFile: definition.fileRelPaths
      ? definition.fileRelPaths.map((p) => path.basename(p)).join(', ')
      : path.basename(definition.fileRelPath),
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
  let parsed
  let sourceHash
  let sourcePath = ''

  if (definition.format === 'json') {
    const rawItems = []
    let combinedContent = ''
    for (const relPath of definition.fileRelPaths) {
      const fullPath = path.join(sourceRoot, relPath)
      const content = await readFile(fullPath, 'utf8')
      combinedContent += content
      rawItems.push(...JSON.parse(content))
    }
    sourcePath = definition.fileRelPaths.map((p) => path.join(sourceRoot, p)).join('; ')
    parsed = parseJsonSources(rawItems, definition)
    sourceHash = createHash('sha256').update(combinedContent).digest('hex')
  } else {
    sourcePath = path.join(sourceRoot, definition.fileRelPath)
    const markdown = await readFile(sourcePath, 'utf8')
    parsed = definition.format === 'past-exams'
      ? parsePastExamsSource(markdown, definition)
      : parseStandardSource(markdown, definition)
    sourceHash = createHash('sha256').update(markdown).digest('hex')
  }

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
// Past Exams SHA-256: ${generatedSources[2].sourceHash}
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
