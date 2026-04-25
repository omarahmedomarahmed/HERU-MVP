# HERU.gg — Revenue Configuration Guide

This document tells you exactly where to change each platform fee or revenue stream.
All fees are stored in the database and referenced in backend logic — no code deploys needed.

---

## Fee Summary (Current)

| Stream | Rate | Who Pays | Who Gets |
|--------|------|----------|----------|
| Service booking | 15% | Organizer | HERU (on booking confirmation) |
| Sponsorship package | 15% | Sponsor | HERU (on purchase) |
| Coaching session | 15% | Gamer | HERU (on completion) |
| Provider subscription | TBD | Provider | HERU (recurring MRR — not yet live) |
| Sponsor Pro subscription | EGP 999/mo | Sponsor | HERU (recurring MRR) |
| Sponsor Enterprise subscription | Custom | Sponsor | HERU (recurring MRR) |

---

## How to Change a Fee Rate

### Option A — Database (recommended, no deploy needed)

Fees are stored in the `app_settings` table:

```sql
-- View current settings
SELECT setting_key, setting_value FROM app_settings
WHERE setting_key LIKE '%fee%' OR setting_key LIKE '%percent%';

-- Change platform fee to 12%
UPDATE app_settings
SET setting_value = '12', updated_at = NOW()
WHERE setting_key = 'platform_fee_percent';

-- Change sponsorship fee to 10%
UPDATE app_settings
SET setting_value = '10', updated_at = NOW()
WHERE setting_key = 'sponsorship_fee_percent';

-- Change coaching fee to 20%
UPDATE app_settings
SET setting_value = '20', updated_at = NOW()
WHERE setting_key = 'coaching_fee_percent';
```

The backend reads these values at runtime via `GET /api/settings/:key`.

### Option B — Environment variable (requires restart)

Set `PLATFORM_FEE_PERCENT=12` in your `.env` file and restart PM2:

```bash
pm2 restart heru-backend
```

Backend fallback order: `app_settings` table → `process.env.PLATFORM_FEE_PERCENT` → `15`

---

## Where Each Fee is Applied in Code

### Service Booking Fee

**File:** `backend/src/logic/billing.js`
**Function:** `calculateServiceFee(bookingAmount)`

```javascript
// The fee percent is read from app_settings at runtime
const feePercent = await getSettingNumber('platform_fee_percent', 15);
const heruFee = Math.round(bookingAmount * feePercent / 100 * 100) / 100;
const netToProvider = bookingAmount - heruFee;
```

**Triggered:** When `PUT /api/service-bookings/:id/release` is called (organizer confirms delivery).

**Ledger entry:** `heru_revenue_ledger` with `stream = 'service_booking'`

---

### Sponsorship Package Fee

**File:** `backend/src/routes/sponsorships.js`

```javascript
const feePercent = await getSettingNumber('sponsorship_fee_percent', 15);
const platformFee = Math.round(amount * feePercent / 100 * 100) / 100;
const netToOrganizer = amount - platformFee;
```

**Triggered:** When a sponsor purchases a package (`POST /api/sponsorships`).

**Ledger entry:** `heru_revenue_ledger` with `stream = 'sponsorship'`

---

### Coaching Session Fee

**File:** `backend/src/routes/coaching.js`

```javascript
const feePercent = await getSettingNumber('coaching_fee_percent', 15);
const platformFee = Math.round(price * feePercent / 100 * 100) / 100;
```

**Triggered:** When a coaching session is marked complete.

**Ledger entry:** `heru_revenue_ledger` with `stream = 'coaching'`

---

### Subscription Pricing

**File:** `backend/src/routes/subscriptions.js`

Subscription prices are hardcoded but can be moved to `app_settings`:

```javascript
const SUBSCRIPTION_PRICES = {
  pro:        999,   // EGP/month
  enterprise: null,  // Custom — contact sales
};
```

To make them configurable:
```sql
INSERT INTO app_settings (setting_key, setting_value)
VALUES ('subscription_price_pro', '999'),
       ('subscription_price_enterprise', '0')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;
```

---

## Minimum Sponsorship Package Multiplier

Organizers are guided to price packages at ≥ 1.5× total service cost.

**File:** `backend/src/logic/tournament.js`
**Function:** `validateTournamentEconomics()`

```javascript
const minMultiplier = await getSettingNumber('min_sponsorship_multiplier', 1.5);
```

**Database:**
```sql
UPDATE app_settings SET setting_value = '2.0' WHERE setting_key = 'min_sponsorship_multiplier';
```

---

## Revenue Visibility

All revenue entries live in `heru_revenue_ledger`:

```sql
-- Total HERU revenue by stream (current month)
SELECT
  stream,
  COUNT(*) AS transactions,
  SUM(gross_amount) AS gross,
  SUM(heru_fee) AS heru_revenue,
  SUM(net_to_party) AS paid_out
FROM heru_revenue_ledger
WHERE recorded_at >= DATE_TRUNC('month', NOW())
GROUP BY stream
ORDER BY heru_revenue DESC;
```

Staff can view this at `/staff/revenue` and `/staff/analytics`.

---

## Important Notes

1. Never change fees mid-transaction — always apply to new bookings only
2. Fee changes take effect immediately on the next booking (no cache invalidation needed)
3. All amounts in EGP — never convert to USD in the database
4. The `heru_revenue_ledger` table is append-only — never UPDATE or DELETE entries
5. Historical reports will reflect the fee at the time of transaction (stored in `fee_percent` column)
