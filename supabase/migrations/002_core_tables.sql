-- ============================================================================
-- 002: Core user tables — user_profiles, gamer_profiles, organizer_profiles
-- These are the three profile types that extend Supabase Auth's auth.users.
-- ============================================================================

-- user_profiles extends auth.users with application-specific fields
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('gamer','organizer','admin')) DEFAULT 'gamer',
  full_name TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  disabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- gamer_profiles — one per gamer user
CREATE TABLE IF NOT EXISTS public.gamer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  username TEXT,
  username_slug TEXT UNIQUE,
  avatar TEXT,
  bio TEXT,
  is_talent BOOLEAN DEFAULT FALSE,
  talent_type TEXT,
  talent_price NUMERIC,
  talent_rating NUMERIC,
  talent_video_link TEXT,
  games JSONB DEFAULT '[]',
  team_ids TEXT[] DEFAULT '{}',
  purchased_items JSONB DEFAULT '[]',
  notifications JSONB DEFAULT '[]',
  tournament_invites JSONB DEFAULT '[]',
  payment_methods JSONB DEFAULT '[]',
  billing_address JSONB DEFAULT '{}',
  total_matches INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  tournaments_played INTEGER DEFAULT 0,
  tournaments_won INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- organizer_profiles — one per organizer user
CREATE TABLE IF NOT EXISTS public.organizer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  brand_name TEXT,
  brand_logo TEXT,
  brand_banner TEXT,
  primary_color TEXT DEFAULT '#ff1a1a',
  secondary_color TEXT DEFAULT '#0a0a0a',
  description TEXT,
  bio TEXT,
  location TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  rating NUMERIC,
  total_tournaments_organized INTEGER DEFAULT 0,
  co_organized_tournaments TEXT[] DEFAULT '{}',
  featured_games TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  tournaments TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
