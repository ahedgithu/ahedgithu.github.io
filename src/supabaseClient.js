import { createClient } from '@supabase/supabase-js'

let supabaseClient = null
let trackerTopicsIncludeOptionalColumns = true
let trackerTopicsIncludeMidtermColumns = true
let trackerTopicsIncludeCreatedAt = true
let userPreferencesIncludeNickname = true
let userPreferencesIncludeAvatar = true
let userPreferencesIncludeProfileSetup = true
let userQuizProgressIncludesAttemptMetadata = true
let universityIsolationAvailable = true
let questionImportSchemaAvailable = true

export function getSupabaseConfig() {
  const windowConfig = window.SUPABASE_CONFIG || {}
  const env = import.meta.env || {}
  const url = windowConfig.url || env.VITE_SUPABASE_URL || ''
  const anonKey = windowConfig.anonKey || windowConfig.anon_key || env.VITE_SUPABASE_ANON_KEY || ''

  return { url, anonKey }
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseConfig()
  return Boolean(url && anonKey && !url.includes('%VITE_') && !anonKey.includes('%VITE_'))
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null
  if (supabaseClient) return supabaseClient

  const nestedTokenMarker = '#access_token='
  const nestedTokenIndex = window.location.hash.indexOf(nestedTokenMarker, 1)
  if (nestedTokenIndex > 0) {
    const authHash = window.location.hash.slice(nestedTokenIndex)
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${window.location.search}${authHash}`
    )
  }

  const { url, anonKey } = getSupabaseConfig()
  supabaseClient = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  })

  return supabaseClient
}

function isMissingOptionalColumnError(error) {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`
  return /drive_url|audio_url|display_order/i.test(message) && /schema cache|column/i.test(message)
}

function isMissingMidtermColumnError(error) {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`
  return /midterm_scope|midterm_scope_note/i.test(message) && /schema cache|column/i.test(message)
}

function isMissingCreatedAtError(error) {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`
  return /created_at/i.test(message) && /tracker_topics|schema cache|column/i.test(message)
}

function isMissingUserPreferenceNicknameError(error) {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`
  return /nickname/i.test(message) && /user_preferences|schema cache|column/i.test(message)
}

function isMissingUserPreferenceAvatarError(error) {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`
  return /avatar_id/i.test(message) && /user_preferences|schema cache|column/i.test(message)
}

function isMissingUserPreferenceProfileSetupError(error) {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`
  return /profile_setup_version/i.test(message) && /user_preferences|schema cache|column/i.test(message)
}

function isMissingQuizAttemptMetadataError(error) {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`
  return /attempt_id|attempt_started_at/i.test(message) && /user_mcq_progress|schema cache|column/i.test(message)
}

function isMissingUniversityIsolationError(error) {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`
  return /university_id|selected_university|p_university_id/i.test(message)
    && /schema cache|column|function|parameter|argument/i.test(message)
}

function isMissingQuestionImportSchemaError(error) {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`
  return /question_sources|question_imports|question_choices|question_validation_issues|submit_question_import|publish_question_import/i.test(message)
    && /schema cache|relation|table|function|could not find|does not exist/i.test(message)
}

function handleQuestionImportError(error, fallbackMessage) {
  if (isMissingQuestionImportSchemaError(error)) {
    questionImportSchemaAvailable = false
    throw new Error('Question importing is not enabled on this Supabase project yet.')
  }
  const message = error?.message || fallbackMessage
  const normalized = new Error(message)
  normalized.code = error?.code || ''
  throw normalized
}

function assertUniversityWriteAvailable(universityId) {
  if (!universityIsolationAvailable && universityId !== 'must') {
    throw new Error('The local university-isolation migration must be applied before non-MUST cloud data can be saved.')
  }
}

function stripUniversityField(row) {
  const { university_id, selected_university, ...basicRow } = row
  return basicRow
}

function stripOptionalColumns(row) {
  const { drive_url, audio_url, display_order, ...basicRow } = row
  return basicRow
}

function stripMidtermColumns(row) {
  const { midterm_scope, midterm_scope_note, ...basicRow } = row
  return basicRow
}

function stripUserPreferenceNickname(row) {
  const { nickname, ...basicRow } = row
  return basicRow
}

function stripUserPreferenceAvatar(row) {
  const { avatar_id, ...basicRow } = row
  return basicRow
}

function stripUserPreferenceProfileSetup(row) {
  const { profile_setup_version, ...basicRow } = row
  return basicRow
}

function getUserPreferenceSelectFields(includeUniversityIsolation = universityIsolationAvailable) {
  return [
    'anonymous',
    ...(includeUniversityIsolation ? ['selected_university'] : []),
    'selected_section',
    ...(userPreferencesIncludeNickname ? ['nickname'] : []),
    ...(userPreferencesIncludeAvatar ? ['avatar_id'] : []),
    ...(userPreferencesIncludeProfileSetup ? ['profile_setup_version'] : []),
    'updated_at'
  ].join(', ')
}

function stripUnsupportedUserPreferenceFields(row) {
  let payload = userPreferencesIncludeNickname ? row : stripUserPreferenceNickname(row)
  payload = userPreferencesIncludeAvatar ? payload : stripUserPreferenceAvatar(payload)
  payload = userPreferencesIncludeProfileSetup ? payload : stripUserPreferenceProfileSetup(payload)
  payload = universityIsolationAvailable ? payload : stripUniversityField(payload)
  return payload
}

export function isQuestionImportEnabled() {
  return questionImportSchemaAvailable && isSupabaseConfigured()
}

export async function fetchQuestionSources({ universityId, section, subjectCode, topicLabel } = {}) {
  const supabase = getSupabaseClient()
  if (!supabase || !questionImportSchemaAvailable) return []

  let query = supabase
    .from('question_sources')
    .select('public_id, university_id, section, subject_code, topic_label, title, reference_text, created_at')
    .eq('university_id', universityId)
    .eq('section', section)
    .order('title')
  if (subjectCode) query = query.eq('subject_code', subjectCode)
  if (topicLabel) query = query.eq('topic_label', topicLabel)

  const { data, error } = await query
  if (error && isMissingQuestionImportSchemaError(error)) {
    questionImportSchemaAvailable = false
    return []
  }
  if (error) handleQuestionImportError(error, 'Question sources could not be loaded.')
  return data || []
}

export async function fetchQuestionImports({ universityId, section, status = '' } = {}) {
  const supabase = getSupabaseClient()
  if (!supabase || !questionImportSchemaAvailable) return []

  let query = supabase
    .from('question_imports')
    .select('public_id, university_id, section, subject_code, topic_label, status, raw_text, question_count, blocking_issue_count, warning_count, parser_version, created_at, updated_at, published_at, source:question_sources(public_id, title, reference_text)')
    .eq('university_id', universityId)
    .eq('section', section)
    .order('created_at', { ascending: false })
    .limit(40)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error && isMissingQuestionImportSchemaError(error)) {
    questionImportSchemaAvailable = false
    return []
  }
  if (error) handleQuestionImportError(error, 'Question imports could not be loaded.')
  return data || []
}

export async function fetchQuestionFingerprintMatches({ universityId, section, fingerprints = [] } = {}) {
  const supabase = getSupabaseClient()
  const uniqueFingerprints = [...new Set(fingerprints.filter(Boolean))]
  if (!supabase || !questionImportSchemaAvailable || !uniqueFingerprints.length) return []

  const { data, error } = await supabase
    .from('questions')
    .select('public_id, stem_fingerprint, status, subject_code, topic_label')
    .eq('university_id', universityId)
    .eq('section', section)
    .in('stem_fingerprint', uniqueFingerprints)

  if (error && isMissingQuestionImportSchemaError(error)) {
    questionImportSchemaAvailable = false
    return []
  }
  if (error) handleQuestionImportError(error, 'Existing questions could not be checked for duplicates.')
  return data || []
}

export async function submitQuestionImport({ scope, source, rawText, parserVersion, questions, issues }) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')
  if (!questionImportSchemaAvailable) throw new Error('Question importing is not enabled on this Supabase project yet.')

  const payloadQuestions = questions.map((question) => ({
    source_order: question.sourceOrder,
    stem: question.stem,
    explanation: question.explanation,
    stem_fingerprint: question.stemFingerprint,
    has_blockers: question.hasBlockers,
    choices: question.choices.map((choice) => ({
      key: choice.key,
      text: choice.text,
      display_order: choice.displayOrder,
      is_correct: choice.isCorrect
    }))
  }))
  const payloadIssues = issues
    .filter((issue) => issue.code !== 'exact_existing_question_match')
    .map((issue) => ({
    code: issue.code,
    severity: issue.severity,
    message: issue.message,
    question_index: issue.questionIndex,
    details: { ...issue.details, location: issue.location }
    }))

  const { data, error } = await supabase.rpc('submit_question_import', {
    p_scope: {
      university_id: scope.universityId,
      section: scope.section,
      subject_code: scope.subjectCode,
      topic_label: scope.topicLabel
    },
    p_source: {
      public_id: source.publicId || null,
      title: source.title,
      reference_text: source.referenceText || null
    },
    p_raw_text: rawText,
    p_parser_version: parserVersion,
    p_questions: payloadQuestions,
    p_issues: payloadIssues
  })

  if (error) handleQuestionImportError(error, 'Question import could not be saved.')
  return data
}

export async function rejectQuestionImport(publicId) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase
    .from('question_imports')
    .update({ status: 'rejected', reviewed_by: (await supabase.auth.getUser()).data.user?.id || null })
    .eq('public_id', publicId)
    .select('public_id, status')
    .single()

  if (error) handleQuestionImportError(error, 'Question import could not be rejected.')
  return data
}

export async function publishQuestionImport(publicId) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase.rpc('publish_question_import', {
    p_import_public_id: publicId
  })
  if (error) handleQuestionImportError(error, 'Question import could not be published.')
  return Number(data) || 0
}

export async function removeQuestionImport(publicId) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase.rpc('remove_question_import', {
    p_import_public_id: publicId
  })
  if (error) handleQuestionImportError(error, 'Published question set could not be removed.')
  return Number(data) || 0
}

export async function replaceQuestionImport({ publicId, rawText, parserVersion, questions, issues }) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  const payloadQuestions = questions.map((question) => ({
    source_order: question.sourceOrder,
    stem: question.stem,
    explanation: question.explanation,
    stem_fingerprint: question.stemFingerprint,
    has_blockers: question.hasBlockers,
    choices: question.choices.map((choice) => ({
      key: choice.key,
      text: choice.text,
      display_order: choice.displayOrder,
      is_correct: choice.isCorrect
    }))
  }))
  const payloadIssues = issues
    .filter((issue) => issue.code !== 'exact_existing_question_match')
    .map((issue) => ({
      code: issue.code,
      severity: issue.severity,
      message: issue.message,
      question_index: issue.questionIndex,
      details: { ...issue.details, location: issue.location }
    }))

  const { data, error } = await supabase.rpc('replace_question_import', {
    p_import_public_id: publicId,
    p_raw_text: rawText,
    p_parser_version: parserVersion,
    p_questions: payloadQuestions,
    p_issues: payloadIssues
  })
  if (error) handleQuestionImportError(error, 'Published question set could not be replaced.')
  return Number(data) || 0
}

export async function fetchPublishedQuestionRows({ universityId, section } = {}) {
  const supabase = getSupabaseClient()
  if (!supabase || !questionImportSchemaAvailable) return []

  const { data, error } = await supabase
    .from('questions')
    .select('public_id, university_id, section, subject_code, topic_label, source_order, stem, explanation, stem_fingerprint, published_at, source:question_sources(public_id, title, reference_text), choices:question_choices(choice_key, choice_text, display_order, is_correct)')
    .eq('university_id', universityId)
    .eq('section', section)
    .eq('status', 'published')
    .order('source_order')

  if (error && isMissingQuestionImportSchemaError(error)) {
    questionImportSchemaAvailable = false
    return []
  }
  if (error) throw error
  return data || []
}

export async function fetchTrackerTopicRows(universityId = 'must') {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  if (!universityIsolationAvailable && universityId !== 'must') return []

  const optionalFields = trackerTopicsIncludeOptionalColumns ? ', drive_url, audio_url, display_order' : ''
  const midtermFields = trackerTopicsIncludeMidtermColumns ? ', midterm_scope, midterm_scope_note' : ''
  const createdAtField = trackerTopicsIncludeCreatedAt ? ', created_at' : ''
  const universityField = universityIsolationAvailable ? 'university_id, ' : ''
  const selectFields = `${universityField}section, subject_code, subject_name, track, topic_label, state, stop_note${optionalFields}${midtermFields}${createdAtField}, updated_at`

  let query = supabase
    .from('tracker_topics')
    .select(selectFields)
    .order('subject_code', { ascending: true })
    .order('track', { ascending: true })
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('topic_label', { ascending: true })
  if (universityIsolationAvailable) query = query.eq('university_id', universityId)
  const { data, error } = await query

  if (error && trackerTopicsIncludeMidtermColumns && isMissingMidtermColumnError(error)) {
    trackerTopicsIncludeMidtermColumns = false
    return fetchTrackerTopicRows(universityId)
  }
  if (error && trackerTopicsIncludeOptionalColumns && isMissingOptionalColumnError(error)) {
    trackerTopicsIncludeOptionalColumns = false
    return fetchTrackerTopicRows(universityId)
  }
  if (error && trackerTopicsIncludeCreatedAt && isMissingCreatedAtError(error)) {
    trackerTopicsIncludeCreatedAt = false
    return fetchTrackerTopicRows(universityId)
  }
  if (error && universityIsolationAvailable && isMissingUniversityIsolationError(error)) {
    universityIsolationAvailable = false
    return fetchTrackerTopicRows(universityId)
  }

  if (error) throw error
  return data || []
}

export async function fetchAdminProfile() {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('admin_users')
    .select(universityIsolationAvailable ? 'role, allowed_university_id, allowed_section' : 'role, allowed_section')
    .maybeSingle()

  if (error && universityIsolationAvailable && isMissingUniversityIsolationError(error)) {
    universityIsolationAvailable = false
    return fetchAdminProfile()
  }
  if (error) throw error
  return data
}

const NEWS_CARD_FIELDS = 'id, section, title, body, text_direction, course, card_date, kicker, tag, badge, deadline_start, deadline_due, deadline_label, facts, action_label, action_url, card_group, display_order, is_wide, published, created_at, updated_at'

export async function fetchNewsCards(universityId, section) {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  if (!universityIsolationAvailable && universityId !== 'must') return []
  const selectFields = universityIsolationAvailable ? `university_id, ${NEWS_CARD_FIELDS}` : NEWS_CARD_FIELDS

  let query = supabase
    .from('news_cards')
    .select(selectFields)
    .eq('section', section)
    .order('card_group', { ascending: true })
    .order('display_order', { ascending: true })
  if (universityIsolationAvailable) query = query.eq('university_id', universityId)
  const { data, error } = await query

  if (error && universityIsolationAvailable && isMissingUniversityIsolationError(error)) {
    universityIsolationAvailable = false
    return fetchNewsCards(universityId, section)
  }
  if (error) throw error
  return (data || []).map((row) => ({ university_id: universityId, ...row }))
}

export async function upsertNewsCard(row) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  assertUniversityWriteAvailable(row.university_id || 'must')
  const payload = universityIsolationAvailable ? row : stripUniversityField(row)
  const selectFields = universityIsolationAvailable ? `university_id, ${NEWS_CARD_FIELDS}` : NEWS_CARD_FIELDS
  const { data, error } = await supabase
    .from('news_cards')
    .upsert(payload, { onConflict: universityIsolationAvailable ? 'university_id,id' : 'id' })
    .select(selectFields)
    .single()

  if (error && universityIsolationAvailable && isMissingUniversityIsolationError(error)) {
    universityIsolationAvailable = false
    return upsertNewsCard(row)
  }
  if (error) throw error
  return { university_id: row.university_id || 'must', ...data }
}

export async function updateNewsCardOrder(rows) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  try {
    return await Promise.all(rows.map(async (row) => {
      assertUniversityWriteAvailable(row.university_id || 'must')
      let query = supabase
        .from('news_cards')
        .update({ display_order: row.display_order })
        .eq('id', row.id)
        .eq('section', row.section)
      if (universityIsolationAvailable) query = query.eq('university_id', row.university_id || 'must')
      const { data, error } = await query
        .select(universityIsolationAvailable ? 'id, university_id, section, display_order' : 'id, section, display_order')
        .single()
      if (error) throw error
      return { university_id: row.university_id || 'must', ...data }
    }))
  } catch (error) {
    if (universityIsolationAvailable && isMissingUniversityIsolationError(error)) {
      universityIsolationAvailable = false
      return updateNewsCardOrder(rows)
    }
    throw error
  }
}

export async function deleteNewsCard(id, universityId, section) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  assertUniversityWriteAvailable(universityId)
  let query = supabase
    .from('news_cards')
    .delete()
    .eq('id', id)
    .eq('section', section)
  if (universityIsolationAvailable) query = query.eq('university_id', universityId)
  const { data, error } = await query.select(universityIsolationAvailable ? 'id, university_id, section' : 'id, section')

  if (error && universityIsolationAvailable && isMissingUniversityIsolationError(error)) {
    universityIsolationAvailable = false
    return deleteNewsCard(id, universityId, section)
  }
  if (error) throw error
  return (data || []).map((row) => ({ university_id: universityId, ...row }))
}

export async function upsertTrackerTopics(rows, options = {}) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')
  const universityId = rows[0]?.university_id || 'must'
  assertUniversityWriteAvailable(universityId)

  let payloadRows = trackerTopicsIncludeMidtermColumns ? rows : rows.map(stripMidtermColumns)
  payloadRows = trackerTopicsIncludeOptionalColumns ? payloadRows : payloadRows.map(stripOptionalColumns)
  payloadRows = universityIsolationAvailable ? payloadRows : payloadRows.map(stripUniversityField)
  const optionalFields = trackerTopicsIncludeOptionalColumns ? ', drive_url, audio_url, display_order' : ''
  const midtermFields = trackerTopicsIncludeMidtermColumns ? ', midterm_scope, midterm_scope_note' : ''
  const createdAtField = trackerTopicsIncludeCreatedAt ? ', created_at' : ''
  const universityField = universityIsolationAvailable ? 'university_id, ' : ''
  const selectFields = `${universityField}section, subject_code, subject_name, track, topic_label, state, stop_note${optionalFields}${midtermFields}${createdAtField}, updated_at`

  const { data, error } = await supabase
    .from('tracker_topics')
    .upsert(payloadRows, {
      onConflict: universityIsolationAvailable
        ? 'university_id,section,subject_code,track,topic_label'
        : 'section,subject_code,track,topic_label',
      ignoreDuplicates: Boolean(options.ignoreDuplicates)
    })
    .select(selectFields)

  console.log('[Supabase] upsert raw response — data:', data, '| error:', error)

  if (error && trackerTopicsIncludeMidtermColumns && isMissingMidtermColumnError(error)) {
    trackerTopicsIncludeMidtermColumns = false
    return upsertTrackerTopics(rows, options)
  }
  if (error && trackerTopicsIncludeOptionalColumns && isMissingOptionalColumnError(error)) {
    trackerTopicsIncludeOptionalColumns = false
    return upsertTrackerTopics(rows, options)
  }
  if (error && trackerTopicsIncludeCreatedAt && isMissingCreatedAtError(error)) {
    trackerTopicsIncludeCreatedAt = false
    return upsertTrackerTopics(rows, options)
  }
  if (error && universityIsolationAvailable && isMissingUniversityIsolationError(error)) {
    universityIsolationAvailable = false
    return upsertTrackerTopics(rows, options)
  }

  if (error) throw error

  // Detect silent RLS block: upsert returned no rows and ignoreDuplicates was off
  if (!options.ignoreDuplicates && Array.isArray(data) && data.length === 0) {
    throw new Error('Row was not saved — Supabase returned no data. Check RLS policies or session auth.')
  }

  return data || []
}

export async function deleteTrackerTopic(row) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  assertUniversityWriteAvailable(row.university_id || 'must')
  let query = supabase
    .from('tracker_topics')
    .delete()
    .eq('section', row.section)
    .eq('subject_code', row.subject_code)
    .eq('track', row.track)
    .eq('topic_label', row.topic_label)
  if (universityIsolationAvailable) query = query.eq('university_id', row.university_id || 'must')
  const selectFields = universityIsolationAvailable
    ? 'university_id, section, subject_code, subject_name, track, topic_label'
    : 'section, subject_code, subject_name, track, topic_label'
  const { data, error } = await query.select(selectFields)

  if (error && universityIsolationAvailable && isMissingUniversityIsolationError(error)) {
    universityIsolationAvailable = false
    return deleteTrackerTopic(row)
  }
  if (error) throw error
  return (data || []).map((item) => ({ university_id: row.university_id || 'must', ...item }))
}

export async function fetchUserTopicProgressRows(universityId, section) {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  if (!universityIsolationAvailable && universityId !== 'must') return []

  let query = supabase
    .from('user_topic_progress')
    .select(universityIsolationAvailable
      ? 'university_id, section, subject_code, topic_label, studied, mcqs, updated_at'
      : 'section, subject_code, topic_label, studied, mcqs, updated_at')
    .eq('section', section)
  if (universityIsolationAvailable) query = query.eq('university_id', universityId)
  const { data, error } = await query

  if (error && universityIsolationAvailable && isMissingUniversityIsolationError(error)) {
    universityIsolationAvailable = false
    return fetchUserTopicProgressRows(universityId, section)
  }
  if (error) throw error
  return (data || []).map((row) => ({ university_id: universityId, ...row }))
}

export async function upsertUserTopicProgress(row) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  assertUniversityWriteAvailable(row.university_id || 'must')
  const payload = universityIsolationAvailable ? row : stripUniversityField(row)
  const { data, error } = await supabase
    .from('user_topic_progress')
    .upsert(payload, {
      onConflict: universityIsolationAvailable
        ? 'user_id,university_id,section,subject_code,topic_label'
        : 'user_id,section,subject_code,topic_label'
    })
    .select(universityIsolationAvailable
      ? 'university_id, section, subject_code, topic_label, studied, mcqs, updated_at'
      : 'section, subject_code, topic_label, studied, mcqs, updated_at')
    .single()

  if (error && universityIsolationAvailable && isMissingUniversityIsolationError(error)) {
    universityIsolationAvailable = false
    return upsertUserTopicProgress(row)
  }
  if (error) throw error
  return { university_id: row.university_id || 'must', ...data }
}

export async function fetchUserQuizProgressRows(universityId, section) {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  if (!universityIsolationAvailable && universityId !== 'must') return []
  const attemptFields = userQuizProgressIncludesAttemptMetadata ? ', attempt_id, attempt_started_at' : ''
  const universityField = universityIsolationAvailable ? 'university_id, ' : ''

  let query = supabase
    .from('user_mcq_progress')
    .select(`${universityField}section, topic_label, source_id, source_label, progress, completed, score, total_questions, answered_count, wrong_question_ids${attemptFields}, completed_at, updated_at`)
    .eq('section', section)
  if (universityIsolationAvailable) query = query.eq('university_id', universityId)
  const { data, error } = await query

  if (error && userQuizProgressIncludesAttemptMetadata && isMissingQuizAttemptMetadataError(error)) {
    userQuizProgressIncludesAttemptMetadata = false
    return fetchUserQuizProgressRows(universityId, section)
  }
  if (error && universityIsolationAvailable && isMissingUniversityIsolationError(error)) {
    universityIsolationAvailable = false
    return fetchUserQuizProgressRows(universityId, section)
  }
  if (error) throw error
  return (data || []).map((row) => ({ university_id: universityId, ...row }))
}

export async function upsertUserQuizProgress(row) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')
  assertUniversityWriteAvailable(row.university_id || 'must')
  const payload = userQuizProgressIncludesAttemptMetadata
    ? row
    : (({ attempt_id, attempt_started_at, ...basicRow }) => basicRow)(row)
  const isolatedPayload = universityIsolationAvailable ? payload : stripUniversityField(payload)
  const attemptFields = userQuizProgressIncludesAttemptMetadata ? ', attempt_id, attempt_started_at' : ''
  const universityField = universityIsolationAvailable ? 'university_id, ' : ''

  const { data, error } = await supabase
    .from('user_mcq_progress')
    .upsert(isolatedPayload, {
      onConflict: universityIsolationAvailable
        ? 'user_id,university_id,section,topic_label,source_id'
        : 'user_id,section,topic_label,source_id'
    })
    .select(`${universityField}section, topic_label, source_id, source_label, progress, completed, score, total_questions, answered_count, wrong_question_ids${attemptFields}, completed_at, updated_at`)
    .single()

  if (error && userQuizProgressIncludesAttemptMetadata && isMissingQuizAttemptMetadataError(error)) {
    userQuizProgressIncludesAttemptMetadata = false
    return upsertUserQuizProgress(row)
  }
  if (error && universityIsolationAvailable && isMissingUniversityIsolationError(error)) {
    universityIsolationAvailable = false
    return upsertUserQuizProgress(row)
  }
  if (error) throw error
  return { university_id: row.university_id || 'must', ...data }
}

export async function deleteUserQuizProgress(row) {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  assertUniversityWriteAvailable(row.university_id || 'must')
  let query = supabase
    .from('user_mcq_progress')
    .delete()
    .eq('user_id', row.user_id)
    .eq('section', row.section)
    .eq('topic_label', row.topic_label)
    .eq('source_id', row.source_id)
  if (universityIsolationAvailable) query = query.eq('university_id', row.university_id || 'must')
  const { data, error } = await query.select(universityIsolationAvailable
    ? 'university_id, section, topic_label, source_id'
    : 'section, topic_label, source_id')

  if (error && universityIsolationAvailable && isMissingUniversityIsolationError(error)) {
    universityIsolationAvailable = false
    return deleteUserQuizProgress(row)
  }
  if (error) throw error
  return (data || []).map((item) => ({ university_id: row.university_id || 'must', ...item }))
}

export async function fetchLeaderboard(universityId = 'must', section = '401') {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const params = universityIsolationAvailable
    ? { p_university_id: universityId, p_section: section }
    : { p_section: section }
  const { data, error } = await supabase.rpc('get_leaderboard', params)

  if (error && universityIsolationAvailable && isMissingUniversityIsolationError(error)) {
    universityIsolationAvailable = false
    return universityId === 'must' ? fetchLeaderboard(universityId, section) : []
  }
  if (error) throw error
  return data || []
}

export async function fetchRecentMcqActivity(universityId = 'must', section = '401', limit = 8) {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const params = {
    ...(universityIsolationAvailable ? { p_university_id: universityId } : {}),
    p_section: section,
    p_limit: Math.max(1, Math.min(Number(limit) || 8, 12))
  }
  const { data, error } = await supabase
    .rpc('get_recent_mcq_activity', params)

  if (error && universityIsolationAvailable && isMissingUniversityIsolationError(error)) {
    universityIsolationAvailable = false
    return universityId === 'must' ? fetchRecentMcqActivity(universityId, section, limit) : []
  }
  if (error) throw error
  return data || []
}

export async function markStudentOnline({ universityId = 'must', section = '401', page = 'tracker', isMcqActive = false, topicLabel = null, sourceLabel = null } = {}) {
  const supabase = getSupabaseClient()
  if (!supabase) return

  const params = {
    ...(universityIsolationAvailable ? { p_university_id: universityId } : {}),
    p_section: section,
    p_page: page,
    p_is_mcq_active: isMcqActive,
    p_topic_label: topicLabel,
    p_source_label: sourceLabel
  }
  const { error } = await supabase
    .rpc('mark_student_online', params)

  if (error && universityIsolationAvailable && isMissingUniversityIsolationError(error)) {
    universityIsolationAvailable = false
    if (universityId === 'must') return markStudentOnline({ universityId, section, page, isMcqActive, topicLabel, sourceLabel })
    return
  }
  if (error) throw error
}

export async function fetchOnlineStudents(universityId = 'must', section = '401', limit = 10) {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const params = {
    ...(universityIsolationAvailable ? { p_university_id: universityId } : {}),
    p_section: section,
    p_limit: Math.max(1, Math.min(Number(limit) || 10, 20))
  }
  const { data, error } = await supabase
    .rpc('get_online_students', params)

  if (error && universityIsolationAvailable && isMissingUniversityIsolationError(error)) {
    universityIsolationAvailable = false
    return universityId === 'must' ? fetchOnlineStudents(universityId, section, limit) : []
  }
  if (error) throw error
  return data || []
}

export async function fetchUserPreference() {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const includeUniversityIsolation = universityIsolationAvailable
  const selectFields = getUserPreferenceSelectFields(includeUniversityIsolation)

  const { data, error } = await supabase
    .from('user_preferences')
    .select(selectFields)
    .maybeSingle()

  if (error && userPreferencesIncludeNickname && isMissingUserPreferenceNicknameError(error)) {
    userPreferencesIncludeNickname = false
    return fetchUserPreference()
  }
  if (error && userPreferencesIncludeAvatar && isMissingUserPreferenceAvatarError(error)) {
    userPreferencesIncludeAvatar = false
    return fetchUserPreference()
  }
  if (error && userPreferencesIncludeProfileSetup && isMissingUserPreferenceProfileSetupError(error)) {
    userPreferencesIncludeProfileSetup = false
    return fetchUserPreference()
  }
  if (error && includeUniversityIsolation && isMissingUniversityIsolationError(error)) {
    universityIsolationAvailable = false
    return fetchUserPreference()
  }

  if (error) throw error
  return data && !universityIsolationAvailable
    ? { selected_university: ['101', '102', '201', '202', '301', '302', '401', '402'].includes(data.selected_section) ? 'must' : null, ...data }
    : data
}

export async function upsertUserPreference(row) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  assertUniversityWriteAvailable(row.selected_university || 'must')
  const payload = stripUnsupportedUserPreferenceFields(row)
  const selectFields = getUserPreferenceSelectFields()

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(payload, { onConflict: 'user_id' })
    .select(selectFields)
    .single()

  if (error && userPreferencesIncludeNickname && isMissingUserPreferenceNicknameError(error)) {
    userPreferencesIncludeNickname = false
    return upsertUserPreference(row)
  }
  if (error && userPreferencesIncludeAvatar && isMissingUserPreferenceAvatarError(error)) {
    userPreferencesIncludeAvatar = false
    return upsertUserPreference(row)
  }
  if (error && userPreferencesIncludeProfileSetup && isMissingUserPreferenceProfileSetupError(error)) {
    userPreferencesIncludeProfileSetup = false
    return upsertUserPreference(row)
  }
  if (error && universityIsolationAvailable && isMissingUniversityIsolationError(error)) {
    universityIsolationAvailable = false
    return upsertUserPreference(row)
  }

  if (error) throw error
  return { selected_university: row.selected_university || 'must', ...data }
}

export async function updateUserPreference(userId, changes) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  assertUniversityWriteAvailable(changes.selected_university || 'must')
  const payload = stripUnsupportedUserPreferenceFields(changes)
  if (!Object.keys(payload).length) {
    throw new Error('This profile preference is not enabled for cloud sync yet.')
  }
  const selectFields = getUserPreferenceSelectFields()

  const { data, error } = await supabase
    .from('user_preferences')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select(selectFields)
    .single()

  if (error && userPreferencesIncludeNickname && isMissingUserPreferenceNicknameError(error)) {
    userPreferencesIncludeNickname = false
    return updateUserPreference(userId, changes)
  }
  if (error && userPreferencesIncludeAvatar && isMissingUserPreferenceAvatarError(error)) {
    userPreferencesIncludeAvatar = false
    return updateUserPreference(userId, changes)
  }
  if (error && userPreferencesIncludeProfileSetup && isMissingUserPreferenceProfileSetupError(error)) {
    userPreferencesIncludeProfileSetup = false
    return updateUserPreference(userId, changes)
  }
  if (error && universityIsolationAvailable && isMissingUniversityIsolationError(error)) {
    universityIsolationAvailable = false
    return updateUserPreference(userId, changes)
  }

  if (error) throw error
  return { selected_university: changes.selected_university || data.selected_university || 'must', ...data }
}

export async function completeProfileSetup(nickname, avatarId) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase.rpc('complete_profile_setup', {
    p_nickname: nickname,
    p_avatar_id: avatarId
  })

  if (error) throw error
  return data
}

export async function signInWithGoogle(options = {}) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  const redirectUrl = new URL(options.redirectTo || window.location.href, window.location.origin)
  redirectUrl.hash = ''

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl.toString()
    }
  })
  if (error) throw error
  return data
}

export async function signInAdmin(email, password) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOutUser() {
  const supabase = getSupabaseClient()
  if (!supabase) return

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function signOutAdmin() {
  return signOutUser()
}

export async function getCurrentUser() {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user
}

export function onAuthStateChange(callback) {
  const supabase = getSupabaseClient()
  if (!supabase) return () => {}

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null)
  })

  return () => data.subscription.unsubscribe()
}
