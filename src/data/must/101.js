// MUST 101 static configuration module
// Primary Drive folder: https://drive.google.com/drive/folders/1k1lnWPHG70vQd7nv-QSsorgtXcwyoFfp

const subjects101 = [
  {
    code: 'FHB101',
    name: 'Foundations of Human Body 101',
    totalCount: 1,
    examNote: 'Year 1 curriculum.',
    topics: [
      {
        label: 'General Foundations & Anatomy',
        state: 'taken',
        art: 0,
        note: 'Theoretical and practical department resources.',
        driveSelector: [
          { label: 'Primary 101 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/1k1lnWPHG70vQd7nv-QSsorgtXcwyoFfp' }
        ]
      }
    ]
  },
  {
    code: 'MSK101-1',
    name: 'Musculoskeletal 101-1',
    totalCount: 1,
    examNote: 'Year 1 curriculum.',
    topics: [
      {
        label: 'MSK 101-1 Overview',
        state: 'taken',
        art: 1,
        note: 'Theoretical books and recordings.',
        driveSelector: [
          { label: 'Primary 101 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/1k1lnWPHG70vQd7nv-QSsorgtXcwyoFfp' }
        ]
      }
    ]
  },
  {
    code: 'MSK101-2',
    name: 'Musculoskeletal 101-2',
    totalCount: 1,
    examNote: 'Year 1 curriculum.',
    topics: [
      {
        label: 'MSK 101-2 Overview',
        state: 'taken',
        art: 2,
        note: 'Theoretical books and recordings.',
        driveSelector: [
          { label: 'Primary 101 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/1k1lnWPHG70vQd7nv-QSsorgtXcwyoFfp' }
        ]
      }
    ]
  },
  {
    code: 'BIO101',
    name: 'Biochemistry 101',
    totalCount: 1,
    examNote: 'Year 1 curriculum.',
    topics: [
      {
        label: 'Biochemistry Overview',
        state: 'taken',
        art: 3,
        note: 'Department books and MCQs.',
        driveSelector: [
          { label: 'Primary 101 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/1k1lnWPHG70vQd7nv-QSsorgtXcwyoFfp' }
        ]
      }
    ]
  },
  {
    code: 'PSY101',
    name: 'Psychology 101',
    totalCount: 1,
    examNote: 'Year 1 curriculum.',
    topics: [
      {
        label: 'Psychology Overview',
        state: 'taken',
        art: 4,
        note: 'Lecture material and questions.',
        driveSelector: [
          { label: 'Primary 101 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/1k1lnWPHG70vQd7nv-QSsorgtXcwyoFfp' }
        ]
      }
    ]
  },
  {
    code: 'STA101',
    name: 'Statistics 101',
    totalCount: 1,
    examNote: 'Year 1 curriculum.',
    topics: [
      {
        label: 'Medical Statistics',
        state: 'taken',
        art: 5,
        note: 'Biostatistics and exercises.',
        driveSelector: [
          { label: 'Primary 101 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/1k1lnWPHG70vQd7nv-QSsorgtXcwyoFfp' }
        ]
      }
    ]
  }
]

const section101Data = {
  id: '101',
  title: '101',
  newsTitle: 'MED 101 news',
  trackerSearchPlaceholder: 'Search 101 topics or subjects…',
  subjects: subjects101,
  midtermExamSchedule: [],
  courseSchedule: [],
  semesterTimeline: {
    start: '2026-05-25',
    finals: '2026-09-19'
  },
  scheduleLocation: ''
}

export { subjects101, section101Data }
