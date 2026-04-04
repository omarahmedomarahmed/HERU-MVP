# HERU.gg — Esports Tournament Platform

HERU.gg is an esports tournament platform for the MENA region (Egypt, Saudi Arabia, UAE).
It connects **Gamers**, **Organizers**, and **Staff** through tournaments, team management,
a talent marketplace, and a shared sponsorship system.

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- A Supabase project (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/omarabdelgawad001-cmd/heru.gg-prod.git
cd heru.gg-prod
npm install
cd backend && npm install && cd ..
```

### 2. Set Up Supabase Database

Run the migration files **in order** in your Supabase SQL Editor:

1. `supabase/migrations/001_initial_schema.sql` — Creates 16 tables
2. `supabase/migrations/002_rls_policies.sql` — Row Level Security policies
3. `supabase/migrations/003_indexes.sql` — Performance indexes
4. `supabase/migrations/004_storage.sql` — File upload bucket
5. `supabase/seed/seed.sql` — Demo data

Or run the guided setup script:

```bash
bash scripts/setup-db.sh
```

### 3. Configure Environment Variables

**Frontend** (`.env` in project root — already pre-filled):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001/api
```

**Backend** (`backend/.env`):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
PLATFORM_FEE_PERCENT=15
PAYMOB_ENABLED=false
```

Get your **Service Role Key** from:
Supabase Dashboard → Settings → API → `service_role` (secret)

### 4. Run the App

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Health check: http://localhost:3001/api/health

### 5. Demo Login

**Staff (admin):** http://localhost:5173/admin
- Email: `omarabdelgawad001@gmail.com`
- Key: `HERU-STAFF-OMAR-2026`

---

## Project Structure

```
/
├── src/                    # React frontend (Vite + TailwindCSS)
│   ├── api/                # API client (heruClient.js)
│   ├── components/         # Reusable components
│   ├── lib/                # Auth context, Supabase client, utilities
│   ├── pages/              # Page components (Gamer, Organizer, Staff)
│   └── App.jsx             # Route definitions
├── backend/                # Express.js API server
│   ├── src/
│   │   ├── routes/         # 15 route modules
│   │   ├── middleware/      # auth, roleGuard, staffGuard
│   │   ├── lib/            # supabase, paymob, resend clients
│   │   └── logic/          # Business logic (tournament, billing, radar)
│   └── index.js            # Express entry point
├── supabase/
│   ├── migrations/         # 4 SQL migration files
│   └── seed/               # Demo seed data
├── scripts/                # Setup helper scripts
└── CLAUDE.md               # Full technical handover document
```

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, TailwindCSS        |
| Backend   | Node.js 20, Express 4              |
| Database  | Supabase (PostgreSQL 15)            |
| Auth      | Supabase Auth (email + JWT)         |
| Storage   | Supabase Storage                    |
| Realtime  | Supabase Realtime                   |
| Payments  | Paymob (MENA gateway, toggle-able)  |
| Email     | Resend (transactional)              |

## User Types

| Role      | Auth Route               | Dashboard               |
|-----------|--------------------------|-------------------------|
| Gamer     | `/auth/gamer/login`      | `/gamer/home`           |
| Organizer | `/auth/organizer/login`  | `/organizer/dashboard`  |
| Staff     | `/admin` (hidden)        | `/staff/dashboard`      |

## Revenue Model

HERU takes a **15% platform fee** on every tournament order, added on top of total cost.
All currency is displayed in **EGP** (Egyptian Pounds).

## Production Deployment (Hostinger VPS)

See `CLAUDE.md` for full deployment instructions including Nginx config and PM2 setup.

## License

Proprietary — HERU.gg Esports Platform
