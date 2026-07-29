import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const canonicalDir = path.join(repoRoot, 'content', 'medical', 'med401-git')
const topicsDir = path.join(canonicalDir, 'topics')
const evidencePath = path.join(canonicalDir, 'evidence', 'mcq-evidence.json')
const manifestPath = path.join(canonicalDir, 'manifest.json')
const sourceExtractsDir = path.join(canonicalDir, 'source-extracts')
export const DEFAULT_ALSHAMEL_QUESTION_PATH = 'C:\\Users\\ahmed\\Downloads\\Telegram Desktop\\gastroenterology_mcqs_verified.json'
const questionPath = path.resolve(
  process.argv[2]
  || process.env.MED1_ALSHAMEL_SOURCE_PATH
  || DEFAULT_ALSHAMEL_QUESTION_PATH
)
const stableDate = '2026-07-29'
const sourceVersion = 'university-source-2026-07-29-v1'

const topicConfigs = {
  'Document (34).docx': {
    topicId: 'med401-git-liver-investigations',
    topicTitle: 'Liver Investigations & LFTs',
    sourceExtract: 'university-source-liver-investigations.json',
    sectionRoutes: {
      'Liver Function Tests (LFTs)': [1],
      'ALP & GGT': [1],
      'Synthetic Function': [2],
      Bilirubin: [2],
      'LFT Patterns': [2],
      'Vitamin K Test': [2],
      'Viral Serology': [2, 3],
      'Autoimmune Liver Disease': [3],
      'Metabolic Diseases': [3],
      Imaging: [3, 4],
      'Endoscopy & ERCP': [4],
      'Clinical Cases': [1, 2, 3, 4]
    }
  },
  'Liver and PortalHTN disease.docx': {
    topicId: 'med401-git-portal-hypertension-cirrhosis',
    topicTitle: 'Portal Hypertension & Cirrhosis',
    sectionIds: {
      'Portal Hypertension': 'med401-git-portal-definition',
      'Causes of Portal Hypertension': 'med401-git-portal-causes',
      HVPG: 'med401-git-portal-definition',
      'Clinical Features': 'med401-git-portal-workup',
      Investigation: 'med401-git-portal-workup',
      Management: 'med401-git-portal-management',
      Cirrhosis: 'med401-git-cirrhosis',
      Laboratory: 'med401-git-cirrhosis',
      Nutrition: 'med401-git-cirrhosis-management',
      'Liver Failure': 'med401-git-cirrhosis-management',
      'Clinical Cases': 'med401-git-portal-workup'
    },
    sectionRoutes: {
      'Portal Hypertension': [1, 2],
      'Causes of Portal Hypertension': [2],
      HVPG: [1, 3],
      'Clinical Features': [3],
      Investigation: [3],
      Management: [3, 4],
      Cirrhosis: [5, 6, 7, 8],
      Laboratory: [5, 7, 8],
      Nutrition: [4, 9, 10],
      'Liver Failure': [11, 12],
      'Clinical Cases': [1, 2, 3, 4, 5, 7, 8, 9, 11, 12]
    },
    passagePrefix: 'med401-git-portal-source-'
  },
  'Esophagus الكامل.docx': {
    topicId: 'med401-git-esophageal-diseases',
    topicTitle: 'Esophageal Diseases',
    sourceExtract: 'university-source-esophageal-diseases.json',
    sectionRoutes: {
      Anatomy: [1],
      'Anti-reflux Mechanism': [1],
      GERD: [1, 2, 3],
      'Alarm Symptoms': [2],
      'Barrett’s Esophagus': [4],
      'Peptic Stricture': [4],
      'Hiatus Hernia': [3, 4],
      'Eosinophilic Esophagitis': [4, 5],
      Achalasia: [5, 6, 7],
      'Clinical Cases': [1, 2, 3, 4, 5, 6, 7]
    }
  },
  'Acute viral hepatitis.docx': {
    topicId: 'med401-git-acute-hepatitis',
    topicTitle: 'Acute Hepatitis',
    sectionIds: {
      Definitions: 'med401-git-acute-terms',
      'Hepatitis Viruses': 'med401-git-acute-viruses',
      'Clinical Stages': 'med401-git-acute-course',
      'HBV Serology': 'med401-git-acute-markers',
      'Vaccination & Prevention': 'med401-git-acute-treatment',
      Complications: 'med401-git-acute-course',
      'High-Yield Facts': 'med401-git-acute-viruses',
      'HBV Serology Interpretation': 'med401-git-acute-markers',
      'Clinical Cases': 'med401-git-acute-course'
    },
    sectionRoutes: {
      Definitions: [1, 2],
      'Hepatitis Viruses': [2, 3, 4, 5, 6],
      'Clinical Stages': [7],
      'HBV Serology': [9],
      'Vaccination & Prevention': [10],
      Complications: [8],
      'High-Yield Facts': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      'HBV Serology Interpretation': [9],
      'Clinical Cases': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    },
    passagePrefix: 'med401-git-acute-source-'
  },
  'AIH الشامل.docx': {
    topicId: 'med401-git-autoimmune-hepatitis',
    topicTitle: 'Autoimmune Hepatitis',
    sectionIds: {
      Definition: 'med401-git-aih-definition',
      Epidemiology: 'med401-git-aih-definition',
      Pathogenesis: 'med401-git-aih-definition',
      'Type 1 AIH': 'med401-git-aih-types',
      'Type 2 AIH': 'med401-git-aih-types',
      'Type 3': 'med401-git-aih-types',
      'Associated Diseases': 'med401-git-aih-clinical',
      'Clinical Features': 'med401-git-aih-clinical',
      Laboratory: 'med401-git-aih-investigations',
      Histology: 'med401-git-aih-investigations',
      Treatment: 'med401-git-aih-treatment',
      'Indications for Treatment': 'med401-git-aih-treatment',
      Remission: 'med401-git-aih-treatment',
      'Steroid Side Effects': 'med401-git-aih-treatment',
      'Liver Transplant': 'med401-git-aih-treatment',
      'Clinical Cases': 'med401-git-aih-clinical'
    },
    sectionRoutes: {
      Definition: [1],
      Epidemiology: [1, 2],
      Pathogenesis: [1, 2],
      'Type 1 AIH': [1, 2],
      'Type 2 AIH': [1, 2],
      'Type 3': [3],
      'Associated Diseases': [4],
      'Clinical Features': [4],
      Laboratory: [5],
      Histology: [5],
      Treatment: [6, 7],
      'Indications for Treatment': [6],
      Remission: [6],
      'Steroid Side Effects': [6],
      'Liver Transplant': [6, 7],
      'Clinical Cases': [1, 2, 3, 4, 5, 6, 7]
    },
    passagePrefix: 'med401-git-aih-source-'
  },
  'Small intestines disease الشامل.docx': {
    topicId: 'med401-git-small-intestinal-diseases',
    topicTitle: 'Small Intestinal Diseases',
    sectionIds: {
      Malabsorption: 'med401-git-malabsorption',
      Diarrhea: 'med401-git-diarrhea-mechanisms',
      'Small vs Large Bowel Diarrhea': 'med401-git-diarrhea-approach',
      'Deficiency Clues': 'med401-git-malabsorption',
      'Absorption Sites': 'med401-git-malabsorption',
      'Celiac Disease': 'med401-git-celiac',
      'Tropical Sprue': 'med401-git-tropical-tumors',
      'Lactose Intolerance': 'med401-git-lymph-lactose',
      'Intestinal Lymphangiectasia': 'med401-git-lymph-lactose',
      'Protein-Losing Enteropathy': 'med401-git-lymph-lactose',
      'Whipple Disease': 'med401-git-whipple-sibo',
      SIBO: 'med401-git-whipple-sibo',
      'Intestinal Ischemia': 'med401-git-tropical-tumors',
      'Small Bowel Obstruction': 'med401-git-sbo',
      'Tumors & Polyposis': 'med401-git-tropical-tumors',
      'Clinical Cases': 'med401-git-malabsorption',
      'General Evaluation': 'med401-git-malabsorption-tests',
      'Blood Tests': 'med401-git-malabsorption-tests',
      'Stool Tests': 'med401-git-diarrhea-approach',
      'Fat Malabsorption': 'med401-git-malabsorption-tests',
      'D-Xylose Test': 'med401-git-malabsorption-tests',
      'Pancreatic Function Tests': 'med401-git-malabsorption-tests',
      'Capsule Endoscopy': 'med401-git-malabsorption-tests',
      Enteroscopy: 'med401-git-malabsorption-tests',
      'CT / MRI Enterography': 'med401-git-malabsorption-tests',
      'Schilling Test': 'med401-git-malabsorption-tests'
    },
    sectionRoutes: {
      Malabsorption: [4, 5, 6],
      Diarrhea: [1, 2, 3],
      'Small vs Large Bowel Diarrhea': [3],
      'Deficiency Clues': [6],
      'Absorption Sites': [4, 5, 6],
      'Celiac Disease': [9, 10, 11, 19],
      'Tropical Sprue': [18, 19],
      'Lactose Intolerance': [16],
      'Intestinal Lymphangiectasia': [9, 14, 15],
      'Protein-Losing Enteropathy': [9, 15],
      'Whipple Disease': [12, 13],
      SIBO: [14],
      'Intestinal Ischemia': [17, 18, 20, 21],
      'Small Bowel Obstruction': [17, 18],
      'Tumors & Polyposis': [20, 21, 22],
      'Clinical Cases': Array.from({ length: 22 }, (_, index) => index + 1),
      'General Evaluation': [3, 4, 5, 6, 7, 8, 14, 18, 19],
      'Blood Tests': [6, 9, 10, 15],
      'Stool Tests': [3, 6, 7, 8, 14],
      'Fat Malabsorption': [4, 5, 6, 7],
      'D-Xylose Test': [7],
      'Pancreatic Function Tests': [7, 8],
      'Capsule Endoscopy': [18, 19, 20, 21, 22],
      Enteroscopy: [18, 19, 20, 21, 22],
      'CT / MRI Enterography': [18, 19, 20, 21, 22],
      'Schilling Test': [4, 5, 6, 7]
    },
    passagePrefix: 'med401-git-small-source-'
  }
}

const replacements = [
  [/oesoph/g, 'esoph'],
  [/diarrhoea/g, 'diarrhea'],
  [/aetiolog/g, 'etiolog'],
  [/anaemia/g, 'anemia'],
  [/alkaline phosphatase/g, 'alp'],
  [/gamma glutamyl transferase/g, 'ggt'],
  [/alanine aminotransferase/g, 'alt'],
  [/aspartate aminotransferase/g, 'ast'],
  [/cardiac muscle/g, 'heart'],
  [/non alcoholic fatty liver disease/g, 'nafld'],
  [/hepatitis b/g, 'hbv'],
  [/hepatitis c/g, 'hcv'],
  [/hepatitis a/g, 'hav'],
  [/hepatitis e/g, 'hev'],
  [/anti lkm 1/g, 'lkm1'],
  [/anti lkm1/g, 'lkm1'],
  [/liver kidney microsome type 1/g, 'lkm1'],
  [/bile ducts/g, 'biliary'],
  [/bile duct/g, 'biliary'],
  [/cannot be used/g, 'unavailable impossible'],
  [/bicarbonate rich saliva/g, 'salivary bicarbonate'],
  [/para esophageal/g, 'paraesophageal'],
  [/progressing gradually/g, 'worsens gradually'],
  [/atopy/g, 'atopic'],
  [/pseudoachalasia/g, 'achalasia malignancy'],
  [/jejunal aspirate/g, 'jejunum aspiration'],
  [/stool fat detection/g, 'fecal fat determination'],
  [/small bowel mucosa/g, 'mucosal'],
  [/bounding pulse/g, 'hyperdynamic pulse'],
  [/fever usually decreases/g, 'fever drops'],
  [/duodenum near the ampulla/g, 'ampulla duodenum']
]
const stopWords = new Set('the a an of to in is are was were be been being for and or with by from as at on it its this that these those which what who whom where when why how following most best main primary only all above any both none true false statement statements feature features include includes included including indicated indicates considered regarding about patient patients disease diseases disorder disorders clinical case cases may can could would should occur occurs causes cause commonly characterized mainly rich intervention used near'.split(' '))

function normalizeForMatch(value = '') {
  let normalized = String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[–—→]/g, ' ')
    .replace(/[^a-z0-9%<>]+/g, ' ')
    .replace(/\ba and e\b/g, 'hav hev')
    .replace(/([0-9<>])([a-z])/g, '$1 $2')
  replacements.forEach(([pattern, replacement]) => {
    normalized = normalized.replace(pattern, replacement)
  })
  return normalized.trim()
}

function stemToken(token) {
  return token.length > 4 ? token.replace(/(?:ies|ing|ed|es|s)$/, '') : token
}

function tokens(value) {
  return [...new Set(
    normalizeForMatch(value)
      .split(/\s+/)
      .map(stemToken)
      .filter((token) => token.length > 1 && !stopWords.has(token))
  )]
}

function tokenCoverage(required, available) {
  if (required.length === 0) return 0
  const availableSet = new Set(available)
  return required.filter((token) => availableSet.has(token)).length / required.length
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function slugify(value) {
  return normalizeForMatch(value).replace(/\s+/g, '-').replace(/^-|-$/g, '')
}

function splitSourceBlocks(text) {
  return String(text)
    .replace(/\s+/g, ' ')
    .split(/\s*[•●]\s*|(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => ({ type: 'paragraph', text: item }))
}

function buildExtractedTopic(config, sourceExtract) {
  const passages = sourceExtract.pages.map((page) => {
    const blocks = splitSourceBlocks(page.text)
    const text = blocks.map((block) => block.text).join('\n')
    return {
      id: `${config.topicId}-source-${page.order}`,
      order: page.order,
      title: `University Source · Passage ${page.order}`,
      text,
      blocks,
      provenance: {
        label: 'University Source',
        sourceOrder: page.order,
        sourceSha256: sourceExtract.sourceSha256
      },
      sourceHash: sha256(text)
    }
  })

  const sections = Object.entries(config.sectionRoutes).map(([title, route], index) => {
    const contentHtml = `<p>Verified evidence is available in ${route.length === 1 ? 'the linked University Source passage' : 'the linked University Source passages'} below.</p>`
    return {
      id: `${config.topicId}-${slugify(title)}`,
      topicId: config.topicId,
      title,
      category: 'University Source',
      keywords: tokens(title),
      contentHtml,
      contentHash: sha256(contentHtml),
      order: index + 1
    }
  })

  return {
    id: config.topicId,
    subjectId: 'med401-git',
    title: config.topicTitle,
    aliases: [],
    sectionIds: sections.map((section) => section.id),
    sections,
    passages,
    sourceVersion,
    status: 'published'
  }
}

function getPassageId(config, pageNumber) {
  return config.passagePrefix
    ? `${config.passagePrefix}${pageNumber}`
    : `${config.topicId}-source-${pageNumber}`
}

function getSectionId(config, sectionTitle) {
  return config.sectionIds?.[sectionTitle] || `${config.topicId}-${slugify(sectionTitle)}`
}

function getReferenceParts(question, answerIndex) {
  const answer = String(question.choices[answerIndex] || '')
  const normalizedAnswer = normalizeForMatch(answer)
  if (/none|false/.test(normalizedAnswer)) return null
  if (normalizedAnswer === 'both' || /(?:all|any) (?:of )?(?:the )?above|all are|all mentioned|all options/.test(normalizedAnswer)) {
    return question.choices.slice(0, answerIndex)
  }

  const paired = normalizedAnswer.match(/both ([a-e]) (?:and )?([a-e])/)
  if (paired) {
    return [
      question.choices[paired[1].charCodeAt(0) - 97],
      question.choices[paired[2].charCodeAt(0) - 97]
    ]
  }
  if (normalizedAnswer === 'true') return [question.question]
  return [answer]
}

function collectPassageChunks(topic, passageIds) {
  return topic.passages
    .filter((passage) => passageIds.includes(passage.id))
    .flatMap((passage) => {
      const blocks = Array.isArray(passage.blocks) && passage.blocks.length
        ? passage.blocks
        : [{ type: 'paragraph', text: passage.text }]
      return blocks.flatMap((block) => {
        if (block.type === 'list') {
          return (block.items || []).map((text) => ({ passageId: passage.id, text }))
        }
        return block.text ? [{ passageId: passage.id, text: block.text }] : []
      })
    })
}

function findSupportingChunk(part, question, chunks, topicTitle) {
  const answerTokens = tokens(part)
  const questionTokens = tokens(question.question)
  const passageGroups = new Map()

  chunks.forEach((chunk) => {
    if (!passageGroups.has(chunk.passageId)) passageGroups.set(chunk.passageId, [])
    passageGroups.get(chunk.passageId).push(chunk)
  })

  let bestPassage = null
  passageGroups.forEach((passageChunks, passageId) => {
    const passageText = passageChunks.map((chunk) => chunk.text).join(' ')
    const passageTokens = tokens(`${topicTitle} ${passageText}`)
    const answerCoverage = tokenCoverage(answerTokens, passageTokens)
    const questionCoverage = tokenCoverage(questionTokens, passageTokens)
    const exactPhrase = normalizeForMatch(`${topicTitle} ${passageText}`).includes(normalizeForMatch(part))
    const score = answerCoverage * 8 + questionCoverage * 2 + (exactPhrase ? 3 : 0)
    if (!bestPassage || score > bestPassage.score) {
      bestPassage = { passageId, passageChunks, answerCoverage, questionCoverage, exactPhrase, score }
    }
  })

  if (!bestPassage) return null
  const minimumCoverage = answerTokens.length <= 2 ? 0.5 : 0.5
  if (!bestPassage.exactPhrase && bestPassage.answerCoverage < minimumCoverage) return null

  let bestChunk = null
  bestPassage.passageChunks.forEach((chunk) => {
    const chunkTokens = tokens(chunk.text)
    const answerCoverage = tokenCoverage(answerTokens, chunkTokens)
    const questionCoverage = tokenCoverage(questionTokens, chunkTokens)
    const exactPhrase = normalizeForMatch(chunk.text).includes(normalizeForMatch(part))
    const score = answerCoverage * 8 + questionCoverage * 2 + (exactPhrase ? 3 : 0)
    if (!bestChunk || score > bestChunk.score) {
      bestChunk = { ...chunk, answerCoverage, questionCoverage, exactPhrase, score }
    }
  })

  return {
    ...bestChunk,
    passageId: bestPassage.passageId,
    answerCoverage: bestPassage.answerCoverage,
    questionCoverage: bestPassage.questionCoverage,
    exactPhrase: bestPassage.exactPhrase,
    score: bestPassage.score
  }
}

function isUnsupportedNegative(question) {
  return /\b(?:except|not|false|incorrect)\b/i.test(question.question)
}

function answerIndexFor(question) {
  const letter = String(question.correctAnswer || '').trim().toUpperCase()
  if (!/^[A-E]$/.test(letter)) return -1
  const index = letter.charCodeAt(0) - 65
  return index < question.choices.length ? index : -1
}

export function buildAlshamelEvidence() {
  const sourceData = JSON.parse(fs.readFileSync(questionPath, 'utf8'))
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const topics = new Map(
    fs.readdirSync(topicsDir)
      .filter((file) => file.endsWith('.json'))
      .sort()
      .map((file) => {
        const topic = JSON.parse(fs.readFileSync(path.join(topicsDir, file), 'utf8'))
        return [topic.id, topic]
      })
  )

  Object.values(topicConfigs).forEach((config) => {
    if (!config.sourceExtract) return
    const sourceExtract = JSON.parse(fs.readFileSync(path.join(sourceExtractsDir, config.sourceExtract), 'utf8'))
    if (sourceExtract.label !== 'University Source') {
      throw new Error(`${config.sourceExtract} must use the student-facing University Source label`)
    }
    const topic = buildExtractedTopic(config, sourceExtract)
    topics.set(topic.id, topic)
    fs.writeFileSync(path.join(topicsDir, `${topic.id}.json`), `${JSON.stringify(topic, null, 2)}\n`, 'utf8')
  })

  const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'))
  const preservedRecords = (evidence.records || [])
    .filter((record) => !String(record.questionId || '').startsWith('med1-alshamel-'))
    .map((record) => ({
      ...record,
      subjectTitle: 'University Source',
      sourceVersion
    }))
  const records = []
  const unsupported = []
  const supportedByDocument = {}

  sourceData.questions.forEach((question, sourceIndex) => {
    const originalNumber = sourceIndex + 1
    const choices = Array.isArray(question.choices) ? question.choices : []
    const answerIndex = answerIndexFor({ ...question, choices })
    if (!question.question || choices.length < 2 || answerIndex < 0) return

    const config = topicConfigs[question.sourceDocument]
    if (!config) throw new Error(`No source configuration for question ${originalNumber}`)
    const topic = topics.get(config.topicId)
    const route = config.sectionRoutes[question.section]
    if (!topic || !route?.length) {
      unsupported.push({ questionId: `med1-alshamel-q${String(originalNumber).padStart(3, '0')}`, reason: 'No exact section route' })
      return
    }

    if (isUnsupportedNegative(question)) {
      unsupported.push({ questionId: `med1-alshamel-q${String(originalNumber).padStart(3, '0')}`, reason: 'Negative answer cannot be proven safely from a positive source passage' })
      return
    }

    const referenceParts = getReferenceParts(question, answerIndex)
    if (!referenceParts?.length) {
      unsupported.push({ questionId: `med1-alshamel-q${String(originalNumber).padStart(3, '0')}`, reason: 'Answer is not directly source-provable' })
      return
    }

    const passageIds = route.map((pageNumber) => getPassageId(config, pageNumber))
    const chunks = collectPassageChunks(topic, passageIds)
    const matches = referenceParts.map((part) => findSupportingChunk(part, question, chunks, topic.title))
    if (matches.some((match) => !match)) {
      unsupported.push({ questionId: `med1-alshamel-q${String(originalNumber).padStart(3, '0')}`, reason: 'Exact supporting text was not found' })
      return
    }

    matches.sort((a, b) => b.score - a.score)
    const citedPassageIds = [...new Set(matches.map((match) => match.passageId))]
    const sectionId = getSectionId(config, question.section)
    const section = topic.sections.find((item) => item.id === sectionId)
    if (!section) throw new Error(`Mapped section ${sectionId} does not exist`)

    const questionId = `med1-alshamel-q${String(originalNumber).padStart(3, '0')}`
    records.push({
      questionId,
      reviewStatus: 'verified',
      topicId: topic.id,
      sectionId,
      passageIds: citedPassageIds,
      highlightText: matches[0].text,
      sourceVersion,
      subjectTitle: 'University Source',
      topicTitle: topic.title,
      sectionTitle: section.title
    })
    supportedByDocument[config.topicTitle] = (supportedByDocument[config.topicTitle] || 0) + 1
  })

  evidence.version = sourceVersion
  evidence.updatedAt = stableDate
  evidence.records = [...preservedRecords, ...records].sort((a, b) => a.questionId.localeCompare(b.questionId))
  evidence.unsupportedAlshamel = unsupported
  fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8')

  const topicList = [...topics.values()].sort((a, b) => a.id.localeCompare(b.id))
  const sectionCount = topicList.reduce((total, topic) => total + topic.sections.length, 0)
  const passageCount = topicList.reduce((total, topic) => total + topic.passages.length, 0)
  manifest.title = 'University Source'
  manifest.sourceVersion = sourceVersion
  manifest.topics = topicList.map((topic) => ({
    id: topic.id,
    title: topic.title,
    sectionCount: topic.sections.length,
    passageCount: topic.passages.length
  }))
  manifest.provenance.topicCount = topicList.length
  manifest.provenance.sectionCount = sectionCount
  manifest.provenance.passageCount = passageCount
  manifest.provenance.alshamelQuestionHash = sha256(fs.readFileSync(questionPath))
  manifest.provenance.alshamelSupportedCount = records.length
  manifest.provenance.alshamelUnsupportedCount = unsupported.length
  manifest.provenance.studentFacingSourceLabel = 'University Source'
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

  const result = {
    runnableQuestions: records.length + unsupported.length,
    supported: records.length,
    unsupported: unsupported.length,
    supportedByDocument,
    topics: topicList.length,
    sections: sectionCount,
    passages: passageCount
  }
  console.log(JSON.stringify(result, null, 2))
  return result
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildAlshamelEvidence()
}
