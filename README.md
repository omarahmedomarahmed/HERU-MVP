# HERU.gg — The Operating System for Esports in MENA

HERU.gg is a four-sided esports marketplace connecting **Gamers**, **Organizers**, **Sponsors**, and **Service Providers** across the MENA region (Egypt, Saudi Arabia, UAE).

---

## Architecture

```
Frontend:  React 18 + Vite + TailwindCSS
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
- Supabase CLI (`npm install -g supabase`)
- A Supabase project (free tier works)

### 1. Clone & install

```bash
git clone <repo-url> heru-mvp
cd heru-mvp

# Frontend dependencies
npm install

# Backend dependencies
cd backend && npm install && cd ..
```

### 2. Environment setup

```bash
cp .env.example .env
```

Fill in `.env` with your Supabase URL, anon key, service role key, and other credentials. See `.env.example` for all required variables.

### 3. Database setup

```bash
# Start local Supabase (optional — or use hosted project)
supabase start

# Run all migrations in order
supabase db push
# OR apply manually via Supabase dashboard SQL editor
```

Migrations are in `supabase/migrations/`. Use the canonical fresh schema (`100–105`):

```bash
# Apply in order (fresh install — skip 001-022 legacy files)
psql "$DATABASE_URL" -f supabase/migrations/100_fresh_schema_core.sql
psql "$DATABASE_URL" -f supabase/migrations/101_fresh_schema_gamers.sql
psql "$DATABASE_URL" -f supabase/migrations/102_fresh_schema_organizers.sql
psql "$DATABASE_URL" -f supabase/migrations/103_fresh_schema_providers.sql
psql "$DATABASE_URL" -f supabase/migrations/104_fresh_schema_sponsors.sql
psql "$DATABASE_URL" -f supabase/migrations/105_fresh_schema_rls.sql
```

If using Supabase CLI: `supabase db push` (only runs files not yet applied).

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

### Gamers (`/auth/gamer/*` → `/gamer/*`)
- Register, compete in tournaments, manage teams
- Browse coaches and book 1:1 sessions
- View cross-tournament leaderboards
- Add friends and send direct messages

### Organizers (`/auth/organizer/*` → `/organizer/*`)
- Build tournaments with a multi-step builder (costs auto-calculated)
- Create sponsorship packages (priced relative to reach)
- Book service providers directly inside the builder
- Get verified (required to publish to Sponsorship Radar)

### Sponsors (`/auth/sponsor/*` → `/sponsor/*`)
- Browse Sponsorship Radar to find tournaments with packages
- Purchase packages via Paymob, track deliverables
- Subscribe (Pro/Enterprise) for analytics and consultant access
- Request fully-managed campaigns from HERU

### Service Providers (`/auth/provider/*` → `/provider/*`)
- List services in categories: Branding, Production, Talent, Venue, Marketing
- Receive bookings from organizers; payment held in escrow
- Special types: Coaches (visible at `/coaches`), Influencers (visible at `/influencers`)
- Get rated and reviewed after each booking

### Staff (`/admin` — hidden, not linked publicly)
- Approve service providers and organizer verifications
- Manage the revenue ledger (service fee + sponsorship fee + subscription MRR)
- Platform control panel (feature toggles, fee %)
- CMS editor for landing page copy
- Assign consultants to managed service projects

---

## Revenue Model

| Stream | Rate | Table |
|--------|------|-------|
| Service booking fee | 15% of booking price | `heru_revenue_ledger` |
| Sponsorship fee | 15% of package price | `heru_revenue_ledger` |
| Subscription (Pro/Enterprise) | Full price | `heru_revenue_ledger` |

All currency is **EGP** — never USD.

---

## Project Structure

```
/
├── src/                    # React frontend
│   ├── api/heruClient.js   # API helper (all fetch calls)
│   ├── lib/AuthContext.jsx  # Auth + role state
│   ├── lib/auth-guards.jsx  # Route protection components
│   ├── components/layouts/ # Per-stakeholder layouts
│   └── pages/
│       ├── auth/           # Login/register pages per role
│       ├── gamer/          # Gamer dashboard pages
│       ├── organizer/      # Organizer dashboard pages
│       ├── sponsor/        # Sponsor dashboard pages
│       ├── provider/       # Provider dashboard pages
│       └── staff/          # Staff admin pages
├── backend/
│   ├── index.js            # Express app entry point
│   └── src/
│       ├── routes/         # One file per API resource
│       ├── middleware/      # auth.js, roleGuard.js, staffGuard.js
│       ├── lib/             # supabase.js, paymob.js, resend.js
│       └── logic/          # tournament.js, billing.js, notifications.js
└── supabase/
    └── migrations/         # Sequential SQL migration files
```

---

## Deployment (Hostinger VPS)

See `SETUP.md` for full step-by-step deployment instructions.

Quick summary:
1. SSH into VPS, install Node.js 20, Nginx, PM2
2. Clone repo, run `npm install` in both root and `backend/`
3. Copy `.env` with production credentials
4. Run migrations against hosted Supabase project
5. Build frontend: `npm run build` → output in `dist/`
6. Configure Nginx: serve `dist/` for frontend, proxy `/api` to backend port 3001
7. Start backend with PM2: `pm2 start backend/index.js --name heru-backend`
8. Enable HTTPS with Certbot

---

## Demo Accounts (seed data)

| Role | Email | Note |
|------|-------|------|
| Admin/Staff | omarabdelgawad001@gmail.com | Staff key: `HERU-STAFF-OMAR-2026` |
| Organizer | mr.3omar.a7mad@gmail.com | Nexus Esports |
| Gamer | habibaheikal27@gmail.com | — |

---

## Documentation

| File | Contents |
|------|----------|
| `CLAUDE.md` | Full architecture handover for AI assistants |
| `REVENUE.md` | Where every fee is stored, applied, and how to change it |
| `DATABASE_MIGRATION.md` | How to migrate to MySQL, Firebase, or plain PostgreSQL |
| `AUTH_MIGRATION.md` | How to swap Supabase Auth for Firebase, Auth0, Clerk, or custom JWT |
| `SETUP.md` | Step-by-step VPS deployment instructions |

---

## Key Business Rules

1. Platform fee is always **15%** on all transactions
2. All prices in **EGP** only
3. Organizer must be **verified** before publishing to Sponsorship Radar
4. Service provider listings require **staff approval** before appearing
5. Sponsor cannot see tournament cost breakdown — only packages
6. Staff login at `/admin` — never linked from public navigation
7. Escrow: payment held at booking, released after organizer confirms delivery
8. Coaching: 15% HERU cut on every session
9. Subscriptions: full price goes to HERU (no cut — it is the cut)
10. Max sponsorship packages per tournament: no hard limit, but guide is 1–3 tiers
