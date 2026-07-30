import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultSource = 'C:\\Users\\ahmed\\.codex\\attachments\\bce1d983-94f3-442f-a9ec-8001d9d17691\\pasted-text.txt'
const sourcePath = path.resolve(process.argv[2] || defaultSource)
const targetPaths = [
  path.join(repoRoot, 'src', 'gyn402-filtered-master-bank.js'),
  path.join(repoRoot, 'public', 'src', 'gyn402-filtered-master-bank.js')
]

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:?!])/g, '$1')
    .trim()
}

function normalizeForMatch(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function slugify(value) {
  return normalizeForMatch(value).replace(/\s+/g, '-')
}

function formatTopic(value) {
  return cleanText(value)
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      const plainWord = word.replace(/[^a-z]/g, '')
      if (plainWord === 'pcos' || plainWord === 'edd') return word.toUpperCase()
      if (index > 0 && ['and', 'of', 'the'].includes(plainWord)) return word
      return word.replace(/[a-z]/i, (letter) => letter.toUpperCase())
    })
    .join(' ')
}

function parseAnswerKeys(sourceContent) {
  const answers = new Map()
  for (const match of sourceContent.matchAll(/^ANSWER KEY - THIS PAGE\s*\n([^\n]+)/gm)) {
    for (const entry of match[1].split('|')) {
      const answerMatch = entry.trim().match(/^(\d+)\.\s*(.*)$/)
      if (!answerMatch) continue
      answers.set(Number(answerMatch[1]), cleanText(answerMatch[2]))
    }
  }
  return answers
}

function parseChoicesAndQuestion(bodyLines, answerKey) {
  const optionMarkers = []
  bodyLines.forEach((line, index) => {
    const match = line.match(/^([a-h])[.)]\s*(.*)$/i)
    if (match) {
      optionMarkers.push({
        index,
        key: match[1].toUpperCase(),
        inlineText: cleanText(match[2])
      })
    }
  })

  if (!optionMarkers.length) {
    if (['T', 'F'].includes(answerKey)) {
      return {
        question: cleanText(bodyLines.join(' ')),
        choices: ['True', 'False'],
        answerIndex: answerKey === 'T' ? 0 : 1,
        questionType: 'true-false'
      }
    }
    return { error: 'No selectable options were found' }
  }

  const leadLines = bodyLines.slice(0, optionMarkers[0].index)
  const leadText = cleanText(leadLines.join(' '))
  const matchingMode = /\b(choose|select|preceded by a list|most appropriate answer|most likely diagnosis|most useful treatment)\b/i.test(leadText)
  const choices = []
  let trailingStemLines = []

  optionMarkers.forEach((marker, optionIndex) => {
    const nextIndex = optionMarkers[optionIndex + 1]?.index ?? bodyLines.length
    const continuation = bodyLines
      .slice(marker.index + 1, nextIndex)
      .map(cleanText)
      .filter(Boolean)
    let optionText = marker.inlineText

    if (matchingMode && optionIndex === optionMarkers.length - 1) {
      if (!optionText && continuation.length) {
        optionText = continuation.shift()
      }
      trailingStemLines = continuation
    } else {
      optionText = cleanText([optionText, ...continuation].filter(Boolean).join(' '))
    }

    choices.push({ key: marker.key, text: optionText })
  })

  if (choices.some((choice) => !choice.text)) {
    return { error: 'At least one option has no readable text' }
  }

  const question = cleanText([...leadLines, ...trailingStemLines].join(' '))
  if (!question) {
    return { error: 'Question text is empty after option extraction' }
  }

  let answerIndex = choices.findIndex((choice) => choice.key === answerKey)
  if (answerIndex < 0 && !['T', 'F'].includes(answerKey)) {
    const normalizedAnswer = normalizeForMatch(answerKey)
    const exactMatches = choices
      .map((choice, index) => ({ index, value: normalizeForMatch(choice.text) }))
      .filter((choice) => choice.value === normalizedAnswer)
    const containedMatches = choices
      .map((choice, index) => ({ index, value: normalizeForMatch(choice.text) }))
      .filter((choice) => choice.value.includes(normalizedAnswer) || normalizedAnswer.includes(choice.value))
    const matches = exactMatches.length ? exactMatches : containedMatches
    if (matches.length === 1) {
      answerIndex = matches[0].index
    }
  }

  if (answerIndex < 0 || !choices[answerIndex]?.text) {
    return { error: `Answer "${answerKey}" could not be mapped to one option` }
  }

  return {
    question,
    choices: choices.map((choice) => choice.text),
    answerIndex,
    questionType: matchingMode ? 'matching' : 'mcq'
  }
}

function findStructuralIssue(parsed) {
  if (parsed.choices.some((choice) => choice.length > 120)) {
    return 'Option text contains merged material from another source question'
  }
  if (parsed.choices.some((choice) => /(?:^|\s)[a-h][.)]\s/i.test(choice))) {
    return 'Option text contains a second embedded option list'
  }
  if (parsed.choices.some((choice) => /\bQuestions?:\s*\d|\bAfter studying\b/i.test(choice))) {
    return 'Option text contains an embedded question or instruction'
  }
  if (/\bFor each of the below statements\b/i.test(parsed.question)) {
    return 'Question text contains an unrelated trailing instruction'
  }
  return ''
}

function parseSource(sourceContent) {
  const normalizedSource = sourceContent.replace(/\r\n?/g, '\n')
  const answers = parseAnswerKeys(normalizedSource)
  const questionMatches = Array.from(normalizedSource.matchAll(/^Q\s+(\d+)\b([^\n]*)$/gm))
  const records = []
  let currentSection = ''
  let currentTopic = ''
  let scanOffset = 0

  questionMatches.forEach((match, matchIndex) => {
    const contextChunk = normalizedSource.slice(scanOffset, match.index)
    for (const line of contextChunk.split('\n')) {
      const sectionMatch = line.match(/^SECTION [AB] - (.+)$/)
      const topicMatch = line.match(/^(.+?)\s*PAGE$/)
      if (sectionMatch) currentSection = cleanText(sectionMatch[1])
      if (topicMatch && !/^ANSWER KEY/i.test(topicMatch[1])) {
        currentTopic = formatTopic(topicMatch[1])
      }
    }

    const originalNumber = Number(match[1])
    const nextIndex = questionMatches[matchIndex + 1]?.index ?? normalizedSource.length
    const rawBlock = normalizedSource
      .slice(match.index + match[0].length, nextIndex)
      .split(/^ANSWER KEY - THIS PAGE$/m)[0]
      .trim()
    const rawLines = rawBlock.split('\n').map((line) => line.trim()).filter(Boolean)
    const sourceLineIndex = rawLines.findIndex((line) => /^Sources?(?:\s*\([^)]*\))?:/i.test(line))
    const sourceIndexes = new Set()
    const sourceParts = []
    if (sourceLineIndex >= 0) {
      sourceIndexes.add(sourceLineIndex)
      sourceParts.push(rawLines[sourceLineIndex].replace(/^Sources?(?:\s*\([^)]*\))?:\s*/i, ''))
      for (let index = sourceLineIndex + 1; index < rawLines.length; index += 1) {
        if (!/^[•·]/.test(rawLines[index])) break
        sourceIndexes.add(index)
        sourceParts.push(rawLines[index].replace(/^[•·]\s*/, ''))
      }
    }
    const sourceLabel = cleanText(sourceParts.filter(Boolean).join(' + '))
    const bodyLines = rawLines.filter((_, index) => !sourceIndexes.has(index))
    const answerKey = answers.get(originalNumber)
    const isJuly2026 = /JULY 2026 - RETAINED/i.test(match[2])
    let heldReason = ''
    let parsed = null

    if (!answerKey) {
      heldReason = 'The supplied answer key omits this question'
    } else if (answerKey === '-') {
      heldReason = 'The supplied answer key marks this question without an answer'
    } else if (!currentSection || !currentTopic || !sourceLabel) {
      heldReason = 'Section, topic, or source metadata is incomplete'
    } else {
      parsed = parseChoicesAndQuestion(bodyLines, answerKey)
      heldReason = parsed.error || findStructuralIssue(parsed)
    }

    records.push({
      originalNumber,
      section: currentSection,
      topic: currentTopic,
      sourceLabel,
      answerKey: answerKey || '',
      isJuly2026,
      parsed,
      heldReason,
      rawQuestion: cleanText(bodyLines.join(' '))
    })
    scanOffset = match.index + match[0].length
  })

  return records
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
        id: `gyn402-filtered-master-${groupId}-p${String(partIndex + 1).padStart(2, '0')}`,
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

function buildGeneratedSource(questions, heldForReview, groups, sourceHash) {
  const julyQuestions = questions.filter((question) => question.isJuly2026).length
  const source = {
    id: 'gyn402-filtered-master-bank',
    label: 'Filtered Master Bank',
    description: `${questions.length} answer-safe questions - ${julyQuestions} from July 2026`,
    shuffleQuestions: false,
    shuffleOptions: false,
    mcqs: questions,
    heldForReview,
    collection: {
      prompt: 'Choose an Obstetrics & Gynecology topic or a revision mode.',
      groupNoun: 'topic',
      groupEyebrow: 'Filtered GYN 402 master bank',
      mixedMeta: 'Random questions from the retained filtered exam bank.',
      mixedSizes: [
        { id: 'quick-20', label: 'Quick 20', size: 20, description: 'A short mixed GYN 402 session.' },
        { id: 'standard-30', label: 'Standard 30', size: 30, description: 'Balanced Obstetrics & Gynecology practice.' },
        { id: 'july-2026', label: `July 2026 (${julyQuestions})`, size: julyQuestions, description: 'Questions retained from the July 2026 exam.' },
        { id: 'full-bank', label: `Full ${questions.length}`, size: questions.length, description: 'Solve every answer-safe question in the filtered bank.' }
      ],
      wrongReviewId: 'gyn402-filtered-master-bank-wrong-review',
      groups
    }
  }

  return `// Generated by scripts/build-gyn402-filtered-master-bank.mjs.
// Source SHA-256: ${sourceHash}
// Included: ${questions.length} answer-safe GYN 402 questions; held: ${heldForReview.length}.
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
const records = parseSource(sourceContent)

if (records.length !== 524) {
  throw new Error(`Expected 524 question records, found ${records.length}`)
}
if (records.some((record, index) => record.originalNumber !== index + 1)) {
  throw new Error('Question numbering is incomplete or out of order')
}

const questions = records
  .filter((record) => !record.heldReason)
  .map((record) => ({
    id: `gyn402-filtered-master-q${String(record.originalNumber).padStart(3, '0')}`,
    originalNumber: String(record.originalNumber),
    category: record.topic,
    organ: 'Gynecology & Obstetrics',
    question: record.parsed.question,
    choices: record.parsed.choices,
    answerIndex: record.parsed.answerIndex,
    explanation: `Answer: ${record.parsed.choices[record.parsed.answerIndex]}`,
    source: `${record.sourceLabel} - Filtered Q${record.originalNumber}`,
    section: record.section,
    topic: record.topic,
    questionType: record.parsed.questionType,
    isJuly2026: record.isJuly2026,
    topicTags: ['GYNA402', record.section, record.topic, record.parsed.questionType, ...(record.isJuly2026 ? ['July 2026'] : [])]
  }))

const heldForReview = records
  .filter((record) => record.heldReason)
  .map((record) => ({
    id: `gyn402-filtered-master-held-q${String(record.originalNumber).padStart(3, '0')}`,
    originalNumber: String(record.originalNumber),
    question: record.rawQuestion,
    answerKey: record.answerKey,
    section: record.section,
    topic: record.topic,
    source: record.sourceLabel,
    reason: record.heldReason,
    isJuly2026: record.isJuly2026
  }))

if (new Set(questions.map((question) => question.id)).size !== questions.length) {
  throw new Error('Generated question IDs are not unique')
}
if (questions.some((question) => !Number.isInteger(question.answerIndex) || !question.choices[question.answerIndex])) {
  throw new Error('Generated questions contain an invalid answer')
}

const sourceId = 'gyn402-filtered-master-bank'
const groups = buildCollectionGroups(questions, sourceId)
const generatedSource = buildGeneratedSource(questions, heldForReview, groups, sourceHash)
await Promise.all(targetPaths.map((targetPath) => writeFile(targetPath, generatedSource, 'utf8')))

console.log(JSON.stringify({
  sourcePath,
  sourceHash,
  records: records.length,
  included: questions.length,
  heldForReview: heldForReview.length,
  held: heldForReview.map(({ originalNumber, answerKey, reason }) => ({ originalNumber, answerKey, reason })),
  july2026Included: questions.filter((question) => question.isJuly2026).length,
  groups: groups.length,
  outputs: targetPaths
}, null, 2))
