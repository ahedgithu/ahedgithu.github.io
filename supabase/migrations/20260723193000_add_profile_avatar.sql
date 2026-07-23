-- Add a privacy-safe illustrated avatar choice and expose it to the leaderboard.

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS avatar_id TEXT;

ALTER TABLE public.user_preferences
  DROP CONSTRAINT IF EXISTS user_preferences_avatar_id_allowed;

ALTER TABLE public.user_preferences
  ADD CONSTRAINT user_preferences_avatar_id_allowed
  CHECK (
    avatar_id IS NULL
    OR avatar_id IN ('pulse', 'scholar', 'rounds', 'cardio', 'calm', 'scope', 'notes', 'anatomy')
  );

DROP FUNCTION IF EXISTS public.get_leaderboard(TEXT);

CREATE FUNCTION public.get_leaderboard(p_section TEXT DEFAULT '401')
RETURNS TABLE (
  user_id           UUID,
  display_name      TEXT,
  avatar_id         TEXT,
  anonymous         BOOLEAN,
  total_score       BIGINT,
  mcqs_count        BIGINT,
  quizzes_completed BIGINT,
  correct_answers   BIGINT
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    CASE WHEN u.id = (SELECT auth.uid()) THEN u.id ELSE NULL END,
    CASE
      WHEN u.id = (SELECT auth.uid()) THEN COALESCE(NULLIF(btrim(up.nickname), ''), 'You')
      WHEN COALESCE(up.anonymous, true) = false AND NULLIF(btrim(up.nickname), '') IS NOT NULL THEN btrim(up.nickname)
      ELSE 'Student'
    END,
    COALESCE(
      NULLIF(up.avatar_id, ''),
      CASE get_byte(decode(md5(u.id::text), 'hex'), 0) % 8
        WHEN 0 THEN 'pulse'
        WHEN 1 THEN 'scholar'
        WHEN 2 THEN 'rounds'
        WHEN 3 THEN 'cardio'
        WHEN 4 THEN 'calm'
        WHEN 5 THEN 'scope'
        WHEN 6 THEN 'notes'
        ELSE 'anatomy'
      END
    ),
    COALESCE(up.anonymous, true),
    COALESCE(qp.ct, 0) AS total_score,
    COALESCE(qp.mc, 0),
    COALESCE(qp.cc, 0),
    COALESCE(qp.ct, 0)
  FROM auth.users u
  LEFT JOIN public.user_preferences up ON up.user_id = u.id
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*) FILTER (WHERE completed) AS cc,
      COUNT(DISTINCT topic_label) FILTER (WHERE answered_count > 0) AS mc,
      COALESCE(SUM(score), 0) AS ct
    FROM public.user_mcq_progress
    WHERE user_id = u.id AND section = p_section
  ) qp ON true
  WHERE (SELECT auth.uid()) IS NOT NULL
    AND (COALESCE(qp.mc, 0) + COALESCE(qp.cc, 0) + COALESCE(qp.ct, 0)) > 0
  ORDER BY total_score DESC;
$$;

REVOKE ALL ON FUNCTION public.get_leaderboard(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(TEXT) TO authenticated;
