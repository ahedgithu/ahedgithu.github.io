export function mapPublishedQuestionRowsToSources(rows, resolveTopicKey) {
  const byTopic = new Map()
  rows.forEach((row) => {
    const topicKey = resolveTopicKey(row)
    const sourcePublicId = row.source?.public_id || 'unknown-source'
    const sourceId = `db-${sourcePublicId}`
    if (!byTopic.has(topicKey)) byTopic.set(topicKey, new Map())
    const bySource = byTopic.get(topicKey)
    if (!bySource.has(sourceId)) {
      bySource.set(sourceId, {
        id: sourceId,
        label: row.source?.title || 'Imported MCQs',
        description: row.source?.reference_text || 'Published by a scoped tracker administrator.',
        mcqs: [],
        shuffleQuestions: false,
        shuffleOptions: false,
        mode: 'standard',
        databaseBacked: true
      })
    }
    const orderedChoices = [...(row.choices || [])].sort((a, b) => a.display_order - b.display_order)
    bySource.get(sourceId).mcqs.push({
      id: row.public_id,
      question: row.stem,
      options: orderedChoices.map((choice) => ({ id: choice.choice_key, text: choice.choice_text })),
      correctOptionId: orderedChoices.find((choice) => choice.is_correct)?.choice_key || '',
      explanation: row.explanation || '',
      source: row.source?.title || '',
      section: row.subject_code,
      topicTags: [row.topic_label, row.subject_code]
    })
  })
  return new Map([...byTopic].map(([topicKey, sources]) => [topicKey, [...sources.values()]]))
}
