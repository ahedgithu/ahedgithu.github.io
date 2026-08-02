-- Hardening reviewed against the live project before application.
-- Apply only after the migration is reviewed against the then-current database.

alter function public.touch_updated_at() set search_path = '';
alter function public.set_user_progress_updated_at() set search_path = '';

-- Trigger and event-trigger functions are internal implementation details, not RPCs.
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
revoke execute on function public.set_user_progress_updated_at() from public, anon, authenticated;
revoke execute on function public.set_tracker_topic_update_metadata() from public, anon, authenticated;
revoke execute on function public.set_news_card_update_metadata() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- Role helpers remain callable by signed-in users because current RLS policies use them.
-- Anonymous callers and PUBLIC must not invoke them directly.
revoke execute on function public.current_user_role() from public, anon;
revoke execute on function public.is_editor_or_above() from public, anon;
revoke execute on function public.is_owner() from public, anon;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_editor_or_above() to authenticated;
grant execute on function public.is_owner() to authenticated;

-- These tables are intentionally RPC-only. RLS stays enabled as defense in depth.
revoke all on table public.leaderboard_seasons from anon, authenticated;
revoke all on table public.student_presence from anon, authenticated;
revoke all on table public.user_lifetime_scores from anon, authenticated;
revoke all on table public.user_season_scores from anon, authenticated;

-- University-aware RPCs were verified to call private.is_university_scope_authorized().
-- Keep them available only to signed-in users.
revoke execute on function public.get_leaderboard(text, text) from public, anon;
revoke execute on function public.get_online_students(text, text, integer) from public, anon;
revoke execute on function public.get_recent_mcq_activity(text, text, integer) from public, anon;
revoke execute on function public.mark_student_online(text, text, text, boolean, text, text) from public, anon;
grant execute on function public.get_leaderboard(text, text) to authenticated;
grant execute on function public.get_online_students(text, text, integer) to authenticated;
grant execute on function public.get_recent_mcq_activity(text, text, integer) to authenticated;
grant execute on function public.mark_student_online(text, text, text, boolean, text, text) to authenticated;
