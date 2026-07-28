import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

import { calculatePercent, calculateQuizProgress } from '../src/progress.js'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const readBytes = (path) => readFileSync(new URL(`../${path}`, import.meta.url))

test('application modules are valid and mirrored', () => {
  const moduleFiles = [
    'src/main.js',
    'src/admin.js',
    'src/analytics.js',
    'src/knowledgeLibrary.js',
    'src/mcqs.js',
    'src/sur1-kellawi-mcqs.js',
    'src/sur1-past-exam-mcqs.js',
    'src/sur1-matching-questions.js',
    'src/sur402-past-exam-mcqs.js',
    'src/sur402-textbook-mcqs.js',
    'src/sur402-amr-beshry-mcqs.js',
    'src/med402-endocrine-mcqs.js',
    'src/med402-neurology-mcqs.js',
    'src/med402-neuro-extra-mcqs.js',
    'src/med402-old-psychiatry-mcqs.js',
    'src/med402-zatoona-psychiatry-mcqs.js',
    'src/med2-cardio-chest-mcqs.js',
    'src/med1-kellawi-mcqs.js',
    'src/med1-mw-ragab-mcqs.js',
    'src/progress.js',
    'src/supabaseClient.js'
  ]

  for (const file of moduleFiles) {
    execFileSync(process.execPath, ['--check', file], { cwd: new URL('..', import.meta.url) })
  }

  const mirroredFiles = ['main.js', 'admin.js', 'analytics.js', 'knowledgeLibrary.js', 'mcqs.js', 'sur1-kellawi-mcqs.js', 'sur1-past-exam-mcqs.js', 'sur1-matching-questions.js', 'sur402-past-exam-mcqs.js', 'sur402-textbook-mcqs.js', 'sur402-amr-beshry-mcqs.js', 'med402-endocrine-mcqs.js', 'med402-neurology-mcqs.js', 'med402-neuro-extra-mcqs.js', 'med402-old-psychiatry-mcqs.js', 'med402-zatoona-psychiatry-mcqs.js', 'med2-cardio-chest-mcqs.js', 'med1-kellawi-mcqs.js', 'med1-mw-ragab-mcqs.js', 'progress.js', 'style.css', 'supabaseClient.js']
  for (const file of mirroredFiles) {
    assert.equal(read(`src/${file}`), read(`public/src/${file}`), `${file} mirror is out of sync`)
  }

  const mainSource = read('src/main.js')
  assert.match(mainSource, /function updateGlobalProgress\s*\(/)
  assert.match(mainSource, /function initStudentSync\s*\(/)
  assert.match(mainSource, /function refreshLeaderboardIfActive\s*\(/)
  assert.match(mainSource, /leaderboardState\.section === requestedSection/)
  assert.match(mainSource, /await refreshLeaderboardIfActive\(true\)/)
  assert.match(mainSource, /requestId !== leaderboardState\.requestId \|\| requestedSection !== activeAcademicSection/)
  assert.match(read('src/style.css'), /\.leaderboard__loading\[hidden\]\s*\{\s*display:\s*none\s*!important;/)

  const index = read('index.html')
  for (const id of ['admin-login-modal', 'tracker-admin-login-form', 'tracker-admin-email-input', 'tracker-admin-password-input', 'tracker-admin-login-status', 'tracker-admin-edit-panel']) {
    assert.match(index, new RegExp(`id=["']${id}["']`), `${id} is missing from the admin login UI`)
  }
})

test('tracker search splits topics and MCQs with focused question launch', () => {
  const html = read('index.html')
  const mainSource = read('src/main.js')
  const style = read('src/style.css')

  assert.match(html, /data-search-mode="topics"[^>]*aria-pressed="true"/)
  assert.match(html, /data-search-mode="mcqs"[^>]*aria-pressed="false"/)
  assert.match(html, /id="mcq-search-results"[^>]*aria-live="polite"[^>]*hidden/)
  assert.match(html, /style\.css\?v=20260728-profile-avatar-dialog-v3/)
  assert.match(html, /main\.js\?v=20260728-profile-avatar-dialog-v3/)

  for (const helper of [
    'normalizeMcqSearchText',
    'getMcqSearchIndex',
    'getMcqSearchResults',
    'renderMcqSearchResults',
    'setTrackerSearchMode',
    'openMcqSearchResult'
  ]) {
    assert.match(mainSource, new RegExp(`function ${helper}\\s*\\(`), `${helper} is missing`)
  }

  assert.match(mainSource, /let trackerSearchMode = 'topics'/)
  assert.match(mainSource, /trackerSearchMode === 'topics' \? query : ''/)
  assert.match(mainSource, /getMcqQuizzesForSection\(\)/)
  assert.match(mainSource, /getQuizSources\(topicLabel\)\.forEach/)
  assert.match(mainSource, /data-mcq-search-result="\$\{index\}"/)
  assert.match(mainSource, /mode:\s*'search-result'/)
  assert.match(mainSource, /transient:\s*true/)
  assert.match(mainSource, /launchOptions\.skipSaved/)
  assert.match(mainSource, /if \(quizState\.transient\) return/)
  assert.match(mainSource, /openQuiz\(result\.topicLabel, config\.id, event, \{ skipSaved: true \}\)/)
  assert.match(mainSource, /event\.target\.closest\('\[data-mcq-search-result\]'\)/)

  assert.match(style, /\.filter-panel__mode\s*\{/)
  assert.match(style, /\.filter-panel__mode-btn--active\s*\{/)
  assert.match(style, /\.mcq-search-results\[hidden\]\s*\{[^}]*display:\s*none\s*!important;/s)
  assert.match(style, /\.mcq-search-result\s*\{/)
})

test('account loading gate uses the staged Clinical Sync experience', () => {
  const html = read('index.html')
  const mainSource = read('src/main.js')
  const style = read('src/style.css')

  assert.match(html, /Getting your study space ready/)
  assert.match(html, /Restoring your section and latest progress…/)
  assert.match(html, /data-auth-loading-step="account"/)
  assert.match(html, /data-auth-loading-step="section"/)
  assert.match(html, /data-auth-loading-step="progress"/)
  assert.match(html, /Still loading—your progress is safe\./)
  assert.match(mainSource, /function setAuthLoadingStep\s*\(/)
  assert.match(mainSource, /setAuthLoadingStep\('progress', selectedSection\)/)
  assert.match(mainSource, /}, 2500\)/)
  assert.match(style, /\.auth-gate__rail-scan/)
  assert.doesNotMatch(html, /auth-gate__spinner/)
})

test('SUR 401-1 Kellawi MCQ bank is complete and wired', () => {
  const context = { window: { mcqQuizzes: {} } }
  vm.runInNewContext(read('src/sur1-kellawi-mcqs.js'), context)

  const quiz = context.window.mcqQuizzes['SUR 401-1 MCQs']
  assert.equal(quiz.alwaysShowSourcePicker, true)
  assert.equal(quiz.sources.length, 1)
  assert.equal(quiz.sources[0].label, 'Kellawi MCQs')
  assert.equal(quiz.sources[0].mcqs.length, 1064)

  const collection = quiz.sources[0].collection
  assert.deepEqual(
    Array.from(collection.groups, (group) => [group.label, group.questionCount, group.parts.length]),
    [
      ['Spleen', 207, 6],
      ['Stomach', 302, 8],
      ['Tongue', 91, 3],
      ['Esophagus', 82, 3],
      ['Liver', 382, 10]
    ]
  )
  assert.deepEqual(
    Array.from(collection.groups, (group) => Array.from(group.parts, (part) => part.mcqs.length)),
    [
      [35, 35, 35, 34, 34, 34],
      [38, 38, 38, 38, 38, 38, 37, 37],
      [31, 30, 30],
      [30, 30, 22],
      [39, 39, 38, 38, 38, 38, 38, 38, 38, 38]
    ]
  )

  const parts = Array.from(collection.groups, (group) => Array.from(group.parts)).flat()
  const partQuestions = parts.flatMap((part) => Array.from(part.mcqs))
  assert.equal(parts.length, 30)
  assert.equal(partQuestions.length, 1064)
  assert.equal(new Set(partQuestions.map((question) => question.id)).size, 1064)
  assert.ok(parts.every((part) => part.mcqs.length >= 22 && part.mcqs.length <= 39))
  assert.deepEqual(Array.from(collection.mixedSizes, (mode) => mode.size), [20, 30, 50])
  assert.equal(collection.wrongReviewId, 'kellawi-wrong-review')
  assert.equal(quiz.sources[0].mcqs.filter((question) => question.source).length, 1063)
  assert.equal(new Set(quiz.sources[0].mcqs.filter((question) => question.organ === 'Liver').map((question) => question.section)).size, 29)
  assert.ok(quiz.sources[0].mcqs.every((question) => question.organ && question.originalNumber && question.section))

  const mainSource = read('src/main.js')
  for (const helper of [
    'renderQuizCollectionPicker',
    'renderQuizPartPicker',
    'renderMixedPracticePicker',
    'createWrongReviewQuizConfig',
    'getCollectionProgressSummary'
  ]) {
    assert.match(mainSource, new RegExp(`function ${helper}\\s*\\(`), `${helper} is missing`)
  }
  assert.match(mainSource, /quiz-source-option--kellawi/)
  assert.match(mainSource, /\/assets\/mohamed-kellawi-avatar\.jpg/)
  assert.match(mainSource, /data-quiz-resume-direct/)
  assert.match(mainSource, /data-quiz-part-start-over/)
  assert.match(mainSource, /resumeDirectly/)
  assert.match(mainSource, /restartTimer/)
  assert.match(mainSource, /promptOnSaved/)
  assert.doesNotMatch(mainSource, /Take over/)
  assert.match(mainSource, /Let’s solve organ by organ\./)
  assert.match(mainSource, /source\.mcqs\.length\.toLocaleString\(\)/)
  assert.match(mainSource, /kellawiGroupCount/)
  assert.match(mainSource, /kellawiPartCount/)
  assert.ok(readBytes('public/assets/mohamed-kellawi-avatar.jpg').length > 0)

  const index = read('index.html')
  assert.match(index, /data-quiz-topic=["']SUR 401-1 MCQs["']/)
  assert.match(index, /sur1-kellawi-mcqs\.js/)
})

test('SUR 402-1 topic-organized past-exam MCQs are complete and wired', () => {
  const context = { window: { mcqQuizzes402: {} } }
  vm.runInNewContext(read('src/sur402-past-exam-mcqs.js'), context)

  const quiz = context.window.mcqQuizzes402['SUR 402-1 MCQs']
  assert.equal(quiz.alwaysShowSourcePicker, true)
  assert.equal(quiz.sources.length, 1)

  const source = quiz.sources[0]
  assert.equal(source.id, 'sur402-topic-organized-past-exams')
  assert.equal(source.mcqs.length, 295)
  assert.equal(new Set(source.mcqs.map((question) => question.id)).size, 295)
  assert.ok(source.mcqs.every((question) => question.choices.length >= 2))
  assert.ok(source.mcqs.every((question) => question.answerIndex >= 0 && question.answerIndex < question.choices.length))
  assert.ok(source.mcqs.every((question) => question.source && question.explanation))

  assert.deepEqual(
    Array.from(source.collection.groups, (group) => [group.label, group.questionCount, group.parts.length]),
    [
      ['Breast', 139, 5],
      ['Hernia', 54, 2],
      ['Thyroid', 46, 2],
      ['Parathyroid', 56, 2]
    ]
  )
  assert.deepEqual(
    Array.from(source.collection.groups, (group) => Array.from(group.parts, (part) => part.mcqs.length)),
    [[28, 28, 28, 28, 27], [27, 27], [23, 23], [28, 28]]
  )
  assert.deepEqual(Array.from(source.collection.mixedSizes, (mode) => mode.size), [20, 30, 50])
  assert.equal(source.collection.wrongReviewId, 'sur402-past-exams-wrong-review')

  const html = read('index.html')
  const mainSource = read('src/main.js')
  assert.match(html, /sur402-past-exam-mcqs\.js\?v=20260719-sur402-past-exams-v1/)
  assert.match(mainSource, /code:\s*'SUR 402-1'[\s\S]{0,220}quizTopicKey:\s*'SUR 402-1 MCQs'/)
})

test('SUR 402-1 textbook MCQs appear beside the past-exam source', () => {
  const context = { window: { mcqQuizzes402: {} } }
  vm.runInNewContext(read('src/sur402-past-exam-mcqs.js'), context)
  vm.runInNewContext(read('src/sur402-textbook-mcqs.js'), context)

  const quiz = context.window.mcqQuizzes402['SUR 402-1 MCQs']
  assert.equal(quiz.alwaysShowSourcePicker, true)
  assert.equal(quiz.sources.length, 2)
  assert.deepEqual(Array.from(quiz.sources, (source) => source.label), [
    'Past Exam MCQs - Topic Organized',
    'Textbook MCQs - PreTest & Lange'
  ])

  const source = quiz.sources[1]
  assert.equal(source.id, 'sur402-textbook-pretest-lange')
  assert.equal(source.mcqs.length, 69)
  assert.equal(new Set(source.mcqs.map((question) => question.id)).size, 69)
  assert.ok(source.mcqs.every((question) => question.choices.length >= 2))
  assert.ok(source.mcqs.every((question) => Number.isInteger(question.answerIndex) && question.choices[question.answerIndex]))
  assert.ok(source.mcqs.every((question) => question.source && question.explanation))
  assert.deepEqual(
    Array.from(source.collection.groups, (group) => [group.label, group.questionCount]),
    [['Breast', 21], ['Thyroid & Parathyroid', 13], ['Other Endocrine', 9], ['Carcinoid', 5], ['Lange Hernia', 21]]
  )
  assert.deepEqual(Array.from(source.collection.mixedSizes, (mode) => mode.size), [20, 30, 50])
  assert.equal(source.collection.wrongReviewId, 'sur402-textbook-wrong-review')

  const html = read('index.html')
  assert.match(html, /sur402-textbook-mcqs\.js\?v=20260719-sur402-textbooks-v1/)
})

test('SUR 402-1 Amr Mohsen and Ahmed El-Beshry bank is complete and wired as a third source', () => {
  const context = { window: { mcqQuizzes402: {} } }
  vm.runInNewContext(read('src/sur402-past-exam-mcqs.js'), context)
  vm.runInNewContext(read('src/sur402-textbook-mcqs.js'), context)
  vm.runInNewContext(read('src/sur402-amr-beshry-mcqs.js'), context)

  const quiz = context.window.mcqQuizzes402['SUR 402-1 MCQs']
  assert.equal(quiz.sources.length, 3)
  const source = quiz.sources[2]
  assert.equal(source.id, 'sur402-amr-mohsen-ahmed-beshry')
  assert.equal(source.label, 'Amr Mohsen & Ahmed El-Beshry MCQs')
  assert.equal(source.mcqs.length, 83)
  assert.equal(new Set(source.mcqs.map((question) => question.id)).size, 83)
  assert.ok(source.mcqs.every((question) => question.choices.length >= 4))
  assert.ok(source.mcqs.every((question) => Number.isInteger(question.answerIndex) && question.choices[question.answerIndex]))
  assert.ok(source.mcqs.every((question) => question.question && question.source && question.explanation))
  assert.deepEqual(
    Array.from(source.collection.groups, (group) => [group.label, group.questionCount]),
    [['Breast', 26], ['Abdominal Wall & Hernia', 21], ['Thyroid & MEN', 24], ['Parathyroid', 4], ['Adrenal', 8]]
  )
  assert.deepEqual(Array.from(source.collection.mixedSizes, (mode) => mode.size), [20, 30, 50])
  assert.equal(source.collection.wrongReviewId, 'sur402-amr-beshry-wrong-review')

  const html = read('index.html')
  assert.match(html, /sur402-amr-beshry-mcqs\.js\?v=20260719-sur402-amr-beshry-v1/)
})

test('MED 402-1 endocrine bank is answer-safe, grouped, and wired to the exam card', () => {
  const context = { window: { mcqQuizzes402: {} } }
  vm.runInNewContext(read('src/med402-endocrine-mcqs.js'), context)

  const quiz = context.window.mcqQuizzes402['MED 402-1 MCQs']
  assert.equal(quiz.alwaysShowSourcePicker, true)
  assert.equal(quiz.sources.length, 1)

  const source = quiz.sources[0]
  assert.equal(source.id, 'med402-endocrine-question-bank')
  assert.equal(source.label, 'Endocrine Question Bank')
  assert.equal(source.mcqs.length, 288)
  assert.equal(source.heldForReview.length, 73)
  assert.equal(source.mcqs.length + source.heldForReview.length, 361)
  assert.equal(new Set(source.mcqs.map((question) => question.id)).size, 288)
  assert.ok(source.mcqs.every((question) => question.choices.length >= 2))
  assert.ok(source.mcqs.every((question) => Number.isInteger(question.answerIndex) && question.choices[question.answerIndex]))
  assert.ok(source.mcqs.every((question) => question.question && question.source && question.explanation))

  assert.deepEqual(
    Array.from(source.collection.groups, (group) => [group.label, group.questionCount, group.parts.length]),
    [
      ['Anterior Pituitary', 116, 4],
      ['Posterior Pituitary', 30, 2],
      ['Diabetes Mellitus', 142, 5]
    ]
  )
  assert.deepEqual(
    Array.from(source.collection.groups, (group) => Array.from(group.parts, (part) => part.mcqs.length)),
    [[30, 30, 30, 26], [15, 15], [30, 30, 30, 30, 22]]
  )
  assert.deepEqual(Array.from(source.collection.mixedSizes, (mode) => mode.size), [20, 30, 50])
  assert.equal(source.collection.wrongReviewId, 'med402-endocrine-wrong-review')

  const html = read('index.html')
  const mainSource = read('src/main.js')
  assert.match(html, /med402-endocrine-mcqs\.js\?v=20260723-med402-endocrine-v1/)
  assert.match(mainSource, /code:\s*'MED 402-1'[\s\S]{0,240}quizTopicKey:\s*'MED 402-1 MCQs'/)
})

test('MED 402-2 neurology bank is answer-safe, grouped, and wired to the exam card', () => {
  const context = { window: { mcqQuizzes402: {} } }
  vm.runInNewContext(read('src/med402-neurology-mcqs.js'), context)
  vm.runInNewContext(read('src/med402-neuro-extra-mcqs.js'), context)
  vm.runInNewContext(read('src/med402-old-psychiatry-mcqs.js'), context)
  vm.runInNewContext(read('src/med402-zatoona-psychiatry-mcqs.js'), context)
  vm.runInNewContext(read('src/med402-psychiatry-question-bank.js'), context)

  const quiz = context.window.mcqQuizzes402['MED 402-2 MCQs']
  assert.equal(quiz.alwaysShowSourcePicker, true)
  assert.equal(quiz.sources.length, 5)

  const source = quiz.sources.find((item) => item.id === 'med402-neurology-question-bank')
  const oldMidterm = quiz.sources.find((item) => item.id === 'med402-neuro-extra-question-set')
  const oldPsychiatry = quiz.sources.find((item) => item.id === 'med402-old-psychiatry-mcqs')
  const zatoonaPsychiatry = quiz.sources.find((item) => item.id === 'med402-zatoona-psychiatry-mcqs')
  const psychiatryQuestionBank = quiz.sources.find((item) => item.id === 'med402-psychiatry-question-bank')
  assert.ok(source, 'Neurology Question Bank source is missing')
  assert.ok(oldMidterm, 'Old Midterm Neuro MCQs source is missing')
  assert.ok(oldPsychiatry, 'Old Psychiatry MCQs source is missing')
  assert.equal(source.id, 'med402-neurology-question-bank')
  assert.equal(source.label, 'Neurology Question Bank')
  assert.equal(source.mcqs.length, 73)
  assert.equal(source.heldForReview.length, 20)
  assert.equal(source.mcqs.length + source.heldForReview.length, 93)
  assert.equal(new Set(source.mcqs.map((question) => question.id)).size, 73)
  assert.ok(source.mcqs.every((question) => question.choices.length >= 2))
  assert.ok(source.mcqs.every((question) => Number.isInteger(question.answerIndex) && question.choices[question.answerIndex]))
  assert.ok(source.mcqs.every((question) => question.question && question.source && question.explanation))

  assert.deepEqual(
    Array.from(source.collection.groups, (group) => [group.label, group.questionCount, group.parts.length]),
    [
      ['Introduction of Neuro', 10, 2],
      ['Speech and Cranial Nerve', 28, 2],
      ['Hemiplegia', 20, 2],
      ['Cerebral Vascular Insufficiency', 8, 2],
      ['Paraplegia', 7, 2]
    ]
  )
  assert.deepEqual(
    Array.from(source.collection.groups, (group) => Array.from(group.parts, (part) => part.mcqs.length)),
    [[5, 5], [14, 14], [10, 10], [4, 4], [4, 3]]
  )
  assert.deepEqual(Array.from(source.collection.mixedSizes, (mode) => mode.size), [20, 30, 50])
  assert.equal(source.collection.wrongReviewId, 'med402-neurology-wrong-review')

  assert.equal(oldMidterm.label, 'Old Midterm Neuro MCQs')
  assert.equal(oldMidterm.mcqs.length, 56)
  assert.equal(oldMidterm.heldForReview.length, 0)
  assert.equal(new Set(oldMidterm.mcqs.map((question) => question.id)).size, 56)
  assert.ok(oldMidterm.mcqs.every((question) => question.choices.length >= 2))
  assert.ok(oldMidterm.mcqs.every((question) => Number.isInteger(question.answerIndex) && question.choices[question.answerIndex]))
  assert.deepEqual(
    Array.from(oldMidterm.collection.groups, (group) => [group.label, group.questionCount, group.parts.length]),
    [
      ['Introduction', 9, 1],
      ['Hemiplegia', 37, 2],
      ['Cranial nerve / brainstem', 3, 1],
      ['Speech and Cranial Nerve', 5, 1],
      ['Multiple Sclerosis', 2, 1]
    ]
  )
  assert.deepEqual(Array.from(oldMidterm.collection.mixedSizes, (mode) => mode.size), [20, 30, 56])
  assert.equal(oldMidterm.collection.wrongReviewId, 'med402-neuro-extra-wrong-review')

  assert.equal(oldPsychiatry.label, 'Old Psychiatry MCQs')
  assert.equal(oldPsychiatry.mcqs.length, 67)
  assert.equal(oldPsychiatry.heldForReview.length, 0)
  assert.equal(new Set(oldPsychiatry.mcqs.map((question) => question.id)).size, 67)
  assert.ok(oldPsychiatry.mcqs.every((question) => question.choices.length >= 1))
  assert.ok(oldPsychiatry.mcqs.every((question) => Number.isInteger(question.answerIndex) && question.choices[question.answerIndex]))
  assert.deepEqual(
    Array.from(oldPsychiatry.collection.groups, (group) => [group.label, group.questionCount, group.parts.length]),
    [
      ['Psychiatry', 67, 3]
    ]
  )
  assert.deepEqual(Array.from(oldPsychiatry.collection.mixedSizes, (mode) => mode.size), [20, 30, 67])
  assert.equal(oldPsychiatry.collection.wrongReviewId, 'med402-old-psychiatry-wrong-review')

  assert.ok(zatoonaPsychiatry, 'zatoona psychiatry mcqs source is missing')
  assert.equal(zatoonaPsychiatry.label, 'zatoona psychiatry mcqs')
  assert.equal(zatoonaPsychiatry.mcqs.length, 148)
  assert.equal(zatoonaPsychiatry.heldForReview.length, 10)
  assert.equal(zatoonaPsychiatry.mcqs.length + zatoonaPsychiatry.heldForReview.length, 158)
  assert.equal(new Set(zatoonaPsychiatry.mcqs.map((question) => question.id)).size, 148)
  assert.ok(zatoonaPsychiatry.mcqs.every((question) => question.choices.length >= 1))
  assert.ok(zatoonaPsychiatry.mcqs.every((question) => Number.isInteger(question.answerIndex) && question.choices[question.answerIndex]))
  assert.deepEqual(
    Array.from(zatoonaPsychiatry.collection.groups, (group) => [group.label, group.questionCount, group.parts.length]),
    [
      ['Psychiatry', 148, 6]
    ]
  )
  assert.deepEqual(
    Array.from(zatoonaPsychiatry.collection.groups, (group) => Array.from(group.parts, (part) => part.mcqs.length)),
    [[19, 16, 24, 30, 30, 29]]
  )
  assert.deepEqual(Array.from(zatoonaPsychiatry.collection.mixedSizes, (mode) => mode.size), [20, 30, 148])
  assert.equal(zatoonaPsychiatry.collection.wrongReviewId, 'med402-zatoona-psychiatry-wrong-review')

  assert.ok(psychiatryQuestionBank, 'psychiatry_question_bank source is missing')
  assert.equal(psychiatryQuestionBank.label, 'psychiatry_question_bank')
  assert.equal(psychiatryQuestionBank.mcqs.length, 117)
  assert.equal(psychiatryQuestionBank.heldForReview.length, 11)
  assert.equal(psychiatryQuestionBank.mcqs.length + psychiatryQuestionBank.heldForReview.length, 128)
  assert.equal(new Set(psychiatryQuestionBank.mcqs.map((question) => question.id)).size, 117)
  assert.ok(psychiatryQuestionBank.mcqs.every((question) => question.choices.length >= 2))
  assert.ok(psychiatryQuestionBank.mcqs.every((question) => Number.isInteger(question.answerIndex) && question.choices[question.answerIndex]))
  assert.deepEqual(
    Array.from(psychiatryQuestionBank.collection.groups, (group) => [group.label, group.questionCount, group.parts.length]),
    [
      ['HISTORY TAKING', 29, 1],
      ['MOOD DISORDER', 44, 2],
      ['MOOD STABILIZER', 11, 1],
      ['ANTIDEPRESSANT', 33, 2]
    ]
  )
  assert.deepEqual(
    Array.from(psychiatryQuestionBank.collection.groups, (group) => Array.from(group.parts, (part) => part.mcqs.length)),
    [[29], [30, 14], [11], [30, 3]]
  )
  assert.deepEqual(Array.from(psychiatryQuestionBank.collection.mixedSizes, (mode) => mode.size), [20, 30, 117])
  assert.equal(psychiatryQuestionBank.collection.wrongReviewId, 'med402-psychiatry-question-bank-wrong-review')

  const html = read('index.html')
  const mainSource = read('src/main.js')
  assert.match(html, /med402-neurology-mcqs\.js\?v=20260727-med402-neurology-v2/)
  assert.match(html, /med402-neuro-extra-mcqs\.js\?v=20260726-med402-neuro-extra-v1/)
  assert.match(html, /med402-old-psychiatry-mcqs\.js\?v=20260726-med402-old-psychiatry-v1/)
  assert.match(html, /med402-zatoona-psychiatry-mcqs\.js\?v=20260727-med402-zatoona-psychiatry-v1/)
  assert.match(html, /med402-psychiatry-question-bank\.js\?v=20260728-med402-psychiatry-question-bank-v1/)
  assert.match(mainSource, /code:\s*'MED 402-2'[\s\S]{0,260}quizTopicKey:\s*'MED 402-2 MCQs'/)
})

test('MED 401-2 Cardio, Chest, Past Exams, Mo.ragab, and Final Exam 80 banks are source-faithful, grouped, and wired to the exam card', () => {
  const context = { window: { mcqQuizzes: {} } }
  vm.runInNewContext(read('src/med2-cardio-chest-mcqs.js'), context)

  const quiz = context.window.mcqQuizzes['MED 401-2 MCQs']
  assert.equal(quiz.alwaysShowSourcePicker, true)
  assert.equal(quiz.sources.length, 5)

  const cardio = quiz.sources.find((source) => source.id === 'med2-cardio-question-bank')
  const chest = quiz.sources.find((source) => source.id === 'med2-chest-question-bank')
  const pastExams = quiz.sources.find((source) => source.id === 'med2-past-exams-golden-quizzes')
  const moRagab = quiz.sources.find((source) => source.id === 'med2-mo-ragab-past-exams')
  const finalExam80 = quiz.sources.find((source) => source.id === 'med2-medical-final-exam-80')
  assert.ok(cardio, 'Cardiology source is missing')
  assert.ok(chest, 'Chest source is missing')
  assert.ok(pastExams, 'Past Exams source is missing')
  assert.ok(moRagab, 'Mo.ragab source is missing')
  assert.ok(finalExam80, 'Final Exam 80 source is missing')
  assert.equal(cardio.mcqs.length, 208)
  assert.equal(cardio.heldForReview.length, 27)
  assert.equal(cardio.mcqs.length + cardio.heldForReview.length, 235)
  assert.equal(chest.mcqs.length, 300)
  assert.equal(chest.heldForReview.length, 0)
  assert.equal(pastExams.mcqs.length, 81)
  assert.equal(pastExams.heldForReview.length, 0)
  assert.equal(moRagab.mcqs.length, 157)
  assert.equal(moRagab.heldForReview.length, 0)
  assert.equal(finalExam80.mcqs.length, 80)
  assert.equal(finalExam80.heldForReview.length, 0)

  for (const source of [cardio, chest, pastExams, moRagab, finalExam80]) {
    assert.equal(new Set(source.mcqs.map((question) => question.id)).size, source.mcqs.length)
    assert.ok(source.mcqs.every((question) => question.choices.length >= 2))
    assert.ok(source.mcqs.every((question) => Number.isInteger(question.answerIndex) && question.choices[question.answerIndex]))
    assert.ok(source.mcqs.every((question) => question.question && question.source && question.explanation))
    assert.deepEqual(Array.from(source.collection.mixedSizes, (mode) => mode.size), [20, 30, 50])
    assert.ok(source.collection.groups.every((group) => (
      group.parts.length > 0 &&
      group.parts.flatMap((part) => part.mcqs).length === group.questionCount
    )))
  }

  assert.deepEqual(
    Array.from(cardio.collection.groups, (group) => [group.label, group.questionCount]),
    [
      ['Pulmonary Embolism', 46],
      ['Rheumatic Fever', 39],
      ['Systemic Hypertension', 51],
      ['Mitral Valve Diseases', 32],
      ['Aortic Valve Diseases', 40]
    ]
  )
  assert.deepEqual(
    Array.from(chest.collection.groups, (group) => [group.label, group.questionCount]),
    [
      ['Cough, Sputum, Hemoptysis & Dyspnea', 70],
      ['Pulmonary Function Tests', 80],
      ['Upper & Lower Airway Diseases', 20],
      ['Small Airway Diseases', 20],
      ['Subglottic Stenosis & Vocal Cord Dysfunction', 10],
      ['Bronchial Asthma, Steps & Biologics', 100]
    ]
  )
  assert.deepEqual(
    Array.from(pastExams.collection.groups, (group) => [group.label, group.questionCount]),
    [
      ['Systemic Hypertension', 8],
      ['Rheumatic Fever', 12],
      ['Pulmonary Embolism', 10],
      ['Mitral Valve Diseases', 6],
      ['Aortic Valve Diseases', 6],
      ['Symptomatology of Cough', 7],
      ['Pulmonary Function Tests', 9],
      ['Upper & Lower Airway Diseases', 5],
      ['Bronchial Asthma', 18]
    ]
  )
  assert.deepEqual(
    Array.from(moRagab.collection.groups, (group) => [group.label, group.questionCount]),
    [
      ['Pulmonary Embolism', 45],
      ['Systemic Hypertension', 26],
      ['Rheumatic Fever', 27],
      ['Aortic Stenosis', 19],
      ['Aortic Regurgitation', 14],
      ['Mitral Stenosis', 13],
      ['Mitral Regurgitation', 13]
    ]
  )

  const html = read('index.html')
  const profileHtml = read('profile.html')
  const mainSource = read('src/main.js')
  assert.match(html, /med2-cardio-chest-mcqs\.js\?v=20260725-final-exam-80-v1/)
  assert.match(profileHtml, /med2-cardio-chest-mcqs\.js\?v=20260725-final-exam-80-v1/)
  assert.match(mainSource, /code:\s*'MED 401-2'[\s\S]{0,260}quizTopicKey:\s*'MED 401-2 MCQs'/)
})

test('MED 401-1 Kellawi gastroenterology bank is source-faithful, grouped, wired, and uses the Kellawi source card', () => {
  const context = { window: { mcqQuizzes: {} } }
  vm.runInNewContext(read('src/med1-kellawi-mcqs.js'), context)

  const quiz = context.window.mcqQuizzes['MED 401-1 MCQs']
  assert.equal(quiz.alwaysShowSourcePicker, true)
  assert.equal(quiz.sources.length, 1)

  const source = quiz.sources[0]
  assert.equal(source.id, 'med1-kellawi-gastroenterology')
  assert.equal(source.label, 'Kellawi Gastroenterology MCQs')
  assert.equal(source.mcqs.length, 155)
  assert.equal(source.heldForReview.length, 55)
  assert.equal(source.mcqs.length + source.heldForReview.length, 210)
  assert.equal(new Set(source.mcqs.map((question) => question.id)).size, source.mcqs.length)
  assert.ok(source.mcqs.every((question) => question.choices.length >= 2))
  assert.ok(source.mcqs.every((question) => Number.isInteger(question.answerIndex) && question.choices[question.answerIndex]))
  assert.ok(source.mcqs.every((question) => question.question && question.source && question.explanation))
  assert.deepEqual(Array.from(source.collection.mixedSizes, (mode) => mode.size), [20, 30, 50])
  assert.deepEqual(
    Array.from(source.collection.groups, (group) => [group.label, group.questionCount]),
    [
      ['Diseases of the Pancreas', 13],
      ['Diseases of the Esophagus', 26],
      ['Acute Viral Hepatitis & Liver Investigations', 14],
      ['NAFLD & NASH', 6],
      ['Autoimmune Liver Disease', 13],
      ['Diseases of the Small Intestine', 62],
      ['Liver Cirrhosis & Portal Hypertension', 21]
    ]
  )
  assert.ok(source.collection.groups.every((group) => (
    group.parts.length > 0 &&
    group.parts.flatMap((part) => part.mcqs).length === group.questionCount
  )))

  const html = read('index.html')
  const mainSource = read('src/main.js')
  assert.match(html, /med1-kellawi-mcqs\.js\?v=20260726-med1-kellawi-v1/)
  assert.match(mainSource, /code:\s*'MED 401-1'[\s\S]{0,240}quizTopicKey:\s*'MED 401-1 MCQs'/)
  assert.match(mainSource, /'med1-kellawi-gastroenterology'[\s\S]{0,100}]\.includes\(source\.id\)/)
  assert.match(mainSource, /quiz-source-option--kellawi/)
})

test('MED 401-1 Mw ragab comperhensive bank is source-faithful, grouped, and wired', () => {
  const context = { window: { mcqQuizzes: {} } }
  vm.runInNewContext(read('src/med1-kellawi-mcqs.js'), context)
  vm.runInNewContext(read('src/med1-mw-ragab-mcqs.js'), context)

  const quiz = context.window.mcqQuizzes['MED 401-1 MCQs']
  assert.equal(quiz.alwaysShowSourcePicker, true)
  assert.equal(quiz.sources.length, 2)

  const source = quiz.sources.find((item) => item.id === 'med1-mw-ragab-comperhensive')
  assert.ok(source, 'med1-mw-ragab-comperhensive source is missing')
  assert.equal(source.label, 'Mw ragab comperhensive')
  assert.equal(source.mcqs.length, 120)
  assert.equal(source.heldForReview.length, 0)
  assert.equal(new Set(source.mcqs.map((question) => question.id)).size, source.mcqs.length)
  assert.ok(source.mcqs.every((question) => question.choices.length >= 2))
  assert.ok(source.mcqs.every((question) => Number.isInteger(question.answerIndex) && question.choices[question.answerIndex]))
  assert.ok(source.mcqs.every((question) => question.question && question.source && question.explanation))
  assert.deepEqual(Array.from(source.collection.mixedSizes, (mode) => mode.size), [20, 30, 50])
  assert.deepEqual(
    Array.from(source.collection.groups, (group) => [group.label, group.questionCount, group.parts.length]),
    [
      ['Gastroenterology & Hepatology', 74, 3],
      ['Small intestine MCQs', 46, 2]
    ]
  )
  assert.ok(source.collection.groups.every((group) => (
    group.parts.length > 0 &&
    group.parts.flatMap((part) => part.mcqs).length === group.questionCount
  )))

  const html = read('index.html')
  assert.match(html, /med1-mw-ragab-mcqs\.js\?v=20260728-med1-mw-ragab-v2/)
})

test('SUR 401-1 past-exam bank is answer-safe, grouped, and wired', () => {
  const context = { window: { mcqQuizzes: {} } }
  vm.runInNewContext(read('src/sur1-kellawi-mcqs.js'), context)
  vm.runInNewContext(read('src/sur1-past-exam-mcqs.js'), context)

  const quiz = context.window.mcqQuizzes['SUR 401-1 MCQs']
  assert.equal(quiz.alwaysShowSourcePicker, true)
  assert.equal(quiz.sources.length, 2)

  const source = quiz.sources.find((item) => item.id === 'past-exams-esophagus-stomach')
  assert.ok(source, 'past-exam source is missing')
  assert.equal(source.label, 'Past Exam MCQs - Esophagus & Stomach')
  assert.equal(source.mcqs.length, 549)
  assert.equal(new Set(source.mcqs.map((question) => question.id)).size, 549)
  assert.ok(source.mcqs.every((question) => question.choices.length >= 2))
  assert.ok(source.mcqs.every((question) => Number.isInteger(question.answerIndex) && question.choices[question.answerIndex]))
  assert.ok(source.mcqs.every((question) => question.source && question.section && question.originalId))

  const collection = source.collection
  assert.deepEqual(
    Array.from(collection.groups, (group) => [group.label, group.questionCount, group.parts.length]),
    [
      ['Esophagus', 221, 7],
      ['Stomach & Duodenum', 212, 6],
      ['Mixed General Surgery', 116, 3]
    ]
  )
  assert.deepEqual(
    Array.from(collection.groups, (group) => Array.from(group.parts, (part) => part.mcqs.length)),
    [
      [32, 32, 32, 32, 31, 31, 31],
      [36, 36, 35, 35, 35, 35],
      [39, 39, 38]
    ]
  )

  const parts = Array.from(collection.groups, (group) => Array.from(group.parts)).flat()
  const partQuestions = parts.flatMap((part) => Array.from(part.mcqs))
  assert.equal(parts.length, 16)
  assert.equal(partQuestions.length, 549)
  assert.equal(new Set(partQuestions.map((question) => question.id)).size, 549)
  assert.ok(parts.every((part) => part.mcqs.length >= 30 && part.mcqs.length <= 39))
  assert.deepEqual(Array.from(collection.mixedSizes, (mode) => mode.size), [20, 30, 50])
  assert.equal(collection.wrongReviewId, 'sur1-past-exams-wrong-review')
  assert.match(read('src/sur1-past-exam-mcqs.js'), /Held for review \(6\)/)

  const mainSource = read('src/main.js')
  assert.match(mainSource, /groupNoun/)
  assert.match(mainSource, /groupEyebrow/)
  assert.match(mainSource, /mixedMeta/)
  assert.doesNotMatch(mainSource, /Back to Kellawi/)

  const index = read('index.html')
  assert.match(index, /sur1-past-exam-mcqs\.js/)
})

test('SUR 401-1 matching bank preserves every set, organ, answer, and source', () => {
  const context = { window: { mcqQuizzes: {} } }
  vm.runInNewContext(read('src/sur1-kellawi-mcqs.js'), context)
  vm.runInNewContext(read('src/sur1-past-exam-mcqs.js'), context)
  vm.runInNewContext(read('src/sur1-matching-questions.js'), context)

  const quiz = context.window.mcqQuizzes['SUR 401-1 MCQs']
  assert.equal(quiz.alwaysShowSourcePicker, true)
  assert.equal(quiz.sources.length, 3)

  const source = quiz.sources.find((item) => item.id === 'matching-liver-spleen-tongue-stomach-esophagus')
  assert.ok(source, 'matching source is missing')
  assert.equal(source.mcqs.length, 82)
  assert.equal(new Set(source.mcqs.map((question) => question.id)).size, 82)
  assert.ok(source.mcqs.every((question) => question.questionType === 'matching'))
  assert.ok(source.mcqs.every((question) => question.choices.length >= 5))
  assert.ok(source.mcqs.every((question) => Number.isInteger(question.answerIndex) && question.choices[question.answerIndex]))
  assert.ok(source.mcqs.every((question) => question.explanation && question.source && question.section && question.matchingSet))

  const collection = source.collection
  assert.deepEqual(
    Array.from(collection.groups, (group) => [group.label, group.questionCount, group.parts.length]),
    [
      ['Liver', 21, 4],
      ['Spleen', 5, 1],
      ['Tongue', 10, 2],
      ['Stomach', 30, 4],
      ['Esophagus', 16, 3]
    ]
  )
  const parts = Array.from(collection.groups, (group) => Array.from(group.parts)).flat()
  const partQuestions = parts.flatMap((part) => Array.from(part.mcqs))
  assert.equal(parts.length, 14)
  assert.equal(partQuestions.length, 82)
  assert.equal(new Set(partQuestions.map((question) => question.id)).size, 82)
  assert.deepEqual(Array.from(collection.mixedSizes, (mode) => mode.size), [20, 30, 50])
  assert.equal(collection.wrongReviewId, 'sur1-matching-wrong-review')

  const index = read('index.html')
  assert.match(index, /sur1-matching-questions\.js/)
})

test('quiz timer is a native responsive robot with answer moods', () => {
  const mainSource = read('src/main.js')
  const style = read('src/style.css')

  for (const robotPart of [
    'quiz-robot__antenna',
    'quiz-robot__head',
    'quiz-robot__face',
    'quiz-robot__eyes',
    'quiz-robot__time',
    'quiz-robot__mouth',
    'quiz-robot__body',
    'quiz-robot__arm',
    'quiz-robot__foot'
  ]) {
    assert.match(mainSource, new RegExp(robotPart), `${robotPart} is missing from the robot timer`)
  }

  assert.match(mainSource, /function triggerQuizRobotMood\s*\(/)
  assert.match(mainSource, /function updateQuizRobotCompactMode\s*\(/)
  assert.match(mainSource, /function pauseQuizCountupTimer\s*\(/)
  assert.match(mainSource, /timerElapsedMs/)
  assert.match(mainSource, /QUIZ_STICKY_OFFSET/)
  assert.match(mainSource, /triggerQuizRobotMood\('happy'\)/)
  assert.match(mainSource, /triggerQuizRobotMood\('sad'\)/)
  assert.match(mainSource, /role="timer"/)
  assert.match(mainSource, /Elapsed quiz time/)
  assert.match(mainSource, /Quiz time remaining/)
  assert.match(style, /@keyframes quiz-robot-idle/)
  assert.match(style, /@keyframes quiz-robot-blink/)
  assert.match(style, /@keyframes quiz-robot-happy/)
  assert.match(style, /@keyframes quiz-robot-sad/)
  assert.match(style, /\.quiz-timer--warning \.quiz-robot__antenna/)
  assert.match(style, /\.quiz-timer--compact/)
  assert.match(style, /\.quiz-timer--compact \.quiz-robot__body\s*\{[^}]*display:\s*none;/s)
  assert.match(style, /scroll-padding-top:\s*76px/)
  assert.match(style, /\.quiz-part-option__restart-button/)
  assert.match(style, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.quiz-timer/)
})

test('quiz and global progress calculations are correct', () => {
  assert.equal(calculatePercent(0, 0), 0)
  assert.equal(calculatePercent(2, 5), 40)
  assert.equal(calculatePercent(7, 5), 100)

  assert.deepEqual(
    calculateQuizProgress(['q1', 'q2', 'q3', 'q4'], ['q1', 'q3', 'unknown']),
    { answeredCount: 2, remainingCount: 2, percent: 50, total: 4 }
  )
})

test('Supabase public configuration and local RLS rules protect sensitive access', () => {
  const publicClientSources = [
    read('index.html'),
    read('schedule.html'),
    read('admin/index.html'),
    read('src/main.js'),
    read('src/admin.js'),
    read('src/supabaseClient.js')
  ].join('\n')
  assert.doesNotMatch(publicClientSources, /service[_-]?role|sb_secret_/i)

  const schema = read('supabase/schema.sql')
  assert.match(schema, /alter table public\.user_topic_progress enable row level security/i)
  assert.match(schema, /alter table public\.user_mcq_progress enable row level security/i)
  assert.match(schema, /using \(\(select auth\.uid\(\)\) = user_id\)/i)
  assert.match(schema, /with check \(\(select auth\.uid\(\)\) = user_id\)/i)
  assert.match(schema, /admin_users\.allowed_section = tracker_topics\.section/i)
  assert.match(schema, /midterm_scope boolean not null default false/i)
  assert.match(schema, /midterm_scope_note text/i)

  const mainSource = read('src/main.js')
  const supabaseClient = read('src/supabaseClient.js')
  assert.match(mainSource, /name="midterm_scope"/i)
  assert.match(mainSource, /midterm_scope_note:\s*midtermScopeNote \|\| null/i)
  assert.match(supabaseClient, /midterm_scope, midterm_scope_note/i)

  const leaderboardMigration = read('supabase/migrations/20260712114700_leaderboard.sql')
  assert.match(leaderboardMigration, /anonymous\s+BOOLEAN NOT NULL DEFAULT true/i)
  assert.match(leaderboardMigration, /FROM public\.user_mcq_progress/i)
  assert.doesNotMatch(leaderboardMigration, /user_topic_progress/i)
  assert.match(leaderboardMigration, /CASE WHEN u\.id = \(SELECT auth\.uid\(\)\) THEN u\.id ELSE NULL END/i)
  assert.match(leaderboardMigration, /REVOKE ALL ON FUNCTION public\.get_leaderboard\(TEXT\) FROM PUBLIC, anon/i)
  assert.match(leaderboardMigration, /GRANT EXECUTE ON FUNCTION public\.get_leaderboard\(TEXT\) TO authenticated/i)

  const unlimitedLeaderboardMigration = read('supabase/migrations/20260722182000_remove_leaderboard_limit.sql')
  assert.match(unlimitedLeaderboardMigration, /CREATE OR REPLACE FUNCTION get_leaderboard\(p_section TEXT DEFAULT '401'\)/i)
  assert.match(unlimitedLeaderboardMigration, /ORDER BY total_score DESC;/i)
  assert.doesNotMatch(unlimitedLeaderboardMigration, /LIMIT\s+50/i)
  assert.match(unlimitedLeaderboardMigration, /NULLIF\(btrim\(up\.nickname\), ''\)/i)
  assert.match(unlimitedLeaderboardMigration, /WHEN COALESCE\(up\.anonymous, true\) = false/i)
  assert.match(unlimitedLeaderboardMigration, /ELSE ''\s+END,/i)

  const nicknameMigration = read('supabase/migrations/20260722181500_add_user_nickname.sql')
  assert.match(nicknameMigration, /ADD COLUMN IF NOT EXISTS nickname TEXT/i)
  assert.match(nicknameMigration, /char_length\(btrim\(nickname\)\) BETWEEN 2 AND 24/i)

  const avatarMigration = read('supabase/migrations/20260723193000_add_profile_avatar.sql')
  assert.match(avatarMigration, /ADD COLUMN IF NOT EXISTS avatar_id TEXT/i)
  assert.match(avatarMigration, /avatar_id IN \('pulse', 'scholar', 'rounds', 'cardio', 'calm', 'scope', 'notes', 'anatomy'\)/i)
  assert.match(avatarMigration, /RETURNS TABLE \([\s\S]*avatar_id\s+TEXT/i)
  assert.doesNotMatch(avatarMigration, /raw_user_meta_data/i)

  const sectionMigration = read('supabase/migrations/20260719154530_add_user_selected_section.sql')
  assert.match(sectionMigration, /ADD COLUMN IF NOT EXISTS selected_section TEXT/i)
  assert.match(sectionMigration, /selected_section IN \('401', '402'\)/i)
})

test('Google login is mandatory and the academic section is account-bound', () => {
  const html = read('index.html')
  const style = read('src/style.css')
  const mainSource = read('src/main.js')
  const supabaseClient = read('src/supabaseClient.js')
  const schedule = read('schedule.html')

  assert.match(html, /<body data-auth-state="checking">/)
  assert.match(html, /id="auth-gate"/)
  assert.match(html, /<div class="auth-gate__brand">\s*<img src="\/assets\/must-university-logo\.png" alt="Misr University for Science and Technology"/)
  assert.ok(readBytes('public/assets/must-university-logo.png').length > 200_000)
  assert.match(html, /data-auth-login/)
  assert.match(html, /class="auth-gate__admin"[^>]*data-admin-login-open/)
  assert.match(html, /class="home-review-marquee auth-gate__reviews"/)
  assert.equal((html.match(/<section class="home-review-marquee\b/g) || []).length, 1)
  assert.doesNotMatch(html, /<section class="section-selector"[\s\S]*?<section class="home-review-marquee"/)
  assert.match(html, /data-auth-section="401"/)
  assert.match(html, /data-auth-section="402"/)
  assert.match(html, /data-student-switch-section/)
  assert.match(html, /data-tracker-admin-toggle/)
  assert.match(html, /id="student-sync-avatar"/)
  assert.doesNotMatch(html, /id="leaderboard-anon-toggle"/)
  assert.doesNotMatch(html, /data-student-sync-login/)
  assert.doesNotMatch(html, /id="student-sync-label"/)
  assert.match(style, /\.auth-gate\s*\{[^}]*display:\s*grid;[^}]*place-items:\s*center;/s)
  assert.match(style, /\.auth-gate__brand img\s*\{[^}]*object-fit:\s*contain;/s)
  assert.doesNotMatch(style, /\n\+\s*\n\s*\.auth-gate/)
  assert.match(style, /body\[data-auth-state\]:not\(\[data-auth-state="ready"\]\) > :not\(\.auth-gate\):not\(\.admin-login-modal\):not\(script\)/)
  assert.match(style, /body\[data-auth-state="signed-out"\] \[data-auth-panel="signed-out"\]/)
  assert.match(style, /body\[data-auth-state="needs-section"\] \[data-auth-panel="needs-section"\]/)
  assert.match(style, /\.site-header \.student-sync\.is-open #student-sync-menu\s*\{[^}]*left:\s*auto;[^}]*right:\s*0;[^}]*width:\s*min\(340px,\s*calc\(100vw - 24px\)\);[^}]*transform:\s*none;/s)
  assert.match(style, /\.student-sync__compact\s*\{[^}]*grid-template-columns:\s*28px minmax\(0,\s*1fr\);[^}]*min-height:\s*52px;/s)
  assert.match(style, /\.student-sync__compact--admin\s*\{\s*grid-column:\s*1\s*\/\s*-1;/)
  assert.match(style, /\.leaderboard__updated\s*\{\s*display:\s*none;/)
  assert.match(style, /\.admin-login-modal\s*\{[^}]*z-index:\s*10020;/s)

  assert.match(supabaseClient, /userPreferencesIncludeNickname/)
  assert.match(supabaseClient, /userPreferencesIncludeAvatar/)
  assert.match(supabaseClient, /userPreferencesIncludeProfileSetup/)
  assert.match(supabaseClient, /isMissingUserPreferenceNicknameError/)
  assert.match(supabaseClient, /isMissingUserPreferenceAvatarError/)
  assert.match(supabaseClient, /stripUserPreferenceNickname/)
  assert.match(supabaseClient, /function getUserPreferenceSelectFields\s*\(/)
  assert.match(supabaseClient, /function stripUnsupportedUserPreferenceFields\s*\(/)
  assert.match(supabaseClient, /export async function completeProfileSetup\s*\(/)
  assert.match(supabaseClient, /\.rpc\('complete_profile_setup'/)
  assert.match(supabaseClient, /persistSession:\s*true/)
  assert.match(mainSource, /async function handleStudentAuthUser\s*\(/)
  assert.match(mainSource, /async function saveSelectedSection\s*\(/)
  assert.doesNotMatch(mainSource, /function toggleLeaderboardAnonymousMode\s*\(/)
  assert.match(mainSource, /const fallbackSection = isSavedAcademicSection\(initialParams\.get\('section'\)\)/)
  assert.match(mainSource, /routeAuthenticatedUser\(fallbackSection\)/)
  assert.match(mainSource, /adminModeButton\.hidden = !signedIn \|\| !hasTrackerAdminAccess\(\)/)
  assert.match(mainSource, /event\.target\.closest\('\[data-tracker-admin-toggle\]'\)[\s\S]*?openAdminLogin\(\)/)
  assert.match(mainSource, /function redirectToRequiredProfile\s*\(/)
  assert.match(mainSource, /!isStandaloneProfilePage && !isProfileSetupComplete\(\)/)
  assert.match(mainSource, /selected_section:\s*section/)
  assert.match(mainSource, /studentProgressState\.selectedSection \|\| activeAcademicSection/)
  assert.doesNotMatch(mainSource, /localStorage\.setItem\('selectedAcademicSection'/)

  assert.match(mainSource, /LOCAL_PROGRESS_OWNER_KEY = 'mustHubLocalProgressOwner'/)
  assert.match(mainSource, /function claimAndMigrateLocalProgress\s*\(/)
  assert.match(mainSource, /\$\{QUIZ_STORAGE_PREFIX\}::\$\{getProgressStorageOwnerId\(\)\}::\$\{section\}/)
  assert.match(mainSource, /\$\{TOPIC_COMPLETION_STORAGE_PREFIX\}::\$\{getProgressStorageOwnerId\(\)\}::\$\{section\}/)
  assert.match(schedule, /window\.location\.replace\('\/#schedule'\)/)
  assert.match(html, /style\.css\?v=20260728-profile-avatar-dialog-v3/)
  assert.match(html, /main\.js\?v=20260728-profile-avatar-dialog-v3/)
})

test('student profile opens as a standalone gamified page', () => {
  const html = read('index.html')
  const profileHtml = read('profile.html')
  const mainSource = read('src/main.js')
  const style = read('src/style.css')
  const supabaseClient = read('src/supabaseClient.js')
  const viteConfig = read('vite.config.js')
  const leaderboardMigration = read('supabase/migrations/20260722182000_remove_leaderboard_limit.sql')
  const avatarMigration = read('supabase/migrations/20260723193000_add_profile_avatar.sql')
  const activityMigration = read('supabase/migrations/20260723201500_add_recent_mcq_activity.sql')
  const seasonMigration = read('supabase/migrations/20260726130240_mandatory_profiles_med1_season.sql')
  const presenceMigration = read('supabase/migrations/20260726164500_student_presence.sql')

  assert.doesNotMatch(html, /<section class="profile-section hub-section" id="profile"/)
  assert.match(html, /href="\/profile\.html" data-profile-open/)
  assert.match(html, /href="\/profile\.html\?edit=nickname" data-profile-edit-nickname/)
  assert.match(html, /href="\/profile\.html" data-section-nav="profile"/)

  assert.match(profileHtml, /<body class="profile-page"[^>]*data-site-mode="profile"/)
  assert.match(profileHtml, /<section class="profile-section hub-section" id="profile"/)
  assert.match(profileHtml, /<form class="profile-nickname-form" id="profile-nickname-form">/)
  assert.match(profileHtml, /id="profile-next-goal"/)
  assert.match(profileHtml, /Questions covered/)
  assert.match(profileHtml, /id="profile-mcq-bank-progress-note"/)
  assert.match(profileHtml, /Your achievements/)
  assert.match(profileHtml, /<details class="profile-achievement-cabinet">/)
  assert.doesNotMatch(profileHtml, /id="leaderboard-anon-toggle"/)
  assert.match(profileHtml, /id="profile-setup-banner"/)
  assert.match(profileHtml, /placeholder="Choose a unique nickname"/)
  assert.doesNotMatch(profileHtml, /Public nickname|Leaderboard name|public identity/i)
  assert.doesNotMatch(profileHtml, /profile-public-preview|profile-nickname-state|profile-display-name|profile-identity-setting/)
  assert.match(profileHtml, /id="profile-level-progress" role="progressbar"/)
  assert.match(profileHtml, /id="profile-avatar-options"/)
  assert.match(profileHtml, /class="profile-nickname-form__avatar" id="profile-avatar"/)
  assert.match(profileHtml, /id="profile-name-row"/)
  assert.match(profileHtml, /id="profile-display-nickname">Your nickname/)
  assert.match(profileHtml, /class="profile-nickname-form__edit-name"[^>]*data-profile-edit-nickname[^>]*aria-label="Edit name"[\s\S]*<svg viewBox="0 0 24 24"/)
  assert.match(profileHtml, /id="profile-nickname-editor" hidden/)
  assert.equal((profileHtml.match(/id="profile-nickname-input"/g) || []).length, 1)
  assert.equal((profileHtml.match(/class="profile-nickname-form__save" type="submit"/g) || []).length, 1)
  assert.match(profileHtml, /class="profile-nickname-form__save" type="submit">[\s\S]*<span>Save profile<\/span>/)
  assert.match(html, /data-profile-open/)
  assert.match(html, /data-profile-edit-nickname/)
  assert.match(profileHtml, /style\.css\?v=20260728-profile-avatar-dialog-v3/)
  assert.match(profileHtml, /main\.js\?v=20260728-profile-avatar-dialog-v3/)
  assert.match(profileHtml, /class="profile-auth-visual"/)
  assert.match(profileHtml, /data-auth-panel="checking"[\s\S]*Preparing your profile/)
  assert.match(profileHtml, /data-auth-panel="signed-out"[\s\S]*data-auth-login/)
  assert.match(profileHtml, /data-auth-panel="needs-section"[\s\S]*data-auth-section="401"[\s\S]*data-auth-section="402"/)
  assert.match(style, /@keyframes profile-auth-orbit/)
  assert.match(style, /@keyframes profile-auth-pulse/)
  assert.match(style, /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.profile-auth-visual::before,[\s\S]*?animation:\s*none !important;/s)
  assert.match(style, /body\[data-auth-state="ready"\] \.auth-gate\s*\{[^}]*opacity:\s*0;[^}]*visibility:\s*hidden;/s)
  assert.match(style, /\.profile-nickname-form__avatar::before\s*\{[^}]*conic-gradient\([^}]*#69a7ff[^}]*#46d29a[^}]*#e2b84a[^}]*animation:\s*profile-avatar-signal-spin/s)
  assert.match(style, /\.profile-nickname-form__avatar::after\s*\{[^}]*animation:\s*profile-avatar-signal-pulse/s)
  assert.match(style, /@keyframes profile-avatar-signal-spin/)
  assert.match(style, /\.profile-nickname-form__avatar::before,\s*\.profile-nickname-form__avatar::after\s*\{\s*animation:\s*none;/)
  assert.match(profileHtml, /data-profile-avatar-open[^>]*aria-haspopup="dialog"[^>]*aria-controls="profile-avatar-dialog"/)
  assert.match(profileHtml, /<dialog class="profile-avatar-dialog" id="profile-avatar-dialog"[^>]*aria-labelledby="profile-avatar-dialog-title"/)
  assert.match(profileHtml, /data-profile-avatar-close[^>]*aria-label="Close avatar picker"/)
  assert.match(mainSource, /function openProfileAvatarDialog\s*\(\)/)
  assert.match(mainSource, /profileAvatarDialog\.showModal\(\)/)
  assert.match(mainSource, /function closeProfileAvatarDialog\s*\(options = \{\}\)/)
  assert.match(mainSource, /if \(stepIndex === 1\) openProfileAvatarDialog\(\)/)
  assert.match(profileHtml, /id="profile" aria-label="Your profile"/)
  assert.match(style, /\.profile-page \.profile-page-hero\s*\{\s*display:\s*none;/)
  assert.match(style, /\.profile-nickname-form\s*\{[^}]*padding:\s*10px 0 4px;[^}]*border:\s*0;[^}]*background:\s*transparent;/s)
  assert.match(style, /\.profile-nickname-form \.profile-nickname-form__save\s*\{[^}]*min-width:\s*190px;[^}]*border-radius:\s*16px;[^}]*linear-gradient/s)
  assert.match(style, /\.profile-avatar-dialog::backdrop\s*\{[^}]*backdrop-filter:\s*blur\(12px\)/s)
  assert.ok(readBytes('public/assets/profile-avatars-faceless-v3.webp').length > 50_000)
  assert.match(viteConfig, /profile:\s*resolve\(__dirname,\s*'profile\.html'\)/)

  assert.match(mainSource, /function getStudentProfileStats\s*\(/)
  assert.match(mainSource, /function getProfileTrophies\s*\(/)
  assert.match(mainSource, /function getCurrentLeaderboardEntry\s*\(/)
  assert.match(mainSource, /function getProfileMcqBankProgressStats\s*\(/)
  assert.match(mainSource, /function getMcqQuizzesForSection\s*\(/)
  assert.match(mainSource, /return window\.mcqQuizzes \|\| mcqQuizzesBySection\['401'\] \|\| \{\}/)
  assert.match(mainSource, /function validateNickname\s*\(/)
  assert.match(mainSource, /displayNickname\.textContent = nickname \|\| 'Choose your nickname'/)
  assert.match(mainSource, /nicknameEditor\.hidden = !setupRequired && !profileNicknameEditorOpen/)
  assert.match(mainSource, /editButton\.hidden = setupRequired \|\| profileNicknameEditorOpen/)
  assert.doesNotMatch(mainSource, /user_metadata|full_name|getStudentDisplayName|getPrivateProfileDisplayName/)
  assert.match(mainSource, /studentSyncEmail\.textContent = signedIn \? \(getStudentNickname\(\) \|\| 'Complete your profile'\)/)
  assert.match(mainSource, /studentSyncAvatar\.className = `student-sync__avatar student-avatar \$\{getProfileAvatarClass\(getStudentAvatarId\(\)\)\}`/)
  assert.match(mainSource, /const isStandaloneProfilePage/)
  assert.match(mainSource, /window\.location\.href = url\.toString\(\)/)
  assert.match(mainSource, /activeSiteMode = 'profile'/)
  assert.match(mainSource, /!studentSync && !isStandaloneProfilePage/)
  assert.match(mainSource, /if \(isStandaloneProfilePage\) \{\s*renderProfileSection\(\)\s*return\s*\}/)
  assert.match(mainSource, /setText\('profile-next-goal'/)
  assert.match(mainSource, /function getClosestLockedTrophies\s*\(/)
  assert.match(mainSource, /function getProfileAchievementPreview\s*\(/)
  assert.match(mainSource, /function getProfileMasteryLevel\s*\(/)
  assert.match(mainSource, /const PROFILE_AVATARS = \[/)
  assert.match(mainSource, /function selectProfileAvatar\s*\(/)
  assert.match(mainSource, /async function saveProfileSetup\s*\(/)
  assert.match(mainSource, /function renderProfileAvatarPicker\s*\(/)
  assert.match(mainSource, /preview\.setAttribute\('aria-label', selectedAvatar \? `\$\{selectedAvatar\.label\} avatar selected` : 'No avatar selected'\)/)
  assert.match(mainSource, /function getLeaderboardAvatarId\s*\(/)
  assert.match(mainSource, /function initLeaderboardVisibilityLoading\s*\(/)
  assert.match(mainSource, /new IntersectionObserver/)
  assert.match(mainSource, /function fetchAndRenderLiveActivity\s*\(/)
  assert.match(mainSource, /function renderOnlineStudents\s*\(/)
  assert.match(mainSource, /function sendStudentPresence\s*\(/)
  assert.match(mainSource, /function initOnlineStudents\s*\(/)
  assert.match(mainSource, /function renderLeaderboardPresence\s*\(/)
  assert.doesNotMatch(mainSource, /Online now|Live now/)
  assert.match(mainSource, /Solving MCQs/)
  assert.match(mainSource, /MCQ activity/)
  assert.match(mainSource, /id="quiz-live-activity"/)
  assert.doesNotMatch(mainSource, /renderLiveActivityContainer\(document\.getElementById\('tracker-live-activity'\)/)
  assert.match(mainSource, /data-profile-avatar="\$\{avatar\.id\}"/)
  assert.match(mainSource, /const serverScore = Number\(currentLeaderboardEntry\?\.lifetime_score\)/)
  assert.match(mainSource, /totalScore: Number\.isFinite\(serverScore\) \? serverScore : totalScore/)
  assert.match(mainSource, /loadStudentProgress\(activeAcademicSection\)\s*\.then\(\(\) => fetchAndRenderLeaderboard\(true\)\)/)
  assert.match(mainSource, /getCollectionParts\(source\)\.forEach/)
  assert.match(mainSource, /setText\('profile-mcq-bank-progress-note', `\$\{stats\.mcqBankProgress\.answered\} of \$\{stats\.mcqBankProgress\.total\} questions`\)/)
  assert.match(mainSource, /progressFill\.style\.width = `\$\{stats\.mcqBankProgress\.percent\}%`/)
  assert.match(mainSource, /window\.addEventListener\('load', \(\) => \{\s*renderProfileSection\(\)/)
  assert.match(mainSource, /initialParams\.get\('edit'\) === 'nickname'/)
  assert.match(mainSource, /SEEN_TROPHIES_STORAGE_PREFIX = 'seenProfileTrophies'/)
  assert.match(mainSource, /scoreMilestones = \[50, 100, 250, 500, 1000\]/)
  assert.match(mainSource, /completionMilestones = \[5, 10, 25\]/)
  assert.match(mainSource, /accuracyMilestones = \[80, 90, 100\]/)
  assert.match(mainSource, /progressMilestones = \[25, 50, 75, 100\]/)
  assert.match(mainSource, /Cover \$\{target\}% of available section MCQs\./)
  assert.match(mainSource, /wrongReviewCompleted/)
  assert.match(mainSource, /\['#tracker', '#news', '#schedule', '#leaderboard'\]/)
  assert.match(mainSource, /await completeProfileSetup\(nickname, avatarId\)/)
  assert.match(mainSource, /nickname: getStudentNickname\(\) \|\| null/)
  assert.match(mainSource, /avatar_id: getSavedProfileAvatarId\(\) \|\| null/)
  assert.match(mainSource, /profile_setup_version: Number\(leaderboardState\.preferences\.profile_setup_version\) \|\| 0/)

  assert.match(supabaseClient, /userPreferencesIncludeAvatar/)
  assert.match(supabaseClient, /avatar_id/)
  assert.match(supabaseClient, /return upsertUserPreference\(row\)/)
  assert.match(supabaseClient, /return updateUserPreference\(userId, changes\)/)
  assert.match(supabaseClient, /profile_setup_version/)
  assert.match(supabaseClient, /export async function fetchRecentMcqActivity\s*\(/)
  assert.match(supabaseClient, /\.rpc\('get_recent_mcq_activity'/)
  assert.match(supabaseClient, /export async function markStudentOnline\s*\(/)
  assert.match(supabaseClient, /\.rpc\('mark_student_online'/)
  assert.match(supabaseClient, /export async function fetchOnlineStudents\s*\(/)
  assert.match(supabaseClient, /\.rpc\('get_online_students'/)
  assert.match(leaderboardMigration, /WHEN COALESCE\(up\.anonymous, true\) = false AND NULLIF\(btrim\(up\.nickname\), ''\) IS NOT NULL THEN btrim\(up\.nickname\)/i)
  assert.doesNotMatch(leaderboardMigration, /WHEN COALESCE\(up\.anonymous, true\) = false[\s\S]{0,160}raw_user_meta_data->>'full_name'/i)
  assert.match(avatarMigration, /COALESCE\(\s*NULLIF\(up\.avatar_id, ''\)/i)
  assert.match(avatarMigration, /ELSE 'anatomy'/i)
  assert.match(activityMigration, /NOW\(\) - INTERVAL '15 minutes'/i)
  assert.match(activityMigration, /WHEN recent\.user_id = \(SELECT auth\.uid\(\)\)/i)
  assert.doesNotMatch(activityMigration, /RETURNS TABLE \(\s*user_id/i)
  assert.match(presenceMigration, /CREATE TABLE IF NOT EXISTS public\.student_presence/i)
  assert.match(presenceMigration, /last_seen_at >= now\(\) - INTERVAL '90 seconds'/i)
  assert.match(presenceMigration, /REVOKE ALL ON TABLE public\.student_presence FROM PUBLIC, anon, authenticated/i)
  assert.match(presenceMigration, /GRANT EXECUTE ON FUNCTION public\.mark_student_online/i)
  assert.match(presenceMigration, /GRANT EXECUTE ON FUNCTION public\.get_online_students/i)
  assert.doesNotMatch(presenceMigration, /RETURNS TABLE \(\s*user_id/i)
  assert.match(seasonMigration, /ADD COLUMN IF NOT EXISTS profile_setup_version INTEGER NOT NULL DEFAULT 0/i)
  assert.match(seasonMigration, /user_preferences_nickname_unique/i)
  assert.match(seasonMigration, /CREATE OR REPLACE FUNCTION public\.complete_profile_setup/i)
  assert.match(seasonMigration, /CREATE TABLE IF NOT EXISTS public\.user_lifetime_scores/i)
  assert.match(seasonMigration, /CREATE TABLE IF NOT EXISTS public\.user_season_scores/i)
  assert.match(seasonMigration, /'MED 401-1 MCQs'/)
  assert.match(seasonMigration, /NEW\.attempt_started_at >= active_season\.starts_at/i)
  assert.match(seasonMigration, /GREATEST\(public\.user_lifetime_scores\.best_score, EXCLUDED\.best_score\)/i)
  assert.match(seasonMigration, /lifetime_score\s+BIGINT/i)
  assert.match(seasonMigration, /preferences\.profile_setup_version >= 1/i)
  assert.doesNotMatch(seasonMigration, /DELETE FROM public\.user_mcq_progress/i)
  assert.match(style, /\.profile-trophy--unlocked/)
  assert.match(style, /\.profile-nickname-form__avatar\s*\{[\s\S]*width:\s*92px;[\s\S]*height:\s*92px;/)
  assert.match(style, /\.profile-nickname-form__name-row\s*\{[\s\S]*display:\s*inline-flex;/)
  assert.match(style, /\.profile-nickname-form__edit-name\s*\{[\s\S]*width:\s*34px;/)
  assert.match(style, /\.profile-nickname-form__edit-name svg\s*\{[\s\S]*stroke:\s*currentColor;/)
  assert.match(style, /\.study-pulse--tracker \.study-pulse__avatar\s*\{[\s\S]*online-avatar-pulse/)
  assert.match(style, /\.leaderboard-presence--online/)
  assert.match(style, /\.profile-page-hero/)
  assert.match(style, /\.profile-momentum-card/)
  assert.match(style, /\.auth-gate__logo\s*\{[^}]*width:\s*88px;[^}]*object-fit:\s*contain;/s)
  assert.match(style, /\.profile-page \.auth-gate__card\s*\{[^}]*width:\s*min\(100%,\s*460px\);/s)
  assert.match(style, /\.bottom-nav\s*\{[\s\S]*?grid-template-columns:\s*repeat\(5,/)
})

test('mandatory profile onboarding guides each required control and cannot be skipped', () => {
  const profileHtml = read('profile.html')
  const mainSource = read('src/main.js')
  const publicMainSource = read('public/src/main.js')
  const style = read('src/style.css')

  assert.ok(
    profileHtml.indexOf('id="profile-nickname-input"') < profileHtml.indexOf('id="profile-avatar-options"'),
    'nickname must appear before avatar choices in the guided setup'
  )
  assert.match(mainSource, /const PROFILE_ONBOARDING_STEPS = \[/)
  assert.match(mainSource, /target: '#profile-nickname-input'/)
  assert.match(mainSource, /target: '#profile-avatar-options'/)
  assert.match(mainSource, /target: '#profile-nickname-form \[type="submit"\]'/)
  assert.match(mainSource, /Step \$\{stepIndex \+ 1\} of \$\{PROFILE_ONBOARDING_STEPS\.length\}/)
  assert.match(mainSource, /document\.body\.dataset\.authState === 'ready'/)
  assert.match(mainSource, /&& !isProfileSetupComplete\(\)/)
  assert.match(mainSource, /if \(event\.key === 'Escape'\) \{\s*event\.preventDefault\(\)/)
  assert.match(mainSource, /showProfileOnboardingStep\(2\)/)
  assert.match(mainSource, /stopProfileOnboardingTour\(\)\s*renderStudentSyncUi\(\)/)
  assert.match(mainSource, /profileForm\.hidden = false/)
  assert.match(mainSource, /redirectToRequiredProfile\(section\)/)
  assert.equal(mainSource, publicMainSource)
  assert.match(style, /\.profile-onboarding-tour__panel\s*\{[\s\S]*position:\s*fixed/)
  assert.match(style, /\.profile-onboarding-tour__target\s*\{[\s\S]*z-index:\s*10002/)
  assert.match(style, /@media \(max-width: 520px\) \{[\s\S]*\.profile-avatar-options\s*\{[\s\S]*grid-template-columns:\s*repeat\(4,/)
  assert.match(style, /@media \(max-width: 340px\) \{[\s\S]*\.profile-avatar-options\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,/)
  assert.match(style, /\.profile-page\s*\{[\s\S]*overflow-x:\s*hidden/)
})

test('MED-1 season points require fresh attempts while lifetime points remain durable', () => {
  const mainSource = read('src/main.js')
  const supabaseClient = read('src/supabaseClient.js')
  const migration = read('supabase/migrations/20260726130240_mandatory_profiles_med1_season.sql')
  const med402SeasonMigration = read('supabase/migrations/20260726163747_med402_2_fresh_season.sql')

  assert.match(mainSource, /attemptId:\s*null/)
  assert.match(mainSource, /attemptStartedAt:\s*null/)
  assert.match(mainSource, /function createQuizAttemptId\s*\(/)
  assert.match(mainSource, /attemptId:\s*quizState\.attemptId/)
  assert.match(mainSource, /attemptStartedAt:\s*quizState\.attemptStartedAt/)
  assert.match(mainSource, /attempt_id:\s*payload\.attemptId/)
  assert.match(mainSource, /attempt_started_at:\s*payload\.attemptStartedAt/)
  assert.match(mainSource, /savedState && !fresh \? \(savedState\.attemptId \|\| null\) : createQuizAttemptId\(\)/)
  assert.match(mainSource, /quizState\.attemptId = createQuizAttemptId\(\)[\s\S]{0,100}clearSavedQuizState/)
  assert.match(mainSource, /function getRankedLeaderboardRows\s*\(\)[\s\S]{0,140}Number\(row\.total_score\) > 0/)
  assert.match(mainSource, /currentLeaderboardEntry\?\.lifetime_score/)
  assert.match(mainSource, /seasonName \? `🏆 \$\{seasonName\} Leaderboard`/)
  assert.match(mainSource, /Complete a fresh scoped MCQ attempt to claim #1/)
  assert.doesNotMatch(mainSource, /Anonymous Student|You \(Anon/)

  assert.match(supabaseClient, /attempt_id, attempt_started_at/)
  assert.match(supabaseClient, /userQuizProgressIncludesAttemptMetadata/)
  assert.match(migration, /INSERT INTO public\.user_lifetime_scores[\s\S]*FROM public\.user_mcq_progress/i)
  assert.match(migration, /INSERT INTO public\.leaderboard_seasons[\s\S]*transaction_timestamp\(\)/i)
  assert.match(migration, /NEW\.completed IS DISTINCT FROM true OR NEW\.score IS NULL/i)
  assert.match(migration, /season\.scope_topic_label = NEW\.topic_label/i)
  assert.match(migration, /ON CONFLICT \(season_id, user_id, topic_label, source_id\)[\s\S]*GREATEST\(public\.user_season_scores\.best_score, EXCLUDED\.best_score\)/i)
  assert.match(migration, /DROP TRIGGER IF EXISTS capture_quiz_best_scores/i)
  assert.doesNotMatch(migration, /UPDATE public\.user_mcq_progress[\s\S]*SET score\s*=\s*0/i)
  assert.match(med402SeasonMigration, /scope_topic_label\s+IS DISTINCT FROM 'MED 402-2 MCQs'/i)
  assert.match(med402SeasonMigration, /'MED 402-2 Midterm'/)
  assert.match(med402SeasonMigration, /'MED 402-2 MCQs'/)
  assert.doesNotMatch(med402SeasonMigration, /DELETE FROM public\.user_mcq_progress/i)
})

test('topic actions are accessible boxless premium icons and legacy PWA state is cleaned up', () => {
  const style = read('src/style.css')
  const mainSource = read('src/main.js')
  assert.match(style, /\.topic-action-row\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*48px\)/s)
  assert.match(style, /\.topic-action-card\s*\{[^}]*border:\s*0;[^}]*background:\s*transparent;[^}]*box-shadow:\s*none;/s)
  assert.match(style, /\.topic-action-card__icon\s*\{[^}]*border:\s*0;[^}]*background:\s*transparent;[^}]*box-shadow:\s*none;/s)
  assert.match(style, /\.topic-action-card--drive:hover \.topic-action-card__icon,[\s\S]*?drop-shadow/s)
  assert.match(style, /\.topic-action-card__image,[\s\S]*?width:\s*21px;[\s\S]*?height:\s*21px;/)
  assert.match(style, /\.topic-breakdown__actions\s*\{[^}]*grid-template-columns:\s*repeat\(3,/s)
  assert.doesNotMatch(mainSource, /topic-action-card__text/)
  assert.match(mainSource, /aria-label="MCQs: Not uploaded yet"/)
  assert.match(mainSource, /aria-label="Lecture recording: Not uploaded yet"/)
  assert.match(mainSource, /href="\$\{topic\.audioUrl\}"[^>]*aria-label="Open lecture recording in Google Drive"/)
  assert.match(mainSource, /href="\$\{item\.url\}"[^>]*aria-label="Open lecture record in Google Drive"/)
  assert.doesNotMatch(mainSource, /data-record-player/)
  assert.doesNotMatch(mainSource, /data-record-focus/)
  assert.doesNotMatch(mainSource, /data-record-skip/)
  assert.doesNotMatch(mainSource, /data-record-speed/)
  assert.match(mainSource, /aria-label="\$\{label\}: Not uploaded yet"/)
  assert.match(mainSource, /aria-expanded="\$\{breakdownExpanded\}" aria-label="\$\{actionLabel\}"/)
  assert.match(mainSource, /label:\s*'Lecture slides'/)
  assert.match(mainSource, /label:\s*'Lecture recording'/)
  assert.match(mainSource, /Not uploaded yet/)
  assert.doesNotMatch(mainSource, /Drive pending/)
  assert.match(mainSource, /item\.type !== 'audio' && item\.url && isDriveUrl\(item\.url\)/)
  for (const approvedResourceId of [
    '1GfFE2goGP1WRw5D14YqQHW9ptEuJkBMz',
    '1wF1XfNhzOsjS7cX8t6-xyEi92dQShVB-',
    '1TicuEg59UwuZYaZ4OPBiD6vOfDupF8za',
    '1gVZZDhS-d6oiNbk7WDhgG_v1kX_5_2Nm',
    '1RcDNwFl91CVAErQ5IyY0cX--mJTGOhZV'
  ]) {
    assert.match(mainSource, new RegExp(approvedResourceId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }

  const html = [read('index.html'), read('schedule.html'), read('history.html'), read('work.html'), read('public/work.html')].join('\n')
  assert.doesNotMatch(html, /rel=["']manifest["']/i)

  const cleanup = read('public/pwa.js')
  assert.doesNotMatch(cleanup, /serviceWorker\.register/)
  assert.match(cleanup, /getRegistrations\(\)/)
  assert.match(cleanup, /cacheName\.indexOf\('med401-pwa-'\) === 0/)

  const cleanupWorker = read('public/sw.js')
  assert.doesNotMatch(cleanupWorker, /addEventListener\('fetch'/)
  assert.match(cleanupWorker, /registration\.unregister\(\)/)
  assert.match(cleanupWorker, /LEGACY_CACHE_PREFIX = 'med401-pwa-'/)
})

test('section selector is centered and the wide review remains fully visible', () => {
  const style = read('src/style.css')
  const html = read('index.html')
  assert.match(style, /\.section-selector__grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,/s)
  assert.match(style, /@media \(max-width:\s*860px\)[\s\S]*?\.section-selector__grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,/s)
  assert.match(style, /\.section-choice\[data-select-section="tools"\] span/)
  assert.match(style, /\.section-selector__header,[\s\S]*?\.section-selector__footer\s*\{[^}]*text-align:\s*center;/s)
  assert.match(style, /\.section-choice\s*\{[\s\S]*?align-items:\s*center;[\s\S]*?justify-content:\s*center;/s)
  assert.match(style, /\.home-review-screenshot\s*\{[\s\S]*?aspect-ratio:\s*1\.9\s*\/\s*1;[\s\S]*?object-fit:\s*cover;/s)
  assert.match(style, /\.home-review-screenshot--fit\s*\{[^}]*object-fit:\s*contain;[^}]*object-position:\s*left center;/s)
  assert.equal((html.match(/review5\.jpg" class="home-review-screenshot home-review-screenshot--fit"/g) || []).length, 2)
  assert.match(html, /style\.css\?v=20260728-profile-avatar-dialog-v3/)
  assert.match(html, /main\.js\?v=20260728-profile-avatar-dialog-v3/)
  assert.match(style, /body\[data-site-mode="selector"\] > main > \.site-footer/)

  for (const file of ['review1.jpg', 'review2.jpg', 'review3.jpg', 'review4.jpg', 'review5.jpg', 'review6.png', 'review7.png', 'review8.png']) {
    assert.deepEqual(readBytes(`assets/reviews/${file}`), readBytes(`public/assets/reviews/${file}`), `${file} deployment mirror is out of sync`)
  }
})

test('topic completion control is enlarged and attached to the card corner', () => {
  const style = read('src/style.css')
  const mainSource = read('src/main.js')
  assert.match(style, /\.topic-item__heading\s*\{[^}]*padding-right:\s*112px;/s)
  assert.match(style, /\.topic-completion\s*\{[^}]*position:\s*absolute;[^}]*top:\s*0;[^}]*right:\s*0;/s)
  assert.match(style, /\.topic-completion__item\s*\{[^}]*border-top:\s*0;[^}]*border-right:\s*0;[^}]*border-radius:\s*0 var\(--radius\) 0 12px;/s)
  assert.match(style, /\.topic-completion__item input\s*\{[^}]*width:\s*20px;[^}]*height:\s*20px;/s)
  assert.match(style, /\.admin-save-btn\s*\{[^}]*background:\s*linear-gradient\(135deg, #f4d477, var\(--gold\)\);/s)
  assert.doesNotMatch(style, /\.admin-save-btn\s*\{[^}]*background:\s*var\(--accent\);/s)
  assert.match(style, /\.global-progress\s*\{[^}]*width:\s*min\(320px,\s*calc\(100% - 48px\)\);/s)
  assert.match(style, /\.global-progress__metric\s*\{[^}]*background:\s*transparent;[^}]*box-shadow:\s*none;/s)
  assert.match(mainSource, /<\/span>\s*\$\{renderTopicCompletionControls\(subject, topic\)\}\s*\$\{adminControls\}/s)
  assert.doesNotMatch(mainSource, /topic-item__heading[\s\S]{0,250}renderTopicCompletionControls\(subject, topic\)/)
  assert.match(style, /\.tracker-admin-topic-controls\s*\{[^}]*flex:\s*1 1 100%;[^}]*box-sizing:\s*border-box;[^}]*max-width:\s*100%;/s)
  assert.doesNotMatch(style, /\.tracker-admin-topic-controls\s*\{[^}]*margin-left:\s*40px;/s)
})

test('MED-2 exposes the standalone Cardio and Chest revision tool', () => {
  const html = read('index.html')
  const revisionTool = read('cardio-chest-revision.html')
  const mainSource = read('src/main.js')
  const style = read('src/style.css')
  const viteConfig = read('vite.config.js')

  assert.match(html, /id="subject-revision-launcher" hidden/)
  assert.match(mainSource, /function renderSubjectRevisionLauncher\s*\(subject\)/)
  assert.match(mainSource, /if \(subject\.code !== 'MED-2'\) return ''/)
  assert.match(mainSource, /href="\/cardio-chest-revision\.html"/)
  assert.match(mainSource, /target="_blank"/)
  assert.match(mainSource, /rel="noopener noreferrer"/)
  assert.match(mainSource, /Cardio &amp; Chest Premium Revision Tool/)
  assert.match(mainSource, /\$\{renderSubjectRevisionLauncher\(subject\)\}[\s\S]*?<ul class="topic-list topic-list--inline">/)
  assert.match(style, /\.subject-revision-launcher\s*\{[^}]*display:\s*flex;[^}]*border-radius:\s*8px;/s)
  assert.match(viteConfig, /cardioChestRevision:\s*resolve\(__dirname,\s*'cardio-chest-revision\.html'\)/)
  assert.match(revisionTool, /<title>Cardio &amp; Chest Premium Revision Tool<\/title>/)
})

test('Today cockpit turns saved progress and real section data into one accessible next action', () => {
  const html = read('index.html')
  const profileHtml = read('profile.html')
  const mainSource = read('src/main.js')
  const style = read('src/style.css')

  assert.match(html, /class="skip-link" href="#tracker-main-content"/)
  assert.match(profileHtml, /class="skip-link" href="#profile-main-content"/)
  assert.match(html, /id="today-cockpit"[^>]*aria-labelledby="today-cockpit-title"/)
  assert.match(html, /id="today-cockpit-freshness"[^>]*role="status"[^>]*aria-live="polite"/)
  assert.match(html, /id="today-primary-action"[^>]*data-today-action="quiz"/)
  assert.match(html, /<label class="sr-only" for="tracker-search">/)
  assert.equal((html.match(/<main\b/g) || []).length, 1, 'homepage must have one main landmark')
  assert.doesNotMatch(html, /<main class="layout">/)

  for (const helper of [
    'getTodayUpcomingExam',
    'getTodayContinueCandidate',
    'getTodayBoardUpdate',
    'renderTodayFreshnessStatus',
    'renderTodayCockpit',
    'activateManagedModal',
    'deactivateManagedModal'
  ]) {
    assert.match(mainSource, new RegExp(`function ${helper}\\s*\\(`), `${helper} is missing`)
  }

  assert.match(mainSource, /openQuiz\(topicLabel, sourceId, event, \{ resumeDirectly: true \}\)/)
  assert.match(mainSource, /Offline · showing saved page data/)
  assert.match(mainSource, /Progress saved on this device/)
  assert.match(mainSource, /Class Board unavailable · showing built-in updates/)
  assert.match(mainSource, /element\.inert = true/)
  assert.match(mainSource, /event\.key === 'Escape'/)

  assert.match(style, /\.today-cockpit\s*\{/)
  assert.match(style, /\.today-primary-action:focus-visible/)
  assert.match(style, /env\(safe-area-inset-bottom\)/)
  assert.match(style, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.today-primary-action/s)
  assert.match(style, /\.quiz-modal__panel,[\s\S]*?overscroll-behavior:\s*contain;/s)

  for (const pageHtml of [html, profileHtml]) {
    const imageTags = pageHtml.match(/<img\b[^>]*>/g) || []
    imageTags.forEach((tag) => {
      assert.match(tag, /\bwidth="\d+"/, `image is missing width: ${tag}`)
      assert.match(tag, /\bheight="\d+"/, `image is missing height: ${tag}`)
    })
  }
})

test('deployment includes every public page and requires tests before build', () => {
  const viteConfig = read('vite.config.js')
  for (const page of ['index.html', 'admin/index.html', 'schedule.html', 'history.html', 'cardio-chest-revision.html', 'work.html']) {
    assert.ok(viteConfig.includes(`'${page}'`), `${page} is missing from the Vite build`)
  }

  const deployment = read('.github/workflows/deploy.yml')
  assert.match(deployment, /- name: Test\s+run: npm test/)
  assert.ok(deployment.indexOf('run: npm test') < deployment.indexOf('run: npm run build'))
})
