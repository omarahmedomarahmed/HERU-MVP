-- ============================================================
-- HERU.gg — Row Level Security Policies
-- Migration: 105_rls.sql
-- Applies after 100-104. Uses Supabase auth.uid().
-- Backend (service role) bypasses all RLS automatically.
-- ============================================================

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE user_profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_access_keys           ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_sessions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings                ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pages                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE games                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications               ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements                ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements           ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamer_profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_accounts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members                ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_join_requests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_teams            ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_players          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_join_requests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_records               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_reports          ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries         ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports                ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_verifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_page_configs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_ratings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables                ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests           ENABLE ROW LEVEL SECURITY;
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
-- Returns true if the current JWT belongs to an admin user
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- STAFF-ONLY TABLES
-- Service role (backend) bypasses RLS entirely.
-- Direct Supabase client access is blocked for non-admins.
-- ============================================================

CREATE POLICY "Admins only — staff_sessions"
  ON staff_sessions FOR ALL USING (is_admin());

CREATE POLICY "Admins only — staff_access_keys"
  ON staff_access_keys FOR ALL USING (is_admin());

CREATE POLICY "Admins only — audit_log"
  ON audit_log FOR ALL USING (is_admin());

CREATE POLICY "Admins only — revenue_ledger"
  ON heru_revenue_ledger FOR SELECT USING (is_admin());

-- ============================================================
-- PUBLIC READ — no auth required
-- ============================================================

CREATE POLICY "Public read — published tournaments"
  ON tournaments FOR SELECT
  USING (status IN ('published','live','completed'));

CREATE POLICY "Public read — teams"
  ON teams FOR SELECT USING (TRUE);

CREATE POLICY "Public read — public gamer profiles"
  ON gamer_profiles FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Public read — organizer profiles"
  ON organizer_profiles FOR SELECT USING (TRUE);

CREATE POLICY "Public read — approved providers"
  ON service_provider_profiles FOR SELECT USING (is_approved = TRUE);

CREATE POLICY "Public read — approved services"
  ON services FOR SELECT USING (status = 'approved');

CREATE POLICY "Public read — provider portfolio"
  ON provider_portfolio_items FOR SELECT USING (TRUE);

CREATE POLICY "Public read — provider past projects"
  ON provider_past_projects FOR SELECT USING (TRUE);

CREATE POLICY "Public read — reviews"
  ON reviews FOR SELECT USING (TRUE);

CREATE POLICY "Public read — active sponsorship packages"
  ON sponsorship_packages FOR SELECT USING (status = 'active');

CREATE POLICY "Public read — leaderboard entries"
  ON leaderboard_entries FOR SELECT USING (TRUE);

CREATE POLICY "Public read — published tournament reports"
  ON tournament_reports FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Public read — visible cms pages"
  ON cms_pages FOR SELECT USING (is_visible = TRUE);

CREATE POLICY "Public read — app settings"
  ON app_settings FOR SELECT USING (TRUE);

CREATE POLICY "Public read — active games"
  ON games FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public read — achievements"
  ON achievements FOR SELECT USING (TRUE);

CREATE POLICY "Public read — badges"
  ON badges FOR SELECT USING (TRUE);

-- ============================================================
-- USER OWN PROFILE DATA
-- ============================================================

CREATE POLICY "Own read — user_profiles"
  ON user_profiles FOR SELECT
  USING (auth_user_id = auth.uid() OR is_admin());

CREATE POLICY "Own update — user_profiles"
  ON user_profiles FOR UPDATE
  USING (auth_user_id = auth.uid());

CREATE POLICY "Own all — gamer_profiles"
  ON gamer_profiles FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Own all — organizer_profiles"
  ON organizer_profiles FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Own all — sponsor_profiles"
  ON sponsor_profiles FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Own all — service_provider_profiles"
  ON service_provider_profiles FOR ALL
  USING (user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()));

-- ============================================================
-- CONNECTED ACCOUNTS
-- Public can read; only owner can insert/update/delete
-- ============================================================

CREATE POLICY "Public read — connected_accounts"
  ON connected_accounts FOR SELECT USING (TRUE);

CREATE POLICY "Own write — connected_accounts"
  ON connected_accounts FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Own update — connected_accounts"
  ON connected_accounts FOR UPDATE
  USING (user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Own delete — connected_accounts"
  ON connected_accounts FOR DELETE
  USING (user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()));

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE POLICY "Own read — notifications"
  ON notifications FOR SELECT
  USING (user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Own update — notifications"
  ON notifications FOR UPDATE
  USING (user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()));

-- ============================================================
-- SERVICES (provider manages own)
-- ============================================================

CREATE POLICY "Own all — services"
  ON services FOR ALL
  USING (
    provider_id IN (
      SELECT id FROM service_provider_profiles
      WHERE user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    )
  );

-- ============================================================
-- TOURNAMENTS (organizer manages own)
-- ============================================================

CREATE POLICY "Own all — tournaments"
  ON tournaments FOR ALL
  USING (
    organizer_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR is_admin()
  );

-- ============================================================
-- SERVICE BOOKINGS
-- Provider and organizer each see their own bookings
-- ============================================================

CREATE POLICY "Own read — service_bookings"
  ON service_bookings FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM service_provider_profiles
      WHERE user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    )
    OR organizer_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR is_admin()
  );

-- ============================================================
-- SPONSORSHIPS
-- ============================================================

CREATE POLICY "Own read — sponsorships"
  ON sponsorships FOR SELECT
  USING (
    sponsor_id IN (
      SELECT id FROM sponsor_profiles
      WHERE user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    )
    OR organizer_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR is_admin()
  );

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================

CREATE POLICY "Own all — subscriptions"
  ON subscriptions FOR ALL
  USING (
    is_admin()
    OR sponsor_id IN (
      SELECT id FROM sponsor_profiles
      WHERE user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    )
  );

-- ============================================================
-- MANAGED SERVICE PROJECTS
-- ============================================================

CREATE POLICY "Own read — managed_service_projects"
  ON managed_service_projects FOR SELECT
  USING (
    sponsor_id IN (
      SELECT id FROM sponsor_profiles
      WHERE user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    )
    OR is_admin()
  );

-- ============================================================
-- DIRECT MESSAGES
-- ============================================================

CREATE POLICY "Own read — direct_messages"
  ON direct_messages FOR SELECT
  USING (
    sender_id    IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR recipient_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Own insert — direct_messages"
  ON direct_messages FOR INSERT
  WITH CHECK (
    sender_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

-- ============================================================
-- FRIENDSHIPS
-- ============================================================

CREATE POLICY "Own all — friendships"
  ON friendships FOR ALL
  USING (
    user_id   IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR friend_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

-- ============================================================
-- COACHING SESSIONS
-- ============================================================

CREATE POLICY "Own read — coaching_sessions"
  ON coaching_sessions FOR SELECT
  USING (
    gamer_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR coach_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR is_admin()
  );

-- ============================================================
-- BILLS
-- ============================================================

CREATE POLICY "Own read — bills"
  ON bills FOR SELECT
  USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR is_admin()
  );

-- ============================================================
-- USER REPORTS (abuse)
-- ============================================================

CREATE POLICY "Own and admin — user_reports"
  ON user_reports FOR ALL
  USING (
    is_admin()
    OR reporter_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

-- ============================================================
-- ORGANIZER VERIFICATIONS
-- ============================================================

CREATE POLICY "Own and admin — organizer_verifications"
  ON organizer_verifications FOR ALL
  USING (
    is_admin()
    OR organizer_id IN (
      SELECT id FROM organizer_profiles
      WHERE user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    )
  );

-- ============================================================
-- USER ACHIEVEMENTS & BADGES
-- ============================================================

CREATE POLICY "Own read — user_achievements"
  ON user_achievements FOR SELECT
  USING (user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Own read — user_badges"
  ON user_badges FOR SELECT
  USING (user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()));
