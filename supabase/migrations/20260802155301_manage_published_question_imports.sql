create or replace function public.remove_question_import(p_import_public_id uuid)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_import public.question_imports%rowtype;
  v_question_count integer;
begin
  select * into v_import
  from public.question_imports
  where public_id = p_import_public_id
  for update;

  if not found then
    raise exception 'Question import was not found.' using errcode = 'P0002';
  end if;
  if not (select public.is_question_scope_admin(v_import.university_id, v_import.section)) then
    raise exception 'Requested question scope is not authorized.' using errcode = '42501';
  end if;
  if v_import.status <> 'published' then
    raise exception 'Only published imports can be removed.' using errcode = '22023';
  end if;

  update public.questions
  set status = 'rejected', reviewed_by = (select auth.uid()), published_at = null
  where import_id = v_import.id and status = 'published';
  get diagnostics v_question_count = row_count;

  update public.question_imports
  set status = 'rejected', reviewed_by = (select auth.uid()), published_at = null
  where id = v_import.id;

  return v_question_count;
end;
$$;

create or replace function public.replace_question_import(
  p_import_public_id uuid,
  p_raw_text text,
  p_parser_version text,
  p_questions jsonb,
  p_issues jsonb default '[]'::jsonb
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_import public.question_imports%rowtype;
  v_source public.question_sources%rowtype;
  v_new_import_public_id uuid;
  v_question_count integer;
begin
  select * into v_import
  from public.question_imports
  where public_id = p_import_public_id
  for update;

  if not found then
    raise exception 'Question import was not found.' using errcode = 'P0002';
  end if;
  if not (select public.is_question_scope_admin(v_import.university_id, v_import.section)) then
    raise exception 'Requested question scope is not authorized.' using errcode = '42501';
  end if;
  if v_import.status <> 'published' then
    raise exception 'Only published imports can be replaced.' using errcode = '22023';
  end if;

  select * into strict v_source
  from public.question_sources
  where id = v_import.source_id;

  v_new_import_public_id := public.submit_question_import(
    jsonb_build_object(
      'university_id', v_import.university_id,
      'section', v_import.section,
      'subject_code', v_import.subject_code,
      'topic_label', v_import.topic_label
    ),
    jsonb_build_object(
      'public_id', v_source.public_id,
      'title', v_source.title,
      'reference_text', v_source.reference_text
    ),
    p_raw_text,
    p_parser_version,
    p_questions,
    p_issues
  );

  v_question_count := public.publish_question_import(v_new_import_public_id);

  update public.questions
  set status = 'rejected', reviewed_by = (select auth.uid()), published_at = null
  where import_id = v_import.id and status = 'published';

  update public.question_imports
  set status = 'rejected', reviewed_by = (select auth.uid()), published_at = null
  where id = v_import.id;

  return v_question_count;
end;
$$;

revoke execute on function public.remove_question_import(uuid) from public, anon;
revoke execute on function public.replace_question_import(uuid, text, text, jsonb, jsonb) from public, anon;
grant execute on function public.remove_question_import(uuid) to authenticated;
grant execute on function public.replace_question_import(uuid, text, text, jsonb, jsonb) to authenticated;
