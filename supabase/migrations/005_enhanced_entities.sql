-- Migration 005: Enhanced entities for gamer pages, team roles, achievements, deliverables, organizer page config
-- Applied: 2026-04-04

-- ============================================================================
-- NEW TABLES
-- ============================================================================

-- Organizer page config (public profile customization)
CREATE TABLE IF NOT EXISTS public.organizer_page_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES auth.users UNIQUE NOT NULL,
  layout_template TEXT CHECK (layout_template IN ('modern','classic','minimal')) DEFAULT 'modern',
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_image TEXT,
  sections JSONB DEFAULT '[]',
  cta_text TEXT DEFAULT 'View Tournaments',
  cta_link TEXT,
  show_stats BOOLEAN DEFAULT TRUE,
  show_portfolio BOOLEAN DEFAULT TRUE,
  show_social BOOLEAN DEFAULT TRUE,
  featured_tournament_ids TEXT[] DEFAULT '{}',
  custom_css JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deliverables (gig worker deliverable tracking)
CREATE TABLE IF NOT EXISTS public.deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_request_id UUID REFERENCES public.gig_requests NOT NULL,
  tournament_id UUID REFERENCES public.tournaments NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending','in_progress','on_break','completed','revision')) DEFAULT 'pending',
  assigned_to TEXT NOT NULL,
  files JSONB DEFAULT '[]',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members with roles (supplements teams.members TEXT[])
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'player',
  custom_role TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Achievement definitions (staff-managed)
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT CHECK (category IN ('tournament','team','social','milestone')) DEFAULT 'milestone',
  criteria JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gamer earned achievements
CREATE TABLE IF NOT EXISTS public.gamer_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  achievement_id UUID REFERENCES public.achievements NOT NULL,
  tournament_id UUID REFERENCES public.tournaments,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================================================
-- ALTER EXISTING TABLES
-- ============================================================================

-- gig_requests: deliverable tracking
ALTER TABLE public.gig_requests
  ADD COLUMN IF NOT EXISTS deliverable_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS deliverables_count INTEGER DEFAULT 0;

-- gamer_profiles: stats tracking
ALTER TABLE public.gamer_profiles
  ADD COLUMN IF NOT EXISTS total_matches INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_wins INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tournaments_played INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tournaments_won INTEGER DEFAULT 0;

-- teams: customization + stats
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS banner_image TEXT,
  ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#ff1a1a',
  ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#0a0a0a',
  ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{"wins":0,"losses":0,"tournaments_played":0}';

-- tournaments: custom signup page + stream
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS signup_banner TEXT,
  ADD COLUMN IF NOT EXISTS signup_description TEXT,
  ADD COLUMN IF NOT EXISTS signup_rules TEXT,
  ADD COLUMN IF NOT EXISTS signup_custom_fields JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS stream_embed_url TEXT;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_gamer_achievements_user_id ON public.gamer_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_gig_request ON public.deliverables(gig_request_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_tournament ON public.deliverables(tournament_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_assigned ON public.deliverables(assigned_to);
CREATE INDEX IF NOT EXISTS idx_organizer_page_config_org ON public.organizer_page_config(organizer_id);

-- ============================================================================
-- SEED DATA: Default achievements
-- ============================================================================

INSERT INTO public.achievements (key, title, description, icon, category, criteria) VALUES
  ('first_tournament', 'First Steps', 'Joined your first tournament', '🎮', 'tournament', '{"type":"tournaments_played","count":1}'),
  ('first_win', 'Victory!', 'Won your first match', '🏆', 'tournament', '{"type":"wins","count":1}'),
  ('tournament_champion', 'Champion', 'Won a tournament', '👑', 'tournament', '{"type":"tournaments_won","count":1}'),
  ('team_creator', 'Team Builder', 'Created your first team', '🛡️', 'team', '{"type":"teams_created","count":1}'),
  ('five_tournaments', 'Veteran', 'Played in 5 tournaments', '⭐', 'milestone', '{"type":"tournaments_played","count":5}'),
  ('ten_wins', 'Unstoppable', 'Won 10 matches', '🔥', 'milestone', '{"type":"wins","count":10}'),
  ('three_teams', 'Multi-Roster', 'Member of 3 different teams', '🎯', 'team', '{"type":"teams_joined","count":3}')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- SEED DATA: Builder sponsor defaults
-- ============================================================================

INSERT INTO public.app_settings (setting_key, setting_value, description) VALUES
  ('builder_sponsor_defaults', '{"required_branding":[],"required_talent_count":2,"required_production":[]}', 'Default required items when building a sponsored tournament'),
  ('builder_min_branding', '1', 'Minimum branding items for sponsored tournaments'),
  ('builder_min_talent', '2', 'Minimum talent hires for sponsored tournaments'),
  ('builder_min_production', '1', 'Minimum production items for sponsored tournaments')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- RLS POLICIES for new tables
-- ============================================================================

ALTER TABLE public.organizer_page_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamer_achievements ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (backend uses service role key)
CREATE POLICY "service_role_all" ON public.organizer_page_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON public.deliverables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON public.team_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON public.achievements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON public.gamer_achievements FOR ALL USING (true) WITH CHECK (true);

-- Public read access for achievements and team_members
CREATE POLICY "public_read" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "public_read" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "public_read" ON public.gamer_achievements FOR SELECT USING (true);
CREATE POLICY "public_read" ON public.organizer_page_config FOR SELECT USING (true);
