-- ============================================================================
-- 008: Sponsorship Radar — shared tournament co-organizer marketplace
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sponsorship_radar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments,
  tournament_name TEXT,
  tournament_image TEXT,
  main_organizer_id UUID REFERENCES auth.users,
  main_organizer_brand JSONB,
  game TEXT,
  schedule TEXT,
  description TEXT,
  total_cost NUMERIC NOT NULL,
  prizepool_amount NUMERIC DEFAULT 0,
  main_organizer_contribution NUMERIC,
  main_organizer_percent NUMERIC DEFAULT 33,
  amount_still_needed NUMERIC DEFAULT 0,
  funding_percent NUMERIC DEFAULT 0,
  max_co_organizers INTEGER DEFAULT 2,
  status TEXT CHECK (status IN ('open','in_progress','fully_funded','closed')) DEFAULT 'open',
  co_organizers JSONB DEFAULT '[]',
  required_branding_items TEXT[] DEFAULT '{}',
  branding_committed BOOLEAN DEFAULT FALSE,
  order_breakdown JSONB DEFAULT '[]',
  minimum_commitment_warning TEXT DEFAULT 'Minimum commitment is 33% of total tournament cost',
  chat JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- radar_views — tracks which organizers viewed which radar entries
CREATE TABLE IF NOT EXISTS public.radar_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  radar_id UUID REFERENCES public.sponsorship_radar(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id),
  viewer_brand_name TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
