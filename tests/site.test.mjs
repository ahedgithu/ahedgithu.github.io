import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { calculatePercent, calculateQuizProgress } from '../src/progress.js'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('application modules are valid and mirrored', () => {
  const moduleFiles = [
    'src/main.js',
    'src/admin.js',
    'src/analytics.js',
    'src/mcqs.js',
    'src/progress.js',
    'src/supabaseClient.js'
  ]

  for (const file of moduleFiles) {
    execFileSync(process.execPath, ['--check', file], { cwd: new URL('..', import.meta.url) })
  }

  const mirroredFiles = ['main.js', 'admin.js', 'analytics.js', 'mcqs.js', 'progress.js', 'style.css', 'supabaseClient.js']
  for (const file of mirroredFiles) {
    assert.equal(read(`src/${file}`), read(`public/src/${file}`), `${file} mirror is out of sync`)
  }

  const mainSource = read('src/main.js')
  assert.match(mainSource, /function updateGlobalProgress\s*\(/)
  assert.match(mainSource, /function initStudentSync\s*\(/)

  const index = read('index.html')
  for (const id of ['admin-login-modal', 'tracker-admin-login-form', 'tracker-admin-email-input', 'tracker-admin-password-input', 'tracker-admin-login-status', 'tracker-admin-edit-panel']) {
    assert.match(index, new RegExp(`id=["']${id}["']`), `${id} is missing from the admin login UI`)
  }
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
  assert.match(html, /style\.css\?v=20260713-boxless-topic-controls-v2/)
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
