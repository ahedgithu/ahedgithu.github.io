-- Remove the hard 50-row leaderboard cap while preserving score aggregation and privacy rules.

CREATE OR REPLACE FUNCTION get_leaderboard(p_section TEXT DEFAULT '401')
RETURNS TABLE (
  user_id           UUID,
  display_name      TEXT,
  avatar_url        TEXT,
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
    CASE
      WHEN u.id = (SELECT auth.uid()) THEN COALESCE(u.raw_user_meta_data->>'avatar_url', '')
      ELSE ''
    END,
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
