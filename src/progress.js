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

export function calculateMasteryLevel(totalScore, thresholds) {
  const points = Math.max(0, Number(totalScore) || 0)
  const safeThresholds = Array.isArray(thresholds) && thresholds.length ? thresholds : [0]
  let thresholdIndex = 0
  safeThresholds.forEach((threshold, index) => {
    if (points >= threshold) thresholdIndex = index
  })

  const currentThreshold = safeThresholds[thresholdIndex]
  const fallbackStep = Math.max(1000, currentThreshold || 1000)
  const nextThreshold = safeThresholds[thresholdIndex + 1] ?? currentThreshold + fallbackStep

  return {
    level: thresholdIndex + 1,
    nextLevel: thresholdIndex + 2,
    nextThreshold,
    remaining: Math.max(0, nextThreshold - points),
    progress: calculatePercent(points - currentThreshold, nextThreshold - currentThreshold)
  }
}

export function getConfirmedProfileLevelTransition({
  confirmed = false,
  completed = false,
  transient = false,
  previousPoints,
  nextPoints,
  resolveLevel
} = {}) {
  if (previousPoints === null || previousPoints === undefined || nextPoints === null || nextPoints === undefined) {
    return null
  }
  const beforePoints = Number(previousPoints)
  const afterPoints = Number(nextPoints)
  if (
    !confirmed
    || !completed
    || transient
    || typeof resolveLevel !== 'function'
    || !Number.isFinite(beforePoints)
    || !Number.isFinite(afterPoints)
    || afterPoints <= beforePoints
  ) {
    return null
  }

  const previous = resolveLevel(beforePoints)
  const next = resolveLevel(afterPoints)
  if (!previous || !next || !Number.isFinite(previous.level) || !Number.isFinite(next.level)) return null
  if (next.level <= previous.level) return null

  return {
    previousLevel: previous.level,
    newLevel: next.level,
    previousPoints: beforePoints,
    newPoints: afterPoints,
    nextLevel: next.nextLevel,
    remaining: next.remaining,
    progress: next.progress
  }
}

export function claimProfileLevelTransition(seenTransitions, transitionKey) {
  if (!(seenTransitions instanceof Set) || !transitionKey || seenTransitions.has(transitionKey)) return false
  seenTransitions.add(transitionKey)
  return true
}

export function enqueueSerialTask(queue, key, task) {
  if (!(queue instanceof Map) || !key || typeof task !== 'function') return Promise.resolve(null)
  const previous = queue.get(key) || Promise.resolve()
  const current = previous
    .catch(() => null)
    .then(task)

  queue.set(key, current)
  current
    .finally(() => {
      if (queue.get(key) === current) queue.delete(key)
    })
    .catch(() => {})
  return current
}
