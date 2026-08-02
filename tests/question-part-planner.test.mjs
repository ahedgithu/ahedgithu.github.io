import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  normalizeMode,
  planQuestionParts,
  validateCustomPartCounts
} from '../src/questionPartPlanner.js'

test('questionPartPlanner - single mode returns empty parts array', () => {
  const result = planQuestionParts(50, { mode: 'single', groupLabel: 'Master Exam' })
  assert.equal(result.mode, 'single')
  assert.equal(result.groupLabel, 'Master Exam')
  assert.deepEqual(result.parts, [])
})

test('questionPartPlanner - balanced mode distributes 100 questions into 4 equal parts of 25', () => {
  const result = planQuestionParts(100, { mode: 'balanced', targetSize: 30, groupLabel: 'Surgery' })
  assert.equal(result.mode, 'balanced')
  assert.equal(result.groupLabel, 'Surgery')
  assert.equal(result.parts.length, 4)

  assert.deepEqual(result.parts[0], {
    key: 'part-1',
    label: 'Part 1',
    description: '',
    displayOrder: 1,
    startOrder: 1,
    endOrder: 25,
    questionCount: 25
  })
  assert.deepEqual(result.parts[1], {
    key: 'part-2',
    label: 'Part 2',
    description: '',
    displayOrder: 2,
    startOrder: 26,
    endOrder: 50,
    questionCount: 25
  })
  assert.deepEqual(result.parts[2], {
    key: 'part-3',
    label: 'Part 3',
    description: '',
    displayOrder: 3,
    startOrder: 51,
    endOrder: 75,
    questionCount: 25
  })
  assert.deepEqual(result.parts[3], {
    key: 'part-4',
    label: 'Part 4',
    description: '',
    displayOrder: 4,
    startOrder: 76,
    endOrder: 100,
    questionCount: 25
  })
})

test('questionPartPlanner - balanced mode distributes 70 questions with target 30 into sizes 24, 23, 23 (max diff 1)', () => {
  const result = planQuestionParts(70, { mode: 'balanced', targetSize: 30 })
  assert.equal(result.mode, 'balanced')
  assert.equal(result.parts.length, 3)

  assert.equal(result.parts[0].questionCount, 24)
  assert.equal(result.parts[0].startOrder, 1)
  assert.equal(result.parts[0].endOrder, 24)

  assert.equal(result.parts[1].questionCount, 23)
  assert.equal(result.parts[1].startOrder, 25)
  assert.equal(result.parts[1].endOrder, 47)

  assert.equal(result.parts[2].questionCount, 23)
  assert.equal(result.parts[2].startOrder, 48)
  assert.equal(result.parts[2].endOrder, 70)

  // Verify total and contiguous coverage
  const totalInParts = result.parts.reduce((sum, p) => sum + p.questionCount, 0)
  assert.equal(totalInParts, 70)
})

test('questionPartPlanner - custom mode preserves custom labels, descriptions, and computes Q ranges', () => {
  const customParts = [
    { key: 'untrusted-key', label: 'Gastroenterology', description: 'Stomach & intestines', questionCount: 15 },
    { label: 'Hepatology', description: 'Liver & biliary system', questionCount: 20 }
  ]
  const result = planQuestionParts(35, { mode: 'custom', groupLabel: 'Internal Medicine', customParts })
  assert.equal(result.mode, 'custom')
  assert.equal(result.groupLabel, 'Internal Medicine')
  assert.equal(result.parts.length, 2)

  assert.deepEqual(result.parts[0], {
    key: 'part-1',
    label: 'Gastroenterology',
    description: 'Stomach & intestines',
    displayOrder: 1,
    startOrder: 1,
    endOrder: 15,
    questionCount: 15
  })
  assert.deepEqual(result.parts[1], {
    key: 'part-2',
    label: 'Hepatology',
    description: 'Liver & biliary system',
    displayOrder: 2,
    startOrder: 16,
    endOrder: 35,
    questionCount: 20
  })
})

test('questionPartPlanner - balanced mode keeps a small bank together when target exceeds total', () => {
  const result = planQuestionParts(12, { mode: 'balanced', targetSize: 30 })
  assert.equal(result.parts.length, 1)
  assert.deepEqual(result.parts[0], {
    key: 'part-1',
    label: 'Part 1',
    description: '',
    displayOrder: 1,
    startOrder: 1,
    endOrder: 12,
    questionCount: 12
  })
})

test('questionPartPlanner - validateCustomPartCounts enforces exact coverage and positive integers', () => {
  // Matching total
  const valid = validateCustomPartCounts([{ questionCount: 10 }, { questionCount: 20 }], 30)
  assert.equal(valid.valid, true)
  assert.equal(valid.issues.length, 0)

  // Under coverage
  const under = validateCustomPartCounts([{ questionCount: 10 }], 30)
  assert.equal(under.valid, false)
  assert.ok(under.issues.some((msg) => msg.includes('less than')))

  // Over coverage
  const over = validateCustomPartCounts([{ questionCount: 20 }, { questionCount: 20 }], 30)
  assert.equal(over.valid, false)
  assert.ok(over.issues.some((msg) => msg.includes('exceeds')))

  // Non-positive integer count
  const zeroCount = validateCustomPartCounts([{ questionCount: 0 }, { questionCount: 30 }], 30)
  assert.equal(zeroCount.valid, false)
  assert.ok(zeroCount.issues.some((msg) => msg.includes('positive integer')))
})

test('src and public mirrors of questionPartPlanner.js are byte-identical', async () => {
  const srcCode = await readFile(new URL('../src/questionPartPlanner.js', import.meta.url), 'utf8')
  const publicCode = await readFile(new URL('../public/src/questionPartPlanner.js', import.meta.url), 'utf8')
  assert.equal(srcCode, publicCode)
})
