-- ============================================================
-- HERU.gg — Row Level Security Policies
-- Migration: 105_fresh_schema_rls.sql
-- NOTE: This file assumes Supabase auth. For other providers,
--       implement equivalent access control in your backend middleware.
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_access_keys           ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings                ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pages                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamer_profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members                ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_join_requests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_teams            ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_players          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_join_requests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_records               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_reports          ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries         ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_accounts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports                ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_verifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_ratings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables                ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_provider_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE services                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_portfolio_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_past_projects      ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_sessions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions               ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_packages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorships                ENABLE ROW LEVEL SECURITY;
ALTER TABLE managed_service_projects    ENABLE ROW LEVEL SECURITY;
ALTER TABLE heru_revenue_ledger         ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: is_admin()
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- PUBLIC READ POLICIES
-- ============================================================

-- Public: tournaments (published/live only)
CREATE POLICY "Public can read published tournaments"
  ON tournaments FOR SELECT USING (status IN ('published','live','completed'));

-- Public: teams
CREATE POLICY "Public can read teams"
  ON teams FOR SELECT USING (TRUE);

-- Public: gamer profiles (public ones)
CREATE POLICY "Public can read public gamer profiles"
  ON gamer_profiles FOR SELECT USING (is_public = TRUE);

-- Public: organizer profiles
CREATE POLICY "Public can read organizer profiles"
  ON organizer_profiles FOR SELECT USING (TRUE);

-- Public: approved service provider profiles
CREATE POLICY "Public can read approved providers"
  ON service_provider_profiles FOR SELECT USING (is_approved = TRUE);

-- Public: approved services
CREATE POLICY "Public can read approved services"
  ON services FOR SELECT USING (status = 'approved');

-- Public: reviews
CREATE POLICY "Public can read reviews"
  ON reviews FOR SELECT USING (TRUE);

-- Public: sponsorship packages (active)
CREATE POLICY "Public can read active packages"
  ON sponsorship_packages FOR SELECT USING (status = 'active');

-- Public: leaderboards
CREATE POLICY "Public can read leaderboards"
  ON leaderboard_entries FOR SELECT USING (TRUE);

-- Public: venues (approved)
CREATE POLICY "Public can read approved venues"
  ON venues FOR SELECT USING (status = 'approved');

-- Public: tournament reports (published)
CREATE POLICY "Public can read published reports"
  ON tournament_reports FOR SELECT USING (is_published = TRUE);

-- Public: CMS pages (visible)
CREATE POLICY "Public can read visible cms pages"
  ON cms_pages FOR SELECT USING (is_visible = TRUE);

-- App settings: public read
CREATE POLICY "Public can read app settings"
  ON app_settings FOR SELECT USING (TRUE);

-- ============================================================
-- USER OWN DATA POLICIES
-- ============================================================

-- user_profiles: own read/write
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT USING (auth_user_id = auth.uid() OR is_admin());
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE USING (auth_user_id = auth.uid());

-- gamer_profiles: own read/write
CREATE POLICY "Gamers can manage own profile"
  ON gamer_profiles FOR ALL USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

-- organizer_profiles: own read/write
CREATE POLICY "Organizers can manage own profile"
  ON organizer_profiles FOR ALL USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

-- sponsor_profiles: own read/write
CREATE POLICY "Sponsors can manage own profile"
  ON sponsor_profiles FOR ALL USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

-- service_provider_profiles: own read/write
CREATE POLICY "Providers can manage own profile"
  ON service_provider_profiles FOR ALL USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

-- services: own read/write
CREATE POLICY "Providers can manage own services"
  ON services FOR ALL USING (
    provider_id IN (
      SELECT id FROM service_provider_profiles
      WHERE user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    )
  );

-- tournaments: organizer manages own
CREATE POLICY "Organizers can manage own tournaments"
  ON tournaments FOR ALL USING (
    organizer_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR is_admin()
  );

-- service_bookings: provider or organizer sees own
CREATE POLICY "Provider and organizer can read own bookings"
  ON service_bookings FOR SELECT USING (
    provider_id IN (SELECT id FROM service_provider_profiles WHERE user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()))
    OR organizer_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR is_admin()
  );

-- sponsorships: sponsor sees own
CREATE POLICY "Sponsors can read own sponsorships"
  ON sponsorships FOR SELECT USING (
    sponsor_id IN (SELECT id FROM sponsor_profiles WHERE user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()))
    OR is_admin()
  );

-- managed_service_projects: sponsor sees own
CREATE POLICY "Sponsors can read own managed projects"
  ON managed_service_projects FOR SELECT USING (
    sponsor_id IN (SELECT id FROM sponsor_profiles WHERE user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()))
    OR is_admin()
  );

-- Direct messages: own conversations
CREATE POLICY "Users can read own messages"
  ON direct_messages FOR SELECT USING (
    sender_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR recipient_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );
CREATE POLICY "Users can send messages"
  ON direct_messages FOR INSERT WITH CHECK (
    sender_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

-- Friendships: own
CREATE POLICY "Users can manage own friendships"
  ON friendships FOR ALL USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR friend_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

-- Coaching sessions: gamer or coach
CREATE POLICY "Users can read own coaching sessions"
  ON coaching_sessions FOR SELECT USING (
    gamer_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR coach_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR is_admin()
  );

-- Bills: own
CREATE POLICY "Users can read own bills"
  ON bills FOR SELECT USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR is_admin()
  );

-- Connected accounts: own
CREATE POLICY "Users can manage own connected accounts"
  ON connected_accounts FOR ALL USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

-- Revenue ledger: staff only
CREATE POLICY "Only admins can read revenue ledger"
  ON heru_revenue_ledger FOR SELECT USING (is_admin());

-- Staff access keys: staff only
CREATE POLICY "Only admins can manage staff keys"
  ON staff_access_keys FOR ALL USING (is_admin());

-- Audit log: staff only
CREATE POLICY "Only admins can read audit log"
  ON audit_log FOR ALL USING (is_admin());

-- ============================================================
-- ADMIN FULL ACCESS POLICIES (catch-all for remaining tables)
-- ============================================================

CREATE POLICY "Admins have full access to user_reports"
  ON user_reports FOR ALL USING (is_admin() OR reporter_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins have full access to organizer_verifications"
  ON organizer_verifications FOR ALL USING (
    is_admin()
    OR organizer_id IN (SELECT id FROM organizer_profiles WHERE user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()))
  );

CREATE POLICY "Admins have full access to subscriptions"
  ON subscriptions FOR ALL USING (
    is_admin()
    OR sponsor_id IN (SELECT id FROM sponsor_profiles WHERE user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()))
  );
