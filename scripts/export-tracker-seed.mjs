import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const mainPath = resolve(root, 'src/main.js')
const outPath = resolve(root, 'public/tracker-seed.json')
const source = readFileSync(mainPath, 'utf8')

function extractArray(name) {
  const marker = `${name} = [`
  const start = source.indexOf(marker)
  if (start === -1) throw new Error(`Could not find ${name}.`)

  const arrayStart = source.indexOf('[', start)
  let depth = 0
  let inString = null
  let escaped = false

  for (let index = arrayStart; index < source.length; index += 1) {
    const char = source[index]

    if (inString) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === inString) {
        inString = null
      }
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = char
    } else if (char === '[') {
      depth += 1
    } else if (char === ']') {
      depth -= 1
      if (depth === 0) return source.slice(arrayStart, index + 1)
    }
  }

  throw new Error(`Could not extract ${name}.`)
}

function toRows(section, subjects) {
  return subjects.flatMap((subject) => {
    const theoretical = (subject.topics || []).map((topic) => {
      const driveUrl = (topic.lectureUrls || []).find((item) => /drive\.google\.com|docs\.google\.com/.test(item.url || ''))?.url || null
      return {
        section,
        subject_code: subject.code,
        subject_name: subject.name,
        track: 'theoretical',
        topic_label: topic.label,
        state: topic.state || 'remaining',
        stop_note: topic.stopNote || null,
        drive_url: driveUrl,
        audio_url: topic.audioUrl || null
      }
    })

    const clinical = (subject.clinicalTopics || []).map((topic) => {
      const driveUrl = (topic.lectureUrls || []).find((item) => /drive\.google\.com|docs\.google\.com/.test(item.url || ''))?.url || null
      return {
        section,
        subject_code: subject.code,
        subject_name: subject.name,
        track: 'clinical',
        topic_label: topic.label,
        state: topic.state || 'remaining',
        stop_note: topic.stopNote || null,
        drive_url: driveUrl,
        audio_url: topic.audioUrl || null
      }
    })

    return [...theoretical, ...clinical]
  })
}

const subjects401 = Function(`"use strict"; return (${extractArray('let subjects')});`)()
const subjects402 = Function(`"use strict"; return (${extractArray('const subjects402')});`)()
const rows = [...toRows('401', subjects401), ...toRows('402', subjects402)]

writeFileSync(outPath, `${JSON.stringify(rows, null, 2)}\n`)
console.log(`Wrote ${rows.length} tracker seed rows to ${outPath}`)
