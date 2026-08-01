import confetti from 'canvas-confetti'

import {
  playExclusiveAudioPlayback,
  soundPackAllowsPlayback,
  stopExclusiveAudioPlayback
} from './audioFeedback.js'
import {
  calculatePercent,
  calculateQuizProgress,
  calculateMasteryLevel,
  claimProfileLevelTransition,
  enqueueSerialTask,
  getConfirmedProfileLevelTransition
} from './progress.js'
import {
  initKnowledgeLibrary,
  getManifest,
  searchSources,
  resolveCitation,
  resolvePassage,
  renderSourceReaderMarkup
} from './knowledgeLibrary.js'

import {
  completeProfileSetup,
  deleteNewsCard,
  deleteUserQuizProgress,
  fetchAdminProfile,
  fetchNewsCards,
  fetchOnlineStudents,
  fetchTrackerTopicRows,
  fetchUserQuizProgressRows,
  fetchUserTopicProgressRows,
  fetchLeaderboard,
  fetchRecentMcqActivity,
  fetchUserPreference,
  upsertUserPreference,
  getCurrentUser,
  isSupabaseConfigured,
  markStudentOnline,
  onAuthStateChange,
  signInAdmin,
  signInWithGoogle,
  signOutUser,
  updateNewsCardOrder,
  upsertNewsCard,
  upsertTrackerTopics,
  upsertUserQuizProgress,
  upsertUserTopicProgress
} from './supabaseClient.js'

import { subjects401, subjectExamNotes, midtermExamSchedule, courseSchedule } from './data/must-401.js'
import { subjects402, midtermExamSchedule402 } from './data/must-402.js'
import { mustAcademicYears, mustSections } from './data/must/sections.js'



const subjectsO6uPhysicalTherapy = [
  {
    code: 'PT-PHYS',
    name: 'Physiology of Exercise',
    totalCount: 1,
    examNote: 'Next midterm: Mon Aug 3, 2026.',
    topics: [
      {
        label: 'Physiological Adaptation to Regular Physical Training',
        state: 'taken',
        art: 9,
        note: 'Currently the only confirmed covered lecture.',
        mcqTopicKey: 'PT-PHYS::Physiological Adaptation to Regular Physical Training'
      }
    ]
  },
  {
    code: 'PT-PATH2',
    name: 'Pathology 2',
    totalCount: 4,
    examNote: 'Next midterm: Mon Aug 3, 2026.',
    topics: [1, 2, 3, 4].map((lectureNumber, index) => ({
      label: `Lecture ${lectureNumber} — Title pending`,
      state: 'taken',
      art: 10 + index,
      note: 'Covered lecture. Official title pending.'
    }))
  }
]

const subjectsDeltaPhysicalTherapy = [
  {
    code: 'DELTA-IM',
    name: 'Internal Medicine',
    totalCount: 0,
    examNote: '',
    topics: []
  }
]

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const mobileQuery = window.matchMedia('(max-width: 860px)')
const quizRobotCompactQuery = window.matchMedia('(max-width: 640px)')
const QUIZ_STICKY_OFFSET = 68
const QUIZ_STORAGE_PREFIX = 'quizState'
const LEGACY_QUIZ_STORAGE_PREFIX = 'mcq-progress-'
const LEGACY_QUIZ_SOUND_STORAGE_KEY = 'quizAnswerSoundsEnabled'
const QUIZ_SOUND_PACK_STORAGE_KEY = 'quizAnswerSoundPack'
const QUIZ_SHARED_INCORRECT_AUDIO_URL = '/assets/audio/mcq-study-incorrect-7fccb7f6586f.mp3'
const QUIZ_LEVEL_UP_AUDIO_URL = '/assets/audio/mcq-level-up-2d2abd9fd850.mp3'
const LEVEL_UP_SEEN_STORAGE_PREFIX = 'seenProfileLevelUps'
const QUIZ_SOUND_PACKS = {
  muted: {
    label: 'Muted',
    iconUrl: '',
    correctUrls: [],
    completionUrl: '',
    levelUpUrl: ''
  },
  valorant: {
    label: 'Valorant',
    iconUrl: '/assets/icons/mcq-sound-pack-tactical-8dab919cc5ca.svg',
    correctUrls: [
      '/assets/audio/mcq-correct-kill-1-8cca0cb32228.mp3',
      '/assets/audio/mcq-correct-kill-2-a686ab1cbea6.mp3',
      '/assets/audio/mcq-correct-kill-3-c0096467cee7.mp3',
      '/assets/audio/mcq-correct-kill-4-4d794c8bc942.mp3',
      '/assets/audio/mcq-correct-kill-5-0a24c8292ac4.mp3'
    ],
    completionUrl: '',
    levelUpUrl: QUIZ_LEVEL_UP_AUDIO_URL
  },
  duolingo: {
    label: 'Duolingo',
    iconUrl: '/assets/icons/mcq-sound-pack-study-b445547bb66e.svg',
    correctUrls: ['/assets/audio/mcq-study-correct-f8ff6b8abb11.mp3'],
    completionUrl: '/assets/audio/mcq-study-complete-a3ace815cf43.mp3',
    levelUpUrl: QUIZ_LEVEL_UP_AUDIO_URL
  }
}
const TOPIC_COMPLETION_STORAGE_PREFIX = 'topicCompletion'
const LEGACY_TOPIC_COMPLETION_STORAGE_PREFIX = 'med401-topic-progress-v1::'
const LOCAL_PROGRESS_OWNER_KEY = 'mustHubLocalProgressOwner'
const SEEN_TROPHIES_STORAGE_PREFIX = 'seenProfileTrophies'
const PROFILE_AVATAR_STORAGE_PREFIX = 'profileAvatar'
const PROFILE_AVATARS = [
  { id: 'pulse', label: 'Pulse', position: '0% 0%' },
  { id: 'scholar', label: 'Scholar', position: '33.333% 0%' },
  { id: 'rounds', label: 'Rounds', position: '66.667% 0%' },
  { id: 'cardio', label: 'Cardio', position: '100% 0%' },
  { id: 'calm', label: 'Calm', position: '0% 100%' },
  { id: 'scope', label: 'Scope', position: '33.333% 100%' },
  { id: 'notes', label: 'Notes', position: '66.667% 100%' },
  { id: 'anatomy', label: 'Anatomy', position: '100% 100%' }
]
const TOPIC_UPDATE_STORAGE_KEY_PREFIX = 'tracker-seen-topic-updates-v1'
let TOPIC_UPDATE_STORAGE_KEY = `${TOPIC_UPDATE_STORAGE_KEY_PREFIX}::must::401`
const UNIVERSITY_WEEK_START_DAY = 0 // Sunday
const NEWS_SEEN_STORAGE_KEY_PREFIX = 'newsSeen'
let NEWS_SEEN_STORAGE_KEY = `${NEWS_SEEN_STORAGE_KEY_PREFIX}::must::401`
const NEWS_EXPIRY_HOURS = 6
const DRIVE_ICON_URL = '/assets/icons/drive-icon.png'
const PLAY_ICON_URL = '/assets/icons/play-button-v1.png'
const mcqQuizzesByUniversity = {
  must: {
    '401': window.mcqQuizzes || {},
    '402': window.mcqQuizzes402 || {}
  },
  o6u: {
    'physical-therapy': window.mcqQuizzesO6u || {}
  },
  delta: {
    'physical-therapy': {}
  }
}

function getMcqQuizzesForSection(section = activeAcademicSection, universityId = activeUniversityId) {
  return mcqQuizzesByUniversity[universityId]?.[section] || {}
}

const dynamicQuizConfigs = new Map()
let trackerSearchMode = 'topics'
let renderedMcqSearchResults = []
const quizState = {
  topicLabel: null,
  sourceId: 'current',
  sourceLabel: 'Current MCQs',
  parentSourceId: null,
  groupId: null,
  groupLabel: '',
  partIndex: null,
  partCount: null,
  mode: 'standard',
  index: 0,
  answers: {},
  missingQuestionIds: [],
  masteredQuestionIds: [],
  timeLimitMinutes: null,
  timerEndsAt: null,
  timerStartedAt: null,
  timerElapsedMs: 0,
  attemptId: null,
  attemptStartedAt: null,
  validatedInSession: false,
  transient: false
}
let quizTimerInterval = null
let quizRobotMoodTimeout = null
let quizSessionGeneration = 0
let quizSoundPack = getSavedQuizSoundPack()
let quizSoundMenuOpen = false
const quizFeedbackAudio = {
  packs: new Map(),
  incorrect: null,
  active: null,
  playbackId: 0,
  correctStreak: 0
}
const quizLevelUpCelebration = {
  timeoutId: null,
  seenTransitions: new Set()
}
const quizProgressSyncQueues = new Map()
const quizLevelUpSyncQueues = new Map()
const studentProgressState = {
  user: null,
  ready: false,
  loading: false,
  authRequestId: 0,
  selectedUniversity: '',
  selectedSection: '',
  pendingUniversity: '',
  sectionSelectionMode: 'onboarding',
  topicRows: new Map(),
  quizRows: new Map(),
  lastError: ''
}
const trackerAdminState = {
  profile: null,
  enabled: false,
  saving: false,
  dirtyCollections: new Set(),
  draggingKey: ''
}
const expandedTopicBreakdowns = new Set()

const coveredStates = new Set(['taken', 'partial'])
const stateLabels = {
  taken: 'Taken in university',
  partial: 'Partially taken',
  announced: 'Announced only',
  remaining: 'Remaining'
}

function replayTrackerMotion(container, selector) {
  if (prefersReducedMotion || !container) return
  const items = [...container.querySelectorAll(selector)]
  items.forEach((item) => {
    item.classList.remove('motion-replay')
    void item.offsetWidth
    item.classList.add('motion-replay')
  })
}





const midtermExamScheduleO6uPhysicalTherapy = [
  {
    code: 'Physical Therapy Midterm',
    subjectCode: 'PT-PHYS',
    subjectName: 'Physical Therapy',
    date: '2026-08-03',
    dayLabel: 'Mon',
    time: 'Time pending'
  }
]

const academicSectionsByUniversity = {
  must: mustSections,
  o6u: {
    'physical-therapy': {
      id: 'physical-therapy',
      title: 'Physical Therapy',
      newsTitle: 'O6U Physical Therapy news',
      trackerSearchPlaceholder: 'Search Physical Therapy topics or subjects…',
      subjects: subjectsO6uPhysicalTherapy,
      midtermExamSchedule: midtermExamScheduleO6uPhysicalTherapy,
      courseSchedule: [],
      semesterTimeline: null,
      scheduleLocation: ''
    }
  },
  delta: {
    'physical-therapy': {
      id: 'physical-therapy',
      title: 'Physical Therapy',
      newsTitle: 'Delta Physical Therapy news',
      trackerSearchPlaceholder: 'Search Physical Therapy subjects…',
      subjects: subjectsDeltaPhysicalTherapy,
      midtermExamSchedule: [],
      courseSchedule: [],
      semesterTimeline: null,
      scheduleLocation: ''
    }
  }
}

const universities = {
  must: {
    id: 'must',
    name: 'Misr University for Science and Technology',
    shortName: 'MUST',
    hubName: 'MUST HUB',
    logoUrl: '/assets/must-university-logo.png',
    sections: ['101', '102', '201', '202', '301', '302', '401', '402']
  },
  o6u: {
    id: 'o6u',
    name: '6th of October University',
    shortName: 'O6U',
    hubName: 'O6U HUB',
    logoUrl: '/assets/o6u-university-logo.jpg',
    sections: ['physical-therapy']
  },
  delta: {
    id: 'delta',
    name: 'Delta University',
    shortName: 'Delta',
    hubName: 'DELTA HUB',
    logoUrl: '/assets/delta-university-logo.png',
    sections: ['physical-therapy']
  }
}

const scheduleDayOrder = [
  { day: 0, label: 'Sunday' },
  { day: 2, label: 'Tuesday' },
  { day: 3, label: 'Wednesday' }
]

const subjectList = document.getElementById('subject-list')
const selectedCode = document.getElementById('selected-code')
const selectedName = document.getElementById('selected-name')
const selectedCount = document.getElementById('selected-count')
const selectedPercent = document.getElementById('selected-percent')
const progressFill = document.getElementById('progress-fill')
const topicList = document.getElementById('topic-list')
const subjectDetail = document.querySelector('.subject-detail')
const subjectTrackTabs = document.getElementById('subject-track-tabs')
const subjectRevisionLauncher = document.getElementById('subject-revision-launcher')
const trackerSearch = document.getElementById('tracker-search')
const trackerSearchModeButtons = document.querySelectorAll('[data-search-mode]')
const mcqSearchResults = document.getElementById('mcq-search-results')
const todayCockpit = document.getElementById('today-cockpit')
const todayCockpitDate = document.getElementById('today-cockpit-date')
const todayCockpitFreshness = document.getElementById('today-cockpit-freshness')
const todayPrimaryAction = document.getElementById('today-primary-action')
const todayPrimaryKicker = document.getElementById('today-primary-kicker')
const todayPrimaryTitle = document.getElementById('today-primary-title')
const todayPrimaryCopy = document.getElementById('today-primary-copy')
const todayPrimaryCta = document.getElementById('today-primary-cta')
const todayPrimaryProgressFill = document.getElementById('today-primary-progress-fill')
const todayExamTitle = document.getElementById('today-exam-title')
const todayExamCopy = document.getElementById('today-exam-copy')
const todayCoverageTitle = document.getElementById('today-coverage-title')
const todayCoverageCopy = document.getElementById('today-coverage-copy')
const todayUpdateKicker = document.getElementById('today-update-kicker')
const todayUpdateTitle = document.getElementById('today-update-title')
const todayUpdateCopy = document.getElementById('today-update-copy')
if (trackerSearch) trackerSearch.name = 'tracker-search'
const trackerStatusFilter = document.getElementById('tracker-status-filter')
const trackerScopeFilter = document.getElementById('tracker-scope-filter')
const semesterFill = document.getElementById('semester-fill')
const todayMarker = document.getElementById('today-marker')
const midtermMarker = document.getElementById('midterm-marker')
const finalsMarker = document.getElementById('finals-marker')
const semesterDateScale = document.getElementById('semester-date-scale')
const nextCheckpoint = document.getElementById('next-checkpoint')
const next401Exam = document.getElementById('next-401-exam')
const next401Countdown = document.getElementById('next-401-countdown')
const examScheduleCards = document.getElementById('exam-schedule-cards')
const newsNavLinks = document.querySelectorAll('a[href="#news"], a[href="/#news"]')
const bookingForm = document.getElementById('booking-form')
const bookingName = document.getElementById('booking-name')
const bookingService = document.getElementById('booking-service')
const bookingTime = document.getElementById('booking-time')
const deadlineProgressItems = document.querySelectorAll('[data-assignment-progress], [data-deadline-progress]')
const historyForm = document.getElementById('history-form')
const historyProgressCount = document.getElementById('history-progress-count')
const historyProgressFill = document.getElementById('history-progress-fill')
const historySummaryText = document.getElementById('history-summary-text')
const copyHistorySummary = document.getElementById('copy-history-summary')
const smokingDetails = document.getElementById('smoking-details')
const substanceDetails = document.getElementById('substance-details')
const substanceOtherField = document.getElementById('substance-other-field')
const newsFeed = document.getElementById('news-feed')
const newsCourseFilter = document.getElementById('news-course-filter')
const newsDateFilter = document.getElementById('news-date-filter')
const newsAdminToolbar = document.getElementById('news-admin-toolbar')
const newsAdminStatus = document.getElementById('news-admin-status')
const newsAdminModal = document.getElementById('news-admin-modal')
const newsAdminForm = document.getElementById('news-admin-form')
const newsAdminModalTitle = document.getElementById('news-admin-modal-title')
const newsAdminFormStatus = document.getElementById('news-admin-form-status')
const scheduleTodayTitle = document.getElementById('schedule-today-title')
const scheduleTodaySummary = document.getElementById('schedule-today-summary')
const scheduleNextCard = document.getElementById('schedule-next-card')
const scheduleTodayList = document.getElementById('schedule-today-list')
const scheduleCalendarGrid = document.getElementById('schedule-calendar-grid')
const scheduleList = document.getElementById('schedule-list')
const trackerTitle = document.getElementById('tracker-title')
const newsTitle = document.getElementById('news-title')
const classRepsGrid = document.querySelector('.class-reps__grid')
const scheduleTitle = document.getElementById('schedule-title')
const scheduleLocation = document.getElementById('schedule-location')
const studentSync = document.getElementById('student-sync')
const studentSyncButton = document.getElementById('student-sync-button')
const studentSyncMenu = document.getElementById('student-sync-menu')
const studentSyncAvatar = document.getElementById('student-sync-avatar')
const studentSyncStatus = document.getElementById('student-sync-status')
const studentSyncEmail = document.getElementById('student-sync-email')
const authGate = document.querySelector('[data-auth-gate]')
const authGateStatus = document.getElementById('auth-gate-status')
const authGateContext = document.querySelector('[data-auth-gate-context]')
const authGateDelay = document.querySelector('[data-auth-gate-delay]')
const authLoadingSteps = [...document.querySelectorAll('.auth-gate__rail-step[data-auth-loading-step]')]
const authSigninTitle = document.getElementById('auth-signin-title')
const authSigninCopy = document.getElementById('auth-signin-copy')
const authUniversityTitle = document.getElementById('auth-university-title')
const authUniversityCopy = document.getElementById('auth-university-copy')
const authUniversityCancel = document.querySelector('[data-auth-university-cancel]')
const authSectionTitle = document.getElementById('auth-section-title')
const authSectionCopy = document.getElementById('auth-section-copy')
const authSectionCancel = document.querySelector('[data-auth-section-cancel]')
const authSectionChoices = document.querySelector('[data-auth-section-choices]')
const semesterTimeline = document.getElementById('semester-timeline')
const isStandaloneProfilePage = document.body.classList.contains('profile-page') || window.location.pathname.endsWith('/profile.html')
const profileAvatarDialog = document.getElementById('profile-avatar-dialog')
let authGateDelayTimer = 0
let profileNicknameEditOpened = false
let profileNicknameEditorOpen = false
let profileAvatarDialogOpener = null
const trackerAdminToolbar = document.getElementById('tracker-admin-toolbar')
const trackerAdminEmail = document.getElementById('tracker-admin-email')
const trackerAdminSubject = document.getElementById('tracker-admin-subject')
const trackerAdminSaveOrder = document.getElementById('tracker-admin-save-order')
const trackerAdminSignOut = document.getElementById('tracker-admin-sign-out')
const adminLoginModal = document.getElementById('admin-login-modal')
const adminLoginForm = document.getElementById('tracker-admin-login-form')
const adminLoginEmail = document.getElementById('tracker-admin-email-input')
const adminLoginPassword = document.getElementById('tracker-admin-password-input')
const adminLoginStatus = document.getElementById('tracker-admin-login-status')
const trackerAdminEditPanel = document.getElementById('tracker-admin-edit-panel')

const initialParams = new URLSearchParams(window.location.search)
const LOCAL_TEST_SELECTION_KEY = 'universityLocalTestSelection'
const isLocalTestMode = ['127.0.0.1', 'localhost'].includes(window.location.hostname)
  && initialParams.get('local-test') === '1'
const isLocalOnboardingTestMode = isLocalTestMode && initialParams.get('onboarding') === '1'
let initialAdminLoginHandled = false
Object.values(academicSectionsByUniversity).flatMap((sectionMap) => Object.values(sectionMap)).forEach((section) => {
  section.subjects.forEach((subject) => {
    subject.clinicalTopics = Array.isArray(subject.clinicalTopics) ? subject.clinicalTopics : []
  })
})
let activeUniversityId = 'must'
let activeAcademicSection = '401'
let activeSiteMode = 'selector'
let activeAcademicSectionData = academicSectionsByUniversity.must[activeAcademicSection]
const newsCardsState = {
  rowsBySection: new Map(),
  remoteSections: new Set(),
  loadingSections: new Set(),
  errorSections: new Set()
}
let subjects = activeAcademicSectionData.subjects
const initialSubject = subjects.find((subject) => subject.code === initialParams.get('subject'))
let activeSubjectCode = initialParams.get('tracker') === '1' && initialSubject ? initialSubject.code : null
let expandedSubjectCode = mobileQuery.matches && activeSubjectCode ? activeSubjectCode : null
let activeSubjectTrack = 'theoretical'
const managedModalStates = new WeakMap()

function getUniversity(universityId = activeUniversityId) {
  return universities[universityId] || universities.must
}

function getUniversitySectionKey(universityId = activeUniversityId, sectionId = activeAcademicSection) {
  return `${universityId}::${sectionId}`
}

function isSavedUniversity(universityId) {
  return Object.prototype.hasOwnProperty.call(universities, universityId)
}

function isUniversitySection(universityId, sectionId) {
  return isSavedUniversity(universityId) && getUniversity(universityId).sections.includes(sectionId)
}

function getDefaultSectionForUniversity(universityId) {
  return getUniversity(universityId).sections[0]
}

function getFocusableElements(container) {
  if (!container) return []
  return [...container.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter((element) => (
    !element.hidden
    && element.getAttribute('aria-hidden') !== 'true'
    && !element.closest('[hidden], [inert]')
  ))
}

function activateManagedModal(modal, close, preferredFocus = null) {
  if (!modal) return
  const existing = managedModalStates.get(modal)
  if (existing?.active) {
    existing.close = close
    return
  }

  const pageElements = [...document.body.children].filter((element) => (
    element !== modal
    && element.tagName !== 'SCRIPT'
    && !element.contains(modal)
    && !element.hasAttribute('inert')
  ))
  const state = {
    active: true,
    close,
    trigger: document.activeElement instanceof HTMLElement ? document.activeElement : null,
    pageElements,
    keydown: null
  }

  state.keydown = (event) => {
    if (!state.active) return
    if (event.key === 'Escape') {
      event.preventDefault()
      state.close?.()
      return
    }
    if (event.key !== 'Tab') return
    const focusable = getFocusableElements(modal)
    if (!focusable.length) {
      event.preventDefault()
      return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  state.pageElements.forEach((element) => { element.inert = true })
  modal.addEventListener('keydown', state.keydown)
  managedModalStates.set(modal, state)

  window.requestAnimationFrame(() => {
    const focusTarget = preferredFocus && !preferredFocus.disabled
      ? preferredFocus
      : getFocusableElements(modal)[0]
    focusTarget?.focus({ preventScroll: true })
  })
}

function deactivateManagedModal(modal) {
  const state = modal ? managedModalStates.get(modal) : null
  if (!state?.active) return
  state.active = false
  modal.removeEventListener('keydown', state.keydown)
  state.pageElements.forEach((element) => { element.inert = false })
  managedModalStates.delete(modal)
  window.requestAnimationFrame(() => {
    if (state.trigger?.isConnected) state.trigger.focus({ preventScroll: true })
  })
}

function getAcademicSection(sectionId = activeAcademicSection, universityId = activeUniversityId) {
  const safeUniversityId = isSavedUniversity(universityId) ? universityId : 'must'
  const safeSectionId = isUniversitySection(safeUniversityId, sectionId)
    ? sectionId
    : getDefaultSectionForUniversity(safeUniversityId)
  return academicSectionsByUniversity[safeUniversityId][safeSectionId]
}

function isResourceFirstSection(sectionId = activeAcademicSection, universityId = activeUniversityId) {
  return !!getAcademicSection(sectionId, universityId)?.capabilities?.resourceFirst
}

function isValidRemoteTopicState(state) {
  return ['taken', 'partial', 'announced', 'remaining'].includes(state)
}

function makeRemoteTrackerTopic(row) {
  const topic = {
    label: row.topic_label,
    state: isValidRemoteTopicState(row.state) ? row.state : 'remaining',
    stopNote: row.stop_note || '',
    midtermScope: Boolean(row.midterm_scope),
    midtermScopeNote: row.midterm_scope_note || '',
    displayOrder: row.display_order !== null && row.display_order !== undefined && Number.isFinite(Number(row.display_order))
      ? Number(row.display_order)
      : null,
    updateBatch: row.updated_at ? 'remote-admin' : undefined,
    updatedAt: row.updated_at ? row.updated_at.slice(0, 10) : undefined,
    createdAt: row.created_at || undefined
  }

  if (row.drive_url) {
    topic.lectureUrls = [{
      label: 'Drive',
      url: row.drive_url,
      type: 'lecture'
    }]
    topic.driveUrl = row.drive_url
  }

    if (row.audio_url) topic.audioUrl = row.audio_url

  return topic
}

function applyTrackerTopicRows(rows) {
  if (!Array.isArray(rows) || !rows.length) return false

  let changed = false

  rows.forEach((row) => {
    if ((row.university_id || 'must') !== activeUniversityId) return
    const section = getAcademicSection(row.section)
    const subject = section.subjects.find((item) => item.code === row.subject_code)
    if (!subject) return

    const collection = row.track === 'clinical' ? subject.clinicalTopics : subject.topics
    if (!collection) return

    const consolidatedTopic = collection.find((item) => item.progressAliases?.includes(row.topic_label))
    if (consolidatedTopic) return

    const existingTopic = collection.find((item) => item.label === row.topic_label)
    if (!existingTopic) {
      collection.push({ ...makeRemoteTrackerTopic(row), isNewRemote: true })
      changed = true
      return
    }

    if (isValidRemoteTopicState(row.state) && existingTopic.state !== row.state) {
      existingTopic.state = row.state
      changed = true
    }

    const nextStopNote = row.stop_note || ''
    if ((existingTopic.stopNote || '') !== nextStopNote) {
      existingTopic.stopNote = nextStopNote
      changed = true
    }

    if (Object.prototype.hasOwnProperty.call(row, 'drive_url')) {
      const nextDriveUrl = row.drive_url || ''
      if ((existingTopic.driveUrl || '') !== nextDriveUrl) {
        existingTopic.driveUrl = nextDriveUrl
        existingTopic.lectureUrls = nextDriveUrl ? [{ label: 'Drive', url: nextDriveUrl, type: 'lecture' }] : []
        changed = true
      }
    }

    if (Object.prototype.hasOwnProperty.call(row, 'audio_url')) {
      const nextAudioUrl = row.audio_url || ''
      if ((existingTopic.audioUrl || '') !== nextAudioUrl) {
        existingTopic.audioUrl = nextAudioUrl
        changed = true
      }
    }

    if (Object.prototype.hasOwnProperty.call(row, 'midterm_scope')) {
      const nextMidtermScope = Boolean(row.midterm_scope)
      if (Boolean(existingTopic.midtermScope) !== nextMidtermScope) {
        existingTopic.midtermScope = nextMidtermScope
        changed = true
      }
    }

    if (Object.prototype.hasOwnProperty.call(row, 'midterm_scope_note')) {
      const nextMidtermScopeNote = row.midterm_scope_note || ''
      if ((existingTopic.midtermScopeNote || '') !== nextMidtermScopeNote) {
        existingTopic.midtermScopeNote = nextMidtermScopeNote
        changed = true
      }
    }

    if (row.display_order !== null && row.display_order !== undefined) {
      const nextDisplayOrder = Number(row.display_order)
      if (Number.isFinite(nextDisplayOrder) && existingTopic.displayOrder !== nextDisplayOrder) {
        existingTopic.displayOrder = nextDisplayOrder
        changed = true
      }
    }

    if (row.updated_at) {
      existingTopic.updatedAt = row.updated_at.slice(0, 10)
      existingTopic.updateBatch = 'remote-admin'
    }
    existingTopic.createdAt = row.created_at || undefined
  })

  Object.values(academicSectionsByUniversity).flatMap(sectionMap => Object.values(sectionMap)).forEach(section => {
    section.subjects.forEach(subject => {
      ;[subject.topics, subject.clinicalTopics].forEach(collection => {
        if (!Array.isArray(collection)) return
        const originalPositions = new Map(collection.map((topic, index) => [topic, index]))
        collection.sort((a, b) => {
          const aOrder = Number.isFinite(a.displayOrder) ? a.displayOrder : Number.MAX_SAFE_INTEGER
          const bOrder = Number.isFinite(b.displayOrder) ? b.displayOrder : Number.MAX_SAFE_INTEGER
          return aOrder - bOrder || originalPositions.get(a) - originalPositions.get(b)
        })
      })
    })
  })

  return changed
}

function refreshTrackerAfterRemoteUpdate() {
  updateMiniDashboard()
  renderSubjects()
  if (activeSubjectCode) setActiveSubject(activeSubjectCode, 'open')
}

const remoteTrackerRefreshPromises = new Map()

function refreshRemoteTrackerData() {
  if (!isSupabaseConfigured() || isResourceFirstSection()) return Promise.resolve()
  const requestedUniversity = activeUniversityId
  const existingPromise = remoteTrackerRefreshPromises.get(requestedUniversity)
  if (existingPromise) return existingPromise

  const refreshPromise = fetchTrackerTopicRows(requestedUniversity)
    .then((rows) => {
      const changed = applyTrackerTopicRows(rows)
      if (changed && requestedUniversity === activeUniversityId) refreshTrackerAfterRemoteUpdate()
    })
    .catch((error) => {
      console.warn('Remote tracker data unavailable; using local fallback.', error)
    })
    .finally(() => {
      if (remoteTrackerRefreshPromises.get(requestedUniversity) === refreshPromise) {
        remoteTrackerRefreshPromises.delete(requestedUniversity)
      }
    })

  remoteTrackerRefreshPromises.set(requestedUniversity, refreshPromise)
  return refreshPromise
}

function isTrackerAdmin() {
  return Boolean(
    trackerAdminState.profile
    && trackerAdminState.enabled
    && String(trackerAdminState.profile.allowed_university_id || 'must') === activeUniversityId
    && String(trackerAdminState.profile.allowed_section || '') === activeAcademicSection
  )
}

function hasTrackerAdminAccess() {
  return Boolean(
    trackerAdminState.profile
    && String(trackerAdminState.profile.allowed_university_id || 'must') === activeUniversityId
    && String(trackerAdminState.profile.allowed_section || '') === activeAcademicSection
  )
}

function getAdminCollectionKey(subjectCode = activeSubjectCode, track = activeSubjectTrack) {
  return `${activeUniversityId}::${activeAcademicSection}::${subjectCode || ''}::${track}`
}

function getAdminTopicKey(subject, topic, track = activeSubjectTrack) {
  return `${activeUniversityId}::${activeAcademicSection}::${subject.code}::${track}::${topic.label}`
}

function getAdminTopicContext(subjectCode, track, topicLabel) {
  const subject = subjects.find(item => item.code === subjectCode)
  const collection = track === 'clinical' ? getClinicalTopics(subject || {}) : subject?.topics
  const topic = collection?.find(item => item.label === topicLabel)
  return subject && topic ? { subject, topic, collection, track } : null
}

function makeAdminTopicPayload(subject, topic, track = activeSubjectTrack, overrides = {}) {
  return {
    university_id: activeUniversityId,
    section: activeAcademicSection,
    subject_code: subject.code,
    subject_name: subject.name,
    track,
    topic_label: topic.label,
    state: topic.state || 'remaining',
    stop_note: topic.stopNote || null,
    drive_url: topic.driveUrl || topic.lectureUrls?.[0]?.url || null,
    audio_url: topic.audioUrl || null,
    display_order: Number.isFinite(topic.displayOrder) ? topic.displayOrder : null,
    midterm_scope: Boolean(topic.midtermScope),
    midterm_scope_note: topic.midtermScopeNote || null,
    ...overrides
  }
}

function setAdminLoginStatus(message, tone = 'neutral') {
  if (!adminLoginStatus) return
  adminLoginStatus.textContent = message
  adminLoginStatus.dataset.tone = tone
}

function openAdminLogin() {
  setStudentSyncMenu(false)
  if (hasTrackerAdminAccess()) {
    trackerAdminState.enabled = !trackerAdminState.enabled
    closeAdminEditor()
    renderTrackerAdminUi()
    renderSubjects()
    if (activeSubjectCode) setActiveSubject(activeSubjectCode, 'open')
    if (newsCardsState.remoteSections.has(getUniversitySectionKey())) {
      replaceNewsFeedWithRemoteRows()
      renderNewsFilters()
    }

    showGlobalToast(trackerAdminState.enabled ? 'Admin mode on.' : 'Student view on.')
    return
  }
  adminLoginModal.hidden = false
  document.body.classList.add('admin-modal-open')
  setAdminLoginStatus('')
  activateManagedModal(adminLoginModal, closeAdminLogin, adminLoginEmail)
}

function closeAdminLogin() {
  if (!adminLoginModal) return
  deactivateManagedModal(adminLoginModal)
  adminLoginModal.hidden = true
  document.body.classList.remove('admin-modal-open')
  if (adminLoginPassword) adminLoginPassword.value = ''
}

function closeAdminEditor() {
  if (!trackerAdminEditPanel) return
  trackerAdminEditPanel.classList.remove('is-open')
  window.setTimeout(() => {
    trackerAdminEditPanel.hidden = true
    trackerAdminEditPanel.innerHTML = ''
  }, 260)
}

function renderTrackerAdminUi() {
  const enabled = isTrackerAdmin()
  const adminSwitch = document.querySelector('[data-tracker-admin-toggle]')
  document.body.classList.toggle('tracker-admin-mode', enabled)
  adminSwitch?.classList.toggle('is-active', enabled)
  if (adminSwitch) {
    adminSwitch.setAttribute('aria-label', enabled ? 'Switch to student view' : 'Switch to admin mode')
    const label = adminSwitch.querySelector('span')
    if (label) label.textContent = enabled ? 'Student view' : 'Admin mode'
  }
  if (trackerAdminToolbar) trackerAdminToolbar.hidden = !enabled
  if (trackerAdminEmail) trackerAdminEmail.textContent = enabled ? studentProgressState.user?.email || '' : ''
  if (trackerAdminSubject) {
    trackerAdminSubject.textContent = activeSubjectCode
      ? `${activeSubjectCode} · ${activeSubjectTrack === 'clinical' ? 'Clinical' : 'Theoretical'}`
      : 'Choose a subject'
  }
  const dirty = trackerAdminState.dirtyCollections.has(getAdminCollectionKey())
  if (trackerAdminSaveOrder) {
    trackerAdminSaveOrder.disabled = !enabled || !dirty || trackerAdminState.saving
    trackerAdminSaveOrder.textContent = trackerAdminState.saving && dirty ? 'Saving...' : 'Save arrangement'
  }
  renderNewsAdminToolbar()
}

async function refreshTrackerAdminProfile(user) {
  if (!user) {
    trackerAdminState.profile = null
    trackerAdminState.enabled = false
    trackerAdminState.dirtyCollections.clear()
    closeAdminEditor()
    renderTrackerAdminUi()
    return
  }
  try {
    trackerAdminState.profile = await fetchAdminProfile()
    if (!trackerAdminState.profile) trackerAdminState.enabled = false
  } catch (error) {
    trackerAdminState.profile = null
    console.warn('Admin profile check failed.', error)
  }
  renderTrackerAdminUi()
  renderStudentSyncUi()
  if (isStandaloneProfilePage) {
    renderProfileSection()
    return
  }
  if (newsCardsState.remoteSections.has(getUniversitySectionKey())) {
    replaceNewsFeedWithRemoteRows()
    renderNewsFilters()
  } else {
    await refreshRemoteNewsCards(activeAcademicSection)
  }
  renderSubjects()
  if (activeSubjectCode) setActiveSubject(activeSubjectCode, 'open')
}

function openAdminTopicEditor(subjectCode, track, topicLabel) {
  if (!isTrackerAdmin() || !trackerAdminEditPanel) return
  const context = getAdminTopicContext(subjectCode, track, topicLabel)
  if (!context) return
  const { subject, topic } = context
  const states = ['remaining', 'announced', 'partial', 'taken']
  trackerAdminEditPanel.innerHTML = `
    <div class="admin-edit-panel__inner">
      <div class="admin-edit-panel__header">
        <div class="admin-edit-panel__title-row">
          <span class="admin-edit-panel__subject">${escapeHtml(subject.code)} / ${escapeHtml(track)}</span>
          <button class="admin-edit-close" type="button" data-admin-editor-close aria-label="Close">×</button>
        </div>
        <h2 class="admin-edit-panel__title">${escapeHtml(topic.label)}</h2>
        <p class="admin-edit-panel__subject-name">${escapeHtml(subject.name)}</p>
      </div>
      <form class="admin-edit-form" data-tracker-admin-edit-form data-subject-code="${escapeHtml(subject.code)}" data-track="${escapeHtml(track)}" data-topic-label="${escapeHtml(topic.label)}">
        <div class="admin-edit-states">
          ${states.map(state => `
            <label class="admin-state-option admin-state-option--${state}${topic.state === state ? ' is-selected' : ''}">
              <input type="radio" name="admin-state" value="${state}" ${topic.state === state ? 'checked' : ''}>
              <span>${state[0].toUpperCase() + state.slice(1)}</span>
            </label>
          `).join('')}
        </div>
        <label class="admin-edit-label">Where did we stop / notes
          <textarea class="admin-edit-textarea" name="stop_note" rows="4" placeholder="Optional note">${escapeHtml(topic.stopNote || '')}</textarea>
        </label>
        <label class="admin-edit-label">
          <span><input type="checkbox" name="midterm_scope" ${topic.midtermScope ? 'checked' : ''}> Included in midterm scope</span>
          <textarea class="admin-edit-textarea" name="midterm_scope_note" rows="3" placeholder="Optional midterm scope note">${escapeHtml(topic.midtermScopeNote || '')}</textarea>
        </label>
        <div class="admin-edit-grid">
          <label class="admin-edit-label">Google Drive Link
            <input class="admin-edit-input" type="url" name="drive_url" value="${escapeHtml(topic.driveUrl || topic.lectureUrls?.[0]?.url || '')}" placeholder="https://drive.google.com/...">
          </label>
          <label class="admin-edit-label">Lecture Record Link
            <input class="admin-edit-input" type="url" name="audio_url" value="${escapeHtml(topic.audioUrl || '')}" placeholder="https://drive.google.com/...">
          </label>
        </div>
        <button class="admin-save-btn" type="submit">Save topic</button>
      </form>
    </div>`
  trackerAdminEditPanel.hidden = false
  requestAnimationFrame(() => trackerAdminEditPanel.classList.add('is-open'))
}

async function saveAdminTopicForm(form) {
  const context = getAdminTopicContext(form.dataset.subjectCode, form.dataset.track, form.dataset.topicLabel)
  if (!context || trackerAdminState.saving) return
  const { subject, topic, track } = context
  const submit = form.querySelector('[type="submit"]')
  const nextState = form.querySelector('input[name="admin-state"]:checked')?.value || topic.state || 'remaining'
  const stopNote = form.querySelector('[name="stop_note"]').value.trim()
  const driveUrl = form.querySelector('[name="drive_url"]').value.trim()
  const audioUrl = form.querySelector('[name="audio_url"]').value.trim()
  const midtermScope = form.querySelector('[name="midterm_scope"]').checked
  const midtermScopeNote = form.querySelector('[name="midterm_scope_note"]').value.trim()
  trackerAdminState.saving = true
  if (submit) { submit.disabled = true; submit.textContent = 'Saving...' }
  try {
    const rows = await upsertTrackerTopics([makeAdminTopicPayload(subject, topic, track, {
      state: nextState,
      stop_note: stopNote || null,
      drive_url: driveUrl || null,
      audio_url: audioUrl || null,
      midterm_scope: midtermScope,
      midterm_scope_note: midtermScopeNote || null
    })])
    applyTrackerTopicRows(rows)
    closeAdminEditor()
    refreshTrackerAfterRemoteUpdate()
  } catch (error) {
    if (submit) { submit.disabled = false; submit.textContent = 'Save topic' }
    window.alert(`Topic was not saved: ${error.message}`)
  } finally {
    trackerAdminState.saving = false
    renderTrackerAdminUi()
  }
}

function moveAdminTopic(subjectCode, track, topicLabel, direction) {
  const context = getAdminTopicContext(subjectCode, track, topicLabel)
  if (!context) return
  const { collection } = context
  const index = collection.findIndex(item => item.label === topicLabel)
  const nextIndex = direction === 'up' ? index - 1 : index + 1
  if (index < 0 || nextIndex < 0 || nextIndex >= collection.length) return
  ;[collection[index], collection[nextIndex]] = [collection[nextIndex], collection[index]]
  collection.forEach((topic, topicIndex) => { topic.displayOrder = (topicIndex + 1) * 10 })
  trackerAdminState.dirtyCollections.add(getAdminCollectionKey(subjectCode, track))
  renderSubjects()
  setActiveSubject(subjectCode, 'open')
  renderTrackerAdminUi()
}

async function saveAdminArrangement() {
  if (!isTrackerAdmin() || trackerAdminState.saving || !activeSubjectCode) return
  const subject = subjects.find(item => item.code === activeSubjectCode)
  const collection = activeSubjectTrack === 'clinical' ? getClinicalTopics(subject) : subject?.topics
  if (!subject || !collection) return
  trackerAdminState.saving = true
  renderTrackerAdminUi()
  try {
    const payload = collection.map((topic, index) => makeAdminTopicPayload(subject, topic, activeSubjectTrack, { display_order: (index + 1) * 10 }))
    const rows = await upsertTrackerTopics(payload)
    applyTrackerTopicRows(rows)
    trackerAdminState.dirtyCollections.delete(getAdminCollectionKey())
    refreshTrackerAfterRemoteUpdate()
  } catch (error) {
    window.alert(`Arrangement was not saved: ${error.message}`)
  } finally {
    trackerAdminState.saving = false
    renderTrackerAdminUi()
  }
}

function getDefaultUserPreferences() {
  return {
    anonymous: false,
    selected_university: null,
    selected_section: null,
    nickname: '',
    avatar_id: '',
    profile_setup_version: 0
  }
}

function getStudentNickname() {
  return String(leaderboardState.preferences?.nickname || '').trim()
}

function validateNickname(rawValue) {
  const nickname = String(rawValue || '').trim().replace(/\s+/g, ' ')
  if (!nickname) return { nickname: '', error: '' }
  if (nickname.length < 2 || nickname.length > 24) return { nickname, error: 'Nickname must be 2-24 characters.' }
  if (/[\u0000-\u001f\u007f]/.test(nickname)) return { nickname, error: 'Nickname has unsupported characters.' }
  if (/@/.test(nickname) || /\bhttps?:\/\//i.test(nickname) || /\bwww\./i.test(nickname)) return { nickname, error: 'Do not use emails or links.' }
  return { nickname, error: '' }
}

function getProgressStorageOwnerId() {
  return studentProgressState.user?.id || ''
}

function getProfileAvatarById(avatarId) {
  return PROFILE_AVATARS.find((avatar) => avatar.id === avatarId) || null
}

function getDefaultProfileAvatarId(ownerId = getProgressStorageOwnerId()) {
  const seed = String(ownerId || 'student')
  const hash = [...seed].reduce((total, character) => total + character.charCodeAt(0), 0)
  return PROFILE_AVATARS[hash % PROFILE_AVATARS.length].id
}

function getProfileAvatarStorageKey() {
  return `${PROFILE_AVATAR_STORAGE_PREFIX}::${getProgressStorageOwnerId()}`
}

function getLocalProfileAvatarId() {
  try {
    const avatarId = localStorage.getItem(getProfileAvatarStorageKey()) || ''
    return getProfileAvatarById(avatarId) ? avatarId : ''
  } catch {
    return ''
  }
}

function saveLocalProfileAvatarId(avatarId) {
  try {
    localStorage.setItem(getProfileAvatarStorageKey(), avatarId)
  } catch {
    // The cloud preference remains the durable source when local storage is unavailable.
  }
}

function getStudentAvatarId() {
  const cloudAvatarId = String(leaderboardState.preferences?.avatar_id || '')
  if (getProfileAvatarById(cloudAvatarId)) return cloudAvatarId
  return getLocalProfileAvatarId() || getDefaultProfileAvatarId()
}

function getSavedProfileAvatarId() {
  const avatarId = String(leaderboardState.preferences?.avatar_id || '')
  return getProfileAvatarById(avatarId) ? avatarId : ''
}

function isProfileSetupComplete(preferences = leaderboardState.preferences) {
  return Number(preferences?.profile_setup_version) >= 1
    && preferences?.anonymous === false
    && !!String(preferences?.nickname || '').trim()
    && !!getProfileAvatarById(String(preferences?.avatar_id || ''))
}

function getProfileAvatarClass(avatarId) {
  const validAvatarId = getProfileAvatarById(avatarId)?.id || getDefaultProfileAvatarId()
  return `student-avatar--${validAvatarId}`
}

function getProfileAvatarMarkup(avatarId, className = '', label = 'Selected profile') {
  return `<span class="student-avatar ${getProfileAvatarClass(avatarId)} ${className}" role="img" aria-label="${escapeHtml(label)} avatar"></span>`
}

function getLeaderboardAvatarId(entry, fallbackIndex = 0) {
  const avatarId = String(entry?.avatar_id || '')
  if (getProfileAvatarById(avatarId)) return avatarId
  return PROFILE_AVATARS[Math.abs(fallbackIndex) % PROFILE_AVATARS.length].id
}

function canUseLegacyLocalProgress() {
  const userId = getProgressStorageOwnerId()
  if (!userId || activeUniversityId !== 'must') return false
  try {
    return localStorage.getItem(LOCAL_PROGRESS_OWNER_KEY) === userId
  } catch {
    return false
  }
}

function claimAndMigrateLocalProgress(userId) {
  if (!userId) return
  try {
    const existingOwner = localStorage.getItem(LOCAL_PROGRESS_OWNER_KEY)
    if (existingOwner && existingOwner !== userId) return
    if (!existingOwner) localStorage.setItem(LOCAL_PROGRESS_OWNER_KEY, userId)

    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(Boolean)
    keys.forEach((storageKey) => {
      const match = storageKey.match(/^(topicCompletion|quizState)::(401|402)::(.+)$/)
      if (!match) return
      const scopedKey = `${match[1]}::${userId}::${match[2]}::${match[3]}`
      if (localStorage.getItem(scopedKey) === null) {
        localStorage.setItem(scopedKey, localStorage.getItem(storageKey))
      }
    })
  } catch {
    // Cloud progress remains available when browser storage is blocked.
  }
}

function getUnscopedTopicCompletionKey(subjectCode, topicLabel, section = activeAcademicSection) {
  return `${TOPIC_COMPLETION_STORAGE_PREFIX}::${section}::${encodeURIComponent(subjectCode)}::${encodeURIComponent(topicLabel)}`
}

function getUnscopedQuizStorageKey(topicLabel, sourceId = 'current', section = activeAcademicSection) {
  return `${QUIZ_STORAGE_PREFIX}::${section}::${encodeURIComponent(topicLabel)}::${encodeURIComponent(sourceId)}`
}

function getLocalTopicCompletionState(subjectCode, topicLabel, section = activeAcademicSection) {
  const emptyState = { studied: false, mcqs: false }
  const currentSection = activeAcademicSection
  const storageKey = getTopicCompletionKey(subjectCode, topicLabel, section)

  try {
    const savedRaw = localStorage.getItem(storageKey)
      || (canUseLegacyLocalProgress() ? localStorage.getItem(getUnscopedTopicCompletionKey(subjectCode, topicLabel, section)) : null)
      || (canUseLegacyLocalProgress() && section === '401' ? localStorage.getItem(getLegacyTopicCompletionKey(subjectCode, topicLabel)) : null)
    const savedState = JSON.parse(savedRaw || '{}')
    return {
      ...emptyState,
      studied: !!savedState.studied,
      mcqs: !!savedState.mcqs
    }
  } catch {
    if (section === currentSection) localStorage.removeItem(getTopicCompletionKey(subjectCode, topicLabel))
    return emptyState
  }
}

function getLocalQuizState(topicLabel, sourceId = 'current', section = activeAcademicSection) {
  const storageKey = getQuizStorageKey(topicLabel, sourceId, section)

  try {
    const savedRaw = localStorage.getItem(storageKey)
      || (canUseLegacyLocalProgress() ? localStorage.getItem(getUnscopedQuizStorageKey(topicLabel, sourceId, section)) : null)
      || (canUseLegacyLocalProgress() && section === '401' ? localStorage.getItem(getLegacyQuizStorageKey(topicLabel, sourceId)) : null)
    return JSON.parse(savedRaw || 'null')
  } catch {
    if (section === activeAcademicSection) localStorage.removeItem(getQuizStorageKey(topicLabel, sourceId))
    return null
  }
}

function getQuizProgressStatsFromPayload(payload) {
  const answers = payload?.answers || {}
  const totalQuestions = payload?.totalQuestions || payload?.order?.length || 0
  const answeredCount = Object.keys(answers).length
  const wrongQuestionIds = Array.isArray(payload?.wrongQuestionIds) ? payload.wrongQuestionIds : []

  return {
    totalQuestions,
    answeredCount,
    score: Number.isFinite(payload?.score) ? payload.score : null,
    wrongQuestionIds
  }
}

function renderStudentSyncUi() {
  if (!studentSync) return

  const signedIn = !!studentProgressState.user
  studentSync.classList.toggle('is-signed-in', signedIn)
  studentSync.classList.toggle('is-loading', studentProgressState.loading)
  if (studentSyncButton) studentSyncButton.hidden = !signedIn
  const logoutButton = studentSync.querySelector('[data-student-sync-logout]')
  const profileButtons = studentSync.querySelectorAll('[data-profile-open], [data-profile-edit-nickname]')
  const adminModeButton = studentSync.querySelector('[data-tracker-admin-toggle]')
  if (logoutButton) logoutButton.hidden = !signedIn
  profileButtons.forEach((button) => { button.hidden = !signedIn })
  if (adminModeButton) adminModeButton.hidden = !signedIn || !hasTrackerAdminAccess()

  if (studentSyncAvatar) {
    const nickname = getStudentNickname() || 'Student'
    studentSyncAvatar.className = `student-sync__avatar student-avatar ${getProfileAvatarClass(getStudentAvatarId())}`
    studentSyncAvatar.hidden = !signedIn
    studentSyncAvatar.setAttribute('aria-label', `${nickname} avatar`)
    studentSyncButton?.setAttribute('aria-label', signedIn ? `Open ${nickname} profile menu` : 'Login')
  }

  if (studentSyncEmail) {
    studentSyncEmail.textContent = signedIn ? (getStudentNickname() || 'Complete your profile') : 'Google sync is off'
  }

  if (studentSyncStatus) {
    if (!isSupabaseConfigured()) {
      studentSyncStatus.hidden = false
      studentSyncStatus.textContent = 'Sync unavailable.'
    } else if (studentProgressState.loading) {
      studentSyncStatus.hidden = false
      studentSyncStatus.textContent = 'Loading your saved progress...'
    } else if (studentProgressState.lastError) {
      studentSyncStatus.hidden = false
      studentSyncStatus.textContent = 'Sync needs retry. Local progress is still saved.'
    } else if (signedIn) {
      studentSyncStatus.textContent = ''
      studentSyncStatus.hidden = true
    } else {
      studentSyncStatus.hidden = false
      studentSyncStatus.textContent = `Google login is required to use ${getUniversity().hubName}.`
    }
  }
  renderProfileSection()
}

const leaderboardState = {
  loading: false,
  error: '',
  rows: [],
  preferences: getDefaultUserPreferences(),
  lastFetched: 0,
  university: '',
  section: '',
  requestId: 0
}
let pendingProfileAvatarId = ''
const profileOnboardingTourState = {
  active: false,
  stepIndex: 0,
  root: null,
  target: null,
  positionFrame: 0,
  listenersBound: false
}

const PROFILE_ONBOARDING_STEPS = [
  {
    target: '#profile-nickname-input',
    title: 'Choose your nickname',
    copy: 'Enter a unique nickname. This is the name other students will see.',
    action: 'Next: choose an avatar'
  },
  {
    target: '#profile-avatar-options',
    title: 'Choose an avatar',
    copy: 'Tap the picture you like. We will move to the last step.',
    action: ''
  },
  {
    target: '#profile-nickname-form [type="submit"]',
    title: 'Save your profile',
    copy: 'Tap Save profile to finish. Then you can open the tracker.',
    action: ''
  }
]

const liveActivityState = {
  loading: false,
  rows: [],
  lastFetched: 0,
  university: '',
  section: '',
  timer: null,
  unavailable: false
}

const onlineStudentsState = {
  loading: false,
  rows: [],
  lastFetched: 0,
  university: '',
  section: '',
  timer: null,
  heartbeatTimer: null,
  unavailable: false
}

function formatActivityTime(value) {
  const timestamp = new Date(value || 0).getTime()
  if (!timestamp) return 'just now'
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000))
  if (elapsedMinutes < 1) return 'now'
  if (elapsedMinutes === 1) return '1 min'
  return `${Math.min(elapsedMinutes, 59)} min`
}

function getActivityDescription(row) {
  const topic = String(row.topic_label || row.source_label || 'MCQs').trim()
  if (row.completed) return `finished ${topic}`
  const answered = Math.max(0, Number(row.answered_count) || 0)
  const total = Math.max(answered, Number(row.total_questions) || 0)
  return total ? `${answered}/${total} in ${topic}` : `practising ${topic}`
}

function renderLiveActivityContainer(container, limit) {
  if (!container) return
  const rows = liveActivityState.rows.slice(0, limit)
  if (!rows.length) {
    container.hidden = true
    container.innerHTML = ''
    return
  }

  container.hidden = false
  container.innerHTML = `
    <span class="study-pulse__label">
      <i aria-hidden="true"></i>
      MCQ activity
    </span>
    <div class="study-pulse__rail">
      ${rows.map((row, index) => {
        const name = String(row.display_name || 'Student')
        const avatarId = getLeaderboardAvatarId(row, index)
        const rank = Math.max(1, Number(row.rank) || index + 1)
        return `
          <article class="study-pulse__event">
            ${getProfileAvatarMarkup(avatarId, 'study-pulse__avatar', name)}
            <span class="study-pulse__copy">
              <strong>${escapeHtml(name)}</strong>
              <small>${escapeHtml(getActivityDescription(row))}</small>
            </span>
            <span class="study-pulse__rank" aria-label="Rank ${rank}">#${rank}</span>
            <time datetime="${escapeHtml(row.updated_at || '')}">${formatActivityTime(row.updated_at)}</time>
          </article>
        `
      }).join('')}
    </div>
  `
}

function renderLiveActivity() {
  renderLiveActivityContainer(document.getElementById('quiz-live-activity'), 3)
}

function renderOnlineStudents() {
  const container = document.getElementById('tracker-live-activity')
  if (!container) return
  const rows = onlineStudentsState.rows.slice(0, 10)
  if (!rows.length) {
    container.hidden = true
    container.innerHTML = ''
    return
  }

  container.hidden = false
  container.innerHTML = `
    <div class="study-pulse__rail">
      ${rows.map((row, index) => {
        const name = String(row.display_name || 'Student')
        const avatarId = getLeaderboardAvatarId(row, index)
        const isMcqActive = Boolean(row.is_mcq_active)
        return `
          <article class="study-pulse__event${isMcqActive ? ' study-pulse__event--mcq' : ''}">
            ${getProfileAvatarMarkup(avatarId, 'study-pulse__avatar', name)}
            <span class="study-pulse__copy">
              <strong>${escapeHtml(name)}</strong>
              <small>${isMcqActive ? 'Solving MCQs' : 'Online'}</small>
            </span>
            ${isMcqActive ? '<span class="study-pulse__rank">MCQ</span>' : ''}
          </article>
        `
      }).join('')}
    </div>
  `
}

function getPresencePage() {
  if (isStandaloneProfilePage) return 'profile'
  if (window.location.hash === '#leaderboard') return 'leaderboard'
  if (window.location.hash === '#schedule') return 'schedule'
  if (window.location.hash === '#news') return 'news'
  return 'tracker'
}

function getPresencePayload() {
  const modal = document.getElementById('quiz-modal')
  const isQuizOpen = Boolean(modal && modal.getAttribute('aria-hidden') === 'false' && quizState.topicLabel && !quizState.showResumePrompt)
  return {
    universityId: activeUniversityId,
    section: activeAcademicSection,
    page: isQuizOpen ? 'mcqs' : getPresencePage(),
    isMcqActive: isQuizOpen,
    topicLabel: isQuizOpen ? quizState.topicLabel : null,
    sourceLabel: isQuizOpen ? quizState.sourceLabel : null
  }
}

async function refreshOnlineStudents(force = false) {
  if (isResourceFirstSection()) {
    onlineStudentsState.rows = []
    renderOnlineStudents()
    return
  }
  if (!studentProgressState.user || onlineStudentsState.loading || onlineStudentsState.unavailable) {
    renderOnlineStudents()
    return
  }
  const now = Date.now()
  if (
    !force
    && onlineStudentsState.university === activeUniversityId
    && onlineStudentsState.section === activeAcademicSection
    && now - onlineStudentsState.lastFetched < 15000
  ) {
    renderOnlineStudents()
    return
  }

  onlineStudentsState.loading = true
  try {
    onlineStudentsState.rows = await fetchOnlineStudents(activeUniversityId, activeAcademicSection, 10)
    onlineStudentsState.university = activeUniversityId
    onlineStudentsState.section = activeAcademicSection
    onlineStudentsState.lastFetched = Date.now()
    renderOnlineStudents()
  } catch (error) {
    onlineStudentsState.rows = []
    onlineStudentsState.unavailable = true
    renderOnlineStudents()
    console.info('Online students will appear after the presence database update is enabled.', error)
  } finally {
    onlineStudentsState.loading = false
  }
}

async function sendStudentPresence(forceRefresh = false) {
  if (isResourceFirstSection()) {
    onlineStudentsState.rows = []
    renderOnlineStudents()
    return
  }
  if (isLocalTestMode) {
    renderOnlineStudents()
    return
  }
  if (!studentProgressState.user || onlineStudentsState.unavailable) {
    renderOnlineStudents()
    return
  }
  try {
    await markStudentOnline(getPresencePayload())
    await refreshOnlineStudents(forceRefresh)
  } catch (error) {
    onlineStudentsState.unavailable = true
    onlineStudentsState.rows = []
    renderOnlineStudents()
    console.info('Online presence will appear after its database update is enabled.', error)
  }
}

function initOnlineStudents() {
  renderOnlineStudents()
  if (onlineStudentsState.timer) return
  sendStudentPresence(true)
  onlineStudentsState.timer = window.setInterval(() => {
    if (document.visibilityState === 'visible') sendStudentPresence()
  }, 30000)
  onlineStudentsState.heartbeatTimer = window.setInterval(() => {
    if (document.visibilityState === 'visible') refreshOnlineStudents()
  }, 15000)
}

async function fetchAndRenderLiveActivity(force = false) {
  if (isResourceFirstSection()) {
    liveActivityState.rows = []
    renderLiveActivity()
    return
  }
  if (isLocalTestMode) {
    renderLiveActivity()
    return
  }
  if (!studentProgressState.user || liveActivityState.loading || liveActivityState.unavailable) {
    renderLiveActivity()
    return
  }
  const now = Date.now()
  if (
    !force
    && liveActivityState.university === activeUniversityId
    && liveActivityState.section === activeAcademicSection
    && now - liveActivityState.lastFetched < 20000
  ) {
    renderLiveActivity()
    return
  }

  liveActivityState.loading = true
  try {
    liveActivityState.rows = await fetchRecentMcqActivity(activeUniversityId, activeAcademicSection, 8)
    liveActivityState.university = activeUniversityId
    liveActivityState.section = activeAcademicSection
    liveActivityState.lastFetched = Date.now()
    renderLiveActivity()
  } catch (error) {
    liveActivityState.rows = []
    liveActivityState.unavailable = true
    renderLiveActivity()
    console.info('Study pulse will appear after its database update is enabled.', error)
  } finally {
    liveActivityState.loading = false
  }
}

function initLiveActivity() {
  renderLiveActivity()
  if (liveActivityState.timer) return
  liveActivityState.timer = window.setInterval(() => {
    if (document.visibilityState === 'visible') fetchAndRenderLiveActivity()
  }, 20000)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') fetchAndRenderLiveActivity(true)
  })
}

function getProfileOnboardingStep() {
  return PROFILE_ONBOARDING_STEPS[profileOnboardingTourState.stepIndex] || PROFILE_ONBOARDING_STEPS[0]
}

function getProfileOnboardingFocusableElements() {
  const target = profileOnboardingTourState.target
  const tooltip = profileOnboardingTourState.root?.querySelector('.profile-onboarding-tour__tooltip')
  return [...new Set([
    ...(target?.matches('button, input, select, textarea, a[href]') ? [target] : []),
    ...(target?.querySelectorAll?.('button, input, select, textarea, a[href]') || []),
    ...(tooltip?.querySelectorAll('button:not([disabled])') || [])
  ])].filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true')
}

function focusProfileOnboardingTarget() {
  const focusable = getProfileOnboardingFocusableElements()
  focusable[0]?.focus({ preventScroll: true })
}

function updateProfileOnboardingAction() {
  const action = profileOnboardingTourState.root?.querySelector('[data-profile-onboarding-next]')
  if (!action) return
  const step = getProfileOnboardingStep()
  action.hidden = !step.action
  action.textContent = step.action
  if (profileOnboardingTourState.stepIndex === 0) {
    const input = document.getElementById('profile-nickname-input')
    const validation = validateNickname(input?.value || '')
    action.disabled = !!validation.error || !validation.nickname
  } else {
    action.disabled = false
  }
}

function setProfileOnboardingPanel(panel, styles) {
  if (!panel) return
  Object.assign(panel.style, styles)
}

function positionProfileOnboardingTour() {
  if (!profileOnboardingTourState.active) return
  const root = profileOnboardingTourState.root
  const target = profileOnboardingTourState.target
  const tooltip = root?.querySelector('.profile-onboarding-tour__tooltip')
  if (!root || !target || !tooltip) return

  const viewportWidth = document.documentElement.clientWidth
  const viewportHeight = window.innerHeight
  const targetRect = target.getBoundingClientRect()
  const highlightPadding = 8
  const gap = 14
  const edge = 12
  const top = Math.max(0, Math.min(viewportHeight, targetRect.top - highlightPadding))
  const right = Math.max(0, Math.min(viewportWidth, targetRect.right + highlightPadding))
  const bottom = Math.max(0, Math.min(viewportHeight, targetRect.bottom + highlightPadding))
  const left = Math.max(0, Math.min(viewportWidth, targetRect.left - highlightPadding))

  setProfileOnboardingPanel(root.querySelector('[data-profile-tour-panel="top"]'), {
    inset: '0 0 auto 0',
    height: `${top}px`
  })
  setProfileOnboardingPanel(root.querySelector('[data-profile-tour-panel="bottom"]'), {
    inset: `${bottom}px 0 0 0`
  })
  setProfileOnboardingPanel(root.querySelector('[data-profile-tour-panel="left"]'), {
    inset: `${top}px auto auto 0`,
    width: `${left}px`,
    height: `${Math.max(0, bottom - top)}px`
  })
  setProfileOnboardingPanel(root.querySelector('[data-profile-tour-panel="right"]'), {
    inset: `${top}px 0 auto ${right}px`,
    height: `${Math.max(0, bottom - top)}px`
  })

  const tooltipRect = tooltip.getBoundingClientRect()
  const available = {
    below: viewportHeight - bottom - gap - edge,
    above: top - gap - edge,
    right: viewportWidth - right - gap - edge,
    left: left - gap - edge
  }
  const placements = viewportWidth <= 680
    ? ['below', 'above', 'right', 'left']
    : ['right', 'below', 'above', 'left']
  const fits = {
    below: available.below >= tooltipRect.height,
    above: available.above >= tooltipRect.height,
    right: available.right >= tooltipRect.width,
    left: available.left >= tooltipRect.width
  }
  const placement = placements.find((candidate) => fits[candidate])
    || placements.sort((a, b) => available[b] - available[a])[0]

  let tooltipTop = edge
  let tooltipLeft = edge
  if (placement === 'below' || placement === 'above') {
    tooltipTop = placement === 'below' ? bottom + gap : top - gap - tooltipRect.height
    tooltipLeft = Math.min(
      viewportWidth - tooltipRect.width - edge,
      Math.max(edge, targetRect.left + (targetRect.width - tooltipRect.width) / 2)
    )
    tooltip.style.setProperty(
      '--profile-tour-arrow-offset',
      `${Math.max(22, Math.min(tooltipRect.width - 22, targetRect.left + (targetRect.width / 2) - tooltipLeft))}px`
    )
  } else {
    tooltipLeft = placement === 'right' ? right + gap : left - gap - tooltipRect.width
    tooltipTop = Math.min(
      viewportHeight - tooltipRect.height - edge,
      Math.max(edge, targetRect.top + (targetRect.height - tooltipRect.height) / 2)
    )
    tooltip.style.setProperty(
      '--profile-tour-arrow-offset',
      `${Math.max(22, Math.min(tooltipRect.height - 22, targetRect.top + (targetRect.height / 2) - tooltipTop))}px`
    )
  }

  tooltip.dataset.placement = placement
  tooltip.style.top = `${Math.max(edge, tooltipTop)}px`
  tooltip.style.left = `${Math.max(edge, tooltipLeft)}px`
  tooltip.style.visibility = 'visible'
}

function requestProfileOnboardingPosition() {
  window.cancelAnimationFrame(profileOnboardingTourState.positionFrame)
  profileOnboardingTourState.positionFrame = window.requestAnimationFrame(positionProfileOnboardingTour)
}

function ensureProfileOnboardingTour() {
  if (profileOnboardingTourState.root) return profileOnboardingTourState.root
  const root = document.createElement('div')
  root.className = 'profile-onboarding-tour'
  root.hidden = true
  root.innerHTML = `
    <div class="profile-onboarding-tour__panel" data-profile-tour-panel="top"></div>
    <div class="profile-onboarding-tour__panel" data-profile-tour-panel="right"></div>
    <div class="profile-onboarding-tour__panel" data-profile-tour-panel="bottom"></div>
    <div class="profile-onboarding-tour__panel" data-profile-tour-panel="left"></div>
    <aside class="profile-onboarding-tour__tooltip" role="dialog" aria-modal="true" aria-labelledby="profile-onboarding-title" aria-describedby="profile-onboarding-copy">
      <span class="profile-onboarding-tour__step"></span>
      <strong id="profile-onboarding-title"></strong>
      <p id="profile-onboarding-copy"></p>
      <button type="button" data-profile-onboarding-next></button>
    </aside>
  `
  document.body.append(root)
  root.querySelector('[data-profile-onboarding-next]')?.addEventListener('click', () => {
    const input = document.getElementById('profile-nickname-input')
    const validation = validateNickname(input?.value || '')
    if (validation.error || !validation.nickname) {
      input?.focus()
      return
    }
    showProfileOnboardingStep(1)
  })
  profileOnboardingTourState.root = root

  if (!profileOnboardingTourState.listenersBound) {
    profileOnboardingTourState.listenersBound = true
    window.addEventListener('resize', requestProfileOnboardingPosition)
    window.addEventListener('scroll', requestProfileOnboardingPosition, { passive: true })
    document.addEventListener('focusin', (event) => {
      if (!profileOnboardingTourState.active) return
      const tooltip = profileOnboardingTourState.root?.querySelector('.profile-onboarding-tour__tooltip')
      if (profileOnboardingTourState.target?.contains(event.target) || tooltip?.contains(event.target)) return
      focusProfileOnboardingTarget()
    })
    document.addEventListener('keydown', (event) => {
      if (!profileOnboardingTourState.active) return
      if (event.key === 'Escape') {
        event.preventDefault()
        focusProfileOnboardingTarget()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = getProfileOnboardingFocusableElements()
      if (!focusable.length) {
        event.preventDefault()
        return
      }
      const currentIndex = focusable.indexOf(document.activeElement)
      const nextIndex = event.shiftKey
        ? (currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1)
        : (currentIndex === focusable.length - 1 ? 0 : currentIndex + 1)
      event.preventDefault()
      focusable[nextIndex]?.focus()
    }, true)
  }
  return root
}

function showProfileOnboardingStep(stepIndex) {
  if (!profileOnboardingTourState.active) return
  const root = ensureProfileOnboardingTour()
  const step = PROFILE_ONBOARDING_STEPS[stepIndex]
  if (stepIndex === 1) openProfileAvatarDialog()
  const target = step ? document.querySelector(step.target) : null
  if (!step || !target) return

  profileOnboardingTourState.target?.classList.remove('profile-onboarding-tour__target')
  profileOnboardingTourState.stepIndex = stepIndex
  profileOnboardingTourState.target = target
  target.classList.add('profile-onboarding-tour__target')
  const tooltip = root.querySelector('.profile-onboarding-tour__tooltip')
  if (tooltip) tooltip.style.visibility = 'hidden'
  root.querySelector('.profile-onboarding-tour__step').textContent = `Step ${stepIndex + 1} of ${PROFILE_ONBOARDING_STEPS.length}`
  root.querySelector('#profile-onboarding-title').textContent = step.title
  root.querySelector('#profile-onboarding-copy').textContent = step.copy
  updateProfileOnboardingAction()
  target.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'center',
    inline: 'nearest'
  })
  window.setTimeout(() => {
    requestProfileOnboardingPosition()
    focusProfileOnboardingTarget()
  }, prefersReducedMotion ? 0 : 240)
}

function startProfileOnboardingTour() {
  if (profileOnboardingTourState.active || !isStandaloneProfilePage) return
  const root = ensureProfileOnboardingTour()
  const form = document.getElementById('profile-nickname-form')
  if (form) form.hidden = false
  renderProfileAvatarPicker()
  profileOnboardingTourState.active = true
  document.body.dataset.profileTour = 'active'
  root.hidden = false
  showProfileOnboardingStep(0)
}

function stopProfileOnboardingTour() {
  profileOnboardingTourState.active = false
  window.cancelAnimationFrame(profileOnboardingTourState.positionFrame)
  profileOnboardingTourState.target?.classList.remove('profile-onboarding-tour__target')
  profileOnboardingTourState.target = null
  if (profileOnboardingTourState.root) profileOnboardingTourState.root.hidden = true
  delete document.body.dataset.profileTour
}

function syncProfileOnboardingTour() {
  const shouldRun = isStandaloneProfilePage
    && document.body.dataset.authState === 'ready'
    && !!studentProgressState.user
    && !isProfileSetupComplete()
  if (shouldRun) {
    startProfileOnboardingTour()
  } else {
    stopProfileOnboardingTour()
  }
}

function selectProfileAvatar(rawAvatarId) {
  const avatar = getProfileAvatarById(rawAvatarId)
  if (!avatar) return false
  pendingProfileAvatarId = avatar.id
  renderProfileAvatarPicker()
  const help = document.getElementById('profile-avatar-help')
  if (help) help.textContent = `${avatar.label} selected. Save your profile to confirm it.`
  const advanceOnboarding = profileOnboardingTourState.active && profileOnboardingTourState.stepIndex === 1
  if (profileAvatarDialog?.open) {
    closeProfileAvatarDialog({ restoreFocus: !advanceOnboarding })
  }
  if (advanceOnboarding) {
    showProfileOnboardingStep(2)
  }
  return true
}

async function saveProfileSetup(rawValue) {
  if (!studentProgressState.user) return false
  const { nickname, error } = validateNickname(rawValue)
  const help = document.getElementById('profile-nickname-help')
  const avatarHelp = document.getElementById('profile-avatar-help')
  const form = document.getElementById('profile-nickname-form')
  const submit = form?.querySelector('[type="submit"]')
  const setupRequired = !isProfileSetupComplete()
  const avatarId = pendingProfileAvatarId || (setupRequired ? '' : getSavedProfileAvatarId())

  if (error || !nickname) {
    if (help) help.textContent = error || 'Choose a nickname before saving your profile.'
    if (profileOnboardingTourState.active) showProfileOnboardingStep(0)
    return false
  }
  if (!avatarId) {
    if (avatarHelp) avatarHelp.textContent = 'Choose an avatar before saving your profile.'
    if (profileOnboardingTourState.active) showProfileOnboardingStep(1)
    return false
  }

  try {
    if (submit) submit.disabled = true
    if (help) help.textContent = 'Saving your public profile...'
    leaderboardState.preferences = {
      ...getDefaultUserPreferences(),
      ...leaderboardState.preferences,
      ...(await completeProfileSetup(nickname, avatarId))
    }
    pendingProfileAvatarId = ''
    saveLocalProfileAvatarId(avatarId)
    profileNicknameEditorOpen = false
    document.body.dataset.profileSetup = 'complete'
    stopProfileOnboardingTour()
    renderStudentSyncUi()
    renderProfileSection()
    invalidateLeaderboard(activeUniversityId, activeAcademicSection)
    await fetchAndRenderLeaderboard(true)
    if (help) help.textContent = 'Profile saved.'
    if (avatarHelp) avatarHelp.textContent = 'Avatar saved.'
    showGlobalToast('Profile complete. Welcome to the board.')
    return true
  } catch (saveError) {
    const duplicateNickname = saveError?.code === '23505' || /already taken|unique/i.test(saveError?.message || '')
    if (help) {
      help.textContent = duplicateNickname
        ? 'That nickname is already taken. Choose another one.'
        : 'Your profile was not saved. Please try again.'
    }
    if (profileOnboardingTourState.active) showProfileOnboardingStep(0)
    console.warn('Profile setup failed.', saveError)
    return false
  } finally {
    if (submit) submit.disabled = false
  }
}

function openProfileSection(options = {}) {
  if (!studentProgressState.user) return
  setStudentSyncMenu(false)
  if (!isStandaloneProfilePage) {
    const url = new URL('/profile.html', window.location.origin)
    url.searchParams.set('university', activeUniversityId)
    if (activeAcademicSection) url.searchParams.set('section', activeAcademicSection)
    window.location.href = url.toString()
    return
  }
  renderProfileSection()
  if (options.scroll !== false) window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
}

function openProfileNicknameEditor() {
  if (!studentProgressState.user) return
  if (!isStandaloneProfilePage) {
    const url = new URL('/profile.html', window.location.origin)
    url.searchParams.set('university', activeUniversityId)
    if (activeAcademicSection) url.searchParams.set('section', activeAcademicSection)
    url.searchParams.set('edit', 'nickname')
    window.location.href = url.toString()
    return
  }
  profileNicknameEditorOpen = true
  openProfileSection()
  const input = document.getElementById('profile-nickname-input')
  if (input) {
    input.value = getStudentNickname()
    input.focus()
    input.select()
  }
}

function openProfileAvatarDialog() {
  if (!profileAvatarDialog || profileAvatarDialog.open) return
  profileAvatarDialogOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  profileAvatarDialog.showModal()
  document.body.classList.add('profile-avatar-dialog-open')
  window.requestAnimationFrame(() => {
    const selected = profileAvatarDialog.querySelector('.profile-avatar-option.is-selected')
    const first = profileAvatarDialog.querySelector('[data-profile-avatar]')
    ;(selected || first)?.focus({ preventScroll: true })
  })
}

function closeProfileAvatarDialog(options = {}) {
  if (!profileAvatarDialog?.open) return
  const restoreFocus = options.restoreFocus !== false
  profileAvatarDialog.close()
  document.body.classList.remove('profile-avatar-dialog-open')
  if (restoreFocus) profileAvatarDialogOpener?.focus({ preventScroll: true })
  profileAvatarDialogOpener = null
}

function isLeaderboardActive() {
  const navLink = document.querySelector('[data-section-nav="leaderboard"]')
  return activeSiteMode === activeAcademicSection
    && (window.location.hash === '#leaderboard' || navLink?.classList.contains('active'))
}

function isLeaderboardNearViewport() {
  const section = document.getElementById('leaderboard')
  if (!section) return false
  const bounds = section.getBoundingClientRect()
  return bounds.top < window.innerHeight + 240 && bounds.bottom > -240
}

function invalidateLeaderboard(universityId = activeUniversityId, section = activeAcademicSection) {
  leaderboardState.loading = false
  leaderboardState.error = ''
  leaderboardState.rows = []
  leaderboardState.lastFetched = 0
  leaderboardState.university = universityId
  leaderboardState.section = section
  leaderboardState.requestId += 1
}

function refreshLeaderboardIfActive(force = false) {
  if (!isLeaderboardActive() && !isLeaderboardNearViewport()) return Promise.resolve()
  return fetchAndRenderLeaderboard(force)
}

function initLeaderboardVisibilityLoading() {
  const section = document.getElementById('leaderboard')
  if (!section) return

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) fetchAndRenderLeaderboard()
    }, { rootMargin: '240px 0px', threshold: 0.01 })
    observer.observe(section)
    return
  }

  window.addEventListener('scroll', () => {
    if (isLeaderboardNearViewport()) fetchAndRenderLeaderboard()
  }, { passive: true })
}

function getCurrentLeaderboardEntry() {
  return (leaderboardState.rows || [])
    .find((row) => studentProgressState.user && row.user_id === studentProgressState.user.id)
}

function getRankedLeaderboardRows() {
  return (leaderboardState.rows || []).filter((row) => Number(row.total_score) > 0)
}

function normalizePresenceName(value) {
  return String(value || '').trim().toLowerCase()
}

function isLeaderboardEntryOnline(entry) {
  const displayName = normalizePresenceName(entry.display_name)
  const avatarId = String(entry.avatar_id || '').trim()
  return onlineStudentsState.rows.some((student) => {
    return normalizePresenceName(student.display_name) === displayName
      && (!avatarId || String(student.avatar_id || '').trim() === avatarId)
  })
}

function renderLeaderboardPresence(entry) {
  const online = isLeaderboardEntryOnline(entry)
  return `
    <span class="leaderboard-presence${online ? ' leaderboard-presence--online' : ''}">
      <i aria-hidden="true"></i>
      ${online ? 'Online' : 'Offline'}
    </span>
  `
}

function showGlobalToast(text) {
  const toast = document.getElementById('toast')
  if (!toast) return
  toast.textContent = text
  toast.classList.add('show')
  setTimeout(() => toast.classList.remove('show'), 1600)
}

async function fetchAndRenderLeaderboard(force = false) {
  if (isResourceFirstSection()) {
    leaderboardState.loading = false
    leaderboardState.rows = []
    leaderboardState.lastFetched = 0
    return
  }
  if (leaderboardState.loading) return
  if (isLocalTestMode) {
    leaderboardState.rows = []
    leaderboardState.lastFetched = Date.now()
    renderLeaderboardHtml()
    return
  }

  const requestedUniversity = activeUniversityId
  const requestedSection = activeAcademicSection
  const now = Date.now()
  if (
    !force
    && leaderboardState.university === requestedUniversity
    && leaderboardState.section === requestedSection
    && leaderboardState.rows.length > 0
    && (now - leaderboardState.lastFetched < 60000)
  ) {
    renderLeaderboardHtml()
    return
  }

  const loadingEl = document.getElementById('leaderboard-loading')
  const notSignedInEl = document.getElementById('leaderboard-not-signed-in')
  const noDataEl = document.getElementById('leaderboard-no-data')
  const errorEl = document.getElementById('leaderboard-error')
  const contentEl = document.getElementById('leaderboard-content')

  if (loadingEl) loadingEl.hidden = false
  if (notSignedInEl) notSignedInEl.hidden = true
  if (noDataEl) noDataEl.hidden = true
  if (errorEl) errorEl.hidden = true
  if (contentEl) contentEl.hidden = true

  if (!studentProgressState.user) {
    if (loadingEl) loadingEl.hidden = true
    if (notSignedInEl) notSignedInEl.hidden = false
    return
  }

  leaderboardState.loading = true
  const requestId = ++leaderboardState.requestId
  try {
    const rows = await fetchLeaderboard(requestedUniversity, requestedSection)
    if (
      requestId !== leaderboardState.requestId
      || requestedUniversity !== activeUniversityId
      || requestedSection !== activeAcademicSection
    ) return
    leaderboardState.rows = rows
    leaderboardState.university = requestedUniversity
    leaderboardState.section = requestedSection
    leaderboardState.lastFetched = Date.now()
    leaderboardState.error = ''
    renderLeaderboardHtml()
  } catch (err) {
    if (
      requestId !== leaderboardState.requestId
      || requestedUniversity !== activeUniversityId
      || requestedSection !== activeAcademicSection
    ) return
    console.error('Leaderboard fetch failed:', err)
    leaderboardState.error = err.message || 'Failed to load leaderboard.'
    if (loadingEl) loadingEl.hidden = true
    if (errorEl) errorEl.hidden = false
    showGlobalToast('Failed to load leaderboard.')
  } finally {
    if (requestId === leaderboardState.requestId) {
      leaderboardState.loading = false
    }
  }
}

function renderLeaderboardHtml() {
  const loadingEl = document.getElementById('leaderboard-loading')
  const notSignedInEl = document.getElementById('leaderboard-not-signed-in')
  const noDataEl = document.getElementById('leaderboard-no-data')
  const errorEl = document.getElementById('leaderboard-error')
  const contentEl = document.getElementById('leaderboard-content')
  const podiumEl = document.getElementById('leaderboard-podium')
  const listEl = document.getElementById('leaderboard-list')
  const yourRankEl = document.getElementById('leaderboard-your-rank')
  const updatedEl = document.getElementById('leaderboard-updated')

  if (loadingEl) loadingEl.hidden = true
  if (notSignedInEl) notSignedInEl.hidden = true
  if (errorEl) errorEl.hidden = true

  const titleEl = document.getElementById('leaderboard-title')
  const eyebrowEl = document.getElementById('leaderboard-eyebrow')
  const noDataCopyEl = document.getElementById('leaderboard-no-data-copy')
  if (titleEl) titleEl.textContent = '🏆 Lifetime Leaderboard'
  if (eyebrowEl) eyebrowEl.textContent = 'All-time MCQ points'
  if (noDataCopyEl) noDataCopyEl.textContent = `No lifetime scores yet — complete an MCQ to claim #1!`

  const rows = getRankedLeaderboardRows()
  if (rows.length === 0) {
    if (noDataEl) noDataEl.hidden = false
    if (contentEl) contentEl.hidden = true
    return
  }

  if (noDataEl) noDataEl.hidden = true
  if (contentEl) contentEl.hidden = false

  const top3 = rows.slice(0, 3)
  const rest = rows.slice(3)

  if (podiumEl) {
    podiumEl.innerHTML = ''
    const medalConfig = [
      { rank: 2, key: 'silver', medal: '🥈' },
      { rank: 1, key: 'gold', medal: '🥇' },
      { rank: 3, key: 'bronze', medal: '🥉' }
    ]

    medalConfig.forEach(({ rank, key, medal }) => {
      const entry = top3[rank - 1]
      if (!entry) return

      const displayName = entry.display_name || 'Student'

      const avatarId = getLeaderboardAvatarId(entry, rank - 1)
      const avatarHtml = getProfileAvatarMarkup(avatarId, 'leaderboard__podium-avatar', displayName)

      const card = document.createElement('div')
      card.className = `leaderboard__podium-card leaderboard__podium-card--${key}`
      card.innerHTML = `
        <span class="leaderboard__podium-medal">${medal}</span>
        ${avatarHtml}
        <span class="leaderboard__podium-name">${escapeHtml(displayName)}</span>
        ${renderLeaderboardPresence(entry)}
        <span class="leaderboard__podium-score">${entry.total_score} pts</span>
      `
      podiumEl.appendChild(card)
    })
  }

  if (listEl) {
    listEl.innerHTML = ''
    rest.forEach((entry, idx) => {
      const rank = idx + 4
      const displayName = entry.display_name || 'Student'

      const avatarId = getLeaderboardAvatarId(entry, idx + 3)
      const avatarHtml = getProfileAvatarMarkup(avatarId, 'leaderboard__row-avatar', displayName)

      const row = document.createElement('div')
      row.className = 'leaderboard__row'
      row.innerHTML = `
        <span class="leaderboard__row-rank">${rank}</span>
        ${avatarHtml}
        <span class="leaderboard__row-name">${escapeHtml(displayName)}${renderLeaderboardPresence(entry)}</span>
        <span class="leaderboard__row-score">${entry.total_score} pts</span>
      `
      listEl.appendChild(row)
    })
  }

  if (yourRankEl) {
    const myIndex = rows.findIndex((r) => studentProgressState.user && r.user_id === studentProgressState.user.id)
    if (myIndex !== -1) {
      yourRankEl.hidden = false
      const myEntry = rows[myIndex]
      const rank = myIndex + 1
      const displayName = myEntry.display_name || 'Student'

      const avatarId = getProfileAvatarById(myEntry.avatar_id) ? myEntry.avatar_id : getStudentAvatarId()

      const avatarContainer = document.getElementById('leaderboard-your-rank-avatar')
      const initialsContainer = document.getElementById('leaderboard-your-rank-initials')

      document.getElementById('leaderboard-your-rank-pos').textContent = `#${rank}`
      if (avatarContainer) avatarContainer.hidden = true
      if (initialsContainer) {
        initialsContainer.className = `leaderboard__your-rank-initials student-avatar ${getProfileAvatarClass(avatarId)}`
        initialsContainer.textContent = ''
        initialsContainer.setAttribute('role', 'img')
        initialsContainer.setAttribute('aria-label', `${displayName} avatar`)
        initialsContainer.hidden = false
      }

      document.getElementById('leaderboard-your-rank-name').textContent = displayName
      const yourRankBreakdown = document.getElementById('leaderboard-your-rank-breakdown')
      if (yourRankBreakdown) {
        yourRankBreakdown.innerHTML =
          `${myEntry.mcqs_count} MCQ topics &middot; ${myEntry.quizzes_completed} quizzes &middot; ${myEntry.correct_answers} correct ${renderLeaderboardPresence(myEntry)}`
      }
      document.getElementById('leaderboard-your-rank-score').textContent = `${myEntry.total_score} pts`
    } else {
      yourRankEl.hidden = true
    }
  }

  if (updatedEl) {
    const timeStr = new Date(leaderboardState.lastFetched).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    updatedEl.textContent = `Lifetime scores update automatically · Last updated at ${timeStr}`
  }
  renderProfileSection()
}

function setStudentSyncMenu(open) {
  if (!studentSync || !studentSyncMenu || !studentSyncButton) return
  studentSync.classList.toggle('is-open', open)
  studentSyncMenu.hidden = !open
  studentSyncButton.setAttribute('aria-expanded', String(open))
}

async function syncLocalProgressToCloud(section = activeAcademicSection) {
  if (!studentProgressState.user || isResourceFirstSection(section)) return

  const sectionSubjects = getAcademicSection(section).subjects || []
  for (const subject of sectionSubjects) {
    const topicGroups = [subject.topics || [], subject.clinicalTopics || []]
    for (const topic of topicGroups.flat()) {
      const key = getTopicProgressRecordKey(activeUniversityId, section, subject.code, topic.label)
      if (studentProgressState.topicRows.has(key)) continue
      const localState = getLocalTopicCompletionState(subject.code, topic.label, section)
      if (!localState.studied && !localState.mcqs) continue

      studentProgressState.topicRows.set(key, localState)
      await upsertUserTopicProgress({
        user_id: studentProgressState.user.id,
        university_id: activeUniversityId,
        section,
        subject_code: subject.code,
        topic_label: topic.label,
        studied: localState.studied,
        mcqs: localState.mcqs
      })
    }
  }

  const userId = getProgressStorageOwnerId()
  const quizPrefix = `${QUIZ_STORAGE_PREFIX}::${userId}::${activeUniversityId}::${section}::`
  for (let index = 0; index < localStorage.length; index += 1) {
    const storageKey = localStorage.key(index)
    if (!storageKey?.startsWith(quizPrefix)) continue
    const [, , , , encodedTopicLabel, encodedSourceId] = storageKey.split('::')
    const topicLabel = decodeURIComponent(encodedTopicLabel || '')
    const sourceId = decodeURIComponent(encodedSourceId || 'current')
    if (!topicLabel) continue
    const key = getQuizProgressRecordKey(activeUniversityId, section, topicLabel, sourceId)
    if (studentProgressState.quizRows.has(key)) continue

    const payload = getLocalQuizState(topicLabel, sourceId, section)
    if (!payload) continue
    const stats = getQuizProgressStatsFromPayload(payload)
    studentProgressState.quizRows.set(key, payload)
    await upsertUserQuizProgress({
      user_id: studentProgressState.user.id,
      university_id: activeUniversityId,
      section,
      topic_label: topicLabel,
      source_id: sourceId,
      source_label: payload.sourceLabel || '',
      progress: payload,
      completed: !!payload.completed,
      score: stats.score,
      total_questions: stats.totalQuestions,
      answered_count: stats.answeredCount,
      wrong_question_ids: stats.wrongQuestionIds,
      attempt_id: payload.attemptId || null,
      attempt_started_at: payload.attemptStartedAt || null,
      completed_at: payload.completed ? new Date().toISOString() : null
    })
  }
}

async function loadStudentProgress(section = activeAcademicSection) {
  if (isResourceFirstSection(section)) {
    studentProgressState.ready = true
    studentProgressState.loading = false
    refreshTrackerFilters()
    updateGlobalProgress()
    renderStudentSyncUi()
    return
  }
  if (isLocalTestMode) {
    studentProgressState.ready = true
    studentProgressState.loading = false
    refreshTrackerFilters()
    updateGlobalProgress()
    renderStudentSyncUi()
    return
  }
  if (!studentProgressState.user || !isSupabaseConfigured()) {
    studentProgressState.ready = false
    renderStudentSyncUi()
    return
  }

  studentProgressState.loading = true
  studentProgressState.lastError = ''
  renderStudentSyncUi()

  try {
    const [topicRows, quizRows, pref] = await Promise.all([
      fetchUserTopicProgressRows(activeUniversityId, section),
      fetchUserQuizProgressRows(activeUniversityId, section),
      fetchUserPreference()
    ])

    if (pref) {
      leaderboardState.preferences = { ...getDefaultUserPreferences(), ...pref }
    }

    ;[...studentProgressState.topicRows.keys()]
      .filter((key) => key.startsWith(`${activeUniversityId}::${section}::`))
      .forEach((key) => studentProgressState.topicRows.delete(key))
    ;[...studentProgressState.quizRows.keys()]
      .filter((key) => key.startsWith(`${activeUniversityId}::${section}::`))
      .forEach((key) => studentProgressState.quizRows.delete(key))

    topicRows.forEach((row) => {
      studentProgressState.topicRows.set(
        getTopicProgressRecordKey(row.university_id || 'must', row.section, row.subject_code, row.topic_label),
        row
      )
    })

    quizRows.forEach((row) => {
      studentProgressState.quizRows.set(
        getQuizProgressRecordKey(row.university_id || 'must', row.section, row.topic_label, row.source_id),
        row.progress || row
      )
    })

    await syncLocalProgressToCloud(section)
    studentProgressState.ready = true
    refreshTrackerFilters()
    updateGlobalProgress()
    await refreshLeaderboardIfActive(true)
    await fetchAndRenderLiveActivity(true)
    await sendStudentPresence(true)
  } catch (error) {
    studentProgressState.lastError = error.message
    console.warn('Student progress sync failed.', error)
  } finally {
    studentProgressState.loading = false
    renderStudentSyncUi()
    if (isStandaloneProfilePage && initialParams.get('edit') === 'nickname' && !profileNicknameEditOpened && studentProgressState.user) {
      profileNicknameEditOpened = true
      openProfileNicknameEditor()
    }
  }
}

function getInitialSiteMode() {
  const hash = window.location.hash.replace('#', '')
  if (isUniversitySection(activeUniversityId, initialParams.get('section'))) return initialParams.get('section')
  if (initialParams.get('section') === 'tools' || hash === 'history') return 'tools'
  if (initialParams.get('section') === 'work' || hash === 'work') return 'work'
  return 'selector'
}

function setSectionStorageKeys(sectionId) {
  TOPIC_UPDATE_STORAGE_KEY = `${TOPIC_UPDATE_STORAGE_KEY_PREFIX}::${activeUniversityId}::${sectionId}`
  NEWS_SEEN_STORAGE_KEY = `${NEWS_SEEN_STORAGE_KEY_PREFIX}::${activeUniversityId}::${sectionId}`
}

function updateUniversityBranding() {
  const university = getUniversity()
  document.body.dataset.university = university.id
  document.querySelectorAll('[data-university-logo]').forEach((image) => {
    image.src = university.logoUrl
    image.alt = image.closest('[aria-hidden="true"]') ? '' : university.name
  })
  document.querySelectorAll('[data-university-wordmark]').forEach((element) => {
    element.textContent = university.hubName
    element.parentElement?.setAttribute('aria-label', university.hubName)
  })
  document.querySelectorAll('[data-university-short-name]').forEach((element) => {
    element.textContent = university.shortName
  })
  document.querySelectorAll('[data-university-footer-brand]').forEach((element) => {
    element.textContent = `${university.shortName} Hub`
  })
  document.querySelectorAll('[data-university-feedback]').forEach((link) => {
    const message = `Hi Ahmed, I have feedback about ${university.shortName} Hub.`
    link.href = `https://wa.me/201030469634?text=${encodeURIComponent(message)}`
  })
}

function updateSectionCapabilitiesUi() {
  const caps = activeAcademicSectionData?.capabilities || {}
  const isResourceFirst = !!caps.resourceFirst

  document.querySelectorAll('[data-section-nav="news"]').forEach((el) => {
    el.hidden = isResourceFirst
  })
  document.querySelectorAll('[data-section-nav="schedule"]').forEach((el) => {
    el.hidden = isResourceFirst || (!caps.hasSchedule && !activeAcademicSectionData?.midtermExamSchedule?.length)
  })
  document.querySelectorAll('[data-section-nav="leaderboard"]').forEach((el) => {
    el.hidden = isResourceFirst
  })

  const newsSection = document.getElementById('news')
  if (newsSection) newsSection.hidden = isResourceFirst

  const scheduleSection = document.getElementById('schedule')
  if (scheduleSection) {
    scheduleSection.hidden = isResourceFirst || (!caps.hasSchedule && !activeAcademicSectionData?.midtermExamSchedule?.length)
  }

  const leaderboardSection = document.getElementById('leaderboard')
  if (leaderboardSection) leaderboardSection.hidden = isResourceFirst

  const todayCockpit = document.getElementById('today-cockpit')
  if (todayCockpit) todayCockpit.hidden = isResourceFirst

  const globalProgress = document.getElementById('global-progress')
  if (globalProgress) globalProgress.hidden = isResourceFirst || caps.hasMcqs === false

  const semesterTimeline = document.getElementById('semester-timeline')
  if (semesterTimeline) semesterTimeline.hidden = isResourceFirst || !caps.hasTimeline
}

function updateAcademicSectionUi() {
  activeAcademicSectionData = getAcademicSection()
  subjects = activeAcademicSectionData.subjects
  setSectionStorageKeys(activeAcademicSection)
  updateUniversityBranding()

  if (trackerTitle) trackerTitle.textContent = activeAcademicSectionData.title
  if (newsTitle) newsTitle.textContent = activeAcademicSectionData.newsTitle
  renderClassRepresentatives()
  if (scheduleTitle) scheduleTitle.textContent = `${activeAcademicSectionData.title} schedule`
  if (scheduleLocation) {
    scheduleLocation.textContent = activeAcademicSectionData.scheduleLocation || ''
    scheduleLocation.hidden = !activeAcademicSectionData.scheduleLocation
  }
  if (trackerSearch) setTrackerSearchMode(trackerSearchMode)
  if (examScheduleCards) {
    examScheduleCards.setAttribute('aria-label', `${activeAcademicSectionData.title} subject exam dates`)
  }

  updateSectionCapabilitiesUi()
  renderAssignmentProgress()
  updateMiniDashboard()
  updateGlobalProgress()
}

function getActiveSectionQuizStats() {
  const sectionQuizzes = getMcqQuizzesForSection()
  let activeQuizzesCount = 0
  let totalMcqsCount = 0

  for (const topicLabel in sectionQuizzes) {
    const raw = sectionQuizzes[topicLabel]
    if (!raw) continue

    let mcqCount = 0
    if (raw.sources?.length) {
      mcqCount = raw.sources.reduce((total, source) => total + (source.mcqs?.length || 0), 0)
    } else if (Array.isArray(raw)) {
      mcqCount = raw.length
    }

    if (mcqCount > 0) {
      activeQuizzesCount++
      totalMcqsCount += mcqCount
    }
  }

  return {
    quizzesCount: activeQuizzesCount,
    mcqsCount: totalMcqsCount
  }
}

function updateMiniDashboard() {
  const dashNextExamVal = document.querySelector('#dash-next-exam .dash-card__value')
  const dashNextExamSub = document.querySelector('#dash-next-exam .dash-card__sub')
  const dashLatestUpdateVal = document.querySelector('#dash-latest-update .dash-card__value')
  const dashLatestUpdateSub = document.querySelector('#dash-latest-update .dash-card__sub')
  const dashCoveredTopicsVal = document.querySelector('#dash-covered-topics .dash-card__value')
  const dashCoveredTopicsSub = document.querySelector('#dash-covered-topics .dash-card__sub')
  const dashMcqsVal = document.querySelector('#dash-mcqs-available .dash-card__value')
  const dashMcqsSub = document.querySelector('#dash-mcqs-available .dash-card__sub')

  if (!dashNextExamVal) return

  // 1. Next Exam
  const activeExamSchedule = activeAcademicSectionData.midtermExamSchedule || []
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const scheduleWithState = activeExamSchedule.map((exam) => {
    const examDate = getLocalDate(exam.date)
    const daysUntil = Math.ceil((examDate - todayStart) / 86400000)
    return { ...exam, examDate, daysUntil }
  })
  const nextExam = scheduleWithState.find((exam) => exam.daysUntil >= 0)

  if (nextExam) {
    dashNextExamVal.textContent = nextExam.code
    dashNextExamSub.textContent = `${getExamCountdownText(nextExam.daysUntil)} (${formatExamDate(nextExam.date)})`
  } else {
    dashNextExamVal.textContent = 'None'
    dashNextExamSub.textContent = 'Midterms complete'
  }

  // 2. Latest Update
  const activeSectionNews = Array.from(document.querySelectorAll('.update-panel')).filter(card => {
    const cardSection = card.dataset.section || '401'
    return cardSection === activeAcademicSection
  })

  if (activeSectionNews.length) {
    activeSectionNews.sort((a, b) => b.dataset.date.localeCompare(a.dataset.date))
    const latestCard = activeSectionNews[0]
    const titleText = latestCard.querySelector('h2')?.textContent || 'New Update'
    dashLatestUpdateVal.textContent = titleText.length > 18 ? titleText.substring(0, 16) + '...' : titleText
    const datePill = latestCard.querySelector('.status-pill')?.textContent || latestCard.dataset.date
    dashLatestUpdateSub.textContent = datePill
  } else {
    dashLatestUpdateVal.textContent = 'None'
    dashLatestUpdateSub.textContent = 'No recent updates'
  }

  // 3. Covered Topics
  let totalTopics = 0
  let coveredTopics = 0
  subjects.forEach(subject => {
    subject.topics.forEach(topic => {
      totalTopics++
      if (topic.state === 'taken') {
        coveredTopics++
      }
    })
  })
  dashCoveredTopicsVal.textContent = `${coveredTopics} / ${totalTopics}`
  dashCoveredTopicsSub.textContent = 'taken in university'

  // 4. MCQs Available
  const caps = activeAcademicSectionData?.capabilities || {}
  if (!caps.hasMcqs || caps.resourceFirst) {
    dashMcqsVal.textContent = 'N/A'
    dashMcqsSub.textContent = 'Resource-first class'
  } else {
    const stats = getActiveSectionQuizStats()
    dashMcqsVal.textContent = `${stats.quizzesCount} Quizzes`
    dashMcqsSub.textContent = `${stats.mcqsCount} questions`
  }
}

function renderRepresentativeAvatar(rep) {
  if (rep.image) {
    return `<img src="${escapeHtml(rep.image)}" alt="" width="420" height="420" loading="lazy" decoding="async" />`
  }

  return `
    <svg viewBox="0 0 48 48" role="img">
      <path d="M24 24.6c5.15 0 9.33-4.18 9.33-9.33S29.15 5.94 24 5.94s-9.33 4.18-9.33 9.33S18.85 24.6 24 24.6Zm0 4.32c-7.88 0-14.64 4.82-17.5 11.68-.42 1 .31 2.1 1.39 2.1h32.22c1.08 0 1.81-1.1 1.39-2.1C38.64 33.74 31.88 28.92 24 28.92Z" />
    </svg>
  `
}

function renderClassRepresentatives() {
  if (!classRepsGrid) return

  const reps = activeAcademicSectionData?.representatives || []
  classRepsGrid.innerHTML = reps.map((rep) => {
    const avatar = renderRepresentativeAvatar(rep)
    if (rep.phone) {
      return `
        <a
          class="class-rep class-rep--link"
          href="https://wa.me/${escapeHtml(rep.phone)}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact ${escapeHtml(rep.name)} on WhatsApp"
        >
          <span class="class-rep__avatar" aria-hidden="true">
            ${avatar}
          </span>
          <strong>${escapeHtml(rep.name)}</strong>
          <small>${escapeHtml(rep.role)}</small>
        </a>
      `
    }

    return `
      <article class="class-rep" aria-label="${escapeHtml(rep.name)}, ${escapeHtml(rep.role)}">
        <span class="class-rep__avatar" aria-hidden="true">
          ${avatar}
        </span>
        <strong>${escapeHtml(rep.name)}</strong>
        <small>${escapeHtml(rep.role)}</small>
      </article>
    `
  }).join('')
}

function resetActiveSubjectForSection(preferredCode = '') {
  const preferredSubject = preferredCode ? subjects.find((subject) => subject.code === preferredCode) : null
  activeSubjectCode = preferredSubject?.code || null
  expandedSubjectCode = mobileQuery.matches && activeSubjectCode ? activeSubjectCode : null
  activeSubjectTrack = 'theoretical'
}

function syncModeToBody() {
  document.body.dataset.siteMode = activeSiteMode
  document.body.dataset.university = activeUniversityId
  document.body.dataset.academicSection = activeAcademicSection
}

function updateSiteHistory(url, historyMode = 'push') {
  if (historyMode === 'none') return
  const method = historyMode === 'replace' ? 'replaceState' : 'pushState'
  window.history[method]({ siteMode: activeSiteMode }, '', url)
}

function showAcademicSection(sectionId, options = {}) {
  const nextAcademicSection = isUniversitySection(activeUniversityId, sectionId)
    ? sectionId
    : getDefaultSectionForUniversity(activeUniversityId)
  if (nextAcademicSection !== activeAcademicSection) {
    invalidateLeaderboard(activeUniversityId, nextAcademicSection)
  }
  activeAcademicSection = nextAcademicSection
  activeSiteMode = activeAcademicSection
  updateAcademicSectionUi()
  const currentParams = new URLSearchParams(window.location.search)
  resetActiveSubjectForSection(options.subjectCode || currentParams.get('subject') || '')
  syncModeToBody()
  refreshTrackerFilters()
  renderSemesterTimeline()
  render401ExamSchedule()
  renderSchedulePage()
  renderNewsFilters()
  refreshRemoteNewsCards(activeAcademicSection)
  refreshRemoteTrackerData()
  loadStudentProgress(activeAcademicSection)

  const caps = activeAcademicSectionData?.capabilities || {}
  let targetHash = options.hash || window.location.hash || '#tracker'
  if (caps.resourceFirst) {
    if (['#schedule', '#news', '#leaderboard', '#mcqs'].includes(targetHash)) {
      targetHash = '#tracker'
    }
  } else {
    if (targetHash === '#schedule' && !caps.hasSchedule && !activeAcademicSectionData?.midtermExamSchedule?.length) {
      targetHash = '#tracker'
    }
    if (targetHash === '#mcqs' && !caps.hasMcqs) {
      targetHash = '#tracker'
    }
  }

  const url = new URL(window.location.href)
  url.searchParams.set('university', activeUniversityId)
  url.searchParams.set('section', activeAcademicSection)
  if (!url.hash || ['#schedule', '#news', '#leaderboard', '#mcqs'].includes(url.hash)) {
    url.hash = targetHash
  }
  updateSiteHistory(url, options.historyMode || 'push')
  const targetSection = document.getElementById(targetHash.replace('#', '')) || document.getElementById('tracker')
  if (targetSection && options.scroll !== false) {
    targetSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })
  }
}

function showToolsSection(options = {}) {
  activeSiteMode = 'tools'
  syncModeToBody()
  const url = new URL(window.location.href)
  url.searchParams.set('section', 'tools')
  url.hash = 'history'
  updateSiteHistory(url, options.historyMode || 'push')
  const historyRoot = document.getElementById('history')
  if (historyRoot && options.scroll !== false) {
    historyRoot.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })
  }
}

function showWorkSection(options = {}) {
  activeSiteMode = 'work'
  syncModeToBody()
  const url = new URL(window.location.href)
  url.searchParams.set('section', 'work')
  url.hash = 'work'
  updateSiteHistory(url, options.historyMode || 'push')
  const workRoot = document.getElementById('work')
  if (workRoot && options.scroll !== false) {
    workRoot.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })
  }
}

function showSelector(options = {}) {
  if (studentProgressState.user && document.body.dataset.authState === 'ready') {
    openSectionSwitcher()
    return
  }
  activeSiteMode = 'selector'
  updateUniversityBranding()
  syncModeToBody()

  const url = new URL(window.location.href)
  url.searchParams.set('university', activeUniversityId)
  url.searchParams.delete('section')
  url.searchParams.delete('subject')
  url.searchParams.delete('tracker')
  url.hash = ''
  updateSiteHistory(`${url.pathname}${url.search}`, options.historyMode || 'push')
  if (options.scroll !== false) {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }))
  }
}

function selectSiteSection(sectionId, options = {}) {
  if (sectionId === 'selector') {
    showSelector(options)
  } else if (sectionId === 'tools') {
    showToolsSection(options)
  } else if (sectionId === 'work') {
    showWorkSection(options)
  } else {
    showAcademicSection(sectionId, options)
  }
}

function handleLegacyHashRoute() {
  if (document.body.dataset.authState !== 'ready') return
  const hash = window.location.hash.replace('#', '')
  if (hash === 'history' && activeSiteMode !== 'tools') {
    showToolsSection({ scroll: false, historyMode: 'replace' })
  } else if (hash === 'work' && activeSiteMode !== 'work') {
    showWorkSection({ scroll: false, historyMode: 'replace' })
  }
}

function restoreSiteModeFromLocation() {
  if (document.body.dataset.authState !== 'ready') return
  const params = new URLSearchParams(window.location.search)
  const hash = window.location.hash.replace('#', '')
  const section = params.get('section')
  if (isUniversitySection(activeUniversityId, section)) {
    showAcademicSection(section, {
      subjectCode: params.get('subject') || '',
      hash: hash ? `#${hash}` : '#tracker',
      scroll: false,
      historyMode: 'none'
    })
  } else if (section === 'tools' || hash === 'history') {
    showToolsSection({ scroll: false, historyMode: 'none' })
  } else if (section === 'work' || hash === 'work') {
    showWorkSection({ scroll: false, historyMode: 'none' })
  } else {
    showSelector({ scroll: false, historyMode: 'none' })
  }
}

function getTopicUnits(topic) {
  return topic.coverageUnits || 1
}

function getScopedProgressTopics(subject) {
  const { scope } = getTrackerFilters()
  return scope === 'midterm'
    ? subject.topics.filter((topic) => isTopicMidtermScopeConfirmed(topic))
    : subject.topics
}

function isTopicMidtermScopeConfirmed(topic) {
  return !!topic.midtermScope
}

function getTopicUnitTotal(topics) {
  return topics.reduce((count, topic) => count + getTopicUnits(topic), 0)
}

function getCoveredCount(subject, topics = subject.topics) {
  return topics.reduce((count, topic) => {
    return coveredStates.has(topic.state) ? count + getTopicUnits(topic) : count
  }, 0)
}

function getProgressTotal(subject) {
  const { scope } = getTrackerFilters()
  if (scope === 'midterm') {
    return getTopicUnitTotal(getScopedProgressTopics(subject))
  }
  return getTopicUnitTotal(getScopedProgressTopics(subject)) || subject.totalCount || 0
}

function getPercent(subject) {
  const progressTopics = getScopedProgressTopics(subject)
  const total = getTopicUnitTotal(progressTopics)
  if (!total) return 0
  return Math.round((getCoveredCount(subject, progressTopics) / total) * 100)
}

function getStateCounts(subject) {
  return subject.topics.reduce((counts, topic) => {
    counts[topic.state] = (counts[topic.state] || 0) + getTopicUnits(topic)
    return counts
  }, {})
}

function getSubjectSummary(subject) {
  const counts = getStateCounts(subject)
  const midtermCount = subject.topics.filter((topic) => isTopicMidtermScopeConfirmed(topic)).length
  const parts = [
    counts.taken ? `${counts.taken} taken` : '',
    counts.partial ? `${counts.partial} partial` : '',
    counts.announced ? `${counts.announced} announced` : '',
    (counts.remaining || 0) ? `${counts.remaining || 0} remaining` : '',
    midtermCount ? `${midtermCount} midterm scope` : ''
  ].filter(Boolean)

  return parts.join(' Â· ')
}

function getTopicUpdateId(subject, topic) {
  if (!topic.updatedAt) return ''
  return `${activeUniversityId}::${activeAcademicSection}::${subject.code}::${topic.label}::${topic.updateBatch || topic.updatedAt}`
}

function getSeenTopicUpdates() {
  try {
    return new Set(JSON.parse(localStorage.getItem(TOPIC_UPDATE_STORAGE_KEY) || '[]'))
  } catch {
    localStorage.removeItem(TOPIC_UPDATE_STORAGE_KEY)
    return new Set()
  }
}

function saveSeenTopicUpdates(seenUpdates) {
  try {
    localStorage.setItem(TOPIC_UPDATE_STORAGE_KEY, JSON.stringify([...seenUpdates]))
  } catch {
    // Keep the tracker usable when browser storage is blocked.
  }
}

function getTopicCompletionKey(subjectCode, topicLabel, section = activeAcademicSection) {
  return `${TOPIC_COMPLETION_STORAGE_PREFIX}::${getProgressStorageOwnerId()}::${activeUniversityId}::${section}::${encodeURIComponent(subjectCode)}::${encodeURIComponent(topicLabel)}`
}

function hasCompletedQuizProgress(topic) {
  const topicLabels = new Set([topic.label, topic.mcqTopicKey].filter(Boolean))
  for (const [key, payload] of studentProgressState.quizRows) {
    if (!key.startsWith(`${activeUniversityId}::${activeAcademicSection}::`) || !payload?.completed) continue
    if ([...topicLabels].some((label) => key.includes(`::${label}::`))) return true
  }

  for (const label of topicLabels) {
    const sectionPrefix = `${QUIZ_STORAGE_PREFIX}::${getProgressStorageOwnerId()}::${activeUniversityId}::${activeAcademicSection}::${encodeURIComponent(label)}::`
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (!key?.startsWith(sectionPrefix)) continue
      try {
        if (JSON.parse(localStorage.getItem(key) || 'null')?.completed) return true
      } catch {
        // Ignore malformed historical quiz progress.
      }
    }
  }
  return false
}

function updateGlobalProgress() {
  const mcqsPercent = document.getElementById('global-mcqs-percent')
  const mcqsFill = document.getElementById('global-mcqs-fill')
  if (!mcqsPercent || !mcqsFill) return

  const { completed, total, percent } = getActiveTopicProgressStats()

  mcqsPercent.textContent = `${percent}%`
  mcqsFill.style.width = `${percent}%`
  renderProfileSection()
  renderTodayCockpit()
  return { completed, total, percent }
}

function getActiveTopicProgressStats() {
  const total = subjects.reduce((sum, s) => sum + (s.topics?.length || 0) + (s.clinicalTopics?.length || 0), 0)
  const completed = subjects.reduce((sum, s) => (
    sum
    + (s.topics?.filter(t => getTopicCompletionState(s.code, t.label).mcqs || hasCompletedQuizProgress(t)).length || 0)
    + (s.clinicalTopics?.filter(t => getTopicCompletionState(s.code, t.label).mcqs || hasCompletedQuizProgress(t)).length || 0)
  ), 0)

  return {
    completed,
    total,
    percent: calculatePercent(completed, total)
  }
}

function getTodayUpcomingExam() {
  const todayStart = startOfDay(new Date())
  return (activeAcademicSectionData.midtermExamSchedule || [])
    .map((exam) => ({
      ...exam,
      daysUntil: Math.ceil((getLocalDate(exam.date) - todayStart) / 86400000)
    }))
    .find((exam) => exam.daysUntil >= 0) || null
}

function getTodayContinueCandidate() {
  const candidates = new Map()
  const addCandidate = (rawPayload) => {
    const payload = normalizeSavedQuizState(rawPayload)
    const topicLabel = payload?.topicLabel
    const sourceId = payload?.sourceId || 'current'
    const stats = getQuizProgressStatsFromPayload(payload)
    if (!topicLabel || payload.completed || stats.answeredCount <= 0 || stats.totalQuestions <= 0) return
    if (!getQuizConfig(topicLabel, sourceId)) return

    const savedAt = Number.isFinite(Date.parse(payload.savedAt || ''))
      ? Date.parse(payload.savedAt)
      : 0
    const key = `${topicLabel}::${sourceId}`
    const existing = candidates.get(key)
    if (existing && existing.savedAt > savedAt) return
    candidates.set(key, {
      topicLabel,
      sourceId,
      sourceLabel: payload.sourceLabel || 'Saved MCQ Session',
      answeredCount: stats.answeredCount,
      totalQuestions: stats.totalQuestions,
      percent: calculatePercent(stats.answeredCount, stats.totalQuestions),
      savedAt
    })
  }

  studentProgressState.quizRows.forEach((payload, key) => {
    if (key.startsWith(`${activeUniversityId}::${activeAcademicSection}::`)) addCandidate(payload)
  })

  const localPrefix = `${QUIZ_STORAGE_PREFIX}::${getProgressStorageOwnerId()}::${activeUniversityId}::${activeAcademicSection}::`
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (!key?.startsWith(localPrefix)) continue
      try {
        addCandidate(JSON.parse(localStorage.getItem(key) || 'null'))
      } catch {
        // Ignore malformed historical progress; the quiz screen already handles it safely.
      }
    }
  } catch {
    // Keep the daily action usable when browser storage is blocked.
  }

  return [...candidates.values()]
    .sort((first, second) => second.savedAt - first.savedAt || second.percent - first.percent)[0] || null
}

function getTodayBoardUpdate() {
  if (!newsFeed) return null
  const seenCards = getNewsSeenCards()
  const candidates = [...newsFeed.querySelectorAll('.update-panel')]
    .filter((card) => (
      (card.dataset.section || '401') === activeAcademicSection
      && !card.hidden
      && card.style.display !== 'none'
      && !isNewsCardExpired(card)
    ))
    .map((card) => ({
      card,
      title: card.querySelector('h2')?.textContent?.trim() || 'Class Board Update',
      label: card.querySelector('.card__kicker')?.textContent?.trim() || 'Class Board',
      unread: !seenCards.has(getNewsCardId(card)),
      priority: Number(card.dataset.priority || 0),
      date: card.dataset.date || ''
    }))
    .sort((first, second) => (
      Number(second.unread) - Number(first.unread)
      || second.priority - first.priority
      || second.date.localeCompare(first.date)
    ))

  return candidates[0] || null
}

function renderTodayFreshnessStatus() {
  if (!todayCockpitFreshness || !todayCockpit) return
  const checkedAt = new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date())

  let state = 'online'
  let message = `Online · checked ${checkedAt}`
  if (!navigator.onLine) {
    state = 'offline'
    message = `Offline · showing saved page data · checked ${checkedAt}`
  } else if (studentProgressState.lastError) {
    state = 'saved'
    message = `Progress saved on this device · checked ${checkedAt}`
  } else if (studentProgressState.loading) {
    state = 'syncing'
    message = 'Syncing your saved progress…'
  } else if (newsCardsState.errorSections.has(getUniversitySectionKey())) {
    state = 'saved'
    message = `Class Board unavailable · showing built-in updates · checked ${checkedAt}`
  } else if (newsCardsState.loadingSections.has(getUniversitySectionKey())) {
    state = 'syncing'
    message = 'Checking the Class Board…'
  } else if (newsCardsState.remoteSections.has(getUniversitySectionKey())) {
    state = 'live'
    message = `Class Board synced · checked ${checkedAt}`
  } else {
    message = `Online · built-in schedule & resources · checked ${checkedAt}`
  }

  todayCockpit.dataset.freshness = state
  todayCockpitFreshness.textContent = message
}

function renderTodayCockpit() {
  if (!todayCockpit || !todayPrimaryAction) return

  if (todayCockpitDate) {
    todayCockpitDate.dateTime = new Date().toISOString().slice(0, 10)
    todayCockpitDate.textContent = new Intl.DateTimeFormat('en', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    }).format(new Date())
  }

  const nextExam = getTodayUpcomingExam()
  const progress = getActiveTopicProgressStats()
  const continueCandidate = getTodayContinueCandidate()
  const boardUpdate = getTodayBoardUpdate()
  const fallbackTopic = nextExam?.quizTopicKey || Object.keys(getMcqQuizzesForSection())[0] || ''

  todayPrimaryAction.dataset.todayAction = continueCandidate ? 'resume' : 'quiz'
  todayPrimaryAction.dataset.todayTopic = continueCandidate?.topicLabel || fallbackTopic
  todayPrimaryAction.dataset.todaySource = continueCandidate?.sourceId || ''
  todayPrimaryAction.disabled = !todayPrimaryAction.dataset.todayTopic
  todayPrimaryAction.setAttribute(
    'aria-label',
    continueCandidate
      ? `Resume ${continueCandidate.topicLabel}, ${continueCandidate.answeredCount} of ${continueCandidate.totalQuestions} questions answered`
      : fallbackTopic
        ? `Start practice for ${fallbackTopic}`
        : 'No MCQ practice is currently available'
  )

  if (continueCandidate) {
    todayPrimaryKicker.textContent = 'Continue Your Last Session'
    todayPrimaryTitle.textContent = continueCandidate.topicLabel
    todayPrimaryCopy.textContent = `${continueCandidate.sourceLabel} · ${continueCandidate.answeredCount} of ${continueCandidate.totalQuestions} answered`
    todayPrimaryCta.textContent = 'Resume Quiz'
    todayPrimaryProgressFill.style.width = `${continueCandidate.percent}%`
  } else if (nextExam?.quizTopicKey) {
    todayPrimaryKicker.textContent = `${getExamCountdownText(nextExam.daysUntil)} · ${nextExam.code}`
    todayPrimaryTitle.textContent = `Practice for ${nextExam.subjectName}`
    todayPrimaryCopy.textContent = `${formatExamDate(nextExam.date)} at ${nextExam.time}`
    todayPrimaryCta.textContent = 'Choose MCQs'
    todayPrimaryProgressFill.style.width = `${progress.percent}%`
  } else {
    todayPrimaryKicker.textContent = 'Recommended Next Step'
    todayPrimaryTitle.textContent = fallbackTopic || 'Your Section Is Up to Date'
    todayPrimaryCopy.textContent = fallbackTopic
      ? 'Start a focused MCQ session from your current section.'
      : 'No MCQ bank is currently available for this section.'
    todayPrimaryCta.textContent = fallbackTopic ? 'Start Practice' : 'Nothing Due'
    todayPrimaryProgressFill.style.width = `${progress.percent}%`
  }

  if (todayExamTitle && todayExamCopy) {
    todayExamTitle.textContent = nextExam ? nextExam.code : 'Midterms Complete'
    todayExamCopy.textContent = nextExam
      ? `${getExamCountdownText(nextExam.daysUntil)} · ${formatExamDate(nextExam.date)}, ${nextExam.time}`
      : 'No upcoming midterm is listed.'
  }

  if (todayCoverageTitle && todayCoverageCopy) {
    todayCoverageTitle.textContent = `${progress.percent}% Complete`
    todayCoverageCopy.textContent = `${progress.completed} of ${progress.total} tracked topics completed.`
  }

  if (todayUpdateTitle && todayUpdateCopy && todayUpdateKicker) {
    todayUpdateKicker.textContent = boardUpdate?.unread ? 'Unread Class Update' : boardUpdate?.label || 'Class Board'
    todayUpdateTitle.textContent = boardUpdate?.title || 'Review Class Updates'
    todayUpdateCopy.textContent = boardUpdate
      ? 'Open the board for the full announcement.'
      : 'Open the board for announcements and deadlines.'
  }

  renderTodayFreshnessStatus()
}

function getProfileMcqBankProgressStats() {
  const sectionQuizzes = getMcqQuizzesForSection()
  let answered = 0
  let total = 0

  Object.keys(sectionQuizzes).forEach((topicLabel) => {
    getQuizSources(topicLabel).forEach((source) => {
      if (source.collection) {
        getCollectionParts(source).forEach((part) => {
          const status = getSavedQuizStatus(topicLabel, part)
          const partTotal = part.mcqs?.length || status?.total || 0
          total += partTotal
          if (!status) return
          answered += status.completed ? partTotal : Math.min(status.answeredCount || 0, partTotal)
        })
        return
      }

      const status = getSavedQuizStatus(topicLabel, source)
      const sourceTotal = source.mcqs?.length || status?.total || 0
      total += sourceTotal
      if (!status) return
      answered += status.completed ? sourceTotal : Math.min(status.answeredCount || 0, sourceTotal)
    })
  })

  return {
    answered,
    total,
    percent: calculatePercent(answered, total)
  }
}

function getSeenTrophiesStorageKey() {
  return `${SEEN_TROPHIES_STORAGE_PREFIX}::${getProgressStorageOwnerId()}::${activeUniversityId}::${activeAcademicSection}`
}

function getSeenTrophyIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(getSeenTrophiesStorageKey()) || '[]'))
  } catch {
    localStorage.removeItem(getSeenTrophiesStorageKey())
    return new Set()
  }
}

function saveSeenTrophyIds(ids) {
  try {
    localStorage.setItem(getSeenTrophiesStorageKey(), JSON.stringify([...ids]))
  } catch {
    // Trophy state is decorative; progress remains the source of truth.
  }
}

function getStudentProfileStats() {
  const rows = [...studentProgressState.quizRows.entries()]
    .filter(([key]) => key.startsWith(`${activeUniversityId}::${activeAcademicSection}::`))
    .map(([, payload]) => normalizeSavedQuizState(payload))
    .filter(Boolean)

  const topicLabels = new Set()
  let totalScore = 0
  let answeredCount = 0
  let completedQuizzes = 0
  let bestPercent = 0
  let perfectParts = 0
  let wrongReviewCompleted = false

  rows.forEach((payload) => {
    const stats = getQuizProgressStatsFromPayload(payload)
    if (stats.answeredCount > 0 && payload.topicLabel) topicLabels.add(payload.topicLabel)
    answeredCount += stats.answeredCount
    totalScore += Number.isFinite(stats.score) ? stats.score : 0

    if (payload.completed) {
      completedQuizzes += 1
      if (payload.mode === 'wrong-review' || /wrong-review/i.test(payload.sourceId || '')) wrongReviewCompleted = true
      if (stats.totalQuestions >= 20 && Number.isFinite(stats.score)) {
        const scorePercent = Math.round((stats.score / Math.max(stats.totalQuestions, 1)) * 100)
        bestPercent = Math.max(bestPercent, scorePercent)
        if (scorePercent === 100) perfectParts += 1
      }
    }
  })

  const topicProgress = getActiveTopicProgressStats()
  const mcqBankProgress = getProfileMcqBankProgressStats()
  const leaderboardRows = getRankedLeaderboardRows()
  const rankIndex = leaderboardRows.findIndex((row) => studentProgressState.user && row.user_id === studentProgressState.user.id)
  const currentLeaderboardEntry = getCurrentLeaderboardEntry()
  const serverScore = Number(currentLeaderboardEntry?.lifetime_score)
  const serverAnsweredTopics = Number(currentLeaderboardEntry?.lifetime_mcqs_count)
  const serverCompletedQuizzes = Number(currentLeaderboardEntry?.lifetime_quizzes_completed)
  const serverCorrectAnswers = Number(currentLeaderboardEntry?.lifetime_correct_answers)
  const seasonScore = Number(currentLeaderboardEntry?.total_score)

  return {
    totalScore: Number.isFinite(serverScore) ? serverScore : totalScore,
    seasonScore: Number.isFinite(seasonScore) && currentLeaderboardEntry?.season_id ? seasonScore : null,
    seasonName: currentLeaderboardEntry?.season_name || '',
    answeredCount,
    correctAnswers: Number.isFinite(serverCorrectAnswers) ? serverCorrectAnswers : totalScore,
    completedQuizzes: Number.isFinite(serverCompletedQuizzes) ? serverCompletedQuizzes : completedQuizzes,
    mcqTopicsTouched: Number.isFinite(serverAnsweredTopics) ? serverAnsweredTopics : topicLabels.size,
    bestPercent,
    perfectParts,
    wrongReviewCompleted,
    topicProgress,
    mcqBankProgress,
    rank: rankIndex >= 0 ? rankIndex + 1 : null,
    leaderboardSynced: leaderboardState.lastFetched > 0
      && leaderboardState.university === activeUniversityId
      && leaderboardState.section === activeAcademicSection
  }
}

const PROFILE_LEVEL_THRESHOLDS = [0, 50, 100, 250, 500, 1000, 2000, 3500, 5000]
const PROFILE_TROPHY_CATEGORIES = ['Getting started', 'Mastery', 'Completion', 'Accuracy', 'Coverage', 'Review']

function getProfileMasteryLevel(totalScore) {
  return calculateMasteryLevel(totalScore, PROFILE_LEVEL_THRESHOLDS)
}

function getSeenLevelUpStorageKey(userId, section, universityId = activeUniversityId) {
  return `${LEVEL_UP_SEEN_STORAGE_PREFIX}::${userId}::${universityId}::${section}`
}

function getSeenLevelUpTransitions(userId, section) {
  try {
    const stored = JSON.parse(localStorage.getItem(getSeenLevelUpStorageKey(userId, section)) || '[]')
    return new Set(Array.isArray(stored) ? stored : [])
  } catch {
    localStorage.removeItem(getSeenLevelUpStorageKey(userId, section))
    return new Set()
  }
}

function claimLevelUpTransition(userId, section, transition) {
  const transitionKey = `${transition.previousLevel}-${transition.newLevel}-${transition.newPoints}`
  const storageKey = `${userId}::${activeUniversityId}::${section}::${transitionKey}`
  const storedTransitions = getSeenLevelUpTransitions(userId, section)

  storedTransitions.forEach((key) => quizLevelUpCelebration.seenTransitions.add(`${userId}::${activeUniversityId}::${section}::${key}`))
  if (!claimProfileLevelTransition(quizLevelUpCelebration.seenTransitions, storageKey)) return false

  try {
    storedTransitions.add(transitionKey)
    localStorage.setItem(
      getSeenLevelUpStorageKey(userId, section),
      JSON.stringify([...storedTransitions].slice(-32))
    )
  } catch {
    // The in-memory guard still prevents duplicate celebrations for this session.
  }
  return true
}

function dismissQuizLevelUpCelebration() {
  if (quizLevelUpCelebration.timeoutId) {
    clearTimeout(quizLevelUpCelebration.timeoutId)
    quizLevelUpCelebration.timeoutId = null
  }

  const celebration = document.getElementById('quiz-level-up')
  if (!celebration) return
  celebration.classList.remove('quiz-level-up--visible')
  celebration.hidden = true
}

function showQuizLevelUpCelebration(transition, context) {
  const modal = document.getElementById('quiz-modal')
  if (
    !modal
    || modal.getAttribute('aria-hidden') === 'true'
    || !studentProgressState.user
    || studentProgressState.user.id !== context.userId
    || activeAcademicSection !== context.section
    || quizSessionGeneration !== context.sessionGeneration
    || quizState.topicLabel !== context.topicLabel
    || quizState.sourceId !== context.sourceId
    || (context.attemptKey && (quizState.attemptId || quizState.attemptStartedAt) !== context.attemptKey)
  ) {
    return
  }
  if (!claimLevelUpTransition(context.userId, context.section, transition)) return

  const celebration = modal.querySelector('#quiz-level-up')
  if (!celebration) return

  dismissQuizLevelUpCelebration()
  celebration.hidden = false
  requestAnimationFrame(() => {
    if (celebration.hidden || quizSessionGeneration !== context.sessionGeneration) return
    const previousLevel = celebration.querySelector('[data-level-up-previous]')
    const newLevel = celebration.querySelector('[data-level-up-new]')
    const levels = celebration.querySelector('.quiz-level-up__levels')
    const detail = celebration.querySelector('[data-level-up-detail]')
    if (previousLevel) previousLevel.textContent = transition.previousLevel
    if (newLevel) newLevel.textContent = transition.newLevel
    if (levels) levels.setAttribute('aria-label', `Level ${transition.previousLevel} to Level ${transition.newLevel}`)
    if (detail) {
      detail.textContent = `${transition.newPoints} lifetime points · ${transition.remaining} to Level ${transition.nextLevel}`
    }

    void celebration.offsetWidth
    celebration.classList.add('quiz-level-up--visible')
    playQuizLevelUpSound()
    quizLevelUpCelebration.timeoutId = setTimeout(dismissQuizLevelUpCelebration, 2700)
  })
}

function createTrophy(id, title, description, icon, unlocked, current, target, category = 'Mastery') {
  const safeTarget = Math.max(target || 1, 1)
  const safeCurrent = Math.max(0, Number(current) || 0)
  return {
    id,
    title,
    description,
    icon,
    category,
    unlocked: !!unlocked,
    current: safeCurrent,
    target: safeTarget,
    progress: unlocked ? 100 : calculatePercent(safeCurrent, safeTarget),
    progressText: unlocked ? 'Completed' : `${Math.min(safeCurrent, safeTarget)} / ${safeTarget}`
  }
}

function getProfileTrophies(stats = getStudentProfileStats()) {
  const scoreMilestones = [50, 100, 250, 500, 1000]
  const completionMilestones = [5, 10, 25]
  const accuracyMilestones = [80, 90, 100]
  const progressMilestones = [25, 50, 75, 100]

  return [
    createTrophy('first-mcq', 'First MCQ', 'Answer your first MCQ.', '01', stats.answeredCount >= 1, stats.answeredCount, 1, 'Getting started'),
    createTrophy('first-complete', 'First Finish', 'Complete your first quiz part.', '02', stats.completedQuizzes >= 1, stats.completedQuizzes, 1, 'Getting started'),
    ...scoreMilestones.map((target) => createTrophy(
      `score-${target}`,
      `${target} Points`,
      `Reach ${target} mastery points.`,
      String(target),
      stats.correctAnswers >= target,
      stats.correctAnswers,
      target,
      'Mastery'
    )),
    ...completionMilestones.map((target) => createTrophy(
      `complete-${target}`,
      `${target} Parts`,
      `Complete ${target} quiz parts.`,
      String(target),
      stats.completedQuizzes >= target,
      stats.completedQuizzes,
      target,
      'Completion'
    )),
    ...accuracyMilestones.map((target) => createTrophy(
      `accuracy-${target}`,
      `${target}% Part`,
      `Score at least ${target}% on a 20+ question part.`,
      `${target}%`,
      stats.bestPercent >= target,
      stats.bestPercent,
      target,
      'Accuracy'
    )),
    ...progressMilestones.map((target) => createTrophy(
      `progress-${target}`,
      `${target}% Coverage`,
      `Cover ${target}% of available section MCQs.`,
      `${target}%`,
      stats.mcqBankProgress.percent >= target,
      stats.mcqBankProgress.percent,
      target,
      'Coverage'
    )),
    createTrophy('wrong-review', 'Comeback', 'Complete a wrong-answer review session.', 'WR', stats.wrongReviewCompleted, stats.wrongReviewCompleted ? 1 : 0, 1, 'Review')
  ]
}

function getClosestLockedTrophies(trophies) {
  return trophies
    .filter((trophy) => !trophy.unlocked)
    .sort((first, second) => {
      const progressDifference = second.progress - first.progress
      if (progressDifference) return progressDifference
      return (first.target - first.current) - (second.target - second.current)
    })
}

function getProfileAchievementPreview(trophies) {
  const unlocked = trophies.filter((trophy) => trophy.unlocked)
  const closestLocked = getClosestLockedTrophies(trophies)
  const preview = []
  const unlockedHighlight = unlocked[unlocked.length - 1]
  if (unlockedHighlight) preview.push({ ...unlockedHighlight, previewLabel: 'Completed highlight' })
  closestLocked.slice(0, 3 - preview.length).forEach((trophy, index) => {
    preview.push({ ...trophy, previewLabel: index === 0 ? 'Closest milestone' : 'Coming up' })
  })
  return preview.length ? preview : trophies.slice(0, 3)
}

function renderProfileTrophyCard(trophy, options = {}) {
  const statusLabel = trophy.unlocked ? 'Completed' : trophy.progressText
  const previewLabel = options.previewLabel || trophy.category
  return `
    <article class="${options.featured ? 'profile-achievement-card' : 'profile-trophy'}${trophy.unlocked ? ' profile-trophy--unlocked' : ''}${options.isNew ? ' profile-trophy--new' : ''}">
      <div class="profile-trophy__top">
        <span class="profile-trophy__icon" aria-hidden="true">${trophy.unlocked ? '✓' : escapeHtml(trophy.icon)}</span>
        <small>${escapeHtml(previewLabel)}</small>
      </div>
      <strong>${escapeHtml(trophy.title)}</strong>
      <p>${escapeHtml(trophy.description)}</p>
      <span class="profile-trophy__status">${escapeHtml(statusLabel)}</span>
      <span class="profile-trophy__bar" role="progressbar" aria-label="${escapeHtml(trophy.title)} progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${trophy.progress}">
        <span style="width: ${trophy.progress}%;"></span>
      </span>
    </article>
  `
}

function getProfileAvatarHtml() {
  return getProfileAvatarMarkup(getStudentAvatarId(), 'student-avatar--profile', 'Selected profile')
}

function renderProfileAvatarPicker() {
  const container = document.getElementById('profile-avatar-options')
  const selectedAvatarId = pendingProfileAvatarId || getSavedProfileAvatarId()
  const preview = document.getElementById('profile-avatar')
  const selectedAvatar = getProfileAvatarById(selectedAvatarId)
  if (preview) {
    preview.innerHTML = selectedAvatar
      ? getProfileAvatarMarkup(selectedAvatar.id, 'student-avatar--profile', 'Selected profile')
      : '<span class="profile-nickname-form__avatar-placeholder" aria-hidden="true">?</span>'
    preview.setAttribute('aria-label', selectedAvatar ? `${selectedAvatar.label} avatar selected` : 'No avatar selected')
  }
  if (container) {
    container.innerHTML = PROFILE_AVATARS.map((avatar) => `
      <button class="profile-avatar-option${avatar.id === selectedAvatarId ? ' is-selected' : ''}" type="button" data-profile-avatar="${avatar.id}" aria-label="Choose ${escapeHtml(avatar.label)} avatar" aria-pressed="${avatar.id === selectedAvatarId}">
        ${getProfileAvatarMarkup(avatar.id, 'student-avatar--option', avatar.label)}
        <span>${escapeHtml(avatar.label)}</span>
      </button>
    `).join('')
  }
}

function renderProfileSection() {
  const profileRoot = document.getElementById('profile-dashboard')
  if (!profileRoot) return

  const signedIn = !!studentProgressState.user
  const stats = getStudentProfileStats()
  const nickname = getStudentNickname()
  const setupRequired = signedIn && !isProfileSetupComplete()
  const trophies = getProfileTrophies(stats)
  const unlockedTrophies = trophies.filter((trophy) => trophy.unlocked)
  const masteryLevel = getProfileMasteryLevel(stats.totalScore)

  const nicknameInput = document.getElementById('profile-nickname-input')
  const profileForm = document.getElementById('profile-nickname-form')
  const displayNickname = document.getElementById('profile-display-nickname')
  const nameRow = document.getElementById('profile-name-row')
  const nicknameEditor = document.getElementById('profile-nickname-editor')
  const editButton = document.querySelector('[data-profile-edit-nickname]')
  const setupBanner = document.getElementById('profile-setup-banner')

  profileRoot.classList.toggle('is-loading', signedIn && !studentProgressState.ready)
  document.body.dataset.profileSetup = setupRequired ? 'required' : 'complete'
  if (displayNickname) displayNickname.textContent = nickname || 'Choose your nickname'
  if (nameRow) nameRow.hidden = setupRequired && profileNicknameEditorOpen
  if (nicknameInput && document.activeElement !== nicknameInput) nicknameInput.value = nickname
  if (profileForm) profileForm.hidden = false
  if (nicknameEditor) nicknameEditor.hidden = !setupRequired && !profileNicknameEditorOpen
  if (editButton) editButton.hidden = setupRequired || profileNicknameEditorOpen
  if (setupBanner) setupBanner.hidden = !setupRequired
  renderProfileAvatarPicker()
  window.requestAnimationFrame(syncProfileOnboardingTour)

  const setText = (id, value) => {
    const element = document.getElementById(id)
    if (element) element.textContent = value
  }

  setText('profile-total-score', String(stats.totalScore))
  setText('profile-season-score-note', stats.seasonName
    ? `${stats.seasonName}: ${stats.seasonScore || 0} points`
    : 'Lifetime score across this section')
  setText('profile-answered-count', String(stats.answeredCount))
  setText('profile-completed-quizzes', String(stats.completedQuizzes))
  setText('profile-rank', stats.rank ? `#${stats.rank}` : '-')
  setText('profile-rank-note', stats.rank
    ? `of ${getRankedLeaderboardRows().length} in ${stats.seasonName || 'this section'}`
    : (stats.leaderboardSynced ? `No ${stats.seasonName || 'section'} rank yet` : 'Syncing your position'))
  setText('profile-topic-progress-label', `${stats.mcqBankProgress.percent}%`)
  setText('profile-mcq-bank-progress-note', `${stats.mcqBankProgress.answered} of ${stats.mcqBankProgress.total} questions`)
  setText('profile-trophy-count', `${unlockedTrophies.length} / ${trophies.length} unlocked`)
  setText('profile-achievement-total', String(trophies.length))
  setText('profile-best-percent', stats.bestPercent ? `${stats.bestPercent}%` : '-')
  setText('profile-topics-touched', String(stats.mcqTopicsTouched))
  setText('profile-level', `Level ${masteryLevel.level}`)
  setText('profile-level-note', `${masteryLevel.remaining} points to Level ${masteryLevel.nextLevel}`)
  const nextLockedTrophy = getClosestLockedTrophies(trophies)[0]
  setText('profile-next-goal', nextLockedTrophy ? nextLockedTrophy.title : 'All milestones completed')
  setText('profile-next-goal-note', nextLockedTrophy ? nextLockedTrophy.description : 'You have completed every current achievement.')
  setText('profile-next-goal-progress', nextLockedTrophy ? nextLockedTrophy.progressText : 'Completed')

  const progressFill = document.getElementById('profile-topic-progress-fill')
  if (progressFill) progressFill.style.width = `${stats.mcqBankProgress.percent}%`
  const progressBar = document.getElementById('profile-topic-progress')
  if (progressBar) progressBar.setAttribute('aria-valuenow', String(stats.mcqBankProgress.percent))
  const levelFill = document.getElementById('profile-level-progress-fill')
  if (levelFill) levelFill.style.width = `${masteryLevel.progress}%`
  const levelBar = document.getElementById('profile-level-progress')
  if (levelBar) levelBar.setAttribute('aria-valuenow', String(masteryLevel.progress))
  const nextGoalProgress = nextLockedTrophy?.progress ?? 100
  const nextGoalFill = document.getElementById('profile-next-goal-fill')
  if (nextGoalFill) nextGoalFill.style.width = `${nextGoalProgress}%`
  const nextGoalBar = document.getElementById('profile-next-goal-bar')
  if (nextGoalBar) nextGoalBar.setAttribute('aria-valuenow', String(nextGoalProgress))

  const preview = document.getElementById('profile-achievement-preview')
  if (preview) {
    preview.innerHTML = getProfileAchievementPreview(trophies)
      .map((trophy) => renderProfileTrophyCard(trophy, { featured: true, previewLabel: trophy.previewLabel }))
      .join('')
  }

  const grid = document.getElementById('profile-trophy-grid')
  if (grid) {
    const seenIds = getSeenTrophyIds()
    const nextSeenIds = new Set(seenIds)
    grid.innerHTML = PROFILE_TROPHY_CATEGORIES.map((category) => {
      const categoryTrophies = trophies.filter((trophy) => trophy.category === category)
      if (!categoryTrophies.length) return ''
      return `
        <section class="profile-trophy-group" aria-labelledby="profile-trophy-group-${category.toLowerCase().replace(/\s+/g, '-')}">
          <h3 id="profile-trophy-group-${category.toLowerCase().replace(/\s+/g, '-')}">${escapeHtml(category)}</h3>
          <div class="profile-trophy-group__grid">
            ${categoryTrophies.map((trophy) => {
              const isNew = signedIn && trophy.unlocked && !seenIds.has(trophy.id)
              if (trophy.unlocked) nextSeenIds.add(trophy.id)
              return renderProfileTrophyCard(trophy, { isNew })
            }).join('')}
          </div>
        </section>
      `
    }).join('')
    if (signedIn && nextSeenIds.size !== seenIds.size) saveSeenTrophyIds(nextSeenIds)
  }
}

function getLegacyTopicCompletionKey(subjectCode, topicLabel) {
  return `${LEGACY_TOPIC_COMPLETION_STORAGE_PREFIX}${encodeURIComponent(subjectCode)}::${encodeURIComponent(topicLabel)}`
}

function getTopicProgressRecordKey(universityId, section, subjectCode, topicLabel) {
  return `${universityId}::${section}::${subjectCode}::${topicLabel}`
}

function getQuizProgressRecordKey(universityId, section, topicLabel, sourceId = 'current') {
  return `${universityId}::${section}::${topicLabel}::${sourceId || 'current'}`
}

function getTopicCompletionState(subjectCode, topicLabel) {
  const emptyState = { studied: false, mcqs: false }
  const cloudState = studentProgressState.topicRows.get(getTopicProgressRecordKey(activeUniversityId, activeAcademicSection, subjectCode, topicLabel))
  if (studentProgressState.user && cloudState) {
    return {
      ...emptyState,
      studied: !!cloudState.studied,
      mcqs: !!cloudState.mcqs
    }
  }

  try {
    const savedRaw = localStorage.getItem(getTopicCompletionKey(subjectCode, topicLabel))
      || (canUseLegacyLocalProgress() ? localStorage.getItem(getUnscopedTopicCompletionKey(subjectCode, topicLabel)) : null)
      || (canUseLegacyLocalProgress() && activeAcademicSection === '401' ? localStorage.getItem(getLegacyTopicCompletionKey(subjectCode, topicLabel)) : null)
    const subject = subjects.find((item) => item.code === subjectCode)
    const topic = [...(subject?.topics || []), ...(subject?.clinicalTopics || [])].find((item) => item.label === topicLabel)
    const aliasStates = (topic?.progressAliases || []).map((alias) => {
      const aliasCloudState = studentProgressState.topicRows.get(getTopicProgressRecordKey(activeUniversityId, activeAcademicSection, subjectCode, alias))
      if (studentProgressState.user && aliasCloudState) return aliasCloudState
      return getLocalTopicCompletionState(subjectCode, alias)
    })
    const savedState = JSON.parse(savedRaw || '{}')
    return {
      ...emptyState,
      studied: !!savedState.studied || aliasStates.some((state) => state.studied),
      mcqs: !!savedState.mcqs || aliasStates.some((state) => state.mcqs)
    }
  } catch {
    localStorage.removeItem(getTopicCompletionKey(subjectCode, topicLabel))
    return emptyState
  }
}

function saveTopicCompletionState(subjectCode, topicLabel, state) {
  if (isResourceFirstSection()) return

  const normalizedState = {
    studied: !!state.studied,
    mcqs: !!state.mcqs
  }
  const recordKey = getTopicProgressRecordKey(activeUniversityId, activeAcademicSection, subjectCode, topicLabel)
  studentProgressState.topicRows.set(recordKey, normalizedState)

  try {
    localStorage.setItem(getTopicCompletionKey(subjectCode, topicLabel), JSON.stringify(normalizedState))
  } catch {
    // Local checklist controls should not break topic rendering if storage is blocked.
  }

  if (studentProgressState.user && !activeAcademicSectionData?.capabilities?.resourceFirst) {
    upsertUserTopicProgress({
      user_id: studentProgressState.user.id,
      university_id: activeUniversityId,
      section: activeAcademicSection,
      subject_code: subjectCode,
      topic_label: topicLabel,
      studied: normalizedState.studied,
      mcqs: normalizedState.mcqs
    }).catch((error) => {
      studentProgressState.lastError = error.message
      renderStudentSyncUi()
      console.warn('Topic progress cloud sync failed.', error)
    })
  }
}

function renderTopicCompletionControls(subject, topic) {
  if (isResourceFirstSection()) return ''

  const state = getTopicCompletionState(subject.code, topic.label)
  const controls = [{ key: 'studied', label: 'Completed' }]

  return `
    <fieldset class="topic-completion" aria-label="${escapeHtml(topic.label)} progress">
      ${controls.map((control) => `
        <label class="topic-completion__item${state[control.key] ? ' is-checked' : ''}">
          <input
            type="checkbox"
            data-topic-completion="${control.key}"
            data-subject-code="${escapeHtml(subject.code)}"
            data-topic-label="${escapeHtml(topic.label)}"
            ${state[control.key] ? 'checked' : ''}
          >
          <span>${control.label}</span>
        </label>
      `).join('')}
    </fieldset>
  `
}

function isRecentTopicUpdate(topic) {
  return isWeeklyTopicUpdateEligible(topic)
}

function getNextUniversityWeekStart(date) {
  const dateStart = startOfDay(date)
  const daysUntilWeekStart = (7 + UNIVERSITY_WEEK_START_DAY - dateStart.getDay()) % 7 || 7
  const nextWeekStart = new Date(dateStart)
  nextWeekStart.setDate(dateStart.getDate() + daysUntilWeekStart)
  return nextWeekStart
}

function getUniversityWeekStart(date = new Date()) {
  const dateStart = startOfDay(date)
  const daysSinceWeekStart = (7 + dateStart.getDay() - UNIVERSITY_WEEK_START_DAY) % 7
  dateStart.setDate(dateStart.getDate() - daysSinceWeekStart)
  return dateStart
}

function isCurrentWeekDate(value, today = new Date()) {
  if (!value) return false
  const candidate = new Date(value)
  if (!Number.isFinite(candidate.getTime())) return false
  const weekStart = getUniversityWeekStart(today)
  const nextWeekStart = new Date(weekStart)
  nextWeekStart.setDate(weekStart.getDate() + 7)
  return candidate >= weekStart && candidate < nextWeekStart
}

function isWeeklyTopicUpdateEligible(topic, today = new Date()) {
  return !!topic.createdAt && isCurrentWeekDate(topic.createdAt, today)
}

function getUnreadTopicUpdates(subject) {
  return [...(subject.topics || []), ...(subject.clinicalTopics || [])]
    .filter((topic) => isWeeklyTopicUpdateEligible(topic))
}

function markSubjectUpdatesSeen(subject) {
  return false
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function isDriveUrl(url = '') {
  return /drive\.google\.com|docs\.google\.com/.test(String(url))
}

function getTrackerFilters() {
  const query = trackerSearch?.value.trim().toLowerCase() || ''
  return {
    query: trackerSearchMode === 'topics' ? query : '',
    status: trackerStatusFilter?.value || 'all',
    scope: trackerScopeFilter?.value || 'all'
  }
}

function normalizeMcqSearchText(value = '') {
  return String(value).toLowerCase().replace(/\s+/g, ' ').trim()
}

function getMcqSearchIndex() {
  const results = []
  const seen = new Set()
  const sectionQuizzes = getMcqQuizzesForSection()

  Object.keys(sectionQuizzes).forEach((topicLabel) => {
    getQuizSources(topicLabel).forEach((source) => {
      const questions = source.mcqs?.length
        ? source.mcqs
        : getCollectionParts(source).flatMap((part) => part.mcqs || [])

      questions.forEach((question, questionIndex) => {
        const questionId = question.id || `${source.id}-${questionIndex}`
        const key = `${topicLabel}::${source.id}::${questionId}`
        if (seen.has(key)) return
        seen.add(key)

        const choices = question.choices || question.options?.map((option) => option.text) || []
        const searchable = normalizeMcqSearchText([
          topicLabel,
          source.label,
          source.description,
          question.question,
          question.section,
          question.organ,
          question.source,
          ...choices
        ].filter(Boolean).join(' '))

        results.push({
          resultId: key,
          topicLabel,
          sourceId: source.id,
          sourceLabel: source.label || 'MCQs',
          question,
          questionId,
          searchable
        })
      })
    })
  })

  return results
}

function getMcqSearchResults(query) {
  const normalizedQuery = normalizeMcqSearchText(query)
  if (!normalizedQuery) return []

  const words = normalizedQuery.split(' ').filter(Boolean)
  return getMcqSearchIndex()
    .filter((result) => words.every((word) => result.searchable.includes(word)))
    .slice(0, 24)
}

function renderMcqSearchResults() {
  if (!mcqSearchResults) return

  const query = trackerSearch?.value.trim() || ''
  const isMcqMode = trackerSearchMode === 'mcqs'
  mcqSearchResults.hidden = !isMcqMode

  if (!isMcqMode) {
    renderedMcqSearchResults = []
    mcqSearchResults.innerHTML = ''
    return
  }

  if (!query) {
    renderedMcqSearchResults = []
    mcqSearchResults.innerHTML = '<p class="mcq-search-results__empty">Type a question keyword to search MCQs.</p>'
    return
  }

  renderedMcqSearchResults = getMcqSearchResults(query)
  if (!renderedMcqSearchResults.length) {
    mcqSearchResults.innerHTML = '<p class="mcq-search-results__empty">No MCQ questions match this search.</p>'
    return
  }

  mcqSearchResults.innerHTML = `
    <div class="mcq-search-results__top">
      <strong>${renderedMcqSearchResults.length} MCQ match${renderedMcqSearchResults.length === 1 ? '' : 'es'}</strong>
      <span>Click a result to open that question.</span>
    </div>
    <div class="mcq-search-results__list">
      ${renderedMcqSearchResults.map((result, index) => {
        const meta = [result.sourceLabel, result.question.organ, result.question.section]
          .filter(Boolean)
          .join(' - ')
        return `
          <button class="mcq-search-result" type="button" data-mcq-search-result="${index}">
            <span class="mcq-search-result__topic">${escapeHtml(result.topicLabel)}</span>
            <strong>${escapeHtml(result.question.question || 'Untitled question')}</strong>
            ${meta ? `<small>${escapeHtml(meta)}</small>` : ''}
          </button>
        `
      }).join('')}
    </div>
  `
}

function renderSourceSearchResults() {
  if (!mcqSearchResults) return

  const query = trackerSearch?.value.trim() || ''
  const isSourcesMode = trackerSearchMode === 'sources'
  mcqSearchResults.hidden = !isSourcesMode

  if (!isSourcesMode) {
    renderedSourceSearchResults = []
    return
  }

  if (!query) {
    renderedSourceSearchResults = []
    const manifest = getManifest()
    const topicsList = (manifest && manifest.topics) ? manifest.topics : []

    let topicsBrowseHtml = ''
    if (topicsList.length > 0) {
      topicsBrowseHtml = `
        <div class="mcq-search-results__top">
          <strong>Medical Sources (${topicsList.length} topics)</strong>
          <span>Select a topic to browse.</span>
        </div>
        <div class="mcq-search-results__list">
          ${topicsList.map((t) => `
            <button class="mcq-search-result source-search-result" type="button" data-source-topic-id="${escapeHtml(t.id)}">
              <span class="mcq-search-result__topic">Gastroenterology</span>
              <strong>${escapeHtml(t.title)}</strong>
              <small>${t.sectionCount} sections · ${t.passageCount} source passages</small>
            </button>
          `).join('')}
        </div>
      `
    } else {
      topicsBrowseHtml = `
        <div class="sources-search-results__empty">
          <p>Search topics, section titles, keywords, and lecture passages.</p>
          <button type="button" class="sources-browse-all-btn" data-open-sources-browser>Browse all sources</button>
        </div>
      `
    }
    mcqSearchResults.innerHTML = topicsBrowseHtml
    return
  }

  renderedSourceSearchResults = searchSources(query)
  if (!renderedSourceSearchResults.length) {
    mcqSearchResults.innerHTML = '<p class="mcq-search-results__empty">No medical sources match this search.</p>'
    return
  }

  mcqSearchResults.innerHTML = `
    <div class="mcq-search-results__top">
      <strong>${renderedSourceSearchResults.length} Source match${renderedSourceSearchResults.length === 1 ? '' : 'es'}</strong>
      <span>Click to open in source reader.</span>
    </div>
    <div class="mcq-search-results__list">
      ${renderedSourceSearchResults.map((result) => `
        <button class="mcq-search-result source-search-result" type="button" data-source-topic-id="${escapeHtml(result.topicId)}" data-source-section-id="${escapeHtml(result.sectionId || '')}" data-source-passage-id="${escapeHtml(result.passageId || '')}">
          <span class="mcq-search-result__topic">${escapeHtml(result.breadcrumb)}</span>
          <strong>${escapeHtml(result.title)}</strong>
          ${result.snippet ? `<small class="sources-search-snippet">${result.snippet}</small>` : ''}
        </button>
      `).join('')}
    </div>
  `
}

let renderedSourceSearchResults = []
let activeSourceReaderState = null
let lastSourceReaderOpener = null
let previousModalDisplayState = null

async function openSourceReader({ topicId, sectionId, passageId, highlightText = '', openerElement = null } = {}) {
  const readerWasOpen = Boolean(activeSourceReaderState)
  if (openerElement) {
    lastSourceReaderOpener = openerElement
  } else if (document.activeElement && document.activeElement !== document.body) {
    lastSourceReaderOpener = document.activeElement
  }

  const resolved = await resolvePassage(topicId, sectionId, passageId)
  if (!resolved) return

  const modal = ensureQuizModal()
  const panel = modal.querySelector('.quiz-modal__panel')
  if (!panel) return
  const modalWasOpen = modal.getAttribute('aria-hidden') !== 'true'

  let readerContainer = panel.querySelector('.source-reader-container')
  if (!readerContainer) {
    readerContainer = document.createElement('div')
    readerContainer.className = 'source-reader-container'
    readerContainer.id = 'source-reader-container'
    const bodyEl = panel.querySelector('.quiz-modal__body')
    if (bodyEl) {
      bodyEl.insertAdjacentElement('afterend', readerContainer)
    } else {
      panel.appendChild(readerContainer)
    }
  }

  const hasActiveQuiz = Boolean(
    getCurrentQuiz().length > 0
    && (modalWasOpen || openerElement?.closest('.quiz-question-card'))
  )
  const isDesktop = window.innerWidth > 900

  activeSourceReaderState = {
    topicId,
    sectionId: resolved.section ? resolved.section.id : sectionId,
    passageId,
    highlightText,
    resolved,
    hasActiveQuiz,
    quizPanelScrollTop: panel.scrollTop
  }

  const quizBody = panel.querySelector('.quiz-modal__body')
  const quizActions = panel.querySelector('.quiz-modal__actions')
  const quizHeading = panel.querySelector('.quiz-modal__heading')
  const shouldHideQuizShell = !hasActiveQuiz || !isDesktop

  if (shouldHideQuizShell && !readerWasOpen) {
    previousModalDisplayState = {
      bodyHidden: quizBody ? quizBody.hidden : false,
      actionsHidden: quizActions ? quizActions.hidden : false,
      headingHidden: quizHeading ? quizHeading.hidden : false
    }
    if (quizBody) quizBody.hidden = true
    if (quizActions) quizActions.hidden = true
    if (quizHeading) quizHeading.hidden = true
  } else if (!shouldHideQuizShell) {
    previousModalDisplayState = null
  }

  if (hasActiveQuiz && isDesktop) {
    panel.classList.add('quiz-modal__panel--split-view')
  }

  let htmlMarkup = '<div class="source-reader__controls">'
  htmlMarkup += `
    <button type="button" class="source-reader__back-btn source-reader__return-btn" data-close-source-reader>
      ← ${hasActiveQuiz ? 'Return to quiz' : 'Back to Sources'}
    </button>
  `
  htmlMarkup += '</div>'
  htmlMarkup += renderSourceReaderMarkup(resolved, passageId, highlightText)

  readerContainer.innerHTML = htmlMarkup
  readerContainer.hidden = false

  modal.setAttribute('aria-hidden', 'false')
  document.body.classList.add('panel-open')

  if (passageId) {
    setTimeout(() => {
      const passEl = readerContainer.querySelector(`#p-${passageId}`)
      if (passEl) {
        readerContainer.scrollTo({
          top: Math.max(passEl.offsetTop - readerContainer.offsetTop - 24, 0),
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        })
        passEl.classList.add('source-reader__passage--highlight')
      }
    }, 50)
  }
}

function closeSourceReader() {
  const modal = document.getElementById('quiz-modal')
  if (!modal) return

  const panel = modal.querySelector('.quiz-modal__panel')
  const readerState = activeSourceReaderState
  if (panel) {
    panel.classList.remove('quiz-modal__panel--split-view')

    const quizBody = panel.querySelector('.quiz-modal__body')
    const quizActions = panel.querySelector('.quiz-modal__actions')
    const quizHeading = panel.querySelector('.quiz-modal__heading')

    if (previousModalDisplayState) {
      if (quizBody) quizBody.hidden = previousModalDisplayState.bodyHidden
      if (quizActions) quizActions.hidden = previousModalDisplayState.actionsHidden
      if (quizHeading) quizHeading.hidden = previousModalDisplayState.headingHidden
      previousModalDisplayState = null
    }
  }

  const readerContainer = modal.querySelector('.source-reader-container')
  if (readerContainer) {
    readerContainer.hidden = true
    readerContainer.innerHTML = ''
  }

  const hasActiveQuiz = Boolean(readerState?.hasActiveQuiz)

  if (!hasActiveQuiz) {
    modal.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('panel-open')
  }

  activeSourceReaderState = null

  if (panel && hasActiveQuiz && Number.isFinite(readerState?.quizPanelScrollTop)) {
    requestAnimationFrame(() => {
      panel.scrollTop = readerState.quizPanelScrollTop
    })
  }

  if (lastSourceReaderOpener && typeof lastSourceReaderOpener.focus === 'function') {
    lastSourceReaderOpener.focus()
    lastSourceReaderOpener = null
  }
}

function setTrackerSearchMode(mode = 'topics') {
  if (mode === 'mcqs') {
    trackerSearchMode = 'mcqs'
  } else if (mode === 'sources') {
    trackerSearchMode = 'sources'
  } else {
    trackerSearchMode = 'topics'
  }

  trackerSearchModeButtons.forEach((button) => {
    const isActive = button.dataset.searchMode === trackerSearchMode
    button.classList.toggle('filter-panel__mode-btn--active', isActive)
    button.setAttribute('aria-pressed', String(isActive))
  })

  if (trackerSearch) {
    if (trackerSearchMode === 'mcqs') {
      trackerSearch.placeholder = 'Search MCQ questions…'
    } else if (trackerSearchMode === 'sources') {
      trackerSearch.placeholder = 'Search medical sources, topics, sections…'
    } else {
      trackerSearch.placeholder = activeAcademicSectionData.trackerSearchPlaceholder
    }
  }

  if (trackerSearchMode === 'sources') {
    renderSourceSearchResults()
  } else {
    renderMcqSearchResults()
  }
}

function openMcqSearchResult(index, event = null) {
  const result = renderedMcqSearchResults[Number(index)]
  if (!result) return

  const config = registerDynamicQuizConfig(result.topicLabel, {
    id: `mcq-search-${result.sourceId}-${result.questionId}`,
    label: 'Search result',
    description: result.sourceLabel,
    mode: 'search-result',
    mcqs: [result.question],
    shuffleQuestions: false,
    shuffleOptions: false,
    timeLimitMinutes: null,
    transient: true
  })

  openQuiz(result.topicLabel, config.id, event, { skipSaved: true })
}

function getFilteredTopics(subject) {
  const { query, status, scope } = getTrackerFilters()

  return subject.topics.filter((topic) => {
    const matchesStatus = status === 'all' || topic.state === status
    const matchesScope = scope === 'all' || (scope === 'midterm' && isTopicMidtermScopeConfirmed(topic))
    const searchable = `${subject.code} ${subject.name} ${topic.label} ${topic.section || ''} ${topic.note || ''} ${isTopicMidtermScopeConfirmed(topic) ? topic.midtermScopeNote || '' : ''} ${isTopicMidtermScopeConfirmed(topic) ? 'midterm scope included' : ''}`.toLowerCase()
    const matchesQuery = !query || searchable.includes(query)
    return matchesStatus && matchesScope && matchesQuery
  })
}

function getClinicalTopics(subject) {
  return Array.isArray(subject.clinicalTopics) ? subject.clinicalTopics : []
}

function getFilteredClinicalTopics(subject) {
  const { query, status, scope } = getTrackerFilters()

  if (scope === 'midterm') return []

  return getClinicalTopics(subject).filter((topic) => {
    const matchesStatus = status === 'all' || topic.state === status
    const searchable = `${subject.code} ${subject.name} ${topic.label || ''} ${topic.note || ''} ${topic.roundDate || ''} ${topic.room || ''}`.toLowerCase()
    const matchesQuery = !query || searchable.includes(query)
    return matchesStatus && matchesQuery
  })
}

function getFilteredSubjects() {
  const { query, status, scope } = getTrackerFilters()

  const activeExamSchedule = activeAcademicSectionData?.midtermExamSchedule || []
  const subjectCodesInMidterm = activeExamSchedule
    .filter(exam => exam.type !== 'quiz')
    .map(exam => exam.subjectCode)

  return subjects.filter((subject) => {
    if (!query && status === 'all' && scope === 'all') return true

    if (scope === 'midterm') {
      const isInMidtermSchedule = subjectCodesInMidterm.includes(subject.code)
      const hasMidtermTopics = subject.topics.some(topic => topic.midtermScope)
      if (!isInMidtermSchedule && !hasMidtermTopics) return false

      if (query || status !== 'all') {
        const matchesQuery = !query || `${subject.code} ${subject.name}`.toLowerCase().includes(query)
        const hasMatchingTopics = getFilteredTopics(subject).length > 0
        return matchesQuery || hasMatchingTopics
      }

      return true
    }

    return getFilteredTopics(subject).length > 0 || getFilteredClinicalTopics(subject).length > 0
  })
}

function getResourceItems(topic) {
  const lectureUrls = topic.lectureUrls || []
  const driveSelectorItems = (topic.driveSelector || [])
    .filter((item) => item.url)
    .map((item) => ({ ...item, type: 'lecture' }))
  const driveLectureItems = lectureUrls.filter((item) => isDriveUrl(item.url))
  const otherLectureItems = lectureUrls
    .filter((item) => !isDriveUrl(item.url))
    .map((item) => ({ ...item, type: 'lecture' }))
  const driveItems = driveLectureItems.length > 1
    ? [{ label: 'Drive resources', type: 'drive-group', items: driveLectureItems }]
    : driveLectureItems.map((item) => ({ ...item, type: 'lecture' }))
  const pdfItems = (topic.pdfUrls || []).map((item) => ({ ...item, type: 'pdf' }))
  const audioItem = topic.audioUrl ? [{ label: 'Lecture record', url: topic.audioUrl, type: 'audio' }] : []
  return [...driveSelectorItems, ...driveItems, ...otherLectureItems, ...pdfItems, ...audioItem]
}

function getCompactResourceLabel(item) {
  const label = (item.label || '').toLowerCase()
  const url = (item.url || '').toLowerCase()

  if (item.type === 'audio') return 'Audio'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'

  if (label.includes('board') || label.includes('image') || label.includes('whiteboard')) {
    return 'Board image'
  }
  if (label.includes('ppt') || label.includes('presentation') || label.includes('powerpoint')) {
    return 'PPT'
  }
  if (item.type === 'pdf' || label.includes('pdf') || label.includes('booklet') || label.includes('summary') || label.includes('compact') || url.includes('.pdf')) {
    return 'PDF'
  }

  if (item.type === 'drive-group') return 'Drive'
  if (item.type === 'lecture') return 'Lecture'

  return item.label || 'Resource'
}

function renderResourceItem(item) {
  const compactLabel = getCompactResourceLabel(item)
  const tooltip = item.title || item.label || compactLabel

  if (item.type === 'audio') {
    return `
      <a class="topic-resource topic-resource--audio" href="${item.url}" target="_blank" rel="noopener noreferrer" aria-label="Open lecture record in Google Drive" title="${escapeHtml(tooltip)}">
        <img class="topic-resource__play-icon" src="${PLAY_ICON_URL}" alt="" width="128" height="128" loading="lazy" decoding="async">
        <span>${escapeHtml(compactLabel)}</span>
      </a>
    `
  }

  if (item.type === 'drive-group') {
    const links = item.items.map((driveItem) => `
      <a href="${driveItem.url}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(driveItem.label || '')}">
        ${escapeHtml(getCompactResourceLabel(driveItem))}
      </a>
    `).join('')

    return `
      <details class="topic-resource-menu">
        <summary class="topic-resource topic-resource--drive" aria-label="Open Drive resources" title="${escapeHtml(tooltip)}">
          <img class="topic-resource__drive-icon" src="${DRIVE_ICON_URL}" alt="" width="56" height="55" loading="lazy" decoding="async">
          <span>${escapeHtml(compactLabel)}</span>
        </summary>
        <span class="topic-resource-menu__links">
          ${links}
        </span>
      </details>
    `
  }

  if (item.type === 'pdf' && item.preview) {
    const title = item.title || item.label || 'PDF preview'
    const downloadUrl = item.downloadUrl || item.url
    return `
      <button class="topic-resource topic-resource--pdf topic-resource--pdf-preview" type="button" data-pdf-preview="${escapeHtml(item.url)}" data-pdf-title="${escapeHtml(title)}" data-pdf-download="${escapeHtml(downloadUrl)}" title="${escapeHtml(tooltip)}">
        ${escapeHtml(compactLabel)}
      </button>
    `
  }

  const isDriveLecture = item.type === 'lecture' && isDriveUrl(item.url)
  const labelAttr = isDriveLecture ? ` aria-label="Open ${escapeHtml(item.label || 'lecture source')} in Google Drive"` : ''

  return `
    <a class="topic-resource topic-resource--${item.type}${isDriveLecture ? ' topic-resource--drive' : ''}" href="${item.url}" target="_blank" rel="noopener noreferrer"${item.download ? ' download' : ''}${labelAttr} title="${escapeHtml(tooltip)}">
      ${isDriveLecture ? `<img class="topic-resource__drive-icon" src="${DRIVE_ICON_URL}" alt="" width="56" height="55" loading="lazy" decoding="async">` : ''}
      <span>${escapeHtml(compactLabel)}</span>
    </a>
  `
}

function renderTopicActionIcon(type) {
  if (type === 'drive') {
    return `<img class="topic-action-card__image" src="${DRIVE_ICON_URL}" alt="" width="56" height="55" loading="lazy" decoding="async">`
  }

  if (type === 'mcq') {
    return `
      <svg class="topic-action-card__svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3h7l4 4v14H7z"></path>
        <path d="M14 3v5h5"></path>
        <path d="M10 12h5"></path>
        <path d="M10 16h4"></path>
      </svg>
    `
  }

  if (type === 'study') {
    return `
      <svg class="topic-action-card__svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z"></path>
        <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z"></path>
      </svg>
    `
  }

  return `
    <svg class="topic-action-card__svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"></path>
      <path d="M19 11a7 7 0 0 1-14 0"></path>
      <path d="M12 18v3"></path>
      <path d="M8 21h8"></path>
      <path d="M4 10v2"></path>
      <path d="M20 10v2"></path>
    </svg>
  `
}

function renderTopicActionContent(type) {
  return `
    <span class="topic-action-card__icon">
      ${renderTopicActionIcon(type)}
    </span>
  `
}

function renderDriveActionCard(resources, topic, breakdownExpanded = false) {
  if (topic.expandableTopics) {
    const actionLabel = breakdownExpanded ? 'Hide topic resources' : 'Show topic resources'
    return `
      <button class="topic-action-card topic-action-card--drive" type="button" data-toggle-topic-breakdown aria-expanded="${breakdownExpanded}" aria-label="${actionLabel}" title="${actionLabel}">
        ${renderTopicActionContent('drive')}
      </button>
    `
  }

  const driveResources = resources.flatMap((item) => {
    if (item.type === 'drive-group') return item.items
    if (item.type !== 'audio' && item.url && isDriveUrl(item.url)) return [item]
    return []
  })
  const label = 'Lecture slides and files'

  if (!driveResources.length) {
    return `
      <span class="topic-action-card topic-action-card--drive topic-action-card--disabled" aria-disabled="true" aria-label="${label}: Not uploaded yet" title="${label}: Not uploaded yet">
        ${renderTopicActionContent('drive')}
      </span>
    `
  }

  if (driveResources.length > 1) {
    const links = driveResources.map((item) => `
      <a href="${item.url}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(item.label || label)}">
        ${escapeHtml(item.label || getCompactResourceLabel(item))}
      </a>
    `).join('')

    return `
      <details class="topic-action-menu">
        <summary class="topic-action-card topic-action-card--drive" aria-label="Open ${label}" title="${label}">
          ${renderTopicActionContent('drive')}
        </summary>
        <span class="topic-action-menu__links">
          ${links}
        </span>
      </details>
    `
  }

  const driveItem = driveResources[0]
  return `
    <a class="topic-action-card topic-action-card--drive" href="${driveItem.url}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeHtml(driveItem.label || label)}" title="${escapeHtml(driveItem.label || label)}">
      ${renderTopicActionContent('drive')}
    </a>
  `
}

function renderMcqActionCard(quizTopicKey, quizCount) {
  const label = quizCount ? `MCQs (${quizCount})` : 'MCQs'

  if (!quizCount) {
    return `
      <span class="topic-action-card topic-action-card--mcq topic-action-card--disabled" aria-disabled="true" aria-label="MCQs: Not uploaded yet" title="MCQs: Not uploaded yet">
        ${renderTopicActionContent('mcq')}
        <span class="topic-action-card__label">MCQs</span>
      </span>
    `
  }

  return `
    <button class="topic-action-card topic-action-card--mcq" type="button" data-quiz-topic="${escapeHtml(quizTopicKey)}" aria-label="Open ${escapeHtml(label)}" title="${escapeHtml(label)}">
      ${renderTopicActionContent('mcq')}
      <span class="topic-action-card__label">MCQs</span>
    </button>
  `
}

function renderLectureRecordActionCard(topic) {
  if (!topic.audioUrl) {
    return `
      <span class="topic-action-card topic-action-card--audio topic-action-card--disabled" aria-disabled="true" aria-label="Lecture recording: Not uploaded yet" title="Lecture recording: Not uploaded yet">
        ${renderTopicActionContent('audio')}
      </span>
    `
  }

  return `
    <a class="topic-action-card topic-action-card--audio" href="${topic.audioUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open lecture recording in Google Drive" title="Lecture recording">
      ${renderTopicActionContent('audio')}
    </a>
  `
}

function renderStudyActionCard(topic) {
  if (!topic.studyUrl) return ''

  return `
    <a class="topic-action-card topic-action-card--study" href="${escapeHtml(topic.studyUrl)}" aria-label="Study ${escapeHtml(topic.label)} with explanation cards" title="Study explanation cards">
      ${renderTopicActionContent('study')}
    </a>
  `
}

function renderResourceLinks(topic, breakdownExpanded = false) {
  const caps = activeAcademicSectionData?.capabilities || {}
  const quizTopicKey = topic.mcqTopicKey || topic.label
  const quizSources = getQuizSources(quizTopicKey)
  const quizCount = quizSources.reduce((total, source) => total + source.mcqs.length, 0)
  const resources = getResourceItems(topic)
  const mcqAction = caps.hasMcqs === false || caps.resourceFirst
    ? ''
    : renderMcqActionCard(quizTopicKey, quizCount)
  const audioAction = caps.resourceFirst && !topic.audioUrl
    ? ''
    : renderLectureRecordActionCard(topic)

  return `
    <div class="topic-action-row${topic.studyUrl ? ' topic-action-row--has-study' : ''}" aria-label="Topic resources">
      ${renderDriveActionCard(resources, topic, breakdownExpanded)}
      ${mcqAction}
      ${audioAction}
      ${renderStudyActionCard(topic)}
    </div>
  `
}

function getTopicBreakdownKey(subjectCode, topicLabel) {
  return `${activeUniversityId}::${activeAcademicSection}::${subjectCode}::${topicLabel}`
}

function renderTopicBreakdownAction({ type, label, url = '', quizKey = '', available = false }) {
  const content = `
    <span class="topic-breakdown-action__icon">${renderTopicActionIcon(type)}</span>
    <span class="topic-breakdown-action__text">
      <strong>${escapeHtml(label)}</strong>
      ${available ? '' : '<small>Not uploaded yet</small>'}
    </span>
  `

  if (!available) {
    return `<span class="topic-breakdown-action topic-breakdown-action--${type} topic-breakdown-action--unavailable" aria-disabled="true">${content}</span>`
  }

  if (type === 'mcq') {
    return `<button class="topic-breakdown-action topic-breakdown-action--mcq" type="button" data-quiz-topic="${escapeHtml(quizKey)}">${content}</button>`
  }

  return `<a class="topic-breakdown-action topic-breakdown-action--${type}" href="${url}" target="_blank" rel="noopener noreferrer">${content}</a>`
}

function renderTopicBreakdown(subject, topic) {
  if (!topic.expandableTopics || !topic.driveSelector?.length) return ''
  const isExpanded = expandedTopicBreakdowns.has(getTopicBreakdownKey(subject.code, topic.label))
  const items = topic.driveSelector.map((item) => {
    const quizKey = item.quizKey || item.label
    const quizSources = getQuizSources(quizKey)
    const quizCount = quizSources.reduce((total, source) => total + source.mcqs.length, 0)
    return `
      <article class="topic-breakdown__item">
        <div class="topic-breakdown__copy">
          <strong>${escapeHtml(item.label)}</strong>
          <p>${escapeHtml(item.source)}</p>
        </div>
        <div class="topic-breakdown__actions" aria-label="${escapeHtml(item.label)} resources">
          ${renderTopicBreakdownAction({ type: 'drive', label: 'Lecture slides', url: item.url, available: Boolean(item.url) })}
          ${renderTopicBreakdownAction({ type: 'audio', label: 'Lecture recording', url: item.recordUrl, available: Boolean(item.recordUrl) })}
          ${renderTopicBreakdownAction({ type: 'mcq', label: quizCount ? `MCQs (${quizCount})` : 'MCQs', quizKey, available: quizCount > 0 })}
        </div>
      </article>
    `
  }).join('')

  return `
    <section class="topic-breakdown" ${isExpanded ? '' : 'hidden'} aria-label="${escapeHtml(topic.label)} topics">
      ${items}
    </section>
  `
}

function updateTrackerUrl(subjectCode) {
  const url = new URL(window.location.href)
  url.searchParams.set('section', activeAcademicSection)
  url.searchParams.set('tracker', '1')
  url.searchParams.set('subject', subjectCode)
  url.hash = 'tracker'
  window.history.replaceState({}, '', url)
}

function sortTopicsForDisplay(subject, topics, collection = subject.topics) {
  return [...topics].sort((a, b) => {
    return collection.indexOf(a) - collection.indexOf(b)
  })
}

function getFastStaggerDelay(index, step = 14, max = 120) {
  return `${Math.min(index * step, max)}ms`
}

function renderTopicGroupHeading(groupTitle, globalIndex) {
  if (groupTitle === 'Taken in University') return ''

  return `
    <li class="topic-section-heading" style="--delay: ${getFastStaggerDelay(globalIndex)}">
      <span>${groupTitle}</span>
    </li>
  `
}

function renderTopicBadges(topic) {
  const badges = []

  // 1 & 2 & 3. Covered / Partial / Remaining
  const isCovered = topic.state === 'taken'
  const isPartial = topic.state === 'partial' ||
                    (topic.note && (topic.note.toLowerCase().includes('started') || topic.note.toLowerCase().includes('incomplete')))

  if (isCovered) {
    badges.push('<span class="t-badge t-badge--covered">Covered</span>')
  } else if (isPartial) {
    badges.push('<span class="t-badge t-badge--partial">Partial</span>')
  } else {
    badges.push('<span class="t-badge t-badge--remaining">Remaining</span>')
  }

  // 4. Midterm
  if (topic.midtermScope) {
    badges.push('<span class="t-badge t-badge--midterm">Midterm</span>')
  }

  // 5. Lecture
  const hasLecture = (topic.lectureUrls && topic.lectureUrls.length > 0) ||
                     (topic.resources && topic.resources.length > 0) ||
                     topic.audioUrl || topic.videoUrl
  if (hasLecture) {
    badges.push('<span class="t-badge t-badge--lecture">Lecture</span>')
  }

  // 6. MCQs
  const quizSources = getQuizSources(topic.mcqTopicKey || topic.label)
  if (quizSources.length > 0) {
    badges.push('<span class="t-badge t-badge--mcq">MCQs</span>')
  }

  return `<div class="topic-item__badges">${badges.join('')}</div>`
}

function renderTopicCard(subject, topic, index, collection = subject.topics) {
  const topicPosition = collection.indexOf(topic)
  const displayNum = String((topicPosition >= 0 ? topicPosition : index) + 1).padStart(2, '0')
  const topicState = ['taken', 'partial', 'announced', 'remaining', 'taken-in-university'].includes(topic.state)
    ? topic.state
    : 'remaining'
  const track = collection === subject.clinicalTopics ? 'clinical' : 'theoretical'
  const breakdownKey = getTopicBreakdownKey(subject.code, topic.label)
  const breakdownExpanded = expandedTopicBreakdowns.has(breakdownKey)
  const adminControls = isTrackerAdmin() ? `
    <span class="tracker-admin-topic-controls" aria-label="Admin controls for ${escapeHtml(topic.label)}">
      <button type="button" data-admin-move="up" aria-label="Move ${escapeHtml(topic.label)} up" ${topicPosition <= 0 ? 'disabled' : ''}>↑</button>
      <button type="button" data-admin-move="down" aria-label="Move ${escapeHtml(topic.label)} down" ${topicPosition >= collection.length - 1 ? 'disabled' : ''}>↓</button>
      <button type="button" data-admin-edit-topic aria-label="Edit ${escapeHtml(topic.label)}">Edit</button>
    </span>
  ` : ''

  return `
    <li class="topic-item topic-item--${topicState}${topic.expandableTopics ? ' topic-item--expandable' : ''}${breakdownExpanded ? ' is-breakdown-expanded' : ''}${isTrackerAdmin() ? ' tracker-admin-topic' : ''}"
      style="--delay: ${getFastStaggerDelay(index)};"
      data-admin-subject="${escapeHtml(subject.code)}"
      data-admin-track="${track}"
      data-admin-topic="${escapeHtml(topic.label)}"
      ${topic.expandableTopics ? `data-topic-breakdown-card aria-expanded="${breakdownExpanded}"` : ''}
      ${isTrackerAdmin() ? 'draggable="true"' : ''}>
      <span class="topic-item__index">${displayNum}</span>
      <span class="topic-item__body">
        <span class="topic-item__heading">
          <span class="topic-item__label">${escapeHtml(topic.label)}</span>
        </span>
        ${topic.midtermScope && topic.midtermScopeNote ? `<span class="topic-item__midterm-note">${escapeHtml(topic.midtermScopeNote)}</span>` : ''}
        ${renderResourceLinks(topic, breakdownExpanded)}
        ${renderTopicBreakdown(subject, topic)}
      </span>
      ${renderTopicCompletionControls(subject, topic)}
      ${adminControls}
    </li>
  `
}

function renderTopicCards(subject, topics = getFilteredTopics(subject), options = {}) {
  if (!topics.length) {
    return `<li class="topic-empty">${options.emptyMessage || 'No topics match the current filters.'}</li>`
  }

  const collection = options.collection || subject.topics
  const sortedTopics = sortTopicsForDisplay(subject, topics, collection)
  let globalIndex = 0
  let previousSection = null

  return sortedTopics.map((topic) => {
    const sectionTitle = topic.section || ''
    const sectionMarkup = sectionTitle && sectionTitle !== previousSection
      ? `<li class="topic-section-subheading" style="--delay: ${getFastStaggerDelay(globalIndex)}">${sectionTitle}</li>`
      : ''
    previousSection = sectionTitle
    return sectionMarkup + renderTopicCard(subject, topic, globalIndex++, collection)
  }).join('')
}

function renderSubjectTrackTabs(subject) {
  const clinicalCount = getClinicalTopics(subject).length
  const tracks = [
    { key: 'theoretical', label: 'Theoretical', count: subject.topics.length },
    { key: 'clinical', label: 'Clinical', count: clinicalCount }
  ]

  return tracks.map((track) => `
    <button
      class="subject-track-tab${activeSubjectTrack === track.key ? ' active' : ''}"
      type="button"
      role="tab"
      aria-selected="${activeSubjectTrack === track.key}"
      data-subject-track="${track.key}"
      data-code="${subject.code}"
    >
      <span>${track.label}</span>
      <b>${track.count}</b>
    </button>
  `).join('')
}

function renderSubjectRevisionLauncher(subject) {
  if (subject.code !== 'MED-2') return ''

  return `
    <aside class="subject-revision-launcher" aria-label="Cardio and Chest Premium Revision Tool">
      <span class="subject-revision-launcher__title">Cardio &amp; Chest Premium Revision Tool</span>
      <a
        class="subject-revision-launcher__action"
        href="/cardio-chest-revision.html"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>Open</span>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </svg>
      </a>
    </aside>
  `
}

function renderSubjectTrackList(subject) {
  if (activeSubjectTrack === 'clinical') {
    const clinicalTopics = getClinicalTopics(subject)
    const visibleClinicalTopics = getFilteredClinicalTopics(subject)
    return renderTopicCards(subject, visibleClinicalTopics, {
      collection: clinicalTopics,
      emptyMessage: clinicalTopics.length
        ? 'No clinical round topics match the current filters.'
        : 'Clinical round topics have not been added from Drive yet.'
    })
  }

  const { scope } = getTrackerFilters()
  const emptyMessage = (scope === 'midterm' && subject.code === 'MED-1')
    ? 'Ø§Ù„ØªØ­Ø¯ÙŠØ¯Ø§Øª Ù„Ø³Ù‡ Ù…Ù†Ø²Ù„ØªØ´'
    : 'No topics match the current filters.'

  return renderTopicCards(subject, getFilteredTopics(subject), { emptyMessage })
}

function getSubjectGridColumnCount() {
  if (!mobileQuery.matches) return 1
  if (window.matchMedia('(max-width: 560px)').matches) return 2
  if (window.matchMedia('(min-width: 760px) and (max-width: 860px)').matches) return 4
  return 3
}

function renderSubjectInlineDetail(subject) {
  return `
    <div class="subject-inline-detail">
      <div class="subject-track-tabs subject-track-tabs--inline" role="tablist" aria-label="${subject.code} sections">
        ${renderSubjectTrackTabs(subject)}
      </div>
      ${renderSubjectRevisionLauncher(subject)}
      <ul class="topic-list topic-list--inline">
        ${renderSubjectTrackList(subject)}
      </ul>
    </div>
  `
}

function bindSubjectButtons(root = subjectList) {
  root.querySelectorAll('.subject-button').forEach((button) => {
    button.addEventListener('click', () => {
      setActiveSubject(button.dataset.code)
    })
  })
}

function updateSubjectButtonStates(subject) {
  subjectList.querySelectorAll('.subject-row').forEach((row) => {
    const button = row.querySelector('.subject-button')
    const isExpanded = button?.dataset.code === expandedSubjectCode
    row.classList.toggle('expanded', isExpanded)
    if (button) {
      const isActive = button.dataset.code === subject.code
      button.classList.toggle('active', isActive)
      button.setAttribute('aria-expanded', String(isExpanded))
      if (isActive) button.querySelector('.subject-button__updates')?.remove()
    }
  })
}

function updateMobileSubjectInlineDetail(subject) {
  subjectList.querySelector('.subject-inline-detail')?.remove()
  updateSubjectButtonStates(subject)
  if (!expandedSubjectCode) return

  const visibleSubjects = getFilteredSubjects()
  const subjectIndex = visibleSubjects.findIndex((item) => item.code === expandedSubjectCode)
  if (subjectIndex === -1) {
    renderSubjects()
    return
  }

  const columnCount = getSubjectGridColumnCount()
  const rowEndIndex = Math.min(visibleSubjects.length - 1, subjectIndex + (columnCount - 1 - (subjectIndex % columnCount)))
  const rowEndCode = visibleSubjects[rowEndIndex]?.code
  const rowEndButton = subjectList.querySelector(`.subject-button[data-code="${CSS.escape(rowEndCode)}"]`)
  const rowEnd = rowEndButton?.closest('.subject-row')
  if (!rowEnd) {
    renderSubjects()
    return
  }

  rowEnd.insertAdjacentHTML('afterend', renderSubjectInlineDetail(subject))
  const detail = rowEnd.nextElementSibling
  if (detail) bindSubjectTrackTabs(detail)
}

function getSubjectTrackTitle() {
  return activeSubjectTrack === 'clinical' ? 'Clinical rounds' : 'Topic list'
}

function getSubjectTrackCount(subject) {
  if (activeSubjectTrack === 'clinical') {
    const clinicalCount = getFilteredClinicalTopics(subject).length
    return `${clinicalCount} clinical`
  }

  return `${getFilteredTopics(subject).length} shown`
}

function bindSubjectTrackTabs(root = document) {
  root.querySelectorAll('[data-subject-track]').forEach((button) => {
    button.addEventListener('click', () => {
      const nextTrack = button.dataset.subjectTrack || 'theoretical'
      if (nextTrack !== activeSubjectTrack && trackerAdminState.dirtyCollections.has(getAdminCollectionKey())) {
        window.alert('Save this arrangement before switching topic sections.')
        return
      }
      activeSubjectTrack = nextTrack
      const code = button.dataset.code || activeSubjectCode
      if (code) setActiveSubject(code, 'open')
    })
  })
}

function ensureQuizModal() {
  let modal = document.getElementById('quiz-modal')
  if (modal) return modal

  modal = document.createElement('div')
  modal.id = 'quiz-modal'
  modal.className = 'quiz-modal'
  modal.setAttribute('aria-hidden', 'true')
  modal.innerHTML = `
    <div class="quiz-modal__backdrop" data-quiz-close></div>
    <section class="quiz-modal__panel" role="dialog" aria-modal="true" aria-labelledby="quiz-title">
      <div class="quiz-progress" aria-label="Quiz progress">
        <div class="quiz-progress__stats">
          <strong id="quiz-progress-count">0/0</strong>
        </div>
        <div class="quiz-progress__track">
        <span id="quiz-progress-fill"></span>
        </div>
      </div>
      <div class="study-pulse study-pulse--quiz" id="quiz-live-activity" aria-live="polite" hidden></div>
      <div class="quiz-modal__top">
        <span class="quiz-timer" id="quiz-timer" hidden role="timer" aria-label="Quiz timer" data-mood="neutral">
          <span class="quiz-robot__antenna" aria-hidden="true"><span></span></span>
          <span class="quiz-robot__head" aria-hidden="true">
            <span class="quiz-robot__face">
              <span class="quiz-robot__eyes"><i></i><i></i></span>
              <span class="quiz-robot__time" id="quiz-timer-value">0:00</span>
              <span class="quiz-robot__mouth"></span>
            </span>
          </span>
          <span class="quiz-robot__body" aria-hidden="true">
            <span class="quiz-robot__arm quiz-robot__arm--left"></span>
            <span class="quiz-robot__arm quiz-robot__arm--right"></span>
            <span class="quiz-robot__chest-light"></span>
            <span class="quiz-robot__foot quiz-robot__foot--left"></span>
            <span class="quiz-robot__foot quiz-robot__foot--right"></span>
          </span>
        </span>
        <div class="quiz-sound-picker">
          <button class="icon-button quiz-sound-toggle" type="button" data-quiz-sound-toggle
            aria-expanded="false" aria-haspopup="true" aria-controls="quiz-sound-menu">
            <img class="quiz-sound-toggle__pack-icon" data-quiz-sound-current-icon alt="" width="28" height="28">
            <svg class="quiz-sound-toggle__off" data-quiz-sound-muted-icon aria-hidden="true" viewBox="0 0 24 24">
              <path d="M11 5 6.5 9H3v6h3.5l4.5 4V5Z" />
              <path d="m15.5 10 5 5M20.5 10l-5 5" />
            </svg>
          </button>
          <div class="quiz-sound-menu" id="quiz-sound-menu" data-quiz-sound-menu
            role="radiogroup" aria-label="Answer sound pack" hidden>
            <p class="quiz-sound-menu__label">Answer sounds</p>
            <button class="quiz-sound-option" type="button" role="radio" data-quiz-sound-pack="muted">
              <span class="quiz-sound-option__muted" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M11 5 6.5 9H3v6h3.5l4.5 4V5Z" />
                  <path d="m15.5 10 5 5M20.5 10l-5 5" />
                </svg>
              </span>
              <span><strong>Muted</strong><small>No answer sounds</small></span>
            </button>
            <button class="quiz-sound-option" type="button" role="radio" data-quiz-sound-pack="valorant">
              <img src="/assets/icons/mcq-sound-pack-tactical-8dab919cc5ca.svg" alt="" width="36" height="36">
              <span><strong>Valorant</strong><small>Five-kill reward</small></span>
            </button>
            <button class="quiz-sound-option" type="button" role="radio" data-quiz-sound-pack="duolingo">
              <img src="/assets/icons/mcq-sound-pack-study-b445547bb66e.svg" alt="" width="36" height="36">
              <span><strong>Duolingo</strong><small>Study chimes</small></span>
            </button>
          </div>
        </div>
        <button class="icon-button" type="button" data-quiz-close aria-label="Close quiz">X</button>
      </div>
      <div class="quiz-modal__heading">
        <h2 id="quiz-title">MCQs</h2>
        <p class="quiz-modal__meta" id="quiz-meta">Choose a quiz.</p>
      </div>
      <div class="quiz-modal__body" id="quiz-body"></div>
      <div class="quiz-modal__actions">
        <button class="quiz-action" type="button" data-quiz-prev>Previous</button>
        <button class="quiz-action" type="button" data-quiz-reset>Reset</button>
        <button class="quiz-action quiz-action--primary" type="button" data-quiz-next>Next</button>
      </div>
      <div class="quiz-confetti" aria-hidden="true" id="quiz-confetti"></div>
    </section>
    <aside class="quiz-level-up" id="quiz-level-up" role="status" aria-live="polite" aria-atomic="true" hidden>
      <button class="quiz-level-up__dismiss" type="button" data-quiz-level-up-dismiss
        aria-label="Dismiss level-up celebration">×</button>
      <div class="quiz-level-up__particles" aria-hidden="true">
        <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
      </div>
      <p class="quiz-level-up__eyebrow">LEVEL UP</p>
      <div class="quiz-level-up__levels">
        <span data-level-up-previous>1</span>
        <svg viewBox="0 0 44 20" aria-hidden="true">
          <path d="M3 10h34M30 3l7 7-7 7"></path>
        </svg>
        <strong data-level-up-new>2</strong>
      </div>
      <p class="quiz-level-up__detail" data-level-up-detail></p>
    </aside>
  `
  document.body.appendChild(modal)
  ensureQuizFeedbackAudio()
  syncQuizSoundPicker()
  const panel = modal.querySelector('.quiz-modal__panel')
  if (panel) panel.addEventListener('scroll', updateQuizRobotCompactMode, { passive: true })
  if (typeof quizRobotCompactQuery.addEventListener === 'function') {
    quizRobotCompactQuery.addEventListener('change', updateQuizRobotCompactMode)
  } else {
    quizRobotCompactQuery.addListener(updateQuizRobotCompactMode)
  }
  return modal
}

function getQuizStorageKey(topicLabel, sourceId = quizState.sourceId || 'current', section = activeAcademicSection) {
  return `${QUIZ_STORAGE_PREFIX}::${getProgressStorageOwnerId()}::${activeUniversityId}::${section}::${encodeURIComponent(topicLabel)}::${encodeURIComponent(sourceId)}`
}

function createQuizAttemptId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const value = Math.floor(Math.random() * 16)
    const nibble = character === 'x' ? value : ((value & 0x3) | 0x8)
    return nibble.toString(16)
  })
}

function getLegacyQuizStorageKey(topicLabel, sourceId = quizState.sourceId || 'current') {
  return `${LEGACY_QUIZ_STORAGE_PREFIX}${encodeURIComponent(topicLabel)}::${encodeURIComponent(sourceId)}`
}

function normalizeSavedQuizState(savedState) {
  if (!savedState) return null
  return savedState.progress || savedState
}

function getSavedQuizState(topicLabel, sourceId = 'current') {
  const cloudState = studentProgressState.quizRows.get(getQuizProgressRecordKey(activeUniversityId, activeAcademicSection, topicLabel, sourceId))
  if (studentProgressState.user && cloudState) return normalizeSavedQuizState(cloudState)

  try {
    const savedRaw = localStorage.getItem(getQuizStorageKey(topicLabel, sourceId))
      || (canUseLegacyLocalProgress() ? localStorage.getItem(getUnscopedQuizStorageKey(topicLabel, sourceId)) : null)
      || (canUseLegacyLocalProgress() && activeAcademicSection === '401' ? localStorage.getItem(getLegacyQuizStorageKey(topicLabel, sourceId)) : null)
    return JSON.parse(savedRaw || 'null')
  } catch {
    localStorage.removeItem(getQuizStorageKey(topicLabel, sourceId))
    return null
  }
}

function buildQuizProgressPayload() {
  if (!quizState.topicLabel) return
  const questions = getCurrentQuiz()
  const totalQuestions = questions.length
  const answeredCount = Object.keys(quizState.answers || {}).length
  const wrongQuestionIds = questions
    .filter((question) => quizState.answers[question.id] !== undefined && quizState.answers[question.id] !== question.correctOptionId)
    .map((question) => question.id)

  return {
    topicLabel: quizState.topicLabel,
    sourceId: quizState.sourceId,
    sourceLabel: quizState.sourceLabel,
    index: quizState.index,
    answers: quizState.answers,
    completed: quizState.completed,
    order: quizState.order,
    questionOptionOrder: quizState.questionOptionOrder,
    missingQuestionIds: quizState.missingQuestionIds || [],
    masteredQuestionIds: quizState.masteredQuestionIds || [],
    timeLimitMinutes: quizState.timeLimitMinutes || null,
    timerEndsAt: quizState.timerEndsAt || null,
    timerStartedAt: quizState.timerStartedAt || null,
    timerElapsedMs: getQuizTimerElapsedMs(),
    attemptId: quizState.attemptId,
    attemptStartedAt: quizState.attemptStartedAt,
    score: quizState.completed ? getQuizScore() : null,
    totalQuestions,
    answeredCount,
    wrongQuestionIds,
    savedAt: new Date().toISOString()
  }
}

function getLifetimePointsFromLeaderboardRows(rows, userId) {
  const lifetimePoints = Number((rows || []).find((row) => row.user_id === userId)?.lifetime_score)
  return Number.isFinite(lifetimePoints) ? lifetimePoints : null
}

async function fetchLifetimePointsSnapshot(universityId, section, userId, { syncLeaderboard = false } = {}) {
  const rows = await fetchLeaderboard(universityId, section)
  if (
    syncLeaderboard
    && universityId === activeUniversityId
    && section === activeAcademicSection
    && studentProgressState.user?.id === userId
  ) {
    leaderboardState.requestId += 1
    leaderboardState.loading = false
    leaderboardState.rows = rows
    leaderboardState.university = universityId
    leaderboardState.section = section
    leaderboardState.lastFetched = Date.now()
    leaderboardState.error = ''
    renderLeaderboardHtml()
  }
  return getLifetimePointsFromLeaderboardRows(rows, userId)
}

function saveQuizState({ confirmLevelUp = false } = {}) {
  if (quizState.transient) return Promise.resolve(null)

  const payload = buildQuizProgressPayload()
  if (!payload) return Promise.resolve(null)

  localStorage.setItem(getQuizStorageKey(quizState.topicLabel), JSON.stringify(payload))
  studentProgressState.quizRows.set(getQuizProgressRecordKey(activeUniversityId, activeAcademicSection, quizState.topicLabel, quizState.sourceId), payload)
  updateGlobalProgress()

  if (!studentProgressState.user) return Promise.resolve(payload)

  const scoringContext = {
    userId: studentProgressState.user.id,
    universityId: activeUniversityId,
    section: activeAcademicSection,
    topicLabel: quizState.topicLabel,
    sourceId: quizState.sourceId || 'current',
    attemptKey: quizState.attemptId || quizState.attemptStartedAt,
    sessionGeneration: quizSessionGeneration
  }
  const shouldConfirmLevelUp = Boolean(confirmLevelUp && payload.completed)
  const progressSyncKey = `${scoringContext.userId}::${scoringContext.universityId}::${scoringContext.section}::${scoringContext.topicLabel}::${scoringContext.sourceId}`
  const levelUpSyncKey = `${scoringContext.userId}::${scoringContext.universityId}::${scoringContext.section}`

  const performSync = async () => {
    let previousLifetimePoints = null
    if (shouldConfirmLevelUp) {
      try {
        previousLifetimePoints = await fetchLifetimePointsSnapshot(
          scoringContext.universityId,
          scoringContext.section,
          scoringContext.userId
        )
      } catch (error) {
        console.warn('Could not capture the pre-score lifetime points. Level-up feedback will be skipped.', error)
      }
    }

    const savedProgress = await upsertUserQuizProgress({
      user_id: scoringContext.userId,
      university_id: scoringContext.universityId,
      section: scoringContext.section,
      topic_label: scoringContext.topicLabel,
      source_id: scoringContext.sourceId,
      source_label: payload.sourceLabel,
      progress: payload,
      completed: !!payload.completed,
      score: payload.score,
      total_questions: payload.totalQuestions,
      answered_count: payload.answeredCount,
      wrong_question_ids: payload.wrongQuestionIds,
      attempt_id: payload.attemptId,
      attempt_started_at: payload.attemptStartedAt,
      completed_at: payload.completed ? new Date().toISOString() : null
    })

    leaderboardState.lastFetched = 0
    liveActivityState.lastFetched = 0
    onlineStudentsState.lastFetched = 0

    let levelTransition = null
    if (shouldConfirmLevelUp && Number.isFinite(previousLifetimePoints)) {
      try {
        const nextLifetimePoints = await fetchLifetimePointsSnapshot(
          scoringContext.universityId,
          scoringContext.section,
          scoringContext.userId,
          { syncLeaderboard: true }
        )
        levelTransition = getConfirmedProfileLevelTransition({
          confirmed: true,
          completed: payload.completed,
          transient: false,
          previousPoints: previousLifetimePoints,
          nextPoints: nextLifetimePoints,
          resolveLevel: getProfileMasteryLevel
        })
      } catch (error) {
        console.warn('Could not confirm the updated lifetime points. Level-up feedback will be skipped.', error)
      }
    } else {
      await refreshLeaderboardIfActive(true)
    }

    if (levelTransition) showQuizLevelUpCelebration(levelTransition, scoringContext)

    await Promise.all([
      fetchAndRenderLiveActivity(true),
      sendStudentPresence(true)
    ])

    return savedProgress
  }

  const queuedSync = () => shouldConfirmLevelUp
    ? enqueueSerialTask(quizLevelUpSyncQueues, levelUpSyncKey, performSync)
    : performSync()

  const syncPromise = enqueueSerialTask(quizProgressSyncQueues, progressSyncKey, queuedSync).catch((error) => {
    studentProgressState.lastError = error.message
    renderStudentSyncUi()
    console.warn('MCQ progress cloud sync failed.', error)
    return null
  })

  return syncPromise
}

function clearSavedQuizState(topicLabel, sourceId = quizState.sourceId || 'current') {
  localStorage.removeItem(getQuizStorageKey(topicLabel, sourceId))
  studentProgressState.quizRows.delete(getQuizProgressRecordKey(activeUniversityId, activeAcademicSection, topicLabel, sourceId))
  updateGlobalProgress()

  if (studentProgressState.user) {
    deleteUserQuizProgress({
      user_id: studentProgressState.user.id,
      university_id: activeUniversityId,
      section: activeAcademicSection,
      topic_label: topicLabel,
      source_id: sourceId || 'current'
    })
      .then(() => {
        leaderboardState.lastFetched = 0
        return refreshLeaderboardIfActive(true)
      })
      .catch((error) => {
        studentProgressState.lastError = error.message
        renderStudentSyncUi()
        console.warn('MCQ progress cloud delete failed.', error)
      })
  }
}

function getSavedQuizStatus(topicLabel, source) {
  const savedState = getSavedQuizState(topicLabel, source.id)
  if (!savedState) return null

  const total = savedState.order?.length || source.quizSize || source.mcqs.length
  const answeredCount = Object.keys(savedState.answers || {}).length
  if (!total) return null

  return {
    completed: !!savedState.completed,
    score: Number.isFinite(savedState.score) ? savedState.score : null,
    wrongCount: Array.isArray(savedState.wrongQuestionIds) ? savedState.wrongQuestionIds.length : 0,
    answeredCount: Math.min(answeredCount, total),
    percent: Math.min(Math.round((answeredCount / total) * 100), 100),
    total,
    savedAt: savedState.savedAt || ''
  }
}

function getSavedQuizProgress(topicLabel, source) {
  const status = getSavedQuizStatus(topicLabel, source)
  return status && !status.completed && status.answeredCount ? status : null
}

function getCollectionParts(source) {
  return source?.collection?.groups?.flatMap((group) => group.parts || []) || []
}

function getCollectionProgressSummary(topicLabel, source) {
  const parts = getCollectionParts(source)
  if (!parts.length) return null

  let completedParts = 0
  let inProgressParts = 0
  let answeredCount = 0
  let total = 0

  parts.forEach((part) => {
    const status = getSavedQuizStatus(topicLabel, part)
    total += part.mcqs.length
    if (!status) return
    answeredCount += status.completed ? status.total : status.answeredCount
    if (status.completed) completedParts += 1
    else if (status.answeredCount) inProgressParts += 1
  })

  if (!completedParts && !inProgressParts) return null

  return {
    completed: completedParts === parts.length,
    completedParts,
    inProgressParts,
    partCount: parts.length,
    answeredCount,
    total,
    percent: total ? Math.round((answeredCount / total) * 100) : 0
  }
}

function getLatestCollectionAttempt(topicLabel, source) {
  return getCollectionParts(source)
    .map((part) => ({ part, status: getSavedQuizStatus(topicLabel, part) }))
    .filter(({ status }) => status && !status.completed && status.answeredCount)
    .sort((a, b) => new Date(b.status.savedAt || 0) - new Date(a.status.savedAt || 0))[0] || null
}

function formatQuizTimer(ms) {
  const safeMs = Math.max(ms, 0)
  const totalSeconds = Math.ceil(safeMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function getQuizTimerRemainingMs() {
  if (!quizState.timerEndsAt) return 0
  return new Date(quizState.timerEndsAt).getTime() - Date.now()
}

function getQuizTimerElapsedMs() {
  const savedElapsedMs = Number.isFinite(quizState.timerElapsedMs) ? quizState.timerElapsedMs : 0
  if (!quizState.timerStartedAt) return savedElapsedMs
  const currentSessionMs = Date.now() - new Date(quizState.timerStartedAt).getTime()
  return savedElapsedMs + Math.max(currentSessionMs, 0)
}

function pauseQuizCountupTimer() {
  if (quizState.timeLimitMinutes || !quizState.timerStartedAt) return
  quizState.timerElapsedMs = getQuizTimerElapsedMs()
  quizState.timerStartedAt = null
}

function clearQuizTimerInterval() {
  if (!quizTimerInterval) return
  clearInterval(quizTimerInterval)
  quizTimerInterval = null
}

function clearQuizRobotMoodTimeout() {
  if (!quizRobotMoodTimeout) return
  clearTimeout(quizRobotMoodTimeout)
  quizRobotMoodTimeout = null
}

function getSavedQuizSoundPack() {
  try {
    const savedPack = localStorage.getItem(QUIZ_SOUND_PACK_STORAGE_KEY)
    if (savedPack && QUIZ_SOUND_PACKS[savedPack]) return savedPack

    const migratedPack = localStorage.getItem(LEGACY_QUIZ_SOUND_STORAGE_KEY) === 'false'
      ? 'muted'
      : 'duolingo'
    localStorage.setItem(QUIZ_SOUND_PACK_STORAGE_KEY, migratedPack)
    return migratedPack
  } catch {
    return 'duolingo'
  }
}

function createQuizFeedbackAudio(url) {
  const audio = new window.Audio(url)
  audio.preload = 'auto'
  audio.volume = 0.65
  return audio
}

function ensureQuizFeedbackAudio(packId = quizSoundPack) {
  if (typeof window.Audio !== 'function' || packId === 'muted') return null

  if (!quizFeedbackAudio.incorrect) {
    quizFeedbackAudio.incorrect = createQuizFeedbackAudio(QUIZ_SHARED_INCORRECT_AUDIO_URL)
  }

  if (!quizFeedbackAudio.packs.has(packId)) {
    const pack = QUIZ_SOUND_PACKS[packId]
    if (!pack) return null
    quizFeedbackAudio.packs.set(packId, {
      correct: pack.correctUrls.map(createQuizFeedbackAudio),
      completion: pack.completionUrl ? createQuizFeedbackAudio(pack.completionUrl) : null,
      levelUp: pack.levelUpUrl ? createQuizFeedbackAudio(pack.levelUpUrl) : null
    })
  }

  return {
    ...quizFeedbackAudio.packs.get(packId),
    incorrect: quizFeedbackAudio.incorrect
  }
}

function stopQuizFeedbackAudio() {
  stopExclusiveAudioPlayback(quizFeedbackAudio)
}

function resetQuizFeedbackSequence() {
  stopQuizFeedbackAudio()
  quizFeedbackAudio.correctStreak = 0
}

function syncQuizSoundPicker() {
  const button = document.querySelector('[data-quiz-sound-toggle]')
  if (!button) return

  const pack = QUIZ_SOUND_PACKS[quizSoundPack] || QUIZ_SOUND_PACKS.duolingo
  const label = `Answer sounds: ${pack.label}. Choose sound pack`
  const currentIcon = button.querySelector('[data-quiz-sound-current-icon]')
  const mutedIcon = button.querySelector('[data-quiz-sound-muted-icon]')
  const menu = document.querySelector('[data-quiz-sound-menu]')

  if (currentIcon) {
    currentIcon.hidden = quizSoundPack === 'muted'
    currentIcon.src = pack.iconUrl || ''
  }
  if (mutedIcon) mutedIcon.hidden = quizSoundPack !== 'muted'

  button.setAttribute('aria-expanded', String(quizSoundMenuOpen))
  button.setAttribute('aria-label', label)
  button.setAttribute('title', label)
  if (menu) menu.hidden = !quizSoundMenuOpen

  document.querySelectorAll('[data-quiz-sound-pack]').forEach((option) => {
    const selected = option.dataset.quizSoundPack === quizSoundPack
    option.setAttribute('aria-checked', String(selected))
    option.classList.toggle('quiz-sound-option--selected', selected)
  })
}

function setQuizSoundMenuOpen(open) {
  quizSoundMenuOpen = Boolean(open)
  syncQuizSoundPicker()
}

function setQuizSoundPack(packId) {
  if (!QUIZ_SOUND_PACKS[packId]) return

  if (packId !== quizSoundPack) {
    stopQuizFeedbackAudio()
    quizSoundPack = packId
  }
  quizSoundMenuOpen = false

  try {
    localStorage.setItem(QUIZ_SOUND_PACK_STORAGE_KEY, quizSoundPack)
  } catch {
    // The in-memory preference still applies when local storage is unavailable.
  }

  ensureQuizFeedbackAudio()
  syncQuizSoundPicker()
}

function playQuizFeedbackAudio(audio) {
  return playExclusiveAudioPlayback(quizFeedbackAudio, audio)
}

function playQuizFeedbackSound(isCorrect) {
  if (isCorrect) quizFeedbackAudio.correctStreak += 1
  else quizFeedbackAudio.correctStreak = 0
  if (!soundPackAllowsPlayback(quizSoundPack)) return

  const feedbackAudio = ensureQuizFeedbackAudio()
  if (!feedbackAudio) return
  let audio = feedbackAudio.incorrect

  if (isCorrect) {
    if (!feedbackAudio.correct.length) return
    const soundIndex = quizSoundPack === 'valorant'
      ? Math.min(quizFeedbackAudio.correctStreak, feedbackAudio.correct.length) - 1
      : 0
    audio = feedbackAudio.correct[soundIndex]
  }

  playQuizFeedbackAudio(audio)
}

function playQuizCompletionSound() {
  if (!soundPackAllowsPlayback(quizSoundPack)) return
  playQuizFeedbackAudio(ensureQuizFeedbackAudio()?.completion)
}

function playQuizLevelUpSound() {
  if (!soundPackAllowsPlayback(quizSoundPack)) return
  playQuizFeedbackAudio(ensureQuizFeedbackAudio()?.levelUp)
}

function resetQuizRobotMood(timer = document.getElementById('quiz-timer')) {
  clearQuizRobotMoodTimeout()
  if (timer) timer.dataset.mood = 'neutral'
}

function updateQuizRobotCompactMode() {
  const modal = document.getElementById('quiz-modal')
  const panel = modal?.querySelector('.quiz-modal__panel')
  const timer = modal?.querySelector('#quiz-timer')
  if (!panel || !timer) return

  const compact = quizRobotCompactQuery.matches || panel.scrollTop > 64
  timer.classList.toggle('quiz-timer--compact', compact)
}

function triggerQuizRobotMood(mood, duration = 950) {
  const timer = document.getElementById('quiz-timer')
  if (!timer || timer.hidden) return

  resetQuizRobotMood(timer)
  timer.dataset.mood = mood
  quizRobotMoodTimeout = setTimeout(() => {
    timer.dataset.mood = 'neutral'
    quizRobotMoodTimeout = null
  }, duration)
}

function setQuizTimerText(timer, value, label) {
  const timerValue = timer.querySelector('#quiz-timer-value')
  if (timerValue) timerValue.textContent = value
  timer.setAttribute('aria-label', `${label} ${value}`)
}

function updateQuizTimerDisplay({ allowExpire = false } = {}) {
  const modal = ensureQuizModal()
  const timer = modal.querySelector('#quiz-timer')
  if (!timer) return

  if (quizState.completed || (!quizState.timeLimitMinutes && !quizState.timerStartedAt)) {
    setQuizTimerText(timer, '', 'Quiz timer')
    timer.hidden = true
    timer.style.removeProperty('--quiz-timer-progress')
    timer.classList.remove('quiz-timer--countup', 'quiz-timer--warning')
    resetQuizRobotMood(timer)
    clearQuizTimerInterval()
    return
  }

  if (!quizState.timeLimitMinutes) {
    const elapsedTime = formatQuizTimer(getQuizTimerElapsedMs())
    timer.hidden = false
    setQuizTimerText(timer, elapsedTime, 'Elapsed quiz time')
    timer.style.setProperty('--quiz-timer-progress', '100%')
    timer.classList.add('quiz-timer--countup')
    timer.classList.remove('quiz-timer--warning')
    updateQuizRobotCompactMode()
    return
  }

  const remainingMs = getQuizTimerRemainingMs()
  const totalMs = quizState.timeLimitMinutes * 60000
  const timerProgress = totalMs ? Math.max(Math.min(remainingMs / totalMs, 1), 0) : 0
  const remainingTime = formatQuizTimer(remainingMs)
  timer.hidden = false
  setQuizTimerText(timer, remainingTime, 'Quiz time remaining')
  timer.style.setProperty('--quiz-timer-progress', `${timerProgress * 100}%`)
  timer.classList.remove('quiz-timer--countup')
  timer.classList.toggle('quiz-timer--warning', remainingMs <= 120000)
  updateQuizRobotCompactMode()

  if (remainingMs > 0 || !allowExpire) return

  quizState.completed = true
  quizState.showResumePrompt = false
  quizState.missingQuestionIds = []
  saveQuizState({ confirmLevelUp: quizState.validatedInSession })
  clearQuizTimerInterval()
  renderQuizQuestion()
}

function startQuizTimer() {
  clearQuizTimerInterval()
  resetQuizRobotMood()
  updateQuizTimerDisplay()

  if (quizState.completed || (!quizState.timeLimitMinutes && !quizState.timerStartedAt)) return

  quizTimerInterval = setInterval(() => {
    updateQuizTimerDisplay({ allowExpire: true })
  }, 1000)
}

function hideQuizTimer() {
  const modal = ensureQuizModal()
  const timer = modal.querySelector('#quiz-timer')
  if (timer) {
    setQuizTimerText(timer, '', 'Quiz timer')
    timer.hidden = true
    timer.style.removeProperty('--quiz-timer-progress')
    timer.classList.remove('quiz-timer--countup', 'quiz-timer--warning')
    resetQuizRobotMood(timer)
  }
  clearQuizTimerInterval()
}

function shuffleArray(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function getQuizSources(topicLabel) {
  const sectionQuizzes = getMcqQuizzesForSection()
  const raw = sectionQuizzes[topicLabel]
  if (!raw) return []

  if (raw.sources?.length) {
    return raw.sources.map((source, index) => ({
      id: source.id || `source-${index}`,
      label: source.label || `MCQ source ${index + 1}`,
      description: source.description || '',
      mcqs: source.mcqs || [],
      quizSize: source.quizSize || raw.quizSize || null,
      shuffleQuestions: source.shuffleQuestions ?? raw.shuffleQuestions ?? false,
      shuffleOptions: source.shuffleOptions ?? raw.shuffleOptions ?? false,
      timeLimitMinutes: source.timeLimitMinutes || raw.timeLimitMinutes || null,
      collection: source.collection || null,
      parentSourceId: source.parentSourceId || null,
      groupId: source.groupId || null,
      groupLabel: source.groupLabel || '',
      partIndex: Number.isInteger(source.partIndex) ? source.partIndex : null,
      partCount: Number.isInteger(source.partCount) ? source.partCount : null,
      mode: source.mode || 'standard'
    })).filter((source) => source.mcqs.length || source.collection)
  }

  if (Array.isArray(raw)) {
    return [{
      id: 'current',
      label: 'Current MCQs',
      mcqs: raw,
      quizSize: raw.quizSize || null,
      shuffleQuestions: raw.shuffleQuestions || false,
      shuffleOptions: raw.shuffleOptions || false,
      timeLimitMinutes: raw.timeLimitMinutes || null
    }]
  }

  return [{
    id: 'current',
    label: raw.label || 'Current MCQs',
    description: raw.description || '',
    mcqs: raw.mcqs || [],
    quizSize: raw.quizSize || null,
    shuffleQuestions: raw.shuffleQuestions || false,
    shuffleOptions: raw.shuffleOptions || false,
    timeLimitMinutes: raw.timeLimitMinutes || null
  }].filter((source) => source.mcqs.length)
}

function getQuizConfig(topicLabel, sourceId = 'current') {
  const sources = getQuizSources(topicLabel)
  const dynamicConfig = dynamicQuizConfigs.get(`${activeUniversityId}::${activeAcademicSection}::${topicLabel}::${sourceId}`)
  if (dynamicConfig) return dynamicConfig

  const directSource = sources.find((source) => source.id === sourceId)
  if (directSource) return directSource

  const nestedPart = sources
    .flatMap((source) => getCollectionParts(source))
    .find((part) => part.id === sourceId)

  return nestedPart || sources[0] || null
}

function getQuizSource(topicLabel, sourceId) {
  return getQuizSources(topicLabel).find((source) => source.id === sourceId) || null
}

function registerDynamicQuizConfig(topicLabel, config) {
  dynamicQuizConfigs.set(`${activeUniversityId}::${activeAcademicSection}::${topicLabel}::${config.id}`, config)
  return config
}

function shouldShowQuizSourcePicker(topicLabel) {
  const sectionQuizzes = getMcqQuizzesForSection()
  return Boolean(sectionQuizzes[topicLabel]?.alwaysShowSourcePicker)
}

function normalizeQuestion(question, index) {
  const options = Array.isArray(question.options)
    ? question.options.map((option) => ({ id: option.id, text: option.text }))
    : (question.choices || []).map((choice, choiceIndex) => ({
      id: String.fromCharCode(97 + choiceIndex),
      text: choice
    }))

  const correctOptionId = question.correctOptionId || (
    typeof question.answerIndex === 'number' && options[question.answerIndex]
      ? options[question.answerIndex].id
      : options[0]?.id
  )

  return {
    id: question.id || `q${index}`,
    question: question.question,
    options,
    correctOptionId,
    explanation: question.explanation || '',
    source: question.source || '',
    section: question.section || '',
    organ: question.organ || '',
    originalNumber: question.originalNumber || null,
    topicTags: question.topicTags || []
  }
}

function getFirstUnansweredQuestion() {
  return getCurrentQuiz().find((question) => quizState.answers[question.id] === undefined) || null
}

function getTopicData(topicLabel) {
  return subjects.flatMap((subject) => subject.topics).find((topic) => (topic.mcqTopicKey || topic.label) === topicLabel || topic.label === topicLabel)
}

function initializeQuiz(topicLabel, {
  sourceId = 'current',
  useSaved = false,
  fresh = false,
  shuffleQuestionsOverride = null,
  promptOnSaved = true
} = {}) {
  dismissQuizLevelUpCelebration()
  quizSessionGeneration += 1
  resetQuizFeedbackSequence()
  const config = getQuizConfig(topicLabel, sourceId)
  if (!config || !config.mcqs.length) return false

  const normalizedQuestions = config.mcqs.map(normalizeQuestion)
  let order = normalizedQuestions.map((question) => question.id)
  let questionOptionOrder = {}
  let index = 0
  let answers = {}
  let completed = false
  let masteredQuestionIds = []

  const savedState = useSaved ? getSavedQuizState(topicLabel, config.id) : null
  if (savedState && !fresh && config.mode === 'wrong-review') {
    order = normalizedQuestions.map((question) => question.id)
    masteredQuestionIds = savedState.masteredQuestionIds || []
  } else if (savedState && !fresh) {
    order = savedState.order || order
    questionOptionOrder = savedState.questionOptionOrder || {}
    answers = savedState.answers || {}
    index = Number.isInteger(savedState.index) ? savedState.index : 0
    completed = !!savedState.completed
    masteredQuestionIds = savedState.masteredQuestionIds || []
  } else {
    let questionPool = [...normalizedQuestions]
    if (shuffleQuestionsOverride ?? config.shuffleQuestions) {
      questionPool = shuffleArray(questionPool)
    }
    if (config.quizSize && config.quizSize < questionPool.length) {
      questionPool = questionPool.slice(0, config.quizSize)
    }
    order = questionPool.map((question) => question.id)
    if (config.shuffleOptions) {
      questionPool.forEach((question) => {
        questionOptionOrder[question.id] = shuffleArray(question.options.map((option) => option.id))
      })
    }
  }

  const questions = order
    .map((id) => normalizedQuestions.find((question) => question.id === id))
    .filter(Boolean)

  quizState.topicLabel = topicLabel
  quizState.sourceId = config.id
  quizState.sourceLabel = config.label
  quizState.parentSourceId = config.parentSourceId || null
  quizState.groupId = config.groupId || null
  quizState.groupLabel = config.groupLabel || ''
  quizState.partIndex = Number.isInteger(config.partIndex) ? config.partIndex : null
  quizState.partCount = Number.isInteger(config.partCount) ? config.partCount : null
  quizState.mode = config.mode || 'standard'
  quizState.index = Math.min(index, Math.max(0, questions.length - 1))
  quizState.answers = answers
  quizState.completed = completed
  quizState.order = order
  quizState.questionOptionOrder = questionOptionOrder
  quizState.questions = questions
  quizState.showResumePrompt = false
  quizState.missingQuestionIds = savedState?.missingQuestionIds || []
  quizState.masteredQuestionIds = masteredQuestionIds
  quizState.lectureUrls = getTopicData(topicLabel)?.lectureUrls || []
  quizState.timeLimitMinutes = config.timeLimitMinutes || null
  quizState.timerEndsAt = null
  quizState.timerStartedAt = null
  quizState.timerElapsedMs = 0
  quizState.attemptId = savedState && !fresh ? (savedState.attemptId || null) : createQuizAttemptId()
  quizState.attemptStartedAt = savedState && !fresh ? (savedState.attemptStartedAt || null) : new Date().toISOString()
  quizState.validatedInSession = false
  quizState.transient = !!config.transient

  if (quizState.timeLimitMinutes && !completed) {
    const savedTimerEndsAt = savedState?.timerEndsAt ? new Date(savedState.timerEndsAt).getTime() : NaN
    quizState.timerEndsAt = savedState && Number.isFinite(savedTimerEndsAt)
      ? savedState.timerEndsAt
      : new Date(Date.now() + quizState.timeLimitMinutes * 60000).toISOString()
  } else if (!completed) {
    const savedElapsedMs = Number(savedState?.timerElapsedMs)
    quizState.timerElapsedMs = savedState && Number.isFinite(savedElapsedMs)
      ? Math.max(savedElapsedMs, 0)
      : 0
    quizState.timerStartedAt = new Date().toISOString()
  }

  if (savedState && !fresh && !savedState.completed && useSaved && promptOnSaved && config.mode !== 'wrong-review') {
    quizState.showResumePrompt = true
    pauseQuizCountupTimer()
  }

  return true
}

function getCurrentQuiz() {
  return quizState.questions || []
}

function getCurrentQuestion() {
  return getCurrentQuiz()[quizState.index]
}

function getQuizScore() {
  return Object.entries(quizState.answers).reduce((score, [questionId, selectedOptionId]) => {
    const question = getCurrentQuiz().find((item) => item.id === questionId)
    return question && question.correctOptionId === selectedOptionId ? score + 1 : score
  }, 0)
}

function getQuizProgressStats() {
  const quiz = getCurrentQuiz()
  return calculateQuizProgress(
    quiz.map((question) => question.id),
    Object.keys(quizState.answers)
  )
}

function getPerformanceLabel(score, total) {
  const percent = total ? Math.round((score / total) * 100) : 0
  if (percent >= 90) return 'Excellent'
  if (percent >= 70) return 'Good'
  if (percent >= 50) return 'Needs review'
  return 'Repeat this topic'
}

function getOptionOrder(question) {
  return quizState.questionOptionOrder[question.id] || question.options.map((option) => option.id)
}

function getOptionById(question, optionId) {
  return question.options.find((option) => option.id === optionId)
}

function getMissedQuestions() {
  return getCurrentQuiz().filter((question) => !quizState.answers[question.id])
}

function getCurrentWrongQuestionIds() {
  return getCurrentQuiz()
    .filter((question) => quizState.answers[question.id] !== undefined && quizState.answers[question.id] !== question.correctOptionId)
    .map((question) => question.id)
}

function getCollectionWrongQuestionIds(topicLabel, source) {
  const wrongIds = new Set()
  const trackSource = (config) => {
    const state = getSavedQuizState(topicLabel, config.id)
    ;(state?.wrongQuestionIds || []).forEach((questionId) => wrongIds.add(questionId))
  }

  getCollectionParts(source).forEach(trackSource)
  ;(source.collection?.mixedSizes || []).forEach((mode) => {
    trackSource({ id: `${source.id}-mixed-${mode.size}` })
  })

  const reviewId = source.collection?.wrongReviewId
  const reviewState = reviewId ? getSavedQuizState(topicLabel, reviewId) : null
  ;(reviewState?.masteredQuestionIds || []).forEach((questionId) => wrongIds.delete(questionId))

  return source.mcqs.filter((question) => wrongIds.has(question.id)).map((question) => question.id)
}

function createMixedQuizConfig(topicLabel, source, mode) {
  return registerDynamicQuizConfig(topicLabel, {
    id: `${source.id}-mixed-${mode.size}`,
    label: mode.label,
    description: mode.description,
    parentSourceId: source.id,
    mode: 'mixed',
    mcqs: source.mcqs,
    quizSize: mode.size,
    shuffleQuestions: true,
    shuffleOptions: false,
    timeLimitMinutes: null
  })
}

function createWrongReviewQuizConfig(topicLabel, source) {
  const wrongIds = new Set(getCollectionWrongQuestionIds(topicLabel, source))
  const questions = source.mcqs.filter((question) => wrongIds.has(question.id))
  return registerDynamicQuizConfig(topicLabel, {
    id: source.collection?.wrongReviewId || `${source.id}-wrong-review`,
    label: 'Review Wrong Answers',
    description: 'Questions previously answered incorrectly.',
    parentSourceId: source.id,
    mode: 'wrong-review',
    mcqs: questions,
    shuffleQuestions: false,
    shuffleOptions: false,
    timeLimitMinutes: null
  })
}

function createPartWrongReviewQuizConfig() {
  const wrongIds = new Set(getCurrentWrongQuestionIds())
  const questions = getCurrentQuiz().filter((question) => wrongIds.has(question.id))
  return registerDynamicQuizConfig(quizState.topicLabel, {
    id: `${quizState.sourceId}-${quizState.attemptId || 'current'}-wrong-review`,
    label: 'Review Wrong Answers',
    description: 'Questions answered incorrectly in this completed part.',
    parentSourceId: quizState.parentSourceId,
    groupId: quizState.groupId,
    groupLabel: quizState.groupLabel,
    partIndex: quizState.partIndex,
    partCount: quizState.partCount,
    mode: 'part-wrong-review',
    mcqs: questions,
    shuffleQuestions: false,
    shuffleOptions: false,
    timeLimitMinutes: null,
    transient: true
  })
}

function getCurrentCollectionSource() {
  if (!quizState.topicLabel || !quizState.parentSourceId) return null
  return getQuizSource(quizState.topicLabel, quizState.parentSourceId)
}

function getCurrentCollectionGroup() {
  const source = getCurrentCollectionSource()
  return source?.collection?.groups?.find((group) => group.id === quizState.groupId) || null
}

function getNextCollectionPart() {
  const group = getCurrentCollectionGroup()
  if (!group || !Number.isInteger(quizState.partIndex)) return null
  return group.parts[quizState.partIndex + 1] || null
}

function scrollToQuizQuestion(questionId) {
  const modal = ensureQuizModal()
  const questionCard = modal.querySelector(`[data-quiz-card="${CSS.escape(questionId)}"]`)
  if (!questionCard) return

  const panel = modal.querySelector('.quiz-modal__panel')
  if (panel) {
    const panelRect = panel.getBoundingClientRect()
    const questionRect = questionCard.getBoundingClientRect()
    panel.scrollTo({
      top: Math.max(panel.scrollTop + questionRect.top - panelRect.top - QUIZ_STICKY_OFFSET, 0),
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    })
  } else {
    questionCard.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' })
  }

  const firstChoice = questionCard.querySelector('[data-quiz-answer]')
  if (firstChoice) firstChoice.focus({ preventScroll: true })
}

function scrollToNextQuizQuestion(answeredQuestionId) {
  const quiz = getCurrentQuiz()
  const questionIndex = quiz.findIndex((question) => question.id === answeredQuestionId)
  const nextQuestion = quiz[questionIndex + 1]
  if (!nextQuestion) return

  setTimeout(() => {
    const modal = ensureQuizModal()
    const panel = modal.querySelector('.quiz-modal__panel')
    const questionCard = modal.querySelector(`[data-quiz-card="${CSS.escape(nextQuestion.id)}"]`)
    if (!panel || !questionCard) return

    const panelRect = panel.getBoundingClientRect()
    const questionRect = questionCard.getBoundingClientRect()
    panel.scrollTo({
      top: Math.max(panel.scrollTop + questionRect.top - panelRect.top - QUIZ_STICKY_OFFSET, 0),
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    })
  }, 450)
}

function renderQuizActions() {
  const modal = ensureQuizModal()
  const actions = modal.querySelector('.quiz-modal__actions')
  if (!actions) return

  if (quizState.showResumePrompt) {
    actions.innerHTML = ''
    return
  }

  if (quizState.completed) {
    const collectionSource = getCurrentCollectionSource()
    const nextPart = getNextCollectionPart()
    const groupNoun = collectionSource?.collection?.groupNoun || 'organ'
    const collectionLabel = collectionSource?.label || 'collection'
    const wrongReviewCount = collectionSource
      ? getCurrentWrongQuestionIds().length
      : 0

    actions.innerHTML = `
      ${quizState.groupId ? `<button class="quiz-action" type="button" data-quiz-back-group>Back to ${escapeHtml(groupNoun)}</button>` : ''}
      ${collectionSource && !quizState.groupId ? `<button class="quiz-action" type="button" data-quiz-back-collection>Back to ${escapeHtml(collectionLabel)}</button>` : ''}
      ${wrongReviewCount && !['wrong-review', 'part-wrong-review'].includes(quizState.mode) ? `<button class="quiz-action" type="button" data-quiz-review-wrong>Wrong answers (${wrongReviewCount})</button>` : ''}
      <button class="quiz-action" type="button" data-quiz-retake>Retake quiz</button>
      ${nextPart ? '<button class="quiz-action quiz-action--primary" type="button" data-quiz-next-part>Next part</button>' : ''}
      <button class="quiz-action${nextPart ? '' : ' quiz-action--primary'}" type="button" data-quiz-close>Close</button>
    `
    return
  }

  actions.innerHTML = `
    <button class="quiz-action" type="button" data-quiz-reset>Reset</button>
    <button class="quiz-action quiz-action--primary" type="button" data-quiz-submit>Submit</button>
  `
}

function renderQuizMeta() {
  const modal = ensureQuizModal()
  const title = modal.querySelector('#quiz-title')
  const meta = modal.querySelector('#quiz-meta')
  const fill = modal.querySelector('#quiz-progress-fill')
  const progressCount = modal.querySelector('#quiz-progress-count')
  const quiz = getCurrentQuiz()
  const score = getQuizScore()
  const { answeredCount, percent, total } = getQuizProgressStats()
  const collectionSource = getCurrentCollectionSource()
  const collectionLabel = collectionSource?.label || 'MCQs'
  const collectionLocation = quizState.groupLabel
    ? `${collectionLabel} · ${quizState.groupLabel}`
    : collectionLabel

  if (title) {
    title.textContent = quizState.parentSourceId
      ? quizState.sourceLabel
      : (quizState.topicLabel || 'Quiz')
  }
  if (progressCount) progressCount.textContent = `${answeredCount}/${total}`
  if (fill) fill.style.width = `${percent}%`
  const progress = modal.querySelector('.quiz-progress')
  if (progress) progress.style.setProperty('--quiz-progress-percent', `${percent}%`)
  updateQuizTimerDisplay()

  if (quizState.showResumePrompt) {
    if (meta) meta.textContent = `${quizState.sourceLabel} - resume your previous attempt or start over.`
    return
  }

  if (quizState.completed) {
    const scorePercent = quiz.length ? Math.round((score / quiz.length) * 100) : 0
    if (meta) {
      meta.textContent = `${quizState.parentSourceId ? collectionLocation + ' · ' : ''}Final score ${score} / ${quiz.length} (${scorePercent}%)`
    }
    return
  }

  const missedCount = quizState.missingQuestionIds?.length || 0
  if (meta) {
    const location = quizState.parentSourceId ? `${collectionLocation} · ` : ''
    meta.textContent = missedCount
      ? `${location}${missedCount} unanswered question${missedCount === 1 ? '' : 's'}`
      : `${location}${answeredCount} / ${quiz.length} answered`
  }
}

function getStudentFacingQuizSection(question) {
  const label = question.organ || question.category || question.section || ''
  return String(label)
    .split(/\s+[·|]\s+/)[0]
    .replace(/\s*[-–—]\s*(?:p(?:age)?\.?\s*)?\d+.*$/i, '')
    .trim()
}

function renderQuizQuestion() {
  const modal = ensureQuizModal()
  const body = modal.querySelector('#quiz-body')
  const quiz = getCurrentQuiz()
  const score = getQuizScore()
  const missedIds = new Set(quizState.missingQuestionIds || [])

  renderQuizMeta()
  renderQuizActions()

  if (!quiz.length) {
    body.innerHTML = '<article class="quiz-card"><p class="quiz-question">No questions available.</p></article>'
    return
  }

  const resultBanner = quizState.completed ? `
    <article class="quiz-card quiz-result-banner">
      <p class="quiz-summary__score">${score} / ${quiz.length}</p>
      <p class="quiz-summary__percent">${Math.round((score / Math.max(quiz.length, 1)) * 100)}%</p>
      <p class="quiz-summary__performance">${getPerformanceLabel(score, quiz.length)}</p>
    </article>
  ` : ''

  const questionCards = quiz.map((question, questionIndex) => {
    const selectedOptionId = quizState.answers[question.id]
    const optionOrder = getOptionOrder(question)
    const missed = missedIds.has(question.id)
    const isAnswered = selectedOptionId !== undefined
    const shouldReveal = quizState.completed || isAnswered
    const citation = resolveCitation(question.id)
    const citedPassageId = citation?.passageIds?.[0] || ''
    const sourceAction = citation?.verified ? `
      <div class="quiz-question__source-row">
        <button type="button" class="quiz-action--source-link"
          data-open-source="${escapeHtml(question.id)}"
          data-topic-id="${escapeHtml(citation.topicId)}"
          data-section-id="${escapeHtml(citation.sectionId || '')}"
          data-passage-id="${escapeHtml(citedPassageId)}"
          data-highlight-text="${escapeHtml(citation.highlightText || '')}">Open Source</button>
      </div>
    ` : ''

    const choices = optionOrder.map((optionId, optionIndex) => {
      const option = getOptionById(question, optionId)
      const isCorrect = option && option.id === question.correctOptionId
      const isSelected = option && option.id === selectedOptionId
      let stateClass = ''

      if (shouldReveal) {
        if (isCorrect) stateClass = ' quiz-choice--correct'
        else if (isSelected) stateClass = ' quiz-choice--wrong'
      } else if (isSelected) {
        stateClass = ' quiz-choice--selected'
      }

      return `
        <button class="quiz-choice${stateClass}" type="button" data-quiz-question="${escapeHtml(question.id)}" data-quiz-answer="${escapeHtml(option.id)}" ${shouldReveal ? 'disabled' : ''} ${isSelected ? 'data-quiz-selected="true"' : ''}>
          <span>${String.fromCharCode(65 + optionIndex)}</span>
          ${escapeHtml(option.text)}
        </button>
      `
    }).join('')

    const correctOption = getOptionById(question, question.correctOptionId)
    const studentFacingSection = getStudentFacingQuizSection(question)

    return `
      <article class="quiz-card quiz-question-card${missed ? ' quiz-question-card--missed' : ''}" data-quiz-card="${escapeHtml(question.id)}">
        ${studentFacingSection ? `<p class="quiz-question__section">${escapeHtml(studentFacingSection)}</p>` : ''}
        <p class="quiz-question"><strong>Q${questionIndex + 1}.</strong> ${escapeHtml(question.question)}</p>
        ${sourceAction}
        ${missed ? '<p class="quiz-missed-note">Answer this question before submitting.</p>' : ''}
        <div class="quiz-choices">${choices}</div>
        ${shouldReveal ? (() => {
          if (citation && citation.verified) {
            const isCorrect = selectedOptionId === question.correctOptionId
            const correctText = citation.explanation?.correct?.text || question.explanation
            const wrongText = (!isCorrect && citation.explanation?.incorrect?.[selectedOptionId]?.text) ? citation.explanation.incorrect[selectedOptionId].text : null
            const sourceBreadcrumb = [citation.subjectTitle, citation.topicTitle, citation.sectionTitle].filter(Boolean).join(' › ')

            return `
              <div class="quiz-feedback-block">
                <div class="quiz-feedback-block__status ${isCorrect ? 'quiz-feedback-block__status--correct' : 'quiz-feedback-block__status--wrong'}">
                  ${isCorrect ? '✓ Correct' : '✕ Incorrect'}
                </div>
                <div class="quiz-feedback-block__rationale">
                  <strong>Why the correct answer is right:</strong>
                  <p>${escapeHtml(correctText)}</p>
                  ${wrongText ? `
                    <strong>Why your answer is wrong:</strong>
                    <p>${escapeHtml(wrongText)}</p>
                  ` : ''}
                </div>
                <div class="quiz-feedback-block__footer">
                  <span class="quiz-feedback-block__breadcrumb">${escapeHtml(sourceBreadcrumb)}</span>
                </div>
              </div>
            `
          }
          return `
            <div class="quiz-explanation">
              <strong>${selectedOptionId === question.correctOptionId ? 'Correct.' : 'Correct answer: ' + escapeHtml(correctOption?.text || '')}</strong>
              <p>${escapeHtml(question.explanation)}</p>
              ${question.source ? `<p class="quiz-explanation__source">${escapeHtml(question.source)}</p>` : ''}
            </div>
          `
        })() : ''}
      </article>
    `
  }).join('')

  body.innerHTML = `
    ${resultBanner}
    <div class="quiz-question-list">${questionCards}</div>
  `

  replayTrackerMotion(body, '.quiz-card, .quiz-choice[data-quiz-selected="true"]')
}

function triggerCorrectAnswerCelebration() {
  const defaults = {
    spread: 60,
    ticks: 80,
    gravity: 0.9,
    decay: 0.93,
    startVelocity: 30,
    colors: ['#4ade80', '#22d3ee', '#a78bfa', '#fbbf24', '#f87171', '#34d399'],
  }

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(120 * particleRatio),
    })
  }

  // Two-burst from bottom corners for a celebratory arc
  fire(0.25, { origin: { x: 0.15, y: 1 }, angle: 60 })
  fire(0.25, { origin: { x: 0.85, y: 1 }, angle: 120 })

  setTimeout(() => {
    fire(0.2, { origin: { x: 0.3, y: 0.95 }, angle: 75, spread: 80, startVelocity: 25 })
    fire(0.2, { origin: { x: 0.7, y: 0.95 }, angle: 105, spread: 80, startVelocity: 25 })
  }, 150)

  setTimeout(() => {
    fire(0.15, { origin: { x: 0.5, y: 0.98 }, angle: 90, spread: 100, startVelocity: 20 })
  }, 300)
}

function renderResumePrompt() {
  const modal = ensureQuizModal()
  const body = modal.querySelector('#quiz-body')
  body.innerHTML = `
    <article class="quiz-resume-card">
      <div class="quiz-resume-card__header">
        <div class="quiz-resume-card__icon-container">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <h3 class="quiz-resume-card__title">Saved Attempt</h3>
      </div>
      <p class="quiz-resume-card__desc">
        You have an active attempt saved for this topic. Would you like to resume where you left off or start fresh?
      </p>
      <div class="quiz-resume-card__actions">
        <button class="quiz-resume-card__btn quiz-resume-card__btn--secondary" type="button" data-quiz-start-over>
          Start over
        </button>
        <button class="quiz-resume-card__btn quiz-resume-card__btn--primary" type="button" data-quiz-resume>
          Resume Quiz
        </button>
      </div>
    </article>
  `
}

function renderSourceProgress(sourceProgress) {
  if (!sourceProgress) return ''

  if (sourceProgress.partCount) {
    return `
      <span class="quiz-source-option__resume-row quiz-source-option__resume-row--collection">
        <span class="quiz-source-option__resume${sourceProgress.completed ? ' quiz-source-option__resume--complete' : ''}">
          ${sourceProgress.completed ? 'Completed' : 'In progress'}
        </span>
        <span class="quiz-source-option__progress" aria-label="${sourceProgress.answeredCount} of ${sourceProgress.total} questions completed">
          <span style="width: ${sourceProgress.percent}%"></span>
        </span>
        <span class="quiz-source-option__count">${sourceProgress.completedParts}/${sourceProgress.partCount} parts</span>
      </span>
    `
  }

  if (sourceProgress.completed) {
    return `
      <span class="quiz-source-option__resume-row quiz-source-option__resume-row--complete">
        <span class="quiz-source-option__resume quiz-source-option__resume--complete">Completed</span>
        <span class="quiz-source-option__progress" aria-label="Quiz completed">
          <span style="width: 100%"></span>
        </span>
        <span class="quiz-source-option__count">${sourceProgress.score ?? sourceProgress.answeredCount}/${sourceProgress.total}</span>
      </span>
    `
  }

  return `
    <span class="quiz-source-option__resume-row">
      <span class="quiz-source-option__resume">Resume</span>
      <span class="quiz-source-option__progress" aria-label="${sourceProgress.answeredCount} of ${sourceProgress.total} questions answered">
        <span style="width: ${sourceProgress.percent}%"></span>
      </span>
      <span class="quiz-source-option__count">${sourceProgress.answeredCount}/${sourceProgress.total}</span>
    </span>
  `
}

function renderQuizSourcePicker(topicLabel, event = null) {
  const sources = getQuizSources(topicLabel)
  const modal = ensureQuizModal()
  const title = modal.querySelector('#quiz-title')
  const meta = modal.querySelector('#quiz-meta')
  const fill = modal.querySelector('#quiz-progress-fill')
  const progressCount = modal.querySelector('#quiz-progress-count')
  const body = modal.querySelector('#quiz-body')
  const actions = modal.querySelector('.quiz-modal__actions')
  const panel = modal.querySelector('.quiz-modal__panel')
  const sourcesWithProgress = sources.map((source) => ({
    ...source,
    savedProgress: source.collection
      ? getCollectionProgressSummary(topicLabel, source)
      : getSavedQuizProgress(topicLabel, source)
  }))
  const firstSavedProgress = sourcesWithProgress.find((source) => source.savedProgress)?.savedProgress || null

  if (event && event.clientX && event.clientY && panel) {
    const rect = panel.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    panel.style.transformOrigin = `${x}px ${y}px`
  } else if (panel) {
    panel.style.transformOrigin = 'center center'
  }

  if (title) title.textContent = topicLabel
  if (meta) meta.textContent = 'Choose an MCQ source.'
  if (fill) fill.style.width = `${firstSavedProgress?.percent || 0}%`
  if (progressCount) progressCount.textContent = firstSavedProgress
    ? `${firstSavedProgress.answeredCount}/${firstSavedProgress.total}`
    : '0/0'
  const progress = modal.querySelector('.quiz-progress')
  if (progress) progress.style.setProperty('--quiz-progress-percent', `${firstSavedProgress?.percent || 0}%`)
  hideQuizTimer()
  body.innerHTML = `
    <article class="quiz-card quiz-source-picker">
      ${sourcesWithProgress.map((source) => {
        const isVipPastExam = source.id === 'nutr-quiz-1-2-cleaned-bank'
        const isKellawiCollection = [
          'kellawi-surgical-git-master-bank',
          'med1-kellawi-gastroenterology'
        ].includes(source.id)
        const kellawiGroupCount = source.collection?.groups?.length || 0
        const kellawiPartCount = source.collection?.groups?.reduce(
          (total, group) => total + (group.parts?.length || 0),
          0
        ) || 0
        const kellawiGroupNoun = source.id === 'kellawi-surgical-git-master-bank' ? 'organs' : 'topics'
        const resumesDirectly = Boolean(source.savedProgress && !source.collection)
        return `
        <button class="quiz-source-option${isVipPastExam ? ' quiz-source-option--vip' : ''}${isKellawiCollection ? ' quiz-source-option--kellawi' : ''}" type="button" data-quiz-source="${source.id}" data-quiz-topic="${escapeHtml(topicLabel)}" ${resumesDirectly ? 'data-quiz-resume-direct' : ''} ${isVipPastExam ? 'dir="rtl"' : ''}>
          ${isVipPastExam ? '<img class="quiz-source-option__icon" src="/assets/past-exams-vip-icon.png" alt="" width="256" height="256" decoding="async" />' : ''}
          ${isKellawiCollection ? `
            <span class="quiz-source-option__kellawi-mascot" aria-hidden="true">
              <span class="quiz-source-option__kellawi-avatar">
                <img src="/assets/mohamed-kellawi-avatar.jpg" alt="" width="420" height="420" loading="lazy" decoding="async" />
              </span>
              <span class="quiz-source-option__thought">Let’s solve organ by organ.</span>
            </span>
          ` : ''}
          <span class="quiz-source-option__content">
            <strong>${source.label}</strong>
            ${isVipPastExam
              ? '<span>15 min timer</span>'
              : isKellawiCollection
                ? `<span>${source.mcqs.length.toLocaleString()} questions · ${kellawiGroupCount} ${kellawiGroupNoun} · ${kellawiPartCount} short parts</span>`
                : `<span>${source.mcqs.length} questions${source.description ? ` - ${source.description}` : ''}</span>`}
            ${renderSourceProgress(source.savedProgress)}
          </span>
        </button>
      `}).join('')}
    </article>
  `
  actions.innerHTML = '<button class="quiz-action quiz-action--primary" type="button" data-quiz-close>Close</button>'
  modal.setAttribute('aria-hidden', 'false')
  document.body.classList.add('panel-open')
  activateManagedModal(modal, closeQuiz, modal.querySelector('[data-quiz-close]'))
}

function prepareQuizPicker({ titleText, metaText, progress = null, event = null }) {
  const modal = ensureQuizModal()
  const title = modal.querySelector('#quiz-title')
  const meta = modal.querySelector('#quiz-meta')
  const fill = modal.querySelector('#quiz-progress-fill')
  const progressCount = modal.querySelector('#quiz-progress-count')
  const body = modal.querySelector('#quiz-body')
  const actions = modal.querySelector('.quiz-modal__actions')
  const panel = modal.querySelector('.quiz-modal__panel')

  if (event && event.clientX && event.clientY && panel) {
    const rect = panel.getBoundingClientRect()
    panel.style.transformOrigin = `${event.clientX - rect.left}px ${event.clientY - rect.top}px`
  } else if (panel) {
    panel.style.transformOrigin = 'center center'
  }

  if (title) title.textContent = titleText
  if (meta) meta.textContent = metaText
  if (fill) fill.style.width = `${progress?.percent || 0}%`
  if (progressCount) {
    progressCount.textContent = progress
      ? `${progress.answeredCount}/${progress.total}`
      : '0/0'
  }
  const progressBar = modal.querySelector('.quiz-progress')
  if (progressBar) progressBar.style.setProperty('--quiz-progress-percent', `${progress?.percent || 0}%`)

  hideQuizTimer()
  actions.innerHTML = '<button class="quiz-action quiz-action--primary" type="button" data-quiz-close>Close</button>'
  modal.setAttribute('aria-hidden', 'false')
  document.body.classList.add('panel-open')
  activateManagedModal(modal, closeQuiz, modal.querySelector('[data-quiz-close]'))

  return { modal, body, actions, panel }
}

function getGroupProgressSummary(topicLabel, group) {
  let completedParts = 0
  let inProgressParts = 0
  let answeredCount = 0
  let total = 0

  group.parts.forEach((part) => {
    const status = getSavedQuizStatus(topicLabel, part)
    total += part.mcqs.length
    if (!status) return
    answeredCount += status.completed ? status.total : status.answeredCount
    if (status.completed) completedParts += 1
    else if (status.answeredCount) inProgressParts += 1
  })

  return {
    completed: completedParts === group.parts.length,
    completedParts,
    inProgressParts,
    partCount: group.parts.length,
    answeredCount,
    total,
    percent: total ? Math.round((answeredCount / total) * 100) : 0
  }
}

function renderCollectionCardStatus(summary) {
  const stateLabel = summary.completed
    ? 'Completed'
    : summary.inProgressParts
      ? 'In progress'
      : 'Not started'

  return `
    <span class="quiz-collection-option__status">
      <span>${stateLabel}</span>
      <strong>${summary.completedParts}/${summary.partCount} parts</strong>
    </span>
    <span class="quiz-collection-option__bar" aria-hidden="true">
      <span style="width: ${summary.percent}%"></span>
    </span>
  `
}

function renderQuizCollectionPicker(topicLabel, sourceId, event = null) {
  const source = getQuizSource(topicLabel, sourceId)
  if (!source?.collection) return

  const collectionProgress = getCollectionProgressSummary(topicLabel, source)
  const latestAttempt = getLatestCollectionAttempt(topicLabel, source)
  const wrongCount = getCollectionWrongQuestionIds(topicLabel, source).length
  const collectionPrompt = source.collection.prompt || 'Choose an organ or a revision mode.'
  const groupEyebrow = source.collection.groupEyebrow || 'Organ bank'
  const { body } = prepareQuizPicker({
    titleText: source.label,
    metaText: collectionPrompt,
    progress: collectionProgress,
    event
  })

  const continueCard = latestAttempt ? `
    <button class="quiz-collection-option quiz-collection-option--continue" type="button"
      data-quiz-continue-source="${escapeHtml(latestAttempt.part.id)}"
      data-quiz-topic="${escapeHtml(topicLabel)}">
      <span class="quiz-collection-option__eyebrow">Continue</span>
      <strong>${escapeHtml(latestAttempt.part.groupLabel)} · ${escapeHtml(latestAttempt.part.label)}</strong>
      <span>${latestAttempt.status.answeredCount}/${latestAttempt.status.total} answered</span>
      <span class="quiz-collection-option__bar" aria-hidden="true">
        <span style="width: ${latestAttempt.status.percent}%"></span>
      </span>
    </button>
  ` : ''

  const organCards = source.collection.groups.map((group) => {
    const summary = getGroupProgressSummary(topicLabel, group)
    return `
      <button class="quiz-collection-option" type="button"
        data-quiz-group="${escapeHtml(group.id)}"
        data-quiz-collection-source="${escapeHtml(source.id)}"
        data-quiz-topic="${escapeHtml(topicLabel)}">
        <span class="quiz-collection-option__eyebrow">${escapeHtml(groupEyebrow)}</span>
        <strong>${escapeHtml(group.label)}</strong>
        <span>${group.questionCount} questions · ${group.parts.length} parts</span>
        ${renderCollectionCardStatus(summary)}
      </button>
    `
  }).join('')

  body.innerHTML = `
    <article class="quiz-card quiz-collection-picker">
      <div class="quiz-picker-breadcrumb">
        <button type="button" data-quiz-picker-back-source data-quiz-topic="${escapeHtml(topicLabel)}">MCQ sources</button>
        <span aria-hidden="true">›</span>
        <strong>${escapeHtml(source.label)}</strong>
      </div>
      ${continueCard}
      <div class="quiz-collection-grid">
        ${organCards}
        <button class="quiz-collection-option quiz-collection-option--mixed" type="button"
          data-quiz-mixed-menu
          data-quiz-collection-source="${escapeHtml(source.id)}"
          data-quiz-topic="${escapeHtml(topicLabel)}">
          <span class="quiz-collection-option__eyebrow">Revision mode</span>
          <strong>Mixed Practice</strong>
          <span>Quick 20 · Standard 30 · Exam 50</span>
        </button>
        <button class="quiz-collection-option quiz-collection-option--wrong" type="button"
          data-quiz-wrong-review
          data-quiz-collection-source="${escapeHtml(source.id)}"
          data-quiz-topic="${escapeHtml(topicLabel)}"
          ${wrongCount ? '' : 'disabled'}>
          <span class="quiz-collection-option__eyebrow">Focused review</span>
          <strong>Review Wrong Answers</strong>
          <span>${wrongCount ? `${wrongCount} question${wrongCount === 1 ? '' : 's'} to review` : 'No wrong answers saved yet'}</span>
        </button>
      </div>
    </article>
  `
}

function renderPartResumeActions(topicLabel, part, status) {
  return `
    <span class="quiz-part-option__saved-footer">
      <span class="quiz-part-option__saved-actions">
        <button class="quiz-part-option__resume-button" type="button"
          data-quiz-part="${escapeHtml(part.id)}"
          data-quiz-topic="${escapeHtml(topicLabel)}"
          data-quiz-resume-direct>Resume</button>
        <button class="quiz-part-option__restart-button" type="button"
          data-quiz-part-start-over="${escapeHtml(part.id)}"
          data-quiz-topic="${escapeHtml(topicLabel)}">Start over</button>
      </span>
      <span class="quiz-source-option__progress" aria-label="${status.answeredCount} of ${status.total} questions answered">
        <span style="width: ${status.percent}%"></span>
      </span>
      <span class="quiz-source-option__count">${status.answeredCount}/${status.total}</span>
    </span>
  `
}

function renderQuizPartPicker(topicLabel, sourceId, groupId, event = null) {
  const source = getQuizSource(topicLabel, sourceId)
  const group = source?.collection?.groups?.find((item) => item.id === groupId)
  if (!source || !group) return

  const progress = getGroupProgressSummary(topicLabel, group)
  const { body } = prepareQuizPicker({
    titleText: group.label,
    metaText: `${group.questionCount} questions · ${group.parts.length} short parts`,
    progress,
    event
  })

  const partCards = group.parts.map((part) => {
    const status = getSavedQuizStatus(topicLabel, part)
    const resumesDirectly = Boolean(status && !status.completed && status.answeredCount)
    const cardContent = `
      <span class="quiz-collection-option__eyebrow">${escapeHtml(part.range)}</span>
      <strong>${escapeHtml(part.label)}</strong>
      <span>${part.mcqs.length} questions</span>
      <small>${escapeHtml(part.description)}</small>
    `

    if (resumesDirectly) {
      return `
        <article class="quiz-part-option quiz-part-option--saved">
          ${cardContent}
          ${renderPartResumeActions(topicLabel, part, status)}
        </article>
      `
    }

    return `
      <button class="quiz-part-option${status?.completed ? ' quiz-part-option--complete' : ''}" type="button"
        data-quiz-part="${escapeHtml(part.id)}"
        data-quiz-topic="${escapeHtml(topicLabel)}">
        ${cardContent}
        ${renderSourceProgress(status)}
      </button>
    `
  }).join('')

  body.innerHTML = `
    <article class="quiz-card quiz-parts-picker">
      <div class="quiz-picker-breadcrumb">
        <button type="button" data-quiz-back-collection
          data-quiz-topic="${escapeHtml(topicLabel)}"
          data-quiz-collection-source="${escapeHtml(source.id)}">${escapeHtml(source.label)}</button>
        <span aria-hidden="true">›</span>
        <strong>${escapeHtml(group.label)}</strong>
      </div>
      <label class="quiz-picker-toggle">
        <input type="checkbox" data-quiz-shuffle-toggle>
        <span>Shuffle questions when starting a new part</span>
      </label>
      <div class="quiz-parts-grid">
        ${partCards}
      </div>
    </article>
  `
}

function renderMixedPracticePicker(topicLabel, sourceId, event = null) {
  const source = getQuizSource(topicLabel, sourceId)
  if (!source?.collection) return

  const { body } = prepareQuizPicker({
    titleText: 'Mixed Practice',
    metaText: source.collection.mixedMeta || 'Random questions from all five organs.',
    event
  })

  body.innerHTML = `
    <article class="quiz-card quiz-parts-picker">
      <div class="quiz-picker-breadcrumb">
        <button type="button" data-quiz-back-collection
          data-quiz-topic="${escapeHtml(topicLabel)}"
          data-quiz-collection-source="${escapeHtml(source.id)}">${escapeHtml(source.label)}</button>
        <span aria-hidden="true">›</span>
        <strong>Mixed Practice</strong>
      </div>
      <div class="quiz-parts-grid">
        ${source.collection.mixedSizes.map((mode) => {
          const config = createMixedQuizConfig(topicLabel, source, mode)
          const status = getSavedQuizStatus(topicLabel, config)
          const resumesDirectly = Boolean(status && !status.completed && status.answeredCount)
          return `
            <button class="quiz-part-option${status?.completed ? ' quiz-part-option--complete' : ''}" type="button"
              data-quiz-mixed-size="${mode.size}"
              data-quiz-topic="${escapeHtml(topicLabel)}"
              data-quiz-collection-source="${escapeHtml(source.id)}"
              ${resumesDirectly ? 'data-quiz-resume-direct' : ''}>
              <span class="quiz-collection-option__eyebrow">Random session</span>
              <strong>${escapeHtml(mode.label)}</strong>
              <span>${mode.size} questions</span>
              <small>${escapeHtml(mode.description)}</small>
              ${renderSourceProgress(status)}
            </button>
          `
        }).join('')}
      </div>
    </article>
  `
}


function openQuiz(topicLabel, sourceId = 'current', event = null, launchOptions = {}) {
  const config = getQuizConfig(topicLabel, sourceId)
  if (!config || !config.mcqs.length) return

  const savedState = config.transient || launchOptions.skipSaved ? null : getSavedQuizState(topicLabel, config.id)
  const useSaved = Boolean(savedState)
  const resumeDirectly = Boolean(launchOptions.resumeDirectly && savedState && !savedState.completed)
  initializeQuiz(topicLabel, {
    sourceId: config.id,
    useSaved,
    fresh: false,
    shuffleQuestionsOverride: useSaved ? null : (launchOptions.shuffleQuestionsOverride ?? null),
    promptOnSaved: !resumeDirectly
  })

  if (launchOptions.restartTimer && !quizState.completed) {
    quizState.timerElapsedMs = 0
    quizState.timerEndsAt = quizState.timeLimitMinutes
      ? new Date(Date.now() + quizState.timeLimitMinutes * 60000).toISOString()
      : null
    quizState.timerStartedAt = quizState.timeLimitMinutes ? null : new Date().toISOString()
  }

  const modal = ensureQuizModal()
  const panel = modal.querySelector('.quiz-modal__panel')
  let resumedQuestion = null

  if (panel && !resumeDirectly) panel.scrollTop = 0

  if (resumeDirectly) {
    resumedQuestion = getFirstUnansweredQuestion()
    if (resumedQuestion) {
      quizState.index = getCurrentQuiz().findIndex((question) => question.id === resumedQuestion.id)
    }
  }

  if (event && event.clientX && event.clientY && panel) {
    const rect = panel.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    panel.style.transformOrigin = `${x}px ${y}px`
  } else if (panel) {
    panel.style.transformOrigin = 'center center'
  }

  modal.setAttribute('aria-hidden', 'false')
  document.body.classList.add('panel-open')
  sendStudentPresence(true)
  renderQuizMeta()
  renderQuizActions()

  if (quizState.showResumePrompt) {
    renderResumePrompt()
  } else if (quizState.completed) {
    renderQuizQuestion()
  } else {
    renderQuizQuestion()
  }
  if (quizState.showResumePrompt) {
    hideQuizTimer()
  } else {
    startQuizTimer()
  }
  updateQuizRobotCompactMode()
  activateManagedModal(modal, closeQuiz, modal.querySelector('[data-quiz-close]'))

  if (resumeDirectly) {
    setTimeout(() => {
      if (resumedQuestion) {
        scrollToQuizQuestion(resumedQuestion.id)
        return
      }
      if (panel) panel.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
    }, 80)
  }
}

function closeQuiz() {
  const modal = ensureQuizModal()
  quizSoundMenuOpen = false
  dismissQuizLevelUpCelebration()
  quizSessionGeneration += 1
  if (activeSourceReaderState) {
    closeSourceReader()
  }
  if (quizState.topicLabel && !quizState.completed && !quizState.showResumePrompt && !quizState.transient) {
    pauseQuizCountupTimer()
    saveQuizState()
  }
  deactivateManagedModal(modal)
  modal.setAttribute('aria-hidden', 'true')
  document.body.classList.remove('panel-open')
  resetQuizFeedbackSequence()
  clearQuizTimerInterval()
  resetQuizRobotMood()
  sendStudentPresence(true)
}

function ensurePdfPreviewModal() {
  let modal = document.getElementById('pdf-preview-modal')
  if (modal) return modal

  modal = document.createElement('div')
  modal.id = 'pdf-preview-modal'
  modal.className = 'pdf-preview-modal'
  modal.setAttribute('aria-hidden', 'true')
  modal.innerHTML = `
    <div class="pdf-preview-modal__backdrop" data-pdf-close></div>
    <section class="pdf-preview-modal__panel" role="dialog" aria-modal="true" aria-labelledby="pdf-preview-title">
      <div class="pdf-preview-modal__top">
        <div>
          <p class="card__kicker">Compact PDF</p>
          <h2 id="pdf-preview-title">PDF preview</h2>
          <p class="pdf-preview-modal__meta">Preview opens inside the website.</p>
        </div>
        <button class="icon-button" type="button" data-pdf-close aria-label="Close PDF preview">X</button>
      </div>
      <div class="pdf-preview-frame-wrap">
        <iframe class="pdf-preview-frame" title="PDF preview" loading="lazy"></iframe>
      </div>
      <div class="pdf-preview-modal__actions">
        <a class="quiz-action" data-pdf-open target="_blank" rel="noopener noreferrer">Open PDF</a>
        <a class="quiz-action quiz-action--primary" data-pdf-download download>Download</a>
      </div>
    </section>
  `
  document.body.appendChild(modal)
  return modal
}

function openPdfPreview({ url, title, downloadUrl }, event = null) {
  if (!url) return

  const modal = ensurePdfPreviewModal()
  const panel = modal.querySelector('.pdf-preview-modal__panel')
  const heading = modal.querySelector('#pdf-preview-title')
  const frame = modal.querySelector('.pdf-preview-frame')
  const openLink = modal.querySelector('[data-pdf-open]')
  const downloadLink = modal.querySelector('[data-pdf-download]')

  if (event && event.clientX && event.clientY && panel) {
    const rect = panel.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    panel.style.transformOrigin = `${x}px ${y}px`
  } else if (panel) {
    panel.style.transformOrigin = 'center center'
  }

  heading.textContent = title || 'PDF preview'
  frame.src = url
  frame.title = title || 'PDF preview'
  openLink.href = url
  downloadLink.href = downloadUrl || url
  downloadLink.setAttribute('download', '')
  modal.setAttribute('aria-hidden', 'false')
  document.body.classList.add('panel-open')
  activateManagedModal(modal, closePdfPreview, modal.querySelector('[data-pdf-close]'))
}

function closePdfPreview() {
  const modal = ensurePdfPreviewModal()
  const frame = modal.querySelector('.pdf-preview-frame')
  deactivateManagedModal(modal)
  modal.setAttribute('aria-hidden', 'true')
  document.body.classList.remove('panel-open')
  if (frame) frame.src = 'about:blank'
}

function handleQuizClick(event) {
  if (quizSoundMenuOpen && !event.target.closest('.quiz-sound-picker')) {
    setQuizSoundMenuOpen(false)
  }

  const topicCompletionInput = event.target.closest('[data-topic-completion]')
  if (topicCompletionInput) {
    const subjectCode = topicCompletionInput.dataset.subjectCode
    const topicLabel = topicCompletionInput.dataset.topicLabel
    const completionKey = topicCompletionInput.dataset.topicCompletion
    const state = getTopicCompletionState(subjectCode, topicLabel)
    state[completionKey] = !state[completionKey]

    saveTopicCompletionState(subjectCode, topicLabel, state)
    setActiveSubject(subjectCode, 'open')
    updateGlobalProgress()
    return
  }

  const breakdownCard = event.target.closest('[data-topic-breakdown-card]')
  const breakdownToggle = event.target.closest('[data-toggle-topic-breakdown]')
  const clickedInteractiveChild = event.target.closest('a, button, input, label, select, textarea')
  if (breakdownCard && (breakdownToggle || !clickedInteractiveChild)) {
    event.preventDefault()
    const subjectCode = breakdownCard.dataset.adminSubject
    const topicLabel = breakdownCard.dataset.adminTopic
    const key = getTopicBreakdownKey(subjectCode, topicLabel)
    const shouldExpand = !expandedTopicBreakdowns.has(key)
    if (shouldExpand) expandedTopicBreakdowns.add(key)
    else expandedTopicBreakdowns.delete(key)

    breakdownCard.classList.toggle('is-breakdown-expanded', shouldExpand)
    breakdownCard.setAttribute('aria-expanded', String(shouldExpand))
    const breakdown = breakdownCard.querySelector('.topic-breakdown')
    if (breakdown) breakdown.hidden = !shouldExpand
    const toggle = breakdownToggle || breakdownCard.querySelector('[data-toggle-topic-breakdown]')
    if (toggle) {
      const actionLabel = shouldExpand ? 'Hide topic resources' : 'Show topic resources'
      toggle.setAttribute('aria-expanded', String(shouldExpand))
      toggle.setAttribute('aria-label', actionLabel)
      toggle.setAttribute('title', actionLabel)
    }
    return
  }

  const pdfButton = event.target.closest('[data-pdf-preview]')
  if (pdfButton) {
    openPdfPreview({
      url: pdfButton.dataset.pdfPreview,
      title: pdfButton.dataset.pdfTitle,
      downloadUrl: pdfButton.dataset.pdfDownload
    }, event)
    return
  }

  if (event.target.closest('[data-pdf-close]')) {
    closePdfPreview()
    return
  }

  const sourcePickerBack = event.target.closest('[data-quiz-picker-back-source]')
  if (sourcePickerBack) {
    renderQuizSourcePicker(sourcePickerBack.dataset.quizTopic, event)
    return
  }

  const collectionBack = event.target.closest('[data-quiz-back-collection]')
  if (collectionBack) {
    const topicLabel = collectionBack.dataset.quizTopic || quizState.topicLabel
    const sourceId = collectionBack.dataset.quizCollectionSource || quizState.parentSourceId
    renderQuizCollectionPicker(topicLabel, sourceId, event)
    return
  }

  const groupButton = event.target.closest('[data-quiz-group]')
  if (groupButton) {
    renderQuizPartPicker(
      groupButton.dataset.quizTopic,
      groupButton.dataset.quizCollectionSource,
      groupButton.dataset.quizGroup,
      event
    )
    return
  }

  const partStartOverButton = event.target.closest('[data-quiz-part-start-over]')
  if (partStartOverButton) {
    const topicLabel = partStartOverButton.dataset.quizTopic
    const sourceId = partStartOverButton.dataset.quizPartStartOver
    const modal = ensureQuizModal()
    const shuffleToggle = modal.querySelector('[data-quiz-shuffle-toggle]')
    clearSavedQuizState(topicLabel, sourceId)
    openQuiz(topicLabel, sourceId, event, {
      shuffleQuestionsOverride: Boolean(shuffleToggle?.checked),
      restartTimer: true
    })
    return
  }

  const partButton = event.target.closest('[data-quiz-part]')
  if (partButton) {
    const modal = ensureQuizModal()
    const shuffleToggle = modal.querySelector('[data-quiz-shuffle-toggle]')
    openQuiz(partButton.dataset.quizTopic, partButton.dataset.quizPart, event, {
      shuffleQuestionsOverride: Boolean(shuffleToggle?.checked),
      resumeDirectly: partButton.hasAttribute('data-quiz-resume-direct')
    })
    return
  }

  const continueButton = event.target.closest('[data-quiz-continue-source]')
  if (continueButton) {
    openQuiz(continueButton.dataset.quizTopic, continueButton.dataset.quizContinueSource, event, {
      resumeDirectly: true
    })
    return
  }

  const mixedMenuButton = event.target.closest('[data-quiz-mixed-menu]')
  if (mixedMenuButton) {
    renderMixedPracticePicker(
      mixedMenuButton.dataset.quizTopic,
      mixedMenuButton.dataset.quizCollectionSource,
      event
    )
    return
  }

  const mixedSizeButton = event.target.closest('[data-quiz-mixed-size]')
  if (mixedSizeButton) {
    const topicLabel = mixedSizeButton.dataset.quizTopic
    const source = getQuizSource(topicLabel, mixedSizeButton.dataset.quizCollectionSource)
    const mode = source?.collection?.mixedSizes?.find((item) => item.size === Number(mixedSizeButton.dataset.quizMixedSize))
    if (source && mode) {
      const config = createMixedQuizConfig(topicLabel, source, mode)
      openQuiz(topicLabel, config.id, event, {
        resumeDirectly: mixedSizeButton.hasAttribute('data-quiz-resume-direct')
      })
    }
    return
  }

  const wrongReviewButton = event.target.closest('[data-quiz-wrong-review]')
  if (wrongReviewButton) {
    const topicLabel = wrongReviewButton.dataset.quizTopic || quizState.topicLabel
    const sourceId = wrongReviewButton.dataset.quizCollectionSource || quizState.parentSourceId
    const source = getQuizSource(topicLabel, sourceId)
    if (!source) return
    const config = createWrongReviewQuizConfig(topicLabel, source)
    if (config.mcqs.length) openQuiz(topicLabel, config.id, event)
    else renderQuizCollectionPicker(topicLabel, source.id, event)
    return
  }

  const sourceButton = event.target.closest('[data-quiz-source]')
  if (sourceButton) {
    const topicLabel = sourceButton.dataset.quizTopic
    const source = getQuizConfig(topicLabel, sourceButton.dataset.quizSource)
    if (source?.collection) renderQuizCollectionPicker(topicLabel, source.id, event)
    else {
      openQuiz(topicLabel, sourceButton.dataset.quizSource, event, {
        resumeDirectly: sourceButton.hasAttribute('data-quiz-resume-direct')
      })
    }
    return
  }

  const mcqSearchResult = event.target.closest('[data-mcq-search-result]')
  if (mcqSearchResult) {
    openMcqSearchResult(mcqSearchResult.dataset.mcqSearchResult, event)
    return
  }

  const openButton = event.target.closest('[data-quiz-topic]')
  if (openButton) {
    const topicLabel = openButton.dataset.quizTopic
    const sources = getQuizSources(topicLabel)
    if (sources.length > 1 || shouldShowQuizSourcePicker(topicLabel)) {
      renderQuizSourcePicker(topicLabel, event)
    } else {
      openQuiz(topicLabel, sources[0]?.id || 'current', event)
    }
    return
  }

  if (event.target.closest('[data-quiz-close]')) {
    closeQuiz()
    return
  }

  if (event.target.closest('[data-quiz-level-up-dismiss]')) {
    dismissQuizLevelUpCelebration()
    return
  }

  const soundPackOption = event.target.closest('[data-quiz-sound-pack]')
  if (soundPackOption) {
    setQuizSoundPack(soundPackOption.dataset.quizSoundPack)
    document.querySelector('[data-quiz-sound-toggle]')?.focus()
    return
  }

  if (event.target.closest('[data-quiz-sound-toggle]')) {
    setQuizSoundMenuOpen(!quizSoundMenuOpen)
    return
  }

  if (event.target.closest('[data-quiz-resume]')) {
    quizState.showResumePrompt = false
    if (!quizState.timeLimitMinutes && !quizState.timerStartedAt) {
      quizState.timerStartedAt = new Date().toISOString()
    }
    const targetQuestion = getFirstUnansweredQuestion()
    if (targetQuestion) {
      quizState.index = getCurrentQuiz().findIndex((question) => question.id === targetQuestion.id)
      saveQuizState()
    }
    renderQuizQuestion()
    startQuizTimer()
    setTimeout(() => {
      if (targetQuestion) {
        scrollToQuizQuestion(targetQuestion.id)
        return
      }

      const modal = ensureQuizModal()
      const panel = modal.querySelector('.quiz-modal__panel')
      if (panel) panel.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
    }, 80)
    return
  }

  if (event.target.closest('[data-quiz-start-over]')) {
    const topicLabel = quizState.topicLabel
    const sourceId = quizState.sourceId
    clearSavedQuizState(topicLabel, sourceId)
    initializeQuiz(topicLabel, { sourceId, fresh: true })
    renderQuizQuestion()
    startQuizTimer()
    return
  }

  if (event.target.closest('[data-quiz-review-wrong]')) {
    const topicLabel = quizState.topicLabel
    const config = createPartWrongReviewQuizConfig()
    if (config.mcqs.length) {
      openQuiz(topicLabel, config.id, event, { skipSaved: true })
    }
    return
  }

  if (event.target.closest('[data-quiz-retake]')) {
    if (quizState.mode === 'wrong-review') {
      const source = getCurrentCollectionSource()
      if (source) {
        const config = createWrongReviewQuizConfig(quizState.topicLabel, source)
        if (config.mcqs.length) openQuiz(quizState.topicLabel, config.id, event, { restartTimer: true })
        else renderQuizCollectionPicker(quizState.topicLabel, source.id, event)
      }
      return
    }

    const topicLabel = quizState.topicLabel
    const sourceId = quizState.sourceId
    clearSavedQuizState(topicLabel, sourceId)
    initializeQuiz(topicLabel, { sourceId, fresh: true })
    renderQuizQuestion()
    startQuizTimer()
    return
  }

  if (event.target.closest('[data-quiz-next-part]')) {
    const nextPart = getNextCollectionPart()
    if (nextPart) openQuiz(quizState.topicLabel, nextPart.id, event)
    return
  }

  if (event.target.closest('[data-quiz-back-group]')) {
    const source = getCurrentCollectionSource()
    if (source && quizState.groupId) {
      renderQuizPartPicker(quizState.topicLabel, source.id, quizState.groupId, event)
    }
    return
  }

  if (event.target.closest('[data-quiz-submit]')) {
    if (quizState.completed) return
    const missedQuestions = getMissedQuestions()
    if (missedQuestions.length) {
      quizState.missingQuestionIds = missedQuestions.map((question) => question.id)
      quizState.index = getCurrentQuiz().findIndex((question) => question.id === missedQuestions[0].id)
      saveQuizState()
      renderQuizQuestion()
      scrollToQuizQuestion(missedQuestions[0].id)
      return
    }

    quizState.completed = true
    quizState.missingQuestionIds = []
    saveQuizState({ confirmLevelUp: true })
    playQuizCompletionSound()
    renderQuizQuestion()
    updateQuizTimerDisplay()
    return
  }

  if (event.target.closest('[data-quiz-reset]')) {
    resetQuizFeedbackSequence()
    if (quizState.mode === 'wrong-review') {
      quizState.answers = {}
      quizState.index = 0
      quizState.completed = false
      quizState.missingQuestionIds = []
      saveQuizState()
      const source = getCurrentCollectionSource()
      if (source) {
        const config = createWrongReviewQuizConfig(quizState.topicLabel, source)
        if (config.mcqs.length) openQuiz(quizState.topicLabel, config.id, event, { restartTimer: true })
        else renderQuizCollectionPicker(quizState.topicLabel, source.id, event)
      }
      return
    }

    quizState.answers = {}
    quizState.index = 0
    quizState.completed = false
    quizState.missingQuestionIds = []
    quizState.attemptId = createQuizAttemptId()
    quizState.attemptStartedAt = new Date().toISOString()
    clearSavedQuizState(quizState.topicLabel, quizState.sourceId)
    quizState.timerEndsAt = quizState.timeLimitMinutes
      ? new Date(Date.now() + quizState.timeLimitMinutes * 60000).toISOString()
      : null
    quizState.timerStartedAt = quizState.timeLimitMinutes ? null : new Date().toISOString()
    quizState.timerElapsedMs = 0
    saveQuizState()
    renderQuizQuestion()
    startQuizTimer()
    return
  }

  const answerButton = event.target.closest('[data-quiz-answer]')
  if (answerButton) {
    const selectedOptionId = answerButton.dataset.quizAnswer
    const question = getCurrentQuiz().find((item) => item.id === answerButton.dataset.quizQuestion) || getCurrentQuestion()
    if (!question || quizState.completed || quizState.showResumePrompt) return
    if (quizState.answers[question.id] !== undefined) return

    quizState.answers[question.id] = selectedOptionId
    quizState.validatedInSession = true
    quizState.missingQuestionIds = (quizState.missingQuestionIds || []).filter((questionId) => questionId !== question.id)
    saveQuizState()
    const isCorrect = question.correctOptionId === selectedOptionId
    playQuizFeedbackSound(isCorrect)
    renderQuizQuestion()

    if (isCorrect) {
      if (quizState.mode === 'wrong-review' && !quizState.masteredQuestionIds.includes(question.id)) {
        quizState.masteredQuestionIds.push(question.id)
        saveQuizState()
      }
      triggerCorrectAnswerCelebration()
      triggerQuizRobotMood('happy')
      scrollToNextQuizQuestion(question.id)
    } else {
      triggerQuizRobotMood('sad')
    }
  }
}

function renderSubjects() {
  const visibleSubjects = getFilteredSubjects()

  if (!visibleSubjects.length) {
    subjectList.innerHTML = '<div class="topic-empty topic-empty--panel">No subjects match the current filters.</div>'
    clearSubjectDetail()
    return
  }

  if (activeSubjectCode && !visibleSubjects.some((subject) => subject.code === activeSubjectCode)) {
    activeSubjectCode = null
    expandedSubjectCode = null
    clearSubjectDetail()
  }

  const subjectGridColumnCount = getSubjectGridColumnCount()
  const subjectCards = []

  visibleSubjects.forEach((subject, index) => {
    const percent = getPercent(subject)
    const isActive = subject.code === activeSubjectCode
    const isExpanded = subject.code === expandedSubjectCode
    const activeClass = isActive ? ' active' : ''
    const expandedClass = isExpanded ? ' expanded' : ''
    const unreadUpdateCount = getUnreadTopicUpdates(subject).length
    const updateNotice = unreadUpdateCount ? `
      <span class="subject-button__updates" aria-label="New topic added this university week">
        <span class="subject-button__updates-pulse" aria-hidden="true"></span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16l-2-2Z"></path>
          <path d="M10 21h4"></path>
        </svg>
      </span>
    ` : ''

    subjectCards.push(`
      <div class="subject-row${expandedClass}" style="--delay: ${getFastStaggerDelay(index, 10, 90)}">
        <button class="subject-button${activeClass}" type="button" data-code="${subject.code}" aria-expanded="${isExpanded}">
          <span>
            <strong>${subject.code}</strong>
            <small>${subject.name}</small>
          </span>
          <span class="subject-button__meta">
            ${updateNotice}
            <span>${getCoveredCount(subject, getScopedProgressTopics(subject))}/${getProgressTotal(subject)}</span>
          </span>
          <span class="subject-button__bar" aria-hidden="true">
            <span style="width: ${percent}%"></span>
          </span>
        </button>
      </div>
    `)

    const isRowEnd = (index + 1) % subjectGridColumnCount === 0
    const isLastSubject = index === visibleSubjects.length - 1
    const rowStart = index - (index % subjectGridColumnCount)
    const rowSubjects = visibleSubjects.slice(rowStart, index + 1)
    const expandedSubjectInRow = rowSubjects.find((item) => item.code === expandedSubjectCode)

    if (expandedSubjectInRow && (isRowEnd || isLastSubject)) {
      subjectCards.push(renderSubjectInlineDetail(expandedSubjectInRow))
    }
  })

  subjectList.innerHTML = subjectCards.join('')
  bindSubjectButtons()
  bindSubjectTrackTabs(subjectList)
}

function clearSubjectDetail() {
  if (!selectedCode || !selectedName || !selectedCount || !selectedPercent || !progressFill || !topicList) return
  selectedCode.textContent = 'Tracker'
  selectedName.textContent = 'Choose a subject'
  selectedCount.textContent = 'Closed'
  selectedPercent.textContent = '0%'
  progressFill.style.width = '0%'
  if (subjectTrackTabs) subjectTrackTabs.innerHTML = ''
  if (subjectRevisionLauncher) {
    subjectRevisionLauncher.innerHTML = ''
    subjectRevisionLauncher.hidden = true
  }
  topicList.innerHTML = '<li class="topic-empty">Click a subject card to view its topics.</li>'
}

function setActiveSubject(code, mobileMode = 'toggle') {
  const subject = subjects.find((item) => item.code === code) || subjects[0]
  const subjectChanged = activeSubjectCode !== subject.code
  if (subjectChanged && trackerAdminState.dirtyCollections.has(getAdminCollectionKey())) {
    window.alert('Save this arrangement before switching subjects.')
    return
  }
  if (subjectChanged) activeSubjectTrack = 'theoretical'
  updateTrackerUrl(subject.code)

  if (mobileQuery.matches) {
    const wasMobileRendered = Boolean(subjectList.querySelector('.subject-button'))
    if (mobileMode === 'open') {
      expandedSubjectCode = subject.code
    } else if (mobileMode === 'closed') {
      expandedSubjectCode = null
    } else {
      expandedSubjectCode = expandedSubjectCode === subject.code ? null : subject.code
    }
    activeSubjectCode = subject.code
    markSubjectUpdatesSeen(subject)
    if (wasMobileRendered) {
      updateMobileSubjectInlineDetail(subject)
    } else {
      renderSubjects()
    }
    renderTrackerAdminUi()
    return
  }

  activeSubjectCode = subject.code
  expandedSubjectCode = null
  const clearedUpdates = markSubjectUpdatesSeen(subject)

  if (clearedUpdates) {
    renderSubjects()
  }

  if (subjectChanged && !prefersReducedMotion) {
    subjectDetail?.classList.remove('subject-detail--entered')
    void subjectDetail?.offsetWidth
    subjectDetail?.classList.add('subject-detail--entered')
  }

  subjectList.querySelectorAll('.subject-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.code === subject.code)
    button.setAttribute('aria-expanded', 'false')
  })

  const percent = getPercent(subject)
  selectedCode.textContent = subject.code
  selectedName.textContent = subject.name
  selectedCount.textContent = getSubjectTrackCount(subject)
  selectedPercent.textContent = `${percent}%`
  if (subjectTrackTabs) {
    subjectTrackTabs.innerHTML = renderSubjectTrackTabs(subject)
    bindSubjectTrackTabs(subjectTrackTabs)
  }
  if (subjectRevisionLauncher) {
    const launcherMarkup = renderSubjectRevisionLauncher(subject)
    subjectRevisionLauncher.innerHTML = launcherMarkup
    subjectRevisionLauncher.hidden = !launcherMarkup
  }
  progressFill.style.width = '0%'
  if (prefersReducedMotion) {
    progressFill.style.width = `${percent}%`
  } else {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progressFill.style.width = `${percent}%`
      })
    })
  }

  topicList.innerHTML = renderSubjectTrackList(subject)
  replayTrackerMotion(topicList, '.topic-section-heading, .topic-section-subheading, .topic-item')
  renderTrackerAdminUi()
}

function getTodayLabel() {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date())
}

function getLocalDate(dateString) {
  return new Date(`${dateString}T00:00:00`)
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatExamDate(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(getLocalDate(dateString))
}

function formatShortDate(dateLike) {
  const date = typeof dateLike === 'string' ? getLocalDate(dateLike) : dateLike
  return `${date.getDate()}/${date.getMonth() + 1}`
}

function getExamCountdownText(daysUntil) {
  if (daysUntil > 1) return `${daysUntil} days left`
  if (daysUntil === 1) return '1 day left'
  if (daysUntil === 0) return 'Today'
  return 'Completed'
}

function render401ExamSchedule() {
  if (!examScheduleCards) return

  const activeExamSchedule = activeAcademicSectionData.midtermExamSchedule || []
  const today = new Date()
  const todayStart = startOfDay(today)
  const dayNum = today.getDate()
  const monthNum = today.getMonth() + 1
  const todayMarkerLabel = todayMarker?.querySelector('b')
  if (todayMarkerLabel) todayMarkerLabel.textContent = `${dayNum}/${monthNum}`

  const scheduleWithState = activeExamSchedule.map((exam) => {
    const examDate = getLocalDate(exam.date)
    const daysUntil = Math.ceil((examDate - todayStart) / 86400000)
    return { ...exam, examDate, daysUntil }
  })

  if (!scheduleWithState.length) {
    if (nextCheckpoint) {
      nextCheckpoint.innerHTML = '<span class="checkpoint-code">No exam dates</span><span class="checkpoint-meta">Schedule pending</span>'
    }
    if (next401Exam) next401Exam.textContent = `No ${activeAcademicSectionData.title} exam dates have been added yet`
    if (next401Countdown) next401Countdown.textContent = 'Confirmed dates will appear here when available.'
    examScheduleCards.innerHTML = '<p class="empty-state">No confirmed exam dates have been added for this section yet.</p>'
    return
  }

  const nextExam = scheduleWithState.find((exam) => exam.daysUntil >= 0)

  if (nextExam) {
    if (nextCheckpoint) {
      nextCheckpoint.innerHTML = `<span class="checkpoint-code">${escapeHtml(nextExam.code)}</span><span class="checkpoint-meta">${escapeHtml(getExamCountdownText(nextExam.daysUntil))} - ${escapeHtml(formatExamDate(nextExam.date))}, ${escapeHtml(nextExam.time)}</span>`
    }
    if (next401Exam) {
      next401Exam.textContent = `Next ${activeAcademicSectionData.title} exam: ${nextExam.code} on ${formatExamDate(nextExam.date)}`
    }
    if (next401Countdown) {
      next401Countdown.textContent = `${getExamCountdownText(nextExam.daysUntil)} - ${nextExam.subjectName} at ${nextExam.time}.`
    }
  } else {
    if (nextCheckpoint) {
      const finalsDate = activeAcademicSectionData.semesterTimeline?.finals
      nextCheckpoint.innerHTML = finalsDate
        ? `<span class="checkpoint-code">Finals</span><span class="checkpoint-meta">${escapeHtml(formatExamDate(finalsDate))}</span>`
        : '<span class="checkpoint-code">Schedule complete</span><span class="checkpoint-meta">No later exam date confirmed</span>'
    }
    if (next401Exam) next401Exam.textContent = `${activeAcademicSectionData.title} midterm schedule complete`
    if (next401Countdown) next401Countdown.textContent = `All listed ${activeAcademicSectionData.title} midterm exams have passed.`
  }

  examScheduleCards.innerHTML = scheduleWithState.map((exam) => {
    const isNext = nextExam?.code === exam.code
    const isDone = exam.daysUntil < 0
    const statusLabel = isNext ? getExamCountdownText(exam.daysUntil) : isDone ? 'Completed' : 'Upcoming'
    const stateClass = `${isNext ? ' exam-card--next' : ''}${isDone ? ' exam-card--done' : ''}`
    const cardContent = `
      <strong>${escapeHtml(exam.code)}</strong>
      <time datetime="${exam.date}T14:30">${formatShortDate(exam.date)}</time>
      <em>${escapeHtml(exam.time)}</em>
      ${exam.meta ? `<span class="exam-card__meta">${escapeHtml(exam.meta)}</span>` : ''}
      <small>${escapeHtml(statusLabel)}</small>
    `

    if (!exam.quizTopicKey) {
      return `
        <button class="exam-card${stateClass}" type="button" data-code="${exam.subjectCode}" aria-label="Open ${escapeHtml(exam.subjectName)} tracker">
          ${cardContent}
        </button>
      `
    }

    return `
      <article class="exam-card exam-card--has-action${stateClass}" data-code="${exam.subjectCode}">
        <button class="exam-card__tracker-action" type="button" aria-label="Open ${escapeHtml(exam.subjectName)} tracker"></button>
        ${cardContent}
        <button class="exam-card__quiz-action" type="button" data-quiz-topic="${escapeHtml(exam.quizTopicKey)}" aria-label="Open ${escapeHtml(exam.quizActionLabel || 'MCQs')} for ${escapeHtml(exam.subjectName)}">
          <svg class="exam-card__quiz-icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="3" width="16" height="18" rx="3"></rect>
            <path d="m8 9 1.5 1.5L12 8"></path>
            <path d="M14 9h3"></path>
            <path d="m8 15 1.5 1.5L12 14"></path>
            <path d="M14 15h3"></path>
          </svg>
          <span>${escapeHtml(exam.quizActionLabel || 'MCQs')}</span>
        </button>
      </article>
    `
  }).join('')

  examScheduleCards.querySelectorAll('.exam-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-quiz-topic]')) {
        return
      }
      setActiveSubject(card.dataset.code, 'open')
    })
  })
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getTimelinePercent(date, startDate, endDate) {
  const start = startDate.getTime()
  const end = endDate.getTime()
  return clamp(((date.getTime() - start) / (end - start)) * 100, 0, 100)
}

function formatTimelineDate(date) {
  return formatShortDate(date)
}

function renderSemesterTimeline() {
  if (!semesterFill || !todayMarker || !midtermMarker || !finalsMarker) return

  const caps = activeAcademicSectionData?.capabilities || {}
  if (caps.resourceFirst || caps.hasTimeline === false) {
    if (semesterTimeline) semesterTimeline.hidden = true
    return
  }

  const timeline = activeAcademicSectionData.semesterTimeline
  if (!timeline?.start || !timeline?.finals) {
    if (semesterTimeline) semesterTimeline.hidden = true
    return
  }
  if (semesterTimeline) semesterTimeline.hidden = false

  const today = new Date()
  const semesterStart = getLocalDate(timeline.start)
  const activeExamSchedule = activeAcademicSectionData.midtermExamSchedule || []
  const midtermExam = activeExamSchedule.find((exam) => exam.type !== 'quiz') || activeExamSchedule[0]
  const midterm = midtermExam ? getLocalDate(midtermExam.date) : null
  const finals = getLocalDate(timeline.finals)
  const todayPercent = getTimelinePercent(today, semesterStart, finals)
  const midtermPercent = midterm ? getTimelinePercent(midterm, semesterStart, finals) : 0

  const shouldAnimateTimeline = !prefersReducedMotion && !semesterFill.dataset.motionPlayed
  const raceTrack = semesterFill.closest('.race-track')
  if (shouldAnimateTimeline) {
    semesterFill.dataset.motionPlayed = 'true'
    raceTrack?.classList.add('race-track--motion')
    semesterFill.style.width = '0%'
    todayMarker.style.left = '0%'
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        semesterFill.style.width = `${todayPercent}%`
        todayMarker.style.left = `${todayPercent}%`
      })
    })
  } else {
    semesterFill.style.width = `${todayPercent}%`
    todayMarker.style.left = `${todayPercent}%`
  }
  midtermMarker.hidden = !midterm
  if (midterm) midtermMarker.style.left = `${midtermPercent}%`
  finalsMarker.style.left = '100%'

  const midtermLabel = midtermMarker.querySelector('b')
  const midtermDateLabel = midtermMarker.querySelector('time')
  const finalsLabel = finalsMarker.querySelector('b')
  const finalsDateLabel = finalsMarker.querySelector('time')
  if (midtermLabel && midterm) midtermLabel.textContent = 'Midterm'
  if (midtermDateLabel && midterm) {
    midtermDateLabel.dateTime = midterm.toISOString().slice(0, 10)
    midtermDateLabel.textContent = formatShortDate(midterm)
  }
  if (finalsLabel) finalsLabel.textContent = 'Finals'
  if (finalsDateLabel) {
    finalsDateLabel.dateTime = finals.toISOString().slice(0, 10)
    finalsDateLabel.textContent = formatShortDate(finals)
  }

  if (semesterDateScale) {
    const ticks = [
      { label: 'Start', date: semesterStart },
      ...(midterm ? [{ label: 'Midterm', date: midterm }] : []),
      { label: 'Finals', date: finals }
    ]

    semesterDateScale.innerHTML = ticks.map((tick) => {
      const percent = getTimelinePercent(tick.date, semesterStart, finals)
      const isoDate = tick.date.toISOString().slice(0, 10)

      return `
        <span class="semester-date-scale__tick" style="left: ${percent}%">
          <i aria-hidden="true"></i>
          <strong>${tick.label}</strong>
          <time datetime="${isoDate}">${formatTimelineDate(tick.date)}</time>
        </span>
      `
    }).join('')
  }

  if (nextCheckpoint) {
    const nextExam = activeExamSchedule
      .map((exam) => {
        const examDate = getLocalDate(exam.date)
        return {
          ...exam,
          daysUntil: Math.ceil((examDate - startOfDay(today)) / 86400000)
        }
      })
      .find((exam) => exam.daysUntil >= 0)

    nextCheckpoint.innerHTML = nextExam
      ? `<span class="checkpoint-code">${escapeHtml(nextExam.code)}</span><span class="checkpoint-meta">${escapeHtml(getExamCountdownText(nextExam.daysUntil))} - ${escapeHtml(formatExamDate(nextExam.date))}, ${escapeHtml(nextExam.time)}</span>`
      : '<span class="checkpoint-code">Finals</span><span class="checkpoint-meta">Sep 19, 2026</span>'
  }
}

function renderAssignmentProgress() {
  const items = document.querySelectorAll('[data-assignment-progress], [data-deadline-progress]')
  if (!items.length) return

  const caps = activeAcademicSectionData?.capabilities || {}
  const assignmentsDisabled = caps.resourceFirst || caps.hasAssignments === false
  items.forEach((item) => {
    if (assignmentsDisabled) {
      if (item.dataset.capabilityOriginalHidden === undefined) {
        item.dataset.capabilityOriginalHidden = String(item.hidden)
      }
      item.hidden = true
      return
    }
    if (item.dataset.capabilityOriginalHidden !== undefined) {
      item.hidden = item.dataset.capabilityOriginalHidden === 'true'
      delete item.dataset.capabilityOriginalHidden
    }
  })
  if (assignmentsDisabled) {
    return
  }

  items.forEach((progress) => {
    const startDate = getLocalDate(progress.dataset.startDate)
    const dueDate = getLocalDate(progress.dataset.dueDate)
    const dueLabel = progress.dataset.dueLabel || formatExamDate(progress.dataset.dueDate)
    const today = new Date()
    const fill = progress.querySelector('[data-assignment-fill], [data-deadline-fill]')
    const daysLabel = progress.querySelector('[data-assignment-days], [data-deadline-days]')
    const caption = progress.querySelector('[data-assignment-caption], [data-deadline-caption]')

    const totalMs = dueDate - startDate
    const elapsedMs = today - startDate
    const percent = clamp((elapsedMs / totalMs) * 100, 0, 100)
    const displayPercent = progress.dataset.progressMode === 'remaining' ? 100 - percent : percent

    const daysLeft = Math.ceil((dueDate - today) / 86400000)

    if (fill) fill.style.width = `${displayPercent}%`

    if (daysLabel) {
      if (daysLeft > 1) {
        daysLabel.textContent = `${daysLeft} days left`
      } else if (daysLeft === 1) {
        daysLabel.textContent = '1 day left'
      } else if (daysLeft === 0) {
        daysLabel.textContent = 'Due today'
      } else {
        daysLabel.textContent = 'Deadline passed'
      }
    }

    if (caption) {
      caption.textContent = `Due ${dueLabel} - ${Math.round(percent)}% of the window has passed.`
    }
  })
}

function minutesFromTime(value) {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

function formatScheduleTime(start, end) {
  const formatOne = (value) => {
    const [hourValue, minuteValue] = value.split(':').map(Number)
    const suffix = hourValue >= 12 ? 'PM' : 'AM'
    const hour = hourValue % 12 || 12
    return `${hour}:${String(minuteValue).padStart(2, '0')} ${suffix}`
  }

  return `${formatOne(start)} - ${formatOne(end)}`
}

function getScheduleStatus(item, now = new Date()) {
  if (item.day !== now.getDay()) return 'upcoming'

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const startMinutes = minutesFromTime(item.start)
  const endMinutes = minutesFromTime(item.end)

  if (currentMinutes < startMinutes) return 'upcoming'
  if (currentMinutes >= endMinutes) return 'done'
  return 'now'
}

function getScheduleProgress(item, now = new Date()) {
  const startMinutes = minutesFromTime(item.start)
  const endMinutes = minutesFromTime(item.end)
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const durationMinutes = endMinutes - startMinutes
  if (durationMinutes <= 0) return { percent: 0, remainingMinutes: 0 }

  const elapsedMinutes = Math.max(0, Math.min(durationMinutes, currentMinutes - startMinutes))
  const remainingMinutes = Math.max(0, endMinutes - currentMinutes)

  return {
    percent: Math.round((elapsedMinutes / durationMinutes) * 100),
    remainingMinutes
  }
}

function renderScheduleProgress(item, now = new Date(), modifierClass = '') {
  if (getScheduleStatus(item, now) !== 'now') return ''

  const { percent, remainingMinutes } = getScheduleProgress(item, now)
  const label = remainingMinutes <= 1 ? 'ending now' : `${remainingMinutes} min left`
  const className = ['schedule-progress', modifierClass].filter(Boolean).join(' ')

  return `
    <div class="${className}" aria-label="${escapeHtml(`${percent}% done, ${label}`)}">
      <div class="schedule-progress__track">
        <span style="width: ${percent}%;"></span>
      </div>
      <div class="schedule-progress__label">
        <span>${escapeHtml(`${percent}% done`)}</span>
        <strong>${escapeHtml(label)}</strong>
      </div>
    </div>
  `
}

function minutesUntilNext(item, now = new Date()) {
  const today = now.getDay()
  const startMinutes = minutesFromTime(item.start)
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const dayDelta = (item.day - today + 7) % 7

  if (dayDelta === 0 && startMinutes > currentMinutes) {
    return startMinutes - currentMinutes
  }

  return dayDelta * 24 * 60 + startMinutes - currentMinutes
}

function getNextScheduleItem(items, now = new Date()) {
  return [...items]
    .map((item) => ({ ...item, waitMinutes: minutesUntilNext(item, now) }))
    .filter((item) => item.waitMinutes > 0)
    .sort((a, b) => a.waitMinutes - b.waitMinutes)[0] || null
}

function formatWait(minutes) {
  if (minutes < 60) return `starts in ${minutes} min`
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  if (days > 0 && hours > 0) return `starts in ${days}d ${hours}h`
  if (days > 0) return `starts in ${days} day${days > 1 ? 's' : ''}`
  return `starts in ${hours}h`
}

function getScheduleIcon(icon) {
  const icons = {
    stethoscope: '+',
    microscope: 'ONC',
    scalpel: 'SUR',
    case: 'MED',
    clinical: 'CR',
    syringe: 'AN',
    nutrition: 'NUT',
    lab: 'LAB'
  }

  return icons[icon] || '401'
}

function renderScheduleCard(item, now = new Date(), options = {}) {
  const status = options.status || getScheduleStatus(item, now)
  const typeLabel = item.type === 'round' ? 'Clinical round' : 'Lecture'
  const roomMarkup = item.room ? `<span>${escapeHtml(item.room)}</span>` : ''
  const statusLabel = status === 'now' ? 'Now' : status === 'done' ? 'Finished' : 'Upcoming'

  return `
    <article class="schedule-card schedule-card--${status}">
      <div class="schedule-card__icon" aria-hidden="true">${escapeHtml(getScheduleIcon(item.icon))}</div>
      <div class="schedule-card__body">
        <div class="schedule-card__meta">
          <span>${escapeHtml(typeLabel)}</span>
          <span>${escapeHtml(item.dayLabel)}</span>
          ${roomMarkup}
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(formatScheduleTime(item.start, item.end))}</p>
        ${renderScheduleProgress(item, now)}
      </div>
      <span class="schedule-card__status">${escapeHtml(statusLabel)}</span>
    </article>
  `
}

function renderScheduleGroup(items, day, now = new Date()) {
  const dayItems = items
    .filter((item) => item.day === day.day)
    .sort((a, b) => minutesFromTime(a.start) - minutesFromTime(b.start) || (a.room || '').localeCompare(b.room || ''))

  if (!dayItems.length) return ''

  const isToday = day.day === now.getDay()

  return `
    <section class="schedule-day ${isToday ? 'schedule-day--today' : ''}" aria-label="${escapeHtml(day.label)} schedule">
      <div class="schedule-day__top">
        <h3>${escapeHtml(day.label)}</h3>
        ${isToday ? '<span>Today</span>' : ''}
      </div>
      <div class="schedule-card-stack">
        ${dayItems.map((item) => renderScheduleCard(item, now)).join('')}
      </div>
    </section>
  `
}

function formatScheduleHour(hour) {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const label = hour % 12 || 12
  return `${label} ${suffix}`
}

function getCalendarBounds(items) {
  const starts = items.map((item) => minutesFromTime(item.start))
  const ends = items.map((item) => minutesFromTime(item.end))
  const startHour = Math.floor(Math.min(...starts) / 60)
  const endHour = Math.ceil(Math.max(...ends) / 60)

  return {
    startMinutes: startHour * 60,
    endMinutes: endHour * 60,
    hours: Array.from({ length: endHour - startHour + 1 }, (_, index) => startHour + index)
  }
}

function getScheduleLane(item, dayItems) {
  const itemStart = minutesFromTime(item.start)
  const itemEnd = minutesFromTime(item.end)
  const overlapping = dayItems
    .filter((candidate) => {
      const candidateStart = minutesFromTime(candidate.start)
      const candidateEnd = minutesFromTime(candidate.end)
      return itemStart < candidateEnd && itemEnd > candidateStart
    })
    .sort((a, b) => {
      const roomSort = (a.room || '').localeCompare(b.room || '')
      if (roomSort) return roomSort
      return a.title.localeCompare(b.title)
    })

  return {
    lane: Math.max(0, overlapping.indexOf(item)),
    laneCount: Math.max(1, overlapping.length)
  }
}

function renderScheduleCalendarEvent(item, dayItems, bounds, now = new Date()) {
  const startMinutes = minutesFromTime(item.start)
  const endMinutes = minutesFromTime(item.end)
  const totalMinutes = bounds.endMinutes - bounds.startMinutes
  const top = ((startMinutes - bounds.startMinutes) / totalMinutes) * 100
  const height = ((endMinutes - startMinutes) / totalMinutes) * 100
  const { lane, laneCount } = getScheduleLane(item, dayItems)
  const gap = laneCount > 1 ? 1.5 : 0
  const width = 100 / laneCount
  const left = lane * width
  const status = getScheduleStatus(item, now)
  const typeLabel = item.type === 'round' ? 'Round' : 'Lecture'
  const roomMarkup = item.room ? `<span class="schedule-calendar-event__room">${escapeHtml(item.room)}</span>` : ''

  return `
    <article
      class="schedule-calendar-event schedule-calendar-event--${escapeHtml(item.type)} schedule-calendar-event--${escapeHtml(status)}"
      style="--event-top: ${top}%; --event-height: ${height}%; --event-left: calc(${left}% + ${gap}px); --event-width: calc(${width}% - ${gap * 2}px);"
      aria-label="${escapeHtml(item.title)}, ${escapeHtml(formatScheduleTime(item.start, item.end))}"
    >
      <div class="schedule-calendar-event__top">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(typeLabel)}</span>
      </div>
      <p>${escapeHtml(formatScheduleTime(item.start, item.end))}</p>
      ${roomMarkup}
      ${renderScheduleProgress(item, now, 'schedule-progress--calendar')}
    </article>
  `
}

function renderScheduleCalendar(now = new Date()) {
  const activeCourseSchedule = activeAcademicSectionData.courseSchedule || []
  if (!activeCourseSchedule.length) return '<p class="empty-state">No weekly schedule has been added for this section yet.</p>'

  const bounds = getCalendarBounds(activeCourseSchedule)
  const hourCount = bounds.hours.length - 1

  const dayHeaders = scheduleDayOrder.map((day) => {
    const isToday = day.day === now.getDay()
    return `
      <div class="schedule-calendar__day-head ${isToday ? 'schedule-calendar__day-head--today' : ''}">
        <span>${escapeHtml(day.label.slice(0, 3))}</span>
        <strong>${escapeHtml(day.label)}</strong>
      </div>
    `
  }).join('')

  const hourLabels = bounds.hours.map((hour) => `
    <div class="schedule-calendar__hour-label">${escapeHtml(formatScheduleHour(hour))}</div>
  `).join('')

  const dayColumns = scheduleDayOrder.map((day) => {
    const dayItems = activeCourseSchedule
      .filter((item) => item.day === day.day)
      .sort((a, b) => minutesFromTime(a.start) - minutesFromTime(b.start) || (a.room || '').localeCompare(b.room || ''))
    const isToday = day.day === now.getDay()

    return `
      <div class="schedule-calendar__day ${isToday ? 'schedule-calendar__day--today' : ''}" aria-label="${escapeHtml(day.label)} calendar column">
        <div class="schedule-calendar__hour-lines" aria-hidden="true">
          ${Array.from({ length: hourCount }, () => '<span></span>').join('')}
        </div>
        ${dayItems.map((item) => renderScheduleCalendarEvent(item, dayItems, bounds, now)).join('')}
      </div>
    `
  }).join('')

  return `
    <div class="schedule-calendar__scroller">
      <div class="schedule-calendar__frame" style="--hour-count: ${hourCount};">
        <div class="schedule-calendar__corner" aria-hidden="true"></div>
        ${dayHeaders}
        <div class="schedule-calendar__hours" aria-hidden="true">${hourLabels}</div>
        ${dayColumns}
      </div>
    </div>
  `
}

function renderSchedulePage() {
  if (!scheduleTodayTitle && !scheduleTodaySummary && !scheduleNextCard && !scheduleTodayList && !scheduleCalendarGrid && !scheduleList) return

  const now = new Date()
  const activeCourseSchedule = activeAcademicSectionData.courseSchedule || []
  const todayName = now.toLocaleDateString('en-US', { weekday: 'long' })
  const todayItems = activeCourseSchedule
    .filter((item) => item.day === now.getDay())
    .sort((a, b) => minutesFromTime(a.start) - minutesFromTime(b.start) || (a.room || '').localeCompare(b.room || ''))
  const currentItem = todayItems.find((item) => getScheduleStatus(item, now) === 'now')
  const nextItem = getNextScheduleItem(activeCourseSchedule, now)

  if (scheduleTodayTitle) scheduleTodayTitle.textContent = `Today is ${todayName}`
  if (scheduleTodaySummary) {
    if (currentItem) {
      scheduleTodaySummary.textContent = `${currentItem.title} is happening now until ${formatScheduleTime(currentItem.start, currentItem.end).split(' - ')[1]}.`
    } else if (nextItem) {
      const nextPrefix = nextItem.day === now.getDay() ? 'Next today' : `Next on ${nextItem.dayLabel}`
      scheduleTodaySummary.textContent = `${nextPrefix}: ${nextItem.title} at ${formatScheduleTime(nextItem.start, nextItem.end).split(' - ')[0]}.`
    } else {
      scheduleTodaySummary.textContent = activeCourseSchedule.length
        ? 'No upcoming university items found in the weekly schedule.'
        : `No weekly ${activeAcademicSectionData.title} schedule has been added yet.`
    }
  }

  if (scheduleNextCard) {
    scheduleNextCard.innerHTML = currentItem
      ? renderScheduleCard(currentItem, now, { status: 'now' })
      : nextItem
        ? `${renderScheduleCard(nextItem, now)}<p class="schedule-next-card__wait">${escapeHtml(formatWait(nextItem.waitMinutes))}</p>`
        : `<p class="empty-state">No upcoming ${activeAcademicSectionData.title} schedule item.</p>`
  }

  if (scheduleTodayList) {
    scheduleTodayList.innerHTML = todayItems.length
      ? todayItems.map((item) => renderScheduleCard(item, now)).join('')
      : `<p class="empty-state">No ${activeAcademicSectionData.title} lectures or clinical rounds scheduled for today.</p>`
  }

  if (scheduleCalendarGrid) scheduleCalendarGrid.innerHTML = renderScheduleCalendar(now)

  if (scheduleList) {
    scheduleList.innerHTML = scheduleDayOrder
      .map((day) => renderScheduleGroup(activeCourseSchedule, day, now))
      .join('')
  }
}

function handleBookingSubmit(event) {
  event.preventDefault()

  const name = bookingName.value.trim()
  const service = bookingService.value
  const time = bookingTime.value

  if (!name || !service || !time) return

  const message = [
    'Hi Ahmed, I want to book a call.',
    `Name: ${name}`,
    `Service: ${service}`,
    `Preferred time: ${getTodayLabel()} at ${time}`
  ].join('\n')

  window.location.href = `https://wa.me/201030469634?text=${encodeURIComponent(message)}`
}

function getFormValue(name) {
  return historyForm?.elements[name]?.value?.trim() || ''
}

function getCheckedField(name, label) {
  return historyForm?.elements[name]?.checked ? label : ''
}

function clearPanelFields(panel) {
  panel?.querySelectorAll('input, select, textarea').forEach((field) => {
    if (field.type === 'checkbox' || field.type === 'radio') {
      field.checked = false
    } else {
      field.value = ''
    }
  })
}

function calculateAgeFromDob(dobValue) {
  if (!dobValue) return ''

  const dob = new Date(`${dobValue}T00:00:00`)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1
  }

  return age >= 0 ? `${age} years` : ''
}

function joinFilled(items, fallback = 'Not recorded') {
  const filled = items.filter(Boolean)
  return filled.length ? filled.join(', ') : fallback
}

function getSmokingDetails() {
  if (!historyForm?.elements.smoking?.checked) return ''

  const details = [
    getFormValue('smokingType'),
    getFormValue('cigarettesPerDay') ? `${getFormValue('cigarettesPerDay')} cigarettes/day` : '',
    getFormValue('smokingDuration') ? `for ${getFormValue('smokingDuration')}` : ''
  ].filter(Boolean)

  return details.length ? `smoking (${details.join(', ')})` : 'smoking'
}

function getSubstanceDetails() {
  if (!historyForm?.elements.substance?.checked) return ''

  const type = getFormValue('substanceType') === 'Other'
    ? getFormValue('substanceOther') || 'other substance'
    : getFormValue('substanceType')

  return type ? `substance use (${type})` : 'substance use'
}

function renderHistorySummary() {
  if (!historyForm || !historySummaryText) return

  const age = getFormValue('ageManual') || calculateAgeFromDob(getFormValue('dob'))
  const chronicDiseases = joinFilled([
    getCheckedField('hypertension', 'hypertension'),
    getCheckedField('diabetes', 'diabetes mellitus'),
    getCheckedField('cardiac', 'cardiac disease'),
    getCheckedField('renal', 'renal disease'),
    getCheckedField('hepatic', 'hepatic disease'),
    getCheckedField('asthma', 'asthma/COPD')
  ], 'No selected chronic disease')
  const habits = joinFilled([
    getSmokingDetails(),
    getCheckedField('alcohol', 'alcohol use'),
    getSubstanceDetails(),
    getCheckedField('occupationalExposure', 'occupational exposure')
  ], 'No selected special habit')

  const identityLine = [
    getFormValue('patientName') || 'Patient',
    age,
    getFormValue('sex'),
    getFormValue('occupation') ? `works as ${getFormValue('occupation')}` : '',
    getFormValue('residence') ? `from ${getFormValue('residence')}` : ''
  ].filter(Boolean).join(', ')

  const painAnalysis = [
    getFormValue('site') && `site: ${getFormValue('site')}`,
    getFormValue('painOnset') && `onset: ${getFormValue('painOnset')}`,
    getFormValue('character') && `character: ${getFormValue('character')}`,
    getFormValue('radiation') && `radiation: ${getFormValue('radiation')}`,
    getFormValue('associations') && `associations: ${getFormValue('associations')}`,
    getFormValue('timing') && `timing: ${getFormValue('timing')}`,
    getFormValue('exacerbating') && `exacerbating: ${getFormValue('exacerbating')}`,
    getFormValue('relieving') && `relieving: ${getFormValue('relieving')}`,
    getFormValue('severity') && `severity: ${getFormValue('severity')}`
  ].filter(Boolean).join('; ')

  const lines = [
    identityLine || 'Patient identity not recorded.',
    getFormValue('complaint')
      ? `Chief complaint: ${getFormValue('complaint')}${getFormValue('duration') ? ` for ${getFormValue('duration')}` : ''}.`
      : 'Chief complaint: not recorded.',
    getFormValue('onset') ? `Mode of onset: ${getFormValue('onset')}.` : '',
    getFormValue('hpi') ? `History of present illness: ${getFormValue('hpi')}` : '',
    painAnalysis ? `Focused symptom analysis: ${painAnalysis}.` : '',
    `Past medical history: ${chronicDiseases}. ${getFormValue('pastHistory')}`,
    getFormValue('surgicalHistory') ? `Surgical history: ${getFormValue('surgicalHistory')}` : '',
    getFormValue('drugHistory') ? `Drug history: ${getFormValue('drugHistory')}` : 'Drug history: not recorded.',
    getFormValue('allergies') ? `Allergies: ${getFormValue('allergies')}` : 'Allergies: not recorded.',
    getFormValue('vaccination') ? `Vaccination history: ${getFormValue('vaccination')}` : '',
    getFormValue('familyHistory') ? `Family history: ${getFormValue('familyHistory')}` : '',
    `Social and special habits: ${habits}. ${getFormValue('socialHistory')}`,
    getFormValue('ros') ? `Review of systems: ${getFormValue('ros')}` : ''
  ].filter(Boolean)

  historySummaryText.textContent = lines.join('\n\n')
}

function updateHistoryProgress() {
  if (!historyForm || !historyProgressCount || !historyProgressFill) return

  const checks = [...historyForm.querySelectorAll('[data-history-check]')]
  const completed = checks.filter((check) => check.checked).length
  const total = checks.length
  const percent = total ? Math.round((completed / total) * 100) : 0

  historyProgressCount.textContent = `${completed} / ${total}`
  historyProgressFill.style.width = `${percent}%`
}

function handleHistoryInput(event) {
  syncHistoryAge(event)
  toggleHistoryConditionalSections()
  updateHistoryProgress()
  renderHistorySummary()
}

function syncHistoryAge(event) {
  if (!historyForm) return

  const dobField = historyForm.elements.dob
  const ageField = historyForm.elements.ageManual
  if (!dobField || !ageField || event?.target !== dobField) return

  const calculatedAge = calculateAgeFromDob(dobField.value)
  if (calculatedAge) {
    ageField.value = calculatedAge
  }
}

function toggleHistoryConditionalSections() {
  if (!historyForm) return

  const smokingChecked = Boolean(historyForm.elements.smoking?.checked)
  const substanceChecked = Boolean(historyForm.elements.substance?.checked)
  const substanceIsOther = getFormValue('substanceType') === 'Other'

  if (smokingDetails) {
    if (!smokingChecked && !smokingDetails.hidden) clearPanelFields(smokingDetails)
    smokingDetails.hidden = !smokingChecked
  }

  if (substanceDetails) {
    if (!substanceChecked && !substanceDetails.hidden) clearPanelFields(substanceDetails)
    substanceDetails.hidden = !substanceChecked
  }

  if (substanceOtherField) {
    if (!substanceIsOther && !substanceOtherField.hidden) clearPanelFields(substanceOtherField)
    substanceOtherField.hidden = !substanceChecked || !substanceIsOther
  }
}

function getNewsCardId(card) {
  const title = card.querySelector('h2')?.textContent?.trim() || 'news'
  return card.dataset.newsId || `${card.dataset.course || 'all'}::${card.dataset.date || ''}::${title}`
}

function getNewsSeenCards() {
  try {
    return new Set(JSON.parse(localStorage.getItem(NEWS_SEEN_STORAGE_KEY) || '[]'))
  } catch {
    localStorage.removeItem(NEWS_SEEN_STORAGE_KEY)
    return new Set()
  }
}

function getNewsExpiryDate(card) {
  if (!card.dataset.date) return null
  const expiry = new Date(`${card.dataset.date}T00:00:00`)
  if (!Number.isFinite(expiry.getTime())) return null
  expiry.setHours(expiry.getHours() + NEWS_EXPIRY_HOURS)
  return expiry
}

function isNewsCardExpired(card, now = new Date()) {
  if (card.dataset.persistent === 'true') return false
  const expiry = getNewsExpiryDate(card)
  return expiry ? now >= expiry : false
}

function renderNewsNavBadge(cards = []) {
  if (!newsNavLinks.length) return

  newsNavLinks.forEach((link) => {
    link.querySelector('.site-nav__badge')?.remove()
    link.classList.remove('site-nav__link--has-news')
  })

  const unreadCount = cards.filter((card) => {
    const cardSection = card.dataset.section || '401'
    return cardSection === activeAcademicSection && card.dataset.published === 'true' && isCurrentWeekDate(card.dataset.createdAt) && !isNewsCardExpired(card)
  }).length
  if (!unreadCount) return

  newsNavLinks.forEach((link) => {
    link.classList.add('site-nav__link--has-news')
    link.insertAdjacentHTML('beforeend', `
      <span class="site-nav__badge" aria-label="New news published this university week">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16l-2-2Z"></path>
          <path d="M10 21h4"></path>
        </svg>
      </span>
    `)
  })
}

function markNewsCardsSeen(cards = []) {
  if (!cards.length) return
  const seenCards = getNewsSeenCards()
  cards
    .filter((card) => (card.dataset.section || '401') === activeAcademicSection && !isNewsCardExpired(card))
    .forEach((card) => seenCards.add(getNewsCardId(card)))
  try {
    localStorage.setItem(NEWS_SEEN_STORAGE_KEY, JSON.stringify([...seenCards]))
  } catch {
    // Keep the page usable when browser storage is blocked.
  }
}

function ensureSectionNewsCard() {
  if (newsCardsState.remoteSections.has(getUniversitySectionKey())) return
  if (!newsFeed) return

  const fallback = activeAcademicSectionData?.fallbackNewsCard
  if (!fallback) return

  if (newsFeed.querySelector(`[data-news-id="${fallback.id}"]`)) return

  const card = document.createElement('article')
  card.className = 'update-panel update-panel--primary update-panel--wide'
  card.dataset.newsId = fallback.id
  card.dataset.section = activeAcademicSection
  card.dataset.course = 'all'
  card.dataset.date = fallback.date || '2026-07-06'
  card.dataset.priority = String(fallback.priority || 1)
  card.dataset.persistent = String(!!fallback.persistent)

  const factsHtml = fallback.facts?.length
    ? `<dl class="update-facts update-facts--three">${fallback.facts.map((f) => `<div><dt>${escapeHtml(f.label)}</dt><dd>${escapeHtml(f.value)}</dd></div>`).join('')}</dl>`
    : ''

  card.innerHTML = `
    <div class="update-panel__top">
      <p class="card__kicker">${escapeHtml(fallback.kicker || activeAcademicSection)}</p>
      ${fallback.badge ? `<span class="status-pill status-pill--open">${escapeHtml(fallback.badge)}</span>` : ''}
    </div>
    <h2>${escapeHtml(fallback.title)}</h2>
    <p>${escapeHtml(fallback.body)}</p>
    ${factsHtml}
  `
  newsFeed.prepend(card)
}

function getNewsRows(section = activeAcademicSection, universityId = activeUniversityId) {
  return newsCardsState.rowsBySection.get(getUniversitySectionKey(universityId, section)) || []
}

function isNewsAdminForSection(section = activeAcademicSection, universityId = activeUniversityId) {
  return isTrackerAdmin()
    && String(trackerAdminState.profile?.allowed_university_id || 'must') === String(universityId)
    && String(trackerAdminState.profile?.allowed_section || '') === String(section)
}

function getSafeExternalUrl(value = '') {
  if (!value) return ''
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : ''
  } catch {
    return ''
  }
}

function getNewsTagClass(tag = '') {
  const normalized = tag.toLowerCase()
  if (normalized.includes('exam')) return 'exam'
  if (normalized.includes('schedule')) return 'schedule'
  if (normalized.includes('resource') || normalized.includes('tracker')) return 'resource'
  return 'assignment'
}

function renderNewsAdminToolbar() {
  if (newsAdminToolbar) newsAdminToolbar.hidden = !isNewsAdminForSection()
}

function renderRemoteNewsCard(row) {
  const card = document.createElement('article')
  const pinned = row.card_group === 'pinned'
  card.className = `update-panel${pinned ? ' update-panel--primary' : ''}${row.is_wide ? ' update-panel--wide' : ''}${row.published ? '' : ' news-card--draft'}`
  card.dataset.newsId = row.id
  card.dataset.university = row.university_id || 'must'
  card.dataset.section = row.section
  card.dataset.course = row.course || 'all'
  card.dataset.date = row.card_date || ''
  card.dataset.group = row.card_group || 'regular'
  card.dataset.persistent = String(pinned)
  card.dataset.order = String(row.display_order ?? 0)
  card.dataset.published = String(Boolean(row.published))
  card.dataset.createdAt = row.created_at || ''
  card.dir = row.text_direction === 'rtl' ? 'rtl' : 'ltr'

  const facts = Array.isArray(row.facts) ? row.facts.filter((fact) => fact?.label && fact?.value) : []
  const paragraphs = String(row.body || '').split(/\n{2,}/).filter(Boolean)
  const groupRows = getNewsRows(row.section, row.university_id || 'must').filter((item) => item.card_group === row.card_group)
  const groupIndex = groupRows.findIndex((item) => item.id === row.id)
  const body = paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`).join('')
  const factsHtml = facts.length ? `<dl class="update-facts${facts.length === 3 ? ' update-facts--three' : ''}">${facts.map((fact) => `<div><dt>${escapeHtml(fact.label)}</dt><dd>${escapeHtml(fact.value)}</dd></div>`).join('')}</dl>` : ''
  const safeActionUrl = getSafeExternalUrl(row.action_url)
  const action = safeActionUrl && row.action_label ? `<a class="news-action" href="${escapeHtml(safeActionUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.action_label)}</a>` : ''
  const deadline = row.deadline_start && row.deadline_due ? `<div class="assignment-progress assignment-progress--top" data-deadline-progress data-progress-mode="remaining" data-start-date="${escapeHtml(row.deadline_start)}" data-due-date="${escapeHtml(row.deadline_due)}" data-due-label="${escapeHtml(row.deadline_label || row.deadline_due)}"><div class="assignment-progress__top"><strong data-deadline-days>${escapeHtml(row.deadline_label || row.deadline_due)}</strong></div><div class="assignment-progress__bar" aria-hidden="true"><span data-deadline-fill></span></div></div>` : ''
  const adminControls = isNewsAdminForSection(row.section, row.university_id || 'must') ? `<div class="news-admin-card-controls"><button type="button" data-news-move="up" aria-label="Move up" ${groupIndex <= 0 ? 'disabled' : ''}>↑</button><button type="button" data-news-move="down" aria-label="Move down" ${groupIndex >= groupRows.length - 1 ? 'disabled' : ''}>↓</button><button type="button" data-news-toggle-pin>${pinned ? 'Unpin' : 'Pin'}</button><button type="button" data-news-toggle-publish>${row.published ? 'Unpublish' : 'Publish'}</button><button type="button" data-news-edit>Edit</button><button type="button" data-news-delete>Delete</button></div>` : ''

  card.innerHTML = `${adminControls}${deadline}<div class="update-panel__top"><p class="card__kicker">${escapeHtml(row.kicker || row.course || '')}</p>${row.tag ? `<span class="news-tag news-tag--${getNewsTagClass(row.tag)}">${escapeHtml(row.tag)}</span>` : ''}${row.badge ? `<span class="status-pill status-pill--open">${escapeHtml(row.badge)}</span>` : ''}</div><h2>${escapeHtml(row.title)}</h2><div class="news-card__body">${body}</div>${factsHtml}${action}`
  return card
}

function replaceNewsFeedWithRemoteRows() {
  if (!newsFeed || !newsCardsState.remoteSections.has(getUniversitySectionKey())) return
  newsFeed.querySelectorAll('.update-panel, .news-group, [data-news-empty]').forEach((item) => item.remove())
  getNewsRows().forEach((row) => newsFeed.append(renderRemoteNewsCard(row)))
}

async function refreshRemoteNewsCards(section = activeAcademicSection, universityId = activeUniversityId) {
  const targetSectionData = isUniversitySection(universityId, section) ? getAcademicSection(section, universityId) : null
  const caps = targetSectionData?.capabilities || {}
  if (caps.resourceFirst) return

  const stateKey = getUniversitySectionKey(universityId, section)
  if (!newsFeed || !isSupabaseConfigured() || newsCardsState.loadingSections.has(stateKey)) return
  newsCardsState.loadingSections.add(stateKey)
  renderTodayFreshnessStatus()
  try {
    const rows = await fetchNewsCards(universityId, section)
    newsCardsState.errorSections.delete(stateKey)
    if (rows.length || newsCardsState.remoteSections.has(stateKey)) {
      newsCardsState.rowsBySection.set(stateKey, rows)
      newsCardsState.remoteSections.add(stateKey)
      if (universityId === activeUniversityId && section === activeAcademicSection) {
        replaceNewsFeedWithRemoteRows()
        renderNewsFilters()
        renderAssignmentProgress()
      }
    }
  } catch (error) {
    newsCardsState.errorSections.add(stateKey)
    console.warn('Remote news data unavailable; using static fallback.', error)
    if (newsAdminStatus && isNewsAdminForSection(section)) newsAdminStatus.textContent = `News sync unavailable: ${error.message}`
  } finally {
    newsCardsState.loadingSections.delete(stateKey)
    renderTodayCockpit()
  }
}

function parseNewsFacts(value = '') {
  return String(value).split('\n').map((line) => {
    const separator = line.indexOf('|')
    if (separator < 0) return null
    const label = line.slice(0, separator).trim()
    const factValue = line.slice(separator + 1).trim()
    return label && factValue ? { label, factValue } : null
  }).filter(Boolean)
}

function getNewsFormRow(form) {
  const data = new FormData(form)
  const id = String(data.get('id') || '').trim()
  const title = String(data.get('title') || '').trim()
  const body = String(data.get('body') || '').trim()
  const actionUrl = String(data.get('action_url') || '').trim()
  if (!title || !body) throw new Error('Title and body are required.')
  if (actionUrl && !getSafeExternalUrl(actionUrl)) throw new Error('Action URL must start with http:// or https://.')
  const group = data.get('card_group') === 'regular' ? 'regular' : 'pinned'
  const existing = getNewsRows().find((row) => row.id === id)
  const groupRows = getNewsRows().filter((row) => row.card_group === group)
  return {
    id: id || `news-${Date.now().toString(36)}`,
    university_id: activeUniversityId,
    section: activeAcademicSection,
    title,
    body,
    text_direction: data.get('text_direction') === 'rtl' ? 'rtl' : 'ltr',
    course: String(data.get('course') || 'all').trim() || 'all',
    card_date: data.get('card_date') || null,
    kicker: String(data.get('kicker') || '').trim(),
    tag: String(data.get('tag') || '').trim(),
    badge: String(data.get('badge') || '').trim(),
    deadline_start: data.get('deadline_start') || null,
    deadline_due: data.get('deadline_due') || null,
    deadline_label: String(data.get('deadline_label') || '').trim(),
    facts: parseNewsFacts(data.get('facts')),
    action_label: String(data.get('action_label') || '').trim(),
    action_url: actionUrl,
    card_group: group,
    display_order: existing?.card_group === group ? existing.display_order : ((groupRows.at(-1)?.display_order || 0) + 10),
    is_wide: data.get('is_wide') === 'on',
    published: data.get('published') === 'on'
  }
}

function openNewsAdminEditor(row = null) {
  if (!newsAdminModal || !newsAdminForm || !isNewsAdminForSection()) return
  newsAdminForm.reset()
  newsAdminForm.elements.published.checked = row ? Boolean(row.published) : true
  newsAdminForm.elements.card_group.value = row?.card_group || 'pinned'
  newsAdminForm.elements.text_direction.value = row?.text_direction || 'ltr'
  if (row) {
    Object.entries(row).forEach(([key, value]) => {
      const field = newsAdminForm.elements.namedItem(key)
      if (!field || ['facts', 'published', 'is_wide'].includes(key)) return
      field.value = value ?? ''
    })
    newsAdminForm.elements.facts.value = (row.facts || []).map((fact) => `${fact.label} | ${fact.value}`).join('\n')
    newsAdminForm.elements.is_wide.checked = Boolean(row.is_wide)
  }
  newsAdminModalTitle.textContent = row ? 'Edit news card' : 'Add news card'
  newsAdminFormStatus.textContent = ''
  newsAdminModal.hidden = false
  document.body.classList.add('admin-modal-open')
  activateManagedModal(newsAdminModal, closeNewsAdminEditor, newsAdminModal.querySelector('input, textarea, select, button'))
}

function closeNewsAdminEditor() {
  if (!newsAdminModal) return
  deactivateManagedModal(newsAdminModal)
  newsAdminModal.hidden = true
  document.body.classList.remove('admin-modal-open')
}

async function saveNewsAdminForm(form) {
  const submit = form.querySelector('[type="submit"]')
  if (submit) submit.disabled = true
  newsAdminFormStatus.textContent = 'Saving...'
  try {
    await upsertNewsCard(getNewsFormRow(form))
    closeNewsAdminEditor()
    await refreshRemoteNewsCards(activeAcademicSection)
    newsAdminStatus.textContent = 'News card saved.'
  } catch (error) {
    newsAdminFormStatus.textContent = error.message
  } finally {
    if (submit) submit.disabled = false
  }
}

async function moveNewsCard(row, direction) {
  const groupRows = getNewsRows().filter((item) => item.card_group === row.card_group)
  const index = groupRows.findIndex((item) => item.id === row.id)
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (index < 0 || targetIndex < 0 || targetIndex >= groupRows.length) return
  const target = groupRows[targetIndex]
  await updateNewsCardOrder([
    { id: row.id, university_id: row.university_id, section: row.section, display_order: target.display_order },
    { id: target.id, university_id: target.university_id, section: target.section, display_order: row.display_order }
  ])
  await refreshRemoteNewsCards(row.section, row.university_id)
}

function renderNewsFilters() {
  if (!newsFeed) return

  ensureSectionNewsCard()
  renderNewsAdminToolbar()
  const course = newsCourseFilter?.value || 'all'
  const order = newsDateFilter?.value || 'newest'
  const now = new Date()
  const cards = [...newsFeed.querySelectorAll('.update-panel')]
  const seenCards = getNewsSeenCards()
  renderNewsNavBadge(cards)

  // Find or create pinned container
  let pinnedContainer = newsFeed.querySelector('.news-group--pinned')
  if (!pinnedContainer) {
    pinnedContainer = document.createElement('div')
    pinnedContainer.className = 'news-group news-group--pinned'
    pinnedContainer.innerHTML = '<h3 class="news-group-title">Pinned & Important</h3><div class="news-group-list"></div>'
    newsFeed.append(pinnedContainer)
  }
  const pinnedList = pinnedContainer.querySelector('.news-group-list')
  pinnedList.innerHTML = ''

  // Find or create older container
  let olderContainer = newsFeed.querySelector('.news-group--older')
  if (!olderContainer) {
    olderContainer = document.createElement('div')
    olderContainer.className = 'news-group news-group--older collapsed'
    olderContainer.innerHTML = `
      <div class="news-group-header">
        <button class="news-older-toggle" type="button" id="news-older-toggle">
          <span>Show Older Updates</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>
      <div class="news-group-list"></div>
    `
    newsFeed.append(olderContainer)

    const toggleBtn = olderContainer.querySelector('#news-older-toggle')
    toggleBtn.addEventListener('click', () => {
      const isCollapsed = olderContainer.classList.toggle('collapsed')
      toggleBtn.querySelector('span').textContent = isCollapsed ? 'Show Older Updates' : 'Hide Older Updates'
    })
  }
  const olderList = olderContainer.querySelector('.news-group-list')
  olderList.innerHTML = ''

  let hasPinned = false
  let hasOlder = false

  cards
    .sort((a, b) => {
      if (newsCardsState.remoteSections.has(activeAcademicSection)) {
        const groupDifference = (a.dataset.group === 'pinned' ? 0 : 1) - (b.dataset.group === 'pinned' ? 0 : 1)
        if (groupDifference) return groupDifference
        return Number(a.dataset.order || 0) - Number(b.dataset.order || 0)
      }
      const priorityDifference = Number(b.dataset.priority || 0) - Number(a.dataset.priority || 0)
      if (priorityDifference) return priorityDifference
      const difference = new Date(a.dataset.date || 0) - new Date(b.dataset.date || 0)
      return order === 'oldest' ? difference : -difference
    })
    .forEach((card) => {
      const cardSection = card.dataset.section || '401'
      const expired = isNewsCardExpired(card, now)
      const unpublished = card.dataset.published === 'false' && !isNewsAdminForSection(cardSection)
      const isHidden = cardSection !== activeAcademicSection || expired || unpublished || (course !== 'all' && card.dataset.course !== course)

      card.hidden = isHidden
      if (isHidden) return

      const isUnseen = !expired && !seenCards.has(getNewsCardId(card))
      card.classList.toggle('update-panel--new', isUnseen)
      if (!prefersReducedMotion && isUnseen && !card.dataset.motionSeen) {
        card.dataset.motionSeen = 'true'
        card.classList.add('update-panel--new-flash')
      }

      const isPinned = card.dataset.group ? card.dataset.group === 'pinned' : Number(card.dataset.priority || 0) > 0 || card.dataset.persistent === 'true' || card.classList.contains('update-panel--primary')

      if (isPinned) {
        pinnedList.append(card)
        hasPinned = true
      } else {
        olderList.append(card)
        hasOlder = true
      }
    })

  pinnedContainer.style.display = hasPinned ? 'block' : 'none'
  olderContainer.style.display = hasOlder ? 'block' : 'none'

  const hasVisibleCards = hasPinned || hasOlder
  let emptyState = newsFeed.querySelector('[data-news-empty]')

  if (!hasVisibleCards) {
    if (!emptyState) {
      emptyState = document.createElement('div')
      emptyState.className = 'topic-empty topic-empty--panel'
      emptyState.dataset.newsEmpty = 'true'
      emptyState.textContent = 'No updates match the selected filters.'
      newsFeed.append(emptyState)
    }
  } else {
    emptyState?.remove()
  }
  renderTodayCockpit()
}

function setAuthLoadingStep(step = 'account', section = '') {
  const safeStep = ['account', 'section', 'progress'].includes(step) ? step : 'account'
  if (authGate) authGate.dataset.authLoadingStep = safeStep
  authLoadingSteps.forEach((item) => {
    if (item.dataset.authLoadingStep === safeStep) {
      item.setAttribute('aria-current', 'step')
    } else {
      item.removeAttribute('aria-current')
    }
  })
  if (authGateContext) {
    const showSection = isUniversitySection(activeUniversityId, section)
    authGateContext.textContent = showSection ? `MED ${section}` : ''
    authGateContext.hidden = !showSection
  }
}

function setAuthGateState(state, message = '') {
  const wasChecking = document.body.dataset.authState === 'checking'
  document.body.dataset.authState = state
  if (authGate) {
    authGate.setAttribute('aria-busy', String(state === 'checking'))
    const titleIds = {
      checking: 'auth-checking-title',
      'signed-out': 'auth-signin-title',
      'needs-university': 'auth-university-title',
      'needs-section': 'auth-section-title'
    }
    const titleId = titleIds[state]
    if (titleId && document.getElementById(titleId)) {
      authGate.setAttribute('aria-labelledby', titleId)
    } else {
      authGate.removeAttribute('aria-labelledby')
    }
  }
  if (state === 'checking') {
    if (authGateDelay && (!wasChecking || !authGateDelayTimer)) {
      window.clearTimeout(authGateDelayTimer)
      authGateDelay.hidden = true
      authGateDelayTimer = window.setTimeout(() => {
        if (document.body.dataset.authState === 'checking') {
          authGateDelay.hidden = false
        }
        authGateDelayTimer = 0
      }, 2500)
    }
  } else {
    window.clearTimeout(authGateDelayTimer)
    authGateDelayTimer = 0
    if (authGateDelay) authGateDelay.hidden = true
  }
  if (authGateStatus) {
    authGateStatus.textContent = message
    authGateStatus.hidden = !message
  }
  window.requestAnimationFrame(syncProfileOnboardingTour)
}

function setUniversitySelectionMode(mode = 'onboarding') {
  studentProgressState.sectionSelectionMode = mode
  const switching = mode === 'switch'
  if (authGate) authGate.dataset.universitySelectionMode = mode
  if (authUniversityTitle) authUniversityTitle.textContent = switching ? 'Switch your university' : 'Choose your university'
  if (authUniversityCopy) {
    authUniversityCopy.textContent = isLocalTestMode
      ? 'Local preview only. Your choice stays in this browser and does not change your Google account.'
      : (switching
          ? 'Choose a university, then confirm its academic section.'
          : 'Your university and academic section will be saved to your account.')
  }
  if (authUniversityCancel) authUniversityCancel.hidden = !switching
}

function renderAuthSectionChoices(universityId) {
  if (!authSectionChoices) return
  const university = getUniversity(universityId)
  authSectionChoices.dataset.university = university.id

  const activeSectionId = studentProgressState.selectedSection || activeAcademicSection

  if (university.id === 'must') {
    const sectionMeta = {
      '401': { badge: '⭐ Active Tracker', badgeClass: 'badge--active', desc: 'Internal Med 1 • Surgery 1 • Schedule & MCQs' },
      '402': { badge: '⭐ Active Tracker', badgeClass: 'badge--active', desc: 'Internal Med 2 • Surgery 2 • Gyn & MCQs' },
      '301': { badge: '📁 Resources', badgeClass: 'badge--resource', desc: 'Clinical & Basic Modules' },
      '302': { badge: '📁 Resources', badgeClass: 'badge--resource', desc: 'Clinical & Basic Modules' },
      '201': { badge: '📁 Resources', badgeClass: 'badge--resource', desc: 'Pre-clinical Modules' },
      '202': { badge: '📁 Resources', badgeClass: 'badge--resource', desc: 'Pre-clinical Modules' },
      '101': { badge: '📁 Resources', badgeClass: 'badge--resource', desc: 'Foundations & MSK 1' },
      '102': { badge: '📁 Resources', badgeClass: 'badge--resource', desc: 'Pre-clinical Modules' }
    }

    const yearGroups = mustAcademicYears.map((yearGroup) => {
      const availableSections = yearGroup.sections.filter((sectionId) => university.sections.includes(sectionId))
      if (!availableSections.length) return ''
      const buttons = availableSections.map((sectionId) => {
        const section = getAcademicSection(sectionId, university.id)
        const meta = sectionMeta[sectionId] || { badge: 'Semester', badgeClass: '', desc: 'Clinical Semester' }
        const isCurrent = sectionId === activeSectionId
        return `
          <button type="button" class="auth-gate__section-card${isCurrent ? ' auth-gate__section-card--active' : ''}" data-auth-section="${escapeHtml(sectionId)}">
            <div class="auth-gate__section-card-header">
              <span class="auth-gate__section-badge ${meta.badgeClass}">${escapeHtml(meta.badge)}</span>
              ${isCurrent ? '<span class="auth-gate__section-current">Active</span>' : ''}
            </div>
            <strong class="auth-gate__section-title">${escapeHtml(section.title)}</strong>
            <span class="auth-gate__section-desc">${escapeHtml(meta.desc)}</span>
          </button>
        `
      }).join('')
      return `
        <div class="auth-gate__year-group">
          <span class="auth-gate__year-label">${escapeHtml(yearGroup.label)}</span>
          <div class="auth-gate__year-grid">${buttons}</div>
        </div>
      `
    }).join('')

    const historyButton = `
      <div class="auth-gate__tool-wrapper">
        <span class="auth-gate__year-label">Clinical Utilities</span>
        <button class="auth-gate__tool-card" type="button" data-auth-history>
          <div class="auth-gate__tool-icon">🩺</div>
          <div class="auth-gate__tool-info">
            <strong>History Taking Tool</strong>
            <span>Interactive OSCE & clerkship history generator</span>
          </div>
          <span class="auth-gate__tool-arrow" aria-hidden="true">→</span>
        </button>
      </div>
    `
    authSectionChoices.innerHTML = `${yearGroups}${historyButton}`
    return
  }

  const sectionButtons = university.sections.map((sectionId) => {
    const section = getAcademicSection(sectionId, university.id)
    if ((university.id === 'o6u' || university.id === 'delta') && sectionId === 'physical-therapy') {
      const facultyLogoUrl = university.id === 'o6u'
        ? '/assets/o6u-physical-therapy-logo.jpg'
        : university.logoUrl
      return `
        <button class="auth-gate__faculty-card" type="button" data-auth-section="${escapeHtml(sectionId)}">
          <span class="auth-gate__faculty-logo">
            <img src="${escapeHtml(facultyLogoUrl)}" alt="" width="480" height="640">
          </span>
          <span class="auth-gate__faculty-copy">
            <small>Faculty</small>
            <strong>${escapeHtml(section.title)}</strong>
            <span>${escapeHtml(university.name)}</span>
          </span>
          <span class="auth-gate__faculty-arrow" aria-hidden="true">→</span>
        </button>
      `
    }
    return `
      <button type="button" class="auth-gate__section-card" data-auth-section="${escapeHtml(sectionId)}">
        <strong class="auth-gate__section-title">${escapeHtml(section.title)}</strong>
        <span class="auth-gate__section-desc">${escapeHtml(university.name)}</span>
      </button>
    `
  }).join('')
  authSectionChoices.innerHTML = sectionButtons
}

function setSectionSelectionMode(mode = 'onboarding') {
  studentProgressState.sectionSelectionMode = mode
  const switching = mode === 'switch'
  const university = getUniversity(studentProgressState.pendingUniversity || activeUniversityId)
  if (authSectionTitle) {
    authSectionTitle.textContent = switching
      ? `Switch your ${university.shortName} section`
      : `Choose your ${university.shortName} section`
  }
  if (authSectionCopy) {
    authSectionCopy.textContent = isLocalTestMode
      ? 'Local preview only. This selection is stored on this device without cloud writes.'
      : (switching
          ? 'Your new university and section will be saved to your Google account.'
          : 'We will save both choices and open them automatically next time.')
  }
  if (authSectionCancel) authSectionCancel.hidden = !switching
  renderAuthSectionChoices(university.id)
}

function isSavedAcademicSection(section) {
  return isUniversitySection(activeUniversityId, section)
}

function redirectToRequiredProfile(universityId, section) {
  const profileUrl = new URL('/profile.html', window.location.origin)
  profileUrl.searchParams.set('setup', 'required')
  const safeUniversity = isSavedUniversity(universityId) ? universityId : 'must'
  const safeSection = isUniversitySection(safeUniversity, section)
    ? section
    : getDefaultSectionForUniversity(safeUniversity)
  profileUrl.searchParams.set('university', safeUniversity)
  profileUrl.searchParams.set('section', safeSection)
  window.location.replace(profileUrl.toString())
}

function routeAuthenticatedUser(universityId, section, options = {}) {
  const safeUniversity = isSavedUniversity(universityId) ? universityId : 'must'
  const safeSection = isUniversitySection(safeUniversity, section)
    ? section
    : getDefaultSectionForUniversity(safeUniversity)
  const scopeChanged = safeUniversity !== activeUniversityId || safeSection !== activeAcademicSection
  activeUniversityId = safeUniversity
  studentProgressState.selectedUniversity = safeUniversity
  studentProgressState.selectedSection = safeSection
  if (scopeChanged) {
    liveActivityState.rows = []
    liveActivityState.lastFetched = 0
    liveActivityState.unavailable = false
    onlineStudentsState.rows = []
    onlineStudentsState.lastFetched = 0
    onlineStudentsState.unavailable = false
  }

  if (!isStandaloneProfilePage && !isProfileSetupComplete()) {
    redirectToRequiredProfile(safeUniversity, safeSection)
    return
  }

  if (isStandaloneProfilePage) {
    activeAcademicSection = safeSection
    activeSiteMode = 'profile'
    updateAcademicSectionUi()
    syncModeToBody()
    loadStudentProgress(activeAcademicSection)
      .then(() => fetchAndRenderLeaderboard(true))
      .catch((error) => console.warn('Profile progress refresh failed.', error))
    const url = new URL(window.location.href)
    url.searchParams.set('university', activeUniversityId)
    url.searchParams.set('section', activeAcademicSection)
    updateSiteHistory(url, options.historyMode || 'replace')
    renderProfileSection()
    setAuthGateState('ready')
    return
  }

  const preserveDestination = options.preserveDestination !== false
  const hash = preserveDestination ? window.location.hash : ''
  if (hash === '#history') {
    showToolsSection({ scroll: false, historyMode: 'replace' })
  } else if (hash === '#work') {
    showWorkSection({ scroll: false, historyMode: 'replace' })
  } else {
    const safeHash = ['#tracker', '#news', '#schedule', '#leaderboard'].includes(hash) ? hash : '#tracker'
    showAcademicSection(safeSection, {
      subjectCode: preserveDestination ? initialParams.get('subject') || '' : '',
      hash: safeHash,
      scroll: false,
      historyMode: 'replace'
    })
  }
  setAuthGateState('ready')
  fetchAndRenderLiveActivity(true)
  sendStudentPresence(true)
  if (initialParams.get('admin') === 'login' && !initialAdminLoginHandled) {
    initialAdminLoginHandled = true
    openAdminLogin()
  }
}

function clearAuthenticatedProgressState() {
  studentProgressState.topicRows.clear()
  studentProgressState.quizRows.clear()
  studentProgressState.ready = false
  studentProgressState.loading = false
  studentProgressState.selectedUniversity = ''
  studentProgressState.selectedSection = ''
  studentProgressState.pendingUniversity = ''
  pendingProfileAvatarId = ''
  leaderboardState.preferences = getDefaultUserPreferences()
  onlineStudentsState.rows = []
  onlineStudentsState.lastFetched = 0
  invalidateLeaderboard()
  renderOnlineStudents()
}

async function handleStudentAuthUser(user) {
  const requestId = ++studentProgressState.authRequestId
  studentProgressState.user = user
  studentProgressState.lastError = ''
  clearAuthenticatedProgressState()
  renderStudentSyncUi()

  if (!user) {
    setStudentSyncMenu(false)
    setUniversitySelectionMode('onboarding')
    setAuthGateState('needs-university')
    updateGlobalProgress()
    refreshTrackerAdminProfile(null)
    return
  }

  setAuthLoadingStep('section')
  setAuthGateState('checking')
  claimAndMigrateLocalProgress(user.id)

  try {
    const preference = await fetchUserPreference()
    if (requestId !== studentProgressState.authRequestId) return

    leaderboardState.preferences = { ...getDefaultUserPreferences(), ...(preference || {}) }
    const selectedSection = preference?.selected_section || ''
    const selectedUniversity = preference?.selected_university
      || (mustSections[selectedSection] ? 'must' : '')
    const requestedUniversity = initialParams.get('university')
    refreshTrackerAdminProfile(user)

    if (!isSavedUniversity(selectedUniversity)) {
      if (isSavedUniversity(requestedUniversity)) {
        studentProgressState.pendingUniversity = requestedUniversity
        activeUniversityId = requestedUniversity
        updateUniversityBranding()
        setSectionSelectionMode('onboarding')
        setAuthGateState('needs-section')
        return
      }
      setUniversitySelectionMode('onboarding')
      setAuthGateState('needs-university')
      return
    }

    if (!isUniversitySection(selectedUniversity, selectedSection)) {
      studentProgressState.pendingUniversity = selectedUniversity
      activeUniversityId = selectedUniversity
      setSectionSelectionMode('onboarding')
      setAuthGateState('needs-section')
      return
    }

    studentProgressState.selectedUniversity = selectedUniversity
    studentProgressState.selectedSection = selectedSection
    activeUniversityId = selectedUniversity
    setAuthLoadingStep('progress', selectedSection)
    routeAuthenticatedUser(selectedUniversity, selectedSection)
  } catch (error) {
    if (requestId !== studentProgressState.authRequestId) return
    studentProgressState.lastError = error.message
    const requestedUniversity = initialParams.get('university')
    const fallbackUniversity = isSavedUniversity(requestedUniversity) ? requestedUniversity : 'must'
    const requestedSection = initialParams.get('section')
    const fallbackSection = isUniversitySection(fallbackUniversity, requestedSection)
      ? requestedSection
      : getDefaultSectionForUniversity(fallbackUniversity)
    if (isUniversitySection(fallbackUniversity, fallbackSection)) {
      studentProgressState.selectedUniversity = fallbackUniversity
      studentProgressState.selectedSection = fallbackSection
      routeAuthenticatedUser(fallbackUniversity, fallbackSection)
      renderStudentSyncUi()
      return
    }
    setUniversitySelectionMode('onboarding')
    setAuthGateState('needs-university', 'We could not load your saved university. Choose it again to finish account setup.')
    renderStudentSyncUi()
  }
}

function saveSelectedUniversity(universityId) {
  if (!isSavedUniversity(universityId)) return
  studentProgressState.pendingUniversity = universityId
  activeUniversityId = universityId
  updateUniversityBranding()
  const university = getUniversity(universityId)
  const url = new URL(window.location.href)
  url.searchParams.set('university', universityId)
  url.searchParams.delete('section')
  url.hash = ''
  updateSiteHistory(`${url.pathname}${url.search}`, 'replace')

  if (!studentProgressState.user) {
    if (authSigninTitle) authSigninTitle.textContent = `Continue to ${university.shortName} Hub`
    if (authSigninCopy) {
      authSigninCopy.textContent = `Sign in to see ${university.name} sections and keep your study progress connected to your account.`
    }
    setAuthGateState('signed-out')
    return
  }

  setSectionSelectionMode(studentProgressState.sectionSelectionMode)
  setAuthGateState('needs-section')
}

async function openHistoryFromOnboarding() {
  const universityId = studentProgressState.pendingUniversity
    || studentProgressState.selectedUniversity
    || activeUniversityId
  if (!studentProgressState.user || universityId !== 'must') return

  const historyButton = document.querySelector('[data-auth-history]')
  if (historyButton) historyButton.disabled = true

  try {
    const savedSection = leaderboardState.preferences?.selected_university === 'must'
      && isUniversitySection('must', leaderboardState.preferences?.selected_section)
      ? leaderboardState.preferences.selected_section
      : (studentProgressState.selectedUniversity === 'must'
          && isUniversitySection('must', studentProgressState.selectedSection)
          ? studentProgressState.selectedSection
          : getDefaultSectionForUniversity('must'))
    if (isLocalTestMode) {
      leaderboardState.preferences = {
        ...getDefaultUserPreferences(),
        ...leaderboardState.preferences,
        anonymous: false,
        selected_university: universityId,
        selected_section: savedSection,
        nickname: 'Local Tester',
        avatar_id: 'pulse',
        profile_setup_version: 1
      }
    } else {
      leaderboardState.preferences = await upsertUserPreference({
        user_id: studentProgressState.user.id,
        anonymous: false,
        selected_university: universityId,
        selected_section: savedSection,
        nickname: getStudentNickname() || null,
        avatar_id: getSavedProfileAvatarId() || null,
        profile_setup_version: Number(leaderboardState.preferences.profile_setup_version) || 0
      })
    }
    studentProgressState.selectedUniversity = universityId
    studentProgressState.selectedSection = savedSection
    studentProgressState.pendingUniversity = ''
    setAuthGateState('ready')
    showToolsSection({ scroll: false, historyMode: 'replace' })
  } catch (error) {
    studentProgressState.lastError = error.message
    setAuthGateState('needs-section', 'History Taking could not open. Choose 401 or 402 to finish account setup.')
  } finally {
    if (historyButton) historyButton.disabled = false
  }
}

async function saveSelectedSection(section, options = {}) {
  const universityId = studentProgressState.pendingUniversity
    || studentProgressState.selectedUniversity
    || activeUniversityId
  if (!studentProgressState.user || !isUniversitySection(universityId, section)) return false

  if (isLocalTestMode) {
    leaderboardState.preferences = {
      ...getDefaultUserPreferences(),
      ...leaderboardState.preferences,
      anonymous: false,
      selected_university: universityId,
      selected_section: section,
      nickname: 'Local Tester',
      avatar_id: 'pulse',
      profile_setup_version: 1
    }
    activeUniversityId = universityId
    studentProgressState.selectedUniversity = universityId
    studentProgressState.selectedSection = section
    studentProgressState.pendingUniversity = ''
    try {
      localStorage.setItem(LOCAL_TEST_SELECTION_KEY, JSON.stringify({ universityId, section }))
    } catch {
      // The URL remains a deterministic preview fallback when storage is unavailable.
    }
    routeAuthenticatedUser(universityId, section, {
      preserveDestination: options.preserveDestination === true
    })
    setStudentSyncMenu(false)
    return true
  }

  const sectionButtons = [...document.querySelectorAll('[data-auth-section]')]
  sectionButtons.forEach((button) => { button.disabled = true })
  if (options.showGate !== false) {
    setAuthLoadingStep('section', section)
    setAuthGateState('checking')
  }

  try {
    const preference = await upsertUserPreference({
      user_id: studentProgressState.user.id,
      anonymous: false,
      selected_university: universityId,
      selected_section: section,
      nickname: getStudentNickname() || null,
      avatar_id: getSavedProfileAvatarId() || null,
      profile_setup_version: Number(leaderboardState.preferences.profile_setup_version) || 0
    })
    leaderboardState.preferences = preference
    activeUniversityId = universityId
    studentProgressState.selectedUniversity = universityId
    studentProgressState.selectedSection = section
    studentProgressState.pendingUniversity = ''
    studentProgressState.lastError = ''
    invalidateLeaderboard(universityId, section)
    routeAuthenticatedUser(universityId, section, { preserveDestination: options.preserveDestination === true })
    setStudentSyncMenu(false)
    return true
  } catch (error) {
    studentProgressState.lastError = error.message
    if (options.showGate === false) {
      showGlobalToast('Section was not changed. Please try again.')
    } else {
      setAuthGateState('needs-section', 'Your section was not saved. Check your connection and try again.')
    }
    renderStudentSyncUi()
    return false
  } finally {
    sectionButtons.forEach((button) => { button.disabled = false })
  }
}

async function requestSiteSection(sectionId, options = {}) {
  if (!isUniversitySection(activeUniversityId, sectionId)) {
    selectSiteSection(sectionId, options)
    return
  }

  if (sectionId === studentProgressState.selectedSection) {
    selectSiteSection(sectionId, options)
    return
  }

  const confirmed = window.confirm(`Switch your saved section to ${sectionId}?`)
  if (!confirmed) return
  await saveSelectedSection(sectionId, { showGate: false, preserveDestination: false })
}

function openSectionSwitcher() {
  if (!studentProgressState.user) return
  studentProgressState.pendingUniversity = ''
  setUniversitySelectionMode('switch')
  setAuthGateState('needs-university')
  setStudentSyncMenu(false)
}

function cancelSectionSwitcher() {
  if (studentProgressState.sectionSelectionMode !== 'switch') return
  studentProgressState.pendingUniversity = ''
  activeUniversityId = studentProgressState.selectedUniversity || activeUniversityId
  updateUniversityBranding()
  setAuthGateState('ready')
}

function initStudentSync() {
  if (isLocalOnboardingTestMode) {
    studentProgressState.user = null
    setUniversitySelectionMode('onboarding')
    setAuthGateState('needs-university')
    renderStudentSyncUi()
    return
  }
  if (isLocalTestMode) {
    let savedSelection = null
    try {
      savedSelection = JSON.parse(localStorage.getItem(LOCAL_TEST_SELECTION_KEY) || 'null')
    } catch {
      savedSelection = null
    }
    const requestedUniversity = initialParams.get('university')
    const savedUniversity = savedSelection?.universityId
    const universityId = isSavedUniversity(requestedUniversity)
      ? requestedUniversity
      : (isSavedUniversity(savedUniversity) ? savedUniversity : 'must')
    const requestedSection = initialParams.get('section')
    const savedSection = savedSelection?.section
    const section = isUniversitySection(universityId, requestedSection)
      ? requestedSection
      : (isUniversitySection(universityId, savedSection)
          ? savedSection
          : getDefaultSectionForUniversity(universityId))

    studentProgressState.user = {
      id: 'local-test-user',
      email: 'local-test@localhost'
    }
    studentProgressState.selectedUniversity = universityId
    studentProgressState.selectedSection = section
    leaderboardState.preferences = {
      ...getDefaultUserPreferences(),
      anonymous: false,
      selected_university: universityId,
      selected_section: section,
      nickname: 'Local Tester',
      avatar_id: 'pulse',
      profile_setup_version: 1
    }
    routeAuthenticatedUser(universityId, section)
    renderStudentSyncUi()
    return
  }
  if (!isSupabaseConfigured()) {
    renderStudentSyncUi()
    setUniversitySelectionMode('onboarding')
    setAuthGateState('needs-university', 'Google login is temporarily unavailable.')
    return
  }
  if (!studentSync && !isStandaloneProfilePage) {
    renderStudentSyncUi()
    setUniversitySelectionMode('onboarding')
    setAuthGateState('needs-university', 'Google login is temporarily unavailable.')
    return
  }

  setAuthLoadingStep('account')
  setAuthGateState('checking')
  getCurrentUser()
    .then(handleStudentAuthUser)
    .catch((error) => {
      studentProgressState.lastError = error.message
      renderStudentSyncUi()
      setUniversitySelectionMode('onboarding')
      setAuthGateState('needs-university', 'We could not check your Google session. Please try again.')
    })

  onAuthStateChange((user) => {
    handleStudentAuthUser(user)
  })
}

if (subjectList) {
  updateAcademicSectionUi()
  syncModeToBody()
  showSelector({ scroll: false, historyMode: 'none' })
  window.setInterval(render401ExamSchedule, 3600000)
  initLeaderboardVisibilityLoading()
  initLiveActivity()
  initOnlineStudents()
  initStudentSync()
  renderTrackerAdminUi()
}

if (isStandaloneProfilePage) {
  const requestedUniversity = initialParams.get('university')
  const requestedSection = initialParams.get('section')
  if (isSavedUniversity(requestedUniversity)) activeUniversityId = requestedUniversity
  if (isUniversitySection(activeUniversityId, requestedSection)) activeAcademicSection = requestedSection
  activeSiteMode = 'profile'
  updateAcademicSectionUi()
  syncModeToBody()
  initStudentSync()
  renderProfileSection()
  window.addEventListener('load', () => {
    renderProfileSection()
    if (studentProgressState.user) fetchAndRenderLeaderboard(true)
  }, { once: true })
}

document.addEventListener('click', (event) => {
  const openSourceBtn = event.target.closest('[data-open-source]')
  if (openSourceBtn) {
    event.preventDefault()
    openSourceReader({
      topicId: openSourceBtn.dataset.topicId,
      sectionId: openSourceBtn.dataset.sectionId,
      passageId: openSourceBtn.dataset.passageId,
      highlightText: openSourceBtn.dataset.highlightText,
      openerElement: openSourceBtn
    })
    return
  }

  if (event.target.closest('[data-close-source-reader]')) {
    event.preventDefault()
    closeSourceReader()
    return
  }

  const sourceResultBtn = event.target.closest('.source-search-result')
  if (sourceResultBtn) {
    event.preventDefault()
    openSourceReader({
      topicId: sourceResultBtn.dataset.sourceTopicId,
      sectionId: sourceResultBtn.dataset.sourceSectionId,
      passageId: sourceResultBtn.dataset.sourcePassageId,
      openerElement: sourceResultBtn
    })
    return
  }

  const openSourcesBrowseBtn = event.target.closest('[data-open-sources-browser]')
  if (openSourcesBrowseBtn) {
    event.preventDefault()
    openSourceReader({ topicId: 'med401-git-acute-hepatitis', openerElement: openSourcesBrowseBtn })
    return
  }

  const sourceTab = event.target.closest('.source-reader__tab')
  if (sourceTab) {
    event.preventDefault()
    openSourceReader({
      topicId: sourceTab.dataset.topicId,
      sectionId: sourceTab.dataset.sectionId,
      openerElement: sourceTab
    })
    return
  }

  if (event.target.closest('[data-auth-login]')) {
    event.preventDefault()
    studentProgressState.lastError = ''
    if (isLocalOnboardingTestMode) {
      studentProgressState.user = {
        id: 'local-onboarding-test-user',
        email: 'local-onboarding@localhost'
      }
      leaderboardState.preferences = {
        ...getDefaultUserPreferences(),
        anonymous: false,
        nickname: 'Local Tester',
        avatar_id: 'pulse',
        profile_setup_version: 1
      }
      renderStudentSyncUi()
      setSectionSelectionMode('onboarding')
      setAuthGateState('needs-section')
      return
    }
    setAuthLoadingStep('account')
    setAuthGateState('checking')
    signInWithGoogle({ redirectTo: window.location.href }).catch((error) => {
      studentProgressState.lastError = error.message
      setAuthGateState('signed-out', 'Google sign-in did not start. Please try again.')
    })
    return
  }

  const authUniversityButton = event.target.closest('[data-auth-university]')
  if (authUniversityButton) {
    event.preventDefault()
    saveSelectedUniversity(authUniversityButton.dataset.authUniversity)
    return
  }

  const authSectionButton = event.target.closest('[data-auth-section]')
  if (authSectionButton) {
    event.preventDefault()
    saveSelectedSection(authSectionButton.dataset.authSection, { preserveDestination: false })
    return
  }

  if (event.target.closest('[data-auth-history]')) {
    event.preventDefault()
    openHistoryFromOnboarding()
    return
  }

  if (event.target.closest('[data-auth-university-back]')) {
    event.preventDefault()
    studentProgressState.pendingUniversity = ''
    setUniversitySelectionMode('onboarding')
    setAuthGateState('needs-university')
    return
  }

  if (event.target.closest('[data-auth-section-cancel]')) {
    event.preventDefault()
    cancelSectionSwitcher()
    return
  }

  if (event.target.closest('[data-auth-university-cancel]')) {
    event.preventDefault()
    cancelSectionSwitcher()
    return
  }

  const syncToggle = event.target.closest('[data-student-sync-toggle]')
  if (syncToggle) {
    event.preventDefault()
    setStudentSyncMenu(!studentSync?.classList.contains('is-open'))
    return
  }

  if (event.target.closest('[data-student-sync-logout]')) {
    event.preventDefault()
    setAuthLoadingStep('account')
    setAuthGateState('checking')
    signOutUser().catch((error) => {
      studentProgressState.lastError = error.message
      renderStudentSyncUi()
      setAuthGateState('ready')
      showGlobalToast('Sign out failed. Please try again.')
    })
    setStudentSyncMenu(false)
    return
  }

  if (event.target.closest('[data-profile-open]')) {
    event.preventDefault()
    openProfileSection()
    return
  }

  if (event.target.closest('[data-profile-edit-nickname]')) {
    event.preventDefault()
    openProfileNicknameEditor()
    return
  }

  if (event.target.closest('[data-profile-avatar-open]')) {
    event.preventDefault()
    openProfileAvatarDialog()
    return
  }

  if (event.target.closest('[data-profile-avatar-close]') || event.target === profileAvatarDialog) {
    event.preventDefault()
    closeProfileAvatarDialog()
    return
  }

  const todayActionButton = event.target.closest('[data-today-action]')
  if (todayActionButton) {
    event.preventDefault()
    const topicLabel = todayActionButton.dataset.todayTopic
    const sourceId = todayActionButton.dataset.todaySource
    if (!topicLabel) return
    if (todayActionButton.dataset.todayAction === 'resume' && sourceId) {
      openQuiz(topicLabel, sourceId, event, { resumeDirectly: true })
      return
    }

    const sources = getQuizSources(topicLabel)
    if (sources.length > 1 || shouldShowQuizSourcePicker(topicLabel)) {
      renderQuizSourcePicker(topicLabel, event)
    } else {
      openQuiz(topicLabel, sources[0]?.id || 'current', event)
    }
    return
  }

  const avatarChoice = event.target.closest('[data-profile-avatar]')
  if (avatarChoice) {
    event.preventDefault()
    selectProfileAvatar(avatarChoice.dataset.profileAvatar)
    return
  }

  if (event.target.closest('[data-tracker-admin-toggle]')) {
    event.preventDefault()
    openAdminLogin()
    return
  }

  if (event.target.closest('[data-leaderboard-retry]')) {
    event.preventDefault()
    fetchAndRenderLeaderboard(true)
    return
  }

  if (event.target.closest('[data-admin-login-open]')) {
    event.preventDefault()
    openAdminLogin()
    return
  }

  if (event.target.closest('[data-admin-login-close]')) {
    closeAdminLogin()
    return
  }

  if (event.target === adminLoginModal) {
    closeAdminLogin()
    return
  }

  if (event.target.closest('[data-admin-editor-close]')) {
    closeAdminEditor()
    return
  }

  if (event.target.closest('[data-news-admin-add]')) {
    openNewsAdminEditor()
    return
  }

  if (event.target.closest('[data-news-admin-close]') || event.target === newsAdminModal) {
    closeNewsAdminEditor()
    return
  }

  const newsCard = event.target.closest('.update-panel[data-news-id]')
  const newsRow = newsCard ? getNewsRows().find((row) => row.id === newsCard.dataset.newsId) : null
  if (newsRow && event.target.closest('[data-news-edit]')) {
    openNewsAdminEditor(newsRow)
    return
  }
  if (newsRow && event.target.closest('[data-news-delete]')) {
    if (!window.confirm(`Delete “${newsRow.title}”? This cannot be undone.`)) return
    newsAdminStatus.textContent = 'Deleting...'
    deleteNewsCard(newsRow.id, newsRow.university_id, newsRow.section)
      .then(() => refreshRemoteNewsCards(newsRow.section, newsRow.university_id))
      .then(() => { newsAdminStatus.textContent = 'News card deleted.' })
      .catch((error) => { newsAdminStatus.textContent = error.message })
    return
  }
  if (newsRow && event.target.closest('[data-news-toggle-pin]')) {
    const nextGroup = newsRow.card_group === 'pinned' ? 'regular' : 'pinned'
    const groupRows = getNewsRows().filter((row) => row.card_group === nextGroup)
    upsertNewsCard({ ...newsRow, card_group: nextGroup, display_order: (groupRows.at(-1)?.display_order || 0) + 10 })
      .then(() => refreshRemoteNewsCards(newsRow.section, newsRow.university_id))
      .catch((error) => { newsAdminStatus.textContent = error.message })
    return
  }
  if (newsRow && event.target.closest('[data-news-toggle-publish]')) {
    upsertNewsCard({ ...newsRow, published: !newsRow.published })
      .then(() => refreshRemoteNewsCards(newsRow.section, newsRow.university_id))
      .catch((error) => { newsAdminStatus.textContent = error.message })
    return
  }
  const newsMoveButton = event.target.closest('[data-news-move]')
  if (newsRow && newsMoveButton) {
    moveNewsCard(newsRow, newsMoveButton.dataset.newsMove)
      .catch((error) => { newsAdminStatus.textContent = error.message })
    return
  }

  const adminEditButton = event.target.closest('[data-admin-edit-topic]')
  if (adminEditButton) {
    event.preventDefault()
    event.stopPropagation()
    const card = adminEditButton.closest('[data-admin-topic]')
    if (card) openAdminTopicEditor(card.dataset.adminSubject, card.dataset.adminTrack, card.dataset.adminTopic)
    return
  }

  const adminMoveButton = event.target.closest('[data-admin-move]')
  if (adminMoveButton) {
    event.preventDefault()
    event.stopPropagation()
    const card = adminMoveButton.closest('[data-admin-topic]')
    if (card) moveAdminTopic(card.dataset.adminSubject, card.dataset.adminTrack, card.dataset.adminTopic, adminMoveButton.dataset.adminMove)
    return
  }

  if (studentSync?.classList.contains('is-open') && !event.target.closest('#student-sync')) {
    setStudentSyncMenu(false)
  }

  const sectionButton = event.target.closest('[data-select-section]')
  if (sectionButton) {
    event.preventDefault()
    requestSiteSection(sectionButton.dataset.selectSection)
    return
  }

  handleQuizClick(event)
})

adminLoginForm?.addEventListener('submit', async (event) => {
  event.preventDefault()
  setAdminLoginStatus('Signing in...')
  const submit = adminLoginForm.querySelector('[type="submit"]')
  if (submit) submit.disabled = true
  try {
    const { user } = await signInAdmin(adminLoginEmail.value.trim(), adminLoginPassword.value)
    studentProgressState.user = user
    const profile = await fetchAdminProfile()
    if (!profile) {
      await signOutUser()
      throw new Error('This account is not registered as a tracker admin.')
    }
    trackerAdminState.profile = profile
    trackerAdminState.enabled = true
    closeAdminLogin()
    renderTrackerAdminUi()
    renderStudentSyncUi()
    await refreshRemoteNewsCards(activeAcademicSection)
    renderSubjects()
    if (activeSubjectCode) setActiveSubject(activeSubjectCode, 'open')
  } catch (error) {
    setAdminLoginStatus(error.message, 'error')
  } finally {
    if (submit) submit.disabled = false
  }
})

document.getElementById('profile-nickname-form')?.addEventListener('submit', async (event) => {
  event.preventDefault()
  const input = document.getElementById('profile-nickname-input')
  await saveProfileSetup(input?.value || '')
})

document.getElementById('profile-nickname-input')?.addEventListener('input', () => {
  if (profileOnboardingTourState.active && profileOnboardingTourState.stepIndex === 0) {
    updateProfileOnboardingAction()
  }
})

profileAvatarDialog?.addEventListener('close', () => {
  document.body.classList.remove('profile-avatar-dialog-open')
})

trackerAdminEditPanel?.addEventListener('change', (event) => {
  if (!event.target.matches('input[name="admin-state"]')) return
  trackerAdminEditPanel.querySelectorAll('.admin-state-option').forEach(option => option.classList.remove('is-selected'))
  event.target.closest('.admin-state-option')?.classList.add('is-selected')
})

trackerAdminEditPanel?.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-tracker-admin-edit-form]')
  if (!form) return
  event.preventDefault()
  saveAdminTopicForm(form)
})

newsAdminForm?.addEventListener('submit', (event) => {
  event.preventDefault()
  saveNewsAdminForm(newsAdminForm)
})

trackerAdminSaveOrder?.addEventListener('click', saveAdminArrangement)
trackerAdminSignOut?.addEventListener('click', () => {
  if (trackerAdminState.dirtyCollections.size) {
    window.alert('Save the topic arrangement before signing out.')
    return
  }
  trackerAdminState.enabled = false
  closeAdminEditor()
  renderTrackerAdminUi()
  renderSubjects()
  if (activeSubjectCode) setActiveSubject(activeSubjectCode, 'open')
  showGlobalToast('Student view on.')
})

document.addEventListener('dragstart', (event) => {
  const card = event.target.closest('.tracker-admin-topic[data-admin-topic]')
  if (!card || !isTrackerAdmin()) return
  trackerAdminState.draggingKey = `${card.dataset.adminSubject}::${card.dataset.adminTrack}::${card.dataset.adminTopic}`
  card.classList.add('admin-topic--dragging')
  event.dataTransfer?.setData('text/plain', trackerAdminState.draggingKey)
})

document.addEventListener('dragover', (event) => {
  const card = event.target.closest('.tracker-admin-topic[data-admin-topic]')
  if (!card || !trackerAdminState.draggingKey) return
  event.preventDefault()
  document.querySelectorAll('.admin-topic--drag-over').forEach(item => item.classList.remove('admin-topic--drag-over'))
  card.classList.add('admin-topic--drag-over')
})

document.addEventListener('drop', (event) => {
  const target = event.target.closest('.tracker-admin-topic[data-admin-topic]')
  if (!target || !trackerAdminState.draggingKey) return
  event.preventDefault()
  const [sourceSubject, sourceTrack, ...sourceLabelParts] = trackerAdminState.draggingKey.split('::')
  const sourceLabel = sourceLabelParts.join('::')
  if (sourceSubject !== target.dataset.adminSubject || sourceTrack !== target.dataset.adminTrack) return
  const context = getAdminTopicContext(sourceSubject, sourceTrack, sourceLabel)
  if (!context) return
  const fromIndex = context.collection.findIndex(item => item.label === sourceLabel)
  const toIndex = context.collection.findIndex(item => item.label === target.dataset.adminTopic)
  if (fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) {
    const [moved] = context.collection.splice(fromIndex, 1)
    context.collection.splice(toIndex, 0, moved)
    context.collection.forEach((topic, index) => { topic.displayOrder = (index + 1) * 10 })
    trackerAdminState.dirtyCollections.add(getAdminCollectionKey(sourceSubject, sourceTrack))
    renderSubjects()
    setActiveSubject(sourceSubject, 'open')
  }
})

document.addEventListener('dragend', () => {
  trackerAdminState.draggingKey = ''
  document.querySelectorAll('.admin-topic--dragging, .admin-topic--drag-over').forEach(item => item.classList.remove('admin-topic--dragging', 'admin-topic--drag-over'))
})

window.addEventListener('beforeunload', (event) => {
  if (!trackerAdminState.dirtyCollections.size) return
  event.preventDefault()
  event.returnValue = ''
})

window.addEventListener('hashchange', handleLegacyHashRoute)
window.addEventListener('popstate', restoreSiteModeFromLocation)
window.addEventListener('focus', () => {
  if (isUniversitySection(activeUniversityId, activeSiteMode)) refreshRemoteTrackerData()
})
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && isUniversitySection(activeUniversityId, activeSiteMode)) refreshRemoteTrackerData()
})


function refreshTrackerFilters() {
  if (!subjectList) return
  setTrackerSearchMode(trackerSearchMode)
  if (trackerScopeFilter) {
    document.querySelectorAll('.scope-toggle__btn').forEach((button) => {
      button.classList.toggle('scope-toggle__btn--active', button.dataset.scope === trackerScopeFilter.value)
    })
  }

  renderSubjects()
  if (activeSubjectCode) setActiveSubject(activeSubjectCode, 'open')
  else clearSubjectDetail()
}

if (trackerSearch && trackerStatusFilter) {
  ;[trackerSearch, trackerStatusFilter, trackerScopeFilter].filter(Boolean).forEach((control) => {
    control.addEventListener('input', refreshTrackerFilters)
    control.addEventListener('change', refreshTrackerFilters)
  })
}

trackerSearchModeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setTrackerSearchMode(button.dataset.searchMode)
    refreshTrackerFilters()
  })
})

// Scope pill button wiring
document.querySelectorAll('.scope-toggle__btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (trackerScopeFilter) {
      trackerScopeFilter.value = btn.dataset.scope
    }
    refreshTrackerFilters()
  })
})

if (newsFeed) {
  renderNewsFilters()
  newsNavLinks.forEach((link) => link.addEventListener('click', () => {
    markNewsCardsSeen([...newsFeed.querySelectorAll('.update-panel')])
    renderTodayCockpit()
  }))
  ;[newsCourseFilter, newsDateFilter].filter(Boolean).forEach((control) => {
    control.addEventListener('input', renderNewsFilters)
    control.addEventListener('change', renderNewsFilters)
  })

  let newsFilterKey = `${newsCourseFilter?.value || 'all'}:${newsDateFilter?.value || 'newest'}`
  window.setInterval(() => {
    const nextKey = `${newsCourseFilter?.value || 'all'}:${newsDateFilter?.value || 'newest'}`
    if (nextKey !== newsFilterKey) {
      newsFilterKey = nextKey
      renderNewsFilters()
    }
  }, 300)
  window.setInterval(renderNewsFilters, 60000)
}

requestAnimationFrame(() => {
  const params = new URLSearchParams(window.location.search)
  if (subjectList && mobileQuery.matches && params.get('tracker') === '1' && activeSubjectCode) {
    expandedSubjectCode = activeSubjectCode
    renderSubjects()
  }
})

if (bookingForm) {
  bookingForm.addEventListener('submit', handleBookingSubmit)
}

if (historyForm) {
  historyForm.addEventListener('input', handleHistoryInput)
  historyForm.addEventListener('change', handleHistoryInput)
  toggleHistoryConditionalSections()
  handleHistoryInput()
}

if (copyHistorySummary && historySummaryText) {
  copyHistorySummary.addEventListener('click', async () => {
    await navigator.clipboard.writeText(historySummaryText.textContent)
    copyHistorySummary.textContent = 'Copied'
    window.setTimeout(() => {
      copyHistorySummary.textContent = 'Copy'
    }, 1200)
  })
}

renderAssignmentProgress()
renderSchedulePage()
renderTodayCockpit()
window.addEventListener('online', renderTodayFreshnessStatus)
window.addEventListener('offline', renderTodayFreshnessStatus)
if (scheduleTodayTitle) {
  window.setInterval(renderSchedulePage, 60 * 1000)
}

function initFullHistoryTool() {
  const historyRoot = document.getElementById('history')
  const historyApp = document.getElementById('history-app')
  if (!historyRoot || !historyApp || historyRoot.dataset.historyToolReady) return
  historyRoot.dataset.historyToolReady = 'true'
    const systems = {
      general: {
        label: "General",
        desc: "Basic history sheet",
        complaints: ["Fever", "Weight loss", "Fatigue", "Swelling", "Pallor", "Jaundice"],
        symptoms: [
          ["Fever", "pattern, grade, chills"], ["Weight loss", "amount, duration, appetite"], ["Night sweats", "TB/lymphoma clue"], ["Pallor", "anemia clue"],
          ["Jaundice", "urine/stool/pruritus"], ["Cyanosis", "central/peripheral"], ["Edema", "site, pitting, timing"], ["Rash", "type, distribution"]
        ]
      },
      cardiology: {
        label: "Cardiology",
        desc: "Cardiac symptoms",
        complaints: ["Dyspnea", "Chest pain", "Palpitations", "Syncope", "LL edema", "Orthopnea"],
        symptoms: [
          ["Dyspnea", "exertional grade"], ["Orthopnea", "number of pillows"], ["PND", "wakes from sleep"], ["Chest pain", "site/character/radiation"],
          ["Palpitations", "onset/rhythm/duration"], ["Syncope", "pre/post-event"], ["LL edema", "dependent/pitting"], ["Cyanosis", "central/peripheral"],
          ["Cough/hemoptysis", "pulmonary congestion"], ["Fatigue", "low COP clue"]
        ]
      },
      chest: {
        label: "Chest",
        desc: "Respiratory symptoms",
        complaints: ["Cough", "Sputum", "Dyspnea", "Wheeze", "Hemoptysis", "Chest pain"],
        symptoms: [
          ["Cough", "dry/productive, timing"], ["Sputum", "amount/color/odour"], ["Hemoptysis", "streaks vs massive"], ["Dyspnea", "acute/subacute/chronic"],
          ["Wheeze", "episodic/triggered"], ["Chest pain", "pleuritic/localized"], ["Fever", "infection clue"], ["Weight loss", "TB/malignancy"],
          ["Occupational exposure", "dust/asbestos/farm"], ["Allergy/asthma", "personal/family"]
        ]
      },
      abdomen: {
        label: "Abdomen / GIT",
        desc: "GIT + hepatology",
        complaints: ["Abdominal pain", "Vomiting", "Diarrhea", "Constipation", "Jaundice", "Abdominal swelling"],
        symptoms: [
          ["Dysphagia", "solids/liquids"], ["Vomiting", "content/amount/relation"], ["Hematemesis", "fresh/coffee ground"], ["Abdominal pain", "site/character/radiation"],
          ["Diarrhea", "frequency/consistency/blood"], ["Constipation", "duration/obstruction"], ["Melena", "black tarry stool"], ["Jaundice", "urine/stool/pruritus"],
          ["Abdominal swelling", "ascites/mass"], ["LL swelling", "hepatic/cardiac clue"], ["Urinary symptoms", "renal overlap"], ["Gynecological symptoms", "female patients"]
        ]
      },
      neurology: {
        label: "Neurology",
        desc: "CNS history",
        complaints: ["Weakness", "Headache", "Convulsions", "Sensory loss", "Speech trouble", "Sphincter trouble"],
        symptoms: [
          ["Headache", "ICT/red flags"], ["Projectile vomiting", "ICT clue"], ["Blurring of vision", "optic/ICT"], ["Convulsions", "type/post-ictal"],
          ["Motor weakness", "side/distribution"], ["Sensory symptoms", "level/modality"], ["Speech symptoms", "aphasia/dysarthria"], ["Sphincter troubles", "retention/incontinence"],
          ["Cranial nerves", "vision/diplopia/facial"], ["Trauma", "exclude in history"], ["Fever/malaise", "inflammation clue"], ["Hypothalamic symptoms", "sleep/appetite/temp"]
        ]
      },
      rheumatology: {
        label: "Rheumatology",
        desc: "Articular + extra-articular",
        complaints: ["Joint pain", "Joint swelling", "Morning stiffness", "Back pain", "Rash", "Oral ulcers"],
        symptoms: [
          ["Joint pain", "site, number, symmetry"], ["Swelling", "inflammatory/mechanical"], ["Morning stiffness", "duration"], ["Deformity", "type/progression"],
          ["Limitation", "function/disability"], ["Skin rash", "malar/psoriasis/nodules"], ["Eye symptoms", "redness/uveitis"], ["Oral ulcers", "SLE/BehÃ§et clue"],
          ["Raynaudâ€™s", "color change/cold"], ["Back pain", "inflammatory features"], ["Fever/weight loss", "systemic"], ["Drug history", "steroids/NSAIDs"]
        ]
      }
    };

    const steps = [
      { id: "personal", label: "Personal", desc: "NASOMRH" },
      { id: "complaint", label: "Complaint", desc: "C/O + duration" },
      { id: "hpi", label: "HPI", desc: "analysis story" },
      { id: "related", label: "Related", desc: "system symptoms" },
      { id: "past", label: "Past", desc: "disease/drugs" },
      { id: "family", label: "Family", desc: "risk context" },
      { id: "final", label: "Final", desc: "review/copy" }
    ];

    const requiredKeys = [
      "age", "sex", "occupation", "residence", "mainComplaint", "complaintDuration",
      "complaintType", "onset", "course", "associated", "aggravating", "relieving",
      "treatmentEffect", "dm", "htn", "tb", "familyDM", "familyHTN", "consanguinity"
    ];

    const defaultState = {
      system: "general",
      step: "personal",
      mode: "study",
      tab: "full",
      relatedSymptoms: []
    };

    let state = loadState();

    function loadState() {
      try {
        const saved = localStorage.getItem("historyToolState.v1");
        return saved ? { ...defaultState, ...JSON.parse(saved) } : { ...defaultState };
      } catch {
        return { ...defaultState };
      }
    }

    function saveState() {
      localStorage.setItem("historyToolState.v1", JSON.stringify(state));
    }

    const $ = (sel) => historyRoot.querySelector(sel);
    const $$ = (sel) => Array.from(historyRoot.querySelectorAll(sel));

    function value(key) {
      const v = state[key];
      if (v === undefined || v === null || v === false) return "";
      return String(v).trim();
    }

    function sentence(text) {
      const t = String(text || "").trim();
      if (!t) return "";
      return /[.!?]$/.test(t) ? t : t + ".";
    }

    function joinParts(parts, sep = ", ") {
      return parts.filter(Boolean).map(x => String(x).trim()).filter(Boolean).join(sep);
    }

    function smokingStats() {
      const cigs = Number(value("cigsDay")) || 0;
      const years = Number(value("smokingYears")) || 0;
      const index = cigs * years;
      const pack = cigs * years / 20;
      let grade = "";
      if (index > 0) grade = index < 100 ? "mild" : index <= 400 ? "moderate" : "heavy";
      return { index, pack: Number.isInteger(pack) ? pack : pack.toFixed(1), grade };
    }

    function renderSystems() {
      const grid = $("#systemGrid");
      grid.innerHTML = "";
      Object.entries(systems).forEach(([id, sys]) => {
        const btn = document.createElement("button");
        btn.className = "system-btn" + (state.system === id ? " active" : "");
        btn.type = "button";
        btn.innerHTML = `<b>${sys.label}</b><span>${sys.desc}</span>`;
        btn.addEventListener("click", () => {
          state.system = id;
          state.relatedSymptoms = [];
          state.step = "personal";
          saveState();
          renderAll();
        });
        grid.appendChild(btn);
      });
    }

    function renderSteps() {
      const list = $("#stepList");
      list.innerHTML = "";
      const currentIndex = steps.findIndex(s => s.id === state.step);
      steps.forEach((s, i) => {
        const btn = document.createElement("button");
        btn.className = "step-btn" + (state.step === s.id ? " active" : "") + (i < currentIndex ? " done" : "");
        btn.type = "button";
        btn.innerHTML = `<span class="step-dot">${i < currentIndex ? "âœ“" : i + 1}</span><span class="step-label"><b>${s.label}</b><span>${s.desc}</span></span>`;
        btn.addEventListener("click", () => {
          state.step = s.id;
          saveState();
          renderAll();
          const section = $(`.step-section[data-step="${s.id}"]`);
          const bottomNavSpace = document.querySelector('.bottom-nav-wrap')?.offsetHeight || 0;
          const targetTop = section ? section.getBoundingClientRect().top + window.scrollY - Math.max(bottomNavSpace + 22, 96) : null;
          if (targetTop !== null) window.scrollTo({ top: targetTop, behavior: "smooth" });
        });
        list.appendChild(btn);
      });
    }

    function renderMode() {
      $$(".mode-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.mode === state.mode);
      });
      historyApp.classList.toggle("osce", state.mode === "osce");
      if (state.mode === "presentation") state.tab = "osce";
    }

    function renderStepSections() {
      $$(".step-section").forEach(sec => sec.classList.toggle("active", sec.dataset.step === state.step));
      const index = steps.findIndex(s => s.id === state.step);
      $("#prevStep").disabled = index === 0;
      $("#nextStep").textContent = index === steps.length - 1 ? "Back to start â†’" : "Next â†’";
      $("#systemTag").textContent = systems[state.system].label;
    }

    function renderInputs() {
      $$('[data-key]').forEach(el => {
        const key = el.dataset.key;
        if (el.type === "checkbox") {
          el.checked = Boolean(state[key]);
        } else if (el.tagName === "SELECT" || el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.value = state[key] ?? "";
        }
      });
      updateConditionals();
    }

    function renderComplaintChips() {
      const wrap = $("#complaintChips");
      wrap.innerHTML = "";
      systems[state.system].complaints.forEach(label => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chip" + (value("mainComplaint").toLowerCase() === label.toLowerCase() ? " active" : "");
        chip.textContent = label;
        chip.addEventListener("click", () => {
          state.mainComplaint = label.toLowerCase();
          const lower = label.toLowerCase();
          if (lower.includes("pain")) state.complaintType = "pain";
          else if (lower.includes("cough") || lower.includes("sputum")) state.complaintType = "cough-sputum";
          else if (lower.includes("dyspnea") || lower.includes("breath")) state.complaintType = "dyspnea";
          else if (lower.includes("swelling") || lower.includes("edema")) state.complaintType = "swelling";
          else if (lower.includes("fever")) state.complaintType = "fever";
          else if (lower.includes("weakness")) state.complaintType = "weakness";
          saveState();
          renderAll();
        });
        wrap.appendChild(chip);
      });
    }

    function renderRelatedSymptoms() {
      const wrap = $("#relatedSymptoms");
      wrap.innerHTML = "";
      const selected = new Set(state.relatedSymptoms || []);
      systems[state.system].symptoms.forEach(([name, detail]) => {
        const label = document.createElement("label");
        label.className = "symptom-card";
        label.innerHTML = `<input type="checkbox" ${selected.has(name) ? "checked" : ""} /><span><b>${name}</b><span>${detail}</span></span>`;
        label.querySelector("input").addEventListener("change", (e) => {
          if (e.target.checked) selected.add(name); else selected.delete(name);
          state.relatedSymptoms = Array.from(selected);
          saveState();
          renderOutput();
          renderProgress();
        });
        wrap.appendChild(label);
      });
    }

    function updateConditionals() {
      $("#femaleWrap").classList.toggle("show", value("sex") === "Female");
      $("#handednessWrap").classList.toggle("show", state.system === "neurology");
      $("#smokingWrap").classList.toggle("show", Boolean(state.isSmoker));
      const type = value("complaintType");
      const needsPain = type === "pain" || value("mainComplaint").toLowerCase().includes("pain");
      const needsExcreta = ["excreta", "cough-sputum", "bleeding"].includes(type) || ["sputum", "diarrhea", "vomit", "urine", "stool", "hemoptysis", "hematemesis", "melena"].some(w => value("mainComplaint").toLowerCase().includes(w));
      $("#painWrap").classList.toggle("show", needsPain);
      $("#excretaWrap").classList.toggle("show", needsExcreta);

      const stats = smokingStats();
      $("#smokingIndex").textContent = stats.index ? `${stats.index} ${stats.grade ? `(${stats.grade})` : ""}` : "0";
      $("#packYears").textContent = stats.pack || "0";
    }

    function missingQuestions() {
      const missing = [];
      const add = (key, text) => { if (!value(key)) missing.push(text); };

      add("age", "Ask the patientâ€™s age.");
      add("sex", "Record sex.");
      add("occupation", "Ask occupation and occupational exposure.");
      add("residence", "Ask residence / place of living.");
      add("mainComplaint", "Write the main complaint.");
      add("complaintDuration", "Add duration to the complaint.");
      add("complaintType", "Choose complaint type so the tool can guide analysis.");
      add("onset", "Analyze onset.");
      add("course", "Analyze course.");
      add("associated", "Ask associated symptoms.");
      add("aggravating", "Ask what increases the complaint.");
      add("relieving", "Ask what decreases the complaint.");
      add("treatmentEffect", "Ask about effect of treatment.");
      add("dm", "Ask past history of DM.");
      add("htn", "Ask past history of hypertension.");
      add("tb", "Ask past/contact history of TB.");
      add("familyDM", "Ask family history of DM.");
      add("familyHTN", "Ask family history of HTN.");
      add("consanguinity", "Ask consanguinity.");

      const type = value("complaintType");
      const lowerComplaint = value("mainComplaint").toLowerCase();
      const needsPain = type === "pain" || lowerComplaint.includes("pain");
      const needsExcreta = ["excreta", "cough-sputum", "bleeding"].includes(type) || ["sputum", "diarrhea", "vomit", "urine", "stool", "hemoptysis", "hematemesis", "melena"].some(w => lowerComplaint.includes(w));

      if (needsPain) {
        add("painSite", "Pain complaint: ask site.");
        add("painCharacter", "Pain complaint: ask character.");
        add("painRadiation", "Pain complaint: ask radiation.");
      }
      if (needsExcreta) {
        add("amount", "Excreta complaint: ask amount.");
        add("color", "Excreta complaint: ask color.");
        add("consistency", "Excreta complaint: ask consistency.");
        add("odour", "Excreta complaint: ask odour.");
      }
      if (state.system === "neurology") add("handedness", "Neurology mode: add handedness.");
      if (value("sex") === "Female") {
        add("menarche", "Female patient: ask menarche.");
        add("cycleRhythm", "Female patient: ask menstrual cycle rhythm.");
        add("flowDuration", "Female patient: ask duration of flow.");
        add("dysmenorrhea", "Female patient: ask dysmenorrhea.");
        add("contraception", "Female patient: ask current contraception.");
      }
      if (!state.relatedSymptoms || state.relatedSymptoms.length === 0) missing.push("Ask/check related system symptoms.");

      return missing;
    }

    function completion() {
      const keys = [...requiredKeys];
      const type = value("complaintType");
      const lowerComplaint = value("mainComplaint").toLowerCase();
      if (type === "pain" || lowerComplaint.includes("pain")) keys.push("painSite", "painCharacter", "painRadiation");
      if (["excreta", "cough-sputum", "bleeding"].includes(type) || ["sputum", "diarrhea", "vomit", "urine", "stool", "hemoptysis", "hematemesis", "melena"].some(w => lowerComplaint.includes(w))) keys.push("amount", "color", "consistency", "odour");
      if (state.system === "neurology") keys.push("handedness");
      if (value("sex") === "Female") keys.push("menarche", "cycleRhythm", "flowDuration", "dysmenorrhea", "contraception");
      const done = keys.filter(k => value(k)).length + ((state.relatedSymptoms || []).length ? 1 : 0);
      const total = keys.length + 1;
      return Math.round((done / total) * 100);
    }

    function renderProgress() {
      const pct = completion();
      $("#completionLabel").textContent = pct + "%";
      $("#completionFill").style.width = pct + "%";
    }

    function personalParagraph() {
      const parts = [];
      const gender = value("sex") ? value("sex").toLowerCase() : "Patient";
      const name = value("name") ? ` ${value("name")}` : "";
      let opener = `${value("sex") || "Patient"}${name}`;
      if (value("age")) opener += `, ${value("age")}-year-old`;
      if (value("occupation")) opener += `, ${value("occupation")}`;
      parts.push(opener);

      const residence = value("residence") ? `living in ${value("residence")}` : "";
      const marital = value("marital") ? value("marital").toLowerCase() : "";
      const marriage = value("marriageDuration") ? `for ${value("marriageDuration")}` : "";
      const children = value("children") ? `with ${value("children")} living offspring` : "";
      const youngest = value("youngestChild") ? `the youngest is ${value("youngestChild")}` : "";
      parts.push(joinParts([residence, marital, marriage, children, youngest]));

      if (state.system === "neurology" && value("handedness")) parts.push(value("handedness"));

      if (state.isSmoker) {
        const stats = smokingStats();
        const smoke = joinParts([
          value("smokingStatus") || "smoker",
          value("cigsDay") ? `${value("cigsDay")} cigarettes/day` : "",
          value("smokingYears") ? `for ${value("smokingYears")} years` : "",
          stats.index ? `smoking index ${stats.index}${stats.grade ? ` (${stats.grade})` : ""}` : "",
          stats.pack ? `${stats.pack} pack-years` : "",
          value("smokingType") ? `type: ${value("smokingType")}` : ""
        ]);
        parts.push(smoke);
      } else {
        parts.push("no special habits documented");
      }
      if (value("otherHabits")) parts.push(`Other habits: ${value("otherHabits")}`);

      if (value("sex") === "Female") {
        const menstrual = joinParts([
          value("menarche") ? `menarche at ${value("menarche")}` : "",
          value("menopause") ? `menopause: ${value("menopause")}` : "",
          value("cycleRhythm") ? `cycle ${value("cycleRhythm")}` : "",
          value("flowDuration") ? `flow duration ${value("flowDuration")}` : "",
          value("flowAmount") ? `flow ${value("flowAmount")}` : "",
          value("dysmenorrhea"),
          value("contraception") ? `contraception: ${value("contraception")}` : "",
          value("obstetric") ? `obstetric note: ${value("obstetric")}` : ""
        ]);
        if (menstrual) parts.push(`Menstrual history: ${menstrual}`);
      }

      if (value("socialClass")) parts.push(value("socialClass"));
      return sentence(joinParts(parts));
    }

    function complaintLine() {
      const complaint = value("mainComplaint") || "[main complaint]";
      const duration = value("complaintDuration") ? ` of ${value("complaintDuration")} duration` : "";
      return `C/O: ${complaint}${duration}.`;
    }

    function hpiParagraph() {
      const chunks = [];
      const complaint = value("mainComplaint") || "the complaint";
      chunks.push(`The patient presented with ${complaint}${value("complaintDuration") ? ` for ${value("complaintDuration")}` : ""}`);
      if (value("onset")) chunks.push(`onset was ${value("onset")}`);
      if (value("course")) chunks.push(`course was ${value("course")}`);
      if (value("hpiDuration")) chunks.push(`duration details: ${value("hpiDuration")}`);
      if (value("associated")) chunks.push(`associated with ${value("associated")}`);
      if (value("aggravating")) chunks.push(`increased by ${value("aggravating")}`);
      if (value("relieving")) chunks.push(`relieved by ${value("relieving")}`);
      if (value("treatmentEffect")) chunks.push(`effect of treatment: ${value("treatmentEffect")}`);
      if (value("lastAttack")) chunks.push(`last attack: ${value("lastAttack")}`);

      const pain = joinParts([
        value("painSite") ? `site: ${value("painSite")}` : "",
        value("painCharacter") ? `character: ${value("painCharacter")}` : "",
        value("painRadiation") ? `radiation: ${value("painRadiation")}` : ""
      ]);
      if (pain) chunks.push(`Pain analysis: ${pain}`);

      const excreta = joinParts([
        value("amount") ? `amount: ${value("amount")}` : "",
        value("content") ? `content: ${value("content")}` : "",
        value("color") ? `color: ${value("color")}` : "",
        value("consistency") ? `consistency: ${value("consistency")}` : "",
        value("odour") ? `odour: ${value("odour")}` : ""
      ]);
      if (excreta) chunks.push(`Excreta analysis: ${excreta}`);

      const variants = joinParts([
        value("postural") ? `postural variation: ${value("postural")}` : "",
        value("diurnal") ? `diurnal variation: ${value("diurnal")}` : "",
        value("seasonal") ? `seasonal variation: ${value("seasonal")}` : ""
      ]);
      if (variants) chunks.push(`Variants: ${variants}`);
      if (value("investigationTreatment")) chunks.push(`Investigations/treatment for current illness: ${value("investigationTreatment")}`);

      return sentence(chunks.join("; "));
    }

    function relatedParagraph() {
      const symptoms = (state.relatedSymptoms || []).join(", ");
      const parts = [];
      if (symptoms) parts.push(`Related ${systems[state.system].label} symptoms checked: ${symptoms}`);
      if (value("relatedNotes")) parts.push(value("relatedNotes"));
      if (value("systemicReview")) parts.push(`Systemic review: ${value("systemicReview")}`);
      return sentence(parts.join(". "));
    }

    function pastParagraph() {
      const parts = [];
      ["dm", "htn", "tb", "ihd"].forEach(k => { if (value(k)) parts.push(value(k)); });
      if (value("similarAttacks")) parts.push(`similar attacks: ${value("similarAttacks")}`);
      if (value("operations")) parts.push(`operations: ${value("operations")}`);
      if (value("transfusion")) parts.push(`blood transfusion: ${value("transfusion")}`);
      if (value("drugs")) parts.push(`drug history: ${value("drugs")}`);
      if (value("allergies")) parts.push(`allergies: ${value("allergies")}`);
      if (value("pastDetails")) parts.push(value("pastDetails"));
      return sentence(parts.length ? `Past history: ${parts.join("; ")}` : "Past history not completed");
    }

    function familyParagraph() {
      const parts = [];
      ["consanguinity", "similarFamily", "familyDM", "familyHTN", "familyTB", "familyIHD"].forEach(k => { if (value(k)) parts.push(value(k)); });
      if (value("familyDetails")) parts.push(`family details: ${value("familyDetails")}`);
      if (value("livingConditions")) parts.push(`living/exposure: ${value("livingConditions")}`);
      return sentence(parts.length ? `Family and social history: ${parts.join("; ")}` : "Family and social history not completed");
    }

    function fullHistory() {
      const lines = [
        `SYSTEM: ${systems[state.system].label}`,
        "",
        "PERSONAL HISTORY",
        personalParagraph(),
        "",
        "COMPLAINT",
        complaintLine(),
        value("patientWords") ? `Patientâ€™s own words: â€œ${value("patientWords")}â€` : "",
        "",
        "HISTORY OF PRESENT ILLNESS",
        hpiParagraph(),
        "",
        "RELATED SYSTEM + SYSTEMIC REVIEW",
        relatedParagraph(),
        "",
        "PAST HISTORY",
        pastParagraph(),
        "",
        "FAMILY + SOCIAL HISTORY",
        familyParagraph()
      ];
      return lines.filter(line => line !== "").join("\n");
    }

    function osceSummary() {
      const demo = joinParts([
        value("age") ? `${value("age")}-year-old` : "",
        value("sex") ? value("sex").toLowerCase() : "patient",
        value("occupation") || ""
      ], " ");
      const smoker = state.isSmoker ? `, ${value("smokingStatus") || "smoker"}${value("cigsDay") ? ` ${value("cigsDay")} cigarettes/day` : ""}${value("smokingYears") ? ` for ${value("smokingYears")} years` : ""}` : "";
      const complaint = value("mainComplaint") || "[main complaint]";
      const duration = value("complaintDuration") ? `for ${value("complaintDuration")}` : "with unspecified duration";
      const assoc = value("associated") ? ` It was associated with ${value("associated")}.` : "";
      const systemPos = (state.relatedSymptoms || []).length ? ` Related positive/checklisted symptoms include ${(state.relatedSymptoms || []).join(", ")}.` : "";
      const risks = joinParts([value("dm"), value("htn"), value("tb"), value("ihd")], "; ");
      return `This is a ${demo || "patient"}${smoker}, presenting with ${complaint} ${duration}. The illness had ${value("onset") || "[onset not specified]"} onset and ${value("course") || "[course not specified]"} course.${assoc}${systemPos}${risks ? ` Past history: ${risks}.` : ""}`;
    }

    function renderOutput() {
      const missing = missingQuestions();
      const missingBox = $("#missingBox");
      const output = $("#outputBox");
      const finalMissing = $("#finalMissing");

      $$(".tab-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === state.tab));
      if (state.tab === "full") output.textContent = fullHistory();
      if (state.tab === "osce") output.textContent = osceSummary();
      if (state.tab === "missing") output.textContent = missing.length ? "Complete the items below." : "Looks clean. No major missing items detected.";

      missingBox.innerHTML = "";
      if (state.tab === "missing") {
        if (!missing.length) {
          missingBox.innerHTML = `<div class="good-item">No major missing questions detected. Nice.</div>`;
        } else {
          missing.forEach(m => {
            const div = document.createElement("div");
            div.className = "missing-item";
            div.textContent = m;
            missingBox.appendChild(div);
          });
        }
      }

      if (finalMissing) {
        finalMissing.innerHTML = "";
        if (!missing.length) {
          finalMissing.innerHTML = `<div class="good-item">No major missing questions detected. You can present this case.</div>`;
        } else {
          missing.slice(0, 12).forEach(m => {
            const div = document.createElement("div");
            div.className = "missing-item";
            div.textContent = m;
            finalMissing.appendChild(div);
          });
          if (missing.length > 12) {
            const div = document.createElement("div");
            div.className = "missing-item";
            div.textContent = `+ ${missing.length - 12} more items in the Missing tab.`;
            finalMissing.appendChild(div);
          }
        }
      }
    }

    function renderAll() {
      renderMode();
      renderSystems();
      renderSteps();
      renderStepSections();
      renderInputs();
      renderComplaintChips();
      renderRelatedSymptoms();
      renderProgress();
      renderOutput();
    }

    function bindEvents() {
      historyRoot.addEventListener("input", (e) => {
        const el = e.target.closest("[data-key]");
        if (!el) return;
        const key = el.dataset.key;
        if (el.type === "checkbox") state[key] = el.checked;
        else state[key] = el.value;
        saveState();
        updateConditionals();
        renderComplaintChips();
        renderProgress();
        renderOutput();
      });

      historyRoot.addEventListener("change", (e) => {
        const el = e.target.closest("[data-key]");
        if (!el) return;
        const key = el.dataset.key;
        if (el.type === "checkbox") state[key] = el.checked;
        else state[key] = el.value;
        saveState();
        updateConditionals();
        renderProgress();
        renderOutput();
      });

      $$(".mode-btn").forEach(btn => btn.addEventListener("click", () => {
        state.mode = btn.dataset.mode;
        if (state.mode === "presentation") state.tab = "osce";
        saveState();
        renderAll();
      }));

      $$(".tab-btn").forEach(btn => btn.addEventListener("click", () => {
        state.tab = btn.dataset.tab;
        saveState();
        renderOutput();
      }));

      $("#prevStep").addEventListener("click", () => {
        const idx = steps.findIndex(s => s.id === state.step);
        state.step = steps[Math.max(0, idx - 1)].id;
        saveState();
        renderAll();
      });

      $("#nextStep").addEventListener("click", () => {
        const idx = steps.findIndex(s => s.id === state.step);
        state.step = steps[(idx + 1) % steps.length].id;
        saveState();
        renderAll();
      });

      $("#copyBtn").addEventListener("click", () => copyText($("#outputBox").textContent));
      $("#copyFinalBtn").addEventListener("click", () => copyText(fullHistory()));
      $("#printBtn").addEventListener("click", () => window.print());

      $("#resetBtn").addEventListener("click", () => {
        if (!confirm("Reset the whole prototype form?")) return;
        localStorage.removeItem("historyToolState.v1");
        state = { ...defaultState };
        renderAll();
      });
    }

    async function copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        showToast("Copied.");
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        showToast("Copied.");
      }
    }

    function showToast(text) {
      const toast = $("#toast");
      toast.textContent = text;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 1600);
    }

    bindEvents();
    renderAll();

}

function initBottomSectionNav() {
  const navLinks = [...document.querySelectorAll('[data-section-nav]')]
  if (!navLinks.length) return

  const sections = navLinks
    .map((link) => document.getElementById(link.dataset.sectionNav))
    .filter(Boolean)

  const setActive = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.sectionNav === id)
    })
    if (id === 'leaderboard') {
      fetchAndRenderLeaderboard()
    }
    if (id === 'profile') {
      renderProfileSection()
    }
  }

  const sectionIds = new Set(sections.map((section) => section.id))
  const activeIdFromHash = () => {
    const id = window.location.hash.replace('#', '')
    return sectionIds.has(id) ? id : ''
  }

  const updateActiveFromViewport = () => {
    const hashId = activeIdFromHash()
    if (hashId) {
      setActive(hashId)
      return
    }

    const referenceY = window.innerHeight * 0.45
    const activeSection = sections
      .map((section) => {
        const rect = section.getBoundingClientRect()
        return {
          id: section.id,
          distance: Math.abs(rect.top - referenceY),
          visible: rect.bottom > 0 && rect.top < window.innerHeight
        }
      })
      .filter((section) => section.visible)
      .sort((a, b) => a.distance - b.distance)[0]

    if (activeSection?.id) setActive(activeSection.id)
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!link.hash) return
      const targetId = link.hash.slice(1)
      const targetSection = document.getElementById(targetId)
      if (!targetSection) return

      event.preventDefault()
      setActive(targetId)
      targetSection.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      })
      window.history.pushState(null, '', link.hash)
    })
  })

  updateActiveFromViewport()
  window.addEventListener('hashchange', updateActiveFromViewport)
  window.addEventListener('popstate', updateActiveFromViewport)

  if (!sections.length || !('IntersectionObserver' in window)) return

  const observer = new IntersectionObserver((entries) => {
    if (activeIdFromHash()) {
      updateActiveFromViewport()
      return
    }

    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
    if (visible?.target?.id) setActive(visible.target.id)
  }, {
    rootMargin: '-35% 0px -45% 0px',
    threshold: [0.12, 0.28, 0.5]
  })

  sections.forEach((section) => observer.observe(section))
}

initFullHistoryTool()
initBottomSectionNav()
initKnowledgeLibrary().then(() => {
  if (trackerSearchMode === 'sources') {
    renderSourceSearchResults()
  }
})

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return

  const levelUpCelebration = document.getElementById('quiz-level-up')
  if (levelUpCelebration && !levelUpCelebration.hidden) {
    event.preventDefault()
    event.stopPropagation()
    dismissQuizLevelUpCelebration()
    return
  }

  if (quizSoundMenuOpen) {
    event.preventDefault()
    event.stopPropagation()
    setQuizSoundMenuOpen(false)
    document.querySelector('[data-quiz-sound-toggle]')?.focus()
    return
  }

  if (activeSourceReaderState) {
    event.preventDefault()
    event.stopPropagation()
    closeSourceReader()
  }
}, { capture: true })
