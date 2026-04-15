-- ============================================================================
-- 010: Match records — per-match data for arena and bracket scoring
-- Two schemas coexist: the older team_a/team_b style and the newer
-- participant1/participant2 style used by the bracket sync routes.
-- Both are included so all code paths work.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.match_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments,

  -- Identifiers
  match_id TEXT,
  bracket_match_id TEXT,
  round INTEGER,
  round_number INTEGER,
  match_number INTEGER,

  -- Team-based participants (older schema)
  team_a_id TEXT,
  team_b_id TEXT,
  team_a_name TEXT,
  team_b_name TEXT,
  team_a_score INTEGER DEFAULT 0,
  team_b_score INTEGER DEFAULT 0,

  -- Newer participant schema (used by bracket sync)
  team1_id TEXT,
  team2_id TEXT,
  player1_id TEXT,
  player2_id TEXT,
  participant_type TEXT DEFAULT 'team',
  participant1_id TEXT,
  participant1_name TEXT,
  participant2_id TEXT,
  participant2_name TEXT,
  participant1_score INTEGER,
  participant2_score INTEGER,
  team1_score INTEGER DEFAULT 0,
  team2_score INTEGER DEFAULT 0,

  -- Result
  winner_id TEXT,
  status TEXT CHECK (status IN ('pending','started','in_progress','completed','disputed')) DEFAULT 'pending',

  -- Submissions (legacy)
  team_a_submissions JSONB DEFAULT '[]',
  team_b_submissions JSONB DEFAULT '[]',
  team_a_reported BOOLEAN DEFAULT FALSE,
  team_b_reported BOOLEAN DEFAULT FALSE,

  -- Submissions (newer)
  team1_submission JSONB DEFAULT '{}',
  team2_submission JSONB DEFAULT '{}',
  team1_roster JSONB DEFAULT '[]',
  team2_roster JSONB DEFAULT '[]',
  player_submissions JSONB DEFAULT '[]',
  screenshots JSONB DEFAULT '[]',

  -- Chat and reports
  chat JSONB DEFAULT '[]',
  abuse_reports JSONB DEFAULT '[]',
  organizer_notes TEXT,
  organizer_verdict TEXT,
  notes TEXT,

  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
