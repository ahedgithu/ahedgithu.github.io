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
    'src/mcqs.js',
    'src/sur1-kellawi-mcqs.js',
    'src/sur1-past-exam-mcqs.js',
    'src/sur1-matching-questions.js',
    'src/progress.js',
    'src/supabaseClient.js'
  ]

  for (const file of moduleFiles) {
    execFileSync(process.execPath, ['--check', file], { cwd: new URL('..', import.meta.url) })
  }

  const mirroredFiles = ['main.js', 'admin.js', 'analytics.js', 'mcqs.js', 'sur1-kellawi-mcqs.js', 'sur1-past-exam-mcqs.js', 'sur1-matching-questions.js', 'progress.js', 'style.css', 'supabaseClient.js']
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

test('SUR 401-1 Kellawi MCQ bank is complete and wired', () => {
  const context = { window: { mcqQuizzes: {} } }
  vm.runInNewContext(read('src/sur1-kellawi-mcqs.js'), context)

  const quiz = context.window.mcqQuizzes['SUR 401-1 MCQs']
  assert.equal(quiz.alwaysShowSourcePicker, true)
  assert.equal(quiz.sources.length, 1)
  assert.equal(quiz.sources[0].label, 'Kellawi MCQs')
  assert.equal(quiz.sources[0].mcqs.length, 1187)

  const collection = quiz.sources[0].collection
  assert.deepEqual(
    Array.from(collection.groups, (group) => [group.label, group.questionCount, group.parts.length]),
    [
      ['Spleen', 207, 6],
      ['Stomach', 302, 8],
      ['Tongue', 91, 3],
      ['Esophagus', 205, 6],
      ['Liver', 382, 10]
    ]
  )
  assert.deepEqual(
    Array.from(collection.groups, (group) => Array.from(group.parts, (part) => part.mcqs.length)),
    [
      [35, 35, 35, 34, 34, 34],
      [38, 38, 38, 38, 38, 38, 37, 37],
      [31, 30, 30],
      [35, 34, 34, 34, 34, 34],
      [39, 39, 38, 38, 38, 38, 38, 38, 38, 38]
    ]
  )

  const parts = Array.from(collection.groups, (group) => Array.from(group.parts)).flat()
  const partQuestions = parts.flatMap((part) => Array.from(part.mcqs))
  assert.equal(parts.length, 33)
  assert.equal(partQuestions.length, 1187)
  assert.equal(new Set(partQuestions.map((question) => question.id)).size, 1187)
  assert.ok(parts.every((part) => part.mcqs.length >= 30 && part.mcqs.length <= 39))
  assert.deepEqual(Array.from(collection.mixedSizes, (mode) => mode.size), [20, 30, 50])
  assert.equal(collection.wrongReviewId, 'kellawi-wrong-review')
  assert.equal(quiz.sources[0].mcqs.filter((question) => question.source).length, 1186)
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
  assert.match(mainSource, /Ready\? Let’s solve it organ by organ\./)
  assert.match(mainSource, /1,187 questions · 5 organs · 33 short parts/)
  assert.ok(readBytes('public/assets/mohamed-kellawi-avatar.jpg').length > 0)

  const index = read('index.html')
  assert.match(index, /data-quiz-topic=["']SUR 401-1 MCQs["']/)
  assert.match(index, /sur1-kellawi-mcqs\.js/)
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
  assert.match(html, /id="student-sync-avatar"/)
  assert.match(html, /class="tracker-anonymous-control"[^>]*id="leaderboard-anon-toggle"/)
  assert.doesNotMatch(html, /data-student-sync-login/)
  assert.doesNotMatch(html, /id="student-sync-label"/)
  assert.match(style, /\.auth-gate\s*\{[^}]*display:\s*grid;[^}]*place-items:\s*center;/s)
  assert.match(style, /\.auth-gate__brand img\s*\{[^}]*object-fit:\s*contain;/s)
  assert.doesNotMatch(style, /\n\+\s*\n\s*\.auth-gate/)
  assert.match(style, /body\[data-auth-state\]:not\(\[data-auth-state="ready"\]\) > :not\(\.auth-gate\):not\(\.admin-login-modal\):not\(script\)/)
  assert.match(style, /body\[data-auth-state="signed-out"\] \[data-auth-panel="signed-out"\]/)
  assert.match(style, /body\[data-auth-state="needs-section"\] \[data-auth-panel="needs-section"\]/)
  assert.match(style, /\.admin-login-modal\s*\{[^}]*z-index:\s*10020;/s)

  assert.match(supabaseClient, /select\('anonymous, selected_section, updated_at'\)/)
  assert.match(supabaseClient, /persistSession:\s*true/)
  assert.match(mainSource, /async function handleStudentAuthUser\s*\(/)
  assert.match(mainSource, /async function saveSelectedSection\s*\(/)
  assert.match(mainSource, /selected_section:\s*section/)
  assert.match(mainSource, /studentProgressState\.selectedSection \|\| activeAcademicSection/)
  assert.doesNotMatch(mainSource, /localStorage\.setItem\('selectedAcademicSection'/)

  assert.match(mainSource, /LOCAL_PROGRESS_OWNER_KEY = 'mustHubLocalProgressOwner'/)
  assert.match(mainSource, /function claimAndMigrateLocalProgress\s*\(/)
  assert.match(mainSource, /\$\{QUIZ_STORAGE_PREFIX\}::\$\{getProgressStorageOwnerId\(\)\}::\$\{section\}/)
  assert.match(mainSource, /\$\{TOPIC_COMPLETION_STORAGE_PREFIX\}::\$\{getProgressStorageOwnerId\(\)\}::\$\{section\}/)
  assert.match(schedule, /window\.location\.replace\('\/#schedule'\)/)
  assert.match(html, /style\.css\?v=20260719-auth-logo-v3/)
  assert.match(html, /main\.js\?v=20260719-auth-logo-v3/)
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
  assert.match(html, /style\.css\?v=20260719-auth-logo-v3/)
  assert.match(html, /main\.js\?v=20260719-auth-logo-v3/)
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
  assert.match(mainSource, /<\/span>\s*\$\{renderTopicCompletionControls\(subject, topic\)\}\s*\$\{adminControls\}/s)
  assert.doesNotMatch(mainSource, /topic-item__heading[\s\S]{0,250}renderTopicCompletionControls\(subject, topic\)/)
  assert.match(style, /\.tracker-admin-topic-controls\s*\{[^}]*flex:\s*0 0 100%;/s)
})

test('deployment includes every public page and requires tests before build', () => {
  const viteConfig = read('vite.config.js')
  for (const page of ['index.html', 'admin/index.html', 'schedule.html', 'history.html', 'work.html']) {
    assert.ok(viteConfig.includes(`'${page}'`), `${page} is missing from the Vite build`)
  }

  const deployment = read('.github/workflows/deploy.yml')
  assert.match(deployment, /- name: Test\s+run: npm test/)
  assert.ok(deployment.indexOf('run: npm test') < deployment.indexOf('run: npm run build'))
})
