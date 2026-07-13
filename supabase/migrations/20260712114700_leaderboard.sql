-- Leaderboard: user preferences table + server-side score aggregation

-- 1. Preferences table (anonymous toggle)
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous  BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.user_preferences FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_preferences TO authenticated;

CREATE POLICY "Users manage own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- 2. RPC function: aggregates scores server-side so clients never read other users' raw rows
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
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', 'Student'),
    COALESCE(u.raw_user_meta_data->>'avatar_url', ''),
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
  ORDER BY total_score DESC
  LIMIT 50;
$$;

REVOKE ALL ON FUNCTION public.get_leaderboard(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(TEXT) TO authenticated;
