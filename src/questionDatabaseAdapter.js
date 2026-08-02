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
        mode: row.source?.organization?.mode || 'standard',
        organization: row.source?.organization || null,
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
      sourceOrder: Number(row.source_order) || 0,
      section: row.subject_code,
      topicTags: [row.topic_label, row.subject_code]
    })
  })

  return new Map([...byTopic].map(([topicKey, sources]) => [
    topicKey,
    [...sources.values()].map((source) => {
      source.mcqs.sort((a, b) => a.sourceOrder - b.sourceOrder)
      const organizationParts = Array.isArray(source.organization?.parts)
        ? [...source.organization.parts]
          .filter((part) => part && part.key && Number(part.startOrder) > 0 && Number(part.endOrder) >= Number(part.startOrder))
          .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder))
        : []

      if (organizationParts.length) {
        const partCount = organizationParts.length
        const groupId = `${source.id}::group`
        source.collection = {
          groups: [{
            id: groupId,
            label: source.organization.groupLabel || source.label,
            parts: organizationParts.map((part, index) => ({
              id: `${source.id}::${part.key}`,
              label: part.label || `Part ${index + 1}`,
              description: part.description || '',
              mcqs: source.mcqs.filter((question) => (
                question.sourceOrder >= Number(part.startOrder)
                && question.sourceOrder <= Number(part.endOrder)
              )),
              parentSourceId: source.id,
              groupId,
              groupLabel: source.organization.groupLabel || source.label,
              partIndex: index,
              partCount,
              mode: 'standard'
            }))
          }]
        }
      }

      return source
    })
  ]))
}
