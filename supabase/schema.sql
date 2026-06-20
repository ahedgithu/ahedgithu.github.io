create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'editor' check (role in ('owner', 'admin', 'editor')),
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  color text,
  total_count integer not null default 0,
  exam_note text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  status text not null default 'remaining' check (status in ('taken', 'partial', 'announced', 'remaining')),
  section text,
  lecture_url text,
  audio_url text,
  pdf_url text,
  pdf_label text,
  lecture_urls jsonb not null default '[]'::jsonb,
  pdf_urls jsonb not null default '[]'::jsonb,
  notes text,
  date_taken date,
  art integer not null default 0,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subjects_order_idx on public.subjects(order_index, code);
create index if not exists topics_subject_order_idx on public.topics(subject_id, order_index, title);
create index if not exists topics_status_idx on public.topics(status);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists topics_touch_updated_at on public.topics;
create trigger topics_touch_updated_at
before update on public.topics
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'editor'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_editor_or_above()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('owner', 'admin', 'editor'), false)
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'owner', false)
$$;

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.subjects, public.topics to anon, authenticated;
grant select on public.profiles to authenticated;
grant insert, update, delete on public.subjects, public.topics to authenticated;
grant update on public.profiles to authenticated;

drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_owner());

drop policy if exists "profiles update owner only" on public.profiles;
create policy "profiles update owner only"
on public.profiles
for update
to authenticated
using (public.is_owner())
with check (public.is_owner());

drop policy if exists "subjects public read" on public.subjects;
create policy "subjects public read"
on public.subjects
for select
to anon, authenticated
using (true);

drop policy if exists "subjects admins write" on public.subjects;
create policy "subjects admins write"
on public.subjects
for all
to authenticated
using (public.is_editor_or_above())
with check (public.is_editor_or_above());

drop policy if exists "topics public read" on public.topics;
create policy "topics public read"
on public.topics
for select
to anon, authenticated
using (true);

drop policy if exists "topics admins write" on public.topics;
create policy "topics admins write"
on public.topics
for all
to authenticated
using (public.is_editor_or_above())
with check (public.is_editor_or_above());

insert into public.subjects (code, name, color, total_count, exam_note, order_index)
values
  ('SUR-1', 'Surgery 1', '#69a7ff', 13, 'Midterm starts Jul 18, 2026. Exact SUR-1 schedule pending.', 10),
  ('SUR-2', 'Surgery 2', '#69a7ff', 6, 'Midterm starts Jul 18, 2026. Exact SUR-2 schedule pending.', 20),
  ('MED-1', 'Internal Medicine 1', '#36d399', 6, 'Midterm starts Jul 18, 2026. Exact MED-1 schedule pending.', 30),
  ('MED-2', 'Internal Medicine 2', '#36d399', 13, 'Midterm starts Jul 18, 2026. Exact MED-2 schedule pending.', 40),
  ('ONC', 'Oncology', '#d8b24d', 6, 'Midterm starts Jul 18, 2026. Exact ONC schedule pending.', 50),
  ('NUT', 'Nutrition', '#d8b24d', 9, 'Midterm starts Jul 18, 2026. Exact NUT schedule pending.', 60),
  ('LAB', 'Lab Medicine', '#ff6b6b', 6, 'Midterm starts Jul 18, 2026. Exact LAB schedule pending.', 70),
  ('ANAE', 'Anesthesia', '#9999ff', 7, 'Midterm starts Jul 18, 2026. Exact ANAE schedule pending.', 80)
on conflict (code) do update
set name = excluded.name,
    color = excluded.color,
    total_count = excluded.total_count,
    exam_note = excluded.exam_note,
    order_index = excluded.order_index;

-- After creating your Supabase Auth user, run this once with your email:
-- update public.profiles set role = 'owner' where email = 'your-email@example.com';
