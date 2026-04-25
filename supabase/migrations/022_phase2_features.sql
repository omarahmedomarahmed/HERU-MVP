-- Migration 022: Phase 2 Features
-- coaching_sessions, friendships, direct_messages, leaderboard_entries,
-- managed_service_projects, user_reports, organizer_ratings,
-- provider_portfolio_items, provider_past_projects
-- Plus ALTER TABLE columns on service_provider_profiles and tournaments

-- ─── Extend service_provider_profiles ────────────────────────────────────────

ALTER TABLE service_provider_profiles
  ADD COLUMN IF NOT EXISTS provider_type TEXT CHECK (provider_type IN ('general','coach','influencer','discord_server')) DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS coach_games TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS coach_rank TEXT,
  ADD COLUMN IF NOT EXISTS coach_availability JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS influencer_platforms TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS audience_size INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_views_per_post INTEGER DEFAULT 0;

-- ─── Extend tournaments ───────────────────────────────────────────────────────

ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS skill_level TEXT CHECK (skill_level IN ('open','intermediate','advanced','pro')) DEFAULT 'open';

-- ─── coaching_sessions ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES auth.users NOT NULL,
  gamer_id UUID REFERENCES auth.users NOT NULL,
  service_id UUID REFERENCES services,
  session_type TEXT CHECK (session_type IN ('vod_review','live_session','strategy_call')) DEFAULT 'live_session',
  game TEXT,
  duration_minutes INTEGER DEFAULT 60,
  price NUMERIC NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('pending','confirmed','completed','cancelled')) DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  notes TEXT,
  gamer_rating INTEGER CHECK (gamer_rating BETWEEN 1 AND 5),
  gamer_review TEXT,
  paymob_order_id TEXT,
  paymob_transaction_id TEXT,
  payment_status TEXT CHECK (payment_status IN ('unpaid','paid')) DEFAULT 'unpaid',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── friendships ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users NOT NULL,
  addressee_id UUID REFERENCES auth.users NOT NULL,
  status TEXT CHECK (status IN ('pending','accepted','blocked')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (requester_id, addressee_id)
);

-- ─── direct_messages ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users NOT NULL,
  recipient_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── leaderboard_entries ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gamer_id UUID REFERENCES auth.users NOT NULL,
  game TEXT NOT NULL,
  region TEXT DEFAULT 'MENA',
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  score NUMERIC DEFAULT 0,
  rank_position INTEGER,
  season TEXT DEFAULT '2026-S1',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (gamer_id, game, season)
);

-- ─── managed_service_projects ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS managed_service_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES auth.users NOT NULL,
  assigned_staff_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  description TEXT,
  budget NUMERIC,
  status TEXT CHECK (status IN ('submitted','reviewing','proposal_sent','approved','in_progress','completed','cancelled')) DEFAULT 'submitted',
  proposal_text TEXT,
  proposal_amount NUMERIC,
  deliverables JSONB DEFAULT '[]',
  chat JSONB DEFAULT '[]',
  files JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── user_reports ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users NOT NULL,
  reported_user_id UUID REFERENCES auth.users NOT NULL,
  reason TEXT CHECK (reason IN ('spam','harassment','cheating','inappropriate_content','other')) NOT NULL,
  details TEXT,
  status TEXT CHECK (status IN ('open','reviewed','resolved','dismissed')) DEFAULT 'open',
  reviewed_by UUID REFERENCES auth.users,
  reviewed_at TIMESTAMPTZ,
  staff_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── organizer_ratings ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS organizer_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES auth.users NOT NULL,
  rater_id UUID REFERENCES auth.users NOT NULL,
  tournament_id UUID REFERENCES tournaments,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (organizer_id, rater_id, tournament_id)
);

-- ─── provider_portfolio_items ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS provider_portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image','video','link')) DEFAULT 'image',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── provider_past_projects ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS provider_past_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES auth.users NOT NULL,
  tournament_name TEXT,
  organizer_name TEXT,
  role TEXT,
  year INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_coaching_sessions_coach ON coaching_sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_gamer ON coaching_sessions(gamer_id);
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient ON direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_game ON leaderboard_entries(game, season, score DESC);
CREATE INDEX IF NOT EXISTS idx_managed_service_projects_sponsor ON managed_service_projects(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported ON user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_provider_portfolio_provider ON provider_portfolio_items(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_past_projects_provider ON provider_past_projects(provider_id);

-- ─── Rating Update Functions ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE service_provider_profiles
  SET rating = (
    SELECT AVG(rating)::NUMERIC(3,2)
    FROM reviews
    WHERE reviewee_id = NEW.reviewee_id
  )
  WHERE user_id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_provider_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_provider_rating();

CREATE OR REPLACE FUNCTION update_organizer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE organizer_profiles
  SET rating = (
    SELECT AVG(rating)::NUMERIC(3,2)
    FROM organizer_ratings
    WHERE organizer_id = NEW.organizer_id
  )
  WHERE user_id = NEW.organizer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_organizer_rating
AFTER INSERT OR UPDATE ON organizer_ratings
FOR EACH ROW
EXECUTE FUNCTION update_organizer_rating();

-- ─── RLS Policies ────────────────────────────────────────────────────────────

ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE managed_service_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_past_projects ENABLE ROW LEVEL SECURITY;

-- coaching_sessions: coach or gamer can read their own; service role can do everything
CREATE POLICY "coaching_sessions_own" ON coaching_sessions
  FOR ALL USING (auth.uid() = coach_id OR auth.uid() = gamer_id);

-- friendships: both parties can read
CREATE POLICY "friendships_own" ON friendships
  FOR ALL USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- direct_messages: sender or recipient can read/write
CREATE POLICY "direct_messages_own" ON direct_messages
  FOR ALL USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- leaderboard_entries: anyone can read; owner can write
CREATE POLICY "leaderboard_read" ON leaderboard_entries
  FOR SELECT USING (TRUE);
CREATE POLICY "leaderboard_write_own" ON leaderboard_entries
  FOR INSERT WITH CHECK (auth.uid() = gamer_id);
CREATE POLICY "leaderboard_update_own" ON leaderboard_entries
  FOR UPDATE USING (auth.uid() = gamer_id);

-- managed_service_projects: sponsor can read/write own
CREATE POLICY "managed_projects_own" ON managed_service_projects
  FOR ALL USING (auth.uid() = sponsor_id);

-- user_reports: reporter can read own; staff via service role
CREATE POLICY "user_reports_reporter" ON user_reports
  FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "user_reports_insert" ON user_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- organizer_ratings: anyone can read; rater can write own
CREATE POLICY "organizer_ratings_read" ON organizer_ratings
  FOR SELECT USING (TRUE);
CREATE POLICY "organizer_ratings_write" ON organizer_ratings
  FOR INSERT WITH CHECK (auth.uid() = rater_id);

-- provider_portfolio_items: anyone can read; provider can write own
CREATE POLICY "portfolio_read" ON provider_portfolio_items
  FOR SELECT USING (TRUE);
CREATE POLICY "portfolio_write" ON provider_portfolio_items
  FOR ALL USING (auth.uid() = provider_id);

-- provider_past_projects: anyone can read; provider can write own
CREATE POLICY "past_projects_read" ON provider_past_projects
  FOR SELECT USING (TRUE);
CREATE POLICY "past_projects_write" ON provider_past_projects
  FOR ALL USING (auth.uid() = provider_id);
