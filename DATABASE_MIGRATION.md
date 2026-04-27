# HERU.gg — Database Migration Guide

This guide covers how to migrate the HERU.gg database away from Supabase (PostgreSQL) to another provider, and how to apply the fresh schema on any PostgreSQL-compatible database.

---

## Current Database: Supabase (PostgreSQL 15)

The database schema is defined in `/supabase/migrations/` as sequential SQL files:

| File | Contents |
|------|----------|
| `100_core.sql` | user_profiles, staff_access_keys, app_settings, cms_pages, audit_log, achievements, badges, games |
| `101_gamers.sql` | gamer_profiles, teams, tournaments, match_records, leaderboard_entries, friendships, direct_messages |
| `102_organizers.sql` | organizer_profiles, organizer_verifications, deliverables, bills, orders, tournament_orders |
| `103_providers.sql` | service_provider_profiles, services (9 categories), service_bookings, coaching_sessions, reviews, portfolio_items |
| `104_sponsors.sql` | sponsor_profiles, subscriptions (free/community/premium), sponsorship_packages, sponsorships, managed_service_projects, heru_revenue_ledger |
| `105_rls.sql` | Row Level Security policies (Supabase-specific — see below) |
| `106_schema_fixes.sql` | participant_type constraint fix, venue_address/google_maps columns, roi_data, task_board, files columns |

---

## Option A — Stay on PostgreSQL (Different Host)

### Providers that run plain PostgreSQL
- **Neon** — serverless Postgres, free tier, similar to Supabase
- **Railway** — managed Postgres, simple deploy
- **PlanetScale** — MySQL-compatible (see Option B for MySQL translation)
- **Fly.io** — self-hosted Postgres on edge
- **AWS RDS (PostgreSQL)** — production-grade, VPC isolation
- **Self-hosted** — run `docker run postgres:15` on any VPS

### Steps

#### 1. Export current schema + data from Supabase

```bash
# Get connection string from Supabase Dashboard → Settings → Database
pg_dump "postgres://postgres:[password]@[host]:5432/postgres" \
  --schema-only --no-owner --no-acl \
  -f heru_schema.sql

# For full data export
pg_dump "postgres://postgres:[password]@[host]:5432/postgres" \
  --no-owner --no-acl \
  -f heru_full_backup.sql
```

#### 2. Apply fresh schema on new host

```bash
# Apply migrations in order (skip 105_rls if not using Supabase RLS)
psql "postgres://[user]:[password]@[new-host]:5432/[dbname]" \
  -f supabase/migrations/100_core.sql
psql "..." -f supabase/migrations/101_gamers.sql
psql "..." -f supabase/migrations/102_organizers.sql
psql "..." -f supabase/migrations/103_providers.sql
psql "..." -f supabase/migrations/104_sponsors.sql
# Skip 105_rls.sql unless your new DB supports Supabase auth.uid()
psql "..." -f supabase/migrations/106_schema_fixes.sql
```

#### 3. Handle Supabase-specific SQL

The following must be replaced when moving off Supabase:

**`uuid_generate_v4()`** — requires `uuid-ossp` extension:
```sql
-- Add at the top of your first migration:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- OR replace all uuid_generate_v4() with gen_random_uuid() (built-in since PG 13)
```

**`auth.uid()`** — Supabase function; does not exist on plain Postgres:
```sql
-- Remove 105_fresh_schema_rls.sql entirely
-- Implement access control in your Express middleware instead (see AUTH_MIGRATION.md)
```

**`TIMESTAMPTZ`** — standard SQL, works everywhere.

#### 4. Update backend `.env`

```env
DATABASE_URL=postgres://user:password@new-host:5432/dbname
```

Replace `supabase.js` client usage with `pg` (node-postgres) or `postgres` npm package:

```javascript
// backend/src/lib/db.js (new file)
import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL);
export default sql;
```

Then in route files, replace:
```javascript
// Before (Supabase)
const { data, error } = await supabaseAdmin.from('tournaments').select('*');

// After (plain pg)
const rows = await sql`SELECT * FROM tournaments`;
```

---

## Option B — Migrate to MySQL / MariaDB

MySQL is not PostgreSQL. The schema requires translation.

### Key differences to handle

| PostgreSQL feature | MySQL equivalent |
|-------------------|-----------------|
| `UUID PRIMARY KEY DEFAULT uuid_generate_v4()` | `CHAR(36) PRIMARY KEY DEFAULT (UUID())` |
| `TIMESTAMPTZ` | `DATETIME(6)` or `TIMESTAMP` |
| `NUMERIC(12,2)` | `DECIMAL(12,2)` |
| `TEXT[]` (arrays) | JSON column or junction table |
| `JSONB` | `JSON` (no indexing on JSON keys without virtual columns) |
| `CHECK` constraints | Supported in MySQL 8.0.16+; use `ENUM` for status fields |
| `ON DELETE CASCADE` | Supported but must enable `FOREIGN_KEY_CHECKS` |
| `BOOLEAN` | `TINYINT(1)` |
| `CREATE OR REPLACE FUNCTION` | `DELIMITER $$ ... $$` stored procedures |
| `TRIGGER` syntax | Different syntax — `FOR EACH ROW BEGIN ... END` |
| Row Level Security | Not supported — must be handled in application code |
| `auth.uid()` | Not available — use session middleware |

### Schema translation example

```sql
-- PostgreSQL (original)
CREATE TABLE tournaments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','live','completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MySQL equivalent
CREATE TABLE tournaments (
  id         CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name       VARCHAR(1000) NOT NULL,
  status     ENUM('draft','published','live','completed') NOT NULL DEFAULT 'draft',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
);
```

### Array columns (TEXT[] → JSON)

```sql
-- PostgreSQL
categories TEXT[] DEFAULT '{}',

-- MySQL
categories JSON DEFAULT ('[]'),
```

In backend code:
```javascript
// PostgreSQL returns arrays natively
provider.categories  // ['Branding', 'Production']

// MySQL JSON — parse on read, stringify on write
JSON.parse(provider.categories)
```

### JSONB columns

MySQL `JSON` type does not support GIN indexing. For heavily queried JSON fields, normalize into a separate table instead.

### Triggers (revenue split)

```sql
-- MySQL equivalent of calculate_revenue_split trigger
DELIMITER $$
CREATE TRIGGER trg_calculate_revenue
BEFORE INSERT ON heru_revenue_ledger
FOR EACH ROW
BEGIN
  SET NEW.heru_fee = ROUND(NEW.gross_amount * NEW.fee_percent / 100, 2);
  SET NEW.net_to_party = NEW.gross_amount - NEW.heru_fee;
END $$
DELIMITER ;
```

### MySQL backend client

```bash
npm install mysql2
```

```javascript
import mysql from 'mysql2/promise';
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});
export default pool;
```

---

## Option C — Migrate to Firebase (Firestore)

Firestore is a NoSQL document database. The HERU relational schema does not map 1:1. This is a significant rewrite.

### Collection mapping

| SQL Table | Firestore Collection |
|-----------|---------------------|
| `tournaments` | `/tournaments/{id}` |
| `teams` | `/teams/{id}` |
| `users` / `user_profiles` | `/users/{uid}` |
| `service_bookings` | `/bookings/{id}` |
| `sponsorships` | `/sponsorships/{id}` |
| `heru_revenue_ledger` | `/revenue/{id}` |

### Data denormalization

Firestore requires denormalization for performance. Example:

```javascript
// SQL: JOIN tournaments + organizer_profiles ON organizer_id
// Firestore: embed organizer name directly in tournament doc
{
  id: "abc123",
  name: "Valorant Open Cairo",
  organizer: {
    id: "user_xyz",
    brand_name: "Nexus Esports",
    is_verified: true
  },
  status: "published",
  // ...
}
```

### Firestore backend setup

```bash
npm install firebase-admin
```

```javascript
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
export const db = getFirestore();
```

Replace Supabase calls:
```javascript
// Before (Supabase)
const { data } = await supabaseAdmin.from('tournaments').select('*').eq('status','published');

// After (Firestore)
const snap = await db.collection('tournaments').where('status','==','published').get();
const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
```

### Revenue ledger in Firestore

Use a Cloud Function or backend trigger to auto-calculate `heru_fee` and `net_to_party` on write, since Firestore has no DB triggers:

```javascript
// backend: before writing to Firestore
const heruFee = Math.round(grossAmount * feePercent / 100 * 100) / 100;
await db.collection('revenue').add({
  stream, entity_type, entity_id,
  gross_amount: grossAmount,
  fee_percent: feePercent,
  heru_fee: heruFee,
  net_to_party: grossAmount - heruFee,
  currency: 'EGP',
  recorded_at: new Date()
});
```

### Firestore security rules (replaces RLS)

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tournaments/{id} {
      allow read: if resource.data.status in ['published', 'live', 'completed'];
      allow write: if request.auth != null
        && request.auth.uid == resource.data.organizer_id;
    }
    match /revenue/{id} {
      allow read: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow write: if false; // backend only
    }
  }
}
```

---

## Data Export from Supabase (All Options)

Before migrating, export your data:

```bash
# Export all tables as CSV via Supabase CLI
supabase db dump --data-only > heru_data.sql

# Or export specific tables via psql
psql "postgresql://..." -c "\COPY tournaments TO 'tournaments.csv' CSV HEADER"
psql "postgresql://..." -c "\COPY users TO 'users.csv' CSV HEADER"
```

For user migration, see `AUTH_MIGRATION.md` — auth data (emails, hashed passwords) is separate from the database and requires its own migration path.

---

## App Settings (fee configuration)

The `app_settings` table stores all configurable fees. After migration, re-insert these rows:

```sql
INSERT INTO app_settings (setting_key, setting_value, description) VALUES
  ('platform_fee_percent',     '15',  'Platform cut on service bookings (%)'),
  ('sponsorship_fee_percent',  '15',  'Platform cut on sponsorship package purchases (%)'),
  ('coaching_fee_percent',     '15',  'Platform cut on coaching session completions (%)'),
  ('min_sponsorship_multiplier','1.5','Minimum package price as multiplier of total service cost'),
  ('subscription_price_pro',   '999', 'Sponsor Pro subscription price in EGP/month'),
  ('subscription_price_enterprise','0','Sponsor Enterprise price (custom — use 0 as placeholder');
```

See `REVENUE.md` for full documentation on fee locations and how to change them.
