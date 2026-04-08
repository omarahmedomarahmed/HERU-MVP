-- Migration 009: Promo codes table for marketplace cart discounts
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent NUMERIC NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  description TEXT,
  gamer_id UUID REFERENCES auth.users,          -- NULL = generic / usable by anyone
  is_active BOOLEAN DEFAULT TRUE,
  max_uses INTEGER,                              -- NULL = unlimited
  use_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast code lookup
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_gamer ON promo_codes(gamer_id);

-- Seed: a 10% welcome code for testing
INSERT INTO promo_codes (code, discount_percent, description, is_active, max_uses)
VALUES ('HERU10', 10, '10% off your first order', true, 100)
ON CONFLICT (code) DO NOTHING;

-- RLS: only the backend service role can read/write
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON promo_codes
  FOR ALL TO service_role USING (true) WITH CHECK (true);
