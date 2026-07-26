-- Privacy-safe online presence for the tracker.
-- The table is not directly exposed; students heartbeat through RPCs.

CREATE TABLE IF NOT EXISTS public.student_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  section TEXT NOT NULL DEFAULT '401',
  page TEXT NOT NULL DEFAULT 'tracker',
  is_mcq_active BOOLEAN NOT NULL DEFAULT false,
  topic_label TEXT,
  source_label TEXT,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.student_presence ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.student_presence FROM PUBLIC, anon, authenticated;

CREATE INDEX IF NOT EXISTS student_presence_section_seen_idx
  ON public.student_presence (section, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS student_presence_mcq_seen_idx
  ON public.student_presence (section, is_mcq_active, last_seen_at DESC);

DROP FUNCTION IF EXISTS public.mark_student_online(TEXT, TEXT, BOOLEAN, TEXT, TEXT);

CREATE FUNCTION public.mark_student_online(
  p_section TEXT DEFAULT '401',
  p_page TEXT DEFAULT 'tracker',
  p_is_mcq_active BOOLEAN DEFAULT false,
  p_topic_label TEXT DEFAULT NULL,
  p_source_label TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.student_presence (
    user_id,
    section,
    page,
    is_mcq_active,
    topic_label,
    source_label,
    last_seen_at
  )
  VALUES (
    (SELECT auth.uid()),
    COALESCE(NULLIF(btrim(p_section), ''), '401'),
    COALESCE(NULLIF(btrim(p_page), ''), 'tracker'),
    COALESCE(p_is_mcq_active, false),
    NULLIF(btrim(p_topic_label), ''),
    NULLIF(btrim(p_source_label), ''),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    CASE
      WHEN presence.user_id = (SELECT auth.uid()) THEN COALESCE(NULLIF(btrim(preferences.nickname), ''), 'You')
      WHEN COALESCE(preferences.anonymous, true) = false
        AND NULLIF(btrim(preferences.nickname), '') IS NOT NULL
        THEN btrim(preferences.nickname)
      ELSE 'Student'
    END AS display_name,
    COALESCE(
      NULLIF(preferences.avatar_id, ''),
      CASE get_byte(decode(md5(presence.user_id::text), 'hex'), 0) % 8
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
    presence.is_mcq_active,
    presence.topic_label,
    presence.source_label,
    presence.last_seen_at
  FROM public.student_presence presence
  LEFT JOIN public.user_preferences preferences ON preferences.user_id = presence.user_id
  WHERE (SELECT auth.uid()) IS NOT NULL
    AND presence.section = p_section
    AND presence.last_seen_at >= now() - INTERVAL '90 seconds'
  ORDER BY presence.last_seen_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 10), 20));
$$;

REVOKE ALL ON FUNCTION public.mark_student_online(TEXT, TEXT, BOOLEAN, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_student_online(TEXT, TEXT, BOOLEAN, TEXT, TEXT) TO authenticated;

REVOKE ALL ON FUNCTION public.get_online_students(TEXT, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_online_students(TEXT, INTEGER) TO authenticated;
