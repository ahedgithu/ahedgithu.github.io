-- Privacy-safe recent MCQ activity for the tracker and quiz study pulse.
-- No user ids, emails, answer choices, or question text are exposed.

DROP FUNCTION IF EXISTS public.get_recent_mcq_activity(TEXT, INTEGER);

CREATE FUNCTION public.get_recent_mcq_activity(
  p_section TEXT DEFAULT '401',
  p_limit INTEGER DEFAULT 8
)
RETURNS TABLE (
  display_name      TEXT,
  avatar_id         TEXT,
  topic_label       TEXT,
  source_label      TEXT,
  answered_count    INTEGER,
  total_questions   INTEGER,
  completed         BOOLEAN,
  updated_at        TIMESTAMPTZ,
  rank              BIGINT
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  WITH score_totals AS (
    SELECT
      progress.user_id,
      COALESCE(SUM(progress.score), 0) AS total_score
    FROM public.user_mcq_progress progress
    WHERE progress.section = p_section
    GROUP BY progress.user_id
  ),
  ranked_users AS (
    SELECT
      totals.user_id,
      ROW_NUMBER() OVER (ORDER BY totals.total_score DESC, totals.user_id) AS rank
    FROM score_totals totals
  ),
  recent_per_student AS (
    SELECT DISTINCT ON (progress.user_id)
      progress.user_id,
      progress.topic_label,
      progress.source_label,
      progress.answered_count,
      progress.total_questions,
      progress.completed,
      progress.updated_at
    FROM public.user_mcq_progress progress
    WHERE progress.section = p_section
      AND progress.answered_count > 0
      AND progress.updated_at >= NOW() - INTERVAL '15 minutes'
    ORDER BY progress.user_id, progress.updated_at DESC
  )
  SELECT
    CASE
      WHEN recent.user_id = (SELECT auth.uid()) THEN COALESCE(NULLIF(btrim(preferences.nickname), ''), 'You')
      WHEN COALESCE(preferences.anonymous, true) = false
        AND NULLIF(btrim(preferences.nickname), '') IS NOT NULL
        THEN btrim(preferences.nickname)
      ELSE 'Student'
    END AS display_name,
    COALESCE(
      NULLIF(preferences.avatar_id, ''),
      CASE get_byte(decode(md5(recent.user_id::text), 'hex'), 0) % 8
        WHEN 0 THEN 'pulse'
        WHEN 1 THEN 'scholar'
        WHEN 2 THEN 'rounds'
        WHEN 3 THEN 'cardio'
        WHEN 4 THEN 'calm'
        WHEN 5 THEN 'scope'
        WHEN 6 THEN 'notes'
        ELSE 'anatomy'
      END
    ) AS avatar_id,
    recent.topic_label,
    recent.source_label,
    recent.answered_count,
    recent.total_questions,
    recent.completed,
    recent.updated_at,
    ranked.rank
  FROM recent_per_student recent
  JOIN ranked_users ranked ON ranked.user_id = recent.user_id
  LEFT JOIN public.user_preferences preferences ON preferences.user_id = recent.user_id
  WHERE (SELECT auth.uid()) IS NOT NULL
  ORDER BY recent.updated_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 8), 12));
$$;

REVOKE ALL ON FUNCTION public.get_recent_mcq_activity(TEXT, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_recent_mcq_activity(TEXT, INTEGER) TO authenticated;
