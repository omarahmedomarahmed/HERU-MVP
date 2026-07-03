-- ============================================================================
-- HERU.gg — Demo Seed Data
-- ============================================================================
-- This file contains demo data for local development and testing.
-- IMPORTANT: Truncate all seeded tables before going live in production.
--
-- This seed does NOT create auth users, gamer profiles, organizer profiles,
-- tournaments, teams, or orders — those should be created through the app.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Staff access keys (for /admin staff login)
-- ---------------------------------------------------------------------------
INSERT INTO public.staff_access_keys (access_key, staff_name, staff_email, is_active, notes)
VALUES
  ('HERU-STAFF-OMAR-2026', 'Omar Abdelgawad', 'omarabdelgawad001@gmail.com', true, 'Super admin key'),
  ('HERU-STAFF-OPS-2026', 'HERU Ops', 'heru.gg.esports@gmail.com', true, 'Operations key')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- App settings (platform-wide configuration)
-- ---------------------------------------------------------------------------
INSERT INTO public.app_settings (setting_key, setting_value, description)
VALUES
  ('platform_fee_percent', '15', 'Platform fee percentage applied to all tournament costs'),
  ('min_coorg_commitment', '33', 'Minimum % commitment for co-organizers on shared tournaments'),
  ('max_parties_per_tournament', '3', 'Maximum parties (main + co-orgs) per shared tournament'),
  ('currency', 'EGP', 'Platform currency — never change this'),
  ('paymob_enabled', 'false', 'Whether Paymob payment gateway is active'),
  ('platform_name', 'HERU.gg', 'Platform display name'),
  ('support_email', 'support@heru.gg', 'Platform support email'),
  ('builder_sponsor_defaults', '{"required_branding":[],"required_talent_count":2,"required_production":[]}', 'Default required items when building a sponsored tournament'),
  ('builder_min_branding', '1', 'Minimum branding items for sponsored tournaments'),
  ('builder_min_talent', '2', 'Minimum talent hires for sponsored tournaments'),
  ('builder_min_production', '1', 'Minimum production items for sponsored tournaments')
ON CONFLICT (setting_key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Games catalog (for game selection dropdowns)
-- ---------------------------------------------------------------------------
INSERT INTO public.games (name, slug, image, is_active, sort_order) VALUES
  ('Valorant', 'valorant', NULL, true, 1),
  ('CS2', 'cs2', NULL, true, 2),
  ('League of Legends', 'league-of-legends', NULL, true, 3),
  ('Dota 2', 'dota-2', NULL, true, 4),
  ('Rocket League', 'rocket-league', NULL, true, 5),
  ('Apex Legends', 'apex-legends', NULL, true, 6),
  ('Fortnite', 'fortnite', NULL, true, 7),
  ('Call of Duty', 'call-of-duty', NULL, true, 8),
  ('Rainbow Six Siege', 'rainbow-six-siege', NULL, true, 9),
  ('Overwatch 2', 'overwatch-2', NULL, true, 10),
  ('FIFA / EA FC', 'ea-fc', NULL, true, 11),
  ('PUBG', 'pubg', NULL, true, 12),
  ('Mobile Legends', 'mobile-legends', NULL, true, 13),
  ('Free Fire', 'free-fire', NULL, true, 14)
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Marketplace items — one demo item in each major category
-- ---------------------------------------------------------------------------
INSERT INTO public.marketplace_items (title, description, category, type, price, is_active) VALUES
  ('Social Media Package', 'Tournament graphics, posts, and story templates for social media promotion', 'branding', 'social', 3000, true),
  ('Banner & Backdrop Design', 'Custom tournament banners and stage backdrops (digital + print)', 'branding', 'physical', 4000, true),
  ('Stream Production - Basic', 'Overlays, transitions, and basic stream setup', 'production', 'basic', 5000, true),
  ('Stream Production - Premium', 'Full broadcast package with replays, analytics, and multi-cam', 'production', 'premium', 12000, true),
  ('Venue - Gaming Cafe (Cairo)', 'Gaming cafe venue rental for a one-day tournament', 'venue', 'cafe', 8000, true),
  ('Venue - Event Hall (Cairo)', 'Professional event hall with stage and audience seating', 'venue', 'hall', 25000, true),
  ('Caster - Arabic', 'Professional Arabic-speaking caster for tournament broadcast', 'live_talent', 'caster', 5000, true),
  ('Caster - English', 'Professional English-speaking caster for tournament broadcast', 'live_talent', 'caster', 6000, true),
  ('Observer/Director', 'In-game observer and stream director', 'live_talent', 'observer', 4000, true),
  ('Valorant Game Setup', 'Full Valorant tournament game server configuration', 'game_setup', 'valorant', 2000, true),
  ('Team Jerseys (8 teams)', 'Custom branded jerseys for 8 teams in tournament', 'teams', 'jerseys', 8000, true),
  ('Cash Prize - EGP 10,000', 'Cash prizepool component', 'prizepool', 'cash', 10000, true),
  ('Cash Prize - EGP 25,000', 'Cash prizepool component', 'prizepool', 'cash', 25000, true),
  ('Gaming Headset Prizes', 'Premium gaming headsets for top 3 teams', 'prizepool', 'physical', 6000, true)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Promo codes — demo discount codes for marketplace
-- ---------------------------------------------------------------------------
INSERT INTO public.promo_codes (code, discount_percent, description, is_active, max_uses, expires_at) VALUES
  ('HERU10', 10, '10% off your first order — welcome discount', true, 100, '2027-12-31 23:59:59+00'),
  ('LAUNCH25', 25, '25% launch promotion — limited time', true, 50, '2026-09-30 23:59:59+00'),
  ('EXPIRED5', 5, '5% discount — this code has expired', true, 100, '2025-01-01 00:00:00+00')
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Default achievements (unlockable by gamers)
-- ---------------------------------------------------------------------------
INSERT INTO public.achievements (key, name, title, description, icon, category, criteria) VALUES
  ('first_tournament', 'First Steps', 'First Steps', 'Joined your first tournament', '🎮', 'tournament', '{"type":"tournaments_played","count":1}'),
  ('first_win', 'Victory!', 'Victory!', 'Won your first match', '🏆', 'tournament', '{"type":"wins","count":1}'),
  ('tournament_champion', 'Champion', 'Champion', 'Won a tournament', '👑', 'tournament', '{"type":"tournaments_won","count":1}'),
  ('team_creator', 'Team Builder', 'Team Builder', 'Created your first team', '🛡️', 'team', '{"type":"teams_created","count":1}'),
  ('five_tournaments', 'Veteran', 'Veteran', 'Played in 5 tournaments', '⭐', 'milestone', '{"type":"tournaments_played","count":5}'),
  ('ten_wins', 'Unstoppable', 'Unstoppable', 'Won 10 matches', '🔥', 'milestone', '{"type":"wins","count":10}'),
  ('three_teams', 'Multi-Roster', 'Multi-Roster', 'Member of 3 different teams', '🎯', 'team', '{"type":"teams_joined","count":3}')
ON CONFLICT (key) DO NOTHING;
