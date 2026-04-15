-- ============================================================================
-- 003: Teams table and team_members supplementary table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo TEXT,
  banner_image TEXT,
  primary_color TEXT DEFAULT '#ff1a1a',
  secondary_color TEXT DEFAULT '#0a0a0a',
  leader_id TEXT,
  members TEXT[] DEFAULT '{}',
  games TEXT[] DEFAULT '{}',
  description TEXT,
  story TEXT,
  contact_number TEXT,
  images TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  is_recruiting BOOLEAN DEFAULT TRUE,
  join_requests JSONB DEFAULT '[]',
  tournament_invites JSONB DEFAULT '[]',
  tournament_history JSONB DEFAULT '[]',
  chat_messages JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  stats JSONB DEFAULT '{"wins":0,"losses":0,"tournaments_played":0}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- team_members supplements teams.members with role info
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams ON DELETE CASCADE NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'player',
  custom_role TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);
