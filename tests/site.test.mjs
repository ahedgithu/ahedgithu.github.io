import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const root = new URL('..', import.meta.url)
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('application modules are valid and mirrored', () => {
  for (const file of ['main.js', 'analytics.js', 'mcqs.js']) {
    execFileSync(process.execPath, ['--check', `src/${file}`], { cwd: root })
    assert.equal(read(`src/${file}`), read(`public/src/${file}`), `${file} mirror is out of sync`)
  }

  assert.equal(read('src/style.css'), read('public/src/style.css'), 'style.css mirror is out of sync')
})

test('public source does not contain privileged Supabase credentials', () => {
  const publicSources = [
    read('index.html'),
    read('schedule.html'),
    read('src/main.js'),
    read('src/analytics.js')
  ].join('\n')

  assert.doesNotMatch(publicSources, /service[_-]?role|sb_secret_/i)
})

test('deployment includes every public page and requires tests before build', () => {
  const viteConfig = read('vite.config.js')
  for (const page of ['index.html', 'schedule.html', 'history.html', 'work.html']) {
    assert.ok(viteConfig.includes(`'${page}'`), `${page} is missing from the Vite build`)
  }

  const deployment = read('.github/workflows/deploy.yml')
  assert.match(deployment, /- name: Test\s+run: npm test/)
  assert.ok(deployment.indexOf('run: npm test') < deployment.indexOf('run: npm run build'))
})
