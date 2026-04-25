-- ============================================================
-- HERU.gg — Fresh Schema: Sponsors, Packages & Revenue
-- Migration: 104_fresh_schema_sponsors.sql
-- ============================================================

-- ============================================================
-- SECTION 1: SPONSOR PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS sponsor_profiles (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID UNIQUE NOT NULL,
  brand_name     TEXT NOT NULL,
  brand_logo     TEXT,
  industry       TEXT,
  website        TEXT,
  description    TEXT,
  contact_name   TEXT,
  contact_email  TEXT,
  country        TEXT,
  total_spent    NUMERIC(14,2) DEFAULT 0,
  active_sponsorships INT DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sponsor subscriptions (Pro / Enterprise tiers)
CREATE TABLE IF NOT EXISTS subscriptions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_id     UUID NOT NULL REFERENCES sponsor_profiles(id) ON DELETE CASCADE,
  tier           TEXT NOT NULL CHECK (tier IN ('pro','enterprise')),
  price_egp      NUMERIC(10,2) NOT NULL,
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled','expired')),
  started_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at     TIMESTAMPTZ,
  cancelled_at   TIMESTAMPTZ,
  payment_ref    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SECTION 2: SPONSORSHIP PACKAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS sponsorship_packages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id   UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  organizer_id    UUID NOT NULL,
  name            TEXT NOT NULL,
  tier            TEXT DEFAULT 'gold' CHECK (tier IN ('title','gold','silver','bronze','custom')),
  price           NUMERIC(12,2) NOT NULL,
  description     TEXT,
  deliverables    JSONB DEFAULT '[]',
  -- Reach metrics (auto-calculated from tournament context)
  estimated_reach INT DEFAULT 0,
  estimated_views INT DEFAULT 0,
  -- Placement details
  online_placements  JSONB DEFAULT '{}',  -- stream overlays, social posts
  offline_placements JSONB DEFAULT '{}',  -- banners, jersey logos
  is_exclusive    BOOLEAN NOT NULL DEFAULT FALSE,
  max_sponsors    INT DEFAULT 1,
  sold_count      INT NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','sold_out','disabled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SECTION 3: SPONSORSHIPS (purchases)
-- ============================================================

CREATE TABLE IF NOT EXISTS sponsorships (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id       UUID NOT NULL REFERENCES sponsorship_packages(id) ON DELETE RESTRICT,
  tournament_id    UUID NOT NULL REFERENCES tournaments(id) ON DELETE RESTRICT,
  sponsor_id       UUID NOT NULL REFERENCES sponsor_profiles(id) ON DELETE RESTRICT,
  organizer_id     UUID NOT NULL,
  amount           NUMERIC(12,2) NOT NULL,
  platform_fee     NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_to_organizer NUMERIC(12,2) NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','paid','active','completed','refunded','cancelled')),
  deliverables_delivered JSONB DEFAULT '[]',
  report_id        UUID REFERENCES tournament_reports(id),
  payment_ref      TEXT,
  paid_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SECTION 4: MANAGED SERVICES (sponsor consultancy requests)
-- ============================================================

CREATE TABLE IF NOT EXISTS managed_service_projects (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_id       UUID NOT NULL REFERENCES sponsor_profiles(id) ON DELETE RESTRICT,
  title            TEXT NOT NULL,
  description      TEXT,
  budget           NUMERIC(12,2),
  status           TEXT NOT NULL DEFAULT 'submitted'
                   CHECK (status IN ('submitted','reviewing','proposal_sent','approved','in_progress','completed','cancelled')),
  consultant_id    UUID,
  proposal_text    TEXT,
  proposal_amount  NUMERIC(12,2),
  deliverables     JSONB DEFAULT '[]',
  chat             JSONB DEFAULT '[]',
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SECTION 5: HERU REVENUE LEDGER
-- ============================================================

CREATE TABLE IF NOT EXISTS heru_revenue_ledger (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream          TEXT NOT NULL
                  CHECK (stream IN ('service_booking','sponsorship','subscription','coaching','other')),
  entity_type     TEXT NOT NULL,
  entity_id       UUID NOT NULL,
  gross_amount    NUMERIC(12,2) NOT NULL,
  fee_percent     NUMERIC(5,2) NOT NULL DEFAULT 15,
  heru_fee        NUMERIC(12,2) NOT NULL,
  net_to_party    NUMERIC(12,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'EGP',
  description     TEXT,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: auto-calculate heru_fee and net_to_party
CREATE OR REPLACE FUNCTION calculate_revenue_split()
RETURNS TRIGGER AS $$
BEGIN
  NEW.heru_fee = ROUND(NEW.gross_amount * NEW.fee_percent / 100, 2);
  NEW.net_to_party = NEW.gross_amount - NEW.heru_fee;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_revenue ON heru_revenue_ledger;
CREATE TRIGGER trg_calculate_revenue
  BEFORE INSERT OR UPDATE ON heru_revenue_ledger
  FOR EACH ROW EXECUTE FUNCTION calculate_revenue_split();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_user_id ON sponsor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_sponsor_id ON subscriptions(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_sponsorship_packages_tournament_id ON sponsorship_packages(tournament_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_packages_status ON sponsorship_packages(status);
CREATE INDEX IF NOT EXISTS idx_sponsorships_sponsor_id ON sponsorships(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_tournament_id ON sponsorships(tournament_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_status ON sponsorships(status);
CREATE INDEX IF NOT EXISTS idx_managed_service_projects_sponsor_id ON managed_service_projects(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_managed_service_projects_status ON managed_service_projects(status);
CREATE INDEX IF NOT EXISTS idx_heru_revenue_ledger_stream ON heru_revenue_ledger(stream);
CREATE INDEX IF NOT EXISTS idx_heru_revenue_ledger_recorded_at ON heru_revenue_ledger(recorded_at DESC);
