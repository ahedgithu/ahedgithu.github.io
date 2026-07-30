// MUST 301 static configuration module
// Primary Drive folder: https://drive.google.com/drive/folders/1612k0_L9kXG_lSNDk23_5P_q4b73243y

const subjects301 = [
  {
    code: 'CNS301',
    name: 'Central Nervous System 301',
    totalCount: 1,
    examNote: 'Year 3 curriculum.',
    topics: [
      {
        label: 'Central Nervous System Overview',
        state: 'taken',
        art: 0,
        note: 'Theoretical books, practical materials, and MCQs.',
        driveSelector: [
          { label: 'Primary 301 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/1612k0_L9kXG_lSNDk23_5P_q4b73243y' }
        ]
      }
    ]
  },
  {
    code: 'REP301',
    name: 'Reproductive System 301',
    totalCount: 1,
    examNote: 'Year 3 curriculum.',
    topics: [
      {
        label: 'Reproductive System Overview',
        state: 'taken',
        art: 1,
        note: 'Theoretical books, practical materials, and MCQs.',
        driveSelector: [
          { label: 'Primary 301 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/1612k0_L9kXG_lSNDk23_5P_q4b73243y' }
        ]
      }
    ]
  },
  {
    code: 'URS301',
    name: 'Urinary System 301',
    totalCount: 1,
    examNote: 'Year 3 curriculum.',
    topics: [
      {
        label: 'Urinary System Overview',
        state: 'taken',
        art: 2,
        note: 'Theoretical books, practical materials, and MCQs.',
        driveSelector: [
          { label: 'Primary 301 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/1612k0_L9kXG_lSNDk23_5P_q4b73243y' }
        ]
      }
    ]
  }
]

const section301Data = {
  id: '301',
  title: '301',
  newsTitle: 'MED 301 news',
  trackerSearchPlaceholder: 'Search 301 topics or subjects…',
  subjects: subjects301,
  midtermExamSchedule: [],
  courseSchedule: [],
  semesterTimeline: {
    start: '2026-05-25',
    finals: '2026-09-19'
  },
  scheduleLocation: ''
}

export { subjects301, section301Data }
