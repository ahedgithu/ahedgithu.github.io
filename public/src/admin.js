import {
  clearSession,
  createTopic,
  deleteTopic,
  fetchSubjects,
  fetchTopics,
  getCurrentProfile,
  isSupabaseConfigured,
  requireAdmin,
  signInWithPassword,
  signOut,
  updateTopic
} from './supabaseClient.js'

const appState = {
  profile: null,
  subjects: [],
  topics: [],
  editingTopicId: null
}

function $(selector) {
  return document.querySelector(selector)
}

function showMessage(target, message, type = 'info') {
  if (!target) return
  target.textContent = message
  target.dataset.type = type
  target.hidden = false
}

function hideMessage(target) {
  if (!target) return
  target.textContent = ''
  target.hidden = true
}

function setBusy(button, busy, label = 'Saving...') {
  if (!button) return
  if (busy) {
    button.dataset.originalText = button.textContent
    button.textContent = label
    button.disabled = true
  } else {
    button.textContent = button.dataset.originalText || button.textContent
    button.disabled = false
  }
}

function getSubjectName(subjectId) {
  const subject = appState.subjects.find((item) => item.id === subjectId)
  return subject ? `${subject.code} - ${subject.name}` : 'Unknown subject'
}

function parseResourceJson(value) {
  if (!value.trim()) return []

  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) throw new Error('Expected an array.')
    return parsed
  } catch (error) {
    throw new Error(`Resource JSON is invalid: ${error.message}`)
  }
}

function getTopicPayload() {
  return {
    subject_id: $('#topic-subject').value,
    title: $('#topic-title').value.trim(),
    status: $('#topic-status').value,
    section: $('#topic-section').value.trim() || null,
    lecture_url: $('#topic-lecture-url').value.trim() || null,
    audio_url: $('#topic-audio-url').value.trim() || null,
    pdf_url: $('#topic-pdf-url').value.trim() || null,
    pdf_label: $('#topic-pdf-label').value.trim() || null,
    lecture_urls: parseResourceJson($('#topic-lecture-urls').value),
    pdf_urls: parseResourceJson($('#topic-pdf-urls').value),
    date_taken: $('#topic-date-taken').value || null,
    art: Number($('#topic-art').value || 0),
    order_index: Number($('#topic-order-index').value || 0),
    notes: $('#topic-notes').value.trim() || null
  }
}

function resetTopicForm() {
  const form = $('#topic-form')
  if (!form) return
  form.reset()
  appState.editingTopicId = null
  $('#topic-submit').textContent = 'Add topic'
  $('#topic-form-title').textContent = 'Add topic'
  $('#topic-lecture-urls').value = '[]'
  $('#topic-pdf-urls').value = '[]'
  hideMessage($('[data-topic-message]'))
}

function setTopicForm(topic) {
  appState.editingTopicId = topic.id
  $('#topic-form-title').textContent = 'Edit topic'
  $('#topic-submit').textContent = 'Save changes'
  $('#topic-subject').value = topic.subject_id
  $('#topic-title').value = topic.title || ''
  $('#topic-status').value = topic.status || 'remaining'
  $('#topic-section').value = topic.section || ''
  $('#topic-lecture-url').value = topic.lecture_url || ''
  $('#topic-audio-url').value = topic.audio_url || ''
  $('#topic-pdf-url').value = topic.pdf_url || ''
  $('#topic-pdf-label').value = topic.pdf_label || ''
  $('#topic-lecture-urls').value = JSON.stringify(topic.lecture_urls || [], null, 2)
  $('#topic-pdf-urls').value = JSON.stringify(topic.pdf_urls || [], null, 2)
  $('#topic-date-taken').value = topic.date_taken || ''
  $('#topic-art').value = topic.art || 0
  $('#topic-order-index').value = topic.order_index || 0
  $('#topic-notes').value = topic.notes || ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function renderSubjectOptions() {
  const subjectSelect = $('#topic-subject')
  if (!subjectSelect) return

  subjectSelect.innerHTML = [
    '<option value="">Choose subject</option>',
    ...appState.subjects.map((subject) => (
      `<option value="${subject.id}">${subject.code} - ${subject.name}</option>`
    ))
  ].join('')
}

function renderTopicList() {
  const topicList = $('#admin-topic-list')
  if (!topicList) return

  if (!appState.topics.length) {
    topicList.innerHTML = '<div class="topic-empty">No database topics yet.</div>'
    return
  }

  topicList.innerHTML = appState.topics.map((topic) => `
    <article class="admin-topic-card">
      <div>
        <p class="card__kicker">${getSubjectName(topic.subject_id)}</p>
        <h3>${topic.title}</h3>
        <p>${topic.status}${topic.section ? ` - ${topic.section}` : ''}</p>
      </div>
      <div class="admin-topic-card__actions">
        <button class="secondary-action" type="button" data-edit-topic="${topic.id}">Edit</button>
        <button class="danger-action" type="button" data-delete-topic="${topic.id}">Delete</button>
      </div>
    </article>
  `).join('')
}

async function loadAdminTopics() {
  const message = $('[data-topic-message]')
  hideMessage(message)
  appState.subjects = await fetchSubjects()
  appState.topics = await fetchTopics()
  renderSubjectOptions()
  renderTopicList()
}

async function initAdminGuard() {
  const adminGuard = $('[data-admin-guard]')
  if (!adminGuard) return false

  const message = $('[data-admin-message]')
  if (!isSupabaseConfigured()) {
    showMessage(message, 'Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', 'error')
    adminGuard.hidden = true
    return false
  }

  try {
    appState.profile = await requireAdmin()
    adminGuard.hidden = false
    const profileLabel = $('[data-admin-profile]')
    if (profileLabel) profileLabel.textContent = `${appState.profile.email} - ${appState.profile.role}`
    return true
  } catch (error) {
    showMessage(message, error.message || 'Admin access required.', 'error')
    adminGuard.hidden = true
    window.setTimeout(() => { window.location.href = '/admin/login/' }, 900)
    return false
  }
}

async function initLoginPage() {
  const loginForm = $('#admin-login-form')
  if (!loginForm) return

  const message = $('[data-login-message]')
  if (!isSupabaseConfigured()) {
    showMessage(message, 'Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', 'error')
    return
  }

  const profile = await getCurrentProfile().catch(() => null)
  if (profile) {
    window.location.href = '/admin/dashboard/'
    return
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const button = loginForm.querySelector('button[type="submit"]')
    setBusy(button, true, 'Logging in...')
    hideMessage(message)

    try {
      await signInWithPassword($('#admin-email').value.trim(), $('#admin-password').value)
      const nextProfile = await getCurrentProfile()
      if (!nextProfile) {
        clearSession()
        throw new Error('No profile found for this account.')
      }
      window.location.href = '/admin/dashboard/'
    } catch (error) {
      showMessage(message, error.message || 'Login failed.', 'error')
      setBusy(button, false)
    }
  })
}

function bindAdminActions() {
  document.querySelectorAll('[data-admin-logout]').forEach((button) => {
    button.addEventListener('click', async () => {
      await signOut()
      window.location.href = '/admin/login/'
    })
  })
}

function bindTopicsPage() {
  const form = $('#topic-form')
  const topicList = $('#admin-topic-list')
  if (!form || !topicList) return

  const message = $('[data-topic-message]')

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const button = $('#topic-submit')
    setBusy(button, true)
    hideMessage(message)

    try {
      const payload = getTopicPayload()
      if (!payload.subject_id || !payload.title) {
        throw new Error('Subject and title are required.')
      }

      if (appState.editingTopicId) {
        await updateTopic(appState.editingTopicId, payload)
        showMessage(message, 'Topic updated.', 'success')
      } else {
        await createTopic(payload)
        showMessage(message, 'Topic added.', 'success')
      }

      resetTopicForm()
      await loadAdminTopics()
    } catch (error) {
      showMessage(message, error.message || 'Save failed.', 'error')
    } finally {
      setBusy(button, false)
    }
  })

  $('#topic-reset')?.addEventListener('click', resetTopicForm)

  topicList.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-edit-topic]')
    const deleteButton = event.target.closest('[data-delete-topic]')

    if (editButton) {
      const topic = appState.topics.find((item) => item.id === editButton.dataset.editTopic)
      if (topic) setTopicForm(topic)
      return
    }

    if (deleteButton) {
      const topic = appState.topics.find((item) => item.id === deleteButton.dataset.deleteTopic)
      if (!topic) return
      if (!window.confirm(`Delete "${topic.title}"?`)) return
      await deleteTopic(topic.id)
      await loadAdminTopics()
      showMessage(message, 'Topic deleted.', 'success')
    }
  })
}

initLoginPage()
initAdminGuard().then(async (isReady) => {
  if (!isReady) return
  bindAdminActions()
  bindTopicsPage()
  if ($('#admin-topic-list')) {
    await loadAdminTopics().catch((error) => {
      showMessage($('[data-topic-message]'), error.message || 'Could not load topics.', 'error')
    })
  }
})
