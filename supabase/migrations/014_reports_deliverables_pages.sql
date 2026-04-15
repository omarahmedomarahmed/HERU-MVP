-- ============================================================================
-- 014: Tournament reports, deliverables, and organizer page config
-- ============================================================================

-- tournament_reports — post-tournament analytics reports
CREATE TABLE IF NOT EXISTS public.tournament_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  organizer_id UUID REFERENCES auth.users(id),
  is_published BOOLEAN DEFAULT FALSE,

  -- Executive Summary
  executive_summary TEXT,
  summary_image TEXT,

  -- Brand Awareness & Reach
  total_registrations INTEGER DEFAULT 0,
  total_teams INTEGER DEFAULT 0,
  countries_represented INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  awareness_image TEXT,

  -- Audience Engagement
  total_matches INTEGER DEFAULT 0,
  average_match_duration TEXT,
  audience_peak INTEGER DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  engagement_image TEXT,

  -- Live Stream Performance
  stream_platform TEXT,
  stream_link TEXT,
  peak_viewers INTEGER DEFAULT 0,
  average_viewers INTEGER DEFAULT 0,
  total_watch_time TEXT,
  stream_image TEXT,

  -- Social Media Performance
  total_impressions INTEGER DEFAULT 0,
  total_reach INTEGER DEFAULT 0,
  total_engagements INTEGER DEFAULT 0,
  follower_growth INTEGER DEFAULT 0,
  social_image TEXT,
  social_links JSONB DEFAULT '[]',

  -- Content Deliverables
  photos_delivered INTEGER DEFAULT 0,
  videos_delivered INTEGER DEFAULT 0,
  reels_created INTEGER DEFAULT 0,
  stories_posted INTEGER DEFAULT 0,
  content_image TEXT,

  -- HERU Platform Growth
  heru_new_signups INTEGER DEFAULT 0,
  heru_page_views INTEGER DEFAULT 0,
  heru_tournament_entries INTEGER DEFAULT 0,
  platform_image TEXT,

  -- Supporting screenshots
  screenshots JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- deliverables — gig talent deliverable tracking
CREATE TABLE IF NOT EXISTS public.deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_request_id UUID REFERENCES public.gig_requests ON DELETE CASCADE NOT NULL,
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

-- organizer_page_config — public profile page customization
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
