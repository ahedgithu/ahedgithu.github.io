// MUST Section Registry and Academic Year Groupings

import { subjects401, subjectExamNotes, midtermExamSchedule, courseSchedule } from '../must-401.js'
import { subjects402, midtermExamSchedule402 } from '../must-402.js'
import { section101Data } from './101.js'
import { section102Data } from './102.js'
import { section201Data } from './201.js'
import { section202Data } from './202.js'

const mustAcademicYears = [
  { year: 1, label: 'Year 1', sections: ['101', '102'] },
  { year: 2, label: 'Year 2', sections: ['201', '202'] },
  { year: 3, label: 'Year 3', sections: [] },
  { year: 4, label: 'Year 4', sections: ['401', '402'] }
]

const mustSections = {
  '101': section101Data,
  '102': section102Data,
  '201': section201Data,
  '202': section202Data,
  '401': {
    id: '401',
    title: '401',
    newsTitle: 'MED 401 news',
    trackerSearchPlaceholder: 'Search 401 topics or subjects…',
    subjects: subjects401,
    midtermExamSchedule,
    courseSchedule,
    semesterTimeline: {
      start: '2026-05-25',
      finals: '2026-09-19'
    },
    scheduleLocation: 'Lectures: SS 116B - Clinical rounds: Hospital, fourth floor'
  },
  '402': {
    id: '402',
    title: '402',
    newsTitle: 'MED 402 news',
    trackerSearchPlaceholder: 'Search 402 topics or subjects…',
    subjects: subjects402,
    midtermExamSchedule: midtermExamSchedule402,
    courseSchedule: [],
    semesterTimeline: {
      start: '2026-05-25',
      finals: '2026-09-19'
    },
    scheduleLocation: ''
  }
}

export { mustAcademicYears, mustSections }
