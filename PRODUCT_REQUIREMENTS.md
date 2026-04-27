# HERU.gg — Product Requirements Document

> Current platform state as of April 2026. All business rules are assumptions and can be changed.

---

## Platform Overview

HERU.gg is a **four-sided esports marketplace** for MENA (Egypt, Saudi Arabia, UAE).

**Core Value Proposition:**
- Gamers: discover and compete in funded tournaments
- Organizers: build, fund, and run events without upfront costs
- Sponsors: reach gaming audiences with measurable ROI
- Service Providers: get booked and paid for esports production work

**Revenue:** 15% platform fee on all transactions + subscription MRR

---

## Product 1: HERU Arena (For Gamers)

### Pages
- `/gamer/home` — Feed with live tournaments + Community Tournament Builder CTA + Live Leaderboard widget
- `/gamer/build` — **Community Tournament Builder** (private scrims, clan wars, mini brackets — invite-only)
- `/gamer/profile` — Edit profile (tabs: Games first, Overview, Teams, Friends, Messages, Stats, Achievements, Tournaments)
- `/gamer/teams` — Browse and manage teams
- `/gamer/tournaments` — Browse tournaments, view brackets
- `/gamer/tournaments/:id` — Tournament detail (join, brackets, chat, updates)
- `/gamer/bookings` — Coaching sessions booked
- `/gamer/friends` — Friend requests and list (also accessible as profile tab)
- `/gamer/messages` — Direct messages (also accessible as profile tab)
- `/gamer/orders` — Gamer Shop orders
- `/gamer/billing` — Payment history (coaching sessions only; free product note shown)
- `/gamer/connect` — Connected gaming accounts (Discord, Riot; Epic/Steam/Tencent planned)
- `/gamer/notifications` — All notifications

### Public Pages
- `/gamer/:id` — Public gamer profile (stats, teams, game history)
- `/teams` — Browse all teams
- `/teams/:id` — Team profile
- `/coaches` — Browse coach profiles
- `/coaches/:id` — Coach public profile
- `/leaderboards` — Cross-tournament rankings

### Data Model
- `gamer_profiles`: username, bio, avatar, games, team_ids, rank, stats
- `friendships`: requester_id, addressee_id, status
- `direct_messages`: conversation_id, sender_id, content, created_at
- `coaching_sessions`: coach_id, gamer_id, game, duration, amount, status

### Connected Accounts
- Discord OAuth (implemented)
- Riot Games API (implemented — dev key expires daily)
- Epic Games API (placeholder in .env)
- Tencent API (placeholder in .env)
- Steam API (placeholder in .env)

---

## Product 2: HERU Organizer (For Tournament Organizers)

### Pages
- `/organizer/dashboard` — Overview: active tournaments, revenue, tasks
- `/organizer/tournaments` — List of all tournaments
- `/organizer/tournaments/new` — Tournament Builder (multi-step)
- `/organizer/tournaments/:id/manage` — Manage live tournament (teams, brackets, chat)
- `/organizer/income` — Revenue breakdown (gross sponsorships, HERU fees, net)
- `/organizer/billing` — Bills and payment records
- `/organizer/messages` — Messages from sponsors and service providers
- `/organizer/profile` — Brand profile (public-facing)
- `/organizer/verification` — Submit verification request
- `/organizer/teams` — Browse registered teams

### Public Pages
- `/organizer/:id` — Public organizer profile (portfolio, past tournaments)

### Tournament Builder Steps
1. **Basic Info** — title, game, dates, format
2. **Game Settings** — team size, rules, registration cap
3. **Teams** — open or invite-only registration
4. **Prizepool** — prize structure (1st, 2nd, 3rd)
5. **Service Providers** — book branding, production, venue, marketing, etc.
6. **Sponsorship Packages** — create tiers (Title, Gold, Silver, Bronze)
7. **Review & Publish** — requires verification to go live on radar

### Service Provider Booking (Inside Builder)
- Organizer browses approved providers by category
- Books with price → escrow captured
- Provider delivers → organizer confirms → payment released
- HERU takes 15% of booking price

### Sponsorship Packages (Inside Builder)
- Organizer creates packages with: name, tier, price, deliverables, reach metrics
- Packages appear on Sponsor Radar after tournament is verified+published
- Minimum package price: 1.5× total service costs (warning, not block)

### Data Model
- `organizer_profiles`: user_id, brand_name, location, verification_status
- `organizer_verifications`: organizer_id, status, submitted_at, reviewed_by
- `tournaments`: id, organizer_id, title, game, format, status, prizepool
- `sponsorship_packages`: tournament_id, name, tier, price, deliverables, reach

---

## Product 3: HERU Sponsor (For Brands)

### Pages
- `/sponsor/dashboard` — Active sponsorships, spend, ROI summary
- `/sponsor/radar` — Browse sponsorship packages from verified organizers
- `/sponsor/radar/:t/package/:p` — Package detail + purchase
- `/sponsor/sponsorships` — My purchased sponsorships + deliverable tracking
- `/sponsor/influencers` — Influencer marketplace (Pro+)
- `/sponsor/managed-services` — Request managed campaigns (Pro+)
- `/sponsor/managed-services/new` — Submit new project brief
- `/sponsor/managed-services/:id` — Project detail + chat with consultant
- `/sponsor/builder` — Internal Campaign Builder (Community/Premium)
- `/sponsor/subscription` — Manage plan (Free/Community/Premium with monthly/annual toggle)
- `/sponsor/billing` — All transactions (packages, subscriptions, influencer bookings)
- `/sponsor/profile` — Brand profile

### Subscription Plans (Assumptions — changeable by staff)
| Plan | Price | Key Features |
|------|-------|-------------|
| Free | EGP 0/mo | Radar browsing, one-off package purchases |
| Community | EGP 150,000/mo | 2 online sponsorships/month, influencer hub, managed projects |
| Premium | EGP 300,000/mo | 2 online + 1 offline sponsorship/month, Campaign Builder, consultant access |

### Data Model
- `sponsor_profiles`: user_id, brand_name, industry, website, subscription_plan
- `subscriptions`: sponsor_id, plan, billing_cycle, amount, status, renewal_date
- `sponsorships`: sponsor_id, package_id, tournament_id, amount, status, payment_status
- `managed_service_projects`: sponsor_id, title, brief, budget, status, consultant_id

---

## Product 4: HERU Services (For Service Providers)

### Pages
- `/provider/dashboard` — Overview: bookings, income, pending approvals
- `/provider/services` — My service listings (status: pending/approved/rejected)
- `/provider/services/new` — Create new service listing (9 categories + custom fields per category)
- `/provider/bookings` — All bookings (incoming + active + completed, status filters)
- `/provider/bookings/:id` — Booking detail + chat with organizer + file upload/download + escrow confirm
- `/provider/income` — Income breakdown: escrow held/released, 85% net display, payout history
- `/provider/profile` — Public portfolio profile
- `/provider/tournaments/:id` — Tournament CRM view (read + communicate + upload files — no edit access)

### Public Pages
- `/providers/:id` — Provider public profile (services, portfolio, reviews)
- `/coaches` — Special browse page for coaching providers
- `/coaches/:id` — Coach profile
- `/influencers` — Special browse page for influencer providers

### Service Categories & Custom Fields (9 categories)

| Category DB Value | Display Name | Custom Fields |
|-------------------|--------------|---------------|
| `Venue` | Specialized Gaming Venue | capacity, location, address, amenities, price_per_day |
| `Coaching` | Coach | game, rank, methodology, session_duration, availability (shown to gamers) |
| `Talent` | Talent & Influencer | languages, games, past_events, platforms, followers, avg_views |
| `Production` | Media Production | equipment_list, team_size, streaming_capability |
| `Marketing` | Marketing | channels, audience_size, engagement_rate |
| `Community` | Gaming Community | platform (Discord/FB/IG/TikTok), community_size, niche |
| `Hardware` | Gaming Hardware & Setup | product_types, brands, rental_or_sale |
| `EventVendor` | Offline Event Vendors | vendor_type, service_area, min_order |
| `TournamentMgmt` | Tournament Management | experience_years, games_managed, team_size |

Coaches (`Coaching` category) appear on `/coaches` public browse page.
Talent/Influencers appear on `/influencers` public browse page.
All other categories appear in the Tournament Builder provider marketplace.

### Approval Flow
1. Provider registers → profile status = `pending`
2. Staff approves in Staff → Approvals
3. Provider can now create service listings
4. Each service listing also requires staff approval before appearing in Builder

### Data Model
- `service_provider_profiles`: user_id, display_name, categories[], approval_status, bio, portfolio
- `services`: provider_id, title, category, description, price, custom_fields (JSONB), approval_status
- `service_bookings`: service_id, organizer_id, tournament_id, total_amount, status, escrow_status

---

## Tournament CRM — Multi-Sided Access

The Tournament Management page (`/organizer/tournaments/:id/manage`) is a shared CRM accessed differently by each stakeholder.

| Stakeholder | Route | Access Level |
|-------------|-------|-------------|
| Organizer | `/organizer/tournaments/:id/manage` | Full access: edit, assign tasks, upload/download files, set ROI, manage providers, chat |
| Service Provider | `/provider/tournaments/:id` | Read + communicate + upload files + see assigned tasks — no edit |
| Sponsor | `/sponsor/radar/:t/package/:p` → CRM view | View numbers, brackets, teams, files, communicate with organizer — no edit |
| Gamer (joined) | `/gamer/tournaments/:id` | See dedicated match + brackets |
| Public | `/tournaments/:id` | Brackets (BracketVisual with team names), updates, public chat |

### Organizer CRM Tabs
1. **Overview** — status, settings, registration toggle, radar toggle
2. **Teams** — registered teams + seeding
3. **Brackets** — visual bracket editor
4. **Providers** — booked service providers + task assignment + deadline + chat
5. **Sponsors** — active sponsorships, ROI/reach numbers, income (85% net shown)
6. **Files** — upload/download tournament files (shared with providers)
7. **ROI & Reach** — fill in: estimated_reach, actual_views, engagement_rate, social_impressions, sponsor_score
8. **Tasks** — 3-column kanban (pending/in-progress/done) with provider assignment

### Venue in Builder
When organizer selects "offline" tournament, the Builder shows:
- Venue service providers from `/api/services?category=Venue` in Step 4
- Option to enter own venue address (text)
- Option to paste Google Maps link
Both stored in `venue_address` and `venue_google_maps` columns.

---

## Staff Platform

### Pages
- `/admin` — Staff login (hidden from public nav)
- `/staff/dashboard` — Platform overview (users, revenue, active tournaments)
- `/staff/tournaments` — All tournaments with full management
- `/staff/users` — All users across all roles
- `/staff/approvals` — Provider + organizer verification approvals
- `/staff/revenue` — Revenue ledger (3 streams)
- `/staff/analytics` — Growth stats, game popularity
- `/staff/cms` — CMS editor (every text/image on public pages)
- `/staff/platform-control` — Feature toggles
- `/staff/settings` — Platform Assumptions (fee%, subscription prices, etc.)
- `/staff/managed-projects` — Sponsor consultant requests
- `/staff/organizers` — Organizer profiles
- `/staff/gamers` — All gamer profiles
- `/staff/teams` — All teams
- `/staff/badges` — Achievement badges
- `/staff/audit` — Full audit trail

### CMS Control
Staff can edit every text, image, and section on:
- Home page (`/`)
- All For* pages (`/for-gamers`, `/for-organizers`, `/for-sponsors`, `/for-providers`)
- All public tournament/team pages
- Landing copy via `cms_pages` table

### Settings (Platform Assumptions)
Staff can change from Settings page:
- Platform fee percentage
- Subscription plan prices
- Feature toggles (enable/disable features)
- Email templates

---

## Notifications System

Types handled:
- `tournament_invite` — team invited to tournament
- `team_invite` — gamer invited to team
- `booking_request` — new service booking
- `booking_confirmed` — booking confirmed by organizer
- `sponsorship_confirmed` — sponsor package purchase confirmed
- `payment_released` — escrow released to provider
- `message` — new direct message
- `verification_approved/rejected` — organizer verification result

---

## Payments (Paymob)

- Gateway: Paymob (MENA, supports EGP)
- All prices in EGP
- Flow: frontend creates order → backend calls Paymob → iframe payment → webhook confirms
- Webhook at `/api/payments/paymob/callback`
- HMAC verified in backend (`paymob.js`)

Escrow flow:
1. Payment captured → `service_bookings.escrow_status = 'held'`
2. Delivery confirmed → `escrow_status = 'released'`
3. Revenue entry added to `heru_revenue_ledger`
4. Provider receives net (gross - 15%)

---

## Revenue Ledger

Table: `heru_revenue_ledger`

| Field | Description |
|-------|-------------|
| `stream` | `service_booking`, `sponsorship`, `subscription` |
| `gross_amount` | Full transaction amount |
| `platform_fee` | 15% of gross (for service/sponsorship) |
| `net_to_party` | What provider/organizer receives |
| `reference_id` | ID of booking/sponsorship/subscription |

Staff can view full breakdown in Staff → Revenue (3-stream view).
