import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  calculateMasteryLevel,
  claimProfileLevelTransition,
  enqueueSerialTask,
  getConfirmedProfileLevelTransition
} from '../src/progress.js'
import {
  playExclusiveAudioPlayback,
  soundPackAllowsPlayback,
  stopExclusiveAudioPlayback
} from '../src/audioFeedback.js'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const readBytes = (path) => readFileSync(new URL(`../${path}`, import.meta.url))
const thresholds = [0, 50, 100, 250, 500, 1000, 2000, 3500, 5000]
const resolveLevel = (points) => calculateMasteryLevel(points, thresholds)

test('confirmed lifetime points produce one full level transition', () => {
  assert.deepEqual(
    getConfirmedProfileLevelTransition({
      confirmed: true,
      completed: true,
      previousPoints: 49,
      nextPoints: 50,
      resolveLevel
    }),
    {
      previousLevel: 1,
      newLevel: 2,
      previousPoints: 49,
      newPoints: 50,
      nextLevel: 3,
      remaining: 50,
      progress: 0
    }
  )

  const multiLevel = getConfirmedProfileLevelTransition({
    confirmed: true,
    completed: true,
    previousPoints: 49,
    nextPoints: 251,
    resolveLevel
  })
  assert.equal(multiLevel.previousLevel, 1)
  assert.equal(multiLevel.newLevel, 4)
  assert.equal(multiLevel.newPoints, 251)
})

test('restoration, incomplete saves, transient quizzes, and non-scoring updates do not level up', () => {
  const base = {
    confirmed: true,
    completed: true,
    previousPoints: 49,
    nextPoints: 50,
    resolveLevel
  }

  assert.equal(getConfirmedProfileLevelTransition({ ...base, confirmed: false }), null)
  assert.equal(getConfirmedProfileLevelTransition({ ...base, completed: false }), null)
  assert.equal(getConfirmedProfileLevelTransition({ ...base, transient: true }), null)
  assert.equal(getConfirmedProfileLevelTransition({ ...base, nextPoints: 49 }), null)
  assert.equal(getConfirmedProfileLevelTransition({ ...base, previousPoints: 50, nextPoints: 50 }), null)
  assert.equal(getConfirmedProfileLevelTransition({ ...base, previousPoints: 50, nextPoints: 51 }), null)
  assert.equal(getConfirmedProfileLevelTransition({ ...base, previousPoints: null }), null)
})

test('the same level transition can only be claimed once', () => {
  const seenTransitions = new Set()
  assert.equal(claimProfileLevelTransition(seenTransitions, 'student::401::1-2-50'), true)
  assert.equal(claimProfileLevelTransition(seenTransitions, 'student::401::1-2-50'), false)
  assert.equal(seenTransitions.size, 1)
})

test('level-up confirmation is completion-only and uses ordered authoritative scores', () => {
  const mainSource = read('src/main.js')
  const confirmationCalls = mainSource.match(/saveQuizState\(\{ confirmLevelUp: true \}\)/g) || []
  assert.equal(confirmationCalls.length, 1, 'only an explicit manual completion always requests confirmation')
  assert.match(mainSource, /saveQuizState\(\{ confirmLevelUp: quizState\.validatedInSession \}\)/)
  assert.match(mainSource, /quizState\.validatedInSession = false/)
  assert.match(mainSource, /quizState\.validatedInSession = true/)
  assert.match(mainSource, /previousLifetimePoints = await fetchLifetimePointsSnapshot\([^)]*\)/s)
  assert.match(mainSource, /const savedProgress = await upsertUserQuizProgress\(/)
  assert.match(
    mainSource,
    /const nextLifetimePoints = await fetchLifetimePointsSnapshot\([\s\S]*?\{ syncLeaderboard: true \}[\s\S]*?\)[\s\S]*?getConfirmedProfileLevelTransition/
  )
  assert.match(mainSource, /if \(quizState\.completed\) return\s+const missedQuestions = getMissedQuestions\(\)/)
  assert.match(mainSource, /if \(quizState\.answers\[question\.id\] !== undefined\) return/)
  assert.match(mainSource, /if \(quizState\.transient\) return Promise\.resolve\(null\)/)
  assert.match(mainSource, /enqueueSerialTask\(quizProgressSyncQueues, progressSyncKey, queuedSync\)/)
  assert.match(mainSource, /enqueueSerialTask\(quizLevelUpSyncQueues, levelUpSyncKey, performSync\)/)
  assert.match(mainSource, /sessionGeneration: quizSessionGeneration/)
  assert.match(mainSource, /quizSessionGeneration !== context\.sessionGeneration/)
})

test('serial task queues preserve score snapshot and upsert order', async () => {
  const queue = new Map()
  const events = []
  let releaseFirst
  const firstGate = new Promise((resolve) => {
    releaseFirst = resolve
  })

  const first = enqueueSerialTask(queue, 'student::401', async () => {
    events.push('first:start')
    await firstGate
    events.push('first:end')
  })
  const second = enqueueSerialTask(queue, 'student::401', async () => {
    events.push('second:start')
    events.push('second:end')
  })

  await Promise.resolve()
  await Promise.resolve()
  assert.deepEqual(events, ['first:start'])
  releaseFirst()
  await Promise.all([first, second])
  assert.deepEqual(events, ['first:start', 'first:end', 'second:start', 'second:end'])
  assert.equal(queue.size, 0)
})

test('level-up audio respects packs and preempts active feedback without overlap', async () => {
  const mainSource = read('src/main.js')
  const levelUpUrl = mainSource.match(/const QUIZ_LEVEL_UP_AUDIO_URL = '([^']+)'/)?.[1]
  assert.ok(levelUpUrl)
  assert.ok(readBytes(`public${levelUpUrl}`).length > 1000)
  assert.match(mainSource, /muted:\s*\{[\s\S]*?levelUpUrl: ''/)
  assert.equal((mainSource.match(/levelUpUrl: QUIZ_LEVEL_UP_AUDIO_URL/g) || []).length, 2)
  assert.match(
    mainSource,
    /function playQuizLevelUpSound\(\) \{\s*if \(!soundPackAllowsPlayback\(quizSoundPack\)\) return\s*playQuizFeedbackAudio\(ensureQuizFeedbackAudio\(\)\?\.levelUp\)\s*\}/
  )

  assert.equal(soundPackAllowsPlayback('muted'), false)
  assert.equal(soundPackAllowsPlayback('valorant'), true)
  assert.equal(soundPackAllowsPlayback('duolingo'), true)

  const events = []
  const makeAudio = (name) => ({
    currentTime: 8,
    pause() {
      events.push(`${name}:pause`)
    },
    play() {
      events.push(`${name}:play`)
      return Promise.resolve()
    }
  })
  const answerAudio = makeAudio('answer')
  const levelUpAudio = makeAudio('level-up')
  const state = { active: null, playbackId: 0 }

  await playExclusiveAudioPlayback(state, answerAudio)
  assert.equal(answerAudio.currentTime, 0)
  await playExclusiveAudioPlayback(state, levelUpAudio)
  assert.deepEqual(events, ['answer:play', 'answer:pause', 'level-up:play'])
  assert.equal(answerAudio.currentTime, 0)
  assert.equal(levelUpAudio.currentTime, 0)
  assert.equal(state.active, levelUpAudio)

  stopExclusiveAudioPlayback(state)
  assert.deepEqual(events, ['answer:play', 'answer:pause', 'level-up:play', 'level-up:pause'])
  assert.equal(state.active, null)
})

test('level-up UI is dismissible, responsive, and reduced-motion safe', () => {
  const mainSource = read('src/main.js')
  const style = read('src/style.css')

  assert.match(mainSource, /class="quiz-level-up"[^>]*role="status"[^>]*aria-live="polite"/)
  assert.match(mainSource, />LEVEL UP</)
  assert.match(mainSource, /data-level-up-previous/)
  assert.match(mainSource, /data-level-up-new/)
  assert.match(mainSource, /data-quiz-level-up-dismiss/)
  assert.match(mainSource, /setTimeout\(dismissQuizLevelUpCelebration, 2700\)/)
  assert.match(mainSource, /levels\.setAttribute\('aria-label', `Level \$\{transition\.previousLevel\} to Level \$\{transition\.newLevel\}`\)/)
  assert.match(style, /\.quiz-level-up\s*\{[\s\S]*?width:\s*min\(380px, calc\(100vw - 28px\)\);[\s\S]*?overflow:\s*hidden;/)
  assert.match(style, /@media \(max-width: 520px\)[\s\S]*?\.quiz-level-up/)
  assert.match(style, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.quiz-level-up__particles\s*\{[\s\S]*?display:\s*none;/)
})
