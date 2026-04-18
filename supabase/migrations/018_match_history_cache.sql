-- 018_match_history_cache.sql
-- Add match history cache to riot_accounts so public profiles can show
-- recent games without hitting the Riot API on every page load.
-- syncLolStats will populate these fields during the sync call.

ALTER TABLE riot_accounts
  ADD COLUMN IF NOT EXISTS match_history_cache JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS flex_rank_tier TEXT,
  ADD COLUMN IF NOT EXISTS flex_rank_division TEXT,
  ADD COLUMN IF NOT EXISTS flex_rank_lp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS flex_wins INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS flex_losses INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hot_streak BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS veteran BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS freshblood BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS total_mastery_score INTEGER DEFAULT 0;

COMMENT ON COLUMN riot_accounts.match_history_cache IS
  'Last 5 matches as [{matchId, win, kills, deaths, assists, champion, duration_s, queue_type, played_at}]';

-- Index for fast public profile lookups by user_id + is_public
CREATE INDEX IF NOT EXISTS idx_riot_accounts_user_public
  ON riot_accounts(user_id, is_public);
