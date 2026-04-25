-- ============================================================
-- HERU.gg — Gamers, Teams & Tournaments Schema
-- Migration: 101_gamers.sql
-- Tables: gamer_profiles, connected_accounts, teams,
--         tournaments (+ sub-tables), match_records,
--         leaderboard_entries, friendships, direct_messages,
--         promo_codes, user_reports
-- ============================================================

-- ============================================================
-- GAMER PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS gamer_profiles (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID        UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  username            TEXT        UNIQUE,
  username_slug       TEXT        UNIQUE,
  bio                 TEXT,
  avatar              TEXT,
  banner              TEXT,
  cover_image         TEXT,
  region              TEXT,
  country             TEXT,
  games               TEXT[]      DEFAULT '{}',
  games_detail        JSONB       DEFAULT '[]',
  wins                INT         NOT NULL DEFAULT 0,
  losses              INT         NOT NULL DEFAULT 0,
  tournaments_played  INT         NOT NULL DEFAULT 0,
  team_count          INT         NOT NULL DEFAULT 0,
  team_ids            UUID[]      DEFAULT '{}',
  -- Talent / content creator fields
  is_talent           BOOLEAN     NOT NULL DEFAULT FALSE,
  talent_type         TEXT,
  talent_price        NUMERIC(10,2),
  talent_rating       NUMERIC(3,2),
  talent_video_link   TEXT,
  is_public           BOOLEAN     NOT NULL DEFAULT TRUE,
  notifications       JSONB       DEFAULT '[]',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gamer_profiles_user_id       ON gamer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_gamer_profiles_username      ON gamer_profiles(username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_gamer_profiles_slug
  ON gamer_profiles(username_slug) WHERE username_slug IS NOT NULL;

-- ============================================================
-- CONNECTED ACCOUNTS
-- Riot (LoL/Val), Discord, and future providers
-- ============================================================

CREATE TABLE IF NOT EXISTS connected_accounts (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  provider             TEXT        NOT NULL CHECK (provider IN ('riot','discord')),
  provider_account_id  TEXT,
  game_key             TEXT,
  game_name            TEXT,
  tag_line             TEXT,
  rank_tier            TEXT,
  rank_division        TEXT,
  rank_lp              INT         DEFAULT 0,
  wins                 INT         DEFAULT 0,
  losses               INT         DEFAULT 0,
  profile_icon_id      INT,
  is_primary           BOOLEAN     DEFAULT FALSE,
  region               TEXT,
  champion_mastery     JSONB       DEFAULT '[]',
  match_history_cache  JSONB       DEFAULT '[]',
  -- Valorant-specific
  val_rank_tier        TEXT,
  val_rank_rating      INT         DEFAULT 0,
  synced_at            TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id   ON connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_game_name ON connected_accounts(game_name);

-- ============================================================
-- TEAMS
-- leader_id is the canonical owner field used by the backend
-- ============================================================

CREATE TABLE IF NOT EXISTS teams (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT        NOT NULL,
  tag                 TEXT,
  logo                TEXT,
  description         TEXT,
  region              TEXT,
  games               TEXT[]      DEFAULT '{}',
  leader_id           UUID        NOT NULL REFERENCES user_profiles(id),
  members             UUID[]      DEFAULT '{}',
  join_requests       JSONB       DEFAULT '[]',
  tournament_invites  JSONB       DEFAULT '[]',
  is_recruiting       BOOLEAN     NOT NULL DEFAULT FALSE,
  max_members         INT         DEFAULT 10,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id     UUID        NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role        TEXT        DEFAULT 'member' CHECK (role IN ('owner','captain','member','sub')),
  custom_role TEXT,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE IF NOT EXISTS team_join_requests (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id    UUID        NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  status     TEXT        NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending','accepted','rejected')),
  message    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_teams_leader_id      ON teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- ============================================================
-- TOURNAMENTS
-- Full column set used by backend routes and TournamentBuilder
-- ============================================================

CREATE TABLE IF NOT EXISTS tournaments (
  id                           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                         TEXT        NOT NULL,
  slug                         TEXT        UNIQUE,
  organizer_id                 UUID        NOT NULL REFERENCES user_profiles(id),
  main_organizer_id            UUID        REFERENCES user_profiles(id),
  game                         TEXT,
  format                       TEXT,
  participant_type             TEXT        DEFAULT 'team'
                               CHECK (participant_type IN ('team','solo','duo')),
  tournament_type              TEXT        DEFAULT 'bracket',
  status                       TEXT        NOT NULL DEFAULT 'draft'
                               CHECK (status IN ('draft','published','live','completed','cancelled')),
  max_teams                    INT,
  max_players_per_team         INT         DEFAULT 5,
  registration_open            BOOLEAN     NOT NULL DEFAULT FALSE,
  start_date                   TIMESTAMPTZ,
  end_date                     TIMESTAMPTZ,
  schedule                     TIMESTAMPTZ,
  description                  TEXT,
  prizepool_total              NUMERIC(12,2) DEFAULT 0,
  prizepool_coins              INT         DEFAULT 0,
  prize_breakdown              JSONB       DEFAULT '[]',
  entry_fee                    NUMERIC(10,2) DEFAULT 0,
  total_cost                   NUMERIC(12,2) DEFAULT 0,
  platform_fee                 NUMERIC(12,2) DEFAULT 0,
  platform_fee_percent         NUMERIC(5,2)  DEFAULT 15,
  organizer_contribution       NUMERIC(12,2) DEFAULT 0,
  prizepool_in_total_cost      BOOLEAN     DEFAULT FALSE,
  tournament_image             TEXT,
  rules                        TEXT,
  is_online                    BOOLEAN     NOT NULL DEFAULT TRUE,
  is_offline                   BOOLEAN     NOT NULL DEFAULT FALSE,
  venue_name                   TEXT,
  venue                        TEXT,
  venue_type                   TEXT        DEFAULT 'online',
  skill_level                  TEXT        DEFAULT 'open'
                               CHECK (skill_level IN ('open','beginner','intermediate','advanced','pro')),
  is_featured                  BOOLEAN     NOT NULL DEFAULT FALSE,
  is_internal                  BOOLEAN     DEFAULT FALSE,
  internal_event_type          TEXT,
  company_name                 TEXT,
  invite_code                  TEXT,
  sponsorship_enabled          BOOLEAN     NOT NULL DEFAULT FALSE,
  sponsorship_radar_id         UUID,
  radar_funding_percent        NUMERIC(5,2) DEFAULT 0,
  required_branding_committed  BOOLEAN     DEFAULT FALSE,
  organizer_brand              JSONB,
  co_organizers                JSONB       DEFAULT '[]',
  -- Stream / broadcast
  stream_link                  TEXT,
  stream_embed_url             TEXT,
  -- Participants (denormalised JSONB for quick reads)
  teams                        JSONB       DEFAULT '[]',
  invited_teams                JSONB       DEFAULT '[]',
  player_invites               JSONB       DEFAULT '[]',
  gamer_invites                JSONB       DEFAULT '[]',
  player_participants          JSONB       DEFAULT '[]',
  gamer_participants           JSONB       DEFAULT '[]',
  -- Services attached to this tournament
  talents                      JSONB       DEFAULT '[]',
  branding_items               JSONB       DEFAULT '[]',
  production_items             JSONB       DEFAULT '[]',
  prizepool_items              JSONB       DEFAULT '[]',
  venue_items                  JSONB       DEFAULT '[]',
  -- Signup page
  signup_banner                TEXT,
  signup_description           TEXT,
  signup_rules                 TEXT,
  signup_custom_fields         JSONB       DEFAULT '[]',
  signup_page                  JSONB       DEFAULT '{}',
  -- Chat logs
  general_chat                 JSONB       DEFAULT '[]',
  support_chat                 JSONB       DEFAULT '[]',
  organizer_chat               JSONB       DEFAULT '[]',
  tournament_log               JSONB       DEFAULT '[]',
  brackets                     JSONB       DEFAULT '[]',
  -- Riot integration
  riot_provider_id             TEXT,
  riot_tournament_id           TEXT,
  riot_region                  TEXT,
  val_map_pool                 JSONB       DEFAULT '[]',
  val_act_id                   TEXT,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tournament_invite_code
  ON tournaments(invite_code) WHERE invite_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tournaments_status           ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_organizer_id     ON tournaments(organizer_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_game             ON tournaments(game);
CREATE INDEX IF NOT EXISTS idx_tournaments_sponsorship      ON tournaments(sponsorship_enabled);
CREATE INDEX IF NOT EXISTS idx_tournaments_participant_type ON tournaments(participant_type);
CREATE INDEX IF NOT EXISTS idx_tournaments_is_internal
  ON tournaments(is_internal) WHERE is_internal = TRUE;

-- ============================================================
-- TOURNAMENT SUB-TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS tournament_teams (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID        NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id       UUID        NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  seed          INT,
  checked_in    BOOLEAN     NOT NULL DEFAULT FALSE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tournament_id, team_id)
);

CREATE TABLE IF NOT EXISTS tournament_players (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID        NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  team_id       UUID        REFERENCES teams(id),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

CREATE TABLE IF NOT EXISTS tournament_join_requests (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID        NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id       UUID        REFERENCES teams(id),
  user_id       UUID        NOT NULL REFERENCES user_profiles(id),
  status        TEXT        NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','accepted','rejected')),
  message       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_records (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID        NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round         INT         NOT NULL,
  match_number  INT         NOT NULL,
  team1_id      UUID        REFERENCES teams(id),
  team2_id      UUID        REFERENCES teams(id),
  winner_id     UUID        REFERENCES teams(id),
  score_team1   INT         DEFAULT 0,
  score_team2   INT         DEFAULT 0,
  status        TEXT        DEFAULT 'pending'
                CHECK (status IN ('pending','in_progress','completed','disputed')),
  submitted_by  UUID,
  result_proof  TEXT,
  played_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tournament_reports (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id  UUID        NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  organizer_id   UUID        NOT NULL REFERENCES user_profiles(id),
  summary        TEXT,
  total_viewers  INT         DEFAULT 0,
  total_reach    INT         DEFAULT 0,
  highlights_url TEXT,
  deliverables   JSONB       DEFAULT '[]',
  analytics_data JSONB       DEFAULT '{}',
  is_published   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tournament_teams_tournament_id ON tournament_teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_match_records_tournament_id    ON match_records(tournament_id);

-- ============================================================
-- LEADERBOARDS
-- ============================================================

CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  game          TEXT        NOT NULL,
  region        TEXT,
  season        TEXT        DEFAULT 'all-time',
  score         INT         NOT NULL DEFAULT 0,
  wins          INT         NOT NULL DEFAULT 0,
  losses        INT         NOT NULL DEFAULT 0,
  rank_position INT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, game, season)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_game_season
  ON leaderboard_entries(game, season, score DESC);

-- ============================================================
-- SOCIAL: FRIENDSHIPS
-- ============================================================

CREATE TABLE IF NOT EXISTS friendships (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  friend_id  UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  status     TEXT        NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending','accepted','blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user_id   ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);

-- ============================================================
-- SOCIAL: DIRECT MESSAGES
-- content is canonical; message kept for legacy reads
-- ============================================================

CREATE TABLE IF NOT EXISTS direct_messages (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id       UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  recipient_id    UUID        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  conversation_id TEXT,
  content         TEXT,
  message         TEXT,
  is_read         BOOLEAN     NOT NULL DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_recipient
  ON direct_messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient_id
  ON direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation_id
  ON direct_messages(conversation_id);

-- ============================================================
-- PROMO CODES
-- ============================================================

CREATE TABLE IF NOT EXISTS promo_codes (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  code           TEXT        UNIQUE NOT NULL,
  discount_type  TEXT        NOT NULL CHECK (discount_type IN ('percent','fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  max_uses       INT,
  used_count     INT         NOT NULL DEFAULT 0,
  expires_at     TIMESTAMPTZ,
  is_active      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER REPORTS (abuse)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_reports (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id      UUID        NOT NULL REFERENCES user_profiles(id),
  reported_user_id UUID        NOT NULL REFERENCES user_profiles(id),
  reason           TEXT        NOT NULL,
  details          TEXT,
  status           TEXT        NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','reviewed','resolved','dismissed')),
  resolution_notes TEXT,
  resolved_by      UUID,
  resolved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
