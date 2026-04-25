-- Migration 108: Internal/corporate tournaments support
-- Adds is_internal flag and sponsor_id for invite-only corporate events

ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS is_internal BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS internal_event_type TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS venue_type TEXT DEFAULT 'online',
  ADD COLUMN IF NOT EXISTS invite_code TEXT;

-- Generate invite codes for internal tournaments
UPDATE tournaments
SET invite_code = LOWER(SUBSTRING(MD5(id::text), 1, 12))
WHERE is_internal = TRUE AND invite_code IS NULL;

-- Index for invite code lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_tournament_invite_code ON tournaments(invite_code) WHERE invite_code IS NOT NULL;
