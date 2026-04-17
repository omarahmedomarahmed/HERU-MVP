-- 015_riot_tournament.sql
-- Riot Games API integration: tournament codes, spectator, match callbacks

-- Add Riot tournament tracking columns to tournaments
ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS riot_provider_id INTEGER,
  ADD COLUMN IF NOT EXISTS riot_tournament_id INTEGER,
  ADD COLUMN IF NOT EXISTS riot_region TEXT DEFAULT 'EUW';

-- Add Riot match tracking columns to match_records
ALTER TABLE match_records
  ADD COLUMN IF NOT EXISTS riot_tournament_code TEXT,
  ADD COLUMN IF NOT EXISTS riot_game_id BIGINT,
  ADD COLUMN IF NOT EXISTS riot_callback_received BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS riot_callback_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS riot_lobby_events JSONB DEFAULT '[]';

-- Index for fast lookup by tournament code (webhook callbacks)
CREATE INDEX IF NOT EXISTS idx_match_records_riot_code ON match_records(riot_tournament_code)
  WHERE riot_tournament_code IS NOT NULL;
