-- ============================================================================
-- 009: Gig requests — talent booking workflow for tournaments
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.gig_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_user_id TEXT NOT NULL,
  organizer_id UUID REFERENCES auth.users,
  organizer_brand TEXT,
  tournament_id UUID REFERENCES public.tournaments,
  tournament_name TEXT,
  talent_type TEXT,
  price NUMERIC,
  status TEXT CHECK (status IN ('pending','accepted','rejected','completed')) DEFAULT 'pending',
  chat JSONB DEFAULT '[]',
  file_library JSONB DEFAULT '[]',
  notes TEXT,
  deliverable_status TEXT DEFAULT 'pending',
  deliverables_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
