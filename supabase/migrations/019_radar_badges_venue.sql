-- 019_radar_badges_venue.sql
-- Fix: add missing tournament_image column to sponsorship_radar
-- Add: badges/roles system tables
-- Add: organizer venue submission system

-- ── Radar fix ──────────────────────────────────────────────────────────────
ALTER TABLE public.sponsorship_radar
  ADD COLUMN IF NOT EXISTS tournament_image TEXT;

-- ── Badges / Roles system ───────────────────────────────────────────────────
-- badge_definitions: premade + organizer-created badges
CREATE TABLE IF NOT EXISTS public.badge_definitions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  icon          TEXT,                          -- emoji or URL
  color         TEXT DEFAULT '#ff1a1a',        -- hex colour
  badge_type    TEXT CHECK (badge_type IN ('staff_premade','organizer_custom')) DEFAULT 'staff_premade',
  created_by    UUID REFERENCES auth.users,    -- null = system / staff
  organizer_id  UUID REFERENCES auth.users,    -- set for organizer_custom
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- gamer_badges: assignments of badges to gamers
CREATE TABLE IF NOT EXISTS public.gamer_badges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gamer_user_id UUID REFERENCES auth.users NOT NULL,
  badge_id      UUID REFERENCES public.badge_definitions NOT NULL,
  awarded_by    UUID REFERENCES auth.users,
  awarded_by_type TEXT CHECK (awarded_by_type IN ('staff','organizer')) DEFAULT 'staff',
  tournament_id UUID REFERENCES public.tournaments,  -- optional context
  awarded_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gamer_user_id, badge_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gamer_badges_user ON public.gamer_badges(gamer_user_id);
CREATE INDEX IF NOT EXISTS idx_badge_definitions_organizer ON public.badge_definitions(organizer_id);

-- RLS
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamer_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges_public_read"     ON public.badge_definitions FOR SELECT USING (true);
CREATE POLICY "badges_service_write"   ON public.badge_definitions FOR ALL    USING (auth.role() = 'service_role');
CREATE POLICY "gamer_badges_public_read"   ON public.gamer_badges FOR SELECT USING (true);
CREATE POLICY "gamer_badges_service_write" ON public.gamer_badges FOR ALL    USING (auth.role() = 'service_role');

-- Seed staff-premade badges
INSERT INTO public.badge_definitions (name, description, icon, color, badge_type) VALUES
  ('Verified Player',    'Identity verified by HERU staff',          '✅', '#22c55e', 'staff_premade'),
  ('Tournament Winner',  'Won an official HERU tournament',          '🏆', '#f59e0b', 'staff_premade'),
  ('HERU Pro',           'Elite competitive player',                  '⚡', '#8b5cf6', 'staff_premade'),
  ('Content Creator',    'Official HERU content partner',            '🎥', '#ec4899', 'staff_premade'),
  ('Staff Pick',         'Recognised by HERU staff',                 '⭐', '#3b82f6', 'staff_premade'),
  ('OG Member',          'Early HERU platform member',               '🔥', '#ff1a1a', 'staff_premade'),
  ('Team Captain',       'Leader of a registered HERU team',         '🛡️', '#0ea5e9', 'staff_premade'),
  ('Talent',             'Registered esports talent on HERU',        '🎤', '#a855f7', 'staff_premade')
ON CONFLICT DO NOTHING;

-- ── Organizer venue submissions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.venue_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id    UUID REFERENCES auth.users NOT NULL,
  organizer_brand TEXT,
  venue_name      TEXT NOT NULL,
  venue_address   TEXT NOT NULL,
  city            TEXT,
  country         TEXT DEFAULT 'Egypt',
  capacity        INTEGER,
  price_per_day   NUMERIC,
  description     TEXT,
  amenities       TEXT[] DEFAULT '{}',
  images          TEXT[] DEFAULT '{}',
  contact_number  TEXT,
  contact_email   TEXT,
  status          TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  staff_notes     TEXT,
  marketplace_item_id UUID REFERENCES public.marketplace_items,
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ,
  reviewed_by     UUID REFERENCES auth.users,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_submissions_organizer ON public.venue_submissions(organizer_id);
CREATE INDEX IF NOT EXISTS idx_venue_submissions_status    ON public.venue_submissions(status);

ALTER TABLE public.venue_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "venue_sub_owner_read"    ON public.venue_submissions FOR SELECT USING (auth.uid() = organizer_id OR auth.role() = 'service_role');
CREATE POLICY "venue_sub_owner_insert"  ON public.venue_submissions FOR INSERT WITH CHECK (auth.uid() = organizer_id OR auth.role() = 'service_role');
CREATE POLICY "venue_sub_service_write" ON public.venue_submissions FOR ALL    USING (auth.role() = 'service_role');
