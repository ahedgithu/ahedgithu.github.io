-- Support per-user season score lookups and auth.users cascade operations.
CREATE INDEX IF NOT EXISTS user_season_scores_user_id_idx
  ON public.user_season_scores (user_id);
