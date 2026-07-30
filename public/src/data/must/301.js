// MUST 301 static configuration module
// Primary Drive folder: https://drive.google.com/drive/folders/10165aTyzXB0LgMl25HXZs46JBh1_TriN

const subjects301 = [
  {
    code: 'CNS301-1',
    name: 'Central Nervous System 301-1',
    totalCount: 1,
    examNote: 'Year 3 curriculum.',
    topics: [
      {
        label: 'CNS 301-1 Overview',
        state: 'taken',
        art: 0,
        note: 'Anatomy, Histology, Physiology, Pathology, Pharmacology & Microbiology.',
        driveSelector: [
          { label: 'Primary 301 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/10165aTyzXB0LgMl25HXZs46JBh1_TriN' }
        ]
      }
    ]
  },
  {
    code: 'CNS301-2',
    name: 'Central Nervous System 301-2',
    totalCount: 1,
    examNote: 'Year 3 curriculum.',
    topics: [
      {
        label: 'CNS 301-2 Overview',
        state: 'taken',
        art: 1,
        note: 'Anatomy, Histology, Physiology, Pathology, Pharmacology & Microbiology.',
        driveSelector: [
          { label: 'Primary 301 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/10165aTyzXB0LgMl25HXZs46JBh1_TriN' }
        ]
      }
    ]
  },
  {
    code: 'REP',
    name: 'Reproductive System 301',
    totalCount: 1,
    examNote: 'Year 3 curriculum.',
    topics: [
      {
        label: 'Reproductive System Overview',
        state: 'taken',
        art: 2,
        note: 'Discipline resources and practical materials.',
        driveSelector: [
          { label: 'Primary 301 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/10165aTyzXB0LgMl25HXZs46JBh1_TriN' }
        ]
      }
    ]
  },
  {
    code: 'URS',
    name: 'Urinary System 301',
    totalCount: 1,
    examNote: 'Year 3 curriculum.',
    topics: [
      {
        label: 'Urinary System Overview',
        state: 'taken',
        art: 3,
        note: 'Discipline resources and practical materials.',
        driveSelector: [
          { label: 'Primary 301 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/10165aTyzXB0LgMl25HXZs46JBh1_TriN' }
        ]
      }
    ]
  },
  {
    code: 'ETH301',
    name: 'Medical Ethics 301',
    totalCount: 1,
    examNote: 'Year 3 curriculum.',
    topics: [
      {
        label: 'Ethics & Professional Conduct',
        state: 'taken',
        art: 4,
        note: 'Ethics 301 lecture materials and guidelines.',
        driveSelector: [
          { label: 'Primary 301 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/10165aTyzXB0LgMl25HXZs46JBh1_TriN' }
        ]
      }
    ]
  },
  {
    code: 'PCD300',
    name: 'Patient Care & Doctoring 300',
    totalCount: 1,
    examNote: 'Year 3 curriculum.',
    topics: [
      {
        label: 'Patient Care & Doctoring 300 Overview',
        state: 'taken',
        art: 5,
        note: 'Clinical skills and doctoring materials.',
        driveSelector: [
          { label: 'Primary 301 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/10165aTyzXB0LgMl25HXZs46JBh1_TriN' }
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
