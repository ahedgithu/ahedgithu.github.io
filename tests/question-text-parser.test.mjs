import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import {
  QUESTION_TEXT_PARSER_VERSION,
  createQuestionFingerprint,
  parseQuestionText
} from '../src/questionTextParser.js'

const validFixtureUrl = new URL('./fixtures/question-text-valid.txt', import.meta.url)
const invalidFixtureUrl = new URL('./fixtures/question-text-invalid.txt', import.meta.url)

test('parser accepts source-faithful four- and five-choice blocks', async () => {
  const result = parseQuestionText(await readFile(validFixtureUrl, 'utf8'))

  assert.equal(result.parserVersion, QUESTION_TEXT_PARSER_VERSION)
  assert.equal(result.questions.length, 2)
  assert.equal(result.blockingIssues.length, 0)
  assert.equal(result.questions[0].answerKey, 'B')
  assert.equal(result.questions[1].choices.length, 5)
  assert.equal(result.questions[1].choices[3].isCorrect, true)
  assert.equal(result.questions[0].stem, 'Which statement is correct?')
})

test('parser reports malformed answers, duplicates, choice counts, and missing separators', async () => {
  const result = parseQuestionText(await readFile(invalidFixtureUrl, 'utf8'))
  const codes = new Set(result.issues.map((issue) => issue.code))

  assert.equal(result.questions.length, 2)
  assert.ok(codes.has('wrong_choice_count'))
  assert.ok(codes.has('duplicate_choice_text'))
  assert.ok(codes.has('invalid_answer'))
  assert.ok(codes.has('missing_separator'))
  assert.ok(codes.has('empty_explanation'))
  assert.ok(result.issues.every((issue) => issue.location.startLine >= 1))
})

test('parser keeps wording while fingerprints normalize whitespace and case only', () => {
  const source = `Q:  Which   Statement is CORRECT?\nA) Alpha\nB) Beta\nC) Gamma\nD) Delta\nANSWER: A`
  const result = parseQuestionText(source)

  assert.equal(result.questions[0].stem, 'Which Statement is CORRECT?')
  assert.equal(createQuestionFingerprint(result.questions[0].stem), 'which statement is correct?')
  assert.equal(result.questions[0].explanation, '')
  assert.ok(result.warnings.some((issue) => issue.code === 'empty_explanation'))
})

test('parser detects normalized duplicates inside one import', () => {
  const question = `Q: Same stem?\nA) One\nB) Two\nC) Three\nD) Four\nANSWER: A`
  const result = parseQuestionText(`${question}\n---\n${question.replace('Same stem?', 'same   stem?')}`)

  assert.ok(result.warnings.some((issue) => issue.code === 'exact_import_duplicate'))
})

test('empty input produces one blocking import issue', () => {
  const result = parseQuestionText('   ')
  assert.equal(result.questions.length, 0)
  assert.deepEqual(result.blockingIssues.map((issue) => issue.code), ['empty_import'])
})
