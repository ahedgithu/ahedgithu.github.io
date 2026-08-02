/**
 * questionPartPlanner.js
 * Pure DOM/network-free quiz-organization planner for text MCQ importing.
 */

export function normalizeMode(mode) {
  if (mode === 'balanced' || mode === 'Split evenly') return 'balanced'
  if (mode === 'custom' || mode === 'Custom named parts') return 'custom'
  return 'single'
}

export function validateCustomPartCounts(customParts, totalQuestions) {
  const issues = []
  const total = Math.max(0, Number(totalQuestions) || 0)

  if (!Array.isArray(customParts) || customParts.length === 0) {
    if (total > 0) {
      issues.push('At least one part row is required for custom organization.')
    }
    return { valid: issues.length === 0, issues, sum: 0 }
  }

  let sum = 0
  customParts.forEach((part, idx) => {
    const count = Number(part?.questionCount ?? part?.count ?? 0)
    if (!Number.isInteger(count) || count <= 0) {
      issues.push(`Part ${idx + 1} must have a positive integer question count.`)
    } else {
      sum += count
    }
  })

  if (issues.length === 0 && sum !== total) {
    if (sum < total) {
      issues.push(`Total part questions (${sum}) is less than total parsed questions (${total}).`)
    } else {
      issues.push(`Total part questions (${sum}) exceeds total parsed questions (${total}).`)
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    sum
  }
}

export function planQuestionParts(totalQuestions, options = {}) {
  const total = Math.max(0, Math.floor(Number(totalQuestions) || 0))
  const mode = normalizeMode(options.mode)
  const groupLabel = String(options.groupLabel || '').trim()

  if (mode === 'single' || total === 0) {
    return {
      mode: 'single',
      groupLabel,
      parts: []
    }
  }

  if (mode === 'balanced') {
    const targetSize = Math.max(1, Math.floor(Number(options.targetSize ?? options.questionsPerPart ?? 30) || 30))
    const numParts = Math.ceil(total / targetSize)
    const baseSize = Math.floor(total / numParts)
    const remainder = total % numParts

    const parts = []
    let currentStart = 1

    for (let i = 0; i < numParts; i++) {
      const questionCount = i < remainder ? baseSize + 1 : baseSize
      const startOrder = currentStart
      const endOrder = currentStart + questionCount - 1
      currentStart = endOrder + 1

      parts.push({
        key: `part-${i + 1}`,
        label: options.partLabels?.[i] || `Part ${i + 1}`,
        description: options.partDescriptions?.[i] || '',
        displayOrder: i + 1,
        startOrder,
        endOrder,
        questionCount
      })
    }

    return {
      mode: 'balanced',
      groupLabel,
      parts
    }
  }

  if (mode === 'custom') {
    const rawParts = Array.isArray(options.customParts) ? options.customParts : (Array.isArray(options.parts) ? options.parts : [])
    const parts = []
    let currentStart = 1

    rawParts.forEach((part, idx) => {
      const questionCount = Math.max(0, Math.floor(Number(part?.questionCount ?? part?.count ?? 0) || 0))
      const startOrder = currentStart
      const endOrder = questionCount > 0 ? currentStart + questionCount - 1 : currentStart
      if (questionCount > 0) {
        currentStart = endOrder + 1
      }

      parts.push({
        key: `part-${idx + 1}`,
        label: String(part?.label || part?.title || `Part ${idx + 1}`).trim(),
        description: String(part?.description || '').trim(),
        displayOrder: idx + 1,
        startOrder,
        endOrder,
        questionCount
      })
    })

    return {
      mode: 'custom',
      groupLabel,
      parts
    }
  }

  return {
    mode: 'single',
    groupLabel,
    parts: []
  }
}
