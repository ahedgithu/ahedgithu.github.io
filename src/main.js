const subjects = [
  {
    code: 'SUR-1',
    name: 'Surgery 1',
    totalCount: 13,
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
        audioUrl: 'https://drive.google.com/file/d/1vt23RUJTWuT_1ZRUHGm4gvWJKW1sxUyI/view?usp=drivesdk'
      },
      {
        label: 'Clinical round overview',
        state: 'taken',
        art: 2,
        audioUrl: 'https://drive.google.com/file/d/1mpckOjHYl__72iCCGy4jXU7EJfzgzKlX/view?usp=drivesdk'
      },
      {
        label: 'Liver Trauma and Infections',
        state: 'taken',
        art: 3,
        note: 'Hepatobiliary lecture continued through amoebic hepatitis and abscess.',
        lectureUrls: [
          { label: 'Lecture', url: 'https://docs.google.com/presentation/d/1yjIUZolwSkC9DLnvTGCWBsxtPMuqalgY/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1mhHDVMOU6lPAar5xesF0eLKtNUJDwVR9/view?usp=drivesdk'
      },
      {
        label: 'Cirrhosis, portal hypertension and hepatic vascular disease',
        state: 'taken',
        art: 8,
        note: 'Includes esophageal varices, liver transplantation, Budd-Chiari syndrome, portal vein thrombosis, and splenic vein thrombosis.',
        audioUrl: 'https://drive.google.com/file/d/1t1i2zjXOYw9jaSdIRYn1GvBOrsToq30u/view?usp=drivesdk'
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
      {
        label: 'Diseases of the airways and bronchial asthma Part 1',
        state: 'taken',
        art: 10,
        section: 'Chest',
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/133Ae9Po7wzSJBOf-GqANHRBHmPBufviI/view?usp=drivesdk' }
        ]
      },
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
          { label: 'Anemia file', url: 'https://drive.google.com/file/d/1zcQyZdfM-y6qqo5AhaeZtORqEkUFIQJJ/view?usp=drivesdk' },
          { label: 'Sideroblastic', url: 'https://docs.google.com/presentation/d/10qAAzE1DcZj3QAjyhf_4kkA8mzf0QH6-/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true' }
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
        note: 'Continuation taken on Jun 16.',
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
const assignmentProgress = document.querySelector('[data-assignment-progress]')
const historyForm = document.getElementById('history-form')
const historyProgressCount = document.getElementById('history-progress-count')
const historyProgressFill = document.getElementById('history-progress-fill')
const historySummaryText = document.getElementById('history-summary-text')
const copyHistorySummary = document.getElementById('copy-history-summary')
const smokingDetails = document.getElementById('smoking-details')
const substanceDetails = document.getElementById('substance-details')
const substanceOtherField = document.getElementById('substance-other-field')
const whatsappFeedbackUrl = 'https://wa.me/201030469634?text=Hi%20Ahmed%2C%20I%20have%20a%20recommendation%20to%20improve%20the%20MED%20401%20tracker%3A%20'

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

function renderAssignmentProgress() {
  if (!assignmentProgress) return

  const startDate = new Date(`${assignmentProgress.dataset.startDate}T00:00:00`)
  const dueDate = new Date(`${assignmentProgress.dataset.dueDate}T00:00:00`)
  const today = new Date()
  const fill = assignmentProgress.querySelector('[data-assignment-fill]')
  const daysLabel = assignmentProgress.querySelector('[data-assignment-days]')
  const caption = assignmentProgress.querySelector('[data-assignment-caption]')
  const totalDays = Math.max(1, Math.ceil((dueDate - startDate) / 86400000))
  const daysLeft = Math.ceil((dueDate - today) / 86400000)
  const elapsedDays = totalDays - daysLeft
  const percent = clamp((elapsedDays / totalDays) * 100, 0, 100)

  if (fill) fill.style.width = `${percent}%`

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
    caption.textContent = `Due Sep 5, 2026 - ${Math.round(percent)}% of the assignment window has passed.`
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

function renderWhatsappFeedback() {
  if (document.querySelector('.whatsapp-feedback')) return

  const button = document.createElement('a')
  button.className = 'whatsapp-feedback'
  button.href = whatsappFeedbackUrl
  button.target = '_blank'
  button.rel = 'noopener noreferrer'
  button.setAttribute('aria-label', 'Send improvement recommendation on WhatsApp')
  button.innerHTML = `
    <span class="whatsapp-feedback__ring" aria-hidden="true"></span>
    <span class="whatsapp-feedback__icon" aria-hidden="true">
      <svg viewBox="0 0 32 32" role="img">
        <path d="M16 3.2c-7.05 0-12.8 5.55-12.8 12.38 0 2.25.64 4.45 1.84 6.36L3.1 28.8l7.08-1.82A13.18 13.18 0 0 0 16 28c7.05 0 12.8-5.55 12.8-12.42S23.05 3.2 16 3.2Zm0 22.64c-1.86 0-3.68-.5-5.27-1.45l-.38-.23-4.2 1.08 1.13-4.02-.25-.4a9.93 9.93 0 0 1-1.62-5.24C5.41 9.98 10.16 5.36 16 5.36s10.59 4.62 10.59 10.22S21.84 25.84 16 25.84Zm5.82-7.67c-.32-.15-1.88-.9-2.17-1-.29-.1-.5-.15-.72.15-.21.31-.82 1-.99 1.2-.18.2-.36.23-.67.08-.32-.15-1.33-.47-2.53-1.51-.94-.81-1.57-1.81-1.75-2.12-.18-.31-.02-.47.13-.62.14-.13.32-.36.47-.54.16-.18.21-.31.32-.52.1-.2.05-.38-.03-.54-.08-.15-.72-1.67-.98-2.29-.26-.6-.52-.52-.72-.53h-.61c-.21 0-.54.08-.83.38-.29.31-1.09 1.04-1.09 2.53 0 1.49 1.12 2.93 1.28 3.14.16.2 2.2 3.25 5.34 4.56.75.31 1.33.5 1.78.64.75.23 1.43.2 1.97.12.6-.09 1.88-.74 2.14-1.46.27-.72.27-1.33.19-1.46-.08-.13-.29-.2-.61-.36Z" />
      </svg>
    </span>
    <span class="whatsapp-feedback__label">Recommend</span>
  `

  document.body.append(button)
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

renderWhatsappFeedback()
renderAssignmentProgress()
