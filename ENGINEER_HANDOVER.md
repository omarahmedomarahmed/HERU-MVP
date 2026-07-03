# HERU.gg — Engineer Handover Document

## What This Platform Is

HERU.gg is an esports tournament platform for the MENA region (Egypt, Saudi Arabia, UAE). It connects three user types:

- **Gamers** — compete in tournaments, manage teams, offer talent services
- **Organizers** — create/manage tournaments, book talent, manage billing
- **Staff** — platform administrators with full oversight

The core revenue model: HERU takes a **15% platform fee** on every tournament, added on top of the total tournament cost.

## The Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 18 + Vite + TailwindCSS | Port 5173 in dev |
| Backend | Node.js 20 + Express 4 | Port 3001 in dev |
| Database | Supabase (PostgreSQL 15) | Service role key bypasses RLS |
| Auth | Supabase Auth | Email/password + JWT |
| Storage | Supabase Storage | heru-uploads bucket, 10MB limit |
| Realtime | Supabase Realtime | Tournaments, gigs, radar, match_records |
| Payments | Paymob API | MENA gateway, toggled via PAYMOB_ENABLED |
| Email | Resend API | Transactional notifications |
| Hosting | Hostinger VPS | Ubuntu 22.04, Nginx, PM2 |

## Local Development Setup

```bash
# 1. Clone
git clone https://github.com/omarabdelgawad001-cmd/HERU-MVP.git
cd HERU-MVP

# 2. Install dependencies
npm ci
cd backend && npm ci && cd ..

# 3. Create .env files (see README.md for full list)
# Root .env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
# backend/.env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, PORT

# 4. Set up database
# Run all 19 migration files (001-019) in order in Supabase SQL Editor
# Then run supabase/seed/seed.sql

# 5. Start development
# Terminal 1:
cd backend && node index.js
# Terminal 2:
npm run dev
```

## Auth — Three Separate Flows

### Gamer Auth
- Routes: `/auth/gamer/login`, `/auth/gamer/register`
- Backend: `POST /api/auth/register/gamer`, `POST /api/auth/login`
- Creates: `user_profiles` (role='gamer') + `gamer_profiles` record
- After login → `/gamer/home`

### Organizer Auth
- Routes: `/auth/organizer/login`, `/auth/organizer/register`
- Backend: `POST /api/auth/register/organizer`, `POST /api/auth/login`
- Creates: `user_profiles` (role='organizer') + `organizer_profiles` record
- After login → `/organizer/dashboard`

### Staff Auth (HIDDEN — not linked from any public nav)
- Route: `/admin`
- Backend: `POST /api/auth/staff/login`
- Requires: email + password + staff access key (e.g. `HERU-STAFF-OMAR-2026`)
- Creates a `staff_sessions` record with a 24h token
- Token stored in `localStorage` as `heru_staff_token`
- All `/staff/*` routes check this token via `X-Staff-Token` header
- **Staff does NOT use Supabase auth sessions** — they use the custom staff session system
- After login → `/staff/dashboard`

**Critical implementation detail:** The auth route uses a separate Supabase client (`createAuthClient()`) with the **anon key** for `signInWithPassword`. Never call `signInWithPassword` on `supabaseAdmin` — it contaminates the service-role client's internal session and causes RLS failures on subsequent queries.

## Tournament Lifecycle

1. **Create** — Organizer uses the 7-step Tournament Builder (`/organizer/tournaments/new`)
   - Steps: Game → Branding → Teams → Talent → Production → Venue → Prizepool
   - Autosaves every 30s as a draft
2. **Publish** — Validates profile completeness, resolves marketplace items, calculates costs
   - Solo: Creates tournament_order + bill for organizer
   - Shared: Creates tournament_order + bill + sponsorship_radar entry
3. **Join** — Teams/players register via join requests (auto-approved)
4. **Go Live** — Organizer changes status to 'live', brackets are generated
5. **Brackets** — Organizer enters scores per match, winners advance automatically
6. **Scoring** — Bracket updates sync to `match_records` table for detailed tracking
7. **Winner** — `POST /tournaments/:id/announce-winner` sets status='completed'

## Arena (Gamer Match View)

The Arena (`/gamer/arena/:id`) is the gamer's view of a tournament they're participating in. It uses a phase-based UI:

| Phase | Condition | What Shows |
|-------|-----------|------------|
| `waiting` | Tournament status='published' | Countdown, team info |
| `seeding` | status='live', no matches yet | "Brackets being prepared" |
| `in_match` | Active match pending/in_progress | Score submission, match chat |
| `between_matches` | Current match done, more rounds | "Waiting for next match" |
| `completed` | Tournament completed | Prize podium, results |
| `spectator` | Not a participant | Read-only view |

Match data lives in the `match_records` table. The Arena polls match records every 15s and tournament data every 20s.

## Billing

- **Bill number format:** `HERU-YYYY-NNNN` (e.g. `HERU-2026-0001`)
- **Platform fee:** 15% of subtotal, always added on top
- **Solo tournament:** 1 invoice to main organizer for 100%
- **Shared tournament:** Separate invoice per party for their committed %
- **Invoice types:** `gamer` (marketplace orders), `organizer` (solo), `co_organizer` (shared)
- **Payment:** Paymob integration ready but disabled. Toggle via `PAYMOB_ENABLED=true`

## Sponsorship Radar

The Radar is where shared tournaments seek co-organizers:

- Main organizer commits minimum 33% of total cost
- If 33% → 2 co-organizer slots (each 33%)
- If 66% → 1 sponsor slot (66%)
- Maximum 3 parties total per tournament
- On commit: bill created for co-organizer's share
- On payment: `access_granted=true`, co-organizer joins organizer chat
- **Co-organizer contribution % is never shown publicly** — all organizers appear as equal partners

## Key Files

| File | Purpose |
|------|---------|
| `src/api/heruClient.js` | Frontend API client — all entity operations |
| `src/App.jsx` | All route definitions |
| `src/lib/AuthContext.jsx` | Auth state management |
| `src/lib/staffAuth.js` | Staff session management |
| `backend/index.js` | Express app entry point |
| `backend/src/lib/supabase.js` | Supabase client (exports supabaseAdmin) |
| `backend/src/middleware/auth.js` | JWT verification middleware |
| `backend/src/middleware/staffGuard.js` | Staff session verification |
| `backend/src/logic/tournament.js` | Cost calculation, bracket generation |
| `backend/src/logic/billing.js` | Bill number generation, invoice creation |
| `backend/src/logic/radar.js` | Commitment validation, funding calculation |

## Database Migration Order

19 migration files in `supabase/migrations/`, to be run on a **fresh** Supabase project:

1. `001` — Extensions (uuid-ossp, pgcrypto)
2. `002` — Core user tables (user_profiles, gamer_profiles, organizer_profiles)
3. `003` — Teams (teams, team_members)
4. `004` — Tournaments (all columns including brackets, chat, costs, results)
5. `005` — Marketplace (marketplace_items, orders)
6. `006` — Tournament orders (fulfillment tracking)
7. `007` — Billing (bills, billing_snapshots)
8. `008` — Sponsorship Radar (sponsorship_radar, radar_views)
9. `009` — Gig requests (talent booking)
10. `010` — Match records (arena scoring)
11. `011` — Approval requests
12. `012` — Staff (access_keys, sessions, app_settings)
13. `013` — Achievements, promo codes, games catalog
14. `014` — Tournament reports, deliverables, organizer page config
15. `015` — Audit logs (audit_log + audit_trail)
16. `016` — RLS policies for all tables
17. `017` — Performance indexes
18. `018` — Storage bucket + storage RLS
19. `019` — DB functions and triggers

## Deployment

See `VPS_DEPLOY.md` for full Hostinger VPS deployment steps.

**Redeploy:** SSH into VPS and run `bash deploy.sh` (pulls latest, builds, restarts PM2).

## Business Rules — Hardcoded, Never Change

| Rule | Value | Where Enforced |
|------|-------|--------------|
| Platform fee | 15% | `backend/src/logic/tournament.js`, Tournament Builder sidebar |
| Minimum co-org commitment | 33% | `backend/src/logic/radar.js`, commitment slider min |
| Maximum parties per tournament | 3 | Radar commit validation |
| Currency | EGP only | All frontend formatting, never $ or USD |
| Bill number format | HERU-YYYY-NNNN | `backend/src/logic/billing.js` |
| Tournament type visibility | Never shown to gamers | Public tournament pages hide solo/shared |
| Co-org % visibility | Never shown publicly | All organizers shown as equal partners |

## Common Pitfalls

1. **Git push 503:** The proxy sometimes returns HTTP 503 on large packs. Use `mcp__github__push_files` or retry with exponential backoff.

2. **Supabase RLS:** The backend uses `supabaseAdmin` (service role key) which bypasses RLS. If you see permission errors, check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly.

3. **Auth client contamination:** Never call `signInWithPassword` on `supabaseAdmin`. Always use `createAuthClient()` which creates a throwaway anon-key client.

4. **Missing SUPABASE_ANON_KEY in backend:** The backend needs both the service role key AND the anon key. Without the anon key, the auth route's `createAuthClient()` will throw.

5. **Staff login vs Supabase login:** Staff use a custom session system, not Supabase auth sessions. The `X-Staff-Token` header is checked by `staffGuard.js` middleware.

6. **Tournament columns:** The `TOURNAMENT_COLUMNS` Set in `tournaments.js` controls which fields can be set via the generic `PUT /:id` endpoint. Fields like `winner_team_id` and `results` are written by dedicated routes, not the generic update.
