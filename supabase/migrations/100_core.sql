-- ============================================================
-- HERU.gg — Core Platform Schema
-- Migration: 100_core.sql
-- Tables: user_profiles, staff_access_keys, staff_sessions,
--         app_settings, cms_pages, audit_log,
--         games, notifications, achievements, badges
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- UTILITY: auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- USER PROFILES
-- Extends Supabase auth.users via auth_user_id
-- ============================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID        UNIQUE NOT NULL,
  email        TEXT        UNIQUE NOT NULL,
  full_name    TEXT,
  role         TEXT        NOT NULL DEFAULT 'gamer'
               CHECK (role IN ('gamer','organizer','sponsor','service_provider','admin')),
  avatar_url   TEXT,
  phone        TEXT,
  whatsapp     TEXT,
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_user_profiles
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role         ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email        ON user_profiles(email);

-- ============================================================
-- STAFF ACCESS KEYS
-- Used alongside JWT for admin access (dual-factor)
-- ============================================================

CREATE TABLE IF NOT EXISTS staff_access_keys (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  access_key   TEXT        UNIQUE NOT NULL,
  staff_name   TEXT        NOT NULL,
  staff_email  TEXT        NOT NULL,
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Active keys at launch
INSERT INTO staff_access_keys (access_key, staff_name, staff_email, is_active) VALUES
  ('HERU-STAFF-OMAR-2026', 'Omar Ahmed', 'omar@heru.gg', TRUE),
  ('HERU-STAFF-OPS-2026',  'Ops Team',   'ops@heru.gg',  TRUE)
ON CONFLICT (access_key) DO NOTHING;

-- ============================================================
-- STAFF SESSIONS
-- Token-based session store for admin users
-- ============================================================

CREATE TABLE IF NOT EXISTS staff_sessions (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_token TEXT        UNIQUE NOT NULL,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_sessions_token
  ON staff_sessions(session_token) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_staff_sessions_user_id
  ON staff_sessions(user_id);

-- ============================================================
-- APP SETTINGS
-- Feature flags and platform configuration
-- ============================================================

CREATE TABLE IF NOT EXISTS app_settings (
  setting_key   TEXT        PRIMARY KEY,
  setting_value TEXT        NOT NULL,
  description   TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by    UUID
);

INSERT INTO app_settings (setting_key, setting_value, description) VALUES
  ('platform_fee_percent',           '15',    'Platform fee % on all transactions'),
  ('sponsorship_fee_percent',        '15',    'Fee % on sponsorship package purchases'),
  ('coaching_fee_percent',           '15',    'Fee % on coaching session payments'),
  ('min_sponsorship_multiplier',     '1.5',   'Min sponsorship value as multiple of service cost'),
  ('coaching_enabled',               'true',  'Enable coaching marketplace'),
  ('leaderboards_enabled',           'true',  'Enable public leaderboards'),
  ('influencer_marketplace_enabled', 'true',  'Enable influencer discovery'),
  ('managed_services_enabled',       'true',  'Enable sponsor managed service requests'),
  ('provider_approval_required',     'true',  'Service providers need staff approval before listing'),
  ('organizer_verification_required','true',  'Organizers need verification to publish to radar')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================
-- CMS PAGES
-- Editable landing page and marketing copy
-- ============================================================

CREATE TABLE IF NOT EXISTS cms_pages (
  slug       TEXT        PRIMARY KEY,
  title      TEXT        NOT NULL,
  content    JSONB       NOT NULL DEFAULT '{}',
  is_visible BOOLEAN     NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID
);

-- ============================================================
-- AUDIT LOG
-- Platform-wide action trail
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id    UUID,
  actor_role  TEXT,
  action      TEXT        NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  metadata    JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor_id  ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity    ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

-- ============================================================
-- GAMES
-- Supported game list for the platform
-- ============================================================

CREATE TABLE IF NOT EXISTS games (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT        UNIQUE NOT NULL,
  slug       TEXT        UNIQUE,
  logo_url   TEXT,
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  sort_order INT         DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO games (name, slug, is_active, sort_order) VALUES
  ('Valorant',           'valorant',          TRUE,  1),
  ('League of Legends',  'league-of-legends', TRUE,  2),
  ('CS2',                'cs2',               TRUE,  3),
  ('Dota 2',             'dota-2',            TRUE,  4),
  ('Rocket League',      'rocket-league',     TRUE,  5),
  ('Apex Legends',       'apex-legends',      TRUE,  6),
  ('Fortnite',           'fortnite',          TRUE,  7),
  ('Call of Duty',       'call-of-duty',      TRUE,  8),
  ('Rainbow Six Siege',  'rainbow-six',       TRUE,  9),
  ('Overwatch 2',        'overwatch-2',       TRUE,  10),
  ('FIFA / EA FC',       'fifa-ea-fc',        TRUE,  11),
  ('PUBG',               'pubg',              TRUE,  12),
  ('Mobile Legends',     'mobile-legends',    TRUE,  13),
  ('Free Fire',          'free-fire',         TRUE,  14)
ON CONFLICT (name) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_games_active_sort ON games(is_active, sort_order);

-- ============================================================
-- NOTIFICATIONS
-- Per-user notification inbox
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  message    TEXT,
  link       TEXT,
  type       TEXT        DEFAULT 'info',
  is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
  read_at    TIMESTAMPTZ,
  metadata   JSONB       DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================================
-- ACHIEVEMENTS & BADGES
-- ============================================================

CREATE TABLE IF NOT EXISTS achievements (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL,
  description TEXT,
  icon        TEXT,
  criteria    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_id UUID        NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS badges (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT        NOT NULL,
  description  TEXT,
  image_url    TEXT,
  badge_type   TEXT        DEFAULT 'platform'
               CHECK (badge_type IN ('platform','organizer','achievement')),
  organizer_id UUID,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  badge_id   UUID        NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_by UUID,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
