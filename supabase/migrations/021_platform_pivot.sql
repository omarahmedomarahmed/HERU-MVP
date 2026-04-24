-- ============================================================
-- 021_platform_pivot.sql
-- Platform pivot: 3-stakeholder → 4-stakeholder (Gamer / Organizer / Sponsor / Service Provider)
-- ============================================================

ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_role_check
    CHECK (role IN ('gamer','organizer','sponsor','service_provider','admin'));

ALTER TABLE gamer_profiles
  DROP COLUMN IF EXISTS is_talent,
  DROP COLUMN IF EXISTS talent_type,
  DROP COLUMN IF EXISTS talent_price,
  DROP COLUMN IF EXISTS talent_rating,
  DROP COLUMN IF EXISTS talent_video_link;

ALTER TABLE tournaments
  DROP COLUMN IF EXISTS tournament_type,
  DROP COLUMN IF EXISTS co_organizers,
  DROP COLUMN IF EXISTS on_radar,
  DROP COLUMN IF EXISTS sponsorship_radar_id,
  DROP COLUMN IF EXISTS radar_funding_percent,
  DROP COLUMN IF EXISTS required_branding_committed;

ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS sponsorship_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS total_sponsorship_raised NUMERIC DEFAULT 0;

CREATE TABLE IF NOT EXISTS sponsor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users UNIQUE NOT NULL,
  brand_name TEXT,
  brand_logo TEXT,
  industry TEXT,
  description TEXT,
  website TEXT,
  location TEXT,
  social_links JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  subscription_plan TEXT CHECK (subscription_plan IN ('free','pro','enterprise')) DEFAULT 'free',
  subscription_status TEXT CHECK (subscription_status IN ('active','expired','cancelled')),
  subscription_renewal_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users UNIQUE NOT NULL,
  display_name TEXT,
  avatar TEXT,
  bio TEXT,
  categories TEXT[] DEFAULT '{}',
  is_approved BOOLEAN DEFAULT FALSE,
  approval_status TEXT CHECK (approval_status IN ('pending','approved','rejected')) DEFAULT 'pending',
  rating NUMERIC DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  portfolio_url TEXT,
  portfolio_description TEXT,
  years_experience INTEGER,
  completed_projects INTEGER DEFAULT 0,
  social_links JSONB DEFAULT '{}',
  is_discord_server BOOLEAN DEFAULT FALSE,
  discord_server_invite TEXT,
  discord_server_member_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES service_categories(id),
  sort_order INTEGER DEFAULT 0
);

INSERT INTO service_categories (id, name, sort_order) VALUES
  ('00000000-0000-0000-0001-000000000001', 'Branding', 1),
  ('00000000-0000-0000-0001-000000000002', 'Production', 2),
  ('00000000-0000-0000-0001-000000000003', 'Talent', 3),
  ('00000000-0000-0000-0001-000000000004', 'Venue', 4),
  ('00000000-0000-0000-0001-000000000005', 'Marketing', 5)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES service_provider_profiles NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('branding','production','talent','venue','marketing')) NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  price_type TEXT CHECK (price_type IN ('fixed','per_day','per_event')) DEFAULT 'fixed',
  deliverables JSONB DEFAULT '[]',
  portfolio_url TEXT,
  portfolio_images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT FALSE,
  rating NUMERIC DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services NOT NULL,
  provider_id UUID REFERENCES auth.users NOT NULL,
  organizer_id UUID REFERENCES auth.users NOT NULL,
  tournament_id UUID REFERENCES tournaments,
  tournament_name TEXT,
  price NUMERIC NOT NULL,
  heru_fee NUMERIC NOT NULL,
  net_to_provider NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending','accepted','rejected','completed','cancelled')) DEFAULT 'pending',
  escrow_status TEXT CHECK (escrow_status IN ('held','released','refunded')) DEFAULT 'held',
  payment_held_at TIMESTAMPTZ,
  payment_released_at TIMESTAMPTZ,
  chat JSONB DEFAULT '[]',
  file_library JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sponsorship_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments NOT NULL,
  organizer_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  deliverables JSONB DEFAULT '[]',
  marketing_channels JSONB DEFAULT '[]',
  expected_reach INTEGER,
  expected_impressions INTEGER,
  expected_views INTEGER,
  social_posts_count INTEGER,
  logo_placement TEXT,
  on_site_presence BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES sponsorship_packages NOT NULL,
  tournament_id UUID REFERENCES tournaments NOT NULL,
  sponsor_id UUID REFERENCES auth.users NOT NULL,
  sponsor_brand TEXT,
  amount NUMERIC NOT NULL,
  heru_fee NUMERIC NOT NULL,
  net_to_organizer NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending','paid','active','completed','cancelled')) DEFAULT 'pending',
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_interval TEXT CHECK (recurrence_interval IN ('monthly','per_season')),
  paymob_order_id TEXT,
  paymob_transaction_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES auth.users NOT NULL,
  plan TEXT CHECK (plan IN ('pro','enterprise')) NOT NULL,
  status TEXT CHECK (status IN ('active','expired','cancelled')) DEFAULT 'active',
  amount NUMERIC NOT NULL,
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly','annual')) DEFAULT 'monthly',
  renewal_date DATE,
  paymob_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES service_bookings UNIQUE NOT NULL,
  reviewer_id UUID REFERENCES auth.users NOT NULL,
  provider_id UUID REFERENCES auth.users NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_provider_rating(p_provider_id UUID)
RETURNS void AS $$
  UPDATE service_provider_profiles
  SET rating = (
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM reviews
    WHERE provider_id = p_provider_id
  )
  WHERE user_id = p_provider_id;
$$ LANGUAGE sql;

CREATE TABLE IF NOT EXISTS tournament_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments NOT NULL,
  organizer_id UUID REFERENCES auth.users NOT NULL,
  total_views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  report_file_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organizer_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES auth.users NOT NULL,
  documents JSONB DEFAULT '[]',
  past_tournament_links TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  brand_deck_url TEXT,
  status TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS heru_revenue_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT CHECK (source_type IN ('service_booking', 'sponsorship', 'subscription')) NOT NULL,
  source_id UUID NOT NULL,
  gross_amount NUMERIC NOT NULL,
  heru_fee NUMERIC NOT NULL,
  net_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'EGP',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  is_published BOOLEAN DEFAULT TRUE,
  updated_by UUID REFERENCES auth.users,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO cms_pages (slug, title, content) VALUES
  ('home', 'Homepage', '{"hero_title":"The Operating System for Esports in MENA","hero_subtitle":"Build. Compete. Sponsor. Earn."}'),
  ('for-gamers', 'For Gamers', '{"hero_title":"Compete. Win. Rise."}'),
  ('for-organizers', 'For Organizers', '{"hero_title":"Build Pro Tournaments in Minutes."}'),
  ('for-sponsors', 'For Sponsors', '{"hero_title":"Put Your Brand at the Center of Esports."}'),
  ('for-providers', 'For Service Providers', '{"hero_title":"Get Booked. Build Your Portfolio. Earn."}')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS consultant_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES auth.users NOT NULL,
  request_details TEXT,
  preferred_date TIMESTAMPTZ,
  status TEXT CHECK (status IN ('pending','scheduled','completed','cancelled')) DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_approved ON services(is_approved);
CREATE INDEX IF NOT EXISTS idx_service_bookings_organizer ON service_bookings(organizer_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_provider ON service_bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON service_bookings(status);
CREATE INDEX IF NOT EXISTS idx_sponsorship_packages_tournament ON sponsorship_packages(tournament_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_sponsor ON sponsorships(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_revenue_ledger_source ON heru_revenue_ledger(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_sponsorship_enabled ON tournaments(sponsorship_enabled);

ALTER TABLE sponsor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sponsor_own_profile" ON sponsor_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "sponsor_profiles_public_read" ON sponsor_profiles FOR SELECT USING (true);

ALTER TABLE service_provider_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "provider_own_profile" ON service_provider_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "provider_profiles_public_read" ON service_provider_profiles FOR SELECT USING (true);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_public_read" ON services FOR SELECT USING (is_active = true AND is_approved = true);
CREATE POLICY "services_provider_manage" ON services FOR ALL USING (
  provider_id IN (SELECT id FROM service_provider_profiles WHERE user_id = auth.uid())
);

ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_bookings_organizer" ON service_bookings FOR ALL USING (organizer_id = auth.uid());
CREATE POLICY "service_bookings_provider" ON service_bookings FOR ALL USING (provider_id = auth.uid());

ALTER TABLE sponsorship_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "packages_public_read" ON sponsorship_packages FOR SELECT USING (is_active = true);
CREATE POLICY "packages_organizer_manage" ON sponsorship_packages FOR ALL USING (organizer_id = auth.uid());

ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sponsorships_sponsor" ON sponsorships FOR ALL USING (sponsor_id = auth.uid());

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_organizer_write" ON reviews FOR INSERT WITH CHECK (reviewer_id = auth.uid());

ALTER TABLE heru_revenue_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cms_public_read" ON cms_pages FOR SELECT USING (is_published = true);
