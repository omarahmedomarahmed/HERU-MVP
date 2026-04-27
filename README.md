# HERU.gg — The Operating System for Esports in MENA

> **New here?** Start with [HANDOVER.md](./HANDOVER.md) — it explains the full platform, how to maintain it, and how to migrate/change anything.

HERU.gg is a four-sided esports marketplace connecting **Gamers**, **Organizers**, **Sponsors**, and **Service Providers** across the MENA region (Egypt, Saudi Arabia, UAE).

---

## Architecture

```
Frontend:  React 18 + Vite + TailwindCSS + shadcn/ui
Backend:   Node.js 20 + Express 4
Database:  Supabase (PostgreSQL 15 + RLS + Realtime + Storage)
Auth:      Supabase Auth (JWT) + custom staff session tokens
Payments:  Paymob API (EGP, MENA gateway)
Email:     Resend API
Hosting:   Hostinger VPS (Ubuntu 22.04, Nginx, PM2)
```

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- A Supabase project (free tier works)

### 1. Clone & install

```bash
git clone <repo-url> heru-mvp
cd heru-mvp
npm install
cd backend && npm install && cd ..
```

### 2. Environment setup

```bash
cp .env.example .env
# Fill in: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
# Also create backend/.env with same credentials
```

### 3. Database setup

```bash
# Apply canonical fresh schema in order
psql "$DATABASE_URL" -f supabase/migrations/100_core.sql
psql "$DATABASE_URL" -f supabase/migrations/101_gamers.sql
psql "$DATABASE_URL" -f supabase/migrations/102_organizers.sql
psql "$DATABASE_URL" -f supabase/migrations/103_providers.sql
psql "$DATABASE_URL" -f supabase/migrations/104_sponsors.sql
psql "$DATABASE_URL" -f supabase/migrations/105_rls.sql
psql "$DATABASE_URL" -f supabase/migrations/106_schema_fixes.sql
```

### 4. Run locally

```bash
# Terminal 1 — Frontend (port 5173)
npm run dev

# Terminal 2 — Backend (port 3001)
cd backend && npm start
```

Visit `http://localhost:5173`

---

## Stakeholder Flows

### Gamers → HERU ARENA (`/auth/gamer/*` → `/gamer/*`)
- Register, compete in tournaments, manage teams
- **Community Tournament Builder** (`/gamer/build`) — private scrims, clan wars, mini brackets
- Browse coaches and book 1:1 sessions
- View cross-tournament leaderboards, add friends, send DMs
- Gamer Shop (`/gamer/orders`) for marketplace items

### Organizers → HERU BUILDER (`/auth/organizer/*` → `/organizer/*`)
- Tournament Builder (5-step): game setup → details → prize pool → **services** → publish
- Registration link: public or private (invite-only toggle)
- Tournament Management CRM: overview, teams, brackets, providers, chat, settings
- Service providers bookable via /providers; payment held in escrow
- Verification required before enabling Sponsorship Radar
- "Build It For Me" consultant CTA on dashboard

### Sponsors → HERU RADAR (`/auth/sponsor/*` → `/sponsor/*`)
- Browse Sponsorship Radar to find tournaments with packages
- Purchase packages via Paymob, track deliverables
- Subscribe: **Free (EGP 0)** / **Community (EGP 150K/mo)** / **Premium (EGP 300K/mo)**
- Community: 2 online sponsorships/month. Premium: 2 online + 1 offline/month
- Influencer marketplace, Managed Projects, Billing page

### Service Providers → HERU GIGs (`/auth/provider/*` → `/provider/*`)
- List services in 9 categories: Venue, Coaching, Talent, Production, Marketing, Community, Hardware, EventVendor, TournamentMgmt
- Staff must approve listing before it appears in Tournament Builder
- Escrow payments — organizer confirms delivery before 85% is released
- Income breakdown page showing earnings after 15% platform fee

### Staff (`/admin` — hidden, not linked publicly)
- Full platform control: approve/reject providers, manage users, run tournaments
- Revenue ledger (service fee + sponsorship fee + subscription MRR)
- Platform control panel: feature toggles, CMS, settings (including fee %)
- All fee/pricing assumptions are configurable from Staff → Settings

---

## Revenue Model

| Stream | Rate | Source |
|--------|------|--------|
| Service booking fee | 15% of booking price | `heru_revenue_ledger` |
| Sponsorship package fee | 15% of package price | `heru_revenue_ledger` |
| Coaching session fee | 15% of session price | `heru_revenue_ledger` |
| Subscription (Community/Premium) | Full price → HERU | `heru_revenue_ledger` |

All currency is **EGP** — never USD.

---

## Project Structure

```
/
├── src/
│   ├── api/heruClient.js       # API helper (all fetch calls)
│   ├── lib/AuthContext.jsx      # Auth + role state
│   ├── lib/auth-guards.jsx      # Route protection components
│   ├── components/layouts/      # Per-stakeholder layouts
│   └── pages/
│       ├── public/              # Public pages (Home, Tournaments, Teams, etc.)
│       ├── auth/                # Login/register pages per role
│       ├── gamer/               # Gamer dashboard pages
│       ├── organizer/           # Organizer dashboard pages
│       ├── sponsor/             # Sponsor dashboard pages
│       ├── provider/            # Provider dashboard pages
│       └── staff/               # Staff admin pages
├── backend/
│   ├── index.js                 # Express app entry point
│   └── src/
│       ├── routes/              # One file per API resource
│       ├── middleware/          # auth.js, roleGuard.js, staffGuard.js
│       ├── lib/                 # supabase.js, paymob.js, resend.js
│       └── logic/              # tournament.js, billing.js, notifications.js
├── supabase/migrations/         # SQL migration files (100–105 canonical)
├── nginx/heru.gg.conf           # Nginx production config
└── ecosystem.config.cjs         # PM2 process manager config
```

---

## Deployment

See `SETUP.md` for full instructions. Quick summary:
1. SSH into VPS, install Node.js 20, Nginx, PM2
2. Clone repo, `npm install` in root and `backend/`
3. Copy `.env` with production credentials
4. Run migrations against hosted Supabase
5. Build: `npm run build`
6. Configure Nginx (see `nginx/heru.gg.conf`)
7. Start: `pm2 start ecosystem.config.cjs`
8. Enable HTTPS with Certbot

---

## Demo Accounts

| Role | Email | Note |
|------|-------|------|
| Admin/Staff | omarabdelgawad001@gmail.com | Staff key: `HERU-STAFF-OMAR-2026` |
| Organizer | mr.3omar.a7mad@gmail.com | Nexus Esports |
| Gamer | habibaheikal27@gmail.com | — |

---

## Documentation

| File | Contents |
|------|----------|
| **[HANDOVER.md](./HANDOVER.md)** | **Start here** — full platform state, maintenance, migration guides |
| [PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md) | Full PRD — all features, flows, and data models |
| [SETUP.md](./SETUP.md) | Step-by-step VPS deployment |
| [STAFF_REWRITE_PLAN.md](./STAFF_REWRITE_PLAN.md) | Complete plan for staff panel front+back end rewrite |
| [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) | How to migrate DB to MySQL/Firebase/PostgreSQL |
| [AUTH_MIGRATION.md](./AUTH_MIGRATION.md) | How to swap Supabase Auth |
| [REVENUE.md](./REVENUE.md) | Revenue ledger deep-dive |
| [CLAUDE.md](./CLAUDE.md) | AI assistant context document |

---

## Platform Assumptions

> **Important:** All of the following are **assumptions** that reflect the current business model. They are NOT hard technical constraints. Any of these can be changed by updating the relevant setting, code, or database entry. Staff can change fee-related assumptions directly from the Staff Settings page.

### Fees & Revenue
1. Platform fee is **15%** on all service bookings, sponsorship packages, and coaching sessions
2. Subscription revenue is **100% to HERU** (it is the fee — no additional cut)
3. All prices and fees are in **EGP only** — never USD or any other currency
4. Escrow model: payment held at booking, released after organizer confirms delivery
5. Minimum sponsorship package price is **1.5× the total service cost** (warning shown, not blocked)

### Sponsor Model
6. Sponsors **never see tournament cost breakdowns** — they see packages only (price, deliverables, reach)
7. Organizer contribution percentage is **never shown publicly**
8. Sponsor subscription plans: **Free** (EGP 0 — one-off purchases), **Community** (EGP 150K/mo — 2 online/mo), **Premium** (EGP 300K/mo — 2 online + 1 offline/mo)
9. Internal Campaign Builder and Managed Services are available on **Community or Premium**
10. Annual billing cycle available at discounted rate (`billing_cycle = 'annual'`)
11. No co-organizer model — sponsors buy structured packages, never partial ownership

### Organizer Model
12. Organizer must be **verified** (approved by staff) before publishing tournaments to Sponsorship Radar
13. Organizer verification shows a badge on public profile
14. Tournament Builder steps: Basic Info → Game Settings → Teams → Prizepool → **Service Providers** → Sponsorship Packages → Publish
15. Sponsorship packages are created inside the Builder (not a separate Radar management page)

### Service Provider Model
16. Service provider listings require **staff approval** before appearing in Tournament Builder
17. **Venue is a service category**, not a separate entity — providers select "Venue" as their service type
18. Special service types with separate public pages: **Coaches** (`/coaches`), **Influencers** (`/influencers`)
19. Coaches are service providers with `category = 'coaching'`
20. Influencers are service providers with `category = 'influencer'`
21. Custom fields per service category (e.g., venue shows capacity/location, marketing shows channel size)

### Gamer Model
22. Gamers have no talent or gig features — all "talent" (casting, hosting, etc.) is under Service Providers
23. Gamer shop (`/gamer/orders`) sells merchandise/gaming items only
24. Connected accounts: Discord + Riot currently integrated; Epic, Tencent, Steam planned (placeholders in .env)

### Platform
25. Staff login at `/admin` — **never linked** from public navigation
26. Staff access keys: `HERU-STAFF-OMAR-2026`, `HERU-STAFF-OPS-2026`
27. No public sponsorship radar page — radar is sponsor-authenticated only
28. Public pages: Home, Tournaments, Teams, Organizer profiles, Provider profiles, Gamer profiles
29. Platform fee percent is stored in `app_settings` table and readable via `/api/settings`
30. All fee/pricing settings can be changed by staff from Staff → Settings → Platform Assumptions
