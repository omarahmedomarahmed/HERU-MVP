-- =============================================
-- HERU.gg — Seed Data
-- =============================================

-- Staff access keys
INSERT INTO public.staff_access_keys (access_key, staff_name, staff_email, is_active, notes)
VALUES
  ('HERU-STAFF-OMAR-2026', 'Omar Abdelgawad', 'omarabdelgawad001@gmail.com', true, 'Super admin key'),
  ('HERU-STAFF-OPS-2026', 'HERU Ops', 'heru.gg.esports@gmail.com', true, 'Operations key');

-- App settings
INSERT INTO public.app_settings (setting_key, setting_value, description)
VALUES
  ('platform_fee_percent', '15', 'Platform fee percentage applied to all tournament costs'),
  ('min_organizer_commitment', '33', 'Minimum % commitment for main organizer on shared tournaments'),
  ('max_parties_per_tournament', '3', 'Maximum parties (main + co-orgs) per shared tournament'),
  ('currency', 'EGP', 'Platform currency'),
  ('paymob_enabled', 'false', 'Whether Paymob payment gateway is active'),
  ('platform_name', 'HERU.gg', 'Platform display name'),
  ('support_email', 'support@heru.gg', 'Platform support email');

-- Marketplace items
INSERT INTO public.marketplace_items (title, description, category, type, price, is_active) VALUES
  ('Valorant Game Setup', 'Full Valorant tournament game server setup', 'game_setup', 'valorant', 2000, true),
  ('CS2 Game Setup', 'Full CS2 tournament game server setup', 'game_setup', 'cs2', 2500, true),
  ('League of Legends Setup', 'Full LoL tournament realm setup', 'game_setup', 'lol', 3000, true),
  ('Team Jerseys (8 teams)', 'Custom branded jerseys for 8 teams', 'teams', 'jerseys', 8000, true),
  ('Caster - Arabic', 'Professional Arabic-speaking caster', 'live_talent', 'caster', 5000, true),
  ('Caster - English', 'Professional English-speaking caster', 'live_talent', 'caster', 6000, true),
  ('Observer/Director', 'In-game observer and stream director', 'live_talent', 'observer', 4000, true),
  ('Host/Interviewer', 'On-stage or online host', 'live_talent', 'host', 4500, true),
  ('Stream Production - Basic', 'Overlays, transitions, basic stream setup', 'production', 'basic', 5000, true),
  ('Stream Production - Premium', 'Full broadcast package with replays and analytics', 'production', 'premium', 12000, true),
  ('Social Media Package', 'Graphics, posts, and story templates', 'branding', 'social', 3000, true),
  ('Banner & Backdrop Design', 'Tournament banners and stage backdrops', 'branding', 'physical', 4000, true),
  ('Venue - Gaming Cafe (Cairo)', 'Gaming cafe venue rental for tournament day', 'venue', 'cafe', 8000, true),
  ('Venue - Event Hall (Cairo)', 'Professional event hall with stage', 'venue', 'hall', 25000, true),
  ('Cash Prize - EGP 10,000', 'Cash prizepool component', 'prizepool', 'cash', 10000, true),
  ('Cash Prize - EGP 25,000', 'Cash prizepool component', 'prizepool', 'cash', 25000, true),
  ('Cash Prize - EGP 50,000', 'Cash prizepool component', 'prizepool', 'cash', 50000, true),
  ('Gaming Headset Prizes', 'Premium gaming headsets for top 3', 'prizepool', 'physical', 6000, true);
