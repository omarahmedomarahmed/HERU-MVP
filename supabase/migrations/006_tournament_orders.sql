-- ============================================================================
-- 006: Tournament orders — fulfillment tracking for tournament costs
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tournament_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments,
  tournament_name TEXT,
  tournament_type TEXT CHECK (tournament_type IN ('solo','shared')) DEFAULT 'solo',
  main_organizer_id UUID REFERENCES auth.users,
  main_organizer_brand TEXT,
  co_organizers JSONB DEFAULT '[]',
  items JSONB DEFAULT '[]',
  subtotal_items NUMERIC DEFAULT 0,
  prizepool_amount NUMERIC DEFAULT 0,
  platform_fee NUMERIC DEFAULT 0,
  grand_total NUMERIC DEFAULT 0,
  main_organizer_owes NUMERIC DEFAULT 0,
  fulfillment_status TEXT CHECK (fulfillment_status IN ('draft','pending_payment','in_fulfillment','fulfilled','cancelled')) DEFAULT 'draft',
  staff_notes TEXT,
  internal_chat JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
