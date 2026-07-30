// MUST 302 static configuration module
// Primary Drive folder: https://drive.google.com/drive/folders/15830_L9kXG_lSNDk23_5P_q4b73243z

const subjects302 = [
  {
    code: 'ENT302',
    name: 'Ear, Nose & Throat 302',
    totalCount: 1,
    examNote: 'Year 3 curriculum.',
    topics: [
      {
        label: 'ENT Overview',
        state: 'taken',
        art: 0,
        note: 'Theoretical books, practical materials, and MCQs.',
        driveSelector: [
          { label: 'Primary 302 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/15830_L9kXG_lSNDk23_5P_q4b73243z' }
        ]
      }
    ]
  },
  {
    code: 'OPH302',
    name: 'Ophthalmology 302',
    totalCount: 1,
    examNote: 'Year 3 curriculum.',
    topics: [
      {
        label: 'Ophthalmology Overview',
        state: 'taken',
        art: 1,
        note: 'Theoretical books, practical materials, and MCQs.',
        driveSelector: [
          { label: 'Primary 302 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/15830_L9kXG_lSNDk23_5P_q4b73243z' }
        ]
      }
    ]
  },
  {
    code: 'COM302',
    name: 'Community Medicine 302',
    totalCount: 1,
    examNote: 'Year 3 curriculum.',
    topics: [
      {
        label: 'Community Medicine Overview',
        state: 'taken',
        art: 2,
        note: 'Theoretical books, practical materials, and MCQs.',
        driveSelector: [
          { label: 'Primary 302 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/15830_L9kXG_lSNDk23_5P_q4b73243z' }
        ]
      }
    ]
  }
]

const section302Data = {
  id: '302',
  title: '302',
  newsTitle: 'MED 302 news',
  trackerSearchPlaceholder: 'Search 302 topics or subjects…',
  subjects: subjects302,
  midtermExamSchedule: [],
  courseSchedule: [],
  semesterTimeline: {
    start: '2026-05-25',
    finals: '2026-09-19'
  },
  scheduleLocation: ''
}

export { subjects302, section302Data }
