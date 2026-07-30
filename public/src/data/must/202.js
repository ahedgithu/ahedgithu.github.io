// MUST 202 static configuration module
// Primary Drive folder: https://drive.google.com/drive/folders/1UBcPhUqJ2oS7u5igmTlvEinI5Y9usRGs

const subjects202 = [
  {
    code: 'DHB-1',
    name: 'Digestive Health & Blood 1',
    totalCount: 1,
    examNote: 'Year 2 curriculum.',
    topics: [
      {
        label: 'DHB-1 Overview',
        state: 'taken',
        art: 0,
        note: 'Theoretical books, practical materials, and MCQs.',
        driveSelector: [
          { label: 'Primary 202 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/1UBcPhUqJ2oS7u5igmTlvEinI5Y9usRGs' }
        ]
      }
    ]
  },
  {
    code: 'DHB-2',
    name: 'Digestive Health & Blood 2',
    totalCount: 1,
    examNote: 'Year 2 curriculum.',
    topics: [
      {
        label: 'DHB-2 Overview',
        state: 'taken',
        art: 1,
        note: 'Theoretical books, practical materials, and MCQs.',
        driveSelector: [
          { label: 'Primary 202 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/1UBcPhUqJ2oS7u5igmTlvEinI5Y9usRGs' }
        ]
      }
    ]
  },
  {
    code: 'END',
    name: 'Endocrinology 202',
    totalCount: 1,
    examNote: 'Year 2 curriculum.',
    topics: [
      {
        label: 'Endocrinology Overview',
        state: 'taken',
        art: 2,
        note: 'Theoretical books, practical materials, and MCQs.',
        driveSelector: [
          { label: 'Primary 202 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/1UBcPhUqJ2oS7u5igmTlvEinI5Y9usRGs' }
        ]
      }
    ]
  },
  {
    code: 'MET202',
    name: 'Metabolism 202',
    totalCount: 1,
    examNote: 'Year 2 curriculum.',
    topics: [
      {
        label: 'Metabolism 202 Overview',
        state: 'taken',
        art: 3,
        note: 'Theoretical books, practical materials, and MCQs.',
        driveSelector: [
          { label: 'Primary 202 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/1UBcPhUqJ2oS7u5igmTlvEinI5Y9usRGs' }
        ]
      }
    ]
  },
  {
    code: 'REM',
    name: 'Renal & Excretory System',
    totalCount: 1,
    examNote: 'Year 2 curriculum.',
    topics: [
      {
        label: 'Renal & Excretory System Overview',
        state: 'taken',
        art: 4,
        note: 'Theoretical books, practical materials, and MCQs.',
        driveSelector: [
          { label: 'Primary 202 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/1UBcPhUqJ2oS7u5igmTlvEinI5Y9usRGs' }
        ]
      }
    ]
  },
  {
    code: 'PCD',
    name: 'Patient Care & Doctoring 202',
    totalCount: 1,
    examNote: 'Year 2 curriculum.',
    topics: [
      {
        label: 'Patient Care & Doctoring Overview',
        state: 'taken',
        art: 5,
        note: 'Practical PowerPoints, portfolios, and clinical materials.',
        driveSelector: [
          { label: 'Primary 202 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/1UBcPhUqJ2oS7u5igmTlvEinI5Y9usRGs' }
        ]
      }
    ]
  }
]

const section202Data = {
  id: '202',
  title: '202',
  newsTitle: 'MED 202 news',
  trackerSearchPlaceholder: 'Search 202 topics or subjects…',
  subjects: subjects202,
  midtermExamSchedule: [],
  courseSchedule: [],
  semesterTimeline: {
    start: '2026-05-25',
    finals: '2026-09-19'
  },
  scheduleLocation: ''
}

export { subjects202, section202Data }
