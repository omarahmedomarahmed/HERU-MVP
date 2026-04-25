-- ============================================================
-- HERU.gg — Schema Completeness Migration (109)
-- Fixes all gaps between migration 100-108 and backend routes.
-- Safe to run on any existing DB that has 100-108 applied.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. STAFF SESSIONS TABLE (completely missing from 100-108)
--    Used by: backend/src/routes/auth.js, middleware/staffGuard.js
-- ────────────────────────────────────────────────────────────
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

ALTER TABLE staff_sessions ENABLE ROW LEVEL SECURITY;

-- Staff sessions only accessible via service role (backend)
CREATE POLICY "Service role only on staff_sessions"
  ON staff_sessions FOR ALL
  USING (FALSE);

-- ────────────────────────────────────────────────────────────
-- 2. TEAMS TABLE — add missing columns used by backend
--    backend uses: leader_id, members[], join_requests, tournament_invites
--    migration 101 only has: owner_id (no array columns)
-- ────────────────────────────────────────────────────────────
ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS leader_id          UUID,
  ADD COLUMN IF NOT EXISTS members            UUID[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS join_requests      JSONB   DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS tournament_invites JSONB   DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Back-fill leader_id from owner_id for existing rows
UPDATE teams SET leader_id = owner_id WHERE leader_id IS NULL AND owner_id IS NOT NULL;

-- Back-fill members array from owner_id
UPDATE teams SET members = ARRAY[owner_id] WHERE members = '{}' AND owner_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_teams_leader_id ON teams(leader_id);

-- ────────────────────────────────────────────────────────────
-- 3. TOURNAMENTS TABLE — add columns used by backend routes
--    and new TournamentBuilder
-- ────────────────────────────────────────────────────────────
ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS participant_type           TEXT     DEFAULT 'team',
  ADD COLUMN IF NOT EXISTS tournament_type            TEXT     DEFAULT 'solo',
  ADD COLUMN IF NOT EXISTS schedule                   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS description                TEXT,
  ADD COLUMN IF NOT EXISTS is_offline                 BOOLEAN  DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS venue                      TEXT,
  ADD COLUMN IF NOT EXISTS stream_link                TEXT,
  ADD COLUMN IF NOT EXISTS stream_embed_url           TEXT,
  ADD COLUMN IF NOT EXISTS main_organizer_id          UUID,
  ADD COLUMN IF NOT EXISTS co_organizers              JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS organizer_chat             JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS tournament_log             JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS teams                      JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS invited_teams              JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS player_invites             JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS gamer_invites              JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS player_participants        JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS gamer_participants         JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS talents                    JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS branding_items             JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS production_items           JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS prizepool_items            JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS venue_items                JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS prize_breakdown            JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS prizepool_coins            INT      DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_cost                 NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_fee               NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_fee_percent       NUMERIC(5,2)  DEFAULT 15,
  ADD COLUMN IF NOT EXISTS prizepool_in_total_cost    BOOLEAN  DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sponsorship_radar_id       UUID,
  ADD COLUMN IF NOT EXISTS radar_funding_percent      NUMERIC(5,2)  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS required_branding_committed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS signup_banner              TEXT,
  ADD COLUMN IF NOT EXISTS signup_description         TEXT,
  ADD COLUMN IF NOT EXISTS signup_rules               TEXT,
  ADD COLUMN IF NOT EXISTS signup_custom_fields       JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS organizer_contribution     NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS riot_provider_id           TEXT,
  ADD COLUMN IF NOT EXISTS riot_tournament_id         TEXT,
  ADD COLUMN IF NOT EXISTS riot_region                TEXT,
  ADD COLUMN IF NOT EXISTS val_map_pool               JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS val_act_id                 TEXT;

-- Sync schedule from start_date for existing rows
UPDATE tournaments SET schedule = start_date WHERE schedule IS NULL AND start_date IS NOT NULL;

-- ────────────────────────────────────────────────────────────
-- 4. SUBSCRIPTIONS TABLE — add columns expected by backend
--    backend inserts: plan, amount, billing_cycle, renewal_date, updated_at
--    migration 104 only has: tier, price_egp (no billing info)
-- ────────────────────────────────────────────────────────────
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS plan           TEXT,
  ADD COLUMN IF NOT EXISTS amount         NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS billing_cycle  TEXT    DEFAULT 'monthly'
                                          CHECK (billing_cycle IN ('monthly','annual')),
  ADD COLUMN IF NOT EXISTS renewal_date   DATE,
  ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ DEFAULT NOW();

-- Back-fill plan from tier for existing rows
UPDATE subscriptions SET plan = tier WHERE plan IS NULL AND tier IS NOT NULL;

-- ────────────────────────────────────────────────────────────
-- 5. SPONSOR_PROFILES TABLE — add subscription tracking columns
--    backend updates: subscription_plan, subscription_status,
--                     subscription_renewal_date, updated_at
-- ────────────────────────────────────────────────────────────
ALTER TABLE sponsor_profiles
  ADD COLUMN IF NOT EXISTS subscription_plan         TEXT    DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status       TEXT    DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS subscription_renewal_date DATE,
  ADD COLUMN IF NOT EXISTS updated_at                TIMESTAMPTZ DEFAULT NOW();

-- ────────────────────────────────────────────────────────────
-- 6. HERU_REVENUE_LEDGER — add column aliases for backend
--    backend uses: source_type, source_id, net_amount
--    migration 104 defined: stream, entity_type, entity_id, net_to_party
--    Adding both names so backend inserts work without rewriting routes
-- ────────────────────────────────────────────────────────────
ALTER TABLE heru_revenue_ledger
  ADD COLUMN IF NOT EXISTS source_type  TEXT,
  ADD COLUMN IF NOT EXISTS source_id    UUID,
  ADD COLUMN IF NOT EXISTS net_amount   NUMERIC(12,2);

-- Back-fill aliases from canonical columns for existing rows
UPDATE heru_revenue_ledger
  SET source_type = stream,
      source_id   = entity_id,
      net_amount  = COALESCE(net_to_party, 0)
  WHERE source_type IS NULL;

-- ────────────────────────────────────────────────────────────
-- 7. COACHING_SESSIONS — add gamer_rating, gamer_review, duration_minutes
--    used by GamerBookings.jsx frontend display
-- ────────────────────────────────────────────────────────────
ALTER TABLE coaching_sessions
  ADD COLUMN IF NOT EXISTS gamer_rating   INT CHECK (gamer_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS gamer_review   TEXT,
  ADD COLUMN IF NOT EXISTS session_type   TEXT DEFAULT 'coaching',
  ADD COLUMN IF NOT EXISTS duration_minutes INT GENERATED ALWAYS AS
    (ROUND(COALESCE(duration_hours, 1) * 60)::INT) STORED;

-- ────────────────────────────────────────────────────────────
-- 8. CONNECTED_ACCOUNTS — add missing extended Riot fields
--    used by public profile display
-- ────────────────────────────────────────────────────────────
ALTER TABLE connected_accounts
  ADD COLUMN IF NOT EXISTS is_primary       BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS champion_mastery JSONB   DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS rank_lp          INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS val_rank_tier    TEXT,
  ADD COLUMN IF NOT EXISTS val_rank_rating  INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS region           TEXT;

-- ────────────────────────────────────────────────────────────
-- 9. SERVICE_BOOKINGS — add total_price alias (frontend uses it)
--    frontend GamerBookings shows session.price / session.total_price
-- ────────────────────────────────────────────────────────────
ALTER TABLE service_bookings
  ADD COLUMN IF NOT EXISTS total_price NUMERIC(12,2);

UPDATE service_bookings SET total_price = amount WHERE total_price IS NULL;

-- ────────────────────────────────────────────────────────────
-- 10. GAMER_PROFILES — add missing columns used by frontend/backend
-- ────────────────────────────────────────────────────────────
ALTER TABLE gamer_profiles
  ADD COLUMN IF NOT EXISTS cover_image     TEXT,
  ADD COLUMN IF NOT EXISTS talent_type     TEXT,
  ADD COLUMN IF NOT EXISTS talent_price    NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS talent_rating   NUMERIC(3,2),
  ADD COLUMN IF NOT EXISTS talent_video_link TEXT,
  ADD COLUMN IF NOT EXISTS is_talent       BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS team_ids        UUID[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS username_slug   TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS games_detail    JSONB   DEFAULT '[]';

CREATE UNIQUE INDEX IF NOT EXISTS idx_gamer_profiles_username_slug
  ON gamer_profiles(username_slug) WHERE username_slug IS NOT NULL;

-- ────────────────────────────────────────────────────────────
-- 11. DIRECT_MESSAGES — normalize column names
--    backend uses: content (not message), read_at, conversation_id
-- ────────────────────────────────────────────────────────────
ALTER TABLE direct_messages
  ADD COLUMN IF NOT EXISTS content         TEXT,
  ADD COLUMN IF NOT EXISTS read_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS conversation_id TEXT;

-- Back-fill content from message
UPDATE direct_messages SET content = message WHERE content IS NULL AND message IS NOT NULL;

-- ────────────────────────────────────────────────────────────
-- 12. RLS — enable on new staff_sessions (already done above)
--     and update policies for new columns
-- ────────────────────────────────────────────────────────────

-- Allow authenticated users to read their own connected accounts
DROP POLICY IF EXISTS "Users can read own connected accounts" ON connected_accounts;
CREATE POLICY "Users can read own connected accounts"
  ON connected_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public can read connected accounts"
  ON connected_accounts FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Public can read connected accounts" ON connected_accounts;
CREATE POLICY "Public can read connected accounts"
  ON connected_accounts FOR SELECT
  USING (TRUE);

-- ────────────────────────────────────────────────────────────
-- 13. MISSING INDEXES for new columns
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tournaments_participant_type ON tournaments(participant_type);
CREATE INDEX IF NOT EXISTS idx_tournaments_is_internal      ON tournaments(is_internal) WHERE is_internal = TRUE;
CREATE INDEX IF NOT EXISTS idx_coaching_gamer_id            ON coaching_sessions(gamer_id);
CREATE INDEX IF NOT EXISTS idx_coaching_coach_id            ON coaching_sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_revenue_source_type          ON heru_revenue_ledger(source_type);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_game_name ON connected_accounts(game_name);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan           ON subscriptions(plan);

-- ────────────────────────────────────────────────────────────
-- 14. SERVICE_BOOKINGS — add net_to_provider alias
--     backend inserts: net_to_provider (migration 103 has: net_amount)
-- ────────────────────────────────────────────────────────────
ALTER TABLE service_bookings
  ADD COLUMN IF NOT EXISTS net_to_provider NUMERIC(12,2);

UPDATE service_bookings
  SET net_to_provider = net_amount
  WHERE net_to_provider IS NULL AND net_amount IS NOT NULL;

-- ────────────────────────────────────────────────────────────
-- 15. USER_PROFILES — add missing columns for full_name lookup
--    The friends search uses full_name which is already present,
--    but also needs username for gamer tag search via JOIN.
--    Add phone/whatsapp for organizer contact (used in profile forms).
-- ────────────────────────────────────────────────────────────
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS phone     TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp  TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ────────────────────────────────────────────────────────────
-- 16. ORGANIZER_PROFILES — add missing contact fields
-- ────────────────────────────────────────────────────────────
ALTER TABLE organizer_profiles
  ADD COLUMN IF NOT EXISTS contact_number TEXT,
  ADD COLUMN IF NOT EXISTS contact_email  TEXT,
  ADD COLUMN IF NOT EXISTS tiktok         TEXT,
  ADD COLUMN IF NOT EXISTS facebook       TEXT;

-- ────────────────────────────────────────────────────────────
-- 17. GAMES TABLE — for useGames hook (/api/games endpoint)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS games (
  id         UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT    UNIQUE NOT NULL,
  slug       TEXT    UNIQUE,
  logo_url   TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT     DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active games"
  ON games FOR SELECT
  USING (is_active = TRUE);

-- Seed default games list
INSERT INTO games (name, slug, is_active, sort_order) VALUES
  ('Valorant',             'valorant',           TRUE,  1),
  ('League of Legends',    'league-of-legends',  TRUE,  2),
  ('CS2',                  'cs2',                TRUE,  3),
  ('Dota 2',               'dota-2',             TRUE,  4),
  ('Rocket League',        'rocket-league',      TRUE,  5),
  ('Apex Legends',         'apex-legends',       TRUE,  6),
  ('Fortnite',             'fortnite',           TRUE,  7),
  ('Call of Duty',         'call-of-duty',       TRUE,  8),
  ('Rainbow Six Siege',    'rainbow-six',        TRUE,  9),
  ('Overwatch 2',          'overwatch-2',        TRUE,  10),
  ('FIFA / EA FC',         'fifa-ea-fc',         TRUE,  11),
  ('PUBG',                 'pubg',               TRUE,  12),
  ('Mobile Legends',       'mobile-legends',     TRUE,  13),
  ('Free Fire',            'free-fire',          TRUE,  14)
ON CONFLICT (name) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_games_is_active ON games(is_active, sort_order);

-- ────────────────────────────────────────────────────────────
-- 18. NOTIFICATIONS TABLE — for /api/notifications endpoint
--     GamerLayout polls for unread notification count
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID    NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  message     TEXT,
  link        TEXT,
  type        TEXT    DEFAULT 'info',
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  metadata    JSONB   DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread  ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ────────────────────────────────────────────────────────────
-- End of migration 109
-- After applying this, all backend routes should function
-- correctly on a fresh database install.
-- ────────────────────────────────────────────────────────────
