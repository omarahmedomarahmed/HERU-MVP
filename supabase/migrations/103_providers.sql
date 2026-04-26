-- ============================================================
-- HERU.gg — Service Providers Schema
-- Migration: 103_providers.sql
-- Tables: service_provider_profiles, services,
--         provider_portfolio_items, provider_past_projects,
--         service_bookings, coaching_sessions, reviews
-- ============================================================

-- ============================================================
-- SERVICE PROVIDER PROFILES
-- Covers: branding, production, talent, venue, marketing,
--         coaching, and influencer provider types
-- ============================================================

CREATE TABLE IF NOT EXISTS service_provider_profiles (
  id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID        UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  display_name          TEXT        NOT NULL,
  slug                  TEXT        UNIQUE,
  bio                   TEXT,
  avatar                TEXT,
  portfolio_url         TEXT,
  social_links          JSONB       DEFAULT '{}',
  categories            TEXT[]      DEFAULT '{}',
  provider_type         TEXT        DEFAULT 'general'
                        CHECK (provider_type IN ('general','coach','influencer')),
  approval_status       TEXT        NOT NULL DEFAULT 'pending'
                        CHECK (approval_status IN ('pending','approved','rejected','suspended')),
  is_approved           BOOLEAN     NOT NULL DEFAULT FALSE,
  approved_at           TIMESTAMPTZ,
  approved_by           UUID,
  rating                NUMERIC(3,2) DEFAULT 0,
  review_count          INT         NOT NULL DEFAULT 0,
  total_bookings        INT         NOT NULL DEFAULT 0,
  -- Coach-specific
  coach_games           TEXT[]      DEFAULT '{}',
  coach_rank            TEXT,
  coach_availability    TEXT,
  hourly_rate           NUMERIC(10,2),
  -- Influencer-specific
  influencer_platforms  TEXT[]      DEFAULT '{}',
  audience_size         INT         DEFAULT 0,
  avg_views_per_post    INT         DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_slug
  ON service_provider_profiles(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_spp_user_id       ON service_provider_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_spp_provider_type ON service_provider_profiles(provider_type);
CREATE INDEX IF NOT EXISTS idx_spp_is_approved   ON service_provider_profiles(is_approved);

-- ============================================================
-- SERVICES
-- Listings created by service providers
-- ============================================================

CREATE TABLE IF NOT EXISTS services (
  id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id           UUID        NOT NULL REFERENCES service_provider_profiles(id) ON DELETE CASCADE,
  title                 TEXT        NOT NULL,
  description           TEXT,
  category              TEXT        NOT NULL
                        CHECK (category IN
                          ('Branding','Production','Talent','Venue','Marketing','Coaching','Influencer',
                           'Community','Hardware','EventVendor','TournamentMgmt')),
  custom_fields         JSONB       DEFAULT '{}',
  price                 NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_type            TEXT        DEFAULT 'fixed'
                        CHECK (price_type IN ('fixed','hourly','per_event')),
  deliverables          JSONB       DEFAULT '[]',
  portfolio_images      TEXT[]      DEFAULT '{}',
  portfolio_videos      TEXT[]      DEFAULT '{}',
  availability          TEXT,
  rating                NUMERIC(3,2) DEFAULT 0,
  booking_count         INT         NOT NULL DEFAULT 0,
  status                TEXT        NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','approved','rejected','suspended')),
  approved_at           TIMESTAMPTZ,
  approved_by           UUID,
  staff_notes           TEXT,
  staff_adjusted_price  NUMERIC(10,2),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category    ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_status      ON services(status);

-- ============================================================
-- PROVIDER PORTFOLIO ITEMS
-- Rich past-work showcase per provider
-- ============================================================

CREATE TABLE IF NOT EXISTS provider_portfolio_items (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id     UUID        NOT NULL REFERENCES service_provider_profiles(id) ON DELETE CASCADE,
  service_id      UUID        REFERENCES services(id) ON DELETE SET NULL,
  type            TEXT        DEFAULT 'general',
  title           TEXT        NOT NULL,
  description     TEXT,
  client_name     TEXT,
  image_url       TEXT,
  video_url       TEXT,
  thumbnail_url   TEXT,
  tournament_name TEXT,
  deliverables    JSONB       DEFAULT '[]',
  links           JSONB       DEFAULT '[]',
  testimonial     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_provider_id
  ON provider_portfolio_items(provider_id);

-- ============================================================
-- PROVIDER PAST PROJECTS (event credits)
-- ============================================================

CREATE TABLE IF NOT EXISTS provider_past_projects (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id    UUID        NOT NULL REFERENCES service_provider_profiles(id) ON DELETE CASCADE,
  event_name     TEXT        NOT NULL,
  organizer_name TEXT,
  role           TEXT,
  description    TEXT,
  image_url      TEXT,
  date           DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_past_projects_provider_id
  ON provider_past_projects(provider_id);

-- ============================================================
-- SERVICE BOOKINGS
-- Organizer books a service provider for a tournament
-- Escrow: payment held until organizer confirms delivery
-- ============================================================

CREATE TABLE IF NOT EXISTS service_bookings (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id        UUID        NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  provider_id       UUID        NOT NULL REFERENCES service_provider_profiles(id) ON DELETE RESTRICT,
  organizer_id      UUID        NOT NULL REFERENCES user_profiles(id),
  tournament_id     UUID        REFERENCES tournaments(id),
  amount            NUMERIC(12,2) NOT NULL,
  total_price       NUMERIC(12,2),
  platform_fee      NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_to_provider   NUMERIC(12,2),
  -- Denormalised for billing pages
  service_name      TEXT,
  service_category  TEXT,
  provider_name     TEXT,
  organizer_name    TEXT,
  status            TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (status IN
                      ('pending','accepted','rejected','completed','cancelled','disputed')),
  escrow_status     TEXT        NOT NULL DEFAULT 'held'
                    CHECK (escrow_status IN ('held','released','refunded')),
  notes             TEXT,
  files             JSONB       DEFAULT '[]',
  chat              JSONB       DEFAULT '[]',
  accepted_at       TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  payment_ref       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_bookings_provider_id  ON service_bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_organizer_id ON service_bookings(organizer_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_status       ON service_bookings(status);

-- ============================================================
-- COACHING SESSIONS
-- Gamers book coaches (coach is a service_provider with type=coach)
-- ============================================================

CREATE TABLE IF NOT EXISTS coaching_sessions (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  gamer_id         UUID        NOT NULL REFERENCES user_profiles(id),
  coach_id         UUID        NOT NULL REFERENCES user_profiles(id),
  scheduled_at     TIMESTAMPTZ NOT NULL,
  duration_hours   NUMERIC(4,2) DEFAULT 1,
  duration_minutes INT         GENERATED ALWAYS AS
                     (ROUND(COALESCE(duration_hours, 1) * 60)::INT) STORED,
  price            NUMERIC(10,2) NOT NULL DEFAULT 0,
  platform_fee     NUMERIC(10,2) DEFAULT 0,
  session_type     TEXT        DEFAULT 'coaching',
  notes            TEXT,
  status           TEXT        NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','completed','cancelled')),
  -- Coach rating from gamer
  rating           INT         CHECK (rating BETWEEN 1 AND 5),
  review           TEXT,
  -- Gamer rating from coach
  gamer_rating     INT         CHECK (gamer_rating BETWEEN 1 AND 5),
  gamer_review     TEXT,
  payment_ref      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coaching_sessions_gamer_id ON coaching_sessions(gamer_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_coach_id ON coaching_sessions(coach_id);

-- ============================================================
-- REVIEWS
-- Organizers and gamers review providers after a booking
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id   UUID        NOT NULL REFERENCES service_provider_profiles(id) ON DELETE CASCADE,
  service_id    UUID        REFERENCES services(id),
  reviewer_id   UUID        NOT NULL REFERENCES user_profiles(id),
  reviewer_role TEXT        NOT NULL,
  reviewer_name TEXT,
  booking_id    UUID        REFERENCES service_bookings(id),
  event_name    TEXT,
  rating        INT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON reviews(provider_id);

-- Trigger: keep provider rating aggregate fresh
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE service_provider_profiles
  SET rating       = (SELECT AVG(rating)   FROM reviews WHERE provider_id = NEW.provider_id),
      review_count = (SELECT COUNT(*)      FROM reviews WHERE provider_id = NEW.provider_id),
      updated_at   = NOW()
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_provider_rating ON reviews;
CREATE TRIGGER trg_update_provider_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();
