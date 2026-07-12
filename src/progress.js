export function calculatePercent(completed, total) {
  if (!Number.isFinite(total) || total <= 0) return 0
  const safeCompleted = Number.isFinite(completed) ? completed : 0
  return Math.round((Math.min(Math.max(safeCompleted, 0), total) / total) * 100)
}

export function calculateQuizProgress(questionIds, answeredQuestionIds) {
  const questions = Array.isArray(questionIds) ? questionIds : []
  const answered = new Set(Array.isArray(answeredQuestionIds) ? answeredQuestionIds : [])
  const answeredCount = questions.filter((questionId) => answered.has(questionId)).length
  const total = questions.length

  return {
    answeredCount,
    remainingCount: Math.max(total - answeredCount, 0),
    percent: calculatePercent(answeredCount, total),
    total
  }
}
