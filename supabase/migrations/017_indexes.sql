-- ============================================================================
-- 017: Performance indexes for all high-query columns
-- ============================================================================

-- user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- gamer_profiles
CREATE INDEX IF NOT EXISTS idx_gamer_profiles_user_id ON public.gamer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_gamer_profiles_is_talent ON public.gamer_profiles(is_talent);
CREATE INDEX IF NOT EXISTS idx_gamer_profiles_username_slug ON public.gamer_profiles(username_slug);

-- organizer_profiles
CREATE INDEX IF NOT EXISTS idx_organizer_profiles_user_id ON public.organizer_profiles(user_id);

-- teams
CREATE INDEX IF NOT EXISTS idx_teams_leader_id ON public.teams(leader_id);

-- team_members
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);

-- tournaments
CREATE INDEX IF NOT EXISTS idx_tournaments_organizer_id ON public.tournaments(organizer_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_main_organizer_id ON public.tournaments(main_organizer_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_game ON public.tournaments(game);
CREATE INDEX IF NOT EXISTS idx_tournaments_on_radar ON public.tournaments(on_radar);
CREATE INDEX IF NOT EXISTS idx_tournaments_created_at ON public.tournaments(created_at DESC);

-- marketplace_items
CREATE INDEX IF NOT EXISTS idx_marketplace_items_category ON public.marketplace_items(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_is_active ON public.marketplace_items(is_active);

-- orders
CREATE INDEX IF NOT EXISTS idx_orders_gamer_id ON public.orders(gamer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- tournament_orders
CREATE INDEX IF NOT EXISTS idx_tournament_orders_tournament_id ON public.tournament_orders(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_orders_main_organizer_id ON public.tournament_orders(main_organizer_id);
CREATE INDEX IF NOT EXISTS idx_tournament_orders_fulfillment ON public.tournament_orders(fulfillment_status);

-- bills
CREATE INDEX IF NOT EXISTS idx_bills_bill_number ON public.bills(bill_number);
CREATE INDEX IF NOT EXISTS idx_bills_payer_id ON public.bills(payer_id);
CREATE INDEX IF NOT EXISTS idx_bills_payment_status ON public.bills(payment_status);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON public.bills(created_at DESC);

-- billing_snapshots
CREATE INDEX IF NOT EXISTS idx_billing_snapshots_tournament_id ON public.billing_snapshots(tournament_id);

-- sponsorship_radar
CREATE INDEX IF NOT EXISTS idx_sponsorship_radar_tournament_id ON public.sponsorship_radar(tournament_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_radar_status ON public.sponsorship_radar(status);
CREATE INDEX IF NOT EXISTS idx_sponsorship_radar_main_organizer ON public.sponsorship_radar(main_organizer_id);

-- radar_views
CREATE INDEX IF NOT EXISTS idx_radar_views_radar ON public.radar_views(radar_id);
CREATE INDEX IF NOT EXISTS idx_radar_views_viewer ON public.radar_views(viewer_id);

-- gig_requests
CREATE INDEX IF NOT EXISTS idx_gig_requests_talent_user_id ON public.gig_requests(talent_user_id);
CREATE INDEX IF NOT EXISTS idx_gig_requests_organizer_id ON public.gig_requests(organizer_id);
CREATE INDEX IF NOT EXISTS idx_gig_requests_tournament_id ON public.gig_requests(tournament_id);

-- match_records
CREATE INDEX IF NOT EXISTS idx_match_records_tournament_id ON public.match_records(tournament_id);
CREATE INDEX IF NOT EXISTS idx_match_records_match_id ON public.match_records(match_id);
CREATE INDEX IF NOT EXISTS idx_match_records_bracket_match_id ON public.match_records(bracket_match_id);
CREATE INDEX IF NOT EXISTS idx_match_records_status ON public.match_records(status);
CREATE INDEX IF NOT EXISTS idx_match_records_created_at ON public.match_records(created_at DESC);

-- approval_requests
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON public.approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requester_id ON public.approval_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_type ON public.approval_requests(approval_type);

-- staff_sessions
CREATE INDEX IF NOT EXISTS idx_staff_sessions_user_id ON public.staff_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_sessions_token ON public.staff_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_staff_sessions_active ON public.staff_sessions(is_active);

-- app_settings
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON public.app_settings(setting_key);

-- achievements
CREATE INDEX IF NOT EXISTS idx_gamer_achievements_user_id ON public.gamer_achievements(user_id);

-- promo_codes
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_gamer ON public.promo_codes(gamer_id);

-- games
CREATE INDEX IF NOT EXISTS idx_games_slug ON public.games(slug);

-- tournament_reports
CREATE INDEX IF NOT EXISTS idx_tournament_reports_tournament ON public.tournament_reports(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_reports_organizer ON public.tournament_reports(organizer_id);
CREATE INDEX IF NOT EXISTS idx_tournament_reports_published ON public.tournament_reports(is_published) WHERE is_published = TRUE;

-- deliverables
CREATE INDEX IF NOT EXISTS idx_deliverables_gig_request ON public.deliverables(gig_request_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_tournament ON public.deliverables(tournament_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_assigned ON public.deliverables(assigned_to);

-- organizer_page_config
CREATE INDEX IF NOT EXISTS idx_organizer_page_config_org ON public.organizer_page_config(organizer_id);

-- audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);

-- audit_trail
CREATE INDEX IF NOT EXISTS idx_audit_trail_actor_id ON public.audit_trail(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_entity_type ON public.audit_trail(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created_at ON public.audit_trail(created_at DESC);
