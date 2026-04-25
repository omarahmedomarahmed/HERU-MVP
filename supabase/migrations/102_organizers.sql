-- ============================================================
-- HERU.gg — Organizers Schema
-- Migration: 102_organizers.sql
-- Tables: organizer_profiles, organizer_verifications,
--         organizer_page_configs, organizer_ratings,
--         deliverables, bills, orders, tournament_orders,
--         approval_requests
-- ============================================================

-- ============================================================
-- ORGANIZER PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS organizer_profiles (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  brand_name      TEXT,
  brand_logo      TEXT,
  brand_banner    TEXT,
  bio             TEXT,
  website         TEXT,
  instagram       TEXT,
  twitter         TEXT,
  tiktok          TEXT,
  facebook        TEXT,
  discord_server  TEXT,
  twitch_channel  TEXT,
  youtube_channel TEXT,
  region          TEXT,
  country         TEXT,
  contact_number  TEXT,
  contact_email   TEXT,
  is_verified     BOOLEAN     NOT NULL DEFAULT FALSE,
  verified_at     TIMESTAMPTZ,
  rating          NUMERIC(3,2) DEFAULT 0,
  review_count    INT         DEFAULT 0,
  tournaments_run INT         DEFAULT 0,
  total_prizepool NUMERIC(14,2) DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizer_profiles_user_id     ON organizer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_organizer_profiles_is_verified ON organizer_profiles(is_verified);

-- ============================================================
-- ORGANIZER VERIFICATION REQUESTS
-- Staff reviews and approves before organizer can use radar
-- ============================================================

CREATE TABLE IF NOT EXISTS organizer_verifications (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id   UUID        NOT NULL REFERENCES organizer_profiles(id) ON DELETE CASCADE,
  brand_name     TEXT        NOT NULL,
  website        TEXT,
  instagram      TEXT,
  linkedin       TEXT,
  brand_deck_url TEXT,
  notes          TEXT,
  status         TEXT        NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','approved','rejected')),
  reviewed_by    UUID,
  review_notes   TEXT,
  reviewed_at    TIMESTAMPTZ,
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizer_verifications_organizer_id
  ON organizer_verifications(organizer_id);
CREATE INDEX IF NOT EXISTS idx_organizer_verifications_status
  ON organizer_verifications(status);

-- ============================================================
-- ORGANIZER PAGE CONFIGS
-- Custom tournament signup page branding per organizer
-- ============================================================

CREATE TABLE IF NOT EXISTS organizer_page_configs (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id   UUID        UNIQUE NOT NULL REFERENCES organizer_profiles(id) ON DELETE CASCADE,
  custom_domain  TEXT,
  primary_color  TEXT        DEFAULT '#ef4444',
  background     TEXT,
  banner_image   TEXT,
  custom_logo    TEXT,
  footer_links   JSONB       DEFAULT '[]',
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORGANIZER RATINGS
-- From service providers and sponsors post-tournament
-- ============================================================

CREATE TABLE IF NOT EXISTS organizer_ratings (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id  UUID        NOT NULL REFERENCES organizer_profiles(id) ON DELETE CASCADE,
  rater_id      UUID        NOT NULL REFERENCES user_profiles(id),
  rater_role    TEXT        NOT NULL,
  rating        INT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  tournament_id UUID        REFERENCES tournaments(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organizer_id, rater_id, tournament_id)
);

-- ============================================================
-- DELIVERABLES
-- Commitments an organizer makes to sponsors per sponsorship
-- ============================================================

CREATE TABLE IF NOT EXISTS deliverables (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id  UUID        NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  sponsorship_id UUID,
  title          TEXT        NOT NULL,
  description    TEXT,
  due_date       TIMESTAMPTZ,
  status         TEXT        NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','in_progress','completed','overdue')),
  proof_url      TEXT,
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliverables_tournament_id ON deliverables(tournament_id);

-- ============================================================
-- BILLS (invoices for all roles)
-- ============================================================

CREATE TABLE IF NOT EXISTS bills (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_number TEXT        UNIQUE NOT NULL,
  user_id     UUID        NOT NULL REFERENCES user_profiles(id),
  user_role   TEXT        NOT NULL,
  description TEXT,
  line_items  JSONB       DEFAULT '[]',
  subtotal    NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax         NUMERIC(12,2) DEFAULT 0,
  total       NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency    TEXT        NOT NULL DEFAULT 'EGP',
  status      TEXT        NOT NULL DEFAULT 'unpaid'
              CHECK (status IN ('unpaid','paid','cancelled','refunded')),
  paid_at     TIMESTAMPTZ,
  payment_ref TEXT,
  due_date    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_status  ON bills(status);

-- ============================================================
-- ORDERS (gamer marketplace orders)
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES user_profiles(id),
  items       JSONB       NOT NULL DEFAULT '[]',
  total       NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency    TEXT        NOT NULL DEFAULT 'EGP',
  status      TEXT        NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','paid','fulfilled','cancelled','refunded')),
  payment_ref TEXT,
  support_chat JSONB      DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- ============================================================
-- TOURNAMENT ORDERS (tournament entry fees)
-- ============================================================

CREATE TABLE IF NOT EXISTS tournament_orders (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID        NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id       UUID        REFERENCES teams(id),
  user_id       UUID        NOT NULL REFERENCES user_profiles(id),
  amount        NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency      TEXT        NOT NULL DEFAULT 'EGP',
  status        TEXT        NOT NULL DEFAULT 'pending',
  payment_ref   TEXT,
  fulfillment   JSONB       DEFAULT '{}',
  internal_chat JSONB       DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tournament_orders_tournament_id
  ON tournament_orders(tournament_id);

-- ============================================================
-- APPROVAL REQUESTS
-- Generic staff approval flow (services, verifications, etc.)
-- ============================================================

CREATE TABLE IF NOT EXISTS approval_requests (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type  TEXT        NOT NULL,
  entity_id    UUID        NOT NULL,
  requested_by UUID        NOT NULL REFERENCES user_profiles(id),
  status       TEXT        NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','approved','rejected')),
  notes        TEXT,
  reviewed_by  UUID,
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
