create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin',
  allowed_section text not null default '401',
  created_at timestamptz not null default now()
);

alter table public.admin_users
add column if not exists allowed_section text not null default '401';

create table if not exists public.tracker_topics (
  id uuid primary key default gen_random_uuid(),
  section text not null,
  subject_code text not null,
  subject_name text not null,
  track text not null default 'theoretical',
  topic_label text not null,
  state text not null default 'remaining' check (state in ('taken', 'partial', 'announced', 'remaining')),
  stop_note text,
  drive_url text,
  audio_url text,
  display_order integer,
  midterm_scope boolean not null default false,
  midterm_scope_note text,
  created_at timestamptz,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  unique (section, subject_code, track, topic_label)
);

alter table public.tracker_topics
add column if not exists drive_url text;

alter table public.tracker_topics
add column if not exists audio_url text;

alter table public.tracker_topics
add column if not exists display_order integer;

alter table public.tracker_topics
add column if not exists midterm_scope boolean not null default false;

alter table public.tracker_topics
add column if not exists midterm_scope_note text;

alter table public.tracker_topics
add column if not exists created_at timestamptz;

alter table public.tracker_topics
alter column created_at set default now();

create index if not exists tracker_topics_display_order_idx
on public.tracker_topics (section, subject_code, track, display_order);

create or replace function public.set_tracker_topic_update_metadata()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT'
    or row(
      new.section,
      new.subject_code,
      new.subject_name,
      new.track,
      new.topic_label,
      new.state,
      new.stop_note,
      new.drive_url,
      new.audio_url,
      new.midterm_scope,
      new.midterm_scope_note
    ) is distinct from row(
      old.section,
      old.subject_code,
      old.subject_name,
      old.track,
      old.topic_label,
      old.state,
      old.stop_note,
      old.drive_url,
      old.audio_url,
      old.midterm_scope,
      old.midterm_scope_note
    )
  then
    new.updated_at = now();
    new.updated_by = auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists tracker_topics_set_update_metadata on public.tracker_topics;
create trigger tracker_topics_set_update_metadata
before insert or update on public.tracker_topics
for each row execute function public.set_tracker_topic_update_metadata();

alter table public.admin_users enable row level security;
alter table public.tracker_topics enable row level security;

drop policy if exists "Admins can read admin list" on public.admin_users;
create policy "Admins can read admin list"
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Anyone can read tracker topics" on public.tracker_topics;
create policy "Anyone can read tracker topics"
on public.tracker_topics
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can insert tracker topics" on public.tracker_topics;
create policy "Admins can insert tracker topics"
on public.tracker_topics
for insert
to authenticated
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
      and admin_users.allowed_section = tracker_topics.section
  )
);

drop policy if exists "Admins can update tracker topics" on public.tracker_topics;
create policy "Admins can update tracker topics"
on public.tracker_topics
for update
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
      and admin_users.allowed_section = tracker_topics.section
  )
)
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
      and admin_users.allowed_section = tracker_topics.section
  )
);

drop policy if exists "Admins can delete tracker topics" on public.tracker_topics;
create policy "Admins can delete tracker topics"
on public.tracker_topics
for delete
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
      and admin_users.allowed_section = tracker_topics.section
  )
);

grant usage on schema public to anon, authenticated;
grant select on public.tracker_topics to anon, authenticated;
grant insert, update, delete on public.tracker_topics to authenticated;
grant select on public.admin_users to authenticated;

create table if not exists public.news_cards (
  id text primary key,
  section text not null,
  title text not null,
  body text not null default '',
  text_direction text not null default 'ltr' check (text_direction in ('ltr', 'rtl')),
  course text not null default 'all',
  card_date date,
  kicker text not null default '',
  tag text not null default '',
  badge text not null default '',
  deadline_start date,
  deadline_due date,
  deadline_label text not null default '',
  facts jsonb not null default '[]'::jsonb,
  action_label text not null default '',
  action_url text not null default '',
  card_group text not null default 'regular' check (card_group in ('pinned', 'regular')),
  display_order integer not null default 10,
  is_wide boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create index if not exists news_cards_section_order_idx
on public.news_cards (section, card_group, display_order);

create or replace function public.set_news_card_update_metadata()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

drop trigger if exists news_cards_set_update_metadata on public.news_cards;
create trigger news_cards_set_update_metadata
before insert or update on public.news_cards
for each row execute function public.set_news_card_update_metadata();

alter table public.news_cards enable row level security;

drop policy if exists "Anyone can read published news cards" on public.news_cards;
create policy "Anyone can read published news cards"
on public.news_cards
for select
to anon, authenticated
using (published = true);

drop policy if exists "Admins can read section news cards" on public.news_cards;
create policy "Admins can read section news cards"
on public.news_cards
for select
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
      and admin_users.allowed_section = news_cards.section
  )
);

drop policy if exists "Admins can insert section news cards" on public.news_cards;
create policy "Admins can insert section news cards"
on public.news_cards
for insert
to authenticated
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
      and admin_users.allowed_section = news_cards.section
  )
);

drop policy if exists "Admins can update section news cards" on public.news_cards;
create policy "Admins can update section news cards"
on public.news_cards
for update
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
      and admin_users.allowed_section = news_cards.section
  )
)
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
      and admin_users.allowed_section = news_cards.section
  )
);

drop policy if exists "Admins can delete section news cards" on public.news_cards;
create policy "Admins can delete section news cards"
on public.news_cards
for delete
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
      and admin_users.allowed_section = news_cards.section
  )
);

grant select on public.news_cards to anon, authenticated;
grant insert, update, delete on public.news_cards to authenticated;

insert into public.news_cards
  (id, section, title, body, text_direction, course, card_date, kicker, tag, badge, deadline_start, deadline_due, deadline_label, facts, action_label, action_url, card_group, display_order, is_wide, published)
values
  ('smart-learning-groups-2026-06-25', '401', 'Smart Learning group instructions', 'مساء الخير يا دكاترة، جروبات التحضير هتبدأ من النهارده للتمرين بتاع الخميس الجاي. كل جروب يتكوّن من 5 طلاب، والموضوع هيختلف حسب الدكتور.\n\nممنوع الطالب يشترك في أكتر من جروب. كل جروب يسلّم شغله على Smart Learning، والحد الأقصى 10 papers.', 'rtl', 'all', '2026-06-25', 'Smart Learning', 'Assignment', 'Jun 25', null, null, '', '[{"label":"Group size","value":"5 students"},{"label":"Limit","value":"Max 10 papers"},{"label":"Submit","value":"Smart Learning"}]', '', '', 'pinned', 10, true, true),
  ('incision-academy-reminder', '401', 'Incision Academy reminder', 'تذكير بموضوع Incision Academy الخاص بمادة Surgery 401-1. عليه 4 درجات، ولازم تجيبوا 70%+ عشان الدرجات تتحسب.\n\nفعلوا الكود على الموقع، حلوا المطلوب في Surgery، واتأكدوا إن الاسم الرباعي والـ ID مكتوبين صح على الحساب.', 'rtl', 'SUR401-1', '2026-06-25', 'SUR401-1', 'Schedule', '4 marks', null, null, '', '[{"label":"Code","value":"4241F9"},{"label":"Pass","value":"70%+"},{"label":"Marks","value":"4 marks"}]', 'Open Incision Academy', 'https://academy.incision.care/', 'pinned', 30, true, true),
  ('lab401-clinical-pathology-research', '401', 'LAB401 Clinical Pathology Research', 'مطلوب بحث مطبوع hard copy في Clinical Pathology / Laboratory Medicine. التسليم من خلال مسؤول التجميع.', 'rtl', 'LAB401', '2026-09-05', 'Required assignment', 'Assignment', 'Due Sep 5', '2026-06-06', '2026-09-05', 'Due Sep 5, 2026', '[{"label":"Final","value":"45 marks"},{"label":"Research","value":"5"},{"label":"Length","value":"Max 8 pages"},{"label":"Submission","value":"Printed hard copy"},{"label":"Recommended topic","value":"Liver Function Tests"}]', '', '', 'pinned', 40, false, true),
  ('sur401-2-assessment', '401', 'SUR401-2 assessment', 'مجموع SUR401-2 هو 25 درجة: امتحان final مع درجات حضور. كملوا الكويز بعد كل محاضرة.', 'rtl', 'SUR401-2', '2026-06-16', 'SUR401-2', 'Resource', 'Jun 16', null, null, '', '[{"label":"Final","value":"20 marks"},{"label":"Attendance","value":"5 marks"}]', '', '', 'pinned', 60, false, true),
  ('402-tracker-launch', '402', 'MED 402 tracker shell is live locally', 'The 402 hub tracks covered Weekly Reports topics. Midterm badges remain hidden until the scope is confirmed, and MCQs stay inactive until answer-key-backed sources are added.', 'ltr', 'all', '2026-07-06', 'MED 402', 'Tracker update', 'Local draft', null, null, '', '[{"label":"Source","value":"Weekly Reports Weeks 1-6"},{"label":"Midterm","value":"Not confirmed yet"},{"label":"MCQs","value":"Pending answer keys"}]', '', '', 'pinned', 10, true, true)
on conflict (id) do nothing;

update public.news_cards
set created_at = card_date::timestamptz
where id in (
  'smart-learning-groups-2026-06-25',
  'nutrition-quiz-2026-07-08',
  'incision-academy-reminder',
  'lab401-clinical-pathology-research',
  'anaesthesia-assessment',
  'sur401-2-assessment',
  '402-tracker-launch'
)
and card_date is not null;

create table if not exists public.user_topic_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  section text not null,
  subject_code text not null,
  topic_label text not null,
  studied boolean not null default false,
  mcqs boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, section, subject_code, topic_label)
);

create table if not exists public.user_mcq_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  section text not null,
  topic_label text not null,
  source_id text not null default 'current',
  source_label text,
  progress jsonb not null default '{}'::jsonb,
  completed boolean not null default false,
  score integer,
  total_questions integer,
  answered_count integer,
  wrong_question_ids text[] not null default '{}',
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, section, topic_label, source_id)
);

create or replace function public.set_user_progress_updated_at()
returns trigger
language plpgsql
security invoker
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_topic_progress_set_updated_at on public.user_topic_progress;
create trigger user_topic_progress_set_updated_at
before insert or update on public.user_topic_progress
for each row execute function public.set_user_progress_updated_at();

drop trigger if exists user_mcq_progress_set_updated_at on public.user_mcq_progress;
create trigger user_mcq_progress_set_updated_at
before insert or update on public.user_mcq_progress
for each row execute function public.set_user_progress_updated_at();

alter table public.user_topic_progress enable row level security;
alter table public.user_mcq_progress enable row level security;

drop policy if exists "Users can read own topic progress" on public.user_topic_progress;
create policy "Users can read own topic progress"
on public.user_topic_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own topic progress" on public.user_topic_progress;
create policy "Users can insert own topic progress"
on public.user_topic_progress
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own topic progress" on public.user_topic_progress;
create policy "Users can update own topic progress"
on public.user_topic_progress
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own topic progress" on public.user_topic_progress;
create policy "Users can delete own topic progress"
on public.user_topic_progress
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own MCQ progress" on public.user_mcq_progress;
create policy "Users can read own MCQ progress"
on public.user_mcq_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own MCQ progress" on public.user_mcq_progress;
create policy "Users can insert own MCQ progress"
on public.user_mcq_progress
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own MCQ progress" on public.user_mcq_progress;
create policy "Users can update own MCQ progress"
on public.user_mcq_progress
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own MCQ progress" on public.user_mcq_progress;
create policy "Users can delete own MCQ progress"
on public.user_mcq_progress
for delete
to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.user_topic_progress to authenticated;
grant select, insert, update, delete on public.user_mcq_progress to authenticated;

-- After creating your Supabase Auth user, run this once with that user's id:
-- insert into public.admin_users (user_id, allowed_section) values ('00000000-0000-0000-0000-000000000000', '401');
