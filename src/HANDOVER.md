# HERU.gg — Complete Technical Handover Document
# For GitHub upload and Claude-assisted backend migration to Supabase + Node.js

---

## PART 1 — DATA CLEANUP PLAN

### KEEP (clean demo data — all linked to real users)

**Users — KEEP ALL 7:**
- 698295a0...1d6a → omarabdelgawad001@gmail.com (admin, main organizer)
- 69866bd8...e715 → mr.3omar.a7mad@gmail.com (co-organizer, Nexus Esports)
- 6984164d...01b  → firstlastnames1111@gmail.com (test gamer)
- 6982b6d4...753  → aloomeenm3aya@gmail.com (test gamer)
- 6989490d...e58  → habibaheikal27@gmail.com (test gamer)
- 6987e24c...2f   → heru.gg.esports@gmail.com (test gamer)
- 69920875...71   → beedohashish@gmail.com (test gamer)

**OrganizerProfiles — KEEP 2:**
- 69cf63d8...6e5 → HERU Esports (user 698295a0)
- 69cf63d8...6e6 → Nexus Esports (user 69866bd8)

**Tournaments — KEEP 2:**
- 69cf6375...421 → HERU Egypt Open — Season 2 (live, shared, 8 teams, brackets)
- 69cf5955...67  → Test Shared Tournament (draft, for testing radar flow)

**Teams — KEEP 9:**
- 69cf634f...2e → Shadow Wolves
- 69cf634f...2f → Neon Predators
- 69cf634f...30 → Desert Storm
- 69cf634f...31 → Pharaoh Kings
- 69cf634f...32 → Pyramid Clash
- 69cf634f...33 → Mirage Strikers
- 69cf634f...34 → Anubis Rising
- 69cf634f...35 → Scarab Squad
- 69c98fd1...e7 → Team Meen Da (TMD) — real team created by co-org user

**GamerProfiles — KEEP 8:**
- 69cfba55...0a → habiba heikal (real user)
- 69cf63a8...74 → ShadowBlade (seed, linked to Shadow Wolves)
- 69cf63a8...75 → NeonStrike
- 69cf63a8...76 → DesertForce
- 69cf63a8...77 → PharaohAim
- 69cf63a8...78 → CastKing (talent)
- 69c9a022...0e → Omar Abdelgawad (real admin user, talent)
- 69c98c8c...70 → Omar Abdelgawad (co-org user)

**SponsorshipRadar — KEEP 2:**
- 69cf6387...643 → HERU Egypt Open S2 (fully_funded)
- 69cf85c9...675 → Test Shared Tournament (in_progress, open for demo)

**TournamentOrder — KEEP 2 (already in DB, not re-queried but keep both)**

**Bills — KEEP 5:**
- BILL-SHARED-EGYPT-S2-MAIN
- BILL-SHARED-EGYPT-S2-NEXUS
- BILL-SOLO-TOUR-001
- BILL-GAMER-002
- BILL-GAMER-003

**BillingSnapshot — KEEP ALL 4**

**GigRequests — KEEP BOTH 2**

**ApprovalRequests — KEEP ALL 5**

**MarketplaceItems — KEEP ALL 30+ (all legitimate catalog items)**

**Orders — KEEP BOTH 2 (real gamer orders)**

---

### DELETE (legacy / orphaned / junk data)

**Tournaments — DELETE 12:**
- 69cf9d4d...6a  → "z xz x " (junk test)
- 69ca1447...2a  → HERU Championship Season 1 (old seed, no organizer)
- 69ca1447...2b  → CS2 Pro League Spring (old seed, fake org_001)
- 69ca1447...2c  → DOTA 2 Invitational (old seed, fake org)
- 69c9a4fc...b2  → Championship (Online LOL Tournament) (old draft)
- 69c99f86...f8  → Tour Heru (old draft)
- 69c98ef7...d1  → Tour (old test)
- 69c577d7...46  → Nexus Open Spring 2026 (fake org_001)
- 69c577d7...47  → Apex Predator Invitational (fake org_002)
- 69c577d7...48  → Thunder League Season 3 (fake org_003)
- 69c577d7...49  → CyberForge CS2 Pro Series (fake org_004)
- 69c577d7...4a  → IronCrown Multisport Open (fake org_005)

**Teams — DELETE 10:**
- 69cf6f0b...e6  → "asdasd" (junk)
- 69ca1431...1f  → Shadow Wolves (duplicate, no leader)
- 69ca1431...20  → Neon Rift (old seed, no leader)
- 69ca1431...21  → Phantom Strike (old seed)
- 69ca1431...22  → Vortex X (old seed)
- 69ca1431...23  → Crypto Knights (old seed)
- 69ca1431...24  → Iron Ghosts (old seed)
- 69ca1431...25  → Blaze Unit (old seed)
- 69ca1431...26  → Dark Matter (old seed)
- 69c577ba...39  → Team Phoenix (fake leader gamer_001)

**GamerProfiles — DELETE 6:**
- 69c57794...22 → ShadowStrike (fake user gamer_001)
- 69c57794...23 → NeonFury (fake user gamer_002)
- 69c57794...24 → Vortex (fake user gamer_003)
- 69c57794...25 → IronSight (fake user gamer_004)
- 69c57794...26 → BlazePulse (fake user gamer_005)
- 69c57b40...d9 → Firstname Lastname (keep or delete — real user but username is junk)

**OrganizerProfiles — DELETE 7:**
- 69c999...943  → "ORGANIZER" (junk, fake user_id)
- 69c96fe1...c7 → Omar Abdelgawad's Brand (duplicate of Nexus Esports for same user)
- 69c57794...1d → Heru Esports (fake org_001)
- 69c57794...1e → Apex Arena (fake org_002)
- 69c57794...1f → Thunder League (fake org_003)
- 69c57794...20 → CyberForge Events (fake org_004)
- 69c57794...21 → IronCrown eSports (fake org_005)

**SponsorshipRadar — DELETE 7:**
- 69cf5955...fa → Test Shared Tournament (duplicate)
- 69ca1465...2d → CS2 Pro League Spring (old seed)
- 69ca1465...2e → DOTA 2 Invitational (old seed)
- 69ca1465...2f → LoL Clash Weekend (old seed)
- 69c9a4fd...54 → Championship LOL (old seed)
- 69c9a1df...d7 → Tour Heru (old seed)
- 69c99f86...5d → Tour Heru duplicate (old seed)

**ALL Space records — DELETE ALL 7** (feature removed)
**ALL HeruCoin records — DELETE ALL 5** (feature removed)
**ALL DirectMessage records — DELETE ALL 6** (feature removed)
**ALL PromoCode records — DELETE ALL 8** (feature removed)
**ALL OrganizerLoginKey records — DELETE ALL 6** (replaced by standard auth)
**BILL-GAMER-001 — DELETE** (test record with null payer_name)

---

## PART 2 — BASE44 CLEANUP PROMPT

Paste this into Base44 AI builder:

```
Go to the Data panel and delete the following records by ID.
Do NOT delete any schemas. Only delete the specific records listed.
Do NOT create any new records. This is a data cleanup only.

DELETE these Tournament records:
69cf9d4d2a61cdf443eb446a, 69ca14475116afd12f2c312a, 69ca14475116afd12f2c312b,
69ca14475116afd12f2c312c, 69c9a4fcf810f69ddc80bbb2, 69c99f861d9d3c00e35e10f8,
69c98ef7cbdcaea98b8e52d1, 69c577d7cd3acd71ae482e46, 69c577d7cd3acd71ae482e47,
69c577d7cd3acd71ae482e48, 69c577d7cd3acd71ae482e49, 69c577d7cd3acd71ae482e4a

DELETE these Team records:
69cf6f0bb6649fb2c78f39e6, 69ca14315116afd12f2c311f, 69ca14315116afd12f2c3120,
69ca14315116afd12f2c3121, 69ca14315116afd12f2c3122, 69ca14315116afd12f2c3123,
69ca14315116afd12f2c3124, 69ca14315116afd12f2c3125, 69ca14315116afd12f2c3126,
69c577bacd3acd71ae482e39

DELETE these GamerProfile records:
69c57794cd3acd71ae482e22, 69c57794cd3acd71ae482e23, 69c57794cd3acd71ae482e24,
69c57794cd3acd71ae482e25, 69c57794cd3acd71ae482e26

DELETE these OrganizerProfile records:
69c999589bf983f5916a0943, 69c96fe1d92e5d51dc2f9dc7, 69c57794cd3acd71ae482e1d,
69c57794cd3acd71ae482e1e, 69c57794cd3acd71ae482e1f, 69c57794cd3acd71ae482e20,
69c57794cd3acd71ae482e21

DELETE these SponsorshipRadar records:
69cf5955cc6bd8430e5b86fa, 69ca14655116afd12f2c312d, 69ca14655116afd12f2c312e,
69ca14655116afd12f2c312f, 69c9a4fdc0b98fc5485cdc54, 69c9a1df4585c0561c025bd7,
69c99f860d321ecfeef14b5d

DELETE ALL Space records:
69ca147a5116afd12f2c3132, 69ca147a5116afd12f2c3133, 69ca147a5116afd12f2c3134,
69c9a010c0dc216f48a19bae, 69c577bacd3acd71ae482e3a, 69c577bacd3acd71ae482e3b,
69c577bacd3acd71ae482e3c

DELETE ALL HeruCoin records:
69c57794cd3acd71ae482e27, 69c57794cd3acd71ae482e28, 69c57794cd3acd71ae482e29,
69c57794cd3acd71ae482e2a, 69c57794cd3acd71ae482e2b

DELETE ALL DirectMessage records:
69ca1621afbf89e9d5e2eff6, 69c9a36c3a9016e1c9ce6569, 69c991911a0ec580e2eb0ae2,
69c99150ff779ff3e6e4e088, 69c577d7cd3acd71ae482e44, 69c577d7cd3acd71ae482e45

DELETE ALL PromoCode records:
69c98cc867c5a7498a1469a8, 6983f94767b903288a69d3c9, 6983f23aaab9883cb3276157,
6983f23aaab9883cb3276155, 6983f23aaab9883cb3276156, 698299c364b856681500c1e4,
698299c364b856681500c1e2, 698299c364b856681500c1e3

DELETE ALL OrganizerLoginKey records:
69c9995815718856bb350626, 69c57794cd3acd71ae482e2c, 69c57794cd3acd71ae482e2d,
69c57794cd3acd71ae482e2e, 69c57794cd3acd71ae482e2f, 69c57794cd3acd71ae482e30

DELETE this Bill record:
69cfa68cf5e83bf06de74305
```

---

## PART 3 — COMPLETE BACKEND HANDOVER

This section documents every entity, every field, every API operation, and every
business logic function. This is the complete specification for Claude to replace
all Base44 backend calls with custom Node.js + Supabase code.

---

### 3.1 TECHNOLOGY STACK (target after migration)

```
Frontend:     React + Vite (exported from Base44, unchanged)
Backend:      Node.js 20 LTS + Express 4
Database:     Supabase (PostgreSQL 15)
Auth:         Supabase Auth (email/password, JWT)
File Storage: Supabase Storage
Realtime:     Supabase Realtime (for chat and bracket updates)
Hosting:      Hostinger VPS (Ubuntu 22.04, Nginx, PM2)
CI/CD:        GitHub Actions → VPS deploy on push to main
Email:        Resend (transactional)
Payments:     Paymob (MENA) — placeholder, not yet live
Error tracking: Sentry
```

---

### 3.2 DATABASE SCHEMA — ALL 18 ENTITIES → SUPABASE TABLES

Every Base44 entity maps to a Supabase PostgreSQL table.
Nested arrays in Base44 become either JSONB columns or separate tables as noted.

---

#### TABLE: users (Supabase Auth built-in + extension)
Supabase Auth handles: id (uuid), email, created_at, encrypted_password
Custom extension table `user_profiles`:
```sql
id          uuid references auth.users primary key
role        text check (role in ('gamer','organizer','admin')) default 'gamer'
full_name   text
is_verified boolean default false
disabled    boolean default false
```

---

#### TABLE: gamer_profiles
```sql
id              uuid primary key default gen_random_uuid()
user_id         uuid references auth.users unique
username        text
avatar          text
bio             text
is_talent       boolean default false
talent_type     text
talent_price    numeric
talent_rating   numeric
talent_video_link text
games           jsonb default '[]'   -- [{game_name, game_id, rank}]
team_ids        text[] default '{}'
purchased_items jsonb default '[]'   -- [{item_id, purchased_at, order_id}]
notifications   jsonb default '[]'   -- [{id, type, message, read, created_at, link}]
created_at      timestamptz default now()
updated_at      timestamptz default now()
```

---

#### TABLE: organizer_profiles
```sql
id                        uuid primary key default gen_random_uuid()
user_id                   uuid references auth.users unique
brand_name                text
brand_logo                text
primary_color             text default '#ff1a1a'
secondary_color           text default '#0a0a0a'
description               text
bio                       text
location                  text
is_verified               boolean default false
rating                    numeric
total_tournaments_organized integer default 0
co_organized_tournaments  text[] default '{}'
featured_games            text[] default '{}'
social_links              jsonb default '{}'  -- {twitter, instagram, website}
tournaments               text[] default '{}'
created_at                timestamptz default now()
updated_at                timestamptz default now()
```

---

#### TABLE: teams
```sql
id                 uuid primary key default gen_random_uuid()
name               text not null
logo               text
leader_id          text  -- references gamer user_id
members            text[] default '{}'
games              text[] default '{}'
description        text
story              text
contact_number     text
images             text[] default '{}'
social_links       jsonb default '{}'  -- {twitter, instagram, discord}
is_recruiting      boolean default true
join_requests      jsonb default '[]'  -- [{user_id, game, rank, status}]
tournament_invites jsonb default '[]'  -- [{tournament_id, tournament_name, game, status, invited_by}]
tournament_history jsonb default '[]'  -- [{tournament_id, tournament_name, placement, completed_at}]
created_at         timestamptz default now()
updated_at         timestamptz default now()
```

---

#### TABLE: tournaments
```sql
id                       uuid primary key default gen_random_uuid()
name                     text not null
game                     text
tournament_image         text
organizer_id             uuid references auth.users
main_organizer_id        uuid references auth.users
organizer_brand          jsonb  -- {name, logo, primary_color, secondary_color}
tournament_type          text check (tournament_type in ('solo','shared')) default 'solo'
status                   text check (status in ('draft','published','live','completed')) default 'draft'
format                   text
max_teams                integer
schedule                 timestamptz
description              text
is_offline               boolean default false
venue                    text
teams                    text[] default '{}'
invited_teams            text[] default '{}'
join_requests            jsonb default '[]'
talents                  jsonb default '[]'  -- [{user_id, talent_type, price}]
branding_items           text[] default '{}'
production_items         text[] default '{}'
prizepool_items          text[] default '{}'
venue_items              text[] default '{}'
total_cost               numeric default 0
prizepool_total          numeric default 0
prizepool_in_total_cost  boolean default true
on_radar                 boolean default false
sponsorship_radar_id     uuid references sponsorship_radar
radar_funding_percent    numeric default 0
required_branding_committed boolean default false
co_organizers            jsonb default '[]'
organizer_chat           jsonb default '[]'
brackets                 jsonb default '[]'
support_chat             jsonb default '[]'
general_chat             jsonb default '[]'
stream_link              text
tournament_log           jsonb default '[]'
created_at               timestamptz default now()
updated_at               timestamptz default now()
```

---

#### TABLE: marketplace_items
```sql
id             uuid primary key default gen_random_uuid()
title          text not null
description    text
category       text check (category in ('game_setup','teams','live_talent','production','branding','venue','prizepool'))
type           text
price          numeric not null
image          text
talent_user_id text
is_active      boolean default true
stock          integer
created_at     timestamptz default now()
updated_at     timestamptz default now()
```

---

#### TABLE: orders
```sql
id              uuid primary key default gen_random_uuid()
gamer_id        uuid references auth.users
organizer_id    uuid references auth.users
co_organizer_ids text[] default '{}'
order_type      text check (order_type in ('marketplace','tournament')) default 'marketplace'
tournament_id   uuid references tournaments
tournament_name text
tournament_type text
items           jsonb default '[]'
total           numeric default 0
status          text check (status in ('pending','processing','completed','cancelled')) default 'pending'
shipping_address jsonb
support_chat    jsonb default '[]'
created_at      timestamptz default now()
updated_at      timestamptz default now()
```

---

#### TABLE: tournament_orders
```sql
id                    uuid primary key default gen_random_uuid()
tournament_id         uuid references tournaments
tournament_name       text
tournament_type       text check (tournament_type in ('solo','shared')) default 'solo'
main_organizer_id     uuid references auth.users
main_organizer_brand  text
co_organizers         jsonb default '[]'
items                 jsonb default '[]'
subtotal_items        numeric default 0
prizepool_amount      numeric default 0
grand_total           numeric default 0
main_organizer_owes   numeric default 0
fulfillment_status    text check (fulfillment_status in ('draft','pending_payment','in_fulfillment','fulfilled','cancelled')) default 'draft'
staff_notes           text
internal_chat         jsonb default '[]'
created_at            timestamptz default now()
updated_at            timestamptz default now()
```

---

#### TABLE: sponsorship_radar
```sql
id                           uuid primary key default gen_random_uuid()
tournament_id                uuid references tournaments
tournament_name              text
main_organizer_id            uuid references auth.users
main_organizer_brand         jsonb
game                         text
schedule                     text
description                  text
total_cost                   numeric not null
prizepool_amount             numeric default 0
main_organizer_contribution  numeric
main_organizer_percent       numeric default 33
amount_still_needed          numeric default 0
funding_percent              numeric default 0
max_co_organizers            integer default 2
status                       text check (status in ('open','in_progress','fully_funded','closed')) default 'open'
co_organizers                jsonb default '[]'
required_branding_items      text[] default '{}'
branding_committed           boolean default false
order_breakdown              jsonb default '[]'
minimum_commitment_warning   text
chat                         jsonb default '[]'
created_at                   timestamptz default now()
updated_at                   timestamptz default now()
```

---

#### TABLE: gig_requests
```sql
id               uuid primary key default gen_random_uuid()
talent_user_id   text
organizer_id     uuid references auth.users
organizer_brand  text
tournament_id    uuid references tournaments
tournament_name  text
talent_type      text
price            numeric
status           text check (status in ('pending','accepted','rejected','completed')) default 'pending'
chat             jsonb default '[]'
file_library     jsonb default '[]'
notes            text
created_at       timestamptz default now()
updated_at       timestamptz default now()
```

---

#### TABLE: bills
```sql
id               uuid primary key default gen_random_uuid()
bill_number      text unique not null
bill_type        text check (bill_type in ('gamer','organizer','co_organizer')) not null
tournament_id    text
tournament_name  text
tournament_order_id text
payer_id         text not null
payer_type       text
payer_name       text
payer_email      text
items            jsonb default '[]'
subtotal         numeric default 0
tax              numeric default 0
grand_total      numeric not null
paid_amount      numeric default 0
payment_status   text check (payment_status in ('unpaid','partial','paid','overdue')) default 'unpaid'
due_date         date
paid_date        date
payment_method   text
notes            text
shared_tournament boolean default false
shared_bill_ref  text
total_tournament_cost numeric
issued_at        timestamptz default now()
created_at       timestamptz default now()
updated_at       timestamptz default now()
```

---

#### TABLE: billing_snapshots
```sql
id                    uuid primary key default gen_random_uuid()
tournament_id         uuid references tournaments
tournament_name       text
tournament_type       text
organizer_id          text
organizer_brand_name  text
organizer_brand_logo  text
billing_type          text check (billing_type in ('main_organizer','shared_co'))
commitment_percent    numeric
amount_due            numeric not null
amount_paid           numeric default 0
payment_status        text check (payment_status in ('unpaid','paid','partial')) default 'unpaid'
created_at            timestamptz default now()
updated_at            timestamptz default now()
```

---

#### TABLE: approval_requests
```sql
id               uuid primary key default gen_random_uuid()
approval_type    text check (approval_type in ('team_join','tournament_publish','talent_application')) not null
requester_id     uuid references auth.users not null
requester_name   text
requester_email  text
reference_id     text not null
reference_name   text
details          jsonb default '{}'
status           text check (status in ('pending','approved','rejected')) default 'pending'
reviewed_by      uuid references auth.users
reviewed_at      timestamptz
rejection_reason text
created_at       timestamptz default now()
updated_at       timestamptz default now()
```

---

#### TABLE: app_settings
```sql
id            uuid primary key default gen_random_uuid()
setting_key   text unique not null
setting_value text not null
description   text
created_at    timestamptz default now()
updated_at    timestamptz default now()
```

---

### 3.3 ALL API ROUTES (Express endpoints to replace Base44 calls)

#### AUTH
```
POST   /api/auth/gamer/register       Create user + GamerProfile
POST   /api/auth/organizer/register   Create user + OrganizerProfile
POST   /api/auth/login                Supabase signInWithPassword
POST   /api/auth/logout               Supabase signOut
GET    /api/auth/me                   Get current user + profile
POST   /api/auth/forgot-password      Supabase resetPasswordForEmail
POST   /api/auth/reset-password       Supabase updateUser with new password
```

#### TOURNAMENTS
```
GET    /api/tournaments                List all (filters: status, game, type)
GET    /api/tournaments/:id            Get one with full detail
POST   /api/tournaments                Create (auth: organizer)
PUT    /api/tournaments/:id            Update (auth: main_organizer_id only)
DELETE /api/tournaments/:id            Delete (auth: main_organizer_id only)
POST   /api/tournaments/:id/publish    Set status=published + create ApprovalRequest
POST   /api/tournaments/:id/go-live    Set status=live (auth: staff)
POST   /api/tournaments/:id/complete   Set status=completed (auth: staff)
POST   /api/tournaments/:id/invite-team     Add team to invited_teams
POST   /api/tournaments/:id/join-request    Add to join_requests (auth: gamer team leader)
PUT    /api/tournaments/:id/join-request/:req_id   Approve/reject (auth: main_organizer)
POST   /api/tournaments/:id/seeding    Save seeded teams array order
POST   /api/tournaments/:id/brackets/generate  Generate bracket from seeding
PUT    /api/tournaments/:id/brackets/:match_id  Update match score + winner
POST   /api/tournaments/:id/chat/organizer     Add message to organizer_chat
POST   /api/tournaments/:id/chat/general       Add message to general_chat
POST   /api/tournaments/:id/chat/support       Add message to support_chat
```

#### TEAMS
```
GET    /api/teams                      List all (filters: game, is_recruiting)
GET    /api/teams/:id                  Get one
POST   /api/teams                      Create (auth: gamer)
PUT    /api/teams/:id                  Update (auth: leader_id)
POST   /api/teams/:id/join-request     Submit join request
PUT    /api/teams/:id/join-request/:req_id   Approve/reject (auth: leader)
DELETE /api/teams/:id/member/:user_id  Remove member (auth: leader)
PUT    /api/teams/:id/invites/:tournament_id  Accept/reject tournament invite
```

#### GAMER PROFILES
```
GET    /api/gamers                     List all talents (is_talent=true filter)
GET    /api/gamers/:id                 Get one by user_id
POST   /api/gamers                     Create (auto on register)
PUT    /api/gamers/:id                 Update (auth: own profile)
POST   /api/gamers/:id/apply-talent    Submit talent application → ApprovalRequest
```

#### ORGANIZER PROFILES
```
GET    /api/organizers                 List all
GET    /api/organizers/:id             Get one by user_id
POST   /api/organizers                 Create (auto on register)
PUT    /api/organizers/:id             Update (auth: own profile)
```

#### MARKETPLACE
```
GET    /api/marketplace                List all active items (filters: category)
GET    /api/marketplace/:id            Get one
POST   /api/marketplace                Create (auth: staff/admin)
PUT    /api/marketplace/:id            Update (auth: staff/admin)
DELETE /api/marketplace/:id            Soft delete: is_active=false (auth: staff/admin)
```

#### ORDERS (gamer marketplace orders)
```
GET    /api/orders                     List (auth: own orders for gamer, all for staff)
GET    /api/orders/:id                 Get one
POST   /api/orders                     Create (auth: gamer)
PUT    /api/orders/:id/status          Update status (auth: staff)
POST   /api/orders/:id/chat            Add support chat message
```

#### TOURNAMENT ORDERS
```
GET    /api/tournament-orders                List (auth: organizer sees own, staff sees all)
GET    /api/tournament-orders/:id            Get one
POST   /api/tournament-orders                Create (auto-created on tournament publish)
PUT    /api/tournament-orders/:id/item/:item_id   Update item status (auth: staff)
PUT    /api/tournament-orders/:id/co-org/:org_id/pay   Mark co-org as paid
POST   /api/tournament-orders/:id/chat       Add internal chat message
```

#### SPONSORSHIP RADAR
```
GET    /api/radar                      List open/in_progress listings
GET    /api/radar/:id                  Get full detail
POST   /api/radar                      Create (auto on tournament publish as shared)
PUT    /api/radar/:id                  Update (auth: main_organizer)
POST   /api/radar/:id/commit           Co-org commits (33% or 66%) → creates Bill
POST   /api/radar/:id/chat             Add message to radar chat
```

#### GIG REQUESTS
```
GET    /api/gigs                       List (auth: talent sees own, organizer sees theirs)
GET    /api/gigs/:id                   Get one
POST   /api/gigs                       Create (auth: organizer)
PUT    /api/gigs/:id/status            Accept/reject/complete (auth: talent or organizer)
POST   /api/gigs/:id/chat              Add chat message
POST   /api/gigs/:id/files             Upload file to file_library
```

#### BILLS
```
GET    /api/bills                      List (auth: own bills for org/gamer, all for staff)
GET    /api/bills/:bill_number         Get one (auth: any party on the bill)
POST   /api/bills                      Create (auto-generated, not manual)
PUT    /api/bills/:bill_number/pay     Mark as paid (test mode: no real payment)
```

#### BILLING SNAPSHOTS
```
GET    /api/billing-snapshots          List (auth: own for org, all for staff)
PUT    /api/billing-snapshots/:id/pay  Mark as paid → triggers access_granted update
```

#### APPROVAL REQUESTS
```
GET    /api/approvals                  List (auth: staff sees all, user sees own)
GET    /api/approvals/:id              Get one
POST   /api/approvals                  Create (auto-created by various actions)
PUT    /api/approvals/:id/approve      Approve + trigger side effects (auth: staff)
PUT    /api/approvals/:id/reject       Reject with reason (auth: staff)
```

#### STAFF
```
GET    /api/staff/stats                Platform overview stats
GET    /api/staff/users                All users with profiles
PUT    /api/staff/users/:id            Edit user (role, verified, disabled)
GET    /api/staff/billing              Master billing across all bills
PUT    /api/staff/marketplace/:id      Edit marketplace item
```

#### APP SETTINGS
```
GET    /api/settings                   Get all settings
PUT    /api/settings/:key              Update a setting (auth: admin)
```

---

### 3.4 BUSINESS LOGIC FUNCTIONS TO IMPLEMENT

```
auth.registerGamer(email, password, username, country, primary_game)
  → createUser in Supabase Auth
  → insert user_profiles with role='gamer'
  → insert gamer_profiles

auth.registerOrganizer(email, password, brand_name, location, description, logo, color)
  → createUser in Supabase Auth
  → insert user_profiles with role='organizer'
  → insert organizer_profiles

auth.roleGuard(req, allowedRoles[])
  → verify JWT from Authorization header
  → check user_profiles.role
  → 401 if not authenticated, 403 if wrong role

tournaments.calculateTotalCost(tournament)
  → sum prices of all branding_items + production_items + venue_items + talent prices
  → add prizepool_total if prizepool_in_total_cost = true
  → return total

tournaments.publishTournament(tournament_id, organizer_id)
  → validate: total_cost > 0, at least 1 item selected
  → if tournament_type = 'shared': validate main_organizer_percent >= 33
  → create ApprovalRequest type='tournament_publish'
  → [on staff approval]: set status='published'
  → if shared: create SponsorshipRadar record
  → auto-create TournamentOrder with all items
  → auto-create Bill for main organizer

tournaments.generateBrackets(tournament_id)
  → read teams array (order = seeding)
  → calculate rounds: ceil(log2(teams.length))
  → generate match objects for each round
  → pair teams by seed (1v8, 2v7, 3v6, 4v5 for 8 teams)
  → save to Tournament.brackets

tournaments.setMatchWinner(tournament_id, match_id, winner_id, score1, score2)
  → update the specific match in brackets
  → find next round match slot
  → auto-advance winner_id to next round match
  → if final match completed: set tournament status='completed'
  → add entry to tournament_log

radar.commitCoOrganizer(radar_id, organizer_id, commitment_option)
  → commitment_option: 'join_33' or 'complete_66'
  → validate: co_organizers.length < 2
  → calculate committed_amount from total_cost × percent
  → add to SponsorshipRadar.co_organizers
  → add to Tournament.co_organizers (access_granted: false)
  → recalculate funding_percent and amount_still_needed
  → if funding_percent >= 100 or co_organizers.length >= 2: status='fully_funded'
  → create Bill (bill_type='co_organizer', payment_status='unpaid')
  → create BillingSnapshot
  → send notification to main organizer

billing.markAsPaid(bill_number, staff_user_id)
  → set Bill.payment_status = 'paid'
  → set Bill.paid_amount = Bill.grand_total
  → set Bill.paid_date = today
  → find TournamentOrder, update matching co_organizer payment_status='paid'
  → set Tournament.co_organizers entry access_granted=true
  → create notification for co-organizer: "Payment confirmed, you now have co-org access"

approvals.approve(approval_id, staff_user_id)
  → set status='approved', reviewed_by, reviewed_at
  → if type='team_join':
      update Team.join_requests entry status='approved'
      add requester to Team.members
  → if type='tournament_publish':
      set Tournament.status='published'
  → if type='talent_application':
      set GamerProfile.is_talent=true
      create notification for gamer

gigs.notifyTalents(tournament_id)
  → called when TournamentOrder main organizer payment confirmed
  → for each talent in Tournament.talents:
      create notification in GamerProfile.notifications
      type='gig_request', link='/dashboard/gamer/gigs'

realtime.chatSubscription(channel, table, filter)
  → Supabase Realtime channel subscription
  → subscribe to changes on Tournament organizer_chat JSONB updates
  → used for live chat in organizer dashboard and co-org view
```

---

### 3.5 SUPABASE RLS POLICIES (Row Level Security)

```sql
-- Users can read their own profile
create policy "users_own_profile" on user_profiles
  for all using (auth.uid() = id);

-- Gamers can read/write their own gamer profile
create policy "gamer_own_profile" on gamer_profiles
  for all using (auth.uid() = user_id);

-- Anyone can read all gamer profiles (public talent page)
create policy "gamer_profiles_public_read" on gamer_profiles
  for select using (true);

-- Organizers can read/write their own organizer profile
create policy "organizer_own_profile" on organizer_profiles
  for all using (auth.uid() = user_id);

-- Anyone can read organizer profiles (public page)
create policy "organizer_profiles_public_read" on organizer_profiles
  for select using (true);

-- Anyone can read published/live tournaments
create policy "tournaments_public_read" on tournaments
  for select using (status in ('published', 'live', 'completed'));

-- Organizers can read/write their own tournaments
create policy "tournament_owner_access" on tournaments
  for all using (auth.uid() = main_organizer_id);

-- Teams are public read
create policy "teams_public_read" on teams for select using (true);

-- Team leader can update their own team
create policy "team_leader_write" on teams
  for update using (auth.uid()::text = leader_id);

-- Marketplace items are public read
create policy "marketplace_public_read" on marketplace_items
  for select using (is_active = true);

-- Staff can do everything (role check via user_profiles)
create policy "staff_full_access" on tournaments
  for all using (
    exists (select 1 from user_profiles where id = auth.uid() and role = 'admin')
  );
```

---

### 3.6 ENVIRONMENT VARIABLES REQUIRED

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Express
PORT=3001
NODE_ENV=production
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=https://heru.gg

# Frontend (Vite)
VITE_API_URL=https://api.heru.gg
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Email
RESEND_API_KEY=your-resend-key
FROM_EMAIL=noreply@heru.gg

# Payments (placeholder)
PAYMOB_API_KEY=coming-soon
```

---

### 3.7 VPS DEPLOYMENT STEPS (Hostinger)

```bash
# 1. Provision Ubuntu 22.04 VPS on Hostinger (min 2 vCPU, 4GB RAM)

# 2. Install dependencies
sudo apt update && sudo apt install -y curl nginx git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# 3. Clone repo
git clone https://github.com/your-org/heru-gg.git /var/www/heru
cd /var/www/heru

# 4. Install and build frontend
cd frontend
npm install
npm run build  # outputs to /frontend/dist

# 5. Install and start backend
cd ../backend
npm install
pm2 start index.js --name heru-api
pm2 save && pm2 startup

# 6. Configure Nginx
# /etc/nginx/sites-available/heru.gg
server {
  listen 80;
  server_name heru.gg www.heru.gg;
  root /var/www/heru/frontend/dist;
  index index.html;
  location / { try_files $uri $uri/ /index.html; }
  location /api { proxy_pass http://localhost:3001; }
}

# 7. SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d heru.gg -d www.heru.gg

# 8. Supabase seed data
# Run seed SQL script in Supabase SQL editor (see PART 4)
```

---

### 3.8 DEMO DATA TO SEED IN SUPABASE (after migration)

The following records represent the clean demo state to insert into Supabase after migration:

**2 organizer users + profiles:**
- HERU Esports (main organizer, verified)
- Nexus Esports (co-organizer, verified)

**5 gamer users + profiles:**
- ShadowBlade (IGL/Coach talent, Shadow Wolves leader)
- NeonStrike (Neon Predators leader)
- DesertForce (Desert Storm leader)
- PharaohAim (Pharaoh Kings leader)
- CastKing (Streamer/Caster talent)

**9 teams:**
Shadow Wolves, Neon Predators, Desert Storm, Pharaoh Kings,
Pyramid Clash, Mirage Strikers, Anubis Rising, Scarab Squad, Team Meen Da

**1 live tournament:**
HERU Egypt Open — Season 2 (shared, 8 teams, R1 3/4 played, EGP 80,000)

**1 draft tournament:**
Test Shared Tournament (for radar flow testing)

**1 SponsorshipRadar (fully_funded):**
Egypt Open S2 — HERU Esports 65%, Nexus Esports 35%

**1 SponsorshipRadar (in_progress, open):**
Test Shared Tournament — 33% committed, 66% still open

**5 bills:**
2 shared tournament bills, 1 solo tournament bill, 2 gamer marketplace bills

**2 gig requests:**
ShadowBlade as IGL/Coach, CastKing as Caster — both accepted

**5 approval requests:**
2 team_join pending, 1 tournament_publish pending, 1 talent approved, 1 talent pending

**30+ marketplace items:**
All existing items across 7 categories

---

## PART 4 — MIGRATION INSTRUCTIONS FOR CLAUDE

When the GitHub repo is shared, Claude should:

1. Read this handover document completely
2. Create `/backend` folder with Express app structure:
   - `/backend/src/routes/` — one file per entity group
   - `/backend/src/middleware/` — auth.js, roleGuard.js
   - `/backend/src/lib/supabase.js` — Supabase client
   - `/backend/src/logic/` — business logic functions
   - `/backend/index.js` — Express app entry point
3. Create `/supabase` folder with:
   - `/supabase/migrations/001_initial_schema.sql` — all CREATE TABLE statements
   - `/supabase/migrations/002_rls_policies.sql` — all RLS policies
   - `/supabase/seed/seed.sql` — all demo data INSERT statements
4. Update frontend API calls:
   - Find every `base44.entities.X.list()` → replace with `fetch('/api/x')`
   - Find every `base44.entities.X.create()` → replace with `fetch('/api/x', {method:'POST'})`
   - Find every `base44.entities.X.update()` → replace with `fetch('/api/x/:id', {method:'PUT'})`
   - Find every `base44.auth.login()` → replace with Supabase Auth call
   - Find every `base44.auth.getCurrentUser()` → replace with Supabase `getUser()`
5. Test locally:
   - Start Supabase local: `npx supabase start`
   - Run migrations: `npx supabase db push`
   - Seed data: `npx supabase db seed`
   - Start backend: `npm run dev`
   - Start frontend: `npm run dev`
   - Verify all pages load with real data
6. Deploy to VPS following Section 3.7