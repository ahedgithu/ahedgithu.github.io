import { createClient } from '@supabase/supabase-js'

let supabaseClient = null
let trackerTopicsIncludeOptionalColumns = true
let trackerTopicsIncludeMidtermColumns = true
let trackerTopicsIncludeCreatedAt = true

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

function stripOptionalColumns(row) {
  const { drive_url, audio_url, display_order, ...basicRow } = row
  return basicRow
}

function stripMidtermColumns(row) {
  const { midterm_scope, midterm_scope_note, ...basicRow } = row
  return basicRow
}

export async function fetchTrackerTopicRows() {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const optionalFields = trackerTopicsIncludeOptionalColumns ? ', drive_url, audio_url, display_order' : ''
  const midtermFields = trackerTopicsIncludeMidtermColumns ? ', midterm_scope, midterm_scope_note' : ''
  const createdAtField = trackerTopicsIncludeCreatedAt ? ', created_at' : ''
  const selectFields = `section, subject_code, subject_name, track, topic_label, state, stop_note${optionalFields}${midtermFields}${createdAtField}, updated_at`

  const { data, error } = await supabase
    .from('tracker_topics')
    .select(selectFields)
    .order('subject_code', { ascending: true })
    .order('track', { ascending: true })
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('topic_label', { ascending: true })

  if (error && trackerTopicsIncludeMidtermColumns && isMissingMidtermColumnError(error)) {
    trackerTopicsIncludeMidtermColumns = false
    return fetchTrackerTopicRows()
  }
  if (error && trackerTopicsIncludeOptionalColumns && isMissingOptionalColumnError(error)) {
    trackerTopicsIncludeOptionalColumns = false
    return fetchTrackerTopicRows()
  }
  if (error && trackerTopicsIncludeCreatedAt && isMissingCreatedAtError(error)) {
    trackerTopicsIncludeCreatedAt = false
    return fetchTrackerTopicRows()
  }

  if (error) throw error
  return data || []
}

export async function fetchAdminProfile() {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('admin_users')
    .select('role, allowed_section')
    .maybeSingle()

  if (error) throw error
  return data
}

const NEWS_CARD_FIELDS = 'id, section, title, body, text_direction, course, card_date, kicker, tag, badge, deadline_start, deadline_due, deadline_label, facts, action_label, action_url, card_group, display_order, is_wide, published, created_at, updated_at'

export async function fetchNewsCards(section) {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('news_cards')
    .select(NEWS_CARD_FIELDS)
    .eq('section', section)
    .order('card_group', { ascending: true })
    .order('display_order', { ascending: true })

  if (error) throw error
  return data || []
}

export async function upsertNewsCard(row) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase
    .from('news_cards')
    .upsert(row, { onConflict: 'id' })
    .select(NEWS_CARD_FIELDS)
    .single()

  if (error) throw error
  return data
}

export async function updateNewsCardOrder(rows) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  const results = await Promise.all(rows.map(async (row) => {
    const { data, error } = await supabase
      .from('news_cards')
      .update({ display_order: row.display_order })
      .eq('id', row.id)
      .eq('section', row.section)
      .select('id, section, display_order')
      .single()
    if (error) throw error
    return data
  }))

  return results
}

export async function deleteNewsCard(id, section) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase
    .from('news_cards')
    .delete()
    .eq('id', id)
    .eq('section', section)
    .select('id, section')

  if (error) throw error
  return data || []
}

export async function upsertTrackerTopics(rows, options = {}) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  let payloadRows = trackerTopicsIncludeMidtermColumns ? rows : rows.map(stripMidtermColumns)
  payloadRows = trackerTopicsIncludeOptionalColumns ? payloadRows : payloadRows.map(stripOptionalColumns)
  const optionalFields = trackerTopicsIncludeOptionalColumns ? ', drive_url, audio_url, display_order' : ''
  const midtermFields = trackerTopicsIncludeMidtermColumns ? ', midterm_scope, midterm_scope_note' : ''
  const createdAtField = trackerTopicsIncludeCreatedAt ? ', created_at' : ''
  const selectFields = `section, subject_code, subject_name, track, topic_label, state, stop_note${optionalFields}${midtermFields}${createdAtField}, updated_at`

  const { data, error } = await supabase
    .from('tracker_topics')
    .upsert(payloadRows, {
      onConflict: 'section,subject_code,track,topic_label',
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

  const { data, error } = await supabase
    .from('tracker_topics')
    .delete()
    .eq('section', row.section)
    .eq('subject_code', row.subject_code)
    .eq('track', row.track)
    .eq('topic_label', row.topic_label)
    .select('section, subject_code, subject_name, track, topic_label')

  if (error) throw error
  return data || []
}

export async function fetchUserTopicProgressRows(section) {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('user_topic_progress')
    .select('section, subject_code, topic_label, studied, mcqs, updated_at')
    .eq('section', section)

  if (error) throw error
  return data || []
}

export async function upsertUserTopicProgress(row) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase
    .from('user_topic_progress')
    .upsert(row, {
      onConflict: 'user_id,section,subject_code,topic_label'
    })
    .select('section, subject_code, topic_label, studied, mcqs, updated_at')
    .single()

  if (error) throw error
  return data
}

export async function fetchUserQuizProgressRows(section) {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('user_mcq_progress')
    .select('section, topic_label, source_id, source_label, progress, completed, score, total_questions, answered_count, wrong_question_ids, completed_at, updated_at')
    .eq('section', section)

  if (error) throw error
  return data || []
}

export async function upsertUserQuizProgress(row) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase
    .from('user_mcq_progress')
    .upsert(row, {
      onConflict: 'user_id,section,topic_label,source_id'
    })
    .select('section, topic_label, source_id, source_label, progress, completed, score, total_questions, answered_count, wrong_question_ids, completed_at, updated_at')
    .single()

  if (error) throw error
  return data
}

export async function deleteUserQuizProgress(row) {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('user_mcq_progress')
    .delete()
    .eq('user_id', row.user_id)
    .eq('section', row.section)
    .eq('topic_label', row.topic_label)
    .eq('source_id', row.source_id)
    .select('section, topic_label, source_id')

  if (error) throw error
  return data || []
}

export async function fetchLeaderboard(section = '401') {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .rpc('get_leaderboard', { p_section: section })

  if (error) throw error
  return data || []
}

export async function fetchUserPreference() {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('user_preferences')
    .select('anonymous, selected_section, updated_at')
    .maybeSingle()

  if (error) throw error
  return data
}

export async function upsertUserPreference(row) {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(row, { onConflict: 'user_id' })
    .select('anonymous, selected_section, updated_at')
    .single()

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
