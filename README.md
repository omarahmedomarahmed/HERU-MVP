# HERU.gg — Esports Tournament Platform

HERU.gg is an esports tournament platform built for the MENA region (Egypt, Saudi Arabia, UAE).  
It connects **Gamers**, **Tournament Organizers**, and **Staff** in one unified platform.

---

## What The Platform Does

| Who | What they can do |
|-----|------------------|
| **Gamers** | Join tournaments, manage teams, offer talent services, shop the marketplace, connect Riot & Discord accounts, chat with the AI assistant |
| **Organizers** | Build tournaments using a step-by-step builder, list on the Sponsorship Radar to find co-organizers/sponsors, manage billing, add HERU Bot to their Discord server |
| **Staff** | Full admin control — users, tournaments, billing, marketplace, approvals, revenue tracking |

### Key Features Built
- **Tournament Builder** — Multi-step form with live cost calculator (15% platform fee auto-applied)
- **Sponsorship Radar** — Organizers who can't fund 100% solo list their tournament; others commit 33%/66% as co-organizers or sponsors
- **HERU CONNECT** — Gamers link their Discord and Riot Games (LoL / Valorant) accounts; stats display on profile
- **HERU BOT** — Discord bot with 11 slash commands; supports natural language via @mentions; Claude AI-powered
- **AI Agent** — Claude-powered chat assistant on `/gamer/ai-agent` and inside Discord
- **Marketplace** — Gamers can buy tournament-related items; talents can be booked by organizers
- **Billing System** — Automated invoicing (EGP), Paymob payment gateway ready, shared-tournament invoice splitting
- **Arena (1v1)** — Gamers challenge each other to 1v1 matches

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js 20 + Express 4 (ES Modules) |
| Database | Supabase (PostgreSQL 15) |
| Auth | Supabase Auth (email + password + JWT) |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime (chat) |
| Payments | Paymob API (MENA) |
| Email | Resend API |
| AI | Anthropic Claude (`claude-opus-4-7`) |
| Discord Bot | discord.js v14 |
| Hosting | Hostinger VPS (Ubuntu 22.04, Nginx, PM2) |

---

## Project Structure

```
/
├── src/                        # React frontend (Vite)
│   ├── pages/                  # All page components
│   │   ├── gamer/             # Gamer-specific pages (Arena, ConnectedAccounts, AiAgent)
│   │   ├── organizer/         # Organizer-specific pages
│   │   └── auth/              # Auth pages (login/register)
│   ├── components/
│   │   ├── layouts/           # GamerLayout, OrganizerLayout, StaffLayout
│   │   ├── navigation/        # Navbar, dropdowns
│   │   └── shared/            # Reusable UI components
│   ├── api/
│   │   └── heruClient.js      # All API calls to backend (single source of truth)
│   └── lib/
│       ├── AuthContext.jsx    # Supabase auth context
│       ├── auth-guards.jsx    # RequireGamer, RequireOrganizer, RequireStaff
│       └── supabase.js        # Supabase client (anon key)
│
├── backend/                    # Express API server
│   ├── index.js               # Entry point — all route mounts
│   └── src/
│       ├── routes/            # 27 route modules (one per feature area)
│       ├── middleware/        # auth.js, roleGuard.js, staffGuard.js
│       ├── lib/
│       │   ├── supabase.js   # Supabase admin client (service role key)
│       │   ├── paymob.js     # Paymob payment gateway
│       │   ├── resend.js     # Email via Resend
│       │   ├── ai/           # Claude agent: agent.js, tools.js, prompts.js
│       │   └── connect/      # Discord OAuth: discord.js | Riot API: riot.js
│       └── logic/            # Business logic (tournament costs, billing, radar)
│
├── bot/                        # Discord bot (discord.js v14)
│   ├── index.js               # Bot entry point
│   ├── register-commands.js   # One-time slash command registration
│   ├── commands/index.js      # 11 slash command definitions
│   └── lib/                   # heruClient.js, embeds.js, conversationManager.js
│
├── supabase/
│   └── migrations/            # 14 SQL migration files (run in order)
│
└── nginx/                      # Nginx config for VPS
```

---

## All Frontend Routes

### Public (no login needed)
| Path | Page |
|------|------|
| `/` | Landing page |
| `/tournaments` | Browse all tournaments |
| `/tournaments/:id` | Tournament detail |
| `/teams` | Browse teams |
| `/teams/:id` | Team profile |
| `/organizer/:id` | Organizer public profile |
| `/talents` | Browse talent profiles |
| `/radar` | Sponsorship radar |
| `/radar/:id` | Radar listing detail |

### Auth
| Path | Page |
|------|------|
| `/auth` | Choose gamer or organizer |
| `/auth/gamer/login` | Gamer login |
| `/auth/gamer/register` | Gamer register |
| `/auth/organizer/login` | Organizer login |
| `/auth/organizer/register` | Organizer register |
| `/auth/forgot-password` | Password reset request |
| `/auth/reset-password` | Set new password |
| `/admin` | Staff login (hidden — not linked anywhere) |

### Gamer Zone (login required)
| Path | Page |
|------|------|
| `/gamer/home` | Feed — tournaments, notifications |
| `/gamer/arena` | 1v1 Arena challenges |
| `/gamer/tournaments` | Browse tournaments |
| `/gamer/tournaments/:id` | Tournament detail + join |
| `/gamer/profile` | Edit profile |
| `/gamer/profile/talent` | Become a talent |
| `/gamer/teams` | My teams |
| `/gamer/teams/create` | Create a team |
| `/gamer/teams/:id` | Team management |
| `/gamer/gigs` | Gig requests (talent) |
| `/gamer/gigs/:id` | Gig detail + chat |
| `/gamer/orders` | My marketplace orders |
| `/gamer/orders/:id` | Order detail |
| `/gamer/marketplace` | Shop |
| `/gamer/cart` | Shopping cart |
| `/gamer/billing` | My bills |
| `/gamer/notifications` | All notifications |
| `/gamer/connect` | Connect Discord + Riot accounts |
| `/gamer/ai-agent` | AI assistant chat |

### Organizer Zone (login required)
| Path | Page |
|------|------|
| `/organizer/dashboard` | Main dashboard |
| `/organizer/tournaments` | My tournaments |
| `/organizer/tournaments/new` | Tournament Builder |
| `/organizer/tournaments/:id/manage` | Manage tournament |
| `/organizer/tournaments/:id/view` | Co-organizer read-only view |
| `/organizer/radar` | Sponsorship Radar feed |
| `/organizer/radar/:id` | Radar listing + commit |
| `/organizer/sponsored` | My co-organized tournaments |
| `/organizer/billing` | All invoices |
| `/organizer/billing/:bill_number` | Bill detail + pay |
| `/organizer/messages` | Conversations |
| `/organizer/profile` | Brand settings |

### Staff Zone (access key required)
| Path | Page |
|------|------|
| `/staff/dashboard` | Platform overview |
| `/staff/tournaments` | All tournaments |
| `/staff/users` | All users |
| `/staff/marketplace` | Manage items |
| `/staff/approvals` | Approval queue |
| `/staff/orders` | All orders |
| `/staff/radar` | All radar listings |
| `/staff/billing` | Master billing |
| `/staff/revenue` | HERU fee revenue |
| `/staff/organizers` | All organizer profiles |
| `/staff/gamers` | All gamer profiles |
| `/staff/teams` | All teams |
| `/staff/gigs` | All gig requests |
| `/staff/audit` | Audit trail |
| `/staff/settings` | App settings |
| `/staff/tournament-builder` | Build on behalf |

---

## Database (Supabase)

Apply all 14 migration files in order via Supabase Dashboard → SQL Editor:

| File | What it creates |
|------|-----------------|
| 001_initial_schema.sql | Core tables |
| 002_rls_policies.sql | Row-Level Security |
| 003_indexes.sql | Performance indexes |
| 004_storage.sql | Storage buckets |
| 005_enhanced_entities.sql | Extended table fields |
| 006_security_fixes.sql | RLS hardening |
| 007_username_slug.sql | Gamer username/slug |
| 008_arena_1v1.sql | 1v1 Arena tables |
| 009_promo_codes.sql | Promo code tables |
| 009_team_chat_and_fixes.sql | Team chat |
| 010_radar_views.sql | Radar view tracking |
| 011_prize_breakdown_and_reports.sql | Prize breakdown + reports |
| 014_heru_connect.sql | Discord + Riot + AI Agent tables |

---

## Discord Bot Commands

| Command | What it does |
|---------|--------------|
| `/heru-link` | Sends OAuth link to connect HERU account to Discord |
| `/heru-profile [username]` | Shows a gamer's HERU profile |
| `/heru-stats [game]` | Shows your Riot ranked stats |
| `/heru-tournaments` | Lists active tournaments |
| `/heru-join [tournament]` | Join a tournament via Discord |
| `/heru-team [name]` | Look up a team |
| `/heru-standings` | Tournament standings |
| `/heru-ask [question]` | Ask the Claude AI assistant anything |
| `/heru-build` | Start building a tournament (AI-guided, organizers only) |
| `/heru-setup` | Link your Discord server to your HERU organizer account (admin only) |
| `/heru-announce [message]` | Announce something to the server (admin only) |

---

## Local Development Setup

```bash
# 1. Install dependencies
npm install
cd backend && npm install && cd ..
cd bot && npm install && cd ..

# 2. Set up environment files
cp .env.example .env
cp .env.example backend/.env
# Fill in Supabase keys, Discord secrets, Anthropic key, etc.

# 3. Apply database migrations
# In Supabase Dashboard → SQL Editor, paste and run each migration file in order

# 4. Start development servers
# Terminal 1 — Backend (port 3001)
cd backend && npm run dev
# Terminal 2 — Frontend (port 5173)
npm run dev

# 5. Register bot slash commands (once)
cd bot && node register-commands.js
```

---

## VPS Deployment (Hostinger Ubuntu 22.04)

```bash
cd /var/www/heru
git pull origin claude/add-oauth-discord-bot-cDDza
npm install
cd backend && npm install && cd ..
cd bot && npm install && cd ..
npm run build
pm2 restart heru-backend
pm2 restart heru-bot
pm2 save
```

---

## Environment Variables

See `.env.example` for the complete list.

| Variable | Where to get it |
|----------|-----------------|
| `VITE_SUPABASE_URL` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `DISCORD_CLIENT_SECRET` | Discord Developer Portal → OAuth2 |
| `DISCORD_BOT_TOKEN` | Discord Developer Portal → Bot |
| `RIOT_API_KEY` | developer.riotgames.com (renew daily) |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `HERU_BOT_SECRET` | Generate: `openssl rand -hex 32` |
| `PAYMOB_API_KEY` | Paymob merchant dashboard |

---

## Demo Accounts

| Role | Email | Key |
|------|-------|-----|
| Staff (super admin) | omarabdelgawad001@gmail.com | HERU-STAFF-OMAR-2026 |
| Staff (ops) | heru.gg.esports@gmail.com | HERU-STAFF-OPS-2026 |

---

## Revenue Model

- HERU charges a **15% platform fee** on every tournament total
- Fee is auto-calculated and added to every invoice
- Example: EGP 80,000 tournament → EGP 12,000 fee → EGP 92,000 billed
- All currency is **EGP** — never USD

---

## License

Proprietary — All rights reserved © HERU.gg 2026
