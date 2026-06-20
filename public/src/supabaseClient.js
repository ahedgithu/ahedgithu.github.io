const STORAGE_KEY = 'ahmed-site-supabase-session'
const viteEnv = import.meta.env || {}
const globalConfig = window.SUPABASE_CONFIG || {}

function cleanConfigValue(value) {
  if (!value || value.startsWith('%VITE_')) return ''
  return value
}

export const supabaseConfig = {
  url: 'https://tjyohvifndkbzfzyysep.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqeW9odmlmbmRrYnpmenl5c2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NTAwNjEsImV4cCI6MjA5NzQyNjA2MX0.KrXxuW39aJu7yfABfex8XxRhdL8mvFSr1lQf50a4Ces'
}

export const adminRoles = new Set(['owner', 'admin', 'editor'])

export function isSupabaseConfigured() {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey)
}

function getProjectUrl(path) {
  return `${supabaseConfig.url.replace(/\/$/, '')}${path}`
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function getAccessToken() {
  return getSession()?.access_token || ''
}

export function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
}

function getHeaders({ auth = false, prefer } = {}) {
  const headers = {
    apikey: supabaseConfig.anonKey,
    Authorization: `Bearer ${auth ? getAccessToken() : supabaseConfig.anonKey}`,
    'Content-Type': 'application/json'
  }

  if (prefer) headers.Prefer = prefer
  return headers
}

let refreshPromise = null

async function refreshSession() {
  const refreshToken = getSession()?.refresh_token
  if (!refreshToken) return false

  if (!refreshPromise) {
    refreshPromise = fetch(getProjectUrl('/auth/v1/token?grant_type=refresh_token'), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ refresh_token: refreshToken })
    }).then(async (response) => {
      if (!response.ok) {
        clearSession()
        return false
      }

      saveSession(await response.json())
      return true
    }).finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

async function request(path, options = {}, canRefresh = true) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.')
  }

  const response = await fetch(getProjectUrl(path), {
    ...options,
    headers: {
      ...getHeaders(options),
      ...(options.headers || {})
    }
  })

  if (response.status === 401 && options.auth && canRefresh && await refreshSession()) {
    return request(path, options, false)
  }

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Supabase request failed with status ${response.status}`)
  }

  if (response.status === 204) return null
  return response.json()
}

export async function signInWithPassword(email, password) {
  const data = await request('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })

  saveSession(data)
  return data
}

export async function signOut() {
  const token = getAccessToken()
  if (token) {
    await fetch(getProjectUrl('/auth/v1/logout'), {
      method: 'POST',
      headers: getHeaders({ auth: true })
    }).catch(() => null)
  }
  clearSession()
}

export async function getCurrentProfile() {
  if (!getAccessToken()) return null
  const profiles = await request('/rest/v1/profiles?select=id,email,full_name,role&limit=1', {
    method: 'GET',
    auth: true
  })
  return profiles[0] || null
}

export async function requireAdmin() {
  const profile = await getCurrentProfile()
  if (!profile || !adminRoles.has(profile.role)) {
    throw new Error('You do not have access to this admin area.')
  }
  return profile
}

export async function fetchSubjects() {
  return request('/rest/v1/subjects?select=id,code,name,color,total_count,exam_note,order_index&order=order_index.asc,code.asc', {
    method: 'GET'
  })
}

export async function fetchTopics() {
  return request('/rest/v1/topics?select=id,subject_id,title,status,section,lecture_url,audio_url,pdf_url,pdf_label,lecture_urls,pdf_urls,notes,date_taken,art,order_index,created_at,updated_at&order=order_index.asc,title.asc', {
    method: 'GET'
  })
}

export async function fetchTrackerData() {
  const [subjects, topics] = await Promise.all([fetchSubjects(), fetchTopics()])
  return { subjects, topics }
}

export async function createTopic(topic) {
  return request('/rest/v1/topics', {
    method: 'POST',
    auth: true,
    prefer: 'return=representation',
    body: JSON.stringify(topic)
  })
}

export async function updateTopic(id, topic) {
  return request(`/rest/v1/topics?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    auth: true,
    prefer: 'return=representation',
    body: JSON.stringify(topic)
  })
}

export async function deleteTopic(id) {
  return request(`/rest/v1/topics?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true
  })
}
