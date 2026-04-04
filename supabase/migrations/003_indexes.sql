-- =============================================
-- HERU.gg — Performance Indexes
-- Migration 003
-- =============================================

CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_gamer_profiles_user_id ON public.gamer_profiles(user_id);
CREATE INDEX idx_gamer_profiles_is_talent ON public.gamer_profiles(is_talent);
CREATE INDEX idx_organizer_profiles_user_id ON public.organizer_profiles(user_id);
CREATE INDEX idx_teams_leader_id ON public.teams(leader_id);
CREATE INDEX idx_tournaments_organizer_id ON public.tournaments(organizer_id);
CREATE INDEX idx_tournaments_main_organizer_id ON public.tournaments(main_organizer_id);
CREATE INDEX idx_tournaments_status ON public.tournaments(status);
CREATE INDEX idx_tournaments_game ON public.tournaments(game);
CREATE INDEX idx_tournaments_on_radar ON public.tournaments(on_radar);
CREATE INDEX idx_marketplace_items_category ON public.marketplace_items(category);
CREATE INDEX idx_marketplace_items_is_active ON public.marketplace_items(is_active);
CREATE INDEX idx_orders_gamer_id ON public.orders(gamer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_tournament_orders_tournament_id ON public.tournament_orders(tournament_id);
CREATE INDEX idx_tournament_orders_main_organizer_id ON public.tournament_orders(main_organizer_id);
CREATE INDEX idx_tournament_orders_fulfillment ON public.tournament_orders(fulfillment_status);
CREATE INDEX idx_sponsorship_radar_tournament_id ON public.sponsorship_radar(tournament_id);
CREATE INDEX idx_sponsorship_radar_status ON public.sponsorship_radar(status);
CREATE INDEX idx_gig_requests_talent_user_id ON public.gig_requests(talent_user_id);
CREATE INDEX idx_gig_requests_organizer_id ON public.gig_requests(organizer_id);
CREATE INDEX idx_gig_requests_tournament_id ON public.gig_requests(tournament_id);
CREATE INDEX idx_bills_bill_number ON public.bills(bill_number);
CREATE INDEX idx_bills_payer_id ON public.bills(payer_id);
CREATE INDEX idx_bills_payment_status ON public.bills(payment_status);
CREATE INDEX idx_billing_snapshots_tournament_id ON public.billing_snapshots(tournament_id);
CREATE INDEX idx_approval_requests_status ON public.approval_requests(status);
CREATE INDEX idx_approval_requests_requester_id ON public.approval_requests(requester_id);
CREATE INDEX idx_staff_sessions_user_id ON public.staff_sessions(user_id);
CREATE INDEX idx_staff_sessions_token ON public.staff_sessions(session_token);
CREATE INDEX idx_staff_sessions_active ON public.staff_sessions(is_active);
CREATE INDEX idx_app_settings_key ON public.app_settings(setting_key);
