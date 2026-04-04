# HERU.gg — Claude Code Handover Document
# READ THIS ENTIRE FILE BEFORE TOUCHING ANY CODE
# This is the complete context transfer from a long Claude.ai chat session
# Everything Claude Code needs to know is in this file

---

## WHO YOU ARE AND WHAT YOU ARE DOING

You are acting as CTO, Lead Engineer, and DevOps for HERU.gg.
The frontend was built in Base44 (a low-code builder) and exported as a React/Vite app.
Your job is to:
1. Read the exported Base44 frontend in /src
2. Replace ALL Base44 backend calls with a custom Node.js/Express backend
3. Replace Base44 auth with Supabase Auth
4. Replace Base44 database with Supabase (PostgreSQL)
5. Clean up duplicate/broken pages in the frontend
6. Make it deployable to Hostinger VPS

DO NOT ask the user questions. Read this file, read the /src code, and execute.
When in doubt about a design decision, make the most sensible production-ready choice.

---

## WHAT HERU.GG IS — PRODUCT OVERVIEW

HERU.gg is an esports tournament platform for the MENA region (Egypt, Saudi Arabia, UAE).
It connects three user types:
- GAMERS: compete in tournaments, manage teams, offer talent services
- ORGANIZERS: create and manage tournaments, book talent, manage billing
- STAFF: platform administrators who manage everything

The CORE product loop that drives revenue:
1. Organizer builds a tournament using the Tournament Builder
2. Builder generates a full cost breakdown (items + prizepool = total)
3. Organizer commits minimum 33% of total cost
4. Tournament goes on Sponsorship Radar seeking co-organizers
5. Other brands commit 33% (co-organizer) or 66% (sponsor)
6. Max 3 parties total (1 main + 2 co-organizers OR 1 main + 1 sponsor)
7. Each party gets a separate invoice for their % of the total
8. HERU takes 15% platform fee added on top of total tournament cost
9. On payment: access granted, tournament goes live, all parties get chat access

REVENUE MODEL: 15% platform fee on every tournament order
This fee is added automatically to the tournament total cost before invoicing.
Staff billing page shows HERU's total revenue from fees.

---

## TARGET STACK

```
Frontend:    React 18 + Vite + TailwindCSS (already in /src, keep it)
Backend:     Node.js 20 + Express 4
Database:    Supabase (PostgreSQL 15)
Auth:        Supabase Auth (email/password + JWT)
Storage:     Supabase Storage (file uploads)
Realtime:    Supabase Realtime (chat updates)
Hosting:     Hostinger VPS (Ubuntu 22.04, Nginx, PM2)
Payments:    Paymob API (MENA gateway) — integration ready, toggle via env var
Email:       Resend API (transactional)
```

---

## BASE44 SDK — HOW TO REPLACE IT

Base44 generates code using their SDK. Every call needs replacing:

```javascript
// BASE44 PATTERN → REPLACEMENT PATTERN

// List all records
base44.entities.Tournament.list()
→ fetch('/api/tournaments')

// Filter records
base44.entities.Tournament.filter({ status: 'live' })
→ fetch('/api/tournaments?status=live')

// Get one record
base44.entities.Tournament.get(id)
→ fetch(`/api/tournaments/${id}`)

// Create record
base44.entities.Tournament.create(data)
→ fetch('/api/tournaments', { method: 'POST', body: JSON.stringify(data) })

// Update record
base44.entities.Tournament.update(id, data)
→ fetch(`/api/tournaments/${id}`, { method: 'PUT', body: JSON.stringify(data) })

// Delete record
base44.entities.Tournament.delete(id)
→ fetch(`/api/tournaments/${id}`, { method: 'DELETE' })

// Auth - login
base44.auth.login(email, password)
→ supabase.auth.signInWithPassword({ email, password })

// Auth - register
base44.auth.register(email, password, data)
→ supabase.auth.signUp({ email, password, options: { data } })

// Auth - current user
base44.auth.getCurrentUser()
→ supabase.auth.getUser()

// Auth - logout
base44.auth.logout()
→ supabase.auth.signOut()

// File upload
base44.storage.upload(file)
→ supabase.storage.from('uploads').upload(path, file)
```

Search /src for: `base44`, `createPageUrl`, `Base44`, `entities.` 
Replace every single occurrence.

---

## USER ROLES AND AUTH FLOWS

Three completely separate auth flows:

### GAMER AUTH
- Route: /auth/gamer/login and /auth/gamer/register  
- After login → redirect to /gamer/home
- Register creates: User (role='gamer') + GamerProfile record
- No special key required

### ORGANIZER AUTH  
- Route: /auth/organizer/login and /auth/organizer/register
- After login → redirect to /organizer/dashboard
- Register creates: User (role='organizer') + OrganizerProfile record
- No special key required

### STAFF AUTH (HIDDEN)
- Route: /admin (not linked anywhere in public nav)
- Requires: email + StaffAccessKey.access_key
- Validates: User.role='admin' AND matching active StaffAccessKey
- Creates StaffSession on success, stores token in localStorage
- After login → redirect to /staff/dashboard
- All /staff/* routes check StaffSession token on every load
- Staff access keys in DB: HERU-STAFF-OMAR-2026, HERU-STAFF-OPS-2026

### ROUTE PROTECTION
- /gamer/* → requires role='gamer', redirect to /auth/gamer/login
- /organizer/* → requires role='organizer', redirect to /auth/organizer/login  
- /staff/* → requires valid StaffSession token, redirect to /admin
- Public routes: /, /tournaments, /tournaments/:id, /teams/:id, /organizer/:id, /auth/*

---

## COMPLETE URL STRUCTURE

### PUBLIC (no auth)
```
/                           Landing page (marketing, shows live tournaments + teams)
/tournaments                Browse all published/live tournaments
/tournaments/:id            Public tournament detail
/teams/:id                  Public team profile
/organizer/:id              Public organizer profile
/talents                    Browse all talent profiles
/radar                      Public sponsorship radar listings
/auth                       Auth landing (choose gamer or organizer)
/auth/gamer/login           Gamer login
/auth/gamer/register        Gamer registration
/auth/organizer/login       Organizer login
/auth/organizer/register    Organizer registration
/admin                      Hidden staff login (not in any nav)
```

### GAMER ROUTES (/gamer/*)
```
/gamer/home                 Feed: active tournaments, notifications
/gamer/tournaments          Browse + search tournaments
/gamer/tournaments/:id      Tournament detail (with join team button if team leader)
/gamer/profile              My profile (edit username, avatar, games, bio)
/gamer/profile/talent       Talent settings (if is_talent=true: type, price, video)
/gamer/teams                My teams list
/gamer/teams/create         Create new team
/gamer/teams/:id            My team detail + management (leader: members, invites, requests)
/gamer/gigs                 My gig requests (talent only)
/gamer/gigs/:id             Gig detail (chat, file library, brackets view, group chat)
/gamer/orders               My marketplace orders
/gamer/orders/:id           Order detail
/gamer/notifications        All notifications
```

### ORGANIZER ROUTES (/organizer/*)
```
/organizer/dashboard        Main dashboard (radar overview, my tournaments summary)
/organizer/tournaments      My tournaments list
/organizer/tournaments/new  Tournament builder (multi-step)
/organizer/tournaments/:id/manage    Full management (main organizer only)
/organizer/tournaments/:id/manage/teams     Team management + seeding
/organizer/tournaments/:id/manage/brackets  Bracket editor + score entry
/organizer/tournaments/:id/manage/chat      Tournament organizer chat
/organizer/tournaments/:id/manage/settings  Edit tournament settings
/organizer/tournaments/:id/view    Read-only co-organizer view (after payment)
/organizer/radar            Sponsorship radar (browse open tournaments)
/organizer/radar/:id        Radar tournament detail + commit flow
/organizer/sponsored        My co-organized/sponsored tournaments
/organizer/sponsored/:id    Sponsored tournament detail
/organizer/billing          Billing overview (3 sections: solo, shared-main, co-org)
/organizer/billing/:bill_number     Individual bill detail + pay
/organizer/billing/payment-method  Add payment method (Paymob placeholder)
/organizer/profile          My organizer profile (edit brand details)
/organizer/marketplace      Browse marketplace items (for tournament builder)
```

### STAFF ROUTES (/staff/*)
```
/staff/dashboard            Overview stats (revenue, tournaments, users)
/staff/tournaments          All tournaments table + filters
/staff/tournaments/:id      Full tournament detail (all tabs)
/staff/users                All users table
/staff/users/:id            User detail + edit
/staff/marketplace          Marketplace items management
/staff/marketplace/new      Add new item
/staff/marketplace/:id      Edit item
/staff/approvals            All approval requests (3 tabs)
/staff/messages             All platform messages/chats
/staff/orders               All orders (gamer + tournament tabs)
/staff/orders/gamer/:id     Gamer order detail
/staff/orders/tournament/:id Tournament order detail
/staff/radar                All radar listings (staff oversight)
/staff/billing              Master billing (all parties, all tournaments)
/staff/organizers           All organizer profiles
/staff/revenue              HERU platform fee revenue dashboard
/staff/settings             App settings
```

### SHARED
```
/bill/:bill_number          Shared bill page (viewable by all parties on the bill)
```

---

## DATABASE — ALL 20 ENTITIES → SUPABASE TABLES

### users (Supabase Auth built-in + extension)
Supabase handles auth. Create extension table:
```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  role TEXT CHECK (role IN ('gamer','organizer','admin')) DEFAULT 'gamer',
  full_name TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  disabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### gamer_profiles
```sql
CREATE TABLE gamer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users UNIQUE NOT NULL,
  username TEXT,
  avatar TEXT,
  bio TEXT,
  is_talent BOOLEAN DEFAULT FALSE,
  talent_type TEXT,
  talent_price NUMERIC,
  talent_rating NUMERIC,
  talent_video_link TEXT,
  games JSONB DEFAULT '[]',
  team_ids TEXT[] DEFAULT '{}',
  purchased_items JSONB DEFAULT '[]',
  notifications JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### organizer_profiles
```sql
CREATE TABLE organizer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users UNIQUE NOT NULL,
  brand_name TEXT,
  brand_logo TEXT,
  primary_color TEXT DEFAULT '#ff1a1a',
  secondary_color TEXT DEFAULT '#0a0a0a',
  description TEXT,
  bio TEXT,
  location TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  rating NUMERIC,
  total_tournaments_organized INTEGER DEFAULT 0,
  co_organized_tournaments TEXT[] DEFAULT '{}',
  featured_games TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  tournaments TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### teams
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo TEXT,
  leader_id TEXT,
  members TEXT[] DEFAULT '{}',
  games TEXT[] DEFAULT '{}',
  description TEXT,
  story TEXT,
  contact_number TEXT,
  images TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  is_recruiting BOOLEAN DEFAULT TRUE,
  join_requests JSONB DEFAULT '[]',
  tournament_invites JSONB DEFAULT '[]',
  tournament_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### tournaments
```sql
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  game TEXT,
  tournament_image TEXT,
  organizer_id UUID REFERENCES auth.users,
  main_organizer_id UUID REFERENCES auth.users,
  organizer_brand JSONB,
  tournament_type TEXT CHECK (tournament_type IN ('solo','shared')) DEFAULT 'solo',
  status TEXT CHECK (status IN ('draft','published','live','completed')) DEFAULT 'draft',
  format TEXT,
  max_teams INTEGER,
  schedule TIMESTAMPTZ,
  description TEXT,
  is_offline BOOLEAN DEFAULT FALSE,
  venue TEXT,
  teams TEXT[] DEFAULT '{}',
  invited_teams TEXT[] DEFAULT '{}',
  join_requests JSONB DEFAULT '[]',
  talents JSONB DEFAULT '[]',
  branding_items TEXT[] DEFAULT '{}',
  production_items TEXT[] DEFAULT '{}',
  prizepool_items TEXT[] DEFAULT '{}',
  venue_items TEXT[] DEFAULT '{}',
  total_cost NUMERIC DEFAULT 0,
  prizepool_total NUMERIC DEFAULT 0,
  platform_fee NUMERIC DEFAULT 0,
  platform_fee_percent NUMERIC DEFAULT 15,
  prizepool_in_total_cost BOOLEAN DEFAULT TRUE,
  on_radar BOOLEAN DEFAULT FALSE,
  sponsorship_radar_id UUID,
  radar_funding_percent NUMERIC DEFAULT 0,
  required_branding_committed BOOLEAN DEFAULT FALSE,
  co_organizers JSONB DEFAULT '[]',
  organizer_chat JSONB DEFAULT '[]',
  brackets JSONB DEFAULT '[]',
  support_chat JSONB DEFAULT '[]',
  general_chat JSONB DEFAULT '[]',
  stream_link TEXT,
  tournament_log JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### marketplace_items
```sql
CREATE TABLE marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('game_setup','teams','live_talent','production','branding','venue','prizepool')),
  type TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  image TEXT,
  talent_user_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  stock INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### orders (gamer marketplace orders)
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gamer_id UUID REFERENCES auth.users,
  organizer_id UUID REFERENCES auth.users,
  order_type TEXT CHECK (order_type IN ('marketplace','tournament')) DEFAULT 'marketplace',
  tournament_id UUID REFERENCES tournaments,
  tournament_name TEXT,
  tournament_type TEXT,
  items JSONB DEFAULT '[]',
  total NUMERIC DEFAULT 0,
  status TEXT CHECK (status IN ('pending','processing','completed','cancelled')) DEFAULT 'pending',
  shipping_address JSONB,
  support_chat JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### tournament_orders
```sql
CREATE TABLE tournament_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments,
  tournament_name TEXT,
  tournament_type TEXT CHECK (tournament_type IN ('solo','shared')) DEFAULT 'solo',
  main_organizer_id UUID REFERENCES auth.users,
  main_organizer_brand TEXT,
  co_organizers JSONB DEFAULT '[]',
  items JSONB DEFAULT '[]',
  subtotal_items NUMERIC DEFAULT 0,
  prizepool_amount NUMERIC DEFAULT 0,
  platform_fee NUMERIC DEFAULT 0,
  grand_total NUMERIC DEFAULT 0,
  main_organizer_owes NUMERIC DEFAULT 0,
  fulfillment_status TEXT CHECK (fulfillment_status IN ('draft','pending_payment','in_fulfillment','fulfilled','cancelled')) DEFAULT 'draft',
  staff_notes TEXT,
  internal_chat JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### sponsorship_radar
```sql
CREATE TABLE sponsorship_radar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments,
  tournament_name TEXT,
  main_organizer_id UUID REFERENCES auth.users,
  main_organizer_brand JSONB,
  game TEXT,
  schedule TEXT,
  description TEXT,
  total_cost NUMERIC NOT NULL,
  prizepool_amount NUMERIC DEFAULT 0,
  main_organizer_contribution NUMERIC,
  main_organizer_percent NUMERIC DEFAULT 33,
  amount_still_needed NUMERIC DEFAULT 0,
  funding_percent NUMERIC DEFAULT 0,
  max_co_organizers INTEGER DEFAULT 2,
  status TEXT CHECK (status IN ('open','in_progress','fully_funded','closed')) DEFAULT 'open',
  co_organizers JSONB DEFAULT '[]',
  required_branding_items TEXT[] DEFAULT '{}',
  branding_committed BOOLEAN DEFAULT FALSE,
  order_breakdown JSONB DEFAULT '[]',
  minimum_commitment_warning TEXT DEFAULT 'Minimum commitment is 33% of total tournament cost',
  chat JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### gig_requests
```sql
CREATE TABLE gig_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_user_id TEXT NOT NULL,
  organizer_id UUID REFERENCES auth.users,
  organizer_brand TEXT,
  tournament_id UUID REFERENCES tournaments,
  tournament_name TEXT,
  talent_type TEXT,
  price NUMERIC,
  status TEXT CHECK (status IN ('pending','accepted','rejected','completed')) DEFAULT 'pending',
  chat JSONB DEFAULT '[]',
  file_library JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### bills
```sql
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_number TEXT UNIQUE NOT NULL,
  bill_type TEXT CHECK (bill_type IN ('gamer','organizer','co_organizer')) NOT NULL,
  tournament_id TEXT,
  tournament_name TEXT,
  tournament_order_id TEXT,
  payer_id TEXT NOT NULL,
  payer_type TEXT,
  payer_name TEXT,
  payer_email TEXT,
  items JSONB DEFAULT '[]',
  subtotal NUMERIC DEFAULT 0,
  platform_fee NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  grand_total NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  payment_status TEXT CHECK (payment_status IN ('unpaid','partial','paid','overdue')) DEFAULT 'unpaid',
  due_date DATE,
  paid_date DATE,
  payment_method TEXT,
  paymob_order_id TEXT,
  paymob_transaction_id TEXT,
  notes TEXT,
  shared_tournament BOOLEAN DEFAULT FALSE,
  shared_bill_ref TEXT,
  total_tournament_cost NUMERIC,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### billing_snapshots
```sql
CREATE TABLE billing_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments,
  tournament_name TEXT,
  tournament_type TEXT,
  organizer_id TEXT,
  organizer_brand_name TEXT,
  organizer_brand_logo TEXT,
  billing_type TEXT CHECK (billing_type IN ('main_organizer','shared_co')),
  commitment_percent NUMERIC,
  amount_due NUMERIC NOT NULL,
  amount_paid NUMERIC DEFAULT 0,
  payment_status TEXT CHECK (payment_status IN ('unpaid','paid','partial')) DEFAULT 'unpaid',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### approval_requests
```sql
CREATE TABLE approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_type TEXT CHECK (approval_type IN ('team_join','tournament_publish','talent_application')) NOT NULL,
  requester_id UUID REFERENCES auth.users NOT NULL,
  requester_name TEXT,
  requester_email TEXT,
  reference_id TEXT NOT NULL,
  reference_name TEXT,
  details JSONB DEFAULT '{}',
  status TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### staff_access_keys
```sql
CREATE TABLE staff_access_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_key TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  staff_email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### staff_sessions
```sql
CREATE TABLE staff_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  staff_email TEXT NOT NULL,
  staff_name TEXT,
  access_key_id UUID REFERENCES staff_access_keys,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### app_settings
```sql
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ALL API ROUTES TO BUILD

### Backend folder structure:
```
/backend
  /src
    /routes
      auth.js          - gamer/organizer register+login, staff login
      tournaments.js   - full CRUD + brackets + chat + publish
      teams.js         - full CRUD + join requests + invites
      gamers.js        - profile CRUD + talent application
      organizers.js    - profile CRUD
      marketplace.js   - items CRUD
      orders.js        - gamer marketplace orders
      tournament-orders.js - tournament fulfillment orders
      radar.js         - sponsorship radar + commit flow
      gigs.js          - gig requests + chat + files
      bills.js         - billing + invoicing
      approvals.js     - staff approval workflow
      staff.js         - staff-only routes
      settings.js      - app settings
    /middleware
      auth.js          - JWT verification from Supabase
      roleGuard.js     - check user role
      staffGuard.js    - check staff session token
    /lib
      supabase.js      - Supabase client (service role for backend)
      paymob.js        - Paymob payment gateway integration
      resend.js        - email notifications
    /logic
      tournament.js    - calculateCost, generateBrackets, setWinner
      billing.js       - createInvoice, markPaid, calculateFee
      radar.js         - commitCoOrg, calculateFunding
      notifications.js - send in-app and email notifications
  index.js             - Express app entry point
  package.json
```

### Key business logic:

**Tournament cost calculation (ALWAYS include 15% platform fee):**
```javascript
function calculateTournamentCost(tournament) {
  const itemsSubtotal = sumItemPrices(tournament);
  const prizepool = tournament.prizepool_total || 0;
  const subtotal = itemsSubtotal + prizepool;
  const platformFee = subtotal * 0.15; // 15% HERU fee
  const total = subtotal + platformFee;
  return { subtotal, platformFee, total };
}
```

**Sponsorship radar commit rules:**
- Main organizer: MINIMUM 33%, cannot go lower
- If 33%: 2 co-organizer slots open (each 33%)
- If 66%: 1 sponsor slot open (66%)  
- If 100%: solo tournament, no radar listing
- Label rules: 33% = "co-organizer", 66% = "sponsor"
- Maximum 3 parties total
- On commit: create Bill for committed amount, create BillingSnapshot
- On payment confirmed: access_granted = true, notify all parties

**Invoice generation:**
- Solo tournament: 1 invoice to main organizer for 100% + platform fee
- Shared tournament: separate invoice per party for their % + their share of platform fee
- Each invoice shows itemized breakdown
- Paymob integration: create payment intent, handle webhook callback

---

## DESIGN SYSTEM

### Colors:
```css
/* Brand */
--heru-red: #ff1a1a;
--heru-dark: #0a0a0a;

/* Organizer theme (neon purple + neon blue) */
--org-primary: #7c3aed;     /* neon purple */
--org-secondary: #2563eb;    /* neon blue */
--org-accent: #06b6d4;       /* cyan */
--org-bg: #0f0f1a;           /* very dark blue-black */
--org-surface: #1a1a2e;      /* dark surface */

/* Gamer theme (clean, modern gaming) */
--gamer-primary: #ff1a1a;    /* HERU red */
--gamer-bg: #0a0a0a;
--gamer-surface: #141414;

/* Staff theme (professional, minimal) */
--staff-primary: #334155;
--staff-accent: #3b82f6;
--staff-bg: #f8fafc;
```

### Typography:
- Headings: Inter or Rajdhani (gaming feel)
- Body: Inter
- Monospace: JetBrains Mono (for IDs, codes)

### Component style rules:
- Organizer dashboard: dark mode with neon purple/blue accents
- Gamer pages: dark gaming aesthetic, red accents
- Staff pages: light/professional, clean tables
- All currency: EGP format (e.g. "EGP 1,500") — NEVER $ or USD

---

## GAMER PAGES — DESIGN NOTES

Gamers do NOT have a "dashboard". They have normal web app pages like any gaming site.
- /gamer/home = a feed page, not a dashboard
- Profile page shows gig requests and orders as tabs
- Team management is part of /gamer/teams/:id (not a separate section)
- Marketplace looks like a gaming e-commerce site (cards, filters, cart)
- NO sidebar navigation — use top navbar instead

---

## ORGANIZER DASHBOARD — DESIGN NOTES

The organizer DOES have a proper dashboard with sidebar.
Main dashboard (/organizer/dashboard) focuses on:
- Radar feed: open tournaments seeking co-organizers (THIS IS THE MAIN FEATURE)
- Quick stats: my tournaments, active co-org roles, pending bills
- Recent activity feed

Sidebar navigation:
- Dashboard (radar feed home)
- My Tournaments
- Tournament Builder (prominent CTA)
- Sponsorship Radar
- My Co-Organized
- Billing
- Profile

Color scheme: dark bg (#0f0f1a), neon purple primary, neon blue secondary

---

## STAFF DASHBOARD — DESIGN NOTES

Professional light theme. Sidebar navigation.
Main dashboard shows platform revenue stats prominently.
Staff revenue page (/staff/revenue) shows:
- Total platform fees collected (15% of all tournament costs)
- Breakdown by tournament
- Monthly trend chart

---

## TOURNAMENT BUILDER — DESIGN NOTES

Multi-step form at /organizer/tournaments/new
Steps:
1. Basics (name, game, format, date, description, image)
2. Setup (teams max, online/offline, venue if offline)
3. Marketplace (select branding, production, talent, venue items from catalog)
4. Prizepool (cash amount + physical items)
5. Funding type (Solo vs Shared — if Shared: radar commitment slider min 33%)
6. Review (full cost breakdown including 15% platform fee, publish button)

AUTOSAVE: save draft every 30 seconds
First-time builder: show onboarding overlay explaining each step
Show progress bar through all steps
Show running cost total in a fixed sidebar panel as user adds items

---

## SHARED TOURNAMENT FLOW

When organizer selects "Shared" in builder:
1. Show commitment slider (min 33%)
2. Show explanation: "33% = 2 co-organizer slots | 66% = 1 sponsor slot"
3. On publish: tournament appears on Sponsorship Radar
4. Other organizers browse radar, see your tournament
5. They click "Join as Co-Organizer" (33%) or "Become Sponsor" (66%)
6. Modal shows: their commitment amount, what they get access to
7. On confirm: create Bill for them, create BillingSnapshot
8. They pay via Paymob (or test confirm button)
9. On payment: access_granted=true, they join organizer chat
10. Tournament shows all party logos equally on public page (no % shown)

---

## GIG REQUEST FLOW

When organizer books a talent through marketplace:
1. Create GigRequest record linking talent to tournament
2. Talent gets notification
3. Talent goes to /gamer/gigs/:id
4. Shows tournament details, fee (EGP), accept/reject
5. If accepted: talent joins the shared tournament group chat
6. Group chat includes: all organizers + co-organizers + all talents + staff
7. File library: 4 folders (Tournament Branding, Organizer Branding, Co-Org Branding, Social Media)
8. Talent can see live brackets updating in real time

---

## CHAT SYSTEM

All chats stored as JSONB arrays in their parent entity.
Supabase Realtime used for live updates.

Chat types:
- Tournament.organizer_chat: organizers + co-orgs (paid) + talents + staff
- Tournament.general_chat: public chat for gamers watching
- Tournament.support_chat: organizer ↔ staff support
- Order.support_chat: gamer ↔ staff order support
- GigRequest.chat: talent ↔ organizer (+ co-orgs + staff on shared tournaments)
- SponsorshipRadar.chat: potential co-orgs ↔ main organizer (pre-commitment)

---

## BILLING AND INVOICING

### Bill types:
1. **gamer**: marketplace order, 100% to gamer
2. **organizer** (solo): 100% of tournament cost + 15% fee
3. **organizer** (shared, main): their % of tournament cost + their % of 15% fee
4. **co_organizer**: their % of tournament cost + their % of 15% fee

### Invoice number format: HERU-YYYY-NNNN (e.g. HERU-2026-0001)

### Paymob integration:
```javascript
// Create payment intent
const intent = await paymob.createOrder({
  amount: bill.grand_total * 100, // Paymob uses piasters
  currency: 'EGP',
  merchant_order_id: bill.bill_number
});

// Redirect to Paymob payment page
window.location.href = intent.payment_url;

// Webhook: POST /api/payments/paymob/callback
// Verify HMAC, update bill.payment_status = 'paid'
```

---

## ENVIRONMENT VARIABLES NEEDED

Create .env.example in repo root:
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Backend
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Payments
PAYMOB_API_KEY=your-paymob-key
PAYMOB_INTEGRATION_ID=your-integration-id
PAYMOB_IFRAME_ID=your-iframe-id
PAYMOB_HMAC_SECRET=your-hmac-secret
PAYMOB_ENABLED=false

# Email
RESEND_API_KEY=your-resend-key
FROM_EMAIL=noreply@heru.gg

# Platform
PLATFORM_FEE_PERCENT=15
JWT_SECRET=your-jwt-secret
```

---

## DEMO SEED DATA (load into Supabase after migration)

### Users (create in Supabase Auth then insert user_profiles):
```
ADMIN:     omarabdelgawad001@gmail.com  role=admin
ORGANIZER: mr.3omar.a7mad@gmail.com     role=organizer (Nexus Esports)
GAMER:     habibaheikal27@gmail.com     role=gamer
GAMER:     aloomeenm3aya@gmail.com      role=gamer
```

### Staff access keys:
```
HERU-STAFF-OMAR-2026  → omarabdelgawad001@gmail.com (super admin)
HERU-STAFF-OPS-2026   → heru.gg.esports@gmail.com (ops)
```

### 8 demo teams (for Egypt Open S2):
Shadow Wolves, Neon Predators, Desert Storm, Pharaoh Kings,
Pyramid Clash, Mirage Strikers, Anubis Rising, Scarab Squad

### 1 live tournament: "HERU Egypt Open — Season 2"
- Valorant, 8 teams, Single Elimination
- Shared tournament, HERU Esports 65%, Nexus Esports 35%
- R1: Shadow Wolves 13-7 Scarab Squad (complete)
- R1: Neon Predators 13-9 Anubis Rising (complete)
- R1: Desert Storm 13-11 Mirage Strikers (complete)
- R1: Pharaoh Kings vs Pyramid Clash (in progress, 8-6)
- Total cost: EGP 80,000 + EGP 12,000 platform fee = EGP 92,000

### 2 OrganizerProfiles:
- HERU Esports (verified, Cairo)
- Nexus Esports (verified, Alexandria)

### Bills:
- BILL-SHARED-EGYPT-S2-MAIN: HERU Esports, EGP 59,800 (65% + fee share), unpaid
- BILL-SHARED-EGYPT-S2-NEXUS: Nexus Esports, EGP 32,200 (35% + fee share), paid

---

## WHAT TO DO FIRST (execution order)

1. Read all files in /src — understand the component structure
2. Create /backend folder with Express app
3. Create /supabase folder with migrations
4. Write all SQL migration files
5. Write all Express route files
6. Replace Base44 SDK calls in /src with fetch() calls to /api
7. Replace Base44 auth with Supabase auth hooks
8. Add React Router routes for all new URL paths
9. Clean up duplicate page components
10. Create .env.example
11. Write deployment docs in README.md
12. Test locally: `npx supabase start` + `npm run dev` (backend) + `npm run dev` (frontend)

---

## IMPORTANT CONSTRAINTS

- ALL currency displayed as EGP — never $ or USD
- Platform fee is ALWAYS 15% added on top, never negotiable
- Minimum organizer commitment on radar is ALWAYS 33%
- Max 3 parties per shared tournament (1 main + max 2 co-orgs)
- 33% commitment = "co-organizer" label, 66% commitment = "sponsor" label
- Staff pages ALWAYS require valid StaffSession token — no exceptions
- /admin page is NEVER linked from any public navigation
- Co-organizer access to tournament only after invoice is paid
- Tournament type (solo/shared) NEVER shown publicly to gamers/visitors
- Co-organizer contribution % NEVER shown publicly
- All organizers shown as equal partners on public tournament pages

---

## FILES TO CREATE

```
/CLAUDE.md              (this file — already exists)
/README.md              (setup and deployment instructions)
/.env.example           (all environment variables)
/.gitignore             (node_modules, dist, .env)
/backend/
  index.js
  package.json
  src/routes/           (one file per entity group)
  src/middleware/       (auth, roleGuard, staffGuard)
  src/lib/              (supabase, paymob, resend)
  src/logic/            (tournament, billing, radar, notifications)
/supabase/
  migrations/
    001_initial_schema.sql
    002_rls_policies.sql
    003_indexes.sql
  seed/
    seed.sql
/nginx/
  heru.gg.conf          (Nginx config for VPS)
/.github/
  workflows/
    deploy.yml          (CI/CD to Hostinger VPS)
```

---

## START COMMAND

When you read this file and are ready to begin, say:
"HERU.gg context loaded. Starting with [first task]."
Then begin immediately without asking questions.
