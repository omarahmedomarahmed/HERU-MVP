-- 017_migration_cleanup.sql
-- Comprehensive schema cleanup — safe to run on any existing DB.
-- Fixes column naming conflicts, missing RLS, missing indexes, and seeds required data
-- so a fresh database deployment has everything the app needs with no crashes.

-- ============================================================================
-- 1. FIX match_records — 008_1v1_and_enhancements.sql runs alphabetically first
--    and creates team_a_*/team_b_* columns. 008_arena_1v1.sql (which has the
--    correct team1_*/team2_* schema the backend expects) is silently skipped by
--    CREATE TABLE IF NOT EXISTS. This migration drops the wrong columns and
--    ensures the correct ones exist.
-- ============================================================================

-- Drop wrong columns (team_a_*/team_b_* naming)
ALTER TABLE match_records
  DROP COLUMN IF EXISTS team_a_id,
  DROP COLUMN IF EXISTS team_b_id,
  DROP COLUMN IF EXISTS team_a_name,
  DROP COLUMN IF EXISTS team_b_name,
  DROP COLUMN IF EXISTS team_a_score,
  DROP COLUMN IF EXISTS team_b_score,
  DROP COLUMN IF EXISTS team_a_submissions,
  DROP COLUMN IF EXISTS team_b_submissions,
  DROP COLUMN IF EXISTS team_a_reported,
  DROP COLUMN IF EXISTS team_b_reported,
  DROP COLUMN IF EXISTS organizer_notes;

-- Add correct columns expected by backend/src/routes/match-records.js
ALTER TABLE match_records
  ADD COLUMN IF NOT EXISTS team1_id TEXT,
  ADD COLUMN IF NOT EXISTS team2_id TEXT,
  ADD COLUMN IF NOT EXISTS team1_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS team2_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS team1_submission JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS team2_submission JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS player1_id TEXT,
  ADD COLUMN IF NOT EXISTS player2_id TEXT,
  ADD COLUMN IF NOT EXISTS participant_type TEXT DEFAULT 'team',
  ADD COLUMN IF NOT EXISTS organizer_verdict TEXT;

-- Fix status CHECK constraint: 008_1v1_and_enhancements only has ('pending','in_progress',
-- 'completed','disputed') but backend also uses 'started' (from 008_arena_1v1).
ALTER TABLE match_records DROP CONSTRAINT IF EXISTS match_records_status_check;
ALTER TABLE match_records ADD CONSTRAINT match_records_status_check
  CHECK (status IN ('pending', 'started', 'in_progress', 'completed', 'disputed'));

-- ============================================================================
-- 2. FIX tournaments — reconcile participant_type CHECK and ensure all columns
--    from both 008 migrations exist
-- ============================================================================

-- Expand constraint to accept values from both migrations ('player' and '1v1')
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_participant_type_check;
ALTER TABLE tournaments ADD CONSTRAINT tournaments_participant_type_check
  CHECK (participant_type IN ('team', 'player', '1v1'));

-- Ensure all participant columns exist (each 008 added different names)
ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS gamer_invites JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS gamer_participants TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS player_participants JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS player_invites JSONB DEFAULT '[]';

-- Ensure Riot integration columns exist (from 015 — idempotent)
ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS riot_provider_id INTEGER,
  ADD COLUMN IF NOT EXISTS riot_tournament_id INTEGER,
  ADD COLUMN IF NOT EXISTS riot_region TEXT DEFAULT 'EUW';

-- Ensure Valorant columns exist (from 016 — idempotent)
ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS val_map_pool TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS val_act_id TEXT;

-- ============================================================================
-- 3. ENABLE RLS on tables that were created without it
-- ============================================================================

-- audit_log (created in 007_username_slug.sql — no RLS)
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "audit_log_service_only"
  ON audit_log FOR ALL
  USING (auth.role() = 'service_role');

-- games (created in 009_team_chat_and_fixes.sql — no RLS)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "games_public_read"
  ON games FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "games_service_manage"
  ON games FOR ALL USING (auth.role() = 'service_role');

-- radar_views (created in 010_radar_views.sql — no RLS)
ALTER TABLE radar_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "radar_views_select_own"
  ON radar_views FOR SELECT
  USING (viewer_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "radar_views_insert_own"
  ON radar_views FOR INSERT
  TO authenticated
  WITH CHECK (viewer_id = auth.uid());

CREATE POLICY IF NOT EXISTS "radar_views_service_full"
  ON radar_views FOR ALL USING (auth.role() = 'service_role');

-- achievements (created in 009_team_chat_and_fixes.sql — no RLS)
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "achievements_public_read"
  ON achievements FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "achievements_service_manage"
  ON achievements FOR ALL USING (auth.role() = 'service_role');

-- gamer_achievements (created in 009_team_chat_and_fixes.sql — no RLS)
ALTER TABLE gamer_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "gamer_achievements_read_own"
  ON gamer_achievements FOR SELECT
  USING (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "gamer_achievements_service_manage"
  ON gamer_achievements FOR ALL USING (auth.role() = 'service_role');

-- team_members (created in 009_team_chat_and_fixes.sql — no RLS)
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "team_members_public_read"
  ON team_members FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "team_members_service_manage"
  ON team_members FOR ALL USING (auth.role() = 'service_role');

-- audit_trail (created in 008_arena_1v1.sql — has RLS policy but let's be safe)
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "audit_trail_service_only"
  ON audit_trail FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 4. ADD MISSING POLICIES on tables that have RLS but incomplete policies
-- ============================================================================

-- tournaments: missing DELETE policy
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'tournaments' AND policyname = 'Organizers can delete own tournaments'
  ) THEN
    CREATE POLICY "Organizers can delete own tournaments"
      ON public.tournaments FOR DELETE
      USING (organizer_id = auth.uid() OR main_organizer_id = auth.uid() OR auth.role() = 'service_role');
  END IF;
END $$;

-- tournament_orders: missing INSERT policy (service_role creates these, but for defense-in-depth)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'tournament_orders' AND policyname = 'Authenticated can create tournament orders'
  ) THEN
    CREATE POLICY "Authenticated can create tournament orders"
      ON public.tournament_orders FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- ============================================================================
-- 5. ADD MISSING INDEXES for query performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_audit_log_entity_id     ON audit_log(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity_type_2 ON audit_log(entity_type);

-- bot_servers (from 014_heru_connect.sql)
CREATE INDEX IF NOT EXISTS idx_bot_servers_tournament ON bot_servers(tournament_id)
  WHERE tournament_id IS NOT NULL;

-- riot_accounts (from 014_heru_connect.sql)
CREATE INDEX IF NOT EXISTS idx_riot_accounts_active_shard ON riot_accounts(active_shard);
CREATE INDEX IF NOT EXISTS idx_riot_accounts_rank_tier    ON riot_accounts(rank_tier);

-- match_records additional lookup indexes
CREATE INDEX IF NOT EXISTS idx_match_records_team1 ON match_records(team1_id);
CREATE INDEX IF NOT EXISTS idx_match_records_team2 ON match_records(team2_id);
CREATE INDEX IF NOT EXISTS idx_match_records_status ON match_records(status);

-- ============================================================================
-- 6. SEED staff_access_keys — without these, staff login is impossible on fresh DB
-- ============================================================================

INSERT INTO staff_access_keys (access_key, staff_name, staff_email, is_active, notes)
SELECT 'HERU-STAFF-OMAR-2026', 'Omar', 'omarabdelgawad001@gmail.com', true, 'Super admin — seeded by migration 017'
WHERE NOT EXISTS (SELECT 1 FROM staff_access_keys WHERE access_key = 'HERU-STAFF-OMAR-2026');

INSERT INTO staff_access_keys (access_key, staff_name, staff_email, is_active, notes)
SELECT 'HERU-STAFF-OPS-2026', 'Operations', 'heru.gg.esports@gmail.com', true, 'Ops team — seeded by migration 017'
WHERE NOT EXISTS (SELECT 1 FROM staff_access_keys WHERE access_key = 'HERU-STAFF-OPS-2026');

-- ============================================================================
-- 7. SEED default games if games table is empty
--    (009_team_chat_and_fixes.sql seeds these with ON CONFLICT DO NOTHING,
--     but only runs if migrations execute in order; this is a safety net)
-- ============================================================================

INSERT INTO games (name, slug, sort_order) VALUES
  ('Valorant',           'valorant',          1),
  ('CS2',                'cs2',               2),
  ('League of Legends',  'league-of-legends', 3),
  ('Dota 2',             'dota-2',            4),
  ('Rocket League',      'rocket-league',     5),
  ('Apex Legends',       'apex-legends',      6),
  ('Fortnite',           'fortnite',          7),
  ('Call of Duty',       'call-of-duty',      8),
  ('Rainbow Six Siege',  'rainbow-six-siege', 9),
  ('Overwatch 2',        'overwatch-2',       10),
  ('FIFA / EA FC',       'ea-fc',             11),
  ('PUBG',               'pubg',              12),
  ('Mobile Legends',     'mobile-legends',    13),
  ('Free Fire',          'free-fire',         14)
ON CONFLICT (name) DO NOTHING;
