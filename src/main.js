import './style.css'

const subjects = [
  {
    code: 'SUR-1',
    name: 'Surgery 1',
    totalCount: 12,
    examNote: 'Midterm starts Jul 18, 2026. Exact SUR-1 schedule pending.',
    topics: [
      {
        label: 'Liver Introduction',
        state: 'taken',
        art: 0,
        lectureUrls: [
          { label: 'Lecture', url: 'https://docs.google.com/presentation/d/12BIYR9r2h_fwkUQpXQI0xOyPy-lSI9D_/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1ukIDlUnzzpsyCOola5-TiyWJy7e2QELO/view?usp=drivesdk'
      },
      {
        label: 'Oesophagus: surgical anatomy and physiology',
        state: 'taken',
        art: 1,
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1-iY3KOVw6vUWm_7k--A9lWFJnuGxYqoo/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1l4H_hY6RO36c-iYZFLyJu8h9rv-jfYi5/view?usp=drivesdk'
      },
      {
        label: 'Esophagus: achalasia, hiatus hernia, GERD',
        state: 'taken',
        art: 1,
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1-uzZPnXaDetSZxCujFNDLudZ_TOJaQEh/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1l4H_hY6RO36c-iYZFLyJu8h9rv-jfYi5/view?usp=drivesdk'
      },
      {
        label: 'Clinical round overview',
        state: 'taken',
        art: 2,
        audioUrl: 'https://drive.google.com/file/d/1mpckOjHYl__72iCCGy4jXU7EJfzgzKlX/view?usp=drivesdk'
      },
      {
        label: 'Liver Trauma and Infections',
        state: 'partial',
        art: 3,
        note: 'Stopped at amoebic hepatitis and liver abscess.',
        lectureUrls: [
          { label: 'Lecture', url: 'https://docs.google.com/presentation/d/1yjIUZolwSkC9DLnvTGCWBsxtPMuqalgY/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1mhHDVMOU6lPAar5xesF0eLKtNUJDwVR9/view?usp=drivesdk'
      },
      { label: 'Tongue', state: 'remaining', art: 2 },
      { label: 'Salivary glands', state: 'remaining', art: 13 },
      { label: 'Stomach', state: 'remaining', art: 6 },
      { label: 'Pancreas', state: 'remaining', art: 4 },
      { label: 'Intestines', state: 'remaining', art: 7 },
      { label: 'Biliary tract', state: 'remaining', art: 0 },
      { label: 'Spleen', state: 'remaining', art: 12 }
    ]
  },
  {
    code: 'SUR-2',
    name: 'Surgery 2',
    totalCount: 6,
    examNote: 'Midterm starts Jul 18, 2026. Exact SUR-2 schedule pending.',
    topics: [
      {
        label: 'Overview of the Subject',
        state: 'taken',
        art: 2,
        audioUrl: 'https://drive.google.com/file/d/1JCS1ZR8BiLL2sGVi-0B6UBExsstVOZEP/view?usp=drivesdk'
      },
      { label: 'Chest trauma / trauma up to sternal fractures', state: 'announced', art: 10, note: 'Announced in university, not explained yet.' },
      { label: 'Rib fracture', state: 'remaining', art: 10 },
      { label: 'Pneumothorax, tension pneumothorax, hemothorax', state: 'remaining', art: 10 },
      { label: 'Pulmonary contusion and flail chest', state: 'remaining', art: 10 },
      { label: 'Empyema', state: 'remaining', art: 10 }
    ]
  },
  {
    code: 'MED-1',
    name: 'Internal Medicine 1',
    totalCount: 6,
    examNote: 'Midterm starts Jul 18, 2026. Exact MED-1 schedule pending.',
    topics: [
      {
        label: 'Diseases of the Pancreas',
        state: 'taken',
        art: 4,
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/14TjxXXk2ITCHuao-ayMIwT4z1yjbNFuh/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1Jw6R2QaYMQ9PerWxCAU_0vMfReSneE1o/view?usp=drivesdk'
      },
      {
        label: 'Investigation of Acute Hepatitis',
        state: 'taken',
        art: 5,
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1LQ-zgjWNlzGar7OgfX1WhBxkqvsTIAhQ/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1pCiruJJQ6rB84pyxeGy_NUY5QMUzDJVi/view?usp=drivesdk'
      },
      { label: 'Chronic viral and non-viral hepatitis', state: 'remaining', art: 5 },
      { label: 'Diseases of Stomach: PUD, H. pylori, non-ulcer dyspepsia', state: 'remaining', art: 6 },
      { label: 'Small intestine: diarrhea, malabsorption, celiac, Whipple', state: 'remaining', art: 7 },
      { label: 'Cirrhosis complications: portal hypertension, ascites', state: 'remaining', art: 8 }
    ]
  },
  {
    code: 'MED-2',
    name: 'Internal Medicine 2',
    totalCount: 13,
    examNote: 'Midterm starts Jul 18, 2026. Exact MED-2 schedule pending.',
    topics: [
      { label: 'Cardiology Symptomatology', state: 'remaining', art: 9, section: 'Cardio' },
      {
        label: 'Systemic Hypertension',
        state: 'taken',
        art: 9,
        section: 'Cardio',
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1lCYbFrQVM23IHF-qxs0DItq6wHIjwxxP/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1ryTmHHfCBcIzK0AXKgYYxqSKvvbMHAZk/view?usp=drivesdk'
      },
      {
        label: 'Rheumatic fever and infective endocarditis',
        state: 'taken',
        art: 9,
        section: 'Cardio',
        lectureUrls: [
          { label: 'Lecture', url: 'https://docs.google.com/presentation/d/1yZxhWUh5KDgQp_Z_Le10RL_JmdooXpwb/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1G7x3QDKNsrxEZXdm-iQBAEeQzijaul2K/view?usp=drivesdk'
      },
      { label: 'Ischemic heart disease and stable angina', state: 'remaining', art: 9, section: 'Cardio' },
      { label: 'Acute coronary syndrome', state: 'remaining', art: 9, section: 'Cardio' },
      { label: 'Pulmonary embolism', state: 'remaining', art: 10, section: 'Cardio' },
      { label: 'Aortic and mitral valve diseases', state: 'remaining', art: 9, section: 'Cardio' },
      { label: 'Pericardial diseases', state: 'remaining', art: 9, section: 'Cardio' },
      {
        label: 'Chest Symptomatology',
        state: 'taken',
        art: 10,
        section: 'Chest',
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1SX1PStcEfLVwTwYt_WfjesGwkieI2Pfd/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/14YTH3onMolGkFXHzRSyG_ejnZv9ryGG5/view?usp=drivesdk'
      },
      {
        label: 'Pulmonary Function Test',
        state: 'taken',
        art: 11,
        section: 'Chest',
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1k5IlWjpjnwEeKt4UmcD-zdBNtqiyr0S2/view?usp=drivesdk' },
          { label: 'Slides', url: 'https://docs.google.com/presentation/d/1I3A5NgJf0YtX932PbftokMNZeKfjGEln/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1O83lsWK2zc1e7u6Yljwtd5ZFM2llnrFA/view?usp=drivesdk'
      },
      { label: 'Bronchial asthma', state: 'remaining', art: 10, section: 'Chest' },
      { label: 'COPD', state: 'remaining', art: 10, section: 'Chest' },
      { label: 'Upper and lower respiratory tract infections', state: 'remaining', art: 10, section: 'Chest' }
    ]
  },
  {
    code: 'ONC',
    name: 'Oncology',
    totalCount: 6,
    examNote: 'Midterm starts Jul 18, 2026. Exact ONC schedule pending.',
    topics: [
      {
        label: 'Anemia of chronic disease and hemoglobinopathies',
        state: 'taken',
        art: 12,
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1D3qbb6zibbkzstmNeipmEoNPlnF7BN2q/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1qH7bGw0mqGQzaf8lzszR72PRFUAnNCG6/view?usp=drivesdk'
      },
      {
        label: 'Anemia file completion and sideroblastic anemia',
        state: 'taken',
        art: 12,
        lectureUrls: [
          { label: 'Anemia file', url: 'https://drive.google.com/file/d/1D3qbb6zibbkzstmNeipmEoNPlnF7BN2q/view?usp=drivesdk' },
          { label: 'Sideroblastic', url: 'https://drive.google.com/file/d/193s34WPr256lnGnqn1Hb9Gx7-g4m81__/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1UuxB_UA6w7NKqgPerO6yadsKbpdNcNle/view?usp=drivesdk'
      },
      { label: 'Anemia approach and iron deficiency anemia', state: 'remaining', art: 12 },
      { label: 'Hemolytic anemia', state: 'remaining', art: 12 },
      { label: 'Polycythemia vera and essential thrombocytosis', state: 'remaining', art: 12 },
      { label: 'Bleeding disorders', state: 'remaining', art: 14 }
    ]
  },
  {
    code: 'NUT',
    name: 'Nutrition',
    totalCount: 8,
    examNote: 'Midterm starts Jul 18, 2026. Exact NUT schedule pending.',
    topics: [
      {
        label: 'Vitamins',
        state: 'taken',
        art: 13,
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1rCjJqBqu8wOWIW0SMHoGjvyXSCIniwsR/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1twQvgbaRxLMP2vBRu4dVV7nU6zmMHUFV/view?usp=drivesdk'
      },
      {
        label: 'Food-borne Diseases',
        state: 'taken',
        art: 13,
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1q5b51GzxLYXT-iOOLfA1M1KnigeJTE1b/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1Lr0LftsOc_-uhH2X82uqzJ0eSkUWgSDz/view?usp=drivesdk'
      },
      { label: 'Iodine', state: 'remaining', art: 13 },
      { label: 'Nutrition in elderly', state: 'remaining', art: 13 },
      { label: 'AIDS nutrition', state: 'remaining', art: 13 },
      { label: 'Iron deficiency anemia', state: 'remaining', art: 12 },
      { label: 'Nutrition in cancer and obesity', state: 'remaining', art: 13 },
      { label: 'TB and influenza nutrition', state: 'remaining', art: 13 }
    ]
  },
  {
    code: 'LAB',
    name: 'Lab Medicine',
    totalCount: 6,
    examNote: 'Midterm starts Jul 18, 2026. Exact LAB schedule pending.',
    topics: [
      {
        label: 'Liver Function Test',
        state: 'taken',
        art: 5,
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/154Sxxn2R_Y-6l2i3pvhFtWP_Roi_GR0Q/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/122BV8-mfoCWNXt979EaO2ZkMGbGuHpm5/view?usp=drivesdk'
      },
      {
        label: 'Cardiac Biomarkers',
        state: 'taken',
        art: 14,
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1RkmsX-_jlL3klayg5fvPwk6gk-LYPYHA/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/168l5PhCSMGsl3GWyVeFpDiw8WEWaJlmC/view?usp=drivesdk'
      },
      { label: 'Clinical Pathology Research Assignment', state: 'remaining', art: 14 },
      { label: 'Lipid profile', state: 'remaining', art: 14 },
      { label: 'WBCs and leukemia', state: 'remaining', art: 12 },
      { label: 'Microbiology', state: 'remaining', art: 14 }
    ]
  },
  {
    code: 'ANAE',
    name: 'Anesthesia',
    totalCount: 7,
    examNote: 'Midterm starts Jul 18, 2026. Exact ANAE schedule pending.',
    topics: [
      {
        label: 'Preoperative Patient Management',
        state: 'taken',
        art: 15,
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1V5Shpas5pvITeqRW3U6hQs1iN6qZGJcv/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1sFabKs8xoweV_eSqkB_D7YVXufv28rLt/view?usp=drivesdk'
      },
      {
        label: 'Monitoring and Fluid Therapy',
        state: 'taken',
        art: 15,
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1ICi7ExmMJ3zhXnp-dfh0rlHo0cEYub0E/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1o1biv_U_2DBaIVnJPvbN5UXlmPfSkGlq/view?usp=drivesdk'
      },
      { label: 'General anaesthesia', state: 'remaining', art: 15 },
      { label: 'CPR', state: 'remaining', art: 15 },
      { label: 'Oxygen therapy', state: 'remaining', art: 15 },
      { label: 'Nutrition in ICU', state: 'remaining', art: 13 },
      { label: 'ICU admission and discharge criteria', state: 'remaining', art: 15 }
    ]
  }
]

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const mobileQuery = window.matchMedia('(max-width: 860px)')

const coveredStates = new Set(['taken', 'partial'])
const stateLabels = {
  taken: 'Taken in university',
  partial: 'Partially taken',
  announced: 'Announced only',
  remaining: 'Remaining'
}

const subjectList = document.getElementById('subject-list')
const selectedCode = document.getElementById('selected-code')
const selectedName = document.getElementById('selected-name')
const selectedCount = document.getElementById('selected-count')
const selectedPercent = document.getElementById('selected-percent')
const progressFill = document.getElementById('progress-fill')
const topicList = document.getElementById('topic-list')
const semesterFill = document.getElementById('semester-fill')
const todayMarker = document.getElementById('today-marker')
const midtermMarker = document.getElementById('midterm-marker')
const finalsMarker = document.getElementById('finals-marker')
const nextCheckpoint = document.getElementById('next-checkpoint')
const bookingForm = document.getElementById('booking-form')
const bookingName = document.getElementById('booking-name')
const bookingService = document.getElementById('booking-service')
const bookingTime = document.getElementById('booking-time')

const initialParams = new URLSearchParams(window.location.search)
const initialSubject = subjects.find((subject) => subject.code === initialParams.get('subject'))
let activeSubjectCode = initialSubject?.code || subjects[0].code
let expandedSubjectCode = mobileQuery.matches && initialParams.get('tracker') === '1' ? activeSubjectCode : null

function getPercent(subject) {
  if (!subject.totalCount) return 0
  return Math.round((getCoveredCount(subject) / subject.totalCount) * 100)
}

function getCoveredCount(subject) {
  return subject.topics.filter((topic) => coveredStates.has(topic.state)).length
}

function getStateCounts(subject) {
  return subject.topics.reduce((counts, topic) => {
    counts[topic.state] = (counts[topic.state] || 0) + 1
    return counts
  }, {})
}

function getSubjectSummary(subject) {
  const counts = getStateCounts(subject)
  const parts = [
    counts.taken ? `${counts.taken} taken` : '',
    counts.partial ? `${counts.partial} partial` : '',
    counts.announced ? `${counts.announced} announced` : '',
    (counts.remaining || 0) ? `${counts.remaining || 0} remaining` : ''
  ].filter(Boolean)

  return parts.join(' · ')
}

function getResourceItems(topic) {
  const lectureItems = (topic.lectureUrls || []).map((item) => ({ ...item, type: 'lecture' }))
  const audioItem = topic.audioUrl ? [{ label: 'Audio', url: topic.audioUrl, type: 'audio' }] : []
  return [...lectureItems, ...audioItem]
}

function renderResourceLinks(topic) {
  if (!coveredStates.has(topic.state)) return ''

  const resources = getResourceItems(topic)
  const links = resources.map((item) => `
    <a class="topic-resource topic-resource--${item.type}" href="${item.url}" target="_blank" rel="noopener noreferrer">
      ${item.label}
    </a>
  `).join('')

  const pendingLecture = topic.lectureUrls?.length ? '' : '<span class="topic-resource topic-resource--pending">Lecture pending</span>'
  const pendingAudio = topic.audioUrl ? '' : '<span class="topic-resource topic-resource--pending">Audio pending</span>'

  return `
    <span class="topic-resources" aria-label="Topic resources">
      ${links}
      ${pendingLecture}
      ${pendingAudio}
    </span>
  `
}

function updateTrackerUrl(subjectCode) {
  const url = new URL(window.location.href)
  url.searchParams.set('tracker', '1')
  url.searchParams.set('subject', subjectCode)
  url.hash = 'tracker'
  window.history.replaceState({}, '', url)
}

function renderTopicCard(topic, index) {
  const tileX = topic.art % 4
  const tileY = Math.floor(topic.art / 4)

  return `
    <li class="topic-item topic-item--${topic.state}" style="--delay: ${index * 45}ms; --tile-x: ${tileX}; --tile-y: ${tileY};">
      <span class="topic-item__image" aria-hidden="true"></span>
      <span class="topic-item__index">${String(index + 1).padStart(2, '0')}</span>
        <span class="topic-item__body">
          <span class="topic-item__label">${topic.label}</span>
        <span class="topic-item__state topic-item__state--${topic.state}">${stateLabels[topic.state] || topic.state}</span>
        ${topic.note ? `<span class="topic-item__note">${topic.note}</span>` : ''}
        ${renderResourceLinks(topic)}
      </span>
    </li>
  `
}

function renderTopicCards(subject) {
  if (!subject.topics.some((topic) => topic.section)) {
    return subject.topics.map((topic, index) => renderTopicCard(topic, index)).join('')
  }

  const sections = subject.topics.reduce((collection, topic) => {
    const title = topic.section || 'Topics'
    const section = collection.find((item) => item.title === title)

    if (section) {
      section.topics.push(topic)
    } else {
      collection.push({ title, topics: [topic] })
    }

    return collection
  }, [])

  let topicIndex = 0

  return sections.map((section) => {
    const headingDelay = topicIndex * 45
    const topicMarkup = section.topics.map((topic) => renderTopicCard(topic, topicIndex++)).join('')

    return `
      <li class="topic-section-heading" style="--delay: ${headingDelay}ms">${section.title}</li>
      ${topicMarkup}
    `
  }).join('')
}

function renderSubjects() {
  subjectList.innerHTML = subjects.map((subject, index) => {
    const percent = getPercent(subject)
    const isActive = subject.code === activeSubjectCode
    const isExpanded = subject.code === expandedSubjectCode
    const activeClass = isActive ? ' active' : ''
    const expandedClass = isExpanded ? ' expanded' : ''
    const inlinePanel = isExpanded ? `
      <div class="subject-inline-detail">
        <div class="subject-inline-detail__top">
          <span>${getCoveredCount(subject)} covered</span>
          <span>${subject.totalCount - getCoveredCount(subject)} not covered</span>
        </div>
        <ul class="topic-list topic-list--inline">
          ${renderTopicCards(subject)}
        </ul>
      </div>
    ` : ''

    return `
      <div class="subject-row${expandedClass}" style="--delay: ${index * 45}ms">
        <button class="subject-button${activeClass}" type="button" data-code="${subject.code}" aria-expanded="${isExpanded}">
          <span>
            <strong>${subject.code}</strong>
            <small>${subject.name}</small>
            <em class="subject-button__summary">${getSubjectSummary(subject)}</em>
          </span>
          <span class="subject-button__meta">${getCoveredCount(subject)}/${subject.totalCount}</span>
          <span class="subject-button__bar" aria-hidden="true">
            <span style="width: ${percent}%"></span>
          </span>
        </button>
        ${inlinePanel}
      </div>
    `
  }).join('')

  subjectList.querySelectorAll('.subject-button').forEach((button) => {
    button.addEventListener('click', () => {
      setActiveSubject(button.dataset.code)
    })
  })
}

function setActiveSubject(code, mobileMode = 'toggle') {
  const subject = subjects.find((item) => item.code === code) || subjects[0]
  updateTrackerUrl(subject.code)

  if (mobileQuery.matches) {
    if (mobileMode === 'open') {
      expandedSubjectCode = subject.code
    } else if (mobileMode === 'closed') {
      expandedSubjectCode = null
    } else {
      expandedSubjectCode = expandedSubjectCode === subject.code ? null : subject.code
    }
    activeSubjectCode = subject.code
    renderSubjects()
    return
  }

  activeSubjectCode = subject.code
  expandedSubjectCode = null

  subjectList.querySelectorAll('.subject-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.code === subject.code)
    button.setAttribute('aria-expanded', 'false')
  })

  const percent = getPercent(subject)
  selectedCode.textContent = subject.code
  selectedName.textContent = subject.name
  selectedCount.textContent = `${getCoveredCount(subject)} / ${subject.totalCount}`
  selectedPercent.textContent = `${percent}%`

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

  topicList.innerHTML = renderTopicCards(subject)
}

function getTodayLabel() {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date())
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getTimelinePercent(date, startDate, endDate) {
  const start = startDate.getTime()
  const end = endDate.getTime()
  return clamp(((date.getTime() - start) / (end - start)) * 100, 0, 100)
}

function renderSemesterTimeline() {
  if (!semesterFill || !todayMarker || !midtermMarker || !finalsMarker) return

  const today = new Date()
  const semesterStart = new Date('2026-05-25T00:00:00')
  const midterm = new Date('2026-07-18T00:00:00')
  const finals = new Date('2026-09-19T00:00:00')
  const todayPercent = getTimelinePercent(today, semesterStart, finals)
  const midtermPercent = getTimelinePercent(midterm, semesterStart, finals)

  semesterFill.style.width = `${todayPercent}%`
  todayMarker.style.left = `${todayPercent}%`
  midtermMarker.style.left = `${midtermPercent}%`
  finalsMarker.style.left = '100%'

  if (nextCheckpoint) {
    nextCheckpoint.textContent = today < midterm ? 'Midterm - Jul 18, 2026' : 'Finals - Sep 19, 2026'
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

if (subjectList) {
  renderSubjects()
  setActiveSubject(activeSubjectCode, initialParams.get('tracker') === '1' ? 'open' : 'closed')
  renderSemesterTimeline()
}

requestAnimationFrame(() => {
  const params = new URLSearchParams(window.location.search)
  if (subjectList && mobileQuery.matches && params.get('tracker') === '1') {
    expandedSubjectCode = activeSubjectCode
    renderSubjects()
  }
})

if (bookingForm) {
  bookingForm.addEventListener('submit', handleBookingSubmit)
}
