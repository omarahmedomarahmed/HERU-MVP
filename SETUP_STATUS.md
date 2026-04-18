# HERU.gg — Setup & Migration Status

**Last updated:** April 18, 2026
**Active branch:** `main` (merged from `claude/heru-mvp-final-checkup-Kmi0E`)
**Supabase Project:** `utlxvkwdcpwvdnkthksk` (eu-central-1)

---

## ✅ Completed — Database Migrations (19 total)

| # | File | Contents |
|---|------|----------|
| 001 | `001_initial_schema.sql` | Core tables: users, tournaments, teams, marketplace, billing |
| 002 | `002_rls_policies.sql` | Row Level Security for all tables |
| 003 | `003_indexes.sql` | 32 performance indexes |
| 004 | `004_storage.sql` | Supabase Storage bucket + policies |
| 005 | `005_enhanced_entities.sql` | Enhanced columns on core tables |
| 006 | `006_security_fixes.sql` | RLS hardening, auth corrections |
| 007 | `007_username_slug.sql` | Username slugs for public gamer profile URLs |
| 008 | `008_arena_1v1.sql` | Arena 1v1 challenge system tables |
| 009 | `009_promo_codes.sql` | Promo/discount code system |
| 010 | `010_radar_views.sql` | Radar view tracking for analytics |
| 011 | `011_prize_breakdown_and_reports.sql` | Prizepool breakdown + tournament reports |
| 012 | `012_1v1_and_enhancements.sql` | 1v1 match enhancements, match records |
| 013 | `013_team_chat_and_fixes.sql` | Per-team tournament chat, schema fixes |
| 014 | `014_heru_connect.sql` | Discord OAuth, Riot accounts, bot servers, AI sessions |
| 015 | `015_riot_tournament.sql` | Riot Tournament API integration support |
| 016 | `016_schema_fixes.sql` | Various schema corrections |
| 017 | `017_migration_cleanup.sql` | Cleanup and index deduplication |
| 018 | `018_match_history_cache.sql` | Match history caching for Riot data |
| 019 | `019_radar_badges_venue.sql` | Radar image fix, badge system, venue submissions |

---

## ✅ Completed — Backend (Express API)

29 route modules fully implemented:

- `/api/auth` — Gamer/Organizer register+login, Staff login, password reset
- `/api/tournaments` — Full CRUD, brackets, chats, publish, match records
- `/api/teams` — Full CRUD, join requests, invites, team chat
- `/api/gamers` — Profile CRUD, talent application, stats
- `/api/organizers` — Profile CRUD, org page config
- `/api/marketplace` — Items CRUD
- `/api/orders` — Gamer marketplace orders
- `/api/tournament-orders` — Tournament fulfillment orders
- `/api/radar` — Sponsorship radar + commit flow, analytics
- `/api/gigs` — Gig requests + chat + file library
- `/api/bills` — Billing + invoicing
- `/api/approvals` — Staff approval workflow
- `/api/staff` — All staff-only endpoints
- `/api/settings` — App settings
- `/api/payments` — Paymob integration (disabled by default)
- `/api/upload` — File upload to Supabase Storage
- `/api/tournament-reports` — Tournament report generation
- `/api/achievements` — Achievement system
- `/api/deliverables` — Gig deliverables
- `/api/organizer-pages` — Custom organizer page config
- `/api/match-records` — Per-match history
- `/api/audit` — Audit trail
- `/api/promos` — Promo codes
- `/api/games` — Game catalog
- `/api/connect` — Discord OAuth + Riot account linking
- `/api/ai-agent` — Claude AI chat assistant
- `/api/bot` — Discord bot webhook
- `/api/riot-tournament` — Riot Tournament API
- `/api/badges` — Badge definitions + awards
- `/api/venues` — Venue submissions

---

## ✅ Completed — Frontend (React + Vite)

**61+ page components** covering all routes for Gamers, Organizers, and Staff.

Key pages and features:
- Full auth flows for all 3 user types (Gamer, Organizer, Staff)
- Gamer: Home feed, Tournaments, Profile, Teams, Gigs, Orders, Marketplace, Arena 1v1, Connected Accounts, AI Agent, Billing
- Organizer: Dashboard (radar focus), Tournament Builder (multi-step), Tournament Management, Sponsorship Radar, Co-Organized, Billing, Profile, Venues
- Staff: Dashboard, Tournaments, Users, Marketplace, Orders, Billing, Revenue, Radar, Badges, Venues, Audit Trail, Settings
- Public: Home, Tournaments browse, Team profiles, Organizer profiles, Gamer profiles, Sponsorship Radar, Talents

---

## ✅ Completed — Infrastructure

- `scripts/deploy-full.sh` — One-command VPS deployment
- `scripts/harden-vps.sh` — Security hardening script
- `scripts/setup-vps.sh` — VPS initial setup
- `scripts/setup-db.sh` — Database setup helper
- `nginx/heru.gg.conf` — Full Nginx config (SSL, proxy, security headers)
- `nginx/heru.gg-initial.conf` — HTTP-only initial config
- `ecosystem.config.cjs` — PM2 process config (frontend static + backend + bot)
- `.github/workflows/deploy.yml` — CI/CD pipeline
- `.env.example` — All environment variables documented

---

## ✅ Completed — Discord Bot (`/bot`)

- 11 slash commands: `/heru-link`, `/heru-profile`, `/heru-stats`, `/heru-tournaments`, `/heru-join`, `/heru-team`, `/heru-standings`, `/heru-build`, `/heru-setup`, `/heru-announce`, `/heru-ask`
- Natural language AI mode (@ mention → Claude AI)
- Confirmation flow for all actions
- Tournament announcement hooks

---

## ⚠️ Manual Steps Required Before Going Live

### 1. Apply Database Migrations (if not already done)
In Supabase SQL Editor, run each migration file in order (001 through 019).
Or use the convenience script: `bash scripts/setup-db.sh`

### 2. Create Demo Users in Supabase Auth
Go to Dashboard → Authentication → Users and create:
- `omarabdelgawad001@gmail.com` — role: admin
- `mr.3omar.a7mad@gmail.com` — role: organizer
- `habibaheikal27@gmail.com` — role: gamer
- `aloomeenm3aya@gmail.com` — role: gamer

Then run `supabase/seed/seed.sql` to populate demo data.

### 3. Configure External Services
| Service | Required env var | Where to get |
|---------|-----------------|--------------|
| Supabase | `SUPABASE_SERVICE_ROLE_KEY` | Dashboard → Settings → API |
| Discord OAuth | `DISCORD_CLIENT_SECRET` | Developer Portal → OAuth2 |
| Discord Bot | `DISCORD_BOT_TOKEN` | Developer Portal → Bot |
| Riot API | `RIOT_API_KEY` | developer.riotgames.com |
| Anthropic | `ANTHROPIC_API_KEY` | console.anthropic.com |
| Paymob | `PAYMOB_API_KEY` etc. | Paymob merchant dashboard |
| Resend | `RESEND_API_KEY` | resend.com |

### 4. Discord Bot Setup
1. Enable all Privileged Gateway Intents in Discord Developer Portal
2. Set Interactions Endpoint URL to `https://heru.gg/api/bot/webhook`
3. Add OAuth redirect: `https://heru.gg/api/connect/discord/callback`
4. Register slash commands: `node bot/register-commands.js`

### 5. VPS Deployment
```bash
# SSH into VPS
ssh root@72.60.214.57

# Clone repo
git clone https://github.com/omarahmedomarahmed/heru-mvp.git /var/www/heru.gg
cd /var/www/heru.gg

# Deploy everything
bash scripts/deploy-full.sh

# Apply SSL (after pointing domain)
certbot --nginx -d heru.gg -d www.heru.gg
```

### 6. Paymob Integration
Set `PAYMOB_ENABLED=true` in `backend/.env` after configuring Paymob credentials.

---

## Known Non-Blocking Issues

| Issue | Impact | Fix |
|-------|--------|-----|
| Vite build chunk > 500KB | Build warning only | Add code splitting later |
| Riot API dev key expires daily | Rank sync fails after 24h | Apply for Production Riot key |
| AI Agent: 20 messages/hour limit | Rate limited users | Change `AI_AGENT_HOURLY_LIMIT` in `.env` |
| Paymob disabled | Payment flow shows placeholder | Enable when Paymob account ready |
| Bot Interactions URL not set | Bot slash commands don't respond | Set after VPS is live |
