// MUST Section Registry, Capabilities, and Academic Year Groupings

import { subjects401, subjectExamNotes, midtermExamSchedule, courseSchedule } from '../must-401.js'
import { subjects402, midtermExamSchedule402 } from '../must-402.js'
import { section101Data } from './101.js'
import { section102Data } from './102.js'
import { section201Data } from './201.js'
import { section202Data } from './202.js'
import { section301Data } from './301.js'
import { section302Data } from './302.js'

const mustAcademicYears = [
  { year: 1, label: 'Year 1', sections: ['101', '102'] },
  { year: 2, label: 'Year 2', sections: ['201', '202'] },
  { year: 3, label: 'Year 3', sections: ['301', '302'] },
  { year: 4, label: 'Year 4', sections: ['401', '402'] }
]

const resourceCapabilities = {
  hasMcqs: false,
  hasAssignments: false,
  hasTimeline: false,
  hasSchedule: false,
  resourceFirst: true
}

const mustSections = {
  '101': { ...section101Data, capabilities: { ...resourceCapabilities }, representatives: [] },
  '102': { ...section102Data, capabilities: { ...resourceCapabilities }, representatives: [] },
  '201': { ...section201Data, capabilities: { ...resourceCapabilities }, representatives: [] },
  '202': { ...section202Data, capabilities: { ...resourceCapabilities }, representatives: [] },
  '301': { ...section301Data, capabilities: { ...resourceCapabilities }, representatives: [] },
  '302': { ...section302Data, capabilities: { ...resourceCapabilities }, representatives: [] },
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
    scheduleLocation: 'Lectures: SS 116B - Clinical rounds: Hospital, fourth floor',
    representatives: [
      {
        name: 'Mohamed Kellawi',
        role: 'Anaesthesia, Nutrition, Lab',
        phone: '201151672255',
        image: '/assets/mohamed-kellawi-avatar.jpg'
      },
      {
        name: 'Mohamed Ragab',
        role: 'Medicine'
      },
      {
        name: 'Yousef El Rouby',
        role: 'Surgery, Oncology'
      }
    ],
    capabilities: {
      hasMcqs: true,
      hasAssignments: true,
      hasTimeline: true,
      hasSchedule: true,
      resourceFirst: false
    }
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
    scheduleLocation: '',
    representatives: [
      {
        name: 'Shahd Sedky',
        role: 'MED 402 representative',
        phone: '201014245576'
      }
    ],
    fallbackNewsCard: {
      id: '402-tracker-launch',
      kicker: '402',
      badge: 'Now',
      title: 'MED 402 tracker shell is live locally',
      body: 'The 402 hub now tracks covered Weekly Reports topics. Midterm badges are hidden until the scope is confirmed, and MCQs are not active until answer-key-backed sources are added.',
      date: '2026-07-06',
      priority: 1,
      persistent: true,
      facts: [
        { label: 'Source', value: 'Weekly Reports Weeks 1-6' },
        { label: 'Midterm', value: 'Not confirmed yet' },
        { label: 'MCQs', value: 'Pending answer keys' }
      ]
    },
    capabilities: {
      hasMcqs: true,
      hasAssignments: true,
      hasTimeline: true,
      hasSchedule: false,
      resourceFirst: false
    }
  }
}

export { mustAcademicYears, mustSections }
