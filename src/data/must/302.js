// MUST 302 static configuration module
// Primary integrated archive: https://drive.google.com/drive/folders/1L4LmUNvaRunNa_WbvtJmeK6dNQiwiLql

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
        note: 'Theoretical files, practical files, books, and exam materials.',
        driveSelector: [
          { label: 'Primary 302 Archive', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/1L4LmUNvaRunNa_WbvtJmeK6dNQiwiLql' }
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
        note: 'Theoretical files, practical files, books, and exam materials.',
        driveSelector: [
          { label: 'Primary 302 Archive', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/1L4LmUNvaRunNa_WbvtJmeK6dNQiwiLql' }
        ]
      }
    ]
  },
  {
    code: 'LMT302',
    name: 'Legal Medicine & Toxicology 302',
    totalCount: 1,
    examNote: 'Year 3 curriculum.',
    topics: [
      {
        label: 'Legal Medicine & Toxicology Overview',
        state: 'taken',
        art: 2,
        note: 'Forensic medicine, toxicology, and practical materials.',
        driveSelector: [
          { label: 'Primary 302 Archive', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/1L4LmUNvaRunNa_WbvtJmeK6dNQiwiLql' }
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
        art: 3,
        note: 'Theoretical files, practical files, books, and 302 plan PDF.',
        driveSelector: [
          { label: 'Primary 302 Archive', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/1L4LmUNvaRunNa_WbvtJmeK6dNQiwiLql' }
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
