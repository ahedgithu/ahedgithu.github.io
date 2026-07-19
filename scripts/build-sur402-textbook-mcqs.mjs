import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const sourcePath = process.argv[2] || 'C:\\Users\\ahmed\\AppData\\Local\\Temp\\SURG1_Textbooks_MCQs.md'
const targetPaths = [
  path.join(repoRoot, 'src', 'sur402-textbook-mcqs.js'),
  path.join(repoRoot, 'public', 'src', 'sur402-textbook-mcqs.js')
]

const sharedChoiceSets = {
  breastStage: ['Stage 0', 'Stage I', 'Stage II', 'Stage III', 'Stage IV'],
  carcinoidProcedure: ['Appendectomy', 'Segmental ileal resection', 'Cecectomy', 'Right hemicolectomy', 'Hepatic wedge resection and appropriate bowel resection'],
  breastTreatment: [
    'No further surgical intervention',
    'Wide local excision',
    'Wide local excision with adjuvant radiation therapy',
    'Wide local excision with axillary lymph node dissection and radiation therapy',
    'Simple mastectomy (without axillary lymph node dissection)',
    'Modified radical mastectomy (simple mastectomy with in-continuity axillary lymph node dissection)',
    'Radical mastectomy',
    'Bilateral prophylactic simple mastectomies'
  ]
}

const groupedAnswers = new Map([
  [276, 'd'], [277, 'c'], [278, 'a'], [279, 'd'], [280, 'e'],
  [281, 'd'], [282, 'a'], [283, 'b'], [284, 'e'], [285, 'c'],
  [286, 'b'], [287, 'e'], [288, 'a'], [289, 'd'], [290, 'g']
])

const breastNumbers = new Set([245, 246, 247, 251, 254, 255, 260, 261, 268, 272, 275, 276, 277, 278, 279, 280, 286, 287, 288, 289, 290])
const thyroidNumbers = new Set([242, 244, 248, 252, 253, 256, 257, 263, 264, 265, 266, 269, 270, 271])
const otherEndocrineNumbers = new Set([243, 249, 250, 258, 259, 262, 267, 273, 274])

function cleanText(value) {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/^## PDF Page \d+\s*$/gm, ' ')
    .replace(/^---\s*$/gm, ' ')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getCategory(number) {
  if (breastNumbers.has(number)) return 'Breast'
  if (thyroidNumbers.has(number)) return 'Thyroid & Parathyroid'
  if (otherEndocrineNumbers.has(number)) return 'Other Endocrine'
  return 'Carcinoid'
}

function getSharedChoices(number) {
  if (number >= 276 && number <= 280) return sharedChoiceSets.breastStage
  if (number >= 281 && number <= 285) return sharedChoiceSets.carcinoidProcedure
  return sharedChoiceSets.breastTreatment
}

function getGroupedExplanation(number) {
  if (number <= 280) return 'Answer key and staging explanation: PreTest Endocrine Problems and the Breast, answers for questions 276-280.'
  if (number <= 285) return 'Answer key and operative-management explanation: PreTest Endocrine Problems and the Breast, answers for questions 281-285.'
  return 'Answer key and breast-treatment explanation: PreTest Endocrine Problems and the Breast, answers for questions 286-290.'
}

function parseAnswerExplanations(markdown) {
  const answerSection = markdown.slice(markdown.indexOf('## PDF Page 14'), markdown.indexOf('## PDF Page 25'))
  const matches = [...answerSection.matchAll(/^\*\*(\d+)\. The answer is ([a-h])\.([^*]*)\*\*/gm)]
  const results = new Map()

  matches.forEach((match, index) => {
    const number = Number(match[1])
    const nextIndex = matches[index + 1]?.index ?? answerSection.length
    const rangeIndex = answerSection.indexOf('276 to 280.', match.index)
    const blockEnd = rangeIndex >= 0 && rangeIndex < nextIndex ? rangeIndex : nextIndex
    const block = answerSection.slice(match.index, blockEnd)
    results.set(number, {
      letter: match[2],
      explanation: cleanText(block.replace(/^\*\*\d+\. The answer is [a-h]\./, ''))
    })
  })

  groupedAnswers.forEach((letter, number) => {
    results.set(number, { letter, explanation: getGroupedExplanation(number) })
  })
  return results
}

function parsePretestQuestions(markdown) {
  const questionSection = markdown.slice(markdown.indexOf('## PDF Page 2'), markdown.indexOf('## PDF Page 14'))
  const markerPattern = /^\*\*(\d+)\.\s+([\s\S]*?)\*\*/gm
  const matches = [...questionSection.matchAll(markerPattern)]
  const answers = parseAnswerExplanations(markdown)

  return matches.map((match, index) => {
    const number = Number(match[1])
    const nextIndex = matches[index + 1]?.index ?? questionSection.length
    let remainder = questionSection.slice(match.index + match[0].length, nextIndex)
    const nextGroupIndex = remainder.search(/^## Questions \d+ to \d+/m)
    if (nextGroupIndex >= 0) remainder = remainder.slice(0, nextGroupIndex)

    let questionText = cleanText(`${match[2]} ${remainder.split(/^- a\.\s+/m)[0] || ''}`)
    let choices = []
    if (number >= 276) {
      choices = [...getSharedChoices(number)]
    } else {
      const choiceMatches = [...remainder.matchAll(/^- ([a-h])\.\s+([\s\S]*?)(?=\n- [a-h]\.\s+|$)/gm)]
      choices = choiceMatches.map((choice) => cleanText(choice[2]))
    }

    const answer = answers.get(number)
    if (!answer) throw new Error(`Missing PreTest answer for question ${number}`)
    const answerIndex = answer.letter.charCodeAt(0) - 97
    if (choices.length < 2 || !choices[answerIndex]) {
      throw new Error(`Invalid PreTest choices/answer for question ${number}: ${choices.length} choices, answer ${answer.letter}`)
    }

    return {
      id: `sur402-textbook-pretest-q${number}`,
      originalNumber: String(number),
      category: getCategory(number),
      organ: getCategory(number),
      sourcePage: number <= 290 ? 'PDF pages 2-24' : '',
      question: questionText,
      choices,
      answerIndex,
      explanation: answer.explanation || `Answer: ${choices[answerIndex]}.`,
      source: 'PreTest: Endocrine Problems and the Breast',
      section: `PreTest · ${getCategory(number)}`,
      topicTags: ['SUR402-1', 'textbook', getCategory(number)]
    }
  }).filter((question) => question.originalNumber !== '242')
}

const langeHerniaQuestions = [
  ['A 6-month-old boy presents with an inguinal hernia first noticed 2 weeks after birth. What is the best treatment choice?', ['Observation', 'Laparotomy', 'Surgical repair when the child is fully grown', 'Surgical repair of the affected side', 'Surgical repair of the affected side and exploration of the nonaffected side for an occult sac'], 4],
  ['A 60-year-old man presents with an inguinal hernia of recent onset. Which statement is true?', ['The hernia is more likely to be direct than indirect', 'It presents through the posterior wall lateral to the deep inguinal ring', 'It is covered anteriorly by the transversalis fascia', 'It is more likely than a femoral hernia to strangulate', 'The sac is congenital'], 0],
  ['A 70-year-old smoker has a reducible right inguinal mass that does not extend to the scrotum, with recent urinary difficulty and nocturia. What is the likely diagnosis?', ['Direct inguinal hernia', 'Strangulated indirect inguinal hernia', 'Hydrocele', 'Femoral artery aneurysm', 'Cyst of the cord'], 0],
  ['A 65-year-old woman requires emergency surgery for a strangulated inguinal hernia. Which statement is correct?', ['The sac is formed by an unobliterated processus vaginalis', 'The hernia is direct rather than indirect', 'Such hernias never contain small intestine', 'Strangulation never causes bowel ischemia or gangrene', 'Indirect inguinal hernias are never found in women'], 0],
  ['An otherwise healthy 60-year-old man is advised to undergo surgery for a left inguinal hernia. Which is an acceptable standard treatment?', ['Traditional surgical repair under general or local anesthesia', 'Repair with ipsilateral orchiectomy', 'Laparotomy for retroperitoneal repair', 'Routine contralateral groin exploration', 'A postoperative truss to reduce recurrence'], 0],
  ['A 62-year-old man has an irreducible painful groin swelling and a Richter hernia at surgery. Which statement is true?', ['It presents lateral to the rectus sheath', 'It presents through the lumbar triangle', 'It presents through the obturator foramen', 'It contains a Meckel diverticulum', 'It may allow normal passage of stool'], 4],
  ['At inguinal hernia surgery, the cecum forms part of the wall of the sac. What is this hernia called?', ['Incarcerated', 'Irreducible', 'Sliding', 'Richter', 'Interstitial'], 2],
  ['Which structures may be injured during inguinal hernia repair?', ['Ilioinguinal, genitofemoral, iliohypogastric, and lateral femoral cutaneous nerves', 'Femoral nerve only', 'Popliteal nerve', 'Nerve to psoas major', 'Pudendal nerve'], 0],
  ['Which structures are normally encountered during male inguinal hernia repair?', ['Spermatic cord, cremaster muscle, transversalis fascia, deep epigastric vessels, and conjoined tendon', 'Round ligament', 'Obturator nerve', 'Symphysis pubis', 'Nerve to the thigh adductors'], 0],
  ['During femoral hernia repair, the structure most vulnerable to major injury lies where relative to the femoral canal?', ['Medially', 'Laterally', 'Anteriorly', 'Posteriorly', 'Superficially'], 1],
  ['A football player develops sudden pain and a tender right groin swelling. What is the next management step?', ['Needle aspiration', 'Forceful manual reduction', 'Laparotomy within 20 minutes', 'Preoperative preparation and groin exploration with hernia repair', 'Morphine and reevaluation in 12 hours'], 3],
  ['A 70-year-old woman has a tender irreducible mass below and lateral to the pubic tubercle with intestinal obstruction. What is the likeliest diagnosis?', ['Small-bowel carcinoma', 'Large-bowel carcinoma', 'Adhesions', 'Strangulated inguinal hernia', 'Strangulated femoral hernia'], 4],
  ['After nasogastric decompression and intravenous fluids for the preceding strangulated femoral hernia, what is the next step?', ['Sedation and spontaneous reduction', 'Schedule elective surgery', 'Sedation and manual reduction', 'Emergency surgery on the groin', 'Emergency laparotomy and repair from the peritoneal cavity'], 3],
  ['A 2-year-old child has a reducible umbilical hernia less than 2 cm in diameter. What is the best management?', ['Immediate mesh repair', 'Immediate repair without mesh', 'Laparoscopic mesh repair', 'Laparoscopic repair without mesh', 'Periodic observation and evaluation'], 4],
  ['A 55-year-old woman with recent weight loss presents with small-bowel obstruction and pain radiating down the medial thigh to the knee. What is the likely diagnosis?', ['Strangulated obturator hernia', 'Obstructing ileal neoplasm', 'Gallstone ileus', 'Strangulated femoral hernia', 'Pubic bone fracture'], 0],
  ['A 50-year-old man has a 1-cm tender mass between the xiphisternum and umbilicus. What is the most likely diagnosis?', ['Abdominal-wall fibrosarcoma', 'Omphalocele', 'Spigelian hernia', 'Fat necrosis', 'Epigastric hernia'], 4],
  ['A 70-year-old man has a large midline incisional hernia one year after colon resection. Which statement is true?', ['Repair with mesh can be performed laparoscopically', 'Strangulation is uncommon because the neck is narrow', 'Recurrence remains common despite modern mesh', 'Repair is simple under local anesthesia', 'Patients remain very uncomfortable after adequate repair'], 0],
  ['Severe burning pain radiates down the lateral thigh after laparoscopic preperitoneal inguinal hernia repair. Which nerve was most likely injured?', ['Ilioinguinal', 'Iliohypogastric', 'Genitofemoral', 'Femoral', 'Lateral femoral cutaneous'], 4],
  ['A male neonate is born with an omphalocele. Which feature distinguishes it from gastroschisis?', ['The protrusion is not covered by a sac', 'There is a defect in the abdominal musculature', 'The umbilicus is attached to the abdominal wall musculature', 'It is associated with partial or complete malrotation of bowel', 'It contains abdominal viscera'], 3],
  ['Which statement about a Spigelian hernia is true?', ['It occurs exclusively in men', 'It involves part of the bowel circumference', 'It is repaired by the classical Bassini technique', 'It occurs at the lateral edge of the linea semilunaris', 'It always contains the appendix'], 3],
  ['A 56-year-old asymptomatic man is scheduled for repair of a left indirect inguinal hernia. What should he have before surgery?', ['Rectal examination alone', 'Rectal examination and sigmoidoscopy', 'Barium enema', 'Colonoscopy', 'Intravenous pyelogram'], 1]
]

function buildLangeQuestions() {
  return langeHerniaQuestions.map(([question, choices, answerIndex], index) => ({
    id: `sur402-textbook-lange-hernia-q${String(index + 1).padStart(2, '0')}`,
    originalNumber: String(index + 1),
    category: 'Lange Hernia',
    organ: 'Hernia',
    sourcePage: 'PDF pages 25-31',
    question,
    choices,
    answerIndex,
    explanation: `Answer: ${choices[answerIndex]}. See the source explanation for Lange Hernia question ${index + 1}.`,
    source: 'Lange: Hernia, Chapter 8',
    section: 'Lange · Hernia',
    topicTags: ['SUR402-1', 'textbook', 'Hernia']
  }))
}

const markdown = await readFile(sourcePath, 'utf8')
const pretestQuestions = parsePretestQuestions(markdown)
const questions = [...pretestQuestions, ...buildLangeQuestions()]

if (pretestQuestions.length !== 48) throw new Error(`Expected 48 answer-safe PreTest questions, got ${pretestQuestions.length}`)
if (questions.length !== 69 || new Set(questions.map((question) => question.id)).size !== 69) {
  throw new Error('SUR402 textbook bank must contain exactly 69 unique answer-safe questions')
}

const groupDefinitions = [
  { id: 'breast', label: 'Breast', count: 21 },
  { id: 'thyroid-parathyroid', label: 'Thyroid & Parathyroid', count: 13 },
  { id: 'other-endocrine', label: 'Other Endocrine', count: 9 },
  { id: 'carcinoid', label: 'Carcinoid', count: 5 },
  { id: 'lange-hernia', label: 'Lange Hernia', count: 21 }
]

const sourceHash = createHash('sha256').update(markdown).digest('hex')
const generatedSource = `// Generated by scripts/build-sur402-textbook-mcqs.mjs.
// Source SHA-256: ${sourceHash}
// Included: 69 answer-safe single-best-answer questions. Image-dependent PreTest 242 and multi-answer Bailey pages are held.
(() => {
  const quizzes = window.mcqQuizzes402 || (window.mcqQuizzes402 = {})
  const quiz = quizzes["SUR 402-1 MCQs"] || (quizzes["SUR 402-1 MCQs"] = { alwaysShowSourcePicker: true, sources: [] })
  quiz.alwaysShowSourcePicker = true

  const source = {
    id: "sur402-textbook-pretest-lange",
    label: "Textbook MCQs - PreTest & Lange",
    description: "69 answer-safe questions · 5 topics · 5 short parts",
    shuffleQuestions: false,
    shuffleOptions: false,
    mcqs: ${JSON.stringify(questions, null, 2)}
  }

  const groupDefinitions = ${JSON.stringify(groupDefinitions, null, 2)}
  source.collection = {
    prompt: "Choose a textbook topic or a mixed revision mode.",
    groupNoun: "topic",
    groupEyebrow: "SUR402-1 textbooks",
    mixedMeta: "Random answer-safe questions from the PreTest and Lange textbook sections.",
    mixedSizes: [
      { id: "quick-20", label: "Quick 20", size: 20, description: "A short mixed textbook session." },
      { id: "standard-30", label: "Standard 30", size: 30, description: "Balanced textbook practice." },
      { id: "full-50", label: "Full 50", size: 50, description: "A longer mixed textbook session." }
    ],
    wrongReviewId: "sur402-textbook-wrong-review",
    groups: groupDefinitions.map((definition) => {
      const groupQuestions = source.mcqs.filter((question) => question.category === definition.label)
      return {
        id: definition.id,
        label: definition.label,
        questionCount: groupQuestions.length,
        parts: [{
          id: \`sur402-textbook-\${definition.id}-p01\`,
          label: \`Part 1 · Q1–\${groupQuestions.length}\`,
          description: \`\${definition.label} textbook questions\`,
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

for (const definition of groupDefinitions) {
  const actual = questions.filter((question) => question.category === definition.label).length
  if (actual !== definition.count) throw new Error(`${definition.label} count mismatch: expected ${definition.count}, got ${actual}`)
}

await Promise.all(targetPaths.map((targetPath) => writeFile(targetPath, generatedSource, 'utf8')))
console.log(`Generated ${questions.length} SUR402-1 textbook questions from the Markdown source.`)
