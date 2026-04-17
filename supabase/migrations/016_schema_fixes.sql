-- 016_schema_fixes.sql
-- Fix all schema gaps identified in audit:
-- 1. arena_challenges table (missing entirely)
-- 2. gamer_profiles: add contact_number + social_links
-- 3. promo_codes: add discount_type + discount_value
-- 4. tournament_reports: add report_type column
-- 5. riot_accounts: add champion_masteries + match_history cache columns
-- 6. connected_accounts: add riot_id_token for RSO (optional future use)

-- ============================================================================
-- 1. arena_challenges — 1v1 tournament challenges between gamers
-- ============================================================================

CREATE TABLE IF NOT EXISTS arena_challenges (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenged_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game              TEXT NOT NULL,
  format            TEXT NOT NULL DEFAULT '1v1',
  wager             NUMERIC DEFAULT 0,
  wager_type        TEXT CHECK (wager_type IN ('coins', 'none')) DEFAULT 'none',
  status            TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled', 'disputed')) DEFAULT 'pending',
  winner_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  match_record_id   UUID REFERENCES match_records(id) ON DELETE SET NULL,
  tournament_id     UUID REFERENCES tournaments(id) ON DELETE SET NULL,
  riot_tournament_code TEXT,
  chat              JSONB DEFAULT '[]',
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_arena_challenges_challenger ON arena_challenges(challenger_id);
CREATE INDEX IF NOT EXISTS idx_arena_challenges_challenged ON arena_challenges(challenged_id);
CREATE INDEX IF NOT EXISTS idx_arena_challenges_status ON arena_challenges(status);

ALTER TABLE arena_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "arena_challenges_read_participants"
  ON arena_challenges FOR SELECT
  USING (challenger_id = auth.uid() OR challenged_id = auth.uid());

CREATE POLICY IF NOT EXISTS "arena_challenges_insert_auth"
  ON arena_challenges FOR INSERT
  WITH CHECK (challenger_id = auth.uid());

CREATE POLICY IF NOT EXISTS "arena_challenges_update_participants"
  ON arena_challenges FOR UPDATE
  USING (challenger_id = auth.uid() OR challenged_id = auth.uid());

-- ============================================================================
-- 2. gamer_profiles — add missing columns
-- ============================================================================

ALTER TABLE gamer_profiles
  ADD COLUMN IF NOT EXISTS contact_number TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';

-- ============================================================================
-- 3. promo_codes — add discount_type + discount_value (keep discount_percent)
-- ============================================================================

ALTER TABLE promo_codes
  ADD COLUMN IF NOT EXISTS discount_type TEXT CHECK (discount_type IN ('percent', 'fixed')) DEFAULT 'percent',
  ADD COLUMN IF NOT EXISTS discount_value NUMERIC;

-- Backfill discount_value from existing discount_percent
UPDATE promo_codes
  SET discount_type = 'percent',
      discount_value = discount_percent
  WHERE discount_value IS NULL AND discount_percent IS NOT NULL;

-- ============================================================================
-- 4. tournament_reports — add report_type column
-- ============================================================================

ALTER TABLE tournament_reports
  ADD COLUMN IF NOT EXISTS report_type TEXT CHECK (report_type IN ('post_event', 'sponsor', 'internal', 'public')) DEFAULT 'post_event';

-- ============================================================================
-- 5. riot_accounts — add champion mastery + match history cache
-- ============================================================================

ALTER TABLE riot_accounts
  ADD COLUMN IF NOT EXISTS champion_masteries JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS recent_match_ids TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS champion_rotation JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS active_shard TEXT,
  ADD COLUMN IF NOT EXISTS val_rank_tier TEXT,
  ADD COLUMN IF NOT EXISTS val_rank_rating INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS val_wins INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS val_act_id TEXT;

-- ============================================================================
-- 6. tournaments — add Valorant-specific fields
-- ============================================================================

ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS val_map_pool TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS val_act_id TEXT;

-- ============================================================================
-- 7. match_records — add Valorant match data
-- ============================================================================

ALTER TABLE match_records
  ADD COLUMN IF NOT EXISTS val_match_id TEXT,
  ADD COLUMN IF NOT EXISTS val_match_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS riot_match_id TEXT,
  ADD COLUMN IF NOT EXISTS riot_match_data JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_match_records_val_match ON match_records(val_match_id)
  WHERE val_match_id IS NOT NULL;

-- ============================================================================
-- 8. gamer_profiles — add riot_id_token for optional RSO flow
-- ============================================================================

ALTER TABLE gamer_profiles
  ADD COLUMN IF NOT EXISTS riot_rso_token TEXT,
  ADD COLUMN IF NOT EXISTS riot_rso_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS riot_rso_puuid TEXT;

-- ============================================================================
-- 9. Ensure connected_accounts platform includes riot (for RSO future)
-- ============================================================================

-- Note: The platform CHECK constraint currently allows 'discord','twitch','youtube'
-- We drop and recreate the constraint to add 'riot' for RSO access tokens
ALTER TABLE connected_accounts
  DROP CONSTRAINT IF EXISTS connected_accounts_platform_check;

ALTER TABLE connected_accounts
  ADD CONSTRAINT connected_accounts_platform_check
  CHECK (platform IN ('discord', 'twitch', 'youtube', 'riot'));
