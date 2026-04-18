-- Add chat_messages column to teams table
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS chat_messages JSONB DEFAULT '[]';

-- Add participant_type and player_participants to tournaments if missing
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS participant_type TEXT DEFAULT 'team',
  ADD COLUMN IF NOT EXISTS player_participants JSONB DEFAULT '[]';

-- Add promo_code_used and discount_applied to orders (so they can be stored if desired)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS promo_code_used TEXT,
  ADD COLUMN IF NOT EXISTS discount_applied NUMERIC DEFAULT 0;

-- Create games table for game selection dropdown
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT,
  image TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed common games
INSERT INTO public.games (name, slug, sort_order) VALUES
  ('Valorant', 'valorant', 1),
  ('CS2', 'cs2', 2),
  ('League of Legends', 'league-of-legends', 3),
  ('Dota 2', 'dota-2', 4),
  ('Rocket League', 'rocket-league', 5),
  ('Apex Legends', 'apex-legends', 6),
  ('Fortnite', 'fortnite', 7),
  ('Call of Duty', 'call-of-duty', 8),
  ('Rainbow Six Siege', 'rainbow-six-siege', 9),
  ('Overwatch 2', 'overwatch-2', 10),
  ('FIFA / EA FC', 'ea-fc', 11),
  ('PUBG', 'pubg', 12),
  ('Mobile Legends', 'mobile-legends', 13),
  ('Free Fire', 'free-fire', 14)
ON CONFLICT (name) DO NOTHING;

-- Create achievements and gamer_achievements tables if missing
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  criteria JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gamer_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id UUID REFERENCES public.achievements,
  tournament_id UUID,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create team_members table if missing
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'player',
  custom_role TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);
