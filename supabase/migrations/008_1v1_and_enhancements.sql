-- Migration 008: 1v1 tournament support, match records, gamer billing, audit triggers
-- Applied: 2026-04-07

-- ============================================================================
-- 1. 1v1 TOURNAMENT SUPPORT — tournaments table additions
-- ============================================================================

ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS participant_type TEXT
  DEFAULT 'team'
  CHECK (participant_type IN ('team', 'player'));

ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS player_participants JSONB DEFAULT '[]';

ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS player_invites JSONB DEFAULT '[]';

-- ============================================================================
-- 2. GAMER TOURNAMENT INVITES — gamer_profiles addition
-- ============================================================================

ALTER TABLE gamer_profiles ADD COLUMN IF NOT EXISTS tournament_invites JSONB DEFAULT '[]';

-- ============================================================================
-- 3. MATCH RECORDS — new table
-- ============================================================================

CREATE TABLE IF NOT EXISTS match_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments,
  match_id TEXT NOT NULL,
  round INTEGER,
  team_a_id TEXT,
  team_b_id TEXT,
  team_a_name TEXT,
  team_b_name TEXT,
  team_a_score INTEGER DEFAULT 0,
  team_b_score INTEGER DEFAULT 0,
  winner_id TEXT,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'disputed')) DEFAULT 'pending',
  team_a_submissions JSONB DEFAULT '[]',
  team_b_submissions JSONB DEFAULT '[]',
  team_a_reported BOOLEAN DEFAULT FALSE,
  team_b_reported BOOLEAN DEFAULT FALSE,
  abuse_reports JSONB DEFAULT '[]',
  chat JSONB DEFAULT '[]',
  organizer_notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. GAMER BILLING — payment methods on gamer_profiles
-- ============================================================================

ALTER TABLE gamer_profiles ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '[]';

-- ============================================================================
-- 5. INDEXES on match_records
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_match_records_tournament_id ON match_records(tournament_id);
CREATE INDEX IF NOT EXISTS idx_match_records_match_id ON match_records(match_id);

-- ============================================================================
-- 6. AUDIT LOG TRIGGERS
-- ============================================================================

-- Helper: generic audit log insert function
CREATE OR REPLACE FUNCTION audit_log_insert(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_entity_name TEXT,
  p_user_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_log (user_id, action, entity_type, entity_id, entity_name, details)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_entity_name, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: teams — log team creation
CREATE OR REPLACE FUNCTION trg_audit_team_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (user_id, action, entity_type, entity_id, entity_name, details)
  VALUES (
    NEW.leader_id,
    'team_created',
    'team',
    NEW.id::TEXT,
    NEW.name,
    jsonb_build_object('leader_id', NEW.leader_id, 'games', NEW.games)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_team_created ON teams;
CREATE TRIGGER audit_team_created
  AFTER INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION trg_audit_team_created();

-- Trigger: gamer_profiles — log talent application (when is_talent flips to true)
CREATE OR REPLACE FUNCTION trg_audit_talent_application()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_talent = TRUE AND (OLD.is_talent IS NULL OR OLD.is_talent = FALSE) THEN
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, entity_name, details)
    VALUES (
      NEW.user_id::TEXT,
      'talent_application',
      'gamer_profile',
      NEW.id::TEXT,
      NEW.username,
      jsonb_build_object('talent_type', NEW.talent_type, 'talent_price', NEW.talent_price)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_talent_application ON gamer_profiles;
CREATE TRIGGER audit_talent_application
  AFTER UPDATE ON gamer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trg_audit_talent_application();

-- Trigger: tournaments — log when teams or player_participants change (join events)
CREATE OR REPLACE FUNCTION trg_audit_tournament_participant_join()
RETURNS TRIGGER AS $$
BEGIN
  -- Team joined (teams array grew)
  IF array_length(NEW.teams, 1) IS DISTINCT FROM array_length(OLD.teams, 1)
     AND COALESCE(array_length(NEW.teams, 1), 0) > COALESCE(array_length(OLD.teams, 1), 0) THEN
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, entity_name, details)
    VALUES (
      NULL,
      'team_joined_tournament',
      'tournament',
      NEW.id::TEXT,
      NEW.name,
      jsonb_build_object(
        'teams_count', COALESCE(array_length(NEW.teams, 1), 0),
        'teams', NEW.teams
      )
    );
  END IF;

  -- Player joined (player_participants array grew)
  IF jsonb_array_length(NEW.player_participants) > jsonb_array_length(OLD.player_participants) THEN
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, entity_name, details)
    VALUES (
      NULL,
      'player_joined_tournament',
      'tournament',
      NEW.id::TEXT,
      NEW.name,
      jsonb_build_object(
        'player_count', jsonb_array_length(NEW.player_participants),
        'participant_type', NEW.participant_type
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_tournament_participant_join ON tournaments;
CREATE TRIGGER audit_tournament_participant_join
  AFTER UPDATE ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION trg_audit_tournament_participant_join();

-- ============================================================================
-- 7. RLS POLICIES for match_records
-- ============================================================================

ALTER TABLE match_records ENABLE ROW LEVEL SECURITY;

-- Public read access for match records
CREATE POLICY IF NOT EXISTS "match_records_select_public"
  ON match_records FOR SELECT
  USING (true);

-- Authenticated users can insert match records (organizers submit via API)
CREATE POLICY IF NOT EXISTS "match_records_insert_auth"
  ON match_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update match records
CREATE POLICY IF NOT EXISTS "match_records_update_auth"
  ON match_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
