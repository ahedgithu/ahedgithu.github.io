-- Add an optional student-controlled nickname for private profile and opt-in public leaderboard display.

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS nickname TEXT;

ALTER TABLE public.user_preferences
  DROP CONSTRAINT IF EXISTS user_preferences_nickname_length;

ALTER TABLE public.user_preferences
  ADD CONSTRAINT user_preferences_nickname_length
  CHECK (
    nickname IS NULL
    OR (
      char_length(btrim(nickname)) BETWEEN 2 AND 24
      AND nickname !~ '@'
      AND nickname !~* '\mhttps?://'
      AND nickname !~* '\mwww\.'
    )
  );
