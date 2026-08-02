create table public.question_sources (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  university_id text not null,
  section text not null,
  subject_code text not null,
  topic_label text not null,
  title text not null,
  reference_text text,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint question_sources_scope_present check (
    btrim(university_id) <> '' and btrim(section) <> '' and
    btrim(subject_code) <> '' and btrim(topic_label) <> '' and btrim(title) <> ''
  ),
  constraint question_sources_scope_title_unique unique (
    university_id, section, subject_code, topic_label, title
  )
);

create table public.question_imports (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  source_id bigint not null,
  university_id text not null,
  section text not null,
  subject_code text not null,
  topic_label text not null,
  status text not null default 'draft',
  raw_text text not null default '',
  question_count integer not null default 0,
  blocking_issue_count integer not null default 0,
  warning_count integer not null default 0,
  parser_version text not null,
  created_by uuid not null default auth.uid() references auth.users(id),
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint question_imports_status_valid check (
    status in ('draft', 'needs_review', 'ready', 'published', 'rejected')
  ),
  constraint question_imports_counts_valid check (
    question_count >= 0 and blocking_issue_count >= 0 and warning_count >= 0
  ),
  constraint question_imports_scope_present check (
    btrim(university_id) <> '' and btrim(section) <> '' and
    btrim(subject_code) <> '' and btrim(topic_label) <> '' and btrim(parser_version) <> ''
  )
);

create table public.questions (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  import_id bigint not null,
  source_id bigint not null,
  university_id text not null,
  section text not null,
  subject_code text not null,
  topic_label text not null,
  source_order integer not null,
  stem text not null default '',
  explanation text,
  question_type text not null default 'single_best_answer',
  status text not null default 'draft',
  stem_fingerprint text not null default '',
  created_by uuid not null default auth.uid() references auth.users(id),
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint questions_source_order_positive check (source_order > 0),
  constraint questions_type_valid check (question_type = 'single_best_answer'),
  constraint questions_status_valid check (
    status in ('draft', 'needs_review', 'ready', 'published', 'rejected')
  ),
  constraint questions_import_order_unique unique (import_id, source_order)
);

create table public.question_choices (
  id bigint generated always as identity primary key,
  question_id bigint not null references public.questions(id) on delete cascade,
  choice_key text not null,
  choice_text text not null default '',
  display_order integer not null,
  is_correct boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint question_choices_key_valid check (choice_key in ('A', 'B', 'C', 'D', 'E')),
  constraint question_choices_order_valid check (display_order between 1 and 5),
  constraint question_choices_key_unique unique (question_id, choice_key),
  constraint question_choices_order_unique unique (question_id, display_order)
);

create table public.question_validation_issues (
  id bigint generated always as identity primary key,
  import_id bigint not null references public.question_imports(id) on delete cascade,
  question_id bigint references public.questions(id) on delete cascade,
  code text not null,
  severity text not null,
  message text not null,
  details jsonb not null default '{}'::jsonb,
  resolved boolean not null default false,
  resolved_by uuid references auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint question_validation_severity_valid check (severity in ('blocking', 'warning')),
  constraint question_validation_content_present check (btrim(code) <> '' and btrim(message) <> '')
);

alter table public.question_sources
  add constraint question_sources_id_scope_unique unique (
    id, university_id, section, subject_code, topic_label
  );

alter table public.question_imports
  add constraint question_imports_source_scope_fkey foreign key (
    source_id, university_id, section, subject_code, topic_label
  ) references public.question_sources (
    id, university_id, section, subject_code, topic_label
  ),
  add constraint question_imports_id_scope_unique unique (
    id, source_id, university_id, section, subject_code, topic_label
  );

alter table public.questions
  add constraint questions_import_scope_fkey foreign key (
    import_id, source_id, university_id, section, subject_code, topic_label
  ) references public.question_imports (
    id, source_id, university_id, section, subject_code, topic_label
  ) on delete cascade,
  add constraint questions_source_scope_fkey foreign key (
    source_id, university_id, section, subject_code, topic_label
  ) references public.question_sources (
    id, university_id, section, subject_code, topic_label
  ),
  add constraint questions_id_import_unique unique (id, import_id);

alter table public.question_validation_issues
  add constraint question_validation_question_import_fkey foreign key (question_id, import_id)
  references public.questions (id, import_id) on delete cascade;

create index question_sources_scope_idx
  on public.question_sources (university_id, section, subject_code, topic_label);
create index question_sources_created_by_idx on public.question_sources (created_by);
create index question_imports_source_id_idx on public.question_imports (source_id);
create index question_imports_created_by_idx on public.question_imports (created_by);
create index question_imports_reviewed_by_idx on public.question_imports (reviewed_by);
create index question_imports_review_queue_idx
  on public.question_imports (university_id, section, status, created_at desc)
  where status in ('draft', 'needs_review', 'ready');
create index questions_import_id_idx on public.questions (import_id);
create index questions_source_id_idx on public.questions (source_id);
create index questions_created_by_idx on public.questions (created_by);
create index questions_reviewed_by_idx on public.questions (reviewed_by);
create index questions_fingerprint_idx on public.questions (stem_fingerprint);
create index questions_published_scope_idx
  on public.questions (university_id, section, subject_code, topic_label, published_at desc)
  where status = 'published';
create index question_choices_question_id_idx on public.question_choices (question_id);
create index question_validation_import_id_idx on public.question_validation_issues (import_id);
create index question_validation_question_id_idx on public.question_validation_issues (question_id);
create index question_validation_resolved_by_idx on public.question_validation_issues (resolved_by);
create index question_validation_open_idx
  on public.question_validation_issues (import_id, severity, created_at)
  where not resolved;

alter table public.question_sources enable row level security;
alter table public.question_imports enable row level security;
alter table public.questions enable row level security;
alter table public.question_choices enable row level security;
alter table public.question_validation_issues enable row level security;

create or replace function public.is_question_scope_admin(
  p_university_id text,
  p_section text
)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users admin_user
    where admin_user.user_id = (select auth.uid())
      and admin_user.allowed_university_id = p_university_id
      and admin_user.allowed_section = p_section
  );
$$;

revoke execute on function public.is_question_scope_admin(text, text) from public, anon;
grant execute on function public.is_question_scope_admin(text, text) to authenticated;

create policy "Scoped admins manage question sources"
on public.question_sources for all to authenticated
using ((select public.is_question_scope_admin(university_id, section)))
with check ((select public.is_question_scope_admin(university_id, section)));

create policy "Students read used published sources"
on public.question_sources for select to authenticated
using (
  exists (
    select 1
    from public.questions question
    join public.user_preferences preference
      on preference.user_id = (select auth.uid())
     and preference.selected_university = question.university_id
     and preference.selected_section = question.section
    where question.source_id = question_sources.id
      and question.status = 'published'
  )
);

create policy "Scoped admins manage question imports"
on public.question_imports for all to authenticated
using ((select public.is_question_scope_admin(university_id, section)))
with check ((select public.is_question_scope_admin(university_id, section)));

create policy "Scoped admins manage questions"
on public.questions for all to authenticated
using ((select public.is_question_scope_admin(university_id, section)))
with check ((select public.is_question_scope_admin(university_id, section)));

create policy "Students read scoped published questions"
on public.questions for select to authenticated
using (
  status = 'published'
  and exists (
    select 1
    from public.user_preferences preference
    where preference.user_id = (select auth.uid())
      and preference.selected_university = questions.university_id
      and preference.selected_section = questions.section
  )
);

create policy "Scoped admins manage question choices"
on public.question_choices for all to authenticated
using (
  exists (
    select 1 from public.questions question
    where question.id = question_choices.question_id
      and (select public.is_question_scope_admin(question.university_id, question.section))
  )
)
with check (
  exists (
    select 1 from public.questions question
    where question.id = question_choices.question_id
      and (select public.is_question_scope_admin(question.university_id, question.section))
  )
);

create policy "Students read scoped published choices"
on public.question_choices for select to authenticated
using (
  exists (
    select 1
    from public.questions question
    join public.user_preferences preference
      on preference.user_id = (select auth.uid())
     and preference.selected_university = question.university_id
     and preference.selected_section = question.section
    where question.id = question_choices.question_id
      and question.status = 'published'
  )
);

create policy "Scoped admins manage validation issues"
on public.question_validation_issues for all to authenticated
using (
  exists (
    select 1 from public.question_imports question_import
    where question_import.id = question_validation_issues.import_id
      and (select public.is_question_scope_admin(question_import.university_id, question_import.section))
  )
)
with check (
  exists (
    select 1 from public.question_imports question_import
    where question_import.id = question_validation_issues.import_id
      and (select public.is_question_scope_admin(question_import.university_id, question_import.section))
  )
);

revoke all on table public.question_sources from public, anon, authenticated;
revoke all on table public.question_imports from public, anon, authenticated;
revoke all on table public.questions from public, anon, authenticated;
revoke all on table public.question_choices from public, anon, authenticated;
revoke all on table public.question_validation_issues from public, anon, authenticated;
revoke all on sequence public.question_sources_id_seq from public, anon;
revoke all on sequence public.question_imports_id_seq from public, anon;
revoke all on sequence public.questions_id_seq from public, anon;
revoke all on sequence public.question_choices_id_seq from public, anon;
revoke all on sequence public.question_validation_issues_id_seq from public, anon;

grant select, insert, update, delete on table public.question_sources to authenticated;
grant select, insert, update, delete on table public.question_imports to authenticated;
grant select, insert, update, delete on table public.questions to authenticated;
grant select, insert, update, delete on table public.question_choices to authenticated;
grant select, insert, update, delete on table public.question_validation_issues to authenticated;
grant usage, select on sequence public.question_sources_id_seq to authenticated;
grant usage, select on sequence public.question_imports_id_seq to authenticated;
grant usage, select on sequence public.questions_id_seq to authenticated;
grant usage, select on sequence public.question_choices_id_seq to authenticated;
grant usage, select on sequence public.question_validation_issues_id_seq to authenticated;

create or replace function public.set_question_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_question_updated_at() from public, anon, authenticated;

create trigger question_sources_set_updated_at before update on public.question_sources
for each row execute function public.set_question_updated_at();
create trigger question_imports_set_updated_at before update on public.question_imports
for each row execute function public.set_question_updated_at();
create trigger questions_set_updated_at before update on public.questions
for each row execute function public.set_question_updated_at();
create trigger question_choices_set_updated_at before update on public.question_choices
for each row execute function public.set_question_updated_at();
create trigger question_validation_set_updated_at before update on public.question_validation_issues
for each row execute function public.set_question_updated_at();

create or replace function public.submit_question_import(
  p_scope jsonb,
  p_source jsonb,
  p_raw_text text,
  p_parser_version text,
  p_questions jsonb,
  p_issues jsonb default '[]'::jsonb
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
  v_question_ids bigint[] := array[]::bigint[];
  v_blocking_count integer := 0;
  v_warning_count integer := 0;
begin
  if not (select public.is_question_scope_admin(v_university_id, v_section)) then
    raise exception 'Requested question scope is not authorized.' using errcode = '42501';
  end if;
  if v_subject_code = '' or v_topic_label = '' or btrim(coalesce(p_source->>'title', '')) = '' then
    raise exception 'University, section, subject, topic, and source are required.' using errcode = '22023';
  end if;
  if jsonb_typeof(p_questions) <> 'array' or jsonb_array_length(p_questions) = 0 then
    raise exception 'At least one parsed question is required.' using errcode = '22023';
  end if;

  if nullif(p_source->>'public_id', '') is not null then
    select id into v_source_id
    from public.question_sources
    where public_id = (p_source->>'public_id')::uuid
      and university_id = v_university_id
      and section = v_section
      and subject_code = v_subject_code
      and topic_label = v_topic_label;
    if v_source_id is null then
      raise exception 'Selected question source is outside this scope.' using errcode = '42501';
    end if;
  else
    insert into public.question_sources (
      university_id, section, subject_code, topic_label, title, reference_text
    ) values (
      v_university_id, v_section, v_subject_code, v_topic_label,
      btrim(p_source->>'title'), nullif(btrim(coalesce(p_source->>'reference_text', '')), '')
    )
    on conflict (university_id, section, subject_code, topic_label, title)
    do update set reference_text = coalesce(excluded.reference_text, question_sources.reference_text)
    returning id into v_source_id;
  end if;

  select count(*) filter (where value->>'severity' = 'blocking'),
         count(*) filter (where value->>'severity' = 'warning')
    into v_blocking_count, v_warning_count
  from jsonb_array_elements(coalesce(p_issues, '[]'::jsonb));

  insert into public.question_imports (
    source_id, university_id, section, subject_code, topic_label, status,
    raw_text, question_count, blocking_issue_count, warning_count, parser_version
  ) values (
    v_source_id, v_university_id, v_section, v_subject_code, v_topic_label,
    case when v_blocking_count > 0 then 'needs_review' else 'ready' end,
    coalesce(p_raw_text, ''), jsonb_array_length(p_questions),
    v_blocking_count, v_warning_count, btrim(coalesce(p_parser_version, ''))
  ) returning id, public_id into v_import_id, v_import_public_id;

  for v_question in select value from jsonb_array_elements(p_questions) loop
    insert into public.questions (
      import_id, source_id, university_id, section, subject_code, topic_label,
      source_order, stem, explanation, status, stem_fingerprint
    ) values (
      v_import_id, v_source_id, v_university_id, v_section, v_subject_code, v_topic_label,
      greatest(coalesce((v_question->>'source_order')::integer, 1), 1),
      coalesce(v_question->>'stem', ''),
      nullif(v_question->>'explanation', ''),
      case when coalesce((v_question->>'has_blockers')::boolean, false) then 'needs_review' else 'ready' end,
      coalesce(v_question->>'stem_fingerprint', '')
    ) returning id into v_question_id;
    v_question_ids := array_append(v_question_ids, v_question_id);

    for v_choice in select value from jsonb_array_elements(coalesce(v_question->'choices', '[]'::jsonb)) loop
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

  for v_issue in select value from jsonb_array_elements(coalesce(p_issues, '[]'::jsonb)) loop
    insert into public.question_validation_issues (
      import_id, question_id, code, severity, message, details
    ) values (
      v_import_id,
      case
        when (v_issue->>'question_index') ~ '^\\d+$'
          then v_question_ids[(v_issue->>'question_index')::integer + 1]
        else null
      end,
      coalesce(nullif(v_issue->>'code', ''), 'unknown'),
      case when v_issue->>'severity' = 'warning' then 'warning' else 'blocking' end,
      coalesce(nullif(v_issue->>'message', ''), 'Validation issue'),
      coalesce(v_issue->'details', '{}'::jsonb)
    );
  end loop;

  insert into public.question_validation_issues (
    import_id, question_id, code, severity, message, details
  )
  select
    v_import_id,
    imported_question.id,
    'exact_existing_question_match',
    'warning',
    'Question exactly matches an existing normalized stem in this university section.',
    jsonb_build_object('stem_fingerprint', imported_question.stem_fingerprint)
  from public.questions imported_question
  where imported_question.import_id = v_import_id
    and imported_question.stem_fingerprint <> ''
    and exists (
      select 1
      from public.questions existing_question
      where existing_question.import_id <> v_import_id
        and existing_question.university_id = v_university_id
        and existing_question.section = v_section
        and existing_question.stem_fingerprint = imported_question.stem_fingerprint
    )
    and not exists (
      select 1
      from public.question_validation_issues existing_issue
      where existing_issue.import_id = v_import_id
        and existing_issue.question_id = imported_question.id
        and existing_issue.code = 'exact_existing_question_match'
    );

  update public.question_imports
  set warning_count = (
    select count(*) from public.question_validation_issues
    where import_id = v_import_id and severity = 'warning'
  )
  where id = v_import_id;

  return v_import_public_id;
end;
$$;

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

revoke execute on function public.submit_question_import(jsonb, jsonb, text, text, jsonb, jsonb) from public, anon;
revoke execute on function public.publish_question_import(uuid) from public, anon;
grant execute on function public.submit_question_import(jsonb, jsonb, text, text, jsonb, jsonb) to authenticated;
grant execute on function public.publish_question_import(uuid) to authenticated;
