/**
 * MUST 401/402 regression contract
 *
 * Purpose: characterise the current MUST 401 and 402 implementation closely
 * enough that a later data-module refactor cannot silently change:
 *
 *   - MUST section order (401 before 402)
 *   - Ordered 401 subject codes: SUR-1, SUR-2, MED-1, MED-2, ONC, NUT, LAB, ANAE
 *   - Ordered 402 subject codes: SUR402-1, SUR402-2, MED402-1, MED402-2, GYNA402, PED402, RAD402
 *   - Section titles, news titles, schedules, semester timelines, schedule locations
 *   - Subject/topic labels, progressAliases, mcqTopicKey values, resource URLs
 *   - MCQ registry mapping (401 → window.mcqQuizzes, 402 → window.mcqQuizzes402)
 *   - URL and selection behaviour for ?university=must&section=<class>
 *   - Representative 401 and 402 assignments
 *   - Topic and quiz storage keys scoped by owner, university, and section
 *   - Legacy 401/402 local-progress migration behaviour
 *   - Source/public mirror integrity
 *
 * This file is tests-only. No production code is modified.
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const readBytes = (path) => readFileSync(new URL(`../${path}`, import.meta.url))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract an array literal assigned to a named const/let from a JS source
 * string, by grabbing the text between the first `[` after `const <name> = `
 * and its matching `]`.  Returns the raw string of the bracketed body so
 * callers can run their own assertions.
 */
function extractArrayBody(src, name) {
  const prefix = new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*\\[`)
  const match = prefix.exec(src)
  assert.ok(match, `Could not locate '${name}' array declaration in source`)
  let depth = 1
  let index = match.index + match[0].length
  while (index < src.length && depth > 0) {
    if (src[index] === '[') depth += 1
    else if (src[index] === ']') depth -= 1
    index += 1
  }
  return src.slice(match.index + match[0].length, index - 1)
}

/**
 * Pull every quoted `code:` value from a subjects array body in the order
 * they appear.
 */
function extractSubjectCodes(arrayBody) {
  return Array.from(arrayBody.matchAll(/code:\s*['"]([^'"]+)['"]/g), (m) => m[1])
}

// ---------------------------------------------------------------------------
// 1. Section order: MUST university exposes exactly ['401', '402'] in that order
// ---------------------------------------------------------------------------

test('MUST university section order is 401 then 402', () => {
  const src = read('src/main.js')

  // The universities object must declare must.sections as ['401', '402']
  assert.match(
    src,
    /must:\s*\{[^}]*sections:\s*\[\s*'401'\s*,\s*'402'\s*\]/s,
    "universities.must.sections must be ['401', '402'] in that order"
  )

  // academicSectionsByUniversity.must must have '401' defined before '402'
  const mustBlock = src.match(/academicSectionsByUniversity\s*=\s*\{[\s\S]*?must:\s*\{([\s\S]*?)\},\s*o6u:/)?.[1] || ''
  assert.ok(mustBlock, 'Could not extract academicSectionsByUniversity.must block')
  const pos401 = mustBlock.indexOf("'401'")
  const pos402 = mustBlock.indexOf("'402'")
  assert.ok(pos401 >= 0 && pos402 >= 0, "Both '401' and '402' must appear in academicSectionsByUniversity.must")
  assert.ok(pos401 < pos402, "'401' section must be declared before '402' in academicSectionsByUniversity.must")
})

// ---------------------------------------------------------------------------
// 2. Ordered 401 subject codes
// ---------------------------------------------------------------------------

test('MUST 401 subjects array contains exactly the expected codes in order', () => {
  const src = read('src/main.js')

  // subjects401 is assigned from `subjects` at the point it is populated
  // Verify by extracting `subjects` (which feeds subjects401) up to the 402 declaration
  const subjectsSrc = src.slice(0, src.indexOf('const subjects401 = subjects'))
  const subjectsBody = extractArrayBody(subjectsSrc, 'subjects')
  const codes = extractSubjectCodes(subjectsBody)

  assert.deepEqual(
    codes,
    ['SUR-1', 'SUR-2', 'MED-1', 'MED-2', 'ONC', 'NUT', 'LAB', 'ANAE'],
    'MUST 401 subject codes must be exactly SUR-1, SUR-2, MED-1, MED-2, ONC, NUT, LAB, ANAE in that order'
  )
})

// ---------------------------------------------------------------------------
// 3. Ordered 402 subject codes
// ---------------------------------------------------------------------------

test('MUST 402 subjects array contains exactly the expected codes in order', () => {
  const src = read('src/main.js')
  const body402 = extractArrayBody(src.slice(src.indexOf('const subjects402 = [')), 'subjects402')
  const codes = extractSubjectCodes(body402)

  assert.deepEqual(
    codes,
    ['SUR402-1', 'SUR402-2', 'MED402-1', 'MED402-2', 'GYNA402', 'PED402', 'RAD402'],
    'MUST 402 subject codes must be exactly SUR402-1, SUR402-2, MED402-1, MED402-2, GYNA402, PED402, RAD402 in that order'
  )
})

// ---------------------------------------------------------------------------
// 4. Section metadata: titles, news titles, schedules, semester timelines,
//    schedule locations
// ---------------------------------------------------------------------------

test('MUST 401 section metadata is unchanged', () => {
  const src = read('src/main.js')

  // Title and newsTitle
  assert.match(src, /id:\s*'401'[\s\S]{0,200}title:\s*'401'/,
    "Section 401 must have title '401'")
  assert.match(src, /newsTitle:\s*'MED 401 news'/,
    "Section 401 newsTitle must be 'MED 401 news'")

  // Semester timeline
  assert.match(src, /'401':[\s\S]{0,600}semesterTimeline:\s*\{[\s\S]{0,80}start:\s*'2026-05-25'[\s\S]{0,80}finals:\s*'2026-09-19'/s,
    'Section 401 semesterTimeline must have start 2026-05-25 and finals 2026-09-19')

  // Schedule location
  assert.match(src, /scheduleLocation:\s*'Lectures: SS 116B - Clinical rounds: Hospital, fourth floor'/,
    "Section 401 scheduleLocation must be 'Lectures: SS 116B - Clinical rounds: Hospital, fourth floor'")

  // courseSchedule must have at least one lecture in SS 116B on Sunday
  assert.match(src, /type:\s*'lecture'[\s\S]{0,120}dayLabel:\s*'Sunday'[\s\S]{0,120}room:\s*'SS 116B'/s,
    'Section 401 courseSchedule must contain a Sunday lecture in SS 116B')
})

test('MUST 402 section metadata is unchanged', () => {
  const src = read('src/main.js')

  assert.match(src, /id:\s*'402'[\s\S]{0,200}title:\s*'402'/,
    "Section 402 must have title '402'")
  assert.match(src, /newsTitle:\s*'MED 402 news'/,
    "Section 402 newsTitle must be 'MED 402 news'")

  // Semester timeline (same dates as 401)
  assert.match(src, /'402':[\s\S]{0,600}semesterTimeline:\s*\{[\s\S]{0,80}start:\s*'2026-05-25'[\s\S]{0,80}finals:\s*'2026-09-19'/s,
    'Section 402 semesterTimeline must have start 2026-05-25 and finals 2026-09-19')

  // scheduleLocation is empty string for 402
  assert.match(src, /'402':[\s\S]{0,800}scheduleLocation:\s*''/s,
    "Section 402 scheduleLocation must be empty string ''")
})

// ---------------------------------------------------------------------------
// 5. Midterm exam schedules
// ---------------------------------------------------------------------------

test('MUST 401 midterm exam schedule entries are unchanged', () => {
  const src = read('src/main.js')

  // SUR 401-1 – Wed Jul 22, 2026, 2:30-3:30
  assert.match(src,
    /code:\s*'SUR 401-1'[\s\S]{0,200}subjectCode:\s*'SUR-1'[\s\S]{0,200}date:\s*'2026-07-22'[\s\S]{0,200}time:\s*'2:30-3:30'/s,
    'SUR 401-1 midterm exam entry must be present with date 2026-07-22 and time 2:30-3:30')

  // MED 401-2 – Sat Jul 25, 2026, 2:30-3:30
  assert.match(src,
    /code:\s*'MED 401-2'[\s\S]{0,200}subjectCode:\s*'MED-2'[\s\S]{0,200}date:\s*'2026-07-25'[\s\S]{0,200}time:\s*'2:30-3:30'/s,
    'MED 401-2 midterm exam entry must be present with date 2026-07-25 and time 2:30-3:30')

  // MED 401-1 – Wed Jul 29, 2026, 2:30-3:30
  assert.match(src,
    /code:\s*'MED 401-1'[\s\S]{0,200}subjectCode:\s*'MED-1'[\s\S]{0,200}date:\s*'2026-07-29'[\s\S]{0,200}time:\s*'2:30-3:30'/s,
    'MED 401-1 midterm exam entry must be present with date 2026-07-29 and time 2:30-3:30')
})

test('MUST 402 midterm exam schedule entries are unchanged', () => {
  const src = read('src/main.js')

  // SUR 402-1 – Wed Jul 22, 2026, 11:30-12:30
  assert.match(src,
    /code:\s*'SUR 402-1'[\s\S]{0,200}subjectCode:\s*'SUR402-1'[\s\S]{0,200}date:\s*'2026-07-22'[\s\S]{0,200}time:\s*'11:30-12:30'/s,
    'SUR 402-1 midterm exam entry must be present with date 2026-07-22 and time 11:30-12:30')

  // MED 402-1 – Sat Jul 25, 2026, 11:30-12:30
  assert.match(src,
    /code:\s*'MED 402-1'[\s\S]{0,200}subjectCode:\s*'MED402-1'[\s\S]{0,200}date:\s*'2026-07-25'[\s\S]{0,200}time:\s*'11:30-12:30'/s,
    'MED 402-1 midterm exam entry must be present with date 2026-07-25 and time 11:30-12:30')

  // MED 402-2 – Wed Jul 29, 2026, 11:30-12:30
  assert.match(src,
    /code:\s*'MED 402-2'[\s\S]{0,200}subjectCode:\s*'MED402-2'[\s\S]{0,200}date:\s*'2026-07-29'[\s\S]{0,200}time:\s*'11:30-12:30'/s,
    'MED 402-2 midterm exam entry must be present with date 2026-07-29 and time 11:30-12:30')

  // GYN 402 – Sat Aug 1, 2026, 11:30-12:30
  assert.match(src,
    /code:\s*'GYN 402'[\s\S]{0,200}subjectCode:\s*'GYNA402'[\s\S]{0,200}date:\s*'2026-08-01'[\s\S]{0,200}time:\s*'11:30-12:30'/s,
    'GYN 402 midterm exam entry must be present with date 2026-08-01 and time 11:30-12:30')
})

// ---------------------------------------------------------------------------
// 6. Subject names
// ---------------------------------------------------------------------------

test('MUST 401 subject names are unchanged', () => {
  const src = read('src/main.js')
  const expectedNames = {
    'SUR-1': 'Surgery 1',
    'SUR-2': 'Surgery 2',
    'MED-1': 'Internal Medicine 1',
    'MED-2': 'Internal Medicine 2',
    'ONC': 'Oncology',
    'NUT': 'Nutrition',
    'LAB': 'Lab Medicine',
    'ANAE': 'Anesthesia'
  }
  for (const [code, name] of Object.entries(expectedNames)) {
    assert.match(
      src,
      new RegExp(`code:\\s*'${code}'[\\s\\S]{0,60}name:\\s*'${name.replace(/[()]/g, '\\$&')}'`),
      `Subject ${code} must have name '${name}'`
    )
  }
})

test('MUST 402 subject names are unchanged', () => {
  const src = read('src/main.js')
  const expectedNames = {
    'SUR402-1': 'Surgery 402-1',
    'SUR402-2': 'Surgery 402-2',
    'MED402-1': 'Medicine 402-1',
    'MED402-2': 'Medicine 402-2',
    'GYNA402': 'Gynecology & Obstetrics 402',
    'PED402': 'Pediatrics 402',
    'RAD402': 'Radiology 402'
  }
  for (const [code, name] of Object.entries(expectedNames)) {
    const escapedName = name.replace(/[&()/]/g, '\\$&')
    assert.match(
      src,
      new RegExp(`code:\\s*'${code}'[\\s\\S]{0,60}name:\\s*'${escapedName}'`),
      `Subject ${code} must have name '${name}'`
    )
  }
})

// ---------------------------------------------------------------------------
// 7. Representative topic labels and progressAliases (401)
// ---------------------------------------------------------------------------

test('SUR-1 representative topic labels and progressAliases are unchanged', () => {
  const src = read('src/main.js')

  // Liver topic must be present with its four progressAliases
  assert.match(src, /label:\s*'Liver'/, "SUR-1 must have a 'Liver' topic")
  assert.match(
    src,
    /progressAliases:\s*\[\s*'Liver Introduction'\s*,\s*'Liver Trauma and Infections'\s*,\s*'Liver Tumors'\s*,\s*'Cirrhosis, portal hypertension and hepatic vascular disease'\s*\]/,
    'SUR-1 Liver topic progressAliases must be unchanged'
  )

  // Stomach topic with its progressAliases
  assert.match(src, /label:\s*'Stomach'/, "SUR-1 must have a 'Stomach' topic")
  assert.match(
    src,
    /progressAliases:\s*\[\s*'Stomach anatomy, physiology, histology and peptic ulcers'\s*\]/,
    'SUR-1 Stomach topic progressAliases must be unchanged'
  )

  // Esophagus topics
  assert.match(src, /label:\s*'Esophagus topics'/, "SUR-1 must have an 'Esophagus topics' topic")

  // Spleen – has mcqTopicKey (it's a top-level topic property, not inside driveSelector)
  assert.match(src,
    /mcqTopicKey:\s*'Spleen'/,
    "SUR-1 Spleen topic must have mcqTopicKey 'Spleen'")
})

test('SUR-1 Stomach topic mcqTopicKey is unchanged', () => {
  const src = read('src/main.js')
  // The Stomach topic's progressAliases and mcqTopicKey share the same value;
  // match on progressAliases first, then mcqTopicKey nearby (they appear on consecutive lines)
  assert.match(
    src,
    /progressAliases:\s*\['Stomach anatomy, physiology, histology and peptic ulcers'\][\s\S]{0,80}mcqTopicKey:\s*'Stomach anatomy, physiology, histology and peptic ulcers'/s,
    "SUR-1 Stomach topic mcqTopicKey must be 'Stomach anatomy, physiology, histology and peptic ulcers'"
  )
})

// ---------------------------------------------------------------------------
// 8. Representative mcqTopicKey values (402)
// ---------------------------------------------------------------------------

test('MUST 402 mcqTopicKey values follow the 402::<code>::<topic> pattern', () => {
  const src = read('src/main.js')

  // A representative set of 402 mcqTopicKey entries that must not change format
  const expectedKeys = [
    "402::SUR402-1::Thyroid",
    "402::SUR402-1::Parathyroid",
    "402::SUR402-1::Breast Fibroadenoma",
    "402::SUR402-1::Breast tumor cancer",
    "402::SUR402-1::Hernia",
    "402::SUR402-2::Head trauma",
    "402::SUR402-2::Disc prolapse",
    "402::MED402-1::Acromegaly",
    "402::MED402-1::DM DKA",
    "402::MED402-2::Hemiplegia",
    "402::MED402-2::Mood disorders",
    "402::GYNA402::Menstrual cycle",
    "402::GYNA402::Abortion",
    "402::PED402::Growth Development",
    "402::PED402::Nutrition",
    "402::RAD402::Breast imaging",
    "402::RAD402::Nuclear Medicine"
  ]

  for (const key of expectedKeys) {
    assert.match(
      src,
      new RegExp(`mcqTopicKey:\\s*'${key.replace(/[.+?^${}()|[\]\\]/g, '\\$&')}'`),
      `mcqTopicKey '${key}' must be present in main.js`
    )
  }
})

// ---------------------------------------------------------------------------
// 9. Representative resource URLs (401)
// ---------------------------------------------------------------------------

test('SUR-1 representative resource URLs are present', () => {
  const src = read('src/main.js')

  // Liver Introduction Drive URL
  assert.match(
    src,
    /https:\/\/docs\.google\.com\/presentation\/d\/12BIYR9r2h_fwkUQpXQI0xOyPy-lSI9D_/,
    'SUR-1 Liver Introduction presentation URL must be present'
  )

  // Spleen lecture slides
  assert.match(
    src,
    /https:\/\/docs\.google\.com\/presentation\/d\/1GfFE2goGP1WRw5D14YqQHW9ptEuJkBMz/,
    'SUR-1 Spleen lecture slides URL must be present'
  )
})

test('SUR402-1 representative resource URLs are present', () => {
  const src = read('src/main.js')

  // Thyroid 2026 presentation
  assert.match(
    src,
    /https:\/\/docs\.google\.com\/presentation\/d\/1fpmXmkNcEH_HBg8n-R3eD0-9wp_D4er7/,
    'SUR402-1 Thyroid 2026 presentation URL must be present'
  )

  // Parathyroid presentation
  assert.match(
    src,
    /https:\/\/docs\.google\.com\/presentation\/d\/1LlqKUnMnJXLDfb2oOlhxP6HLi3Qm0p7o/,
    'SUR402-1 Parathyroid presentation URL must be present'
  )
})

// ---------------------------------------------------------------------------
// 10. MCQ registry mapping: 401 uses window.mcqQuizzes, 402 uses window.mcqQuizzes402
// ---------------------------------------------------------------------------

test('MCQ registry mapping wires 401 to window.mcqQuizzes and 402 to window.mcqQuizzes402', () => {
  const src = read('src/main.js')

  // The mcqQuizzesByUniversity object must assign must['401'] from window.mcqQuizzes
  // and must['402'] from window.mcqQuizzes402
  assert.match(
    src,
    /mcqQuizzesByUniversity\s*=\s*\{[\s\S]{0,60}must:\s*\{[\s\S]{0,60}'401':\s*window\.mcqQuizzes\s*\|\|\s*\{\}[\s\S]{0,60}'402':\s*window\.mcqQuizzes402\s*\|\|\s*\{\}/s,
    "mcqQuizzesByUniversity.must must map '401' to window.mcqQuizzes and '402' to window.mcqQuizzes402"
  )
})

test('401 MCQ banks write to window.mcqQuizzes', () => {
  // Spot-check: sur1-kellawi-mcqs.js (a 401 bank) must target window.mcqQuizzes
  const sur1Kellawi = read('src/sur1-kellawi-mcqs.js')
  assert.match(sur1Kellawi, /window\.mcqQuizzes\b/, 'sur1-kellawi-mcqs.js must write to window.mcqQuizzes')
  assert.doesNotMatch(sur1Kellawi, /window\.mcqQuizzes402\b/, 'sur1-kellawi-mcqs.js must NOT write to window.mcqQuizzes402')

  // med2-cardio-chest-mcqs.js is also a 401 bank
  const med2 = read('src/med2-cardio-chest-mcqs.js')
  assert.match(med2, /window\.mcqQuizzes\b/, 'med2-cardio-chest-mcqs.js must write to window.mcqQuizzes')
  assert.doesNotMatch(med2, /window\.mcqQuizzes402\b/, 'med2-cardio-chest-mcqs.js must NOT write to window.mcqQuizzes402')
})

test('402 MCQ banks write to window.mcqQuizzes402', () => {
  // sur402-past-exam-mcqs.js is a 402 bank
  const sur402 = read('src/sur402-past-exam-mcqs.js')
  assert.match(sur402, /window\.mcqQuizzes402\b/, 'sur402-past-exam-mcqs.js must write to window.mcqQuizzes402')
  assert.doesNotMatch(sur402, /(?<!\d02\b)window\.mcqQuizzes(?!402)\b/, 'sur402-past-exam-mcqs.js must NOT write to window.mcqQuizzes (without 402)')

  // med402-endocrine-mcqs.js is a 402 bank
  const med402Endo = read('src/med402-endocrine-mcqs.js')
  assert.match(med402Endo, /window\.mcqQuizzes402\b/, 'med402-endocrine-mcqs.js must write to window.mcqQuizzes402')
})

test('getMcqQuizzesForSection routes 401 to mcqQuizzes and 402 to mcqQuizzes402', () => {
  const src = read('src/main.js')

  // The function must reference the mcqQuizzesByUniversity lookup (not hardcode the registry)
  assert.match(
    src,
    /function getMcqQuizzesForSection\s*\([^)]*\)[\s\S]{0,200}mcqQuizzesByUniversity\[universityId\]/s,
    'getMcqQuizzesForSection must look up mcqQuizzesByUniversity by universityId'
  )
  assert.match(
    src,
    /getMcqQuizzesForSection\(\)/,
    'getMcqQuizzesForSection() must be called somewhere in main.js'
  )
})

// ---------------------------------------------------------------------------
// 11. URL and selection behaviour: ?university=must&section=<class>
// ---------------------------------------------------------------------------

test('URL parameter handling infers must university from section 401 or 402', () => {
  const src = read('src/main.js')

  // When selected_section is '401' or '402' and selected_university is missing,
  // the code infers 'must' as the university
  assert.match(
    src,
    /selectedSection === '401' \|\| selectedSection === '402' \? 'must' : ''/,
    "Section '401' or '402' without a university must infer 'must'"
  )
})

test('URL and selection fallback defaults to must university', () => {
  const src = read('src/main.js')

  // When the requested university is not recognised, the fallback is 'must'
  assert.match(
    src,
    /isSavedUniversity\(requestedUniversity\) \? requestedUniversity : 'must'/,
    "Fallback university must be 'must'"
  )

  // The initial activeUniversityId must be 'must'
  assert.match(
    src,
    /let activeUniversityId = 'must'/,
    "activeUniversityId must initialise to 'must'"
  )

  // The initial activeAcademicSection must be '401'
  assert.match(
    src,
    /let activeAcademicSection = '401'/,
    "activeAcademicSection must initialise to '401'"
  )
})

test('index.html exposes data-auth-section buttons for 401 and 402', () => {
  const html = read('index.html')
  assert.match(html, /data-auth-section="401"/, 'index.html must have data-auth-section="401"')
  assert.match(html, /data-auth-section="402"/, 'index.html must have data-auth-section="402"')
})

// ---------------------------------------------------------------------------
// 12. Representative assignments (401 and 402)
// ---------------------------------------------------------------------------

test('MUST 401 representative assignments are present in index.html', () => {
  const html = read('index.html')

  // SUR401-1 news / schedule card
  assert.match(
    html,
    /data-course="SUR401-1"/,
    'index.html must have a SUR401-1 data-course assignment card'
  )

  // SUR401-2 news card
  assert.match(
    html,
    /data-course="SUR401-2"/,
    'index.html must have a SUR401-2 data-course card'
  )

  // Assignment progress bars with the semester start/due dates
  assert.match(
    html,
    /data-assignment-progress[^>]*data-start-date="2026-06-06"[^>]*data-due-date="2026-09-05"/,
    'A data-assignment-progress bar with start=2026-06-06 and due=2026-09-05 must be present in index.html'
  )
})

test('MUST 401 exam card quiz action buttons link to correct MCQ topic keys', () => {
  const html = read('index.html')

  // SUR 401-1 exam card must have a quiz button targeting 'SUR 401-1 MCQs'
  assert.match(
    html,
    /data-quiz-topic="SUR 401-1 MCQs"/,
    'index.html must have a quiz button with data-quiz-topic="SUR 401-1 MCQs"'
  )

  // MED 401-1 exam card
  assert.match(
    html,
    /data-quiz-topic="MED 401-1 MCQs"/,
    'index.html must have a quiz button with data-quiz-topic="MED 401-1 MCQs"'
  )
})

test('MUST 402 quizTopicKey wiring appears in main.js for every 402 subject with a midterm exam card', () => {
  const src = read('src/main.js')

  // midtermExamSchedule402 entries must reference the correct quizTopicKey values
  assert.match(src,
    /quizTopicKey:\s*'SUR 402-1 MCQs'/,
    "midtermExamSchedule402 must wire SUR402-1 to 'SUR 402-1 MCQs'")
  assert.match(src,
    /quizTopicKey:\s*'MED 402-1 MCQs'/,
    "midtermExamSchedule402 must wire MED402-1 to 'MED 402-1 MCQs'")
  assert.match(src,
    /quizTopicKey:\s*'MED 402-2 MCQs'/,
    "midtermExamSchedule402 must wire MED402-2 to 'MED 402-2 MCQs'")
  assert.match(src,
    /quizTopicKey:\s*'GYN 402 MCQs'/,
    "midtermExamSchedule402 must wire GYNA402 to 'GYN 402 MCQs'")
})

// ---------------------------------------------------------------------------
// 13. Topic and quiz storage keys scoped by owner, university, and section
// ---------------------------------------------------------------------------

test('topic completion storage key is scoped by owner, university, and section', () => {
  const src = read('src/main.js')

  // getTopicCompletionKey must produce the full scoped key
  assert.match(
    src,
    /function getTopicCompletionKey[\s\S]{0,200}TOPIC_COMPLETION_STORAGE_PREFIX.*getProgressStorageOwnerId\(\).*activeUniversityId.*section.*encodeURIComponent\(subjectCode\).*encodeURIComponent\(topicLabel\)/s,
    'getTopicCompletionKey must include TOPIC_COMPLETION_STORAGE_PREFIX, owner, university, section, subjectCode, and topicLabel'
  )

  // The prefix constant must be 'topicCompletion'
  assert.match(
    src,
    /const TOPIC_COMPLETION_STORAGE_PREFIX = 'topicCompletion'/,
    "TOPIC_COMPLETION_STORAGE_PREFIX must be 'topicCompletion'"
  )
})

test('quiz storage key is scoped by owner, university, and section', () => {
  const src = read('src/main.js')

  // getQuizStorageKey must produce the full scoped key
  assert.match(
    src,
    /function getQuizStorageKey[\s\S]{0,200}QUIZ_STORAGE_PREFIX.*getProgressStorageOwnerId\(\).*activeUniversityId.*section.*encodeURIComponent\(topicLabel\).*encodeURIComponent\(sourceId\)/s,
    'getQuizStorageKey must include QUIZ_STORAGE_PREFIX, owner, university, section, topicLabel, and sourceId'
  )

  // The prefix constant must be 'quizState'
  assert.match(
    src,
    /const QUIZ_STORAGE_PREFIX = 'quizState'/,
    "QUIZ_STORAGE_PREFIX must be 'quizState'"
  )
})

test('progress record key functions use universityId::section::subject::topic format', () => {
  const src = read('src/main.js')

  // getTopicProgressRecordKey
  assert.match(
    src,
    /function getTopicProgressRecordKey\s*\(universityId,\s*section,\s*subjectCode,\s*topicLabel\)\s*\{[^}]*return\s*`\$\{universityId\}::\$\{section\}::\$\{subjectCode\}::\$\{topicLabel\}`/s,
    'getTopicProgressRecordKey must return universityId::section::subjectCode::topicLabel'
  )

  // getQuizProgressRecordKey
  assert.match(
    src,
    /function getQuizProgressRecordKey\s*\(universityId,\s*section,\s*topicLabel,\s*sourceId[^)]*\)\s*\{[^}]*return\s*`\$\{universityId\}::\$\{section\}::\$\{topicLabel\}::\$\{sourceId/s,
    'getQuizProgressRecordKey must return universityId::section::topicLabel::sourceId'
  )
})

// ---------------------------------------------------------------------------
// 14. Legacy 401/402 local-progress migration behaviour
// ---------------------------------------------------------------------------

test('legacy local-progress constants are unchanged', () => {
  const src = read('src/main.js')

  assert.match(
    src,
    /const LEGACY_TOPIC_COMPLETION_STORAGE_PREFIX = 'med401-topic-progress-v1::'/,
    "LEGACY_TOPIC_COMPLETION_STORAGE_PREFIX must be 'med401-topic-progress-v1::'"
  )
  assert.match(
    src,
    /const LEGACY_QUIZ_STORAGE_PREFIX = 'mcq-progress-'/,
    "LEGACY_QUIZ_STORAGE_PREFIX must be 'mcq-progress-'"
  )
  assert.match(
    src,
    /const LOCAL_PROGRESS_OWNER_KEY = 'mustHubLocalProgressOwner'/,
    "LOCAL_PROGRESS_OWNER_KEY must be 'mustHubLocalProgressOwner'"
  )
})

test('canUseLegacyLocalProgress restricts legacy reads to must university', () => {
  const src = read('src/main.js')

  assert.match(
    src,
    /function canUseLegacyLocalProgress\s*\(\)[\s\S]{0,200}activeUniversityId !== 'must'[\s\S]{0,60}return false/s,
    'canUseLegacyLocalProgress must return false when activeUniversityId is not must'
  )
})

test('legacy progress fallback reads legacy key only for section 401', () => {
  const src = read('src/main.js')

  // The topic completion lookup must fall back to legacy key only when section === '401'
  assert.match(
    src,
    /canUseLegacyLocalProgress\(\)\s*&&\s*(?:activeAcademicSection|section)\s*===\s*'401'\s*\?\s*localStorage\.getItem\(getLegacyTopicCompletionKey\(/,
    'Legacy topic completion fallback must gate on section === 401'
  )

  // The quiz lookup must fall back to legacy key only when section === '401'
  assert.match(
    src,
    /canUseLegacyLocalProgress\(\)\s*&&\s*(?:activeAcademicSection|section)\s*===\s*'401'\s*\?\s*localStorage\.getItem\(getLegacyQuizStorageKey\(/,
    'Legacy quiz storage fallback must gate on section === 401'
  )
})

test('claimAndMigrateLocalProgress migrates both 401 and 402 scoped legacy keys', () => {
  const src = read('src/main.js')

  // The regex inside claimAndMigrateLocalProgress must cover both 401 and 402 sections.
  // Actual source line: storageKey.match(/^(topicCompletion|quizState)::(401|402)::(.+)$/)
  assert.match(
    src,
    /function claimAndMigrateLocalProgress[\s\S]{0,800}topicCompletion\|quizState.*401\|402/s,
    'claimAndMigrateLocalProgress must contain a regex that covers both 401 and 402'
  )
})

test('getLegacyTopicCompletionKey uses the legacy prefix', () => {
  const src = read('src/main.js')
  assert.match(
    src,
    /function getLegacyTopicCompletionKey[\s\S]{0,200}LEGACY_TOPIC_COMPLETION_STORAGE_PREFIX.*encodeURIComponent\(subjectCode\).*encodeURIComponent\(topicLabel\)/s,
    'getLegacyTopicCompletionKey must use LEGACY_TOPIC_COMPLETION_STORAGE_PREFIX and encode both parts'
  )
})

test('getLegacyQuizStorageKey uses the legacy quiz prefix', () => {
  const src = read('src/main.js')
  assert.match(
    src,
    /function getLegacyQuizStorageKey[\s\S]{0,200}LEGACY_QUIZ_STORAGE_PREFIX.*encodeURIComponent\(topicLabel\).*encodeURIComponent\(sourceId\)/s,
    'getLegacyQuizStorageKey must use LEGACY_QUIZ_STORAGE_PREFIX and encode both parts'
  )
})

// ---------------------------------------------------------------------------
// 15. Source/public mirror integrity (401/402-specific files)
// ---------------------------------------------------------------------------

test('401 and 402 MCQ source files are mirrored byte-for-byte in public/src/', () => {
  const mcqFiles = [
    // 401 banks
    'sur1-kellawi-mcqs.js',
    'sur1-past-exam-mcqs.js',
    'sur1-matching-questions.js',
    'sur1-liver-spleen-answers-mcqs.js',
    'sur1-stomach-master-mcqs.js',
    'med1-kellawi-mcqs.js',
    'med1-mw-ragab-mcqs.js',
    'med1-hepatology-final-review-mcqs.js',
    'med1-alshamel-mcqs.js',
    'med2-cardio-chest-mcqs.js',
    // 402 banks
    'sur402-past-exam-mcqs.js',
    'sur402-textbook-mcqs.js',
    'sur402-amr-beshry-mcqs.js',
    'med402-endocrine-mcqs.js',
    'med402-neurology-mcqs.js',
    'med402-neuro-extra-mcqs.js',
    'med402-old-psychiatry-mcqs.js',
    'med402-zatoona-psychiatry-mcqs.js',
    'gyn402-nadine-vip-midterm-mcqs.js',
    'gyn402-question-bank-mcqs.js',
    'gyn402-filtered-master-bank.js'
  ]

  for (const file of mcqFiles) {
    const srcBytes = readBytes(`src/${file}`)
    const pubBytes = readBytes(`public/src/${file}`)
    assert.equal(
      srcBytes.equals(pubBytes),
      true,
      `${file}: src/ and public/src/ copies must be byte-identical`
    )
  }
})

// ---------------------------------------------------------------------------
// 16. 401 MCQ registry: spot-check key topic keys exist in window.mcqQuizzes
// ---------------------------------------------------------------------------

test('SUR 401-1 MCQs key exists in window.mcqQuizzes after loading sur1 banks', () => {
  const context = { window: { mcqQuizzes: {} } }
  vm.runInNewContext(read('src/sur1-kellawi-mcqs.js'), context)
  assert.ok('SUR 401-1 MCQs' in context.window.mcqQuizzes, "window.mcqQuizzes must contain 'SUR 401-1 MCQs'")
})

test('MED 401-1 MCQs key exists in window.mcqQuizzes after loading med1 banks', () => {
  const context = { window: { mcqQuizzes: {} } }
  vm.runInNewContext(read('src/med1-kellawi-mcqs.js'), context)
  assert.ok('MED 401-1 MCQs' in context.window.mcqQuizzes, "window.mcqQuizzes must contain 'MED 401-1 MCQs'")
})

test('MED 401-2 MCQs key exists in window.mcqQuizzes after loading med2 banks', () => {
  const context = { window: { mcqQuizzes: {} } }
  vm.runInNewContext(read('src/med2-cardio-chest-mcqs.js'), context)
  assert.ok('MED 401-2 MCQs' in context.window.mcqQuizzes, "window.mcqQuizzes must contain 'MED 401-2 MCQs'")
})

// ---------------------------------------------------------------------------
// 17. 402 MCQ registry: spot-check key topic keys exist in window.mcqQuizzes402
// ---------------------------------------------------------------------------

test('SUR 402-1 MCQs key exists in window.mcqQuizzes402 after loading sur402 banks', () => {
  const context = { window: { mcqQuizzes402: {} } }
  vm.runInNewContext(read('src/sur402-past-exam-mcqs.js'), context)
  assert.ok('SUR 402-1 MCQs' in context.window.mcqQuizzes402, "window.mcqQuizzes402 must contain 'SUR 402-1 MCQs'")
})

test('MED 402-1 MCQs key exists in window.mcqQuizzes402 after loading med402-endocrine', () => {
  const context = { window: { mcqQuizzes402: {} } }
  vm.runInNewContext(read('src/med402-endocrine-mcqs.js'), context)
  assert.ok('MED 402-1 MCQs' in context.window.mcqQuizzes402, "window.mcqQuizzes402 must contain 'MED 402-1 MCQs'")
})

test('MED 402-2 MCQs key exists in window.mcqQuizzes402 after loading med402-neurology', () => {
  const context = { window: { mcqQuizzes402: {} } }
  vm.runInNewContext(read('src/med402-neurology-mcqs.js'), context)
  assert.ok('MED 402-2 MCQs' in context.window.mcqQuizzes402, "window.mcqQuizzes402 must contain 'MED 402-2 MCQs'")
})

test('GYN 402 MCQs key exists in window.mcqQuizzes402 after loading gyn402 banks', () => {
  const context = { window: { mcqQuizzes402: {} } }
  vm.runInNewContext(read('src/gyn402-nadine-vip-midterm-mcqs.js'), context)
  assert.ok('GYN 402 MCQs' in context.window.mcqQuizzes402, "window.mcqQuizzes402 must contain 'GYN 402 MCQs'")
})

// ---------------------------------------------------------------------------
// 18. News-key and topic-update storage keys initialise scoped to must::401
// ---------------------------------------------------------------------------

test('TOPIC_UPDATE_STORAGE_KEY and NEWS_SEEN_STORAGE_KEY initialise with must::401 scope', () => {
  const src = read('src/main.js')

  assert.match(
    src,
    /let TOPIC_UPDATE_STORAGE_KEY\s*=\s*`\$\{TOPIC_UPDATE_STORAGE_KEY_PREFIX\}::must::401`/,
    'TOPIC_UPDATE_STORAGE_KEY must initialise with must::401 scope'
  )
  assert.match(
    src,
    /let NEWS_SEEN_STORAGE_KEY\s*=\s*`\$\{NEWS_SEEN_STORAGE_KEY_PREFIX\}::must::401`/,
    'NEWS_SEEN_STORAGE_KEY must initialise with must::401 scope'
  )
})

// ---------------------------------------------------------------------------
// 19. 401 courseSchedule location tags are consistent
// ---------------------------------------------------------------------------

test('MUST 401 courseSchedule lecture room is SS 116B throughout', () => {
  const src = read('src/main.js')

  // Extract the courseSchedule literal
  const scheduleBodyStart = src.indexOf('const courseSchedule = [')
  assert.ok(scheduleBodyStart >= 0, 'courseSchedule array must be present in main.js')
  const scheduleBody = extractArrayBody(src.slice(scheduleBodyStart), 'courseSchedule')

  // All lecture-type entries must name room SS 116B
  const lectureEntries = Array.from(scheduleBody.matchAll(/type:\s*'lecture'[^}]+}/gs), (m) => m[0])
  assert.ok(lectureEntries.length > 0, 'courseSchedule must have at least one lecture entry')
  for (const entry of lectureEntries) {
    assert.match(entry, /room:\s*'SS 116B'/, `All lecture entries must use room 'SS 116B': ${entry.slice(0, 120)}`)
  }
})

// ---------------------------------------------------------------------------
// 20. SUR-1 liver-spleen-answers MCQ bank (a 401 supplementary bank)
//     does not accidentally target the 402 registry
// ---------------------------------------------------------------------------

test('sur1-liver-spleen-answers-mcqs.js targets window.mcqQuizzes (401 registry)', () => {
  const src = read('src/sur1-liver-spleen-answers-mcqs.js')
  assert.match(src, /window\.mcqQuizzes\b/, 'sur1-liver-spleen-answers-mcqs.js must write to window.mcqQuizzes')
  assert.doesNotMatch(src, /window\.mcqQuizzes402\b/, 'sur1-liver-spleen-answers-mcqs.js must NOT write to window.mcqQuizzes402')
})

test('sur1-stomach-master-mcqs.js targets window.mcqQuizzes (401 registry)', () => {
  const src = read('src/sur1-stomach-master-mcqs.js')
  assert.match(src, /window\.mcqQuizzes\b/, 'sur1-stomach-master-mcqs.js must write to window.mcqQuizzes')
  assert.doesNotMatch(src, /window\.mcqQuizzes402\b/, 'sur1-stomach-master-mcqs.js must NOT write to window.mcqQuizzes402')
})
