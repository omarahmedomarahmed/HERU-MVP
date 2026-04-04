-- =============================================
-- HERU.gg — RLS Policies
-- Migration 002
-- =============================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_radar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gig_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_access_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- user_profiles
CREATE POLICY "Users can read own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role full access user_profiles" ON public.user_profiles FOR ALL USING (auth.role() = 'service_role');

-- gamer_profiles
CREATE POLICY "Anyone can read gamer profiles" ON public.gamer_profiles FOR SELECT USING (true);
CREATE POLICY "Gamers can insert own profile" ON public.gamer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Gamers can update own profile" ON public.gamer_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access gamer_profiles" ON public.gamer_profiles FOR ALL USING (auth.role() = 'service_role');

-- organizer_profiles
CREATE POLICY "Anyone can read organizer profiles" ON public.organizer_profiles FOR SELECT USING (true);
CREATE POLICY "Organizers can insert own profile" ON public.organizer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Organizers can update own profile" ON public.organizer_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access organizer_profiles" ON public.organizer_profiles FOR ALL USING (auth.role() = 'service_role');

-- teams
CREATE POLICY "Anyone can read teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Authenticated can create teams" ON public.teams FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update teams" ON public.teams FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Service role full access teams" ON public.teams FOR ALL USING (auth.role() = 'service_role');

-- tournaments
CREATE POLICY "Anyone can read published tournaments" ON public.tournaments FOR SELECT USING (status IN ('published','live','completed') OR organizer_id = auth.uid() OR main_organizer_id = auth.uid());
CREATE POLICY "Authenticated can create tournaments" ON public.tournaments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Organizers can update own tournaments" ON public.tournaments FOR UPDATE USING (organizer_id = auth.uid() OR main_organizer_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY "Service role full access tournaments" ON public.tournaments FOR ALL USING (auth.role() = 'service_role');

-- marketplace_items
CREATE POLICY "Anyone can read active marketplace items" ON public.marketplace_items FOR SELECT USING (true);
CREATE POLICY "Service role full access marketplace_items" ON public.marketplace_items FOR ALL USING (auth.role() = 'service_role');

-- orders
CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT USING (gamer_id = auth.uid() OR organizer_id = auth.uid());
CREATE POLICY "Authenticated can create orders" ON public.orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE USING (gamer_id = auth.uid() OR organizer_id = auth.uid());
CREATE POLICY "Service role full access orders" ON public.orders FOR ALL USING (auth.role() = 'service_role');

-- tournament_orders
CREATE POLICY "Organizers can read own tournament orders" ON public.tournament_orders FOR SELECT USING (main_organizer_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY "Service role full access tournament_orders" ON public.tournament_orders FOR ALL USING (auth.role() = 'service_role');

-- sponsorship_radar
CREATE POLICY "Anyone can read open radar" ON public.sponsorship_radar FOR SELECT USING (true);
CREATE POLICY "Authenticated can create radar" ON public.sponsorship_radar FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Organizers can update own radar" ON public.sponsorship_radar FOR UPDATE USING (main_organizer_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY "Service role full access sponsorship_radar" ON public.sponsorship_radar FOR ALL USING (auth.role() = 'service_role');

-- gig_requests
CREATE POLICY "Involved can read gig requests" ON public.gig_requests FOR SELECT USING (organizer_id = auth.uid() OR talent_user_id = auth.uid()::text OR auth.role() = 'service_role');
CREATE POLICY "Authenticated can create gig requests" ON public.gig_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Involved can update gig requests" ON public.gig_requests FOR UPDATE USING (organizer_id = auth.uid() OR talent_user_id = auth.uid()::text OR auth.role() = 'service_role');
CREATE POLICY "Service role full access gig_requests" ON public.gig_requests FOR ALL USING (auth.role() = 'service_role');

-- bills
CREATE POLICY "Payers can read own bills" ON public.bills FOR SELECT USING (payer_id = auth.uid()::text OR auth.role() = 'service_role');
CREATE POLICY "Service role full access bills" ON public.bills FOR ALL USING (auth.role() = 'service_role');

-- billing_snapshots
CREATE POLICY "Organizers can read own snapshots" ON public.billing_snapshots FOR SELECT USING (organizer_id = auth.uid()::text OR auth.role() = 'service_role');
CREATE POLICY "Service role full access billing_snapshots" ON public.billing_snapshots FOR ALL USING (auth.role() = 'service_role');

-- approval_requests
CREATE POLICY "Requesters can read own approvals" ON public.approval_requests FOR SELECT USING (requester_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY "Authenticated can create approvals" ON public.approval_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Service role full access approval_requests" ON public.approval_requests FOR ALL USING (auth.role() = 'service_role');

-- staff_access_keys
CREATE POLICY "Service role full access staff_access_keys" ON public.staff_access_keys FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Staff can read active keys" ON public.staff_access_keys FOR SELECT USING (is_active = true);

-- staff_sessions
CREATE POLICY "Staff can read own sessions" ON public.staff_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Service role full access staff_sessions" ON public.staff_sessions FOR ALL USING (auth.role() = 'service_role');

-- app_settings
CREATE POLICY "Anyone can read app settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Service role full access app_settings" ON public.app_settings FOR ALL USING (auth.role() = 'service_role');

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gig_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sponsorship_radar;
