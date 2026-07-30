// MUST 201 static configuration module
// Primary Drive folder: https://drive.google.com/drive/folders/11pVhv6h-prfNVBivoR6EmfH3wtiicL3H

const subjects201 = [
  {
    code: 'CVS',
    name: 'Cardiovascular System 201',
    totalCount: 1,
    examNote: 'Year 2 curriculum.',
    topics: [
      {
        label: 'Cardiovascular System Overview',
        state: 'taken',
        art: 0,
        note: 'Theoretical books, practical materials, and MCQs.',
        driveSelector: [
          { label: 'Primary 201 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/11pVhv6h-prfNVBivoR6EmfH3wtiicL3H' }
        ]
      }
    ]
  },
  {
    code: 'RES',
    name: 'Respiratory System 201',
    totalCount: 1,
    examNote: 'Year 2 curriculum.',
    topics: [
      {
        label: 'Respiratory System Overview',
        state: 'taken',
        art: 1,
        note: 'Theoretical books, practical materials, and MCQs.',
        driveSelector: [
          { label: 'Primary 201 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/11pVhv6h-prfNVBivoR6EmfH3wtiicL3H' }
        ]
      }
    ]
  },
  {
    code: 'HIM',
    name: 'Hematology & Immunology 201',
    totalCount: 1,
    examNote: 'Year 2 curriculum.',
    topics: [
      {
        label: 'Hematology & Immunology Overview',
        state: 'taken',
        art: 2,
        note: 'Theoretical books, practical materials, and MCQs.',
        driveSelector: [
          { label: 'Primary 201 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/11pVhv6h-prfNVBivoR6EmfH3wtiicL3H' }
        ]
      }
    ]
  },
  {
    code: 'MET',
    name: 'Metabolism 201',
    totalCount: 1,
    examNote: 'Year 2 curriculum.',
    topics: [
      {
        label: 'Metabolism 201 Overview',
        state: 'taken',
        art: 3,
        note: 'Theoretical books, practical materials, and MCQs.',
        driveSelector: [
          { label: 'Primary 201 Folder', source: 'Google Drive Archive', url: 'https://drive.google.com/drive/folders/11pVhv6h-prfNVBivoR6EmfH3wtiicL3H' }
        ]
      }
    ]
  }
]

const section201Data = {
  id: '201',
  title: '201',
  newsTitle: 'MED 201 news',
  trackerSearchPlaceholder: 'Search 201 topics or subjects…',
  subjects: subjects201,
  midtermExamSchedule: [],
  courseSchedule: [],
  semesterTimeline: {
    start: '2026-05-25',
    finals: '2026-09-19'
  },
  scheduleLocation: ''
}

export { subjects201, section201Data }
