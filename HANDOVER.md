# HERU.gg — Complete Project Handover Document

**Last updated:** April 17, 2026  
**Branch:** `claude/add-oauth-discord-bot-cDDza`  
**Status:** All code complete and pushed. Manual setup steps required before going live.

---

## What Was Built — Plain English Summary

### The Core Platform (Built Previously)
HERU.gg started as a web app exported from Base44 (a no-code builder). All the Base44 backend was replaced with a real Node.js/Express server connected to a Supabase (PostgreSQL) database.

**What exists today:**
- A full website with three separate user experiences: Gamers, Organizers, and Staff
- Tournament Builder — a multi-step form that lets organizers create a tournament from scratch, add items, set a prizepool, and the system auto-calculates everything including HERU's 15% fee
- Sponsorship Radar — organizers who don't want to fund a tournament alone can list it; other brands commit 33% (co-organizer) or 66% (sponsor) of the cost
- Marketplace — physical/digital items; gamers can buy, organizers can hire talent
- Full billing and invoicing system in EGP
- Staff admin panel with full control over every part of the platform

### What Was Just Added (This Session)

#### 1. HERU CONNECT (`/gamer/connect`)
Gamers can now link two types of external accounts to their HERU profile:

**Discord** — Full OAuth2 login. Gamer clicks "Connect Discord", authorizes on Discord's website, and comes back with their Discord account linked. This is used to identify them in Discord servers.

**Riot Games** — Gamers type their Riot ID (e.g., `Faker#KR1`) and pick their region. The system looks up their account using Riot's API, stores their stats (rank, win rate, top champions for LoL; equivalent for Valorant), and displays them on their profile. Note: Full Valorant match history requires a Production Riot API key — the current dev key gives rank and basic stats.

#### 2. AI Agent (`/gamer/ai-agent`)
A chat interface powered by Claude (Anthropic's AI). Gamers can ask anything about HERU — tournaments, teams, their stats, how things work — and get intelligent answers. The AI can also take actions (like registering for a tournament) after asking for confirmation.

The same AI is available inside Discord via the bot (just @mention it or use `/heru-ask`).

#### 3. HERU Discord Bot
A Discord bot that lives in organizers' Discord servers. When an organizer adds it to their server:
- Gamers can use slash commands like `/heru-tournaments` to browse tournaments
- Gamers can link their HERU account with `/heru-link`
- Organizers can build a tournament by talking to the AI naturally ("I want to run a Valorant tournament for 16 teams with a 50,000 EGP prizepool")
- The bot announces new tournaments and bracket updates automatically

---

## Current Code State

### ✅ Everything That Is Fully Written and Pushed

**Frontend (React)**
- 61 page files covering every route
- `/gamer/connect` — Full Discord + Riot connect page
- `/gamer/ai-agent` — Full AI chat interface
- Organizer Dashboard — "Add HERU Bot to Discord" card
- GamerLayout mobile menu — links to Connected Accounts and AI Assistant

**Backend (Express API)**
- 27 route modules covering every feature
- `/api/connect` — Discord OAuth flow + Riot account linking
- `/api/ai-agent` — Claude AI chat with session memory (20 messages/hour limit)
- `/api/bot` — Discord webhook endpoint + Ed25519 signature verification
- Claude AI agent with 12 tools (search tournaments, get profiles, join tournaments, etc.)

**Discord Bot**
- 11 slash commands fully implemented
- Natural language mode (mentions → AI agent)
- Confirmation flow for actions (shows ✅/❌ buttons before doing anything)

**Database**
- Migration `014_heru_connect.sql` — 4 new tables:
  - `connected_accounts` — one Discord link per user
  - `riot_accounts` — multiple Riot accounts per user (LoL + Valorant)
  - `bot_servers` — links Discord guilds to HERU organizers
  - `ai_agent_sessions` — stores conversation history per user

**Documentation**
- `README.md` — full developer guide (updated)
- `HANDOVER.md` — this file (created)
- `CLAUDE.md` — technical context for future AI coding sessions (updated)
- `.env.example` — all required environment variables

---

## ⚠️ What You Still Need To Do (Manual Steps)

**None of these require coding.** They are configuration steps in external services.

---

### Step 1 — Supabase: Apply the New Migration

This adds the 4 new database tables (Discord connections, Riot accounts, bot servers, AI sessions).

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Open the file `supabase/migrations/014_heru_connect.sql` from the repo
5. Copy all the text and paste it into the SQL Editor
6. Click **Run**
7. You should see "Success. No rows returned."

---

### Step 2 — Discord Developer Portal: Set Up OAuth & Bot

Go to **discord.com/developers/applications** → click your app "HERU BOT" (App ID: `1494378715709313064`)

**A) Get your Bot Token:**
1. Click **Bot** in the left menu
2. Click **Reset Token** → copy the token
3. This is your `DISCORD_BOT_TOKEN` — paste it in `backend/.env` and `bot/.env`

**B) Enable required permissions:**
1. Still on the **Bot** tab
2. Scroll to "Privileged Gateway Intents"
3. Turn ON: **Message Content Intent**, **Server Members Intent**, **Presence Intent**
4. Click **Save Changes**

**C) Get your Client Secret (for the "Connect Discord" button):**
1. Click **OAuth2** in the left menu
2. Copy the **Client Secret** (click Reset if needed)
3. This is your `DISCORD_CLIENT_SECRET`

**D) Add the callback URL:**
1. Still on **OAuth2**
2. Under "Redirects", click **Add Redirect**
3. Add: `https://heru.gg/api/connect/discord/callback`
4. Also add: `http://localhost:3001/api/connect/discord/callback` (for local testing)
5. Click **Save Changes**

**E) Set the bot's webhook URL (after going live on VPS):**
1. Click **General Information**
2. Set **Interactions Endpoint URL** to: `https://heru.gg/api/bot/webhook`
3. Click **Save Changes**

---

### Step 3 — Get Your Anthropic API Key (for AI Agent)

1. Go to **console.anthropic.com**
2. Sign in or create an account
3. Go to **API Keys** → **Create Key**
4. Copy the key → paste it as `ANTHROPIC_API_KEY` in `backend/.env`

---

### Step 4 — Get Your Riot API Key

1. Go to **developer.riotgames.com**
2. Sign in with your Riot account
3. On the Dashboard, copy the **Development API Key**
4. Paste it as `RIOT_API_KEY` in `backend/.env`
5. ⚠️ This key expires every 24 hours. For production, apply for a **Production Key** on the same page.

---

### Step 5 — Generate the Bot Secret

This is a random password shared between the backend and the bot so they can communicate securely.

On any computer with a terminal:
```bash
openssl rand -hex 32
```
Copy the output. Paste it as `HERU_BOT_SECRET` in **both** `backend/.env` **and** `bot/.env`.

---

### Step 6 — Update All .env Files on the VPS

SSH into your VPS and update `backend/.env` with all the new values:
```
DISCORD_CLIENT_SECRET=    (from Step 2C)
DISCORD_BOT_TOKEN=        (from Step 2A)
ANTHROPIC_API_KEY=        (from Step 3)
RIOT_API_KEY=             (from Step 4)
HERU_BOT_SECRET=          (from Step 5)
DISCORD_REDIRECT_URI=https://heru.gg/api/connect/discord/callback
```

Also create/update `bot/.env`:
```
DISCORD_BOT_TOKEN=        (same as above)
DISCORD_APPLICATION_ID=1494378715709313064
HERU_API_URL=https://heru.gg
HERU_FRONTEND_URL=https://heru.gg
HERU_BOT_SECRET=          (same as above)
```

---

### Step 7 — Register Discord Slash Commands

This teaches Discord about the 11 `/heru-*` commands. You only need to do this once (or when commands change).

On the VPS:
```bash
cd /var/www/heru/bot
node register-commands.js
```
You should see "Registered 11 commands."

---

### Step 8 — Pull Latest Code and Redeploy

On the VPS:
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

If the bot isn't running yet as a PM2 process:
```bash
cd /var/www/heru/bot
pm2 start ecosystem.config.cjs --env production --name heru-bot
pm2 save
```

---

### Step 9 — Add the Bot to Your Discord Server

1. Go to Discord Developer Portal → your app → **OAuth2 → URL Generator**
2. Select scopes: `bot`, `applications.commands`
3. Select permissions: Send Messages, Embed Links, Read Message History, Use Application Commands, Manage Channels
4. Copy the generated URL and open it in your browser
5. Select your Discord server → Authorize

Or click **"Add to Discord"** from the Organizer Dashboard on HERU.gg (once deployed).

---

## How Each Feature Works

### HERU CONNECT — Discord
1. Gamer clicks "Connect Discord" on `/gamer/connect`
2. Frontend redirects to Discord OAuth
3. Gamer authorizes → Discord sends them back with a code
4. Backend exchanges code for tokens, stores in `connected_accounts` table
5. Discord username now shows on gamer's HERU profile

### HERU CONNECT — Riot
1. Gamer types `Faker#KR1` and selects region
2. Backend calls Riot ACCOUNT-V1 → gets PUUID
3. Calls LEAGUE-V4 → gets rank (Iron/Gold/Diamond etc.), LP, wins/losses
4. Stores in `riot_accounts` table
5. Stats shown on profile with rank badge

### AI Agent
1. Gamer types a message → backend calls Claude API
2. Claude can look up tournaments, profiles, teams using built-in tools
3. For actions (join tournament, update profile) → asks for confirmation first
4. Conversation history saved in Supabase
5. Limited to 20 messages/hour per user

### Discord Bot Natural Language
1. Someone @mentions the bot
2. Bot looks up if that Discord user has linked their HERU account
3. Forwards message to AI agent with their user context
4. AI responds → bot posts formatted embed card in Discord

---

## Business Rules (Never Change These)

- Platform fee is **always 15%** added on top of tournament cost
- Minimum organizer commitment on Sponsorship Radar is **always 33%**
- Maximum 3 parties per shared tournament
- 33% = "co-organizer", 66% = "sponsor"
- Co-organizer access only after paying their invoice
- Tournament type (solo/shared) never shown publicly
- All currency is **EGP** — never USD
- `/admin` login page never linked from any public navigation

---

## Credentials Needed

| Service | What you need | Where to get it |
|---------|--------------|----------------|
| Supabase | URL + anon key + service role key | Supabase Dashboard → Settings → API |
| Discord OAuth | Client Secret | Discord Developer Portal → OAuth2 |
| Discord Bot | Bot Token | Discord Developer Portal → Bot → Reset Token |
| Riot API | API Key (renew daily) | developer.riotgames.com |
| Anthropic | API Key | console.anthropic.com |
| Paymob | API Key + Integration ID | Paymob merchant dashboard |
| Resend | API Key | resend.com dashboard |

---

## Known Limitations

| Limitation | Why | Fix |
|-----------|-----|-----|
| Valorant rank only, no match history | Dev Riot key limitation | Apply for Production key |
| Riot API key expires daily | Dev key limitation | Get Production key |
| AI Agent: 20 messages/hour | Cost control | Change `AI_AGENT_HOURLY_LIMIT` in `.env` |
| Paymob disabled by default | Not yet configured | Set `PAYMOB_ENABLED=true` when ready |
| Bot Interactions URL needs setting | Requires live domain | Do Step 2E after VPS deploy |

---

*Built April 17, 2026. Branch: `claude/add-oauth-discord-bot-cDDza`*
