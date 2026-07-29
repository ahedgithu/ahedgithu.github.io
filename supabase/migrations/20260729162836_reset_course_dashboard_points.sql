-- Reset MED 401 and MED 402 dashboard points after the midterm exams.
-- Quiz progress and completed-attempt history remain in user_mcq_progress,
-- while completed midterm season scores remain archived under inactive seasons.

DO $$
DECLARE
  reset_started_at TIMESTAMPTZ := transaction_timestamp();
BEGIN
  UPDATE public.leaderboard_seasons
  SET
    active = false,
    ends_at = COALESCE(ends_at, reset_started_at)
  WHERE section IN ('401', '402')
    AND active;

  DELETE FROM public.user_lifetime_scores
  WHERE section IN ('401', '402');

  INSERT INTO public.leaderboard_seasons (
    section,
    name,
    scope_topic_label,
    starts_at,
    active
  )
  VALUES
    ('401', 'MED 401 Post-Midterm', 'MED 401-1 MCQs', reset_started_at, true),
    ('402', 'MED 402 Post-Midterm', 'MED 402-2 MCQs', reset_started_at, true);
END;
$$;
