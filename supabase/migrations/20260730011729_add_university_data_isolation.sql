-- Add university-aware routing and data isolation.
-- Existing rows are safely backfilled as MUST data. This migration is local-only
-- until it is deliberately applied to a Supabase environment.

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS selected_university TEXT;

UPDATE public.user_preferences
SET selected_university = 'must'
WHERE selected_university IS NULL;

ALTER TABLE public.user_preferences
  ALTER COLUMN selected_university SET DEFAULT 'must',
  ALTER COLUMN selected_university SET NOT NULL,
  DROP CONSTRAINT IF EXISTS user_preferences_selected_university_check,
  DROP CONSTRAINT IF EXISTS user_preferences_selected_section_check,
  ADD CONSTRAINT user_preferences_selected_university_check
    CHECK (selected_university IN ('must', 'o6u', 'delta')),
  ADD CONSTRAINT user_preferences_selected_section_check
    CHECK (
      selected_section IS NULL
      OR (selected_university = 'must' AND selected_section IN ('401', '402'))
      OR (selected_university = 'o6u' AND selected_section = 'physical-therapy')
      OR (selected_university = 'delta' AND selected_section = 'physical-therapy')
    );

ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS allowed_university_id TEXT NOT NULL DEFAULT 'must';

ALTER TABLE public.admin_users
  DROP CONSTRAINT IF EXISTS admin_users_allowed_university_id_check,
  ADD CONSTRAINT admin_users_allowed_university_id_check
    CHECK (allowed_university_id IN ('must', 'o6u', 'delta'));

ALTER TABLE public.tracker_topics
  ADD COLUMN IF NOT EXISTS university_id TEXT NOT NULL DEFAULT 'must';
ALTER TABLE public.news_cards
  ADD COLUMN IF NOT EXISTS university_id TEXT NOT NULL DEFAULT 'must';
ALTER TABLE public.user_topic_progress
  ADD COLUMN IF NOT EXISTS university_id TEXT NOT NULL DEFAULT 'must';
ALTER TABLE public.user_mcq_progress
  ADD COLUMN IF NOT EXISTS university_id TEXT NOT NULL DEFAULT 'must';
ALTER TABLE public.leaderboard_seasons
  ADD COLUMN IF NOT EXISTS university_id TEXT NOT NULL DEFAULT 'must';
ALTER TABLE public.user_lifetime_scores
  ADD COLUMN IF NOT EXISTS university_id TEXT NOT NULL DEFAULT 'must';
ALTER TABLE public.student_presence
  ADD COLUMN IF NOT EXISTS university_id TEXT NOT NULL DEFAULT 'must';

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'tracker_topics',
    'news_cards',
    'user_topic_progress',
    'user_mcq_progress',
    'leaderboard_seasons',
    'user_lifetime_scores',
    'student_presence'
  ]
  LOOP
    EXECUTE format('UPDATE public.%I SET university_id = ''must'' WHERE university_id IS NULL', table_name);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN university_id SET DEFAULT ''must''', table_name);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN university_id SET NOT NULL', table_name);
    EXECUTE format(
      'ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I',
      table_name,
      table_name || '_university_id_check'
    );
    EXECUTE format(
      'ALTER TABLE public.%I ADD CONSTRAINT %I CHECK (university_id IN (''must'', ''o6u'', ''delta''))',
      table_name,
      table_name || '_university_id_check'
    );
  END LOOP;
END
$$;

ALTER TABLE public.tracker_topics
  DROP CONSTRAINT IF EXISTS tracker_topics_section_subject_code_track_topic_label_key,
  ADD CONSTRAINT tracker_topics_university_section_subject_track_topic_key
    UNIQUE (university_id, section, subject_code, track, topic_label);

ALTER TABLE public.news_cards
  DROP CONSTRAINT IF EXISTS news_cards_pkey,
  ADD CONSTRAINT news_cards_pkey PRIMARY KEY (university_id, id);

ALTER TABLE public.user_topic_progress
  DROP CONSTRAINT IF EXISTS user_topic_progress_pkey,
  ADD CONSTRAINT user_topic_progress_pkey
    PRIMARY KEY (user_id, university_id, section, subject_code, topic_label);

ALTER TABLE public.user_mcq_progress
  DROP CONSTRAINT IF EXISTS user_mcq_progress_pkey,
  ADD CONSTRAINT user_mcq_progress_pkey
    PRIMARY KEY (user_id, university_id, section, topic_label, source_id);

ALTER TABLE public.user_lifetime_scores
  DROP CONSTRAINT IF EXISTS user_lifetime_scores_pkey,
  ADD CONSTRAINT user_lifetime_scores_pkey
    PRIMARY KEY (user_id, university_id, section, topic_label, source_id);

ALTER TABLE public.leaderboard_seasons
  DROP CONSTRAINT IF EXISTS leaderboard_seasons_section_check,
  ADD CONSTRAINT leaderboard_seasons_section_check
    CHECK (section IN ('401', '402', 'physical-therapy'));

DROP INDEX IF EXISTS public.leaderboard_seasons_one_active_per_section;
CREATE UNIQUE INDEX leaderboard_seasons_one_active_per_university_section
  ON public.leaderboard_seasons (university_id, section)
  WHERE active;

DROP INDEX IF EXISTS public.news_cards_section_order_idx;
CREATE INDEX news_cards_university_section_order_idx
  ON public.news_cards (university_id, section, card_group, display_order);

CREATE INDEX IF NOT EXISTS tracker_topics_university_section_idx
  ON public.tracker_topics (university_id, section, subject_code, track);
CREATE INDEX IF NOT EXISTS user_topic_progress_university_section_idx
  ON public.user_topic_progress (university_id, section, user_id);
CREATE INDEX IF NOT EXISTS user_mcq_progress_university_section_idx
  ON public.user_mcq_progress (university_id, section, user_id);
CREATE INDEX IF NOT EXISTS student_presence_university_section_seen_idx
  ON public.student_presence (university_id, section, last_seen_at DESC);

DROP POLICY IF EXISTS "Admins can insert tracker topics" ON public.tracker_topics;
DROP POLICY IF EXISTS "Admins can update tracker topics" ON public.tracker_topics;
DROP POLICY IF EXISTS "Admins can delete tracker topics" ON public.tracker_topics;

CREATE POLICY "Admins can insert tracker topics"
ON public.tracker_topics FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1
  FROM public.admin_users
  WHERE admin_users.user_id = (SELECT auth.uid())
    AND admin_users.allowed_university_id = tracker_topics.university_id
    AND admin_users.allowed_section = tracker_topics.section
));

CREATE POLICY "Admins can update tracker topics"
ON public.tracker_topics FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public.admin_users
  WHERE admin_users.user_id = (SELECT auth.uid())
    AND admin_users.allowed_university_id = tracker_topics.university_id
    AND admin_users.allowed_section = tracker_topics.section
))
WITH CHECK (EXISTS (
  SELECT 1
  FROM public.admin_users
  WHERE admin_users.user_id = (SELECT auth.uid())
    AND admin_users.allowed_university_id = tracker_topics.university_id
    AND admin_users.allowed_section = tracker_topics.section
));

CREATE POLICY "Admins can delete tracker topics"
ON public.tracker_topics FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public.admin_users
  WHERE admin_users.user_id = (SELECT auth.uid())
    AND admin_users.allowed_university_id = tracker_topics.university_id
    AND admin_users.allowed_section = tracker_topics.section
));

DROP POLICY IF EXISTS "Admins can read section news cards" ON public.news_cards;
DROP POLICY IF EXISTS "Admins can insert section news cards" ON public.news_cards;
DROP POLICY IF EXISTS "Admins can update section news cards" ON public.news_cards;
DROP POLICY IF EXISTS "Admins can delete section news cards" ON public.news_cards;

CREATE POLICY "Admins can read section news cards"
ON public.news_cards FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public.admin_users
  WHERE admin_users.user_id = (SELECT auth.uid())
    AND admin_users.allowed_university_id = news_cards.university_id
    AND admin_users.allowed_section = news_cards.section
));

CREATE POLICY "Admins can insert section news cards"
ON public.news_cards FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1
  FROM public.admin_users
  WHERE admin_users.user_id = (SELECT auth.uid())
    AND admin_users.allowed_university_id = news_cards.university_id
    AND admin_users.allowed_section = news_cards.section
));

CREATE POLICY "Admins can update section news cards"
ON public.news_cards FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public.admin_users
  WHERE admin_users.user_id = (SELECT auth.uid())
    AND admin_users.allowed_university_id = news_cards.university_id
    AND admin_users.allowed_section = news_cards.section
))
WITH CHECK (EXISTS (
  SELECT 1
  FROM public.admin_users
  WHERE admin_users.user_id = (SELECT auth.uid())
    AND admin_users.allowed_university_id = news_cards.university_id
    AND admin_users.allowed_section = news_cards.section
));

CREATE POLICY "Admins can delete section news cards"
ON public.news_cards FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1
  FROM public.admin_users
  WHERE admin_users.user_id = (SELECT auth.uid())
    AND admin_users.allowed_university_id = news_cards.university_id
    AND admin_users.allowed_section = news_cards.section
));

INSERT INTO public.tracker_topics (
  university_id,
  section,
  subject_code,
  subject_name,
  track,
  topic_label,
  state,
  stop_note,
  display_order
)
VALUES
  ('o6u', 'physical-therapy', 'PT-PHYS', 'Physiology of Exercise', 'theoretical', 'Physiological Adaptation to Regular Physical Training', 'taken', 'Currently the only confirmed covered lecture.', 10),
  ('o6u', 'physical-therapy', 'PT-PATH2', 'Pathology 2', 'theoretical', 'Lecture 1 — Title pending', 'taken', 'Covered lecture. Official title pending.', 10),
  ('o6u', 'physical-therapy', 'PT-PATH2', 'Pathology 2', 'theoretical', 'Lecture 2 — Title pending', 'taken', 'Covered lecture. Official title pending.', 20),
  ('o6u', 'physical-therapy', 'PT-PATH2', 'Pathology 2', 'theoretical', 'Lecture 3 — Title pending', 'taken', 'Covered lecture. Official title pending.', 30),
  ('o6u', 'physical-therapy', 'PT-PATH2', 'Pathology 2', 'theoretical', 'Lecture 4 — Title pending', 'taken', 'Covered lecture. Official title pending.', 40)
ON CONFLICT (university_id, section, subject_code, track, topic_label)
DO UPDATE SET
  subject_name = EXCLUDED.subject_name,
  state = EXCLUDED.state,
  stop_note = EXCLUDED.stop_note,
  display_order = EXCLUDED.display_order,
  updated_at = now();

CREATE OR REPLACE FUNCTION private.capture_quiz_best_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := (SELECT auth.uid());
  active_season public.leaderboard_seasons%ROWTYPE;
BEGIN
  IF current_user_id IS NULL OR NEW.user_id <> current_user_id THEN
    RETURN NEW;
  END IF;
  IF NEW.completed IS DISTINCT FROM true OR NEW.score IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.user_lifetime_scores (
    user_id, university_id, section, topic_label, source_id,
    best_score, total_questions, updated_at
  )
  VALUES (
    NEW.user_id, NEW.university_id, NEW.section, NEW.topic_label, NEW.source_id,
    GREATEST(NEW.score, 0), NEW.total_questions, now()
  )
  ON CONFLICT (user_id, university_id, section, topic_label, source_id)
  DO UPDATE SET
    best_score = GREATEST(public.user_lifetime_scores.best_score, EXCLUDED.best_score),
    total_questions = COALESCE(EXCLUDED.total_questions, public.user_lifetime_scores.total_questions),
    updated_at = now();

  SELECT season.*
  INTO active_season
  FROM public.leaderboard_seasons season
  WHERE season.university_id = NEW.university_id
    AND season.section = NEW.section
    AND season.active
    AND season.starts_at <= now()
    AND (season.ends_at IS NULL OR season.ends_at > now())
    AND (season.scope_topic_label IS NULL OR season.scope_topic_label = NEW.topic_label)
  ORDER BY season.starts_at DESC
  LIMIT 1;

  IF active_season.id IS NOT NULL
    AND NEW.attempt_id IS NOT NULL
    AND NEW.attempt_started_at IS NOT NULL
    AND NEW.attempt_started_at >= active_season.starts_at
  THEN
    INSERT INTO public.user_season_scores (
      season_id, user_id, topic_label, source_id, best_score,
      total_questions, attempt_id, earned_at, updated_at
    )
    VALUES (
      active_season.id, NEW.user_id, NEW.topic_label, NEW.source_id,
      GREATEST(NEW.score, 0), NEW.total_questions, NEW.attempt_id,
      COALESCE(NEW.completed_at, now()), now()
    )
    ON CONFLICT (season_id, user_id, topic_label, source_id)
    DO UPDATE SET
      best_score = GREATEST(public.user_season_scores.best_score, EXCLUDED.best_score),
      total_questions = COALESCE(EXCLUDED.total_questions, public.user_season_scores.total_questions),
      attempt_id = CASE
        WHEN EXCLUDED.best_score >= public.user_season_scores.best_score THEN EXCLUDED.attempt_id
        ELSE public.user_season_scores.attempt_id
      END,
      earned_at = CASE
        WHEN EXCLUDED.best_score >= public.user_season_scores.best_score THEN EXCLUDED.earned_at
        ELSE public.user_season_scores.earned_at
      END,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_profile_setup(
  p_nickname TEXT,
  p_avatar_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := (SELECT auth.uid());
  clean_nickname TEXT := btrim(regexp_replace(COALESCE(p_nickname, ''), '\s+', ' ', 'g'));
  saved_preferences public.user_preferences%ROWTYPE;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Sign in is required.' USING ERRCODE = '42501';
  END IF;
  IF char_length(clean_nickname) NOT BETWEEN 2 AND 24
    OR clean_nickname ~ '[[:cntrl:]]'
    OR clean_nickname ~ '@'
    OR clean_nickname ~* '\mhttps?://'
    OR clean_nickname ~* '\mwww\.'
  THEN
    RAISE EXCEPTION 'Nickname must be 2-24 characters and cannot contain emails or links.'
      USING ERRCODE = '22023';
  END IF;
  IF p_avatar_id IS NULL OR p_avatar_id NOT IN (
    'pulse', 'scholar', 'rounds', 'cardio', 'calm', 'scope', 'notes', 'anatomy'
  ) THEN
    RAISE EXCEPTION 'Choose a valid profile avatar.' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM public.user_preferences preferences
    WHERE lower(btrim(preferences.nickname)) = lower(clean_nickname)
      AND preferences.user_id <> current_user_id
  ) THEN
    RAISE EXCEPTION 'Nickname is already taken.' USING ERRCODE = '23505';
  END IF;

  INSERT INTO public.user_preferences (
    user_id, anonymous, nickname, avatar_id, profile_setup_version, updated_at
  )
  VALUES (current_user_id, false, clean_nickname, p_avatar_id, 1, now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    anonymous = false,
    nickname = EXCLUDED.nickname,
    avatar_id = EXCLUDED.avatar_id,
    profile_setup_version = 1,
    updated_at = now()
  RETURNING * INTO saved_preferences;

  RETURN jsonb_build_object(
    'anonymous', false,
    'selected_university', saved_preferences.selected_university,
    'selected_section', saved_preferences.selected_section,
    'nickname', saved_preferences.nickname,
    'avatar_id', saved_preferences.avatar_id,
    'profile_setup_version', saved_preferences.profile_setup_version,
    'updated_at', saved_preferences.updated_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION private.is_university_scope_authorized(
  p_university_id TEXT,
  p_section TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    (SELECT auth.uid()) IS NOT NULL
    AND (
      EXISTS (
        SELECT 1
        FROM public.user_preferences preferences
        WHERE preferences.user_id = (SELECT auth.uid())
          AND preferences.selected_university = p_university_id
          AND preferences.selected_section = p_section
      )
      OR EXISTS (
        SELECT 1
        FROM public.admin_users admins
        WHERE admins.user_id = (SELECT auth.uid())
          AND admins.allowed_university_id = p_university_id
          AND admins.allowed_section = p_section
      )
    );
$$;

REVOKE ALL ON FUNCTION private.is_university_scope_authorized(TEXT, TEXT) FROM PUBLIC, anon, authenticated;

DROP FUNCTION IF EXISTS public.get_leaderboard(TEXT);
CREATE FUNCTION public.get_leaderboard(
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
  WITH active_season AS (
    SELECT season.id, season.name
    FROM public.leaderboard_seasons season
    WHERE season.university_id = p_university_id
      AND season.section = p_section
      AND season.active
      AND season.starts_at <= now()
      AND (season.ends_at IS NULL OR season.ends_at > now())
    ORDER BY season.starts_at DESC
    LIMIT 1
  ),
  lifetime_scores AS (
    SELECT scores.user_id, COALESCE(SUM(scores.best_score), 0)::BIGINT AS total_score
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
  ),
  season_scores AS (
    SELECT
      scores.user_id,
      COALESCE(SUM(scores.best_score), 0)::BIGINT AS total_score,
      COUNT(DISTINCT (scores.topic_label, scores.source_id))::BIGINT AS topics_count,
      COUNT(*)::BIGINT AS quizzes_count
    FROM public.user_season_scores scores
    JOIN active_season season ON season.id = scores.season_id
    GROUP BY scores.user_id
  )
  SELECT
    CASE WHEN users.id = (SELECT auth.uid()) THEN users.id ELSE NULL END,
    btrim(preferences.nickname),
    preferences.avatar_id,
    false,
    CASE WHEN active_season.id IS NOT NULL THEN COALESCE(season_scores.total_score, 0) ELSE COALESCE(lifetime_scores.total_score, 0) END,
    CASE WHEN active_season.id IS NOT NULL THEN COALESCE(season_scores.topics_count, 0) ELSE COALESCE(lifetime_progress.topics_count, 0) END,
    CASE WHEN active_season.id IS NOT NULL THEN COALESCE(season_scores.quizzes_count, 0) ELSE COALESCE(lifetime_progress.quizzes_count, 0) END,
    CASE WHEN active_season.id IS NOT NULL THEN COALESCE(season_scores.total_score, 0) ELSE COALESCE(lifetime_scores.total_score, 0) END,
    COALESCE(lifetime_scores.total_score, 0),
    COALESCE(lifetime_progress.topics_count, 0),
    COALESCE(lifetime_progress.quizzes_count, 0),
    COALESCE(lifetime_scores.total_score, 0),
    active_season.id,
    active_season.name
  FROM auth.users users
  JOIN public.user_preferences preferences
    ON preferences.user_id = users.id
    AND preferences.selected_university = p_university_id
    AND preferences.selected_section = p_section
    AND preferences.profile_setup_version >= 1
    AND preferences.anonymous = false
    AND NULLIF(btrim(preferences.nickname), '') IS NOT NULL
    AND NULLIF(preferences.avatar_id, '') IS NOT NULL
  LEFT JOIN lifetime_scores ON lifetime_scores.user_id = users.id
  LEFT JOIN lifetime_progress ON lifetime_progress.user_id = users.id
  LEFT JOIN season_scores ON season_scores.user_id = users.id
  LEFT JOIN active_season ON true
  WHERE (SELECT private.is_university_scope_authorized(p_university_id, p_section))
    AND (
      CASE
        WHEN active_season.id IS NOT NULL THEN COALESCE(season_scores.total_score, 0)
        ELSE COALESCE(lifetime_scores.total_score, 0)
      END > 0
      OR users.id = (SELECT auth.uid())
    )
  ORDER BY 5 DESC, lower(preferences.nickname), users.id;
$$;

DROP FUNCTION IF EXISTS public.get_recent_mcq_activity(TEXT, INTEGER);
CREATE FUNCTION public.get_recent_mcq_activity(
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
  WITH active_season AS (
    SELECT season.id, season.scope_topic_label, season.starts_at
    FROM public.leaderboard_seasons season
    WHERE season.university_id = p_university_id
      AND season.section = p_section
      AND season.active
      AND season.starts_at <= now()
      AND (season.ends_at IS NULL OR season.ends_at > now())
    ORDER BY season.starts_at DESC
    LIMIT 1
  ),
  score_totals AS (
    SELECT scores.user_id, SUM(scores.best_score)::BIGINT AS total_score
    FROM public.user_season_scores scores
    JOIN active_season season ON season.id = scores.season_id
    GROUP BY scores.user_id
    HAVING SUM(scores.best_score) > 0
    UNION ALL
    SELECT scores.user_id, SUM(scores.best_score)::BIGINT AS total_score
    FROM public.user_lifetime_scores scores
    WHERE scores.university_id = p_university_id
      AND scores.section = p_section
      AND NOT EXISTS (SELECT 1 FROM active_season)
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
    LEFT JOIN active_season season ON true
    WHERE progress.university_id = p_university_id
      AND progress.section = p_section
      AND progress.completed
      AND progress.score > 0
      AND progress.updated_at >= now() - INTERVAL '15 minutes'
      AND (
        season.id IS NULL
        OR (
          progress.topic_label = season.scope_topic_label
          AND progress.attempt_started_at >= season.starts_at
        )
      )
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

DROP FUNCTION IF EXISTS public.mark_student_online(TEXT, TEXT, BOOLEAN, TEXT, TEXT);
CREATE FUNCTION public.mark_student_online(
  p_university_id TEXT DEFAULT 'must',
  p_section TEXT DEFAULT '401',
  p_page TEXT DEFAULT 'tracker',
  p_is_mcq_active BOOLEAN DEFAULT false,
  p_topic_label TEXT DEFAULT NULL,
  p_source_label TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT (SELECT private.is_university_scope_authorized(p_university_id, p_section)) THEN
    RAISE EXCEPTION 'Requested university scope is not authorized.'
      USING ERRCODE = '42501';
  END IF;
  INSERT INTO public.student_presence (
    user_id, university_id, section, page, is_mcq_active,
    topic_label, source_label, last_seen_at
  )
  VALUES (
    (SELECT auth.uid()),
    COALESCE(NULLIF(btrim(p_university_id), ''), 'must'),
    COALESCE(NULLIF(btrim(p_section), ''), '401'),
    COALESCE(NULLIF(btrim(p_page), ''), 'tracker'),
    COALESCE(p_is_mcq_active, false),
    NULLIF(btrim(p_topic_label), ''),
    NULLIF(btrim(p_source_label), ''),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    university_id = EXCLUDED.university_id,
    section = EXCLUDED.section,
    page = EXCLUDED.page,
    is_mcq_active = EXCLUDED.is_mcq_active,
    topic_label = EXCLUDED.topic_label,
    source_label = EXCLUDED.source_label,
    last_seen_at = EXCLUDED.last_seen_at;
END;
$$;

DROP FUNCTION IF EXISTS public.get_online_students(TEXT, INTEGER);
CREATE FUNCTION public.get_online_students(
  p_university_id TEXT DEFAULT 'must',
  p_section TEXT DEFAULT '401',
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  display_name TEXT,
  avatar_id TEXT,
  is_mcq_active BOOLEAN,
  topic_label TEXT,
  source_label TEXT,
  last_seen_at TIMESTAMPTZ
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    CASE
      WHEN presence.user_id = (SELECT auth.uid()) THEN COALESCE(NULLIF(btrim(preferences.nickname), ''), 'You')
      ELSE btrim(preferences.nickname)
    END,
    preferences.avatar_id,
    presence.is_mcq_active,
    presence.topic_label,
    presence.source_label,
    presence.last_seen_at
  FROM public.student_presence presence
  JOIN public.user_preferences preferences
    ON preferences.user_id = presence.user_id
    AND preferences.selected_university = p_university_id
    AND preferences.selected_section = p_section
    AND preferences.profile_setup_version >= 1
    AND preferences.anonymous = false
  WHERE (SELECT private.is_university_scope_authorized(p_university_id, p_section))
    AND presence.university_id = p_university_id
    AND presence.section = p_section
    AND presence.last_seen_at >= now() - INTERVAL '90 seconds'
  ORDER BY presence.last_seen_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 10), 20));
$$;

REVOKE ALL ON FUNCTION public.get_leaderboard(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(TEXT, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.get_recent_mcq_activity(TEXT, TEXT, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_recent_mcq_activity(TEXT, TEXT, INTEGER) TO authenticated;
REVOKE ALL ON FUNCTION public.mark_student_online(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_student_online(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.get_online_students(TEXT, TEXT, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_online_students(TEXT, TEXT, INTEGER) TO authenticated;

COMMENT ON COLUMN public.user_preferences.selected_university IS
'Stable university routing identifier. Existing accounts are backfilled as MUST.';
