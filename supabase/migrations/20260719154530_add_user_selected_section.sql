-- Require each signed-in student to choose one account-bound academic section.

ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS selected_section TEXT;

DO $$
BEGIN
  ALTER TABLE public.user_preferences
  ADD CONSTRAINT user_preferences_selected_section_check
  CHECK (selected_section IS NULL OR selected_section IN ('401', '402'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

COMMENT ON COLUMN public.user_preferences.selected_section IS
'The student academic section used as the account-level routing source of truth.';
