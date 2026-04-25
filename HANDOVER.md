# HERU.gg — Master Handover Document

> **For anyone new to this codebase.** Read this file first, then follow the links in order.

---

## What Is HERU.gg?

HERU.gg is a **four-sided esports marketplace** for the MENA region (Egypt, Saudi Arabia, UAE).

Four products, one platform:

| Product | Audience | Dashboard |
|---------|----------|-----------|
| **HERU Arena** | Gamers | `/gamer/home` |
| **HERU Organizer** | Tournament organizers | `/organizer/dashboard` |
| **HERU Sponsor** | Brand sponsors | `/sponsor/dashboard` |
| **HERU Services** | Service providers | `/provider/dashboard` |

Revenue model: **15% platform fee** on all transactions (sponsorships, service bookings, coaching). Subscription revenue is 100% HERU.

---

## How to Read This Codebase

Read in this order:
1. **This file (HANDOVER.md)** — understand the platform
2. **[README.md](./README.md)** — quick start and Platform Assumptions
3. **[PRODUCT_REQUIREMENTS.md](./PRODUCT_REQUIREMENTS.md)** — full feature specifications
4. **[SETUP.md](./SETUP.md)** — deploy to production (VPS)
5. **[DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md)** — switch databases
6. **[AUTH_MIGRATION.md](./AUTH_MIGRATION.md)** — switch auth providers
7. **[REVENUE.md](./REVENUE.md)** — revenue ledger details

---

## Current Tech Stack

```
Frontend:    React 18 + Vite + TailwindCSS + shadcn/ui
Backend:     Node.js 20 + Express 4 (REST API on port 3001)
Database:    Supabase (PostgreSQL 15) + Row Level Security
Auth:        Supabase Auth (JWT) + custom staff session tokens
Payments:    Paymob API (MENA gateway, EGP only)
Email:       Resend API
Realtime:    Supabase Realtime (direct messages, live brackets)
Hosting:     Hostinger VPS (Ubuntu 22.04, Nginx, PM2)
```

---

## Directory Guide

```
/src/pages/
  public/         Public pages (no auth required)
  auth/           Login & register pages per role
  gamer/          Gamer dashboard pages
  organizer/      Organizer dashboard pages
  sponsor/        Sponsor dashboard pages
  provider/       Provider dashboard pages
  staff/          Staff admin pages

/src/components/
  layouts/        Per-stakeholder sidebar/header layouts
  shared/         HeruLogo, AnimatedBackground, etc.
  ui/             shadcn/ui component library
  navigation/     Navbar components

/backend/src/
  routes/         One file per API resource (/api/tournaments, etc.)
  middleware/     auth.js, roleGuard.js, staffGuard.js
  lib/            supabase.js, paymob.js, resend.js
  logic/          tournament.js, billing.js, notifications.js

/supabase/migrations/
  100_fresh_schema_core.sql        user_profiles, staff, settings, CMS
  101_fresh_schema_gamers.sql      gamers, teams, tournaments, matches
  102_fresh_schema_organizers.sql  organizers, deliverables, bills
  103_fresh_schema_providers.sql   providers, services, bookings, coaching
  104_fresh_schema_sponsors.sql    sponsors, subscriptions, packages, revenue
  105_fresh_schema_rls.sql         Row Level Security policies
```

> Files 001–022 are legacy migrations from before the platform pivot — **ignore on fresh installs**.

---

## Authentication Flows

### Normal users (gamer/organizer/sponsor/provider)
1. Frontend calls `supabase.auth.signInWithPassword()`
2. On success, `AuthContext` fetches `/api/auth/me` to get role + profile
3. `RequireGamer`, `RequireOrganizer`, etc. guards check `userProfile.role`

### Staff
1. Frontend calls `POST /api/auth/staff/login` with email + password + access key
2. Backend validates Supabase auth → checks `user_profiles.role === 'admin'` → validates `staff_access_keys`
3. Returns `session_token` stored in `localStorage` as `heru_staff_token`
4. Staff API calls send `X-Staff-Token` header verified by `staffGuard.js`

### Staff access keys
```
HERU-STAFF-OMAR-2026
HERU-STAFF-OPS-2026
```

---

## Key Flows (End-to-End)

### Tournament Lifecycle
```
Organizer builds in Builder
  → Adds service providers (auto-booked, escrow)
  → Adds sponsorship packages
  → Publishes (requires verification)
  → Sponsor buys package via Paymob
  → Tournament runs (brackets, teams)
  → Organizer confirms service delivery
  → Escrow released to service providers
  → HERU takes 15% from sponsorship + booking
```

### Booking Escrow
```
Organizer books provider
  → Payment captured via Paymob
  → Booking status = 'confirmed' (payment held)
  → Service delivered
  → Organizer marks as 'delivered'
  → Payment released to provider (minus 15%)
  → Revenue entry added to heru_revenue_ledger
```

### Sponsor Subscription
```
Free:       Radar browsing + 1 active sponsorship
Pro:        Unlimited sponsorships + influencer hub + managed projects
Enterprise: Everything + Internal Campaign Builder + consultant access
```

---

## Changing Platform Assumptions

All business-critical assumptions are configurable. Here's how:

### Change Platform Fee (currently 15%)
1. **Staff Settings page** → Platform Assumptions → Platform Fee
2. OR: Update `app_settings` table: `UPDATE app_settings SET value = '12' WHERE key = 'platform_fee_percent'`
3. The backend reads this from `/api/settings` — all billing logic uses it dynamically

### Change Subscription Prices
1. **Staff Settings page** → Platform Assumptions → Subscription Pricing
2. OR: Update `app_settings` table keys: `subscription_pro_price`, `subscription_enterprise_price`

### Add a New Service Category
1. Add to the categories array in `ProviderAuthRegister.jsx` and `ProviderServiceNew.jsx`
2. Add custom fields to the service schema in `supabase/migrations/103_fresh_schema_providers.sql`
3. Add the category display to public provider profile

### Add a New Admin Staff Member
1. Insert into `user_profiles` with `role = 'admin'`
2. Insert into `staff_access_keys` with a new key

---

## Migrating the Database

See [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) for complete guide. Summary paths:

| Target | Effort | Guide Section |
|--------|--------|---------------|
| Hosted PostgreSQL (RDS, Neon, etc.) | Low | Section 2 |
| MySQL / PlanetScale | Medium | Section 3 |
| Firebase Firestore | High | Section 4 |
| Keep Supabase, change project | Very Low | Section 1 |

Key things to replace when migrating away from Supabase:
- `@supabase/supabase-js` calls in `backend/src/lib/supabase.js`
- Row Level Security policies in `105_fresh_schema_rls.sql` (implement at app level)
- Supabase Auth (see AUTH_MIGRATION.md)
- Supabase Realtime (replace with socket.io or Pusher)
- Supabase Storage (replace with S3 or Cloudinary)

---

## Migrating Auth

See [AUTH_MIGRATION.md](./AUTH_MIGRATION.md). Options:
- **Firebase Auth** — good for mobile-first
- **Auth0 / Clerk** — good for enterprise SSO
- **Custom JWT** — most control, most work
- **NextAuth** — if migrating to Next.js

Key files to update: `src/lib/supabase.js`, `src/lib/AuthContext.jsx`, `backend/src/middleware/auth.js`

---

## Migrating Hosting

### Moving to AWS
1. Replace Hostinger VPS → EC2 (t3.small for start)
2. Replace Nginx config (same `nginx/heru.gg.conf` works)
3. Replace PM2 with ECS Fargate or Elastic Beanstalk (or keep PM2)
4. Replace `dist/` static serving → S3 + CloudFront
5. Environment: use SSM Parameter Store or Secrets Manager for `.env`

### Moving to Vercel (frontend) + Railway (backend)
1. Frontend: `npm run build` → deploy `dist/` to Vercel
2. Backend: deploy `backend/` to Railway (it already has `package.json`)
3. Update `VITE_API_URL` to point to Railway URL
4. Update `CORS_ORIGIN` in backend env

### Moving to Docker
1. Frontend: `Dockerfile` in root → `npm run build` → serve with nginx
2. Backend: `Dockerfile` in `backend/` → `node index.js`
3. Use `docker-compose.yml` for local dev

---

## Changing the Tech Stack

### Frontend: React → Next.js
- Pages map 1:1 (App Router file-based routing)
- `react-router-dom` → Next.js `Link` and `useRouter`
- `@tanstack/react-query` stays the same
- `shadcn/ui` stays the same (it's built for Next.js too)

### Frontend: React → Vue 3 / Nuxt
- Component logic stays similar (Composition API ≈ React hooks)
- Replace `react-query` with `@pinia/colada` or `useAsyncData`
- Replace `react-router-dom` with `vue-router`

### Backend: Express → Fastify
- Performance improvement, same REST API structure
- Replace `app.use(...)` with `fastify.register(...)`
- Middleware → plugins

### Backend: Express → Next.js API Routes
- Move all `backend/src/routes/*.js` to `app/api/*/route.ts`
- Supabase client stays the same

### Database: Move away from Supabase
1. Export all data: `supabase db dump` or `pg_dump`
2. Apply schema to new database
3. Update connection string in `backend/src/lib/supabase.js`
4. Remove Supabase-specific features (RLS, Realtime, Storage)
5. Implement equivalent features at app layer

---

## Maintenance Checklist

### Weekly
- [ ] Check PM2 logs: `pm2 logs heru-backend`
- [ ] Check Supabase dashboard for slow queries
- [ ] Review any pending provider approvals in Staff → Approvals

### Monthly
- [ ] Renew Riot API dev key (expires daily for dev keys)
- [ ] Review revenue ledger for anomalies
- [ ] Update dependencies: `npm audit fix`

### When Something Breaks
1. Check PM2: `pm2 status` and `pm2 logs heru-backend`
2. Check Nginx: `sudo nginx -t` and `sudo systemctl status nginx`
3. Check Supabase status: https://status.supabase.com
4. Check frontend build: `npm run build` (look for TypeScript/build errors)

---

## Environment Variables Reference

See `.env.example` for all variables. Critical ones:

| Variable | Used In | Required |
|----------|---------|---------|
| `VITE_SUPABASE_URL` | Frontend | Yes |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Yes |
| `PAYMOB_API_KEY` | Backend | For payments |
| `RESEND_API_KEY` | Backend | For emails |
| `DISCORD_CLIENT_SECRET` | Backend | For Discord connect |
| `RIOT_API_KEY` | Backend | For Riot connect (expires daily in dev) |

---

## Contact & Support

Platform built for HERU.gg by the development team.
Staff access: `/admin` (hidden from public nav)
Staff keys: `HERU-STAFF-OMAR-2026`, `HERU-STAFF-OPS-2026`
