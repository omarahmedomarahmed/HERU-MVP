-- ============================================================
-- HERU.gg — Sponsors Schema
-- Migration: 104_sponsors.sql
-- Tables: sponsor_profiles, subscriptions,
--         sponsorship_packages, sponsorships,
--         managed_service_projects, heru_revenue_ledger
-- ============================================================

-- ============================================================
-- SPONSOR PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS sponsor_profiles (
  id                          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                     UUID        UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  brand_name                  TEXT        NOT NULL,
  brand_logo                  TEXT,
  industry                    TEXT,
  website                     TEXT,
  description                 TEXT,
  contact_name                TEXT,
  contact_email               TEXT,
  country                     TEXT,
  total_spent                 NUMERIC(14,2) DEFAULT 0,
  active_sponsorships         INT         DEFAULT 0,
  -- Subscription state (denormalised for quick reads)
  subscription_plan           TEXT        DEFAULT 'free',
  subscription_status         TEXT        DEFAULT 'inactive',
  subscription_renewal_date   DATE,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_user_id ON sponsor_profiles(user_id);

-- ============================================================
-- SUBSCRIPTIONS
-- Free / Community / Premium plans (EGP 0 / 150K / 300K /mo)
-- ============================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_id    UUID        NOT NULL REFERENCES sponsor_profiles(id) ON DELETE CASCADE,
  -- canonical columns (used by backend routes)
  plan          TEXT        NOT NULL CHECK (plan IN ('free','community','premium','starter','growth')),
  amount        NUMERIC(10,2) NOT NULL,
  billing_cycle TEXT        NOT NULL DEFAULT 'monthly'
                CHECK (billing_cycle IN ('monthly','annual')),
  renewal_date  DATE,
  status        TEXT        NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','cancelled','expired')),
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ,
  cancelled_at  TIMESTAMPTZ,
  payment_ref   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_sponsor_id ON subscriptions(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status     ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan       ON subscriptions(plan);

-- ============================================================
-- SPONSORSHIP PACKAGES
-- Organizer-defined packages attached to a tournament
-- Sponsors see these on the Radar — never tournament costs
-- ============================================================

CREATE TABLE IF NOT EXISTS sponsorship_packages (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id       UUID        NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  organizer_id        UUID        NOT NULL REFERENCES user_profiles(id),
  name                TEXT        NOT NULL,
  tier                TEXT        DEFAULT 'gold'
                      CHECK (tier IN ('title','gold','silver','bronze','custom')),
  price               NUMERIC(12,2) NOT NULL,
  description         TEXT,
  deliverables        JSONB       DEFAULT '[]',
  estimated_reach     INT         DEFAULT 0,
  estimated_views     INT         DEFAULT 0,
  online_placements   JSONB       DEFAULT '{}',
  offline_placements  JSONB       DEFAULT '{}',
  is_exclusive        BOOLEAN     NOT NULL DEFAULT FALSE,
  max_sponsors        INT         DEFAULT 1,
  sold_count          INT         NOT NULL DEFAULT 0,
  status              TEXT        NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','sold_out','disabled')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sponsorship_packages_tournament_id
  ON sponsorship_packages(tournament_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_packages_status
  ON sponsorship_packages(status);

-- ============================================================
-- SPONSORSHIPS (purchases)
-- Sponsor buys a package — net_to_organizer after 15% fee
-- ============================================================

CREATE TABLE IF NOT EXISTS sponsorships (
  id                     UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id             UUID        NOT NULL REFERENCES sponsorship_packages(id) ON DELETE RESTRICT,
  tournament_id          UUID        NOT NULL REFERENCES tournaments(id) ON DELETE RESTRICT,
  sponsor_id             UUID        NOT NULL REFERENCES sponsor_profiles(id) ON DELETE RESTRICT,
  organizer_id           UUID        NOT NULL REFERENCES user_profiles(id),
  amount                 NUMERIC(12,2) NOT NULL,
  platform_fee           NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_to_organizer       NUMERIC(12,2) NOT NULL DEFAULT 0,
  -- Denormalised for billing and reports
  package_name           TEXT,
  sponsor_brand          TEXT,
  tournament_name        TEXT,
  status                 TEXT        NOT NULL DEFAULT 'pending'
                         CHECK (status IN
                           ('pending','paid','active','completed','refunded','cancelled')),
  deliverables_delivered JSONB       DEFAULT '[]',
  report_id              UUID        REFERENCES tournament_reports(id),
  payment_ref            TEXT,
  paid_at                TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sponsorships_sponsor_id     ON sponsorships(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_tournament_id  ON sponsorships(tournament_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_status         ON sponsorships(status);

-- ============================================================
-- MANAGED SERVICE PROJECTS
-- Sponsors submit consultancy/campaign requests to HERU staff
-- ============================================================

CREATE TABLE IF NOT EXISTS managed_service_projects (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_id       UUID        NOT NULL REFERENCES sponsor_profiles(id) ON DELETE RESTRICT,
  title            TEXT        NOT NULL,
  description      TEXT,
  budget           NUMERIC(12,2),
  status           TEXT        NOT NULL DEFAULT 'submitted'
                   CHECK (status IN
                     ('submitted','reviewing','proposal_sent','approved',
                      'in_progress','completed','cancelled')),
  consultant_id    UUID        REFERENCES user_profiles(id),
  proposal_text    TEXT,
  proposal_amount  NUMERIC(12,2),
  deliverables     JSONB       DEFAULT '[]',
  chat             JSONB       DEFAULT '[]',
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_managed_projects_sponsor_id ON managed_service_projects(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_managed_projects_status     ON managed_service_projects(status);

-- ============================================================
-- HERU REVENUE LEDGER
-- Every fee HERU earns is recorded here
-- Supports both naming conventions used across the codebase:
--   stream/entity_type/entity_id/net_to_party  (original schema)
--   source_type/source_id/net_amount            (backend routes)
-- ============================================================

CREATE TABLE IF NOT EXISTS heru_revenue_ledger (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Original schema columns
  stream       TEXT        NOT NULL
               CHECK (stream IN
                 ('service_booking','sponsorship','subscription','coaching','other')),
  entity_type  TEXT,
  entity_id    UUID,
  net_to_party NUMERIC(12,2),
  -- Backend alias columns
  source_type  TEXT,
  source_id    UUID,
  net_amount   NUMERIC(12,2),
  -- Common columns
  gross_amount NUMERIC(12,2) NOT NULL,
  fee_percent  NUMERIC(5,2)  NOT NULL DEFAULT 15,
  heru_fee     NUMERIC(12,2) NOT NULL,
  currency     TEXT          NOT NULL DEFAULT 'EGP',
  description  TEXT,
  recorded_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Trigger: auto-calculate heru_fee and sync alias columns
CREATE OR REPLACE FUNCTION calculate_revenue_split()
RETURNS TRIGGER AS $$
BEGIN
  NEW.heru_fee     = ROUND(NEW.gross_amount * NEW.fee_percent / 100, 2);
  NEW.net_to_party = NEW.gross_amount - NEW.heru_fee;
  -- Keep alias columns in sync
  NEW.net_amount   = NEW.net_to_party;
  IF NEW.source_type IS NULL THEN NEW.source_type = NEW.stream;     END IF;
  IF NEW.source_id   IS NULL THEN NEW.source_id   = NEW.entity_id;  END IF;
  IF NEW.entity_type IS NULL THEN NEW.entity_type = NEW.source_type;END IF;
  IF NEW.entity_id   IS NULL THEN NEW.entity_id   = NEW.source_id;  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_revenue ON heru_revenue_ledger;
CREATE TRIGGER trg_calculate_revenue
  BEFORE INSERT OR UPDATE ON heru_revenue_ledger
  FOR EACH ROW EXECUTE FUNCTION calculate_revenue_split();

CREATE INDEX IF NOT EXISTS idx_revenue_ledger_stream      ON heru_revenue_ledger(stream);
CREATE INDEX IF NOT EXISTS idx_revenue_ledger_source_type ON heru_revenue_ledger(source_type);
CREATE INDEX IF NOT EXISTS idx_revenue_ledger_recorded_at ON heru_revenue_ledger(recorded_at DESC);
