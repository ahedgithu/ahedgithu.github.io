import assert from 'node:assert/strict'
import test from 'node:test'

import { mapPublishedQuestionRowsToSources } from '../src/questionDatabaseAdapter.js'

test('database adapter groups sources and preserves stable question and answer IDs', () => {
  const rows = [{
    public_id: '11111111-1111-4111-8111-111111111111',
    university_id: 'must',
    section: '401',
    subject_code: 'MED 401-1',
    topic_label: 'Peptic ulcer disease',
    stem: 'Which statement is correct?',
    explanation: 'Supplied explanation.',
    source: {
      public_id: '22222222-2222-4222-8222-222222222222',
      title: 'Department revision',
      reference_text: 'Sheet 1'
    },
    choices: [
      { choice_key: 'B', choice_text: 'Second', display_order: 2, is_correct: true },
      { choice_key: 'A', choice_text: 'First', display_order: 1, is_correct: false },
      { choice_key: 'C', choice_text: 'Third', display_order: 3, is_correct: false },
      { choice_key: 'D', choice_text: 'Fourth', display_order: 4, is_correct: false }
    ]
  }]

  const mapped = mapPublishedQuestionRowsToSources(rows, () => 'MED 401-1 MCQs')
  const source = mapped.get('MED 401-1 MCQs')[0]
  const question = source.mcqs[0]

  assert.equal(source.id, 'db-22222222-2222-4222-8222-222222222222')
  assert.equal(question.id, '11111111-1111-4111-8111-111111111111')
  assert.deepEqual(question.options.map((option) => option.id), ['A', 'B', 'C', 'D'])
  assert.equal(question.correctOptionId, 'B')
  assert.equal(question.source, 'Department revision')
  assert.deepEqual(question.topicTags, ['Peptic ulcer disease', 'MED 401-1'])
})
