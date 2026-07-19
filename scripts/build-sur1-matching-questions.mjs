import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultSource = 'G:\\school\\study mode\\subjects\\sur1\\matching\\Matching_Questions_Liver_Spleen_Tongue_Stomach_Esophagus.md'
const sourcePath = path.resolve(process.argv[2] || defaultSource)
const targetPaths = [
  path.join(repoRoot, 'src', 'sur1-matching-questions.js'),
  path.join(repoRoot, 'public', 'src', 'sur1-matching-questions.js')
]

const organOrder = ['Liver', 'Spleen', 'Tongue', 'Stomach', 'Esophagus']
const expectedOrganCounts = {
  Liver: 21,
  Spleen: 5,
  Tongue: 10,
  Stomach: 30,
  Esophagus: 16
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function cleanInlineMarkdown(value) {
  return value
    .replace(/^\*|\*$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function getOrganFromHeading(heading) {
  return organOrder.find((organ) => heading.toLowerCase().includes(organ.toLowerCase())) || null
}

function getSection(lines, heading, nextHeading) {
  const start = lines.findIndex((line, index) => index >= heading.line + 1 && line.trim() === '### Questions')
  const end = lines.findIndex((line, index) => index > start && index < nextHeading && line.trim() === '---')
  if (start < 0 || end < 0) throw new Error(`Question section is incomplete for ${heading.title}`)
  return lines.slice(start + 1, end)
}

function parseSource(sourceText) {
  const lines = sourceText.replace(/\r\n/g, '\n').split('\n')
  const headings = []
  let activeOrgan = null

  lines.forEach((line, index) => {
    if (/^# (?!#)/.test(line)) activeOrgan = getOrganFromHeading(line)
    if (/^## (?!#)/.test(line) && line !== '## Contents') {
      if (!activeOrgan) throw new Error(`Matching set has no organ at line ${index + 1}`)
      headings.push({ line: index, title: line.slice(3).trim(), organ: activeOrgan })
    }
  })

  return headings.map((heading, setIndex) => {
    const nextHeading = headings[setIndex + 1]?.line || lines.length
    const block = lines.slice(heading.line, nextHeading)
    const instructionsLine = block.find((line) => line.startsWith('**Instructions:**'))
    const instructions = instructionsLine?.replace('**Instructions:**', '').trim() || 'Match each item with the most appropriate option.'
    const options = new Map()

    block.forEach((line) => {
      const match = line.match(/^\| \*\*([A-Z])\*\* \| (.+) \|$/)
      if (match) options.set(match[1], cleanInlineMarkdown(match[2]))
    })

    const questionLines = getSection(lines, heading, nextHeading)
    const questions = questionLines.flatMap((line) => {
      const match = line.match(/^(\d+)\.\s+(.+)$/)
      return match ? [{ number: Number(match[1]), text: match[2].trim() }] : []
    })
    const questionSourceLine = questionLines.find((line) => line.startsWith('*Question source:')) || ''
    const questionSource = cleanInlineMarkdown(questionSourceLine.replace('*Question source:', '').trim())
    const answers = new Map()

    block.forEach((line, index) => {
      const answerMatch = line.match(/^#### (\d+)\. ([A-Z]) - (.+)$/)
      if (!answerMatch) return
      const rationale = block.slice(index + 1).find((candidate) => candidate.startsWith('**Rationale:**'))
      const source = block.slice(index + 1).find((candidate) => candidate.startsWith('**Source:**'))
      answers.set(Number(answerMatch[1]), {
        option: answerMatch[2],
        label: answerMatch[3].trim(),
        rationale: rationale?.replace('**Rationale:**', '').trim() || '',
        source: source?.replace('**Source:**', '').trim() || questionSource
      })
    })

    if (options.size < 2) throw new Error(`Expected at least two options for ${heading.title}`)
    if (!questions.length || questions.length !== answers.size) {
      throw new Error(`Question/answer mismatch for ${heading.title}: ${questions.length}/${answers.size}`)
    }

    const setId = `${slugify(heading.organ)}-${slugify(heading.title)}`
    const websiteQuestions = questions.map((question) => {
      const answer = answers.get(question.number)
      const optionEntries = [...options.entries()]
      const answerIndex = optionEntries.findIndex(([key]) => key === answer?.option)
      if (!answer || answerIndex < 0) throw new Error(`Answer ${question.number} is invalid in ${heading.title}`)

      return {
        id: `sur1-match-${setId}-q${String(question.number).padStart(2, '0')}`,
        originalNumber: String(question.number),
        questionType: 'matching',
        matchingSet: heading.title,
        instructions,
        organ: heading.organ,
        question: question.text,
        choices: optionEntries.map(([, choice]) => choice),
        answerIndex,
        explanation: answer.rationale,
        source: answer.source,
        questionSource,
        section: `${heading.organ} · ${heading.title}`,
        topicTags: [heading.organ, heading.title, 'matching']
      }
    })

    return {
      id: setId,
      title: heading.title,
      organ: heading.organ,
      instructions,
      questionSource,
      questions: websiteQuestions
    }
  })
}

function buildGeneratedSource(sets, sourceHash) {
  const allQuestions = sets.flatMap((set) => set.questions)
  const groups = organOrder.map((organ) => {
    const organSets = sets.filter((set) => set.organ === organ)
    const organQuestions = organSets.flatMap((set) => set.questions)
    return {
      id: slugify(organ),
      label: organ,
      questionCount: organQuestions.length,
      parts: organSets.map((set, partIndex) => ({
        id: `sur1-match-${set.id}`,
        label: set.title,
        description: set.instructions,
        range: `${set.questions.length} matching items`,
        parentSourceId: 'matching-liver-spleen-tongue-stomach-esophagus',
        groupId: slugify(organ),
        groupLabel: organ,
        partIndex,
        partCount: organSets.length,
        shuffleQuestions: false,
        shuffleOptions: false,
        mcqs: set.questions
      }))
    }
  })

  return `// Generated by scripts/build-sur1-matching-questions.mjs.
// Source SHA-256: ${sourceHash}
// Included: ${allQuestions.length} matching items across ${sets.length} source-faithful sets.
(() => {
  const quizzes = window.mcqQuizzes || (window.mcqQuizzes = {})
  const quiz = quizzes["SUR 401-1 MCQs"] || (quizzes["SUR 401-1 MCQs"] = { alwaysShowSourcePicker: true, sources: [] })
  quiz.alwaysShowSourcePicker = true

  const source = ${JSON.stringify({
    id: 'matching-liver-spleen-tongue-stomach-esophagus',
    label: 'Matching Questions - Liver, Spleen, Tongue, Stomach & Esophagus',
    description: `${allQuestions.length} matching items · ${groups.length} organs · ${sets.length} topic sets`,
    shuffleQuestions: false,
    shuffleOptions: false,
    mcqs: allQuestions,
    collection: {
      prompt: 'Choose an organ, then choose the original matching set.',
      groupNoun: 'organ',
      groupEyebrow: 'Matching bank',
      mixedMeta: 'Random matching items from all five organs.',
      mixedSizes: [
        { id: 'quick-20', label: 'Quick 20', size: 20, description: 'A short mixed matching session.' },
        { id: 'standard-30', label: 'Standard 30', size: 30, description: 'Balanced matching practice.' },
        { id: 'exam-50', label: 'Exam 50', size: 50, description: 'A longer mixed matching session.' }
      ],
      wrongReviewId: 'sur1-matching-wrong-review',
      groups
    }
  }, null, 2)}

  quiz.sources = (quiz.sources || []).filter((item) => item.id !== source.id)
  quiz.sources.push(source)
})()
`
}

const sourceText = await readFile(sourcePath, 'utf8')
const sets = parseSource(sourceText)
const questions = sets.flatMap((set) => set.questions)
const organCounts = Object.fromEntries(organOrder.map((organ) => [
  organ,
  questions.filter((question) => question.organ === organ).length
]))

if (sets.length !== 14) throw new Error(`Expected 14 matching sets, received ${sets.length}`)
if (questions.length !== 82) throw new Error(`Expected 82 matching items, received ${questions.length}`)
if (JSON.stringify(organCounts) !== JSON.stringify(expectedOrganCounts)) {
  throw new Error(`Organ coverage changed: ${JSON.stringify(organCounts)}`)
}
if (new Set(questions.map((question) => question.id)).size !== questions.length) {
  throw new Error('Generated matching question IDs are not unique')
}

const sourceHash = createHash('sha256').update(sourceText).digest('hex')
const generatedSource = buildGeneratedSource(sets, sourceHash)
await Promise.all(targetPaths.map((targetPath) => writeFile(targetPath, generatedSource, 'utf8')))

console.log(JSON.stringify({
  sourcePath,
  sourceHash,
  included: questions.length,
  sets: sets.length,
  organs: organCounts,
  outputs: targetPaths
}, null, 2))
