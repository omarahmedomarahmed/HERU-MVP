-- ============================================================
-- HERU.gg — Schema Updates (Migration 106)
-- Apply this to upgrade an existing production database
-- that already has migrations 100-105 applied.
-- ============================================================

-- 1. Services: Add custom_fields column for category-specific data
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- 2. Services: Add Influencer to category CHECK
-- Note: PostgreSQL requires dropping and recreating constraints
ALTER TABLE services
  DROP CONSTRAINT IF EXISTS services_category_check;
ALTER TABLE services
  ADD CONSTRAINT services_category_check
  CHECK (category IN ('Branding','Production','Talent','Venue','Marketing','Coaching','Influencer'));

-- 3. Service provider profiles: Fix provider_type to remove venue/discord
ALTER TABLE service_provider_profiles
  DROP CONSTRAINT IF EXISTS service_provider_profiles_provider_type_check;
ALTER TABLE service_provider_profiles
  ADD CONSTRAINT service_provider_profiles_provider_type_check
  CHECK (provider_type IN ('general','coach','influencer'));

-- Update any existing 'venue' or 'discord' provider_types to 'general'
UPDATE service_provider_profiles
  SET provider_type = 'general'
  WHERE provider_type IN ('venue','discord');

-- 4. Service provider profiles: Add approval_status column
ALTER TABLE service_provider_profiles
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending'
  CHECK (approval_status IN ('pending','approved','rejected','suspended'));

-- Backfill approval_status from is_approved
UPDATE service_provider_profiles
  SET approval_status = CASE WHEN is_approved = TRUE THEN 'approved' ELSE 'pending' END;

-- 5. Tournaments: Rename venue_id (UUID) to venue_name (TEXT)
-- Only do this if venue_id exists as UUID
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tournaments' AND column_name = 'venue_id'
  ) THEN
    ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS venue_name TEXT;
    -- No data migration needed (venue_id was usually NULL)
    ALTER TABLE tournaments DROP COLUMN IF EXISTS venue_id;
  END IF;
END $$;

-- 6. Drop venues table (venue is now a service category)
-- WARNING: Only do this if you have no critical venue data to preserve
-- If you have venue data, migrate it to service_provider_profiles first
-- DROP TABLE IF EXISTS venues;

-- 7. Staff sessions: Add index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_staff_sessions_token
  ON staff_sessions(session_token) WHERE is_active = TRUE;

-- 8. Sponsorships: Add package_name and sponsor_brand denormalized columns for billing
ALTER TABLE sponsorships
  ADD COLUMN IF NOT EXISTS package_name TEXT,
  ADD COLUMN IF NOT EXISTS sponsor_brand TEXT,
  ADD COLUMN IF NOT EXISTS tournament_name TEXT;

-- 9. Service bookings: Add denormalized columns for income pages
ALTER TABLE service_bookings
  ADD COLUMN IF NOT EXISTS service_name TEXT,
  ADD COLUMN IF NOT EXISTS provider_name TEXT,
  ADD COLUMN IF NOT EXISTS organizer_name TEXT,
  ADD COLUMN IF NOT EXISTS service_category TEXT;

COMMENT ON COLUMN services.custom_fields IS
  'Category-specific fields: venue={capacity,address,amenities}, production={equipment}, marketing={channels,audience_size}, etc.';

COMMENT ON TABLE service_provider_profiles IS
  'Service providers. Venue is a category, not a separate entity. Coach and Influencer are special types with dedicated public pages.';
