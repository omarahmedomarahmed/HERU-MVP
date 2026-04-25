-- ============================================================
-- HERU.gg — Fresh Schema: Gamers, Teams, Tournaments
-- Migration: 101_fresh_schema_gamers.sql
-- ============================================================

-- ============================================================
-- SECTION 1: GAMER PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS gamer_profiles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID UNIQUE NOT NULL,
  username            TEXT UNIQUE,
  bio                 TEXT,
  avatar              TEXT,
  banner              TEXT,
  region              TEXT,
  country             TEXT,
  games               TEXT[] DEFAULT '{}',
  wins                INT NOT NULL DEFAULT 0,
  losses              INT NOT NULL DEFAULT 0,
  tournaments_played  INT NOT NULL DEFAULT 0,
  team_count          INT NOT NULL DEFAULT 0,
  is_public           BOOLEAN NOT NULL DEFAULT TRUE,
  notifications       JSONB DEFAULT '[]',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gamer_profiles_user_id ON gamer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_gamer_profiles_username ON gamer_profiles(username);

-- ============================================================
-- SECTION 2: TEAMS
-- ============================================================

CREATE TABLE IF NOT EXISTS teams (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  tag            TEXT,
  logo           TEXT,
  description    TEXT,
  region         TEXT,
  games          TEXT[] DEFAULT '{}',
  owner_id       UUID NOT NULL,
  is_recruiting  BOOLEAN NOT NULL DEFAULT FALSE,
  max_members    INT DEFAULT 10,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id     UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL,
  role        TEXT DEFAULT 'member' CHECK (role IN ('owner','captain','member','sub')),
  custom_role TEXT,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE IF NOT EXISTS team_join_requests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id     UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  message     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- ============================================================
-- SECTION 3: TOURNAMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS tournaments (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 TEXT NOT NULL,
  slug                 TEXT UNIQUE,
  organizer_id         UUID NOT NULL,
  game                 TEXT,
  format               TEXT,
  status               TEXT NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft','published','live','completed','cancelled')),
  max_teams            INT,
  max_players_per_team INT DEFAULT 5,
  registration_open    BOOLEAN NOT NULL DEFAULT FALSE,
  start_date           TIMESTAMPTZ,
  end_date             TIMESTAMPTZ,
  prizepool_total      NUMERIC(12,2) DEFAULT 0,
  entry_fee            NUMERIC(10,2) DEFAULT 0,
  tournament_image     TEXT,
  rules                TEXT,
  is_online            BOOLEAN NOT NULL DEFAULT TRUE,
  venue_id             UUID,
  skill_level          TEXT DEFAULT 'open' CHECK (skill_level IN ('open','beginner','intermediate','advanced','pro')),
  is_featured          BOOLEAN NOT NULL DEFAULT FALSE,
  sponsorship_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  organizer_brand      JSONB,
  signup_page          JSONB DEFAULT '{}',
  brackets             JSONB DEFAULT '[]',
  general_chat         JSONB DEFAULT '[]',
  support_chat         JSONB DEFAULT '[]',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tournament_teams (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id      UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  seed         INT,
  checked_in   BOOLEAN NOT NULL DEFAULT FALSE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tournament_id, team_id)
);

CREATE TABLE IF NOT EXISTS tournament_players (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL,
  team_id       UUID REFERENCES teams(id),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

CREATE TABLE IF NOT EXISTS tournament_join_requests (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id  UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id        UUID REFERENCES teams(id),
  user_id        UUID NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  message        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Match records
CREATE TABLE IF NOT EXISTS match_records (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id  UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round          INT NOT NULL,
  match_number   INT NOT NULL,
  team1_id       UUID REFERENCES teams(id),
  team2_id       UUID REFERENCES teams(id),
  winner_id      UUID REFERENCES teams(id),
  score_team1    INT DEFAULT 0,
  score_team2    INT DEFAULT 0,
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','disputed')),
  submitted_by   UUID,
  result_proof   TEXT,
  played_at      TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tournament reports (post-event reports for sponsors)
CREATE TABLE IF NOT EXISTS tournament_reports (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id  UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  organizer_id   UUID NOT NULL,
  summary        TEXT,
  total_viewers  INT DEFAULT 0,
  total_reach    INT DEFAULT 0,
  highlights_url TEXT,
  deliverables   JSONB DEFAULT '[]',
  analytics_data JSONB DEFAULT '{}',
  is_published   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Venues (offline event locations)
CREATE TABLE IF NOT EXISTS venues (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  address      TEXT,
  city         TEXT,
  country      TEXT,
  capacity     INT,
  hourly_rate  NUMERIC(10,2),
  images       TEXT[] DEFAULT '{}',
  contact_info JSONB DEFAULT '{}',
  submitted_by UUID,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leaderboards
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL,
  game           TEXT NOT NULL,
  region         TEXT,
  season         TEXT DEFAULT 'all-time',
  score          INT NOT NULL DEFAULT 0,
  wins           INT NOT NULL DEFAULT 0,
  losses         INT NOT NULL DEFAULT 0,
  rank_position  INT,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, game, season)
);

-- Social: Friendships
CREATE TABLE IF NOT EXISTS friendships (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL,
  friend_id   UUID NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','blocked')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Social: Direct Messages
CREATE TABLE IF NOT EXISTS direct_messages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id    UUID NOT NULL,
  recipient_id UUID NOT NULL,
  message      TEXT NOT NULL,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gamer connect (Riot, Discord)
CREATE TABLE IF NOT EXISTS connected_accounts (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL,
  provider             TEXT NOT NULL CHECK (provider IN ('riot','discord')),
  provider_account_id  TEXT,
  game_key             TEXT,
  game_name            TEXT,
  tag_line             TEXT,
  rank_tier            TEXT,
  rank_division        TEXT,
  wins                 INT DEFAULT 0,
  losses               INT DEFAULT 0,
  profile_icon_id      INT,
  match_history_cache  JSONB DEFAULT '[]',
  synced_at            TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Promo codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT UNIQUE NOT NULL,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percent','fixed')),
  discount_value  NUMERIC(10,2) NOT NULL,
  max_uses        INT,
  used_count      INT NOT NULL DEFAULT 0,
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User reports (abuse reporting)
CREATE TABLE IF NOT EXISTS user_reports (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id      UUID NOT NULL,
  reported_user_id UUID NOT NULL,
  reason           TEXT NOT NULL,
  details          TEXT,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','resolved','dismissed')),
  resolution_notes TEXT,
  resolved_by      UUID,
  resolved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_organizer_id ON tournaments(organizer_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_game ON tournaments(game);
CREATE INDEX IF NOT EXISTS idx_tournaments_sponsorship_enabled ON tournaments(sponsorship_enabled);
CREATE INDEX IF NOT EXISTS idx_tournament_teams_tournament_id ON tournament_teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_match_records_tournament_id ON match_records(tournament_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_game_season ON leaderboard_entries(game, season, score DESC);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_recipient ON direct_messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient_id ON direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON connected_accounts(user_id);
