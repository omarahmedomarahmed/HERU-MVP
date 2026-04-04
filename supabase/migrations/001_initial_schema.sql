-- =============================================
-- HERU.gg Platform — Initial Schema (16 tables)
-- Migration 001
-- =============================================

-- 1. user_profiles (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('gamer','organizer','admin')) DEFAULT 'gamer',
  full_name TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  disabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. gamer_profiles
CREATE TABLE public.gamer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  username TEXT,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. organizer_profiles
CREATE TABLE public.organizer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  brand_name TEXT,
  brand_logo TEXT,
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

-- 4. teams
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo TEXT,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. tournaments
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  game TEXT,
  tournament_image TEXT,
  organizer_id UUID REFERENCES auth.users,
  main_organizer_id UUID REFERENCES auth.users,
  organizer_brand JSONB,
  tournament_type TEXT CHECK (tournament_type IN ('solo','shared')) DEFAULT 'solo',
  status TEXT CHECK (status IN ('draft','published','live','completed')) DEFAULT 'draft',
  format TEXT,
  max_teams INTEGER,
  schedule TIMESTAMPTZ,
  description TEXT,
  is_offline BOOLEAN DEFAULT FALSE,
  venue TEXT,
  teams TEXT[] DEFAULT '{}',
  invited_teams TEXT[] DEFAULT '{}',
  join_requests JSONB DEFAULT '[]',
  talents JSONB DEFAULT '[]',
  branding_items TEXT[] DEFAULT '{}',
  production_items TEXT[] DEFAULT '{}',
  prizepool_items TEXT[] DEFAULT '{}',
  venue_items TEXT[] DEFAULT '{}',
  total_cost NUMERIC DEFAULT 0,
  prizepool_total NUMERIC DEFAULT 0,
  platform_fee NUMERIC DEFAULT 0,
  platform_fee_percent NUMERIC DEFAULT 15,
  prizepool_in_total_cost BOOLEAN DEFAULT TRUE,
  on_radar BOOLEAN DEFAULT FALSE,
  sponsorship_radar_id UUID,
  radar_funding_percent NUMERIC DEFAULT 0,
  required_branding_committed BOOLEAN DEFAULT FALSE,
  co_organizers JSONB DEFAULT '[]',
  organizer_chat JSONB DEFAULT '[]',
  brackets JSONB DEFAULT '[]',
  support_chat JSONB DEFAULT '[]',
  general_chat JSONB DEFAULT '[]',
  stream_link TEXT,
  tournament_log JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. marketplace_items
CREATE TABLE public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('game_setup','teams','live_talent','production','branding','venue','prizepool')),
  type TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  image TEXT,
  talent_user_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  stock INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gamer_id UUID REFERENCES auth.users,
  organizer_id UUID REFERENCES auth.users,
  order_type TEXT CHECK (order_type IN ('marketplace','tournament')) DEFAULT 'marketplace',
  tournament_id UUID REFERENCES public.tournaments,
  tournament_name TEXT,
  tournament_type TEXT,
  items JSONB DEFAULT '[]',
  total NUMERIC DEFAULT 0,
  status TEXT CHECK (status IN ('pending','processing','completed','cancelled')) DEFAULT 'pending',
  shipping_address JSONB,
  support_chat JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. tournament_orders
CREATE TABLE public.tournament_orders (
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

-- 9. sponsorship_radar
CREATE TABLE public.sponsorship_radar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments,
  tournament_name TEXT,
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

-- 10. gig_requests
CREATE TABLE public.gig_requests (
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. bills
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_number TEXT UNIQUE NOT NULL,
  bill_type TEXT CHECK (bill_type IN ('gamer','organizer','co_organizer')) NOT NULL,
  tournament_id TEXT,
  tournament_name TEXT,
  tournament_order_id TEXT,
  payer_id TEXT NOT NULL,
  payer_type TEXT,
  payer_name TEXT,
  payer_email TEXT,
  items JSONB DEFAULT '[]',
  subtotal NUMERIC DEFAULT 0,
  platform_fee NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  grand_total NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  payment_status TEXT CHECK (payment_status IN ('unpaid','partial','paid','overdue')) DEFAULT 'unpaid',
  due_date DATE,
  paid_date DATE,
  payment_method TEXT,
  paymob_order_id TEXT,
  paymob_transaction_id TEXT,
  notes TEXT,
  shared_tournament BOOLEAN DEFAULT FALSE,
  shared_bill_ref TEXT,
  total_tournament_cost NUMERIC,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. billing_snapshots
CREATE TABLE public.billing_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments,
  tournament_name TEXT,
  tournament_type TEXT,
  organizer_id TEXT,
  organizer_brand_name TEXT,
  organizer_brand_logo TEXT,
  billing_type TEXT CHECK (billing_type IN ('main_organizer','shared_co')),
  commitment_percent NUMERIC,
  amount_due NUMERIC NOT NULL,
  amount_paid NUMERIC DEFAULT 0,
  payment_status TEXT CHECK (payment_status IN ('unpaid','paid','partial')) DEFAULT 'unpaid',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. approval_requests
CREATE TABLE public.approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_type TEXT CHECK (approval_type IN ('team_join','tournament_publish','talent_application')) NOT NULL,
  requester_id UUID REFERENCES auth.users NOT NULL,
  requester_name TEXT,
  requester_email TEXT,
  reference_id TEXT NOT NULL,
  reference_name TEXT,
  details JSONB DEFAULT '{}',
  status TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. staff_access_keys
CREATE TABLE public.staff_access_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_key TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  staff_email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. staff_sessions
CREATE TABLE public.staff_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  staff_email TEXT NOT NULL,
  staff_name TEXT,
  access_key_id UUID REFERENCES public.staff_access_keys,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. app_settings
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
