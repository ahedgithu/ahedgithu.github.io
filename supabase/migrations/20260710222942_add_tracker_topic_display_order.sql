alter table public.tracker_topics
add column if not exists display_order integer;

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
      new.audio_url
    ) is distinct from row(
      old.section,
      old.subject_code,
      old.subject_name,
      old.track,
      old.topic_label,
      old.state,
      old.stop_note,
      old.drive_url,
      old.audio_url
    )
  then
    new.updated_at = now();
    new.updated_by = auth.uid();
  end if;

  return new;
end;
$$;
