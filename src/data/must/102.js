// MUST 102 static configuration module
// Primary Drive folder: https://drive.google.com/drive/folders/10CzMmVFNYeN1qB-pD6akyLy5Rj-6RCjS

const subjects102 = [
  {
    code: 'FHB102-1',
    name: 'Foundations of Human Body 102-1',
    totalCount: 1,
    examNote: 'Year 1 curriculum.',
    topics: [
      {
        label: 'FHB 102-1 Overview',
        state: 'taken',
        art: 0,
        note: 'Theoretical data and department materials.',
        driveSelector: [
          { label: 'Primary 102 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/10CzMmVFNYeN1qB-pD6akyLy5Rj-6RCjS' }
        ]
      }
    ]
  },
  {
    code: 'FHB102-2',
    name: 'Foundations of Human Body 102-2',
    totalCount: 1,
    examNote: 'Year 1 curriculum.',
    topics: [
      {
        label: 'FHB 102-2 Overview',
        state: 'taken',
        art: 1,
        note: 'Theoretical data and department materials.',
        driveSelector: [
          { label: 'Primary 102 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/10CzMmVFNYeN1qB-pD6akyLy5Rj-6RCjS' }
        ]
      }
    ]
  },
  {
    code: 'MSK102-1',
    name: 'Musculoskeletal 102-1',
    totalCount: 1,
    examNote: 'Year 1 curriculum.',
    topics: [
      {
        label: 'MSK 102-1 Overview',
        state: 'taken',
        art: 2,
        note: 'Theoretical books and recordings.',
        driveSelector: [
          { label: 'Primary 102 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/10CzMmVFNYeN1qB-pD6akyLy5Rj-6RCjS' }
        ]
      }
    ]
  },
  {
    code: 'MSK102-2',
    name: 'Musculoskeletal 102-2',
    totalCount: 1,
    examNote: 'Year 1 curriculum.',
    topics: [
      {
        label: 'MSK 102-2 Overview',
        state: 'taken',
        art: 3,
        note: 'Theoretical books and recordings.',
        driveSelector: [
          { label: 'Primary 102 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/10CzMmVFNYeN1qB-pD6akyLy5Rj-6RCjS' }
        ]
      }
    ]
  },
  {
    code: 'BIO102',
    name: 'Biochemistry 102',
    totalCount: 1,
    examNote: 'Year 1 curriculum.',
    topics: [
      {
        label: 'Enzymes & Metabolism',
        state: 'taken',
        art: 4,
        note: 'Enzymes parts 1-3, department books, and practical materials.',
        driveSelector: [
          { label: 'Primary 102 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/10CzMmVFNYeN1qB-pD6akyLy5Rj-6RCjS' }
        ]
      }
    ]
  },
  {
    code: 'ETH102',
    name: 'Medical Ethics 102',
    totalCount: 1,
    examNote: 'Year 1 curriculum.',
    topics: [
      {
        label: 'Medical Ethics & Patient Rights',
        state: 'taken',
        art: 5,
        note: 'Research ethics, informed consent, confidentiality, and doctor-patient relationship.',
        driveSelector: [
          { label: 'Primary 102 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/10CzMmVFNYeN1qB-pD6akyLy5Rj-6RCjS' }
        ]
      }
    ]
  },
  {
    code: 'PCD100',
    name: 'Patient Care & Doctoring 100',
    totalCount: 1,
    examNote: 'Year 1 curriculum.',
    topics: [
      {
        label: 'History Taking & Vital Signs',
        state: 'taken',
        art: 6,
        note: 'History taking, vital signs, and medical terminology.',
        driveSelector: [
          { label: 'Primary 102 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/10CzMmVFNYeN1qB-pD6akyLy5Rj-6RCjS' }
        ]
      }
    ]
  }
]

const section102Data = {
  id: '102',
  title: '102',
  newsTitle: 'MED 102 news',
  trackerSearchPlaceholder: 'Search 102 topics or subjects…',
  subjects: subjects102,
  midtermExamSchedule: [],
  courseSchedule: [],
  semesterTimeline: {
    start: '2026-05-25',
    finals: '2026-09-19'
  },
  scheduleLocation: ''
}

export { subjects102, section102Data }
