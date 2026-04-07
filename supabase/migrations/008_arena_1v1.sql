-- Migration 008: Arena, 1v1 tournaments, match records, billing improvements
-- Run this on your Supabase project

-- ──────────────────────────────────────────────
-- 1. Add 1v1 participant type to tournaments
-- ──────────────────────────────────────────────
ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS participant_type TEXT CHECK (participant_type IN ('team', '1v1')) DEFAULT 'team',
  ADD COLUMN IF NOT EXISTS gamer_invites JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS gamer_participants TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS match_records JSONB DEFAULT '[]';

-- Update tournament_type constraint to keep backward compat
-- (tournament_type = solo/shared = funding model, participant_type = team/1v1 = who plays)

-- ──────────────────────────────────────────────
-- 2. Add slug + billing_address to gamer_profiles
-- ──────────────────────────────────────────────
ALTER TABLE gamer_profiles
  ADD COLUMN IF NOT EXISTS username_slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS billing_address JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_gamer_profiles_username_slug ON gamer_profiles(username_slug);

-- ──────────────────────────────────────────────
-- 3. Match records table (per-match submissions)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS match_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments,
  match_id TEXT NOT NULL,
  team1_id TEXT,
  team2_id TEXT,
  player1_id TEXT,
  player2_id TEXT,
  participant_type TEXT DEFAULT 'team',
  team1_score INTEGER DEFAULT 0,
  team2_score INTEGER DEFAULT 0,
  winner_id TEXT,
  status TEXT CHECK (status IN ('pending','started','completed','disputed')) DEFAULT 'pending',
  team1_submission JSONB DEFAULT '{}',
  team2_submission JSONB DEFAULT '{}',
  chat JSONB DEFAULT '[]',
  abuse_reports JSONB DEFAULT '[]',
  organizer_verdict TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_records_tournament_id ON match_records(tournament_id);
CREATE INDEX IF NOT EXISTS idx_match_records_match_id ON match_records(match_id);

-- ──────────────────────────────────────────────
-- 4. Bills — add gamer_name to bills table
-- ──────────────────────────────────────────────
ALTER TABLE bills
  ADD COLUMN IF NOT EXISTS gamer_name TEXT,
  ADD COLUMN IF NOT EXISTS organizer_name TEXT,
  ADD COLUMN IF NOT EXISTS order_id TEXT;

-- ──────────────────────────────────────────────
-- 5. Audit trail table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users,
  actor_name TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_trail_actor_id ON audit_trail(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_entity_type ON audit_trail(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created_at ON audit_trail(created_at DESC);

-- ──────────────────────────────────────────────
-- 6. RLS for new tables
-- ──────────────────────────────────────────────
ALTER TABLE match_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

-- match_records: readable by authenticated users, writable by service role
CREATE POLICY IF NOT EXISTS "match_records_read" ON match_records
  FOR SELECT USING (auth.role() = 'authenticated');

-- audit_trail: staff/admin only via service role
CREATE POLICY IF NOT EXISTS "audit_trail_service_only" ON audit_trail
  FOR ALL USING (auth.role() = 'service_role');
