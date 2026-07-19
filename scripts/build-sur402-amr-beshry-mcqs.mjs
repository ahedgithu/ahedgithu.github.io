import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const sourceRoot = process.argv[2] || 'G:\\school\\study mode\\subjects\\402\\new\\newly'
const targetPaths = [
  path.join(repoRoot, 'src', 'sur402-amr-beshry-mcqs.js'),
  path.join(repoRoot, 'public', 'src', 'sur402-amr-beshry-mcqs.js')
]

const breastMarkdownPath = path.join(
  sourceRoot,
  'Surgery_MCQ_book_Dr_Amr_Mohsen_Dr_Ahmed_El-Beshry',
  'Surgery_MCQ_book_Dr_Amr_Mohsen_Dr_Ahmed_El-Beshry.md'
)
const secondMarkdownPath = path.join(
  sourceRoot,
  'Surgery_MCQ_book_Dr_Amr_Mohsen_Dr_Ahmed_El-Beshry_wpQ',
  'Surgery_MCQ_book_Dr_Amr_Mohsen_Dr_Ahmed_El-Beshry_wpQ.md'
)

function extractPageText(markdown, pageNumber) {
  const pagePattern = new RegExp(`^## Page ${pageNumber}\\s*$([\\s\\S]*?)(?=^## Page \\d+\\s*$|(?![\\s\\S]))`, 'm')
  const page = markdown.match(pagePattern)?.[1] || ''
  return page.match(/```text\s*\n([\s\S]*?)```/)?.[1] || ''
}

function cleanText(value) {
  return value
    .replace(/\r/g, '')
    .replace(/^Copyright .*$/gim, ' ')
    .replace(/^Page\s*[|I].*$/gim, ' ')
    .replace(/^[â€¢·]+\s*$/gm, ' ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeChapterText(text, chapterId) {
  let normalized = text
    .replace(/\r/g, '')
    .replace(/^t\\\.\s+/gm, 'A. ')
    .replace(/^0\. I\\' fluid administration/gm, 'D. IV fluid administration')
  if (chapterId === 'breast') {
    normalized = normalized
      .replace(/^s\. The following statements about fibrocystic breast/gm, '5. The following statements about fibrocystic breast')
      .replace(/^IO\. The commones/gm, '10. The commones')
      .replace(/^J 6\. Regar/gm, '16. Regar')
  }
  if (chapterId === 'abdominal-wall-hernia') {
    normalized = normalized
      .replace(/^(About abdominal incisions,[^\n]+)\s*\nl \. A\./m, '1. $1\nA.')
      .replace(/^1 7\. A 7-month-old/gm, '17. A 7-month-old')
  }
  if (chapterId === 'endocrine-surgery') {
    normalized = normalized.replace(/^I\. About APUD cells/gm, '1. About APUD cells')
  }
  return normalized
}

function findQuestionMarkers(text, expectedNumbers) {
  const matches = [...text.matchAll(/^\s*(\d{1,2})\.\s+/gm)]
  const markers = []
  let afterIndex = 0
  for (const expected of expectedNumbers) {
    const marker = matches.find((candidate) => candidate.index >= afterIndex && Number(candidate[1]) === expected)
    if (!marker) throw new Error(`Markdown question ${expected} was not found after character ${afterIndex}`)
    markers.push(marker)
    afterIndex = marker.index + marker[0].length
  }
  return markers
}

function parseStandardBlock(block, number) {
  const optionMarkers = [...block.matchAll(/^\s*([A-Ea-e])[.,]\s+/gm)]
  if (optionMarkers.length < 6) {
    throw new Error(`Question ${number} has only ${optionMarkers.length} option/answer markers`)
  }
  const choiceMarkers = optionMarkers.slice(0, 5)
  const answerMarker = optionMarkers[5]
  const choices = choiceMarkers.map((marker, index) => {
    const end = choiceMarkers[index + 1]?.index ?? answerMarker.index
    return cleanText(block.slice(marker.index + marker[0].length, end))
  })
  const answerIndex = answerMarker[1].toUpperCase().charCodeAt(0) - 65
  return {
    question: cleanText(block.slice(0, choiceMarkers[0].index).replace(/^\s*\d{1,2}\.\s+/, '')),
    choices,
    answerIndex,
    explanation: cleanText(block.slice(answerMarker.index + answerMarker[0].length))
  }
}

const manualQuestions = {
  'breast:3': {
    question: 'The axillary lymph nodes are divided into three levels by which structure?',
    choices: ['The axillary artery', 'The axillary vein', 'The pectoralis minor muscle', 'The clavicle', 'The nerve to latissimus dorsi'],
    answerIndex: 2,
    explanation: 'The Markdown explanation identifies the pectoralis minor muscle as the structure dividing levels I, II, and III.'
  },
  'breast:10': {
    question: 'The commonest histological type of breast cancer is:',
    choices: ['Duct carcinoma in situ', 'Lobular carcinoma in situ', 'Invasive duct carcinoma', 'Invasive lobular carcinoma', "Paget's disease of the nipple"],
    answerIndex: 2,
    explanation: 'The Markdown answer states that invasive duct carcinoma accounts for about 75% of breast cancer cases.'
  },
  'breast:11': {
    question: 'A woman has a 3 cm breast mass. There are no palpable axillary lymph nodes or clinical evidence of metastasis. FNAC proves invasive duct carcinoma. What is the TNM clinical stage?',
    choices: ['T1 N1 M1', 'T1 N0 M0', 'T2 N2 M0', 'T2 N1 M0', 'T2 N0 M0'],
    answerIndex: 4,
    explanation: 'A 3 cm tumour is T2, impalpable axillary nodes are N0, and absence of metastasis is M0.'
  },
  'breast:26': {
    question: 'Neo-adjuvant therapy for malignancy means:',
    choices: ['Treatment with modern methods', 'Giving chemotherapy and/or radiotherapy before surgery', 'Giving chemotherapy after radical excision', 'Giving radiotherapy after palliative excision', 'Giving chemotherapy after palliative excision'],
    answerIndex: 1,
    explanation: 'The Markdown explanation defines neoadjuvant therapy as chemotherapy and/or radiotherapy given before surgery to reduce a locally advanced tumour.'
  },
  'breast:27': {
    question: 'When screening females for breast carcinoma, what is the most significant risk?',
    choices: ['Three previous breast biopsies in premenopausal females', 'More than two first-degree relatives with ovarian or breast carcinoma', 'Hyperplasia in a breast biopsy', 'None of the above'],
    answerIndex: 1,
    explanation: 'The Markdown answer identifies more than two first-degree relatives with ovarian or breast carcinoma as the most significant listed risk.'
  },
  'endocrine-surgery:17': {
    question: 'About papillary thyroid cancer, all the following statements are true, except:',
    choices: ['It is the commonest thyroid cancer', 'It usually affects teenagers', 'It spreads by lymphatics', 'Iodine-131 hinders its growth', 'It secretes calcitonin'],
    answerIndex: 4,
    explanation: 'Papillary and follicular cancers are differentiated thyroid cancers and do not secrete calcitonin; calcitonin is a marker for medullary carcinoma.'
  },
  'endocrine-surgery:30': {
    question: 'About post-thyroidectomy hypoparathyroidism, all the following statements are true, except:',
    choices: ['It may be caused by inadvertent removal of the parathyroid glands at thyroidectomy', 'It may be caused by devascularization of the parathyroid glands at operation', 'The condition usually presents about two weeks after thyroidectomy', 'The earliest symptom is facial and peripheral numbness', 'Tetany may be manifest or latent'],
    answerIndex: 2,
    explanation: 'The Markdown explanation states that the condition usually presents between days 2 and 5 after thyroidectomy, sometimes earlier.'
  }
}

const groupLabels = {
  breast: 'Breast',
  'abdominal-wall-hernia': 'Abdominal Wall & Hernia',
  'thyroid-men': 'Thyroid & MEN',
  parathyroid: 'Parathyroid',
  adrenal: 'Adrenal'
}

const heldRecords = []

function getGroupId(chapterId, number) {
  if (chapterId !== 'endocrine-surgery') return chapterId
  if (number <= 24) return 'thyroid-men'
  if (number <= 30) return 'parathyroid'
  return 'adrenal'
}

function parseChapter({ id, sourceLabel, pageNumbers, expectedNumbers, markdown }) {
  const text = normalizeChapterText(pageNumbers.map((pageNumber) => extractPageText(markdown, pageNumber)).join('\n'), id)
  const markers = findQuestionMarkers(text, expectedNumbers)
  return markers.map((marker, index) => {
    const number = expectedNumbers[index]
    const block = text.slice(marker.index, markers[index + 1]?.index ?? text.length)
    let parsed
    try {
      parsed = manualQuestions[`${id}:${number}`] || parseStandardBlock(block, number)
    } catch (error) {
      heldRecords.push(`${id}:${number} (${error.message})`)
      return null
    }
    if (!parsed.question || parsed.choices.length < 4 || !parsed.choices[parsed.answerIndex]) {
      throw new Error(`Invalid Markdown-derived record for ${id} question ${number}`)
    }
    const groupId = getGroupId(id, number)
    const groupLabel = groupLabels[groupId]
    return {
      id: `sur402-amr-beshry-${groupId}-q${String(number).padStart(2, '0')}`,
      originalNumber: String(number),
      category: groupLabel,
      organ: groupLabel,
      question: parsed.question,
      choices: parsed.choices,
      answerIndex: parsed.answerIndex,
      explanation: parsed.explanation || `Answer: ${parsed.choices[parsed.answerIndex]}.`,
      source: sourceLabel,
      section: `${sourceLabel} · Question ${number}`,
      topicTags: ['SUR402-1', 'textbook', groupLabel]
    }
  }).filter(Boolean)
}

const [breastMarkdown, secondMarkdown] = await Promise.all([
  readFile(breastMarkdownPath, 'utf8'),
  readFile(secondMarkdownPath, 'utf8')
])

const breastNumbers = [1, 2, 3, ...Array.from({ length: 24 }, (_, index) => index + 5)]
const abdominalNumbers = Array.from({ length: 22 }, (_, index) => index + 1).filter((number) => number !== 17)
const endocrineNumbers = [...Array.from({ length: 27 }, (_, index) => index + 1), ...Array.from({ length: 9 }, (_, index) => index + 30)]

const questions = [
  ...parseChapter({
    id: 'breast',
    sourceLabel: 'Amr Mohsen & Ahmed El-Beshry · Breast',
    pageNumbers: [1, 2, 3, 4, 6, 7, 8, 10, 11],
    expectedNumbers: breastNumbers,
    markdown: breastMarkdown
  }),
  ...parseChapter({
    id: 'abdominal-wall-hernia',
    sourceLabel: 'Amr Mohsen & Ahmed El-Beshry · Abdominal Wall and Hernia',
    pageNumbers: [1, 2, 3, 4, 5, 6, 7, 8],
    expectedNumbers: abdominalNumbers,
    markdown: secondMarkdown
  }),
  ...parseChapter({
    id: 'endocrine-surgery',
    sourceLabel: 'Amr Mohsen & Ahmed El-Beshry · Endocrine Surgery',
    pageNumbers: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    expectedNumbers: endocrineNumbers,
    markdown: secondMarkdown
  })
]

if (questions.length !== 83 || new Set(questions.map((question) => question.id)).size !== 83 || heldRecords.length !== 1 || !heldRecords[0].startsWith('breast:9 ')) {
  throw new Error(`Markdown-derived Amr Mohsen/El-Beshry bank must contain 83 unique questions with only breast question 9 held; got ${questions.length}. Held: ${heldRecords.join('; ')}`)
}

const groupDefinitions = [
  { id: 'breast', label: 'Breast', count: 26 },
  { id: 'abdominal-wall-hernia', label: 'Abdominal Wall & Hernia', count: 21 },
  { id: 'thyroid-men', label: 'Thyroid & MEN', count: 24 },
  { id: 'parathyroid', label: 'Parathyroid', count: 4 },
  { id: 'adrenal', label: 'Adrenal', count: 8 }
]
for (const definition of groupDefinitions) {
  const count = questions.filter((question) => question.category === definition.label).length
  if (count !== definition.count) throw new Error(`${definition.label} count mismatch: expected ${definition.count}, got ${count}`)
}

const sourceHash = createHash('sha256').update(breastMarkdown).update(secondMarkdown).digest('hex')
const generatedSource = `// Generated by scripts/build-sur402-amr-beshry-mcqs.mjs.
// Combined Markdown SHA-256: ${sourceHash}
// Included: 83 answer-safe records extracted only from the two supplied Markdown files. Five incomplete source records are held.
(() => {
  const quizzes = window.mcqQuizzes402 || (window.mcqQuizzes402 = {})
  const quiz = quizzes["SUR 402-1 MCQs"] || (quizzes["SUR 402-1 MCQs"] = { alwaysShowSourcePicker: true, sources: [] })
  quiz.alwaysShowSourcePicker = true
  const source = {
    id: "sur402-amr-mohsen-ahmed-beshry",
    label: "Amr Mohsen & Ahmed El-Beshry MCQs",
    description: "83 Markdown-derived questions · 5 topics · 5 short parts",
    shuffleQuestions: false,
    shuffleOptions: false,
    mcqs: ${JSON.stringify(questions, null, 2)}
  }
  const groupDefinitions = ${JSON.stringify(groupDefinitions, null, 2)}
  source.collection = {
    prompt: "Choose a book topic or a mixed revision mode.",
    groupNoun: "topic",
    groupEyebrow: "SUR402-1 textbook bank",
    mixedMeta: "Random questions from Breast, Abdominal Wall and Hernia, Thyroid and MEN, Parathyroid, and Adrenal.",
    mixedSizes: [
      { id: "quick-20", label: "Quick 20", size: 20, description: "A short mixed book session." },
      { id: "standard-30", label: "Standard 30", size: 30, description: "Balanced mixed book practice." },
      { id: "exam-50", label: "Exam 50", size: 50, description: "A longer mixed book session." }
    ],
    wrongReviewId: "sur402-amr-beshry-wrong-review",
    groups: groupDefinitions.map((definition) => {
      const groupQuestions = source.mcqs.filter((question) => question.category === definition.label)
      return {
        id: definition.id,
        label: definition.label,
        questionCount: groupQuestions.length,
        parts: [{
          id: \`sur402-amr-beshry-\${definition.id}-p01\`,
          label: \`Part 1 · Q1–\${groupQuestions.length}\`,
          description: \`\${definition.label} book questions\`,
          range: \`Q1–\${groupQuestions.length}\`,
          questionStart: 1,
          questionEnd: groupQuestions.length,
          parentSourceId: source.id,
          groupId: definition.id,
          groupLabel: definition.label,
          partIndex: 0,
          partCount: 1,
          shuffleQuestions: false,
          shuffleOptions: false,
          mcqs: groupQuestions
        }]
      }
    })
  }
  quiz.sources = (quiz.sources || []).filter((item) => item.id !== source.id)
  quiz.sources.push(source)
})()
`

await Promise.all(targetPaths.map((targetPath) => writeFile(targetPath, generatedSource, 'utf8')))
console.log(`Generated ${questions.length} Amr Mohsen/El-Beshry SUR402-1 questions from the two Markdown files.`)
