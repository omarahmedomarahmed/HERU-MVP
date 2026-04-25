-- ============================================================
-- HERU.gg — Fresh Schema: Core Users & Platform
-- Migration: 100_fresh_schema_core.sql
-- Run on a NEW database to build from scratch.
-- Compatible with PostgreSQL 14+ and MySQL 8+ (with minor adjustments).
-- ============================================================

-- Enable UUID extension (PostgreSQL only; MySQL uses CHAR(36) or UUID())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- SECTION 1: USER PROFILES
-- ============================================================

-- user_profiles extends auth users (Supabase auth.users or custom users table)
CREATE TABLE IF NOT EXISTS user_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id    UUID UNIQUE NOT NULL, -- references your auth system
  email           TEXT UNIQUE NOT NULL,
  full_name       TEXT,
  role            TEXT NOT NULL DEFAULT 'gamer'
                  CHECK (role IN ('gamer','organizer','sponsor','service_provider','admin')),
  avatar_url      TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Staff access keys (used alongside JWT for admin access)
CREATE TABLE IF NOT EXISTS staff_access_keys (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  access_key  TEXT UNIQUE NOT NULL,
  staff_name  TEXT NOT NULL,
  staff_email TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- App settings (feature flags, platform config)
CREATE TABLE IF NOT EXISTS app_settings (
  setting_key   TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  description   TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by    UUID
);

-- Default settings
INSERT INTO app_settings (setting_key, setting_value, description) VALUES
  ('platform_fee_percent',          '15',    'Platform fee % on all transactions'),
  ('sponsorship_fee_percent',       '15',    'Fee % on sponsorship package purchases'),
  ('coaching_fee_percent',          '15',    'Fee % on coaching session payments'),
  ('min_sponsorship_multiplier',    '1.5',   'Min sponsorship value as multiple of service cost'),
  ('coaching_enabled',              'true',  'Enable coaching marketplace'),
  ('leaderboards_enabled',          'true',  'Enable public leaderboards'),
  ('influencer_marketplace_enabled','true',  'Enable influencer discovery'),
  ('managed_services_enabled',      'true',  'Enable sponsor managed service requests'),
  ('provider_approval_required',    'true',  'Service providers need staff approval'),
  ('organizer_verification_required','true', 'Organizers need verification to publish to radar')
ON CONFLICT (setting_key) DO NOTHING;

-- CMS pages (editable landing copy)
CREATE TABLE IF NOT EXISTS cms_pages (
  slug        TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  content     JSONB NOT NULL DEFAULT '{}',
  is_visible  BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID
);

-- Audit trail
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id    UUID,
  actor_role  TEXT,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  metadata    JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SECTION 2: ACHIEVEMENTS & BADGES
-- ============================================================

CREATE TABLE IF NOT EXISTS achievements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  criteria    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS badges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,
  badge_type  TEXT DEFAULT 'platform' CHECK (badge_type IN ('platform','organizer','achievement')),
  organizer_id UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL,
  badge_id    UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_by  UUID,
  awarded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ============================================================
-- TRIGGERS: updated_at auto-update
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_user_profiles
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor_id ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
