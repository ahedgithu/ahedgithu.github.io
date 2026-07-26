-- Start MED 402-2 scoring from fresh attempts only.
-- Older 402 MCQ rows remain preserved as lifetime progress but do not score
-- on the active 402 leaderboard season.

UPDATE public.leaderboard_seasons
SET
  active = false,
  ends_at = COALESCE(ends_at, transaction_timestamp())
WHERE section = '402'
  AND active
  AND scope_topic_label IS DISTINCT FROM 'MED 402-2 MCQs';

INSERT INTO public.leaderboard_seasons (
  section,
  name,
  scope_topic_label,
  starts_at,
  active
)
SELECT
  '402',
  'MED 402-2 Midterm',
  'MED 402-2 MCQs',
  transaction_timestamp(),
  true
WHERE NOT EXISTS (
  SELECT 1
  FROM public.leaderboard_seasons
  WHERE section = '402'
    AND active
    AND scope_topic_label = 'MED 402-2 MCQs'
);
