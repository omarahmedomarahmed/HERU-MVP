-- ============================================================================
-- Migration 011: prize_breakdown, prizepool_coins, brand_banner, tournament_reports
-- ============================================================================

-- -------------------------------------------------------------------
-- Tournaments: add prize breakdown fields
-- -------------------------------------------------------------------
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS prize_breakdown JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS prizepool_coins  INTEGER DEFAULT 0;

-- -------------------------------------------------------------------
-- Organizer profiles: add brand banner
-- -------------------------------------------------------------------
ALTER TABLE public.organizer_profiles
  ADD COLUMN IF NOT EXISTS brand_banner TEXT;

-- -------------------------------------------------------------------
-- Tournament reports table
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tournament_reports (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id            UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  organizer_id             UUID REFERENCES auth.users(id),
  is_published             BOOLEAN DEFAULT FALSE,

  -- Executive Summary
  executive_summary        TEXT,
  summary_image            TEXT,

  -- Brand Awareness & Reach
  total_registrations      INTEGER DEFAULT 0,
  total_teams              INTEGER DEFAULT 0,
  countries_represented    INTEGER DEFAULT 0,
  unique_visitors          INTEGER DEFAULT 0,
  awareness_image          TEXT,

  -- Audience Engagement
  total_matches            INTEGER DEFAULT 0,
  average_match_duration   TEXT,
  audience_peak            INTEGER DEFAULT 0,
  engagement_rate          NUMERIC DEFAULT 0,
  engagement_image         TEXT,

  -- Live Stream Performance
  stream_platform          TEXT,
  stream_link              TEXT,
  peak_viewers             INTEGER DEFAULT 0,
  average_viewers          INTEGER DEFAULT 0,
  total_watch_time         TEXT,
  stream_image             TEXT,

  -- Social Media Performance
  total_impressions        INTEGER DEFAULT 0,
  total_reach              INTEGER DEFAULT 0,
  total_engagements        INTEGER DEFAULT 0,
  follower_growth          INTEGER DEFAULT 0,
  social_image             TEXT,
  social_links             JSONB DEFAULT '[]',   -- [{platform, url, followers, reach}]

  -- Content Deliverables
  photos_delivered         INTEGER DEFAULT 0,
  videos_delivered         INTEGER DEFAULT 0,
  reels_created            INTEGER DEFAULT 0,
  stories_posted           INTEGER DEFAULT 0,
  content_image            TEXT,

  -- HERU Platform Growth
  heru_new_signups         INTEGER DEFAULT 0,
  heru_page_views          INTEGER DEFAULT 0,
  heru_tournament_entries  INTEGER DEFAULT 0,
  platform_image           TEXT,

  -- Supporting screenshots (array of {category, image_url, caption})
  screenshots              JSONB DEFAULT '[]',

  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------------
-- RLS for tournament_reports
-- -------------------------------------------------------------------
ALTER TABLE public.tournament_reports ENABLE ROW LEVEL SECURITY;

-- Public can read published reports
CREATE POLICY "tournament_reports_public_read"
  ON public.tournament_reports FOR SELECT
  USING (is_published = TRUE);

-- Organizer can read their own reports (published or not)
CREATE POLICY "tournament_reports_owner_read"
  ON public.tournament_reports FOR SELECT
  TO authenticated
  USING (organizer_id = auth.uid());

-- Organizer can insert their own reports
CREATE POLICY "tournament_reports_owner_insert"
  ON public.tournament_reports FOR INSERT
  TO authenticated
  WITH CHECK (organizer_id = auth.uid());

-- Organizer can update their own reports
CREATE POLICY "tournament_reports_owner_update"
  ON public.tournament_reports FOR UPDATE
  TO authenticated
  USING (organizer_id = auth.uid());

-- Organizer can delete their own reports
CREATE POLICY "tournament_reports_owner_delete"
  ON public.tournament_reports FOR DELETE
  TO authenticated
  USING (organizer_id = auth.uid());

-- -------------------------------------------------------------------
-- Indexes
-- -------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tournament_reports_tournament
  ON public.tournament_reports(tournament_id);

CREATE INDEX IF NOT EXISTS idx_tournament_reports_organizer
  ON public.tournament_reports(organizer_id);

CREATE INDEX IF NOT EXISTS idx_tournament_reports_published
  ON public.tournament_reports(is_published)
  WHERE is_published = TRUE;
