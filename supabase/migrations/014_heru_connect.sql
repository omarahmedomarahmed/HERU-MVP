-- 014_heru_connect.sql
-- HERU CONNECT: external account linking, Riot stats, Discord bot, AI agent sessions

-- Discord + future OAuth platforms (one row per user per platform)
CREATE TABLE IF NOT EXISTS public.connected_accounts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform          TEXT NOT NULL CHECK (platform IN ('discord', 'twitch', 'youtube')),
  platform_user_id  TEXT NOT NULL,
  platform_username TEXT,
  platform_avatar   TEXT,
  platform_email    TEXT,
  access_token      TEXT,
  refresh_token     TEXT,
  token_expires_at  TIMESTAMPTZ,
  scopes            TEXT[] DEFAULT '{}',
  raw_data          JSONB DEFAULT '{}',
  is_active         BOOLEAN DEFAULT true,
  last_synced_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Riot accounts: multiple per user per game (LoL + Valorant)
CREATE TABLE IF NOT EXISTS public.riot_accounts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_key          TEXT NOT NULL CHECK (game_key IN ('lol', 'valorant')),
  game_name         TEXT NOT NULL,
  tag_line          TEXT NOT NULL,
  puuid             TEXT NOT NULL,
  region            TEXT NOT NULL,
  summoner_id       TEXT,
  summoner_level    INTEGER,
  profile_icon_id   INTEGER,
  rank_tier         TEXT,
  rank_division     TEXT,
  rank_lp           INTEGER DEFAULT 0,
  wins              INTEGER DEFAULT 0,
  losses            INTEGER DEFAULT 0,
  is_primary        BOOLEAN DEFAULT false,
  is_public         BOOLEAN DEFAULT true,
  raw_rank_data     JSONB DEFAULT '{}',
  last_synced_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Discord bot servers: guild linked to HERU organizer
CREATE TABLE IF NOT EXISTS public.bot_servers (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_guild_id        TEXT NOT NULL UNIQUE,
  discord_guild_name      TEXT,
  discord_guild_icon      TEXT,
  organizer_id            UUID REFERENCES public.organizer_profiles(id) ON DELETE SET NULL,
  tournament_id           UUID REFERENCES public.tournaments(id) ON DELETE SET NULL,
  notification_channel_id TEXT,
  match_channel_id        TEXT,
  general_channel_id      TEXT,
  admin_role_id           TEXT,
  settings                JSONB DEFAULT '{}',
  is_active               BOOLEAN DEFAULT true,
  added_by_user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

-- AI agent sessions: conversation memory per user per channel
CREATE TABLE IF NOT EXISTS public.ai_agent_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  discord_user_id     TEXT,
  channel             TEXT NOT NULL DEFAULT 'web' CHECK (channel IN ('web', 'discord')),
  discord_channel_id  TEXT,
  discord_guild_id    TEXT,
  messages            JSONB DEFAULT '[]',
  context_summary     TEXT,
  last_active_at      TIMESTAMPTZ DEFAULT now(),
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.connected_accounts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riot_accounts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_servers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_sessions    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "connected_accounts_owner" ON public.connected_accounts
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "connected_accounts_service" ON public.connected_accounts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "riot_accounts_owner" ON public.riot_accounts
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "riot_accounts_public_read" ON public.riot_accounts
  FOR SELECT USING (is_public = true);
CREATE POLICY "riot_accounts_service" ON public.riot_accounts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "bot_servers_service" ON public.bot_servers
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "ai_sessions_owner" ON public.ai_agent_sessions
  FOR ALL USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user ON public.connected_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_platform_uid ON public.connected_accounts(platform, platform_user_id);
CREATE INDEX IF NOT EXISTS idx_riot_accounts_user ON public.riot_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_riot_accounts_puuid ON public.riot_accounts(puuid);
CREATE INDEX IF NOT EXISTS idx_riot_accounts_user_game ON public.riot_accounts(user_id, game_key);
CREATE INDEX IF NOT EXISTS idx_bot_servers_guild ON public.bot_servers(discord_guild_id);
CREATE INDEX IF NOT EXISTS idx_bot_servers_organizer ON public.bot_servers(organizer_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user ON public.ai_agent_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_discord ON public.ai_agent_sessions(discord_user_id);
