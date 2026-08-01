-- Restore section-wide lifetime MCQ totals from preserved completed progress.
-- Active and archived season records remain untouched for audit, but public
-- leaderboard/profile ranking now uses lifetime totals exclusively.

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- Keep progress stable while rebuilding its derived score projection.
LOCK TABLE public.user_mcq_progress IN SHARE MODE;
LOCK TABLE public.user_lifetime_scores IN SHARE ROW EXCLUSIVE MODE;

DELETE FROM public.user_lifetime_scores
WHERE section IN ('401', '402');

INSERT INTO public.user_lifetime_scores (
  user_id,
  university_id,
  section,
  topic_label,
  source_id,
  best_score,
  total_questions,
  updated_at
)
SELECT
  progress.user_id,
  progress.university_id,
  progress.section,
  progress.topic_label,
  progress.source_id,
  MAX(GREATEST(progress.score, 0)),
  MAX(progress.total_questions),
  COALESCE(MAX(progress.updated_at), now())
FROM public.user_mcq_progress progress
WHERE progress.section IN ('401', '402')
  AND progress.completed IS TRUE
  AND progress.score IS NOT NULL
GROUP BY
  progress.user_id,
  progress.university_id,
  progress.section,
  progress.topic_label,
  progress.source_id
ON CONFLICT (user_id, university_id, section, topic_label, source_id)
DO UPDATE SET
  best_score = GREATEST(public.user_lifetime_scores.best_score, EXCLUDED.best_score),
  total_questions = COALESCE(EXCLUDED.total_questions, public.user_lifetime_scores.total_questions),
  updated_at = GREATEST(public.user_lifetime_scores.updated_at, EXCLUDED.updated_at);

CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_university_id TEXT DEFAULT 'must',
  p_section TEXT DEFAULT '401'
)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_id TEXT,
  anonymous BOOLEAN,
  total_score BIGINT,
  mcqs_count BIGINT,
  quizzes_completed BIGINT,
  correct_answers BIGINT,
  lifetime_score BIGINT,
  lifetime_mcqs_count BIGINT,
  lifetime_quizzes_completed BIGINT,
  lifetime_correct_answers BIGINT,
  season_id BIGINT,
  season_name TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  WITH lifetime_scores AS (
    SELECT
      scores.user_id,
      COALESCE(SUM(scores.best_score), 0)::BIGINT AS total_score
    FROM public.user_lifetime_scores scores
    WHERE scores.university_id = p_university_id
      AND scores.section = p_section
    GROUP BY scores.user_id
  ),
  lifetime_progress AS (
    SELECT
      progress.user_id,
      COUNT(DISTINCT (progress.topic_label, progress.source_id))
        FILTER (WHERE progress.answered_count > 0)::BIGINT AS topics_count,
      COUNT(*) FILTER (WHERE progress.completed)::BIGINT AS quizzes_count
    FROM public.user_mcq_progress progress
    WHERE progress.university_id = p_university_id
      AND progress.section = p_section
    GROUP BY progress.user_id
  )
  SELECT
    CASE WHEN users.id = (SELECT auth.uid()) THEN users.id ELSE NULL END,
    btrim(preferences.nickname),
    preferences.avatar_id,
    false,
    COALESCE(lifetime_scores.total_score, 0),
    COALESCE(lifetime_progress.topics_count, 0),
    COALESCE(lifetime_progress.quizzes_count, 0),
    COALESCE(lifetime_scores.total_score, 0),
    COALESCE(lifetime_scores.total_score, 0),
    COALESCE(lifetime_progress.topics_count, 0),
    COALESCE(lifetime_progress.quizzes_count, 0),
    COALESCE(lifetime_scores.total_score, 0),
    NULL::BIGINT,
    NULL::TEXT
  FROM auth.users users
  JOIN public.user_preferences preferences
    ON preferences.user_id = users.id
    AND preferences.selected_university = p_university_id
    AND preferences.selected_section = p_section
    AND preferences.profile_setup_version >= 1
    AND preferences.anonymous = false
    AND NULLIF(btrim(preferences.nickname), '') IS NOT NULL
    AND NULLIF(preferences.avatar_id, '') IS NOT NULL
    AND NULLIF(btrim(preferences.nickname), '') IS NOT NULL
    AND NULLIF(preferences.avatar_id, '') IS NOT NULL
  LEFT JOIN lifetime_scores ON lifetime_scores.user_id = users.id
  LEFT JOIN lifetime_progress ON lifetime_progress.user_id = users.id
  WHERE (SELECT private.is_university_scope_authorized(p_university_id, p_section))
    AND (
      COALESCE(lifetime_scores.total_score, 0) > 0
      OR users.id = (SELECT auth.uid())
    )
  ORDER BY 5 DESC, lower(preferences.nickname), users.id;
$$;

REVOKE ALL ON FUNCTION public.get_leaderboard(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(TEXT, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_recent_mcq_activity(
  p_university_id TEXT DEFAULT 'must',
  p_section TEXT DEFAULT '401',
  p_limit INTEGER DEFAULT 8
)
RETURNS TABLE (
  display_name TEXT,
  avatar_id TEXT,
  topic_label TEXT,
  source_label TEXT,
  answered_count INTEGER,
  total_questions INTEGER,
  completed BOOLEAN,
  updated_at TIMESTAMPTZ,
  rank BIGINT
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  WITH score_totals AS (
    SELECT scores.user_id, SUM(scores.best_score)::BIGINT AS total_score
    FROM public.user_lifetime_scores scores
    WHERE scores.university_id = p_university_id
      AND scores.section = p_section
    GROUP BY scores.user_id
    HAVING SUM(scores.best_score) > 0
  ),
  ranked_users AS (
    SELECT user_id, ROW_NUMBER() OVER (ORDER BY total_score DESC, user_id) AS rank
    FROM score_totals
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
    WHERE progress.university_id = p_university_id
      AND progress.section = p_section
      AND progress.completed
      AND progress.score > 0
      AND progress.updated_at >= now() - INTERVAL '15 minutes'
    ORDER BY progress.user_id, progress.updated_at DESC
  )
  SELECT
    btrim(preferences.nickname),
    preferences.avatar_id,
    recent.topic_label,
    recent.source_label,
    recent.answered_count,
    recent.total_questions,
    recent.completed,
    recent.updated_at,
    ranked.rank
  FROM recent_per_student recent
  JOIN ranked_users ranked ON ranked.user_id = recent.user_id
  JOIN public.user_preferences preferences
    ON preferences.user_id = recent.user_id
    AND preferences.selected_university = p_university_id
    AND preferences.selected_section = p_section
    AND preferences.profile_setup_version >= 1
    AND preferences.anonymous = false
  WHERE (SELECT private.is_university_scope_authorized(p_university_id, p_section))
  ORDER BY recent.updated_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 8), 12));
$$;

REVOKE ALL ON FUNCTION public.get_recent_mcq_activity(TEXT, TEXT, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_recent_mcq_activity(TEXT, TEXT, INTEGER) TO authenticated;
