-- ============================================================================
-- 004: Tournaments table
-- Central table for all tournament data including brackets, chat, costs, etc.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  game TEXT,
  tournament_image TEXT,

  -- Ownership
  organizer_id UUID REFERENCES auth.users,
  main_organizer_id UUID REFERENCES auth.users,
  organizer_brand JSONB,

  -- Type and status
  tournament_type TEXT CHECK (tournament_type IN ('solo','shared')) DEFAULT 'solo',
  status TEXT CHECK (status IN ('draft','published','live','completed')) DEFAULT 'draft',
  format TEXT,
  participant_type TEXT DEFAULT 'team',

  -- Capacity and scheduling
  max_teams INTEGER,
  schedule TIMESTAMPTZ,
  description TEXT,
  is_offline BOOLEAN DEFAULT FALSE,
  venue TEXT,

  -- Team participants (team-based tournaments)
  teams TEXT[] DEFAULT '{}',
  invited_teams TEXT[] DEFAULT '{}',
  join_requests JSONB DEFAULT '[]',

  -- Player participants (1v1 tournaments)
  player_participants JSONB DEFAULT '[]',
  player_invites JSONB DEFAULT '[]',
  gamer_participants TEXT[] DEFAULT '{}',
  gamer_invites JSONB DEFAULT '[]',

  -- Talent bookings
  talents JSONB DEFAULT '[]',

  -- Marketplace item IDs (resolved at publish time)
  branding_items TEXT[] DEFAULT '{}',
  production_items TEXT[] DEFAULT '{}',
  prizepool_items TEXT[] DEFAULT '{}',
  venue_items TEXT[] DEFAULT '{}',

  -- Cost breakdown
  total_cost NUMERIC DEFAULT 0,
  prizepool_total NUMERIC DEFAULT 0,
  platform_fee NUMERIC DEFAULT 0,
  platform_fee_percent NUMERIC DEFAULT 15,
  prizepool_in_total_cost BOOLEAN DEFAULT TRUE,
  prize_breakdown JSONB DEFAULT '[]',
  prizepool_coins INTEGER DEFAULT 0,

  -- Sponsorship radar
  on_radar BOOLEAN DEFAULT FALSE,
  sponsorship_radar_id UUID,
  radar_funding_percent NUMERIC DEFAULT 0,
  required_branding_committed BOOLEAN DEFAULT FALSE,
  co_organizers JSONB DEFAULT '[]',

  -- Chat channels (JSONB arrays)
  organizer_chat JSONB DEFAULT '[]',
  brackets JSONB DEFAULT '[]',
  support_chat JSONB DEFAULT '[]',
  general_chat JSONB DEFAULT '[]',
  team_chats JSONB DEFAULT '{}',

  -- Custom signup page
  signup_banner TEXT,
  signup_description TEXT,
  signup_rules TEXT,
  signup_custom_fields JSONB DEFAULT '[]',

  -- Streaming
  stream_link TEXT,
  stream_embed_url TEXT,

  -- Results
  winner_team_id TEXT,
  results JSONB DEFAULT '{}',
  prize_assignments JSONB DEFAULT '[]',

  -- Logs
  tournament_log JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
