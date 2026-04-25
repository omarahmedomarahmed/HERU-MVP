-- Migration 107: Provider slug + enhanced portfolio fields
-- Adds slug for public profile URLs and enhances portfolio items

-- Add slug to service_provider_profiles
ALTER TABLE service_provider_profiles
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Create unique index for slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_slug ON service_provider_profiles(slug) WHERE slug IS NOT NULL;

-- Enhance provider_portfolio_items with richer fields
ALTER TABLE provider_portfolio_items
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS deliverables JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS testimonial TEXT;
