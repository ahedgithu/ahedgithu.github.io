-- Admin topic management and required-MCQ completion.
-- Applied to the production Supabase project on 2026-08-02.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

alter table public.tracker_topics
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists legacy_labels text[] not null default '{}',
  add column if not exists required_mcq_source_id text,
  add column if not exists required_mcq_source_label text,
  add column if not exists required_mcq_progress_key text,
  add column if not exists required_mcq_part_ids text[] not null default '{}',
  add column if not exists required_mcq_activated_at timestamptz;

update public.tracker_topics
set id = gen_random_uuid()
where id is null;

alter table public.tracker_topics
  alter column id set default gen_random_uuid(),
  alter column id set not null;

create unique index if not exists tracker_topics_id_uidx
  on public.tracker_topics (id);

do $$
begin
  if exists (
    select 1
    from public.tracker_topics
    group by university_id, section, subject_code, track, lower(btrim(topic_label))
    having count(*) > 1
  ) then
    raise exception 'tracker_topics contains case-insensitive duplicate labels; merge them before applying this migration.'
      using errcode = '23505';
  end if;
end;
$$;

create unique index if not exists tracker_topics_scoped_label_lower_idx
  on public.tracker_topics (
    university_id,
    section,
    subject_code,
    track,
    lower(btrim(topic_label))
  );

create index if not exists tracker_topics_required_mcq_idx
  on public.tracker_topics (university_id, section, subject_code, id)
  where required_mcq_activated_at is not null;

alter table public.user_topic_progress
  add column if not exists completion_provenance text,
  add column if not exists granting_source text;

alter table public.user_topic_progress
  drop constraint if exists user_topic_progress_completion_provenance_check,
  add constraint user_topic_progress_completion_provenance_check
    check (
      completion_provenance is null
      or completion_provenance in ('manual', 'legacy', 'required_mcq')
    );

update public.user_topic_progress
set completion_provenance = 'legacy'
where completion_provenance is null
  and (studied or mcqs);

create index if not exists user_topic_progress_required_source_idx
  on public.user_topic_progress (
    university_id,
    section,
    subject_code,
    topic_label,
    completion_provenance,
    user_id
  )
  where completion_provenance = 'required_mcq';

alter table public.question_sources
  add column if not exists organization jsonb;

alter table public.question_imports
  add column if not exists organization jsonb;

alter table public.question_imports
  drop constraint if exists question_imports_source_scope_fkey;

alter table public.question_imports
  add constraint question_imports_source_scope_fkey foreign key (
    source_id, university_id, section, subject_code, topic_label
  ) references public.question_sources (
    id, university_id, section, subject_code, topic_label
  ) on update cascade
    deferrable initially deferred;

alter table public.questions
  drop constraint if exists questions_import_scope_fkey,
  drop constraint if exists questions_source_scope_fkey;

alter table public.questions
  add constraint questions_import_scope_fkey foreign key (
    import_id, source_id, university_id, section, subject_code, topic_label
  ) references public.question_imports (
    id, source_id, university_id, section, subject_code, topic_label
  ) on update cascade
    on delete cascade
    deferrable initially deferred,
  add constraint questions_source_scope_fkey foreign key (
    source_id, university_id, section, subject_code, topic_label
  ) references public.question_sources (
    id, university_id, section, subject_code, topic_label
  ) on update cascade
    deferrable initially deferred;

create or replace function private.normalize_question_organization(
  p_organization jsonb,
  p_question_count integer
)
returns jsonb
language plpgsql
immutable
security invoker
set search_path = ''
as $$
declare
  v_mode text;
  v_group_label text;
  v_parts jsonb := '[]'::jsonb;
  v_part jsonb;
  v_index integer := 0;
  v_start integer := 1;
  v_end integer;
  v_count integer;
begin
  if p_organization is null then
    return null;
  end if;
  if jsonb_typeof(p_organization) <> 'object' then
    raise exception 'Question organization must be an object.' using errcode = '22023';
  end if;

  v_mode := lower(btrim(coalesce(p_organization->>'mode', 'single')));
  if v_mode not in ('single', 'balanced', 'custom') then
    raise exception 'Question organization mode is invalid.' using errcode = '22023';
  end if;

  v_group_label := left(btrim(coalesce(p_organization->>'groupLabel', '')), 160);
  if v_mode = 'single' then
    return jsonb_build_object(
      'mode', 'single',
      'groupLabel', v_group_label,
      'parts', '[]'::jsonb
    );
  end if;

  if jsonb_typeof(p_organization->'parts') <> 'array'
    or jsonb_array_length(p_organization->'parts') = 0
  then
    raise exception 'Multipart organization requires at least one part.' using errcode = '22023';
  end if;

  for v_part in
    select value
    from jsonb_array_elements(p_organization->'parts')
  loop
    v_index := v_index + 1;
    begin
      v_count := (v_part->>'questionCount')::integer;
      v_end := (v_part->>'endOrder')::integer;
    exception when invalid_text_representation or numeric_value_out_of_range then
      raise exception 'Question organization part % has invalid numeric fields.', v_index
        using errcode = '22023';
    end;

    if jsonb_typeof(v_part) <> 'object'
      or (v_part->>'key') is distinct from format('part-%s', v_index)
      or (v_part->>'displayOrder')::integer is distinct from v_index
      or (v_part->>'startOrder')::integer is distinct from v_start
      or v_count <= 0
      or v_end is distinct from (v_start + v_count - 1)
    then
      raise exception 'Question organization part % must use deterministic contiguous ranges.', v_index
        using errcode = '22023';
    end if;

    v_parts := v_parts || jsonb_build_array(jsonb_build_object(
      'key', format('part-%s', v_index),
      'label', left(btrim(coalesce(v_part->>'label', format('Part %s', v_index))), 160),
      'description', left(btrim(coalesce(v_part->>'description', '')), 500),
      'displayOrder', v_index,
      'startOrder', v_start,
      'endOrder', v_end,
      'questionCount', v_count
    ));
    v_start := v_end + 1;
  end loop;

  if v_start - 1 <> p_question_count then
    raise exception 'Question organization must cover all % questions exactly once.', p_question_count
      using errcode = '22023';
  end if;

  return jsonb_build_object(
    'mode', v_mode,
    'groupLabel', v_group_label,
    'parts', v_parts
  );
end;
$$;

revoke all on function private.normalize_question_organization(jsonb, integer)
  from public, anon, authenticated;

create or replace function private.required_topic_is_complete(
  p_user_id uuid,
  p_topic_id uuid
)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select case
    when topic.required_mcq_activated_at is null
      or topic.required_mcq_source_id is null
      or topic.required_mcq_progress_key is null
      then false
    else not exists (
      select 1
      from unnest(
        case
          when cardinality(topic.required_mcq_part_ids) > 0
            then topic.required_mcq_part_ids
          else array[topic.required_mcq_source_id]
        end
      ) as required_part(source_id)
      where not exists (
        select 1
        from public.user_mcq_progress progress
        where progress.user_id = p_user_id
          and progress.university_id = topic.university_id
          and progress.section = topic.section
          and progress.topic_label = topic.required_mcq_progress_key
          and progress.source_id = required_part.source_id
          and progress.completed
          and coalesce(progress.total_questions, 0) > 0
          and coalesce(progress.answered_count, 0) >= progress.total_questions
      )
    )
  end
  from public.tracker_topics topic
  where topic.id = p_topic_id;
$$;

revoke all on function private.required_topic_is_complete(uuid, uuid)
  from public, anon, authenticated;

create or replace function private.guard_required_topic_completion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_topic public.tracker_topics%rowtype;
  v_grandfathered boolean := false;
begin
  select topic.*
  into v_topic
  from public.tracker_topics topic
  where topic.university_id = new.university_id
    and topic.section = new.section
    and topic.subject_code = new.subject_code
    and topic.topic_label = new.topic_label
    and topic.required_mcq_activated_at is not null
    and topic.required_mcq_source_id is not null;

  if not found or not (new.studied or new.mcqs) then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    v_grandfathered := (old.studied or old.mcqs)
      and coalesce(old.completion_provenance, 'legacy') in ('manual', 'legacy');
  end if;

  if v_grandfathered then
    new.completion_provenance := coalesce(new.completion_provenance, old.completion_provenance, 'legacy');
    return new;
  end if;

  if not coalesce(private.required_topic_is_complete(new.user_id, v_topic.id), false) then
    raise exception 'Complete every required MCQ before marking this topic done.'
      using errcode = '23514';
  end if;

  new.studied := true;
  new.mcqs := true;
  new.completion_provenance := 'required_mcq';
  new.granting_source := v_topic.required_mcq_source_id;
  return new;
end;
$$;

revoke all on function private.guard_required_topic_completion()
  from public, anon, authenticated;

drop trigger if exists user_topic_progress_required_mcq_guard
  on public.user_topic_progress;
create trigger user_topic_progress_required_mcq_guard
before insert or update of studied, mcqs, completion_provenance, granting_source
on public.user_topic_progress
for each row execute function private.guard_required_topic_completion();

create or replace function public.sync_required_topic_completion(p_topic_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_topic public.tracker_topics%rowtype;
  v_existing public.user_topic_progress%rowtype;
  v_complete boolean;
  v_changed boolean := false;
  v_affected_rows integer := 0;
  v_origin text;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select * into v_topic
  from public.tracker_topics
  where id = p_topic_id;
  if not found then
    raise exception 'Tracker topic was not found.' using errcode = 'P0002';
  end if;
  if not (select private.is_university_scope_authorized(v_topic.university_id, v_topic.section)) then
    raise exception 'Requested university scope is not authorized.' using errcode = '42501';
  end if;

  select * into v_existing
  from public.user_topic_progress
  where user_id = v_user_id
    and university_id = v_topic.university_id
    and section = v_topic.section
    and subject_code = v_topic.subject_code
    and topic_label = v_topic.topic_label
  for update;

  if (v_existing.studied or v_existing.mcqs)
    and coalesce(v_existing.completion_provenance, 'legacy') in ('manual', 'legacy')
  then
    v_origin := coalesce(v_existing.completion_provenance, 'legacy');
    return jsonb_build_object(
      'completed', true,
      'changed', false,
      'origin', v_origin
    );
  end if;

  if v_topic.required_mcq_activated_at is null
    or v_topic.required_mcq_source_id is null
  then
    return jsonb_build_object(
      'completed', coalesce(v_existing.studied or v_existing.mcqs, false),
      'changed', false,
      'origin', v_existing.completion_provenance
    );
  end if;

  v_complete := coalesce(private.required_topic_is_complete(v_user_id, v_topic.id), false);

  if v_complete then
    insert into public.user_topic_progress (
      user_id, university_id, section, subject_code, topic_label,
      studied, mcqs, completion_provenance, granting_source, updated_at
    ) values (
      v_user_id, v_topic.university_id, v_topic.section, v_topic.subject_code, v_topic.topic_label,
      true, true, 'required_mcq', v_topic.required_mcq_source_id, now()
    )
    on conflict (user_id, university_id, section, subject_code, topic_label)
    do update set
      studied = true,
      mcqs = true,
      completion_provenance = 'required_mcq',
      granting_source = excluded.granting_source,
      updated_at = now()
    where not public.user_topic_progress.studied
      or not public.user_topic_progress.mcqs
      or public.user_topic_progress.completion_provenance is distinct from 'required_mcq'
      or public.user_topic_progress.granting_source is distinct from excluded.granting_source;
    get diagnostics v_affected_rows = row_count;
    v_changed := v_affected_rows > 0;
  elsif v_existing.completion_provenance = 'required_mcq'
    and (v_existing.studied or v_existing.mcqs or v_existing.granting_source is not null)
  then
    update public.user_topic_progress
    set studied = false,
        mcqs = false,
        granting_source = null,
        updated_at = now()
    where user_id = v_user_id
      and university_id = v_topic.university_id
      and section = v_topic.section
      and subject_code = v_topic.subject_code
      and topic_label = v_topic.topic_label;
    v_changed := true;
  end if;

  return jsonb_build_object(
    'completed', v_complete,
    'changed', v_changed,
    'origin', case when v_complete then 'required_mcq' else null end
  );
end;
$$;

revoke all on function public.sync_required_topic_completion(uuid)
  from public, anon;
grant execute on function public.sync_required_topic_completion(uuid)
  to authenticated;

create or replace function public.save_tracker_topic(
  p_topic_id uuid,
  p_topic jsonb,
  p_required_mcq jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_university_id text := btrim(coalesce(p_topic->>'university_id', ''));
  v_section text := btrim(coalesce(p_topic->>'section', ''));
  v_subject_code text := btrim(coalesce(p_topic->>'subject_code', ''));
  v_subject_name text := btrim(coalesce(p_topic->>'subject_name', ''));
  v_track text := lower(btrim(coalesce(p_topic->>'track', 'theoretical')));
  v_topic_label text := btrim(coalesce(p_topic->>'topic_label', ''));
  v_existing public.tracker_topics%rowtype;
  v_saved public.tracker_topics%rowtype;
  v_old_label text;
  v_legacy_labels text[] := '{}';
  v_label text;
  v_required_enabled boolean := coalesce((p_required_mcq->>'enabled')::boolean, false);
  v_required_source_id text := nullif(btrim(coalesce(p_required_mcq->>'source_id', '')), '');
  v_required_source_label text := nullif(btrim(coalesce(p_required_mcq->>'source_label', '')), '');
  v_required_progress_key text := nullif(btrim(coalesce(p_required_mcq->>'topic_key', '')), '');
  v_required_part_ids text[] := '{}';
  v_requirement_changed boolean := false;
  v_user_id uuid;
  v_complete boolean;
begin
  if v_university_id = '' or v_section = '' or v_subject_code = ''
    or v_subject_name = '' or v_topic_label = ''
  then
    raise exception 'University, section, subject, and topic label are required.' using errcode = '22023';
  end if;
  if v_track not in ('theoretical', 'clinical') then
    raise exception 'Topic track is invalid.' using errcode = '22023';
  end if;
  if not (select public.is_question_scope_admin(v_university_id, v_section)) then
    raise exception 'Requested question scope is not authorized.' using errcode = '42501';
  end if;

  if p_topic_id is not null then
    select * into v_existing
    from public.tracker_topics
    where id = p_topic_id
    for update;
    if not found then
      raise exception 'Tracker topic was not found.' using errcode = 'P0002';
    end if;
    if row(v_existing.university_id, v_existing.section, v_existing.subject_code, v_existing.track)
      is distinct from row(v_university_id, v_section, v_subject_code, v_track)
    then
      raise exception 'A topic cannot be moved to a different scope.' using errcode = '22023';
    end if;
  end if;

  if exists (
    select 1
    from public.tracker_topics duplicate
    where duplicate.university_id = v_university_id
      and duplicate.section = v_section
      and duplicate.subject_code = v_subject_code
      and duplicate.track = v_track
      and lower(btrim(duplicate.topic_label)) = lower(v_topic_label)
      and duplicate.id is distinct from p_topic_id
  ) then
    raise exception 'A topic with this name already exists in the selected track.' using errcode = '23505';
  end if;

  if jsonb_typeof(p_required_mcq->'part_ids') = 'array' then
    select coalesce(array_agg(part_id order by part_id), '{}')
    into v_required_part_ids
    from (
      select distinct btrim(value #>> '{}') as part_id
      from jsonb_array_elements(p_required_mcq->'part_ids')
      where btrim(value #>> '{}') <> ''
    ) parts;
  end if;
  if v_required_enabled and (
    v_required_source_id is null
    or v_required_progress_key is null
    or cardinality(v_required_part_ids) = 0
  ) then
    raise exception 'Enabled required MCQs need a source, progress key, and at least one part.' using errcode = '22023';
  end if;

  if jsonb_typeof(p_topic->'legacy_labels') = 'array' then
    for v_label in
      select btrim(value #>> '{}')
      from jsonb_array_elements(p_topic->'legacy_labels')
    loop
      if v_label <> ''
        and lower(v_label) <> lower(v_topic_label)
        and not exists (select 1 from unnest(v_legacy_labels) item where lower(item) = lower(v_label))
      then
        v_legacy_labels := array_append(v_legacy_labels, v_label);
      end if;
    end loop;
  end if;

  if p_topic_id is null then
    insert into public.tracker_topics (
      id, university_id, section, subject_code, subject_name, track, topic_label,
      state, stop_note, drive_url, audio_url, display_order,
      midterm_scope, midterm_scope_note, legacy_labels,
      required_mcq_source_id, required_mcq_source_label, required_mcq_progress_key,
      required_mcq_part_ids, required_mcq_activated_at, updated_by
    ) values (
      gen_random_uuid(), v_university_id, v_section, v_subject_code, v_subject_name, v_track, v_topic_label,
      coalesce(nullif(btrim(p_topic->>'state'), ''), 'remaining'),
      nullif(btrim(coalesce(p_topic->>'stop_note', '')), ''),
      nullif(btrim(coalesce(p_topic->>'drive_url', '')), ''),
      nullif(btrim(coalesce(p_topic->>'audio_url', '')), ''),
      nullif(p_topic->>'display_order', '')::integer,
      coalesce((p_topic->>'midterm_scope')::boolean, false),
      nullif(btrim(coalesce(p_topic->>'midterm_scope_note', '')), ''),
      v_legacy_labels,
      v_required_source_id, v_required_source_label, v_required_progress_key,
      v_required_part_ids, case when v_required_enabled then now() else null end,
      (select auth.uid())
    )
    returning * into v_saved;
    return to_jsonb(v_saved);
  end if;

  v_old_label := v_existing.topic_label;
  for v_label in select unnest(coalesce(v_existing.legacy_labels, '{}')) loop
    if lower(v_label) <> lower(v_topic_label)
      and not exists (select 1 from unnest(v_legacy_labels) item where lower(item) = lower(v_label))
    then
      v_legacy_labels := array_append(v_legacy_labels, v_label);
    end if;
  end loop;
  if v_old_label is distinct from v_topic_label
    and lower(v_old_label) <> lower(v_topic_label)
    and not exists (select 1 from unnest(v_legacy_labels) item where lower(item) = lower(v_old_label))
  then
    v_legacy_labels := array_append(v_legacy_labels, v_old_label);
  end if;

  v_requirement_changed := row(
    v_existing.required_mcq_source_id,
    v_existing.required_mcq_progress_key,
    coalesce(v_existing.required_mcq_part_ids, '{}')
  ) is distinct from row(
    v_required_source_id,
    v_required_progress_key,
    v_required_part_ids
  );

  if v_old_label is distinct from v_topic_label then
    set constraints question_imports_source_scope_fkey,
      questions_import_scope_fkey,
      questions_source_scope_fkey deferred;

    insert into public.user_topic_progress (
      user_id, university_id, section, subject_code, topic_label,
      studied, mcqs, completion_provenance, granting_source, updated_at
    )
    select
      progress.user_id, progress.university_id, progress.section, progress.subject_code, v_topic_label,
      progress.studied, progress.mcqs, progress.completion_provenance, progress.granting_source, progress.updated_at
    from public.user_topic_progress progress
    where progress.university_id = v_university_id
      and progress.section = v_section
      and progress.subject_code = v_subject_code
      and progress.topic_label = v_old_label
    on conflict (user_id, university_id, section, subject_code, topic_label)
    do update set
      studied = public.user_topic_progress.studied or excluded.studied,
      mcqs = public.user_topic_progress.mcqs or excluded.mcqs,
      completion_provenance = case
        when public.user_topic_progress.completion_provenance in ('manual', 'legacy')
          then public.user_topic_progress.completion_provenance
        when excluded.completion_provenance in ('manual', 'legacy')
          then excluded.completion_provenance
        else coalesce(public.user_topic_progress.completion_provenance, excluded.completion_provenance)
      end,
      granting_source = coalesce(public.user_topic_progress.granting_source, excluded.granting_source),
      updated_at = greatest(public.user_topic_progress.updated_at, excluded.updated_at);

    delete from public.user_topic_progress
    where university_id = v_university_id
      and section = v_section
      and subject_code = v_subject_code
      and topic_label = v_old_label;

    insert into public.user_mcq_progress (
      user_id, university_id, section, topic_label, source_id, source_label,
      progress, completed, score, total_questions, answered_count,
      wrong_question_ids, completed_at, updated_at, attempt_id, attempt_started_at
    )
    select
      progress.user_id, progress.university_id, progress.section, v_topic_label,
      progress.source_id, progress.source_label, progress.progress, progress.completed,
      progress.score, progress.total_questions, progress.answered_count,
      progress.wrong_question_ids, progress.completed_at, progress.updated_at,
      progress.attempt_id, progress.attempt_started_at
    from public.user_mcq_progress progress
    where progress.university_id = v_university_id
      and progress.section = v_section
      and progress.topic_label = v_old_label
    on conflict (user_id, university_id, section, topic_label, source_id)
    do update set
      source_label = coalesce(excluded.source_label, public.user_mcq_progress.source_label),
      progress = case
        when coalesce(excluded.answered_count, 0) >= coalesce(public.user_mcq_progress.answered_count, 0)
          then excluded.progress
        else public.user_mcq_progress.progress
      end,
      completed = public.user_mcq_progress.completed or excluded.completed,
      score = greatest(public.user_mcq_progress.score, excluded.score),
      total_questions = greatest(public.user_mcq_progress.total_questions, excluded.total_questions),
      answered_count = greatest(public.user_mcq_progress.answered_count, excluded.answered_count),
      wrong_question_ids = array(
        select distinct item
        from unnest(public.user_mcq_progress.wrong_question_ids || excluded.wrong_question_ids) item
      ),
      completed_at = coalesce(
        least(public.user_mcq_progress.completed_at, excluded.completed_at),
        public.user_mcq_progress.completed_at,
        excluded.completed_at
      ),
      attempt_id = case
        when coalesce(excluded.answered_count, 0) >= coalesce(public.user_mcq_progress.answered_count, 0)
          then excluded.attempt_id
        else public.user_mcq_progress.attempt_id
      end,
      attempt_started_at = case
        when coalesce(excluded.answered_count, 0) >= coalesce(public.user_mcq_progress.answered_count, 0)
          then excluded.attempt_started_at
        else public.user_mcq_progress.attempt_started_at
      end,
      updated_at = greatest(public.user_mcq_progress.updated_at, excluded.updated_at);

    delete from public.user_mcq_progress
    where university_id = v_university_id
      and section = v_section
      and topic_label = v_old_label;

    insert into public.user_lifetime_scores (
      user_id, university_id, section, topic_label, source_id,
      best_score, total_questions, updated_at
    )
    select
      score.user_id, score.university_id, score.section, v_topic_label, score.source_id,
      score.best_score, score.total_questions, score.updated_at
    from public.user_lifetime_scores score
    where score.university_id = v_university_id
      and score.section = v_section
      and score.topic_label = v_old_label
    on conflict (user_id, university_id, section, topic_label, source_id)
    do update set
      best_score = greatest(public.user_lifetime_scores.best_score, excluded.best_score),
      total_questions = greatest(public.user_lifetime_scores.total_questions, excluded.total_questions),
      updated_at = greatest(public.user_lifetime_scores.updated_at, excluded.updated_at);

    delete from public.user_lifetime_scores
    where university_id = v_university_id
      and section = v_section
      and topic_label = v_old_label;

    insert into public.user_season_scores (
      season_id, user_id, topic_label, source_id, best_score,
      total_questions, attempt_id, earned_at, updated_at
    )
    select
      score.season_id, score.user_id, v_topic_label, score.source_id, score.best_score,
      score.total_questions, score.attempt_id, score.earned_at, score.updated_at
    from public.user_season_scores score
    join public.leaderboard_seasons season on season.id = score.season_id
    where season.university_id = v_university_id
      and season.section = v_section
      and score.topic_label = v_old_label
    on conflict (season_id, user_id, topic_label, source_id)
    do update set
      best_score = greatest(public.user_season_scores.best_score, excluded.best_score),
      total_questions = greatest(public.user_season_scores.total_questions, excluded.total_questions),
      attempt_id = case
        when excluded.best_score >= public.user_season_scores.best_score then excluded.attempt_id
        else public.user_season_scores.attempt_id
      end,
      earned_at = least(public.user_season_scores.earned_at, excluded.earned_at),
      updated_at = greatest(public.user_season_scores.updated_at, excluded.updated_at);

    delete from public.user_season_scores score
    using public.leaderboard_seasons season
    where season.id = score.season_id
      and season.university_id = v_university_id
      and season.section = v_section
      and score.topic_label = v_old_label;

    update public.leaderboard_seasons
    set scope_topic_label = v_topic_label
    where university_id = v_university_id
      and section = v_section
      and scope_topic_label = v_old_label;

    update public.student_presence
    set topic_label = v_topic_label
    where university_id = v_university_id
      and section = v_section
      and topic_label = v_old_label;

    update public.question_sources
    set topic_label = v_topic_label,
        updated_at = now()
    where university_id = v_university_id
      and section = v_section
      and subject_code = v_subject_code
      and topic_label = v_old_label;
  end if;

  update public.tracker_topics
  set subject_name = v_subject_name,
      topic_label = v_topic_label,
      state = coalesce(nullif(btrim(p_topic->>'state'), ''), 'remaining'),
      stop_note = nullif(btrim(coalesce(p_topic->>'stop_note', '')), ''),
      drive_url = nullif(btrim(coalesce(p_topic->>'drive_url', '')), ''),
      audio_url = nullif(btrim(coalesce(p_topic->>'audio_url', '')), ''),
      display_order = nullif(p_topic->>'display_order', '')::integer,
      midterm_scope = coalesce((p_topic->>'midterm_scope')::boolean, false),
      midterm_scope_note = nullif(btrim(coalesce(p_topic->>'midterm_scope_note', '')), ''),
      legacy_labels = v_legacy_labels,
      required_mcq_source_id = v_required_source_id,
      required_mcq_source_label = v_required_source_label,
      required_mcq_progress_key = v_required_progress_key,
      required_mcq_part_ids = v_required_part_ids,
      required_mcq_activated_at = case
        when not v_required_enabled then null
        when v_requirement_changed then now()
        else coalesce(v_existing.required_mcq_activated_at, now())
      end,
      updated_by = (select auth.uid()),
      updated_at = now()
  where id = p_topic_id
  returning * into v_saved;

  if v_required_enabled and v_requirement_changed then
    for v_user_id in
      select user_id
      from public.user_topic_progress
      where university_id = v_university_id
        and section = v_section
        and subject_code = v_subject_code
        and topic_label = v_topic_label
        and completion_provenance = 'required_mcq'
      union
      select user_id
      from public.user_mcq_progress
      where university_id = v_university_id
        and section = v_section
        and topic_label = v_required_progress_key
    loop
      v_complete := coalesce(private.required_topic_is_complete(v_user_id, p_topic_id), false);
      if v_complete then
        insert into public.user_topic_progress (
          user_id, university_id, section, subject_code, topic_label,
          studied, mcqs, completion_provenance, granting_source, updated_at
        ) values (
          v_user_id, v_university_id, v_section, v_subject_code, v_topic_label,
          true, true, 'required_mcq', v_required_source_id, now()
        )
        on conflict (user_id, university_id, section, subject_code, topic_label)
        do update set
          studied = true,
          mcqs = true,
          completion_provenance = 'required_mcq',
          granting_source = excluded.granting_source,
          updated_at = now()
        where public.user_topic_progress.completion_provenance = 'required_mcq';
      else
        update public.user_topic_progress
        set studied = false,
            mcqs = false,
            granting_source = null,
            updated_at = now()
        where user_id = v_user_id
          and university_id = v_university_id
          and section = v_section
          and subject_code = v_subject_code
          and topic_label = v_topic_label
          and completion_provenance = 'required_mcq';
      end if;
    end loop;
  end if;

  return to_jsonb(v_saved);
end;
$$;

revoke all on function public.save_tracker_topic(uuid, jsonb, jsonb)
  from public, anon;
grant execute on function public.save_tracker_topic(uuid, jsonb, jsonb)
  to authenticated;

create or replace function public.submit_question_import_v2(
  p_scope jsonb,
  p_source jsonb,
  p_raw_text text,
  p_parser_version text,
  p_questions jsonb,
  p_issues jsonb default '[]'::jsonb,
  p_organization jsonb default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_university_id text := btrim(coalesce(p_scope->>'university_id', ''));
  v_section text := btrim(coalesce(p_scope->>'section', ''));
  v_subject_code text := btrim(coalesce(p_scope->>'subject_code', ''));
  v_topic_label text := btrim(coalesce(p_scope->>'topic_label', ''));
  v_source_id bigint;
  v_import_id bigint;
  v_import_public_id uuid;
  v_question jsonb;
  v_question_id bigint;
  v_choice jsonb;
  v_issue jsonb;
  v_question_ids bigint[] := '{}';
  v_blocking_count integer := 0;
  v_warning_count integer := 0;
  v_organization jsonb;
begin
  if not (select public.is_question_scope_admin(v_university_id, v_section)) then
    raise exception 'Requested question scope is not authorized.' using errcode = '42501';
  end if;
  if v_university_id = '' or v_section = '' or v_subject_code = ''
    or v_topic_label = '' or btrim(coalesce(p_source->>'title', '')) = ''
  then
    raise exception 'University, section, subject, topic, and source are required.' using errcode = '22023';
  end if;
  if jsonb_typeof(p_questions) <> 'array' or jsonb_array_length(p_questions) = 0 then
    raise exception 'At least one parsed question is required.' using errcode = '22023';
  end if;
  if jsonb_typeof(coalesce(p_issues, '[]'::jsonb)) <> 'array' then
    raise exception 'Question validation issues must be an array.' using errcode = '22023';
  end if;

  v_organization := private.normalize_question_organization(
    p_organization,
    jsonb_array_length(p_questions)
  );

  if nullif(p_source->>'public_id', '') is not null then
    select id, coalesce(v_organization, organization)
    into v_source_id, v_organization
    from public.question_sources
    where public_id = (p_source->>'public_id')::uuid
      and university_id = v_university_id
      and section = v_section
      and subject_code = v_subject_code
      and topic_label = v_topic_label
    for update;
    if v_source_id is null then
      raise exception 'Selected question source is outside this scope.' using errcode = '42501';
    end if;
  else
    insert into public.question_sources (
      university_id, section, subject_code, topic_label,
      title, reference_text, organization
    ) values (
      v_university_id, v_section, v_subject_code, v_topic_label,
      btrim(p_source->>'title'),
      nullif(btrim(coalesce(p_source->>'reference_text', '')), ''),
      v_organization
    )
    on conflict (university_id, section, subject_code, topic_label, title)
    do update set
      reference_text = coalesce(excluded.reference_text, public.question_sources.reference_text),
      updated_at = now()
    returning id into v_source_id;

    if v_organization is null then
      select organization into v_organization
      from public.question_sources
      where id = v_source_id;
    end if;
  end if;

  select count(*) filter (where value->>'severity' = 'blocking'),
         count(*) filter (where value->>'severity' = 'warning')
  into v_blocking_count, v_warning_count
  from jsonb_array_elements(coalesce(p_issues, '[]'::jsonb));

  insert into public.question_imports (
    source_id, university_id, section, subject_code, topic_label, status,
    raw_text, question_count, blocking_issue_count, warning_count,
    parser_version, organization
  ) values (
    v_source_id, v_university_id, v_section, v_subject_code, v_topic_label,
    case when v_blocking_count > 0 then 'needs_review' else 'ready' end,
    coalesce(p_raw_text, ''), jsonb_array_length(p_questions),
    v_blocking_count, v_warning_count,
    btrim(coalesce(p_parser_version, '')), v_organization
  )
  returning id, public_id into v_import_id, v_import_public_id;

  for v_question in select value from jsonb_array_elements(p_questions) loop
    insert into public.questions (
      import_id, source_id, university_id, section, subject_code, topic_label,
      source_order, stem, explanation, status, stem_fingerprint
    ) values (
      v_import_id, v_source_id, v_university_id, v_section, v_subject_code, v_topic_label,
      greatest(coalesce((v_question->>'source_order')::integer, 1), 1),
      coalesce(v_question->>'stem', ''),
      nullif(v_question->>'explanation', ''),
      case when coalesce((v_question->>'has_blockers')::boolean, false)
        then 'needs_review' else 'ready' end,
      coalesce(v_question->>'stem_fingerprint', '')
    ) returning id into v_question_id;
    v_question_ids := array_append(v_question_ids, v_question_id);

    for v_choice in
      select value
      from jsonb_array_elements(coalesce(v_question->'choices', '[]'::jsonb))
    loop
      insert into public.question_choices (
        question_id, choice_key, choice_text, display_order, is_correct
      ) values (
        v_question_id,
        upper(v_choice->>'key'),
        coalesce(v_choice->>'text', ''),
        coalesce((v_choice->>'display_order')::integer, 1),
        coalesce((v_choice->>'is_correct')::boolean, false)
      );
    end loop;
  end loop;

  for v_issue in
    select value
    from jsonb_array_elements(coalesce(p_issues, '[]'::jsonb))
  loop
    insert into public.question_validation_issues (
      import_id, question_id, code, severity, message, details
    ) values (
      v_import_id,
      case
        when (v_issue->>'question_index') ~ '^\d+$'
          and (v_issue->>'question_index')::integer < cardinality(v_question_ids)
          then v_question_ids[(v_issue->>'question_index')::integer + 1]
        else null
      end,
      coalesce(nullif(v_issue->>'code', ''), 'unknown'),
      coalesce(v_issue->>'severity', 'blocking'),
      coalesce(v_issue->>'message', 'Validation issue'),
      coalesce(v_issue->'details', '{}'::jsonb)
    );
  end loop;

  return v_import_public_id;
end;
$$;

revoke all on function public.submit_question_import_v2(
  jsonb, jsonb, text, text, jsonb, jsonb, jsonb
) from public, anon;
grant execute on function public.submit_question_import_v2(
  jsonb, jsonb, text, text, jsonb, jsonb, jsonb
) to authenticated;

-- Keep the currently published source organization stable while an admin is
-- still drafting or reviewing another import. The source switches to the new
-- organization only in the same transaction that publishes its questions.
create or replace function public.publish_question_import(p_import_public_id uuid)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_import public.question_imports%rowtype;
  v_invalid_count integer;
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
  if v_import.status = 'rejected' then
    raise exception 'Rejected imports cannot be published.' using errcode = '22023';
  end if;

  select count(*) into v_question_count
  from public.questions where import_id = v_import.id;

  select count(*) into v_invalid_count
  from public.questions question
  left join lateral (
    select count(*) as choice_count,
           count(*) filter (where choice.is_correct) as correct_count,
           count(distinct lower(btrim(choice.choice_text))) as distinct_choice_count,
           bool_and(btrim(choice.choice_text) <> '') as choices_present
    from public.question_choices choice
    where choice.question_id = question.id
  ) choice_summary on true
  where question.import_id = v_import.id
    and (
      btrim(question.stem) = ''
      or question.question_type <> 'single_best_answer'
      or choice_summary.choice_count not in (4, 5)
      or choice_summary.correct_count <> 1
      or choice_summary.distinct_choice_count <> choice_summary.choice_count
      or not coalesce(choice_summary.choices_present, false)
    );

  if v_question_count = 0 or v_invalid_count > 0 then
    raise exception 'Import contains % invalid question(s).', greatest(v_invalid_count, 1)
      using errcode = '23514';
  end if;
  if exists (
    select 1 from public.question_validation_issues
    where import_id = v_import.id and severity = 'blocking' and not resolved
  ) then
    raise exception 'Resolve all blocking validation issues before publishing.' using errcode = '23514';
  end if;

  update public.question_sources
  set organization = coalesce(v_import.organization, organization),
      updated_at = now()
  where id = v_import.source_id;

  update public.questions
  set status = 'published', reviewed_by = (select auth.uid()), published_at = now()
  where import_id = v_import.id;

  update public.question_imports
  set status = 'published', reviewed_by = (select auth.uid()), published_at = now(),
      question_count = v_question_count, blocking_issue_count = 0
  where id = v_import.id;

  return v_question_count;
end;
$$;

revoke execute on function public.publish_question_import(uuid) from public, anon;
grant execute on function public.publish_question_import(uuid) to authenticated;

create or replace function public.replace_question_import_v2(
  p_import_public_id uuid,
  p_raw_text text,
  p_parser_version text,
  p_questions jsonb,
  p_issues jsonb default '[]'::jsonb,
  p_organization jsonb default null
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

  v_new_import_public_id := public.submit_question_import_v2(
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
    p_issues,
    coalesce(p_organization, v_source.organization)
  );

  v_question_count := public.publish_question_import(v_new_import_public_id);

  update public.questions
  set status = 'rejected',
      reviewed_by = (select auth.uid()),
      published_at = null
  where import_id = v_import.id
    and status = 'published';

  update public.question_imports
  set status = 'rejected',
      reviewed_by = (select auth.uid()),
      published_at = null
  where id = v_import.id;

  return v_question_count;
end;
$$;

revoke all on function public.replace_question_import_v2(
  uuid, text, text, jsonb, jsonb, jsonb
) from public, anon;
grant execute on function public.replace_question_import_v2(
  uuid, text, text, jsonb, jsonb, jsonb
) to authenticated;
