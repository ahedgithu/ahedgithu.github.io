import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const migrationPath = new URL('../supabase/migrations/20260730011729_add_university_data_isolation.sql', import.meta.url)
const migration = readFileSync(migrationPath, 'utf8')

test('university-aware privileged RPCs authorize the caller scope', () => {
  assert.match(migration, /CREATE OR REPLACE FUNCTION private\.is_university_scope_authorized\s*\(/i)
  assert.match(migration, /preferences\.user_id = \(SELECT auth\.uid\(\)\)[\s\S]*preferences\.selected_university = p_university_id[\s\S]*preferences\.selected_section = p_section/i)
  assert.match(migration, /admins\.user_id = \(SELECT auth\.uid\(\)\)[\s\S]*admins\.allowed_university_id = p_university_id[\s\S]*admins\.allowed_section = p_section/i)
  assert.match(migration, /REVOKE ALL ON FUNCTION private\.is_university_scope_authorized\(TEXT, TEXT\) FROM PUBLIC, anon, authenticated/i)

  for (const functionName of ['get_leaderboard', 'get_recent_mcq_activity', 'get_online_students']) {
    const start = migration.indexOf(`CREATE FUNCTION public.${functionName}(`)
    assert.notEqual(start, -1, `${functionName} should exist`)
    const body = migration.slice(start, migration.indexOf('$$;', start) + 3)
    assert.match(body, /private\.is_university_scope_authorized\(p_university_id, p_section\)/i)
  }

  const presenceStart = migration.indexOf('CREATE FUNCTION public.mark_student_online(')
  const presenceBody = migration.slice(presenceStart, migration.indexOf('$$;', presenceStart) + 3)
  assert.match(presenceBody, /IF NOT \(SELECT private\.is_university_scope_authorized\(p_university_id, p_section\)\)/i)
  assert.match(presenceBody, /ERRCODE = '42501'/i)
})

test('university-aware privileged RPCs stay unavailable to public and anon roles', () => {
  const signatures = [
    'get_leaderboard\\(TEXT, TEXT\\)',
    'get_recent_mcq_activity\\(TEXT, TEXT, INTEGER\\)',
    'mark_student_online\\(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT\\)',
    'get_online_students\\(TEXT, TEXT, INTEGER\\)'
  ]

  for (const signature of signatures) {
    assert.match(migration, new RegExp(`REVOKE ALL ON FUNCTION public\\.${signature} FROM PUBLIC, anon`, 'i'))
    assert.match(migration, new RegExp(`GRANT EXECUTE ON FUNCTION public\\.${signature} TO authenticated`, 'i'))
  }
})
