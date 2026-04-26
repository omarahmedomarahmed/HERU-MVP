# HERU.gg — Claude Code Handover Document
# READ THIS ENTIRE FILE BEFORE TOUCHING ANY CODE

---

## WHAT HERU.GG IS

HERU.gg is a **four-sided esports marketplace** for the MENA region (Egypt, Saudi Arabia, UAE).

**4 Stakeholders + 4 Product brands:**
- **Gamers** → **HERU ARENA** — Compete in tournaments, community bracket builder, manage teams, book coaches, climb leaderboards
- **Organizers** → **HERU BUILDER** — Build tournaments, hire service providers, create sponsorship packages, get funded
- **Sponsors** → **HERU RADAR** — Browse packages, buy sponsorships, track ROI, request managed campaigns
- **Service Providers** → **HERU GIGs** — List services (9 categories), get booked, get paid via escrow

**Platform Revenue: 15% fee on all transactions**
- 15% of every service booking (held in escrow until organizer confirms delivery)
- 15% of every sponsorship package purchase
- Subscription MRR from HERU RADAR plans: Free (EGP 0) / Community (EGP 150K/mo) / Premium (EGP 300K/mo)
- All tracked in `heru_revenue_ledger`

**HERU GIGs Service Categories (9):**
`Venue`, `Coaching`, `Talent`, `Production`, `Marketing`, `Community`, `Hardware`, `EventVendor`, `TournamentMgmt`

---

## ARCHITECTURE

```
Frontend:    React 18 + Vite + TailwindCSS + shadcn/ui
Backend:     Node.js 20 + Express 4
Database:    Supabase (PostgreSQL 15) + Row Level Security
Auth:        Supabase Auth (JWT) + custom staff session tokens
Storage:     Supabase Storage
Realtime:    Supabase Realtime (direct messages, live brackets)
Payments:    Paymob API (EGP, MENA gateway) + escrow via status fields
Email:       Resend API
Hosting:     Hostinger VPS (Ubuntu 22.04, Nginx, PM2)
```

---

## USER ROLES & AUTH FLOWS

| Role | Login URL | Dashboard | Register URL |
|------|-----------|-----------|--------------|
| gamer | /auth/gamer/login | /gamer/home | /auth/gamer/register |
| organizer | /auth/organizer/login | /organizer/dashboard | /auth/organizer/register |
| sponsor | /auth/sponsor/login | /sponsor/dashboard | /auth/sponsor/register |
| service_provider | /auth/provider/login | /provider/dashboard | /auth/provider/register |
| admin | /admin (HIDDEN) | /staff/dashboard | — (staff keys only) |

**Staff Auth:** Email + StaffAccessKey. Validates `User.role='admin'` AND matching active key.
Staff access keys: `HERU-STAFF-OMAR-2026`, `HERU-STAFF-OPS-2026`

---

## URL STRUCTURE

### Public
```
/                           Landing page
/tournaments                Browse tournaments
/tournaments/:id            Tournament detail
/teams/:id                  Team profile
/organizer/:id              Organizer public profile
/radar                      Sponsorship radar (public)
/coaches                    Coach marketplace (public)
/leaderboards               Leaderboards (public)
/influencers                Influencer browse (public)
/for-gamers                 Gamer value prop page
/for-organizers             Organizer value prop page
/for-sponsors               Sponsor value prop page
/for-providers              Provider value prop page
/providers/:id              Provider public profile
/auth                       Auth choice (4 tiles)
```

### Gamer (/gamer/*)
```
/gamer/home                 Feed + quick actions
/gamer/build                Community Tournament Builder (private scrims & bracket events)
/gamer/profile              My profile (edit)
/gamer/teams                My teams
/gamer/teams/:id            Team detail
/gamer/tournaments          Browse tournaments
/gamer/bookings             My coaching sessions
/gamer/friends              Friends list + requests
/gamer/messages             Direct messages
/gamer/notifications        Notifications
/gamer/billing              Billing
/gamer/orders               Marketplace orders
/gamer/orders/:id           Order detail
/gamer/connect              Connected accounts
```

### Organizer (/organizer/*)
```
/organizer/dashboard        Main dashboard
/organizer/tournaments      My tournaments
/organizer/tournaments/new  Tournament builder
/organizer/tournaments/:id/manage  Tournament management
/organizer/radar            Sponsorship radar (my packages)
/organizer/profile          My organizer profile
/organizer/billing          Billing
/organizer/verification     Verification request
/organizer/messages         Messages
/organizer/teams            Teams
/organizer/venues           Venue submissions
```

### Sponsor (/sponsor/*)
```
/sponsor/dashboard          Main dashboard
/sponsor/radar              Browse packages
/sponsor/radar/:t/package/:p  Package detail + buy
/sponsor/sponsorships       My sponsorships
/sponsor/subscription       Subscription management
/sponsor/builder            Internal campaign builder
/sponsor/profile            My profile
/sponsor/managed-services   Managed project list
/sponsor/managed-services/new  Submit new project
/sponsor/managed-services/:id  Project detail + chat
/sponsor/influencers        Influencer marketplace
```

### Service Provider (/provider/*)
```
/provider/dashboard         Main dashboard
/provider/services          My services
/provider/services/new      Create service listing
/provider/bookings          My bookings
/provider/bookings/:id      Booking detail + chat
/provider/profile           My profile
```

### Staff (/staff/*)
```
/staff/dashboard            Overview
/staff/tournaments          All tournaments
/staff/users                All users
/staff/approvals            Approvals (5 tabs: pending/approved/rejected/services/verifications)
/staff/revenue              Revenue ledger (3 streams)
/staff/analytics            Growth + game stats
/staff/cms                  CMS pages editor
/staff/platform-control     Feature toggles
/staff/managed-projects     Sponsor consultant requests
/staff/orders               All orders
/staff/billing              Billing
/staff/organizers           Organizer profiles
/staff/services             Service listings (approve/reject)
/staff/radar                Radar oversight
/staff/settings             App settings
/staff/badges               Badges
/staff/venues               Venues
/staff/audit                Audit trail
/staff/gamers               All gamers
/staff/teams                All teams
/staff/tournament-builder   Tournament builder (staff)
```

---

## KEY BUSINESS RULES

1. **NO co-organizer model** — removed entirely. Sponsors buy structured packages.
2. **Sponsors NEVER see tournament costs** — they see packages only (price, deliverables, reach)
3. **Organizer contribution % NEVER shown publicly**
4. **Service providers require staff approval** before listing appears in Tournament Builder
5. **Organizer verification required** before publishing to Sponsorship Radar
6. **Escrow**: payment held at booking, released after organizer confirms delivery
7. **Platform fee always 15%** — on service bookings, sponsorship packages, and subs
8. **All currency in EGP** — never USD or $
9. **Staff login (/admin) NEVER linked from public nav**
10. **Minimum sponsorship package = 1.5x service cost** (warning, not block)

---

## DATABASE MIGRATIONS

Migrations are in `/supabase/migrations/`. Apply these in order on a fresh install:

| File | Contents |
|------|----------|
| `100_core.sql` | Extensions, user_profiles (phone/whatsapp), staff_access_keys, staff_sessions, app_settings, cms_pages, audit_log, games (seeded), notifications, achievements, badges |
| `101_gamers.sql` | gamer_profiles (talent fields, username_slug), connected_accounts (Riot/Val/region), teams (leader_id, members[], join_requests), tournaments (full column set incl. internal/Riot/stream/sponsor fields), tournament sub-tables, match_records, leaderboards, friendships, direct_messages (content/read_at/conversation_id), promo_codes, user_reports |
| `102_organizers.sql` | organizer_profiles (contact_number, contact_email, tiktok, facebook), organizer_verifications, organizer_page_configs, organizer_ratings, deliverables, bills, orders, tournament_orders, approval_requests |
| `103_providers.sql` | service_provider_profiles (slug, social_links, approval_status), services (9 categories: Venue/Coaching/Talent/Production/Marketing/Community/Hardware/EventVendor/TournamentMgmt, custom_fields), provider_portfolio_items (type, client_name, deliverables, links, testimonial), provider_past_projects, service_bookings (total_price, net_to_provider, denorm columns), coaching_sessions (gamer_rating, session_type, duration_minutes generated), reviews |
| `104_sponsors.sql` | sponsor_profiles (subscription_plan/status/renewal_date), subscriptions (plan CHECK: free/community/premium/starter/growth for legacy, amount, billing_cycle, renewal_date), sponsorship_packages, sponsorships (package_name/sponsor_brand/tournament_name), managed_service_projects, heru_revenue_ledger (both stream/entity and source_type/source_id naming conventions) |
| `105_rls.sql` | Row Level Security policies for all tables including staff_sessions, games, notifications |

Apply in order 100 → 105 on a fresh database. No other migration files are needed.

For migrating to a different database: see `DATABASE_MIGRATION.md`.
For migrating to a different auth provider: see `AUTH_MIGRATION.md`.

---

## BACKEND ROUTES

All routes in `/backend/src/routes/`. Key new routes:
- `/api/providers` — provider profiles
- `/api/services` — service listings + approve/reject
- `/api/service-bookings` — bookings + escrow
- `/api/sponsorship-packages` — packages CRUD
- `/api/sponsorships` — sponsor package purchases
- `/api/subscriptions` — sponsor subscriptions
- `/api/reviews` — ratings + reviews
- `/api/organizer-verifications` — verification flow
- `/api/managed-services` — sponsor consultancy requests
- `/api/coaching` — coach browse + session booking
- `/api/friends` — friend requests
- `/api/direct-messages` — DM conversations
- `/api/leaderboards` — rankings
- `/api/reports` — user reports
- `/api/revenue` — heru_revenue_ledger
- `/api/cms` — CMS pages

---

## COMPONENT ARCHITECTURE

**Layouts** (in `/src/components/layouts/`):
- `GamerLayout` — gamer pages (no sidebar, top nav)
- `OrganizerLayout` — organizer dashboard (dark sidebar, purple/blue)
- `SponsorLayout` — sponsor dashboard (dark sidebar, yellow accents)
- `ProviderLayout` — provider dashboard (dark sidebar, cyan accents)
- `StaffLayout` — staff pages (light theme, professional)

**Auth Guards** (in `/src/lib/auth-guards.jsx`):
- `RequireGamer`, `RequireOrganizer`, `RequireSponsor`, `RequireProvider`, `RequireStaff`

**API Client** (in `/src/api/heruClient.js`):
- `apiCall(path, options)` — base fetch wrapper with auth token
- Entities: Tournament, Team, GamerProfile, OrganizerProfile, Order, Bill, Service, ServiceBooking, SponsorshipPackage, Sponsorship, Subscription, SponsorProfile, Provider, Review, OrganizerVerification, ManagedService, Coaching, Friend, DirectMessage, Leaderboard, Report

---

## DESIGN TOKENS

```css
Gamer:     bg #0a0a0a, primary #ff1a1a (red)
Organizer: bg #0f0f1a, primary #7c3aed (purple), secondary #2563eb (blue)
Sponsor:   bg #0a0a0a, primary #eab308 (yellow/gold)
Provider:  bg #0a0a0a, primary #06b6d4 (cyan)
Staff:     bg #f8fafc, primary #334155 (slate), accent #3b82f6 (blue)
```

All text: Inter. Headings: Rajdhani or Inter Black.
All currency: `EGP 1,500` format. Never `$` or USD.

---

## START COMMAND

When you read this file and are ready to begin, say:
"HERU.gg context loaded. Starting with [first task]."
Then begin immediately without asking questions.
