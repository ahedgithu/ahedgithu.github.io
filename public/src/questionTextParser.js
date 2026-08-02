export const QUESTION_TEXT_PARSER_VERSION = 'text-mcq-v1'

const BLOCK_SEPARATOR_PATTERN = /^\s*---\s*$/
const QUESTION_PATTERN = /^\s*Q:\s*(.*)$/i
const CHOICE_PATTERN = /^\s*([A-E])\)\s*(.*)$/i
const ANSWER_PATTERN = /^\s*ANSWER:\s*(.*)$/i
const EXPLANATION_PATTERN = /^\s*EXPLANATION:\s*(.*)$/i

function collapseWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

export function createQuestionFingerprint(stem) {
  return collapseWhitespace(stem).toLocaleLowerCase('en-US')
}

function makeIssue(code, severity, message, block, details = {}) {
  return {
    code,
    severity,
    message,
    questionIndex: block.index,
    location: {
      block: block.index + 1,
      startLine: block.startLine,
      endLine: block.endLine
    },
    details
  }
}

function appendText(current, addition) {
  const clean = collapseWhitespace(addition)
  if (!clean) return current
  return current ? `${current} ${clean}` : clean
}

function parseBlock(block) {
  let stem = ''
  let answerKey = ''
  let explanation = ''
  let activeField = ''
  let activeChoice = null
  let sawQuestionPrefix = false
  const choices = []
  const issues = [...block.preIssues]

  block.lines.forEach(({ text, lineNumber }) => {
    if (!text.trim()) return

    const questionMatch = text.match(QUESTION_PATTERN)
    if (questionMatch) {
      sawQuestionPrefix = true
      stem = appendText(stem, questionMatch[1])
      activeField = 'stem'
      activeChoice = null
      return
    }

    const choiceMatch = text.match(CHOICE_PATTERN)
    if (choiceMatch) {
      const key = choiceMatch[1].toUpperCase()
      if (choices.some((choice) => choice.key === key)) {
        issues.push(makeIssue('duplicate_choice_key', 'blocking', `Choice ${key} appears more than once.`, block, { lineNumber, choiceKey: key }))
      }
      activeChoice = {
        key,
        text: collapseWhitespace(choiceMatch[2]),
        displayOrder: choices.length + 1,
        lineNumber
      }
      choices.push(activeChoice)
      activeField = 'choice'
      return
    }

    const answerMatch = text.match(ANSWER_PATTERN)
    if (answerMatch) {
      answerKey = collapseWhitespace(answerMatch[1]).toUpperCase()
      activeField = 'answer'
      activeChoice = null
      return
    }

    const explanationMatch = text.match(EXPLANATION_PATTERN)
    if (explanationMatch) {
      explanation = appendText(explanation, explanationMatch[1])
      activeField = 'explanation'
      activeChoice = null
      return
    }

    if (activeField === 'stem') {
      stem = appendText(stem, text)
    } else if (activeField === 'choice' && activeChoice) {
      activeChoice.text = appendText(activeChoice.text, text)
    } else if (activeField === 'explanation') {
      explanation = appendText(explanation, text)
    } else {
      issues.push(makeIssue('unrecognized_line', 'blocking', `Line ${lineNumber} is ambiguous and was not imported.`, block, { lineNumber }))
    }
  })

  if (!sawQuestionPrefix || !stem) {
    issues.push(makeIssue('missing_stem', 'blocking', 'Question stem with Q: is required.', block))
  }
  if (![4, 5].includes(choices.length)) {
    issues.push(makeIssue('wrong_choice_count', 'blocking', 'Each question must contain four or five choices.', block, { choiceCount: choices.length }))
  }

  const expectedKeys = choices.length === 5 ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D']
  if ([4, 5].includes(choices.length) && choices.some((choice, index) => choice.key !== expectedKeys[index])) {
    issues.push(makeIssue('nonsequential_choices', 'blocking', 'Choices must run sequentially from A through D or E.', block))
  }
  choices.forEach((choice) => {
    if (!choice.text) {
      issues.push(makeIssue('empty_choice', 'blocking', `Choice ${choice.key} has no text.`, block, { choiceKey: choice.key }))
    } else if (choice.text.length < 2) {
      issues.push(makeIssue('short_choice', 'warning', `Choice ${choice.key} is unusually short.`, block, { choiceKey: choice.key }))
    }
  })

  const normalizedChoiceTexts = choices.map((choice) => createQuestionFingerprint(choice.text)).filter(Boolean)
  if (new Set(normalizedChoiceTexts).size !== normalizedChoiceTexts.length) {
    issues.push(makeIssue('duplicate_choice_text', 'blocking', 'Two or more choices contain the same normalized text.', block))
  }
  if (!answerKey) {
    issues.push(makeIssue('missing_answer', 'blocking', 'ANSWER: is required.', block))
  } else if (!/^[A-E]$/.test(answerKey) || !choices.some((choice) => choice.key === answerKey)) {
    issues.push(makeIssue('invalid_answer', 'blocking', 'Answer must reference one supplied choice.', block, { answerKey }))
  }
  if (!explanation) {
    issues.push(makeIssue('empty_explanation', 'warning', 'Explanation is missing; no content was invented.', block))
  }
  if (stem && stem.length < 12) {
    issues.push(makeIssue('short_stem', 'warning', 'Question stem is unusually short.', block))
  }
  if (/^\s*\d+[.)]\s*/.test(stem)) {
    issues.push(makeIssue('suspicious_numbering', 'warning', 'Question stem begins with numbering that may belong to the source.', block))
  }

  return {
    sourceOrder: block.index + 1,
    stem,
    choices: choices.map((choice) => ({
      key: choice.key,
      text: choice.text,
      displayOrder: choice.displayOrder,
      isCorrect: choice.key === answerKey
    })),
    answerKey,
    explanation,
    stemFingerprint: createQuestionFingerprint(stem),
    location: {
      block: block.index + 1,
      startLine: block.startLine,
      endLine: block.endLine
    },
    issues,
    hasBlockers: issues.some((issue) => issue.severity === 'blocking')
  }
}

function splitBlocks(rawText) {
  const lines = String(rawText || '').replace(/\r\n?/g, '\n').split('\n')
  const blocks = []
  let currentLines = []
  let startLine = 1
  let nextPreIssues = []

  const pushBlock = (endLine) => {
    if (!currentLines.some(({ text }) => text.trim())) {
      currentLines = []
      startLine = endLine + 1
      return
    }
    blocks.push({
      index: blocks.length,
      startLine,
      endLine,
      lines: currentLines,
      preIssues: nextPreIssues
    })
    currentLines = []
    nextPreIssues = []
    startLine = endLine + 1
  }

  lines.forEach((text, index) => {
    const lineNumber = index + 1
    if (BLOCK_SEPARATOR_PATTERN.test(text)) {
      pushBlock(lineNumber - 1)
      startLine = lineNumber + 1
      return
    }

    if (QUESTION_PATTERN.test(text) && currentLines.some(({ text: prior }) => prior.trim())) {
      pushBlock(lineNumber - 1)
      nextPreIssues = [{
        code: 'missing_separator',
        severity: 'blocking',
        message: 'Questions must be separated with ---.',
        questionIndex: blocks.length,
        location: { block: blocks.length + 1, startLine: lineNumber, endLine: lineNumber },
        details: { lineNumber }
      }]
      startLine = lineNumber
    }
    currentLines.push({ text, lineNumber })
  })
  pushBlock(lines.length)
  return blocks
}

export function parseQuestionText(rawText) {
  const blocks = splitBlocks(rawText)
  const questions = blocks.map(parseBlock)
  const issues = questions.flatMap((question) => question.issues)
  const fingerprints = new Map()

  questions.forEach((question, questionIndex) => {
    if (!question.stemFingerprint) return
    if (fingerprints.has(question.stemFingerprint)) {
      const firstQuestion = fingerprints.get(question.stemFingerprint)
      const issue = {
        code: 'exact_import_duplicate',
        severity: 'warning',
        message: `Question matches question ${firstQuestion + 1} after whitespace normalization.`,
        questionIndex,
        location: question.location,
        details: { firstQuestionIndex: firstQuestion }
      }
      question.issues.push(issue)
      issues.push(issue)
    } else {
      fingerprints.set(question.stemFingerprint, questionIndex)
    }
  })

  if (!questions.length) {
    issues.push({
      code: 'empty_import',
      severity: 'blocking',
      message: 'Paste at least one question block.',
      questionIndex: null,
      location: { block: 0, startLine: 1, endLine: 1 },
      details: {}
    })
  }

  return {
    parserVersion: QUESTION_TEXT_PARSER_VERSION,
    questions,
    issues,
    blockingIssues: issues.filter((issue) => issue.severity === 'blocking'),
    warnings: issues.filter((issue) => issue.severity === 'warning')
  }
}
