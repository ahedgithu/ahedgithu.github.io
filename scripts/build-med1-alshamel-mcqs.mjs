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

const doctorNotesGroup = {
  id: 'doctor-important-points',
  label: 'نقاط مهمه الدكتور قال عليها'
}
const doctorNotesSourceHash = 'd00d68f340c24c0b6348d974cf089f3c050d0451fb95afe1634070ee216eca06'
const doctorNotesRecords = [
  ['MCQ 1', 'HAV', 'A 22-year-old student develops fever, chills, headache, fatigue, anorexia, nausea, vomiting, and dark urine one week after eating food from a street vendor. What is the most likely diagnosis?', ['Hepatitis B', 'Hepatitis C', 'Hepatitis A', 'Hepatitis D'], 2],
  ['MCQ 2', 'HAV', 'The main reservoir of Hepatitis A virus is:', ['Domestic animals', 'Birds', 'Humans', 'Mosquitoes'], 2],
  ['MCQ 3', 'HAV', 'Anti-HAV antibodies usually appear:', ['First week', 'Second week', 'Fourth week', 'Eighth week'], 2],
  ['MCQ 4', 'HAV', 'A patient has ALT of 1500 IU/L. This level most likely suggests:', ['Chronic hepatitis', 'Acute hepatitis', 'Liver cirrhosis', 'Fatty liver'], 1],
  ['MCQ 5', 'HAV', 'Which ALT level is more suggestive of chronic hepatitis?', ['1200 IU/L', '1500 IU/L', '70 IU/L', '900 IU/L'], 2],
  ['Case 1', 'HAV Case', 'A 25-year-old man presents with fever, malaise, anorexia, nausea, vomiting, and dark urine after eating contaminated food from a restaurant. What is the most likely diagnosis?', ['HBV', 'HCV', 'HAV', 'HEV'], 2],
  ['MCQ 6', 'HBV', 'The most important route of HBV transmission worldwide is:', ['Fecal-oral', 'Perinatal transmission', 'Mosquito bite', 'Respiratory droplets'], 1],
  ['MCQ 7', 'HBV', 'The most accurate test for detecting HBV viral replication is:', ['ELISA', 'Liver function tests', 'PCR for HBV DNA', 'Ultrasound'], 2],
  ['MCQ 8', 'HBV', 'HBV is classified as:', ['RNA virus', 'DNA virus', 'Retrovirus', 'Coronavirus'], 1],
  ['MCQ 9', 'HBV', 'The first HBV marker to appear in blood is:', ['Anti-HBs', 'Anti-HBc IgM', 'HBsAg', 'HBeAb'], 2],
  ['MCQ 10', 'HBV', 'HBcAg is usually detected in:', ['Blood', 'Urine', 'Liver biopsy', 'Stool'], 2],
  ['MCQ 11', 'HBV', 'During the window period, the best diagnostic marker is:', ['HBsAg', 'Anti-HBs', 'Anti-HBc IgM', 'HBeAg'], 2],
  ['MCQ 12', 'HBV', 'Which HBV marker indicates previous infection or chronic infection?', ['Anti-HBc IgM', 'Anti-HBc IgG', 'HBsAg', 'HBeAg'], 1],
  ['MCQ 13', 'HBV', 'A patient’s serology shows only Anti-HBs positivity. What does this indicate?', ['Acute infection', 'Chronic infection', 'Vaccination', 'Window period'], 2],
  ['MCQ 14', 'HBV', 'A patient’s serology shows Anti-HBs and Anti-HBc IgG positivity. This indicates:', ['Vaccination', 'Previous natural infection', 'Acute hepatitis', 'Window period'], 1],
  ['MCQ 15', 'HBV', 'The window period refers to:', ['Before HBsAg appears', 'Between disappearance of HBsAg and appearance of Anti-HBs', 'Before Anti-HBc appears', 'During chronic hepatitis'], 1],
  ['MCQ 16', 'HBV', 'HBIG is routinely indicated for:', ['Every HBV patient', 'Children born to HBV-positive mothers', 'HCV patients', 'HAV contacts only'], 1],
  ['MCQ 17', 'HBV', 'Which of the following is NOT used in HBV treatment?', ['Tenofovir', 'Entecavir', 'Lamivudine', 'Ribavirin'], 3],
  ['Case 2', 'HBV Cases', 'A newborn is delivered to a mother known to be HBsAg positive. Which intervention should be given immediately after birth?', ['HAV vaccine', 'HBIG', 'Interferon', 'Ribavirin'], 1],
  ['Case 3', 'HBV Cases', 'A patient’s serology shows: HBsAg: Negative; Anti-HBs: Positive; Anti-HBc IgG: Negative. The patient is:', ['Acutely infected', 'Chronically infected', 'Vaccinated', 'In window period'], 2],
  ['Case 4', 'HBV Cases', 'A patient has: HBsAg: Negative; Anti-HBs: Negative; Anti-HBc IgM: Positive. This pattern indicates:', ['Vaccination', 'Window period', 'Chronic hepatitis', 'Healthy carrier'], 1],
  ['MCQ 18', 'HCV', 'The best screening test for HCV infection is:', ['PCR', 'ELISA', 'Liver biopsy', 'Ultrasound'], 1],
  ['MCQ 19', 'HCV', 'The confirmatory test for HCV diagnosis is:', ['ELISA', 'ALT', 'PCR for HCV RNA', 'FibroScan'], 2],
  ['MCQ 20', 'HCV', 'Fibrosis in HCV can be assessed non-invasively using all of the following EXCEPT:', ['FibroScan', 'APRI score', 'FIB-4 score', 'Widal test'], 3],
  ['Case 5', 'HCV', 'A 38-year-old man is positive for anti-HCV antibodies by ELISA. What is the next best investigation to confirm active infection?', ['Repeat ELISA', 'PCR for HCV RNA', 'Liver biopsy', 'Ultrasound'], 1],
  ['MCQ 21', 'HEV', 'Hepatitis E infection is particularly severe in:', ['Children', 'Elderly men', 'Pregnant women', 'Diabetic patients'], 2, 'نقطة الدكتور المهمة 📌'],
  ['MCQ 22', 'HEV', 'Severe HEV infection during pregnancy may lead to:', ['Fatty liver', 'Chronic hepatitis', 'Fulminant hepatic failure', 'Liver abscess'], 2, 'نقطة الدكتور المهمة 📌'],
  ['Case 6', 'HEV', 'A 28-year-old woman in her third trimester presents with jaundice, vomiting, malaise, and markedly elevated liver enzymes. The physician is concerned because this viral hepatitis has a high mortality rate during pregnancy. Which virus is the most likely cause?', ['HAV', 'HBV', 'HCV', 'HEV'], 3, 'نقطة الدكتور المهمة 📌 · متوقعة جدًا'],
  ['High Yield', 'Comprehensive', 'A patient presents with acute hepatitis. Laboratory findings reveal: ALT = 1400 IU/L; HBsAg = Negative; Anti-HBc IgM = Positive; Anti-HBs = Negative. What is the most likely diagnosis?', ['Vaccinated against HBV', 'Chronic HBV infection', 'Window period of acute HBV infection', 'Previous HBV infection'], 2, 'سؤال شامل · High Yield 📌']
]

const doctorNotesQuestions = doctorNotesRecords.map((record, index) => {
  const [sourceLabel, section, question, choices, answerIndex, additionalNote = ''] = record
  return {
    id: `med1-alshamel-doctor-notes-q${String(index + 1).padStart(2, '0')}`,
    originalNumber: String(index + 1),
    sourceLabel,
    category: doctorNotesGroup.label,
    organ: section,
    question,
    choices,
    answerIndex,
    explanation: `${additionalNote ? `Additional note: ${additionalNote}. ` : ''}Answer: ${choices[answerIndex]}.`,
    additionalNote,
    source: 'Document (16).docx',
    sourceHash: doctorNotesSourceHash,
    section,
    topicTags: ['MED-1', 'الشامل', doctorNotesGroup.label, section]
  }
})
questions.push(...doctorNotesQuestions)

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
groups.push({
  id: doctorNotesGroup.id,
  label: doctorNotesGroup.label,
  questionCount: doctorNotesQuestions.length,
  sourceFile: 'Document (16).docx',
  sourceHash: doctorNotesSourceHash,
  sourceNote: 'MCQs وCase Scenarios بنفس مستوى أسئلة الجامعة، مع التركيز على النقاط التي وضع الدكتور عليها علامة 📌.',
  parts: createParts(doctorNotesGroup, doctorNotesQuestions)
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
