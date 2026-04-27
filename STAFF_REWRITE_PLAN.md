# HERU.gg — Staff Panel Complete Rewrite Plan
# Frontend + Backend, from scratch

---

## Current State (What Exists)

### StaffLayout
- Dark `bg-[#080808]`, red accent, collapsible sidebar
- 5 nav sections: Overview, Platform, Finance, Moderation, System
- "God Mode" badge, HeruLogo in header
- 26 nav items across all sections
- **Problem**: Layout is dark, but every page body uses `bg-white` light-theme cards — completely inconsistent

### Current Pages (26 files in `src/pages/staff/`)
```
StaffDashboard.jsx         StaffAnalytics.jsx        StaffApprovals.jsx
StaffAuditTrail.jsx        StaffBadges.jsx            StaffBilling.jsx
StaffCMS.jsx               StaffGamers.jsx            StaffLogin.jsx
StaffManagedProjects.jsx   StaffMarketplace.jsx       StaffMessages.jsx
StaffOrderDetail.jsx       StaffOrders.jsx            StaffOrganizers.jsx
StaffPlatformControl.jsx   StaffRadarPanel.jsx        StaffRevenue.jsx
StaffSettings.jsx          StaffTeams.jsx             StaffTournamentBuilder.jsx
StaffTournamentDetail.jsx  StaffTournamentOrders.jsx  StaffTournaments.jsx
StaffUserDetail.jsx        StaffUsers.jsx
```

### Backend Routes Used by Staff
All in `backend/src/routes/` — most have basic CRUD. Staff-specific guard: `staffGuard.js` via `X-Staff-Token` header.

```
staff.js                    Core staff routes (login, me, activity)
tournaments.js              CRUD + approve/reject/status
users.js / gamers.js        User management
organizers.js               Organizer profiles + verification
services.js                 Approve/reject service listings
sponsorship-packages.js     Package oversight
sponsorships.js             Sponsorship oversight
revenue.js                  heru_revenue_ledger read
subscriptions.js            Subscription management
managed-services.js         Consultant project management
approvals.js                Multi-type approval queue
settings.js                 app_settings read/write
cms.js                      CMS pages CRUD
audit.js                    audit_log read
badges.js                   Badges CRUD
orders.js / tournament-orders.js  Order management
```

---

## Design System: Staff Dark Theme

All staff pages must use a consistent dark design system matching the StaffLayout shell.

### Color Tokens
```css
Page background:   bg-[#080808]
Card background:   bg-[#111111]
Card border:       border-[#1e1e1e]
Surface hover:     hover:bg-[#1a1a1a]
Primary accent:    text-red-500 / bg-red-500
Muted text:        text-zinc-400
Body text:         text-zinc-100
Input background:  bg-[#1a1a1a] border-[#2a2a2a]
Table header:      bg-[#111111] text-zinc-400
Table row hover:   hover:bg-[#161616]
Badge success:     bg-emerald-500/20 text-emerald-400
Badge warning:     bg-amber-500/20 text-amber-400
Badge danger:      bg-red-500/20 text-red-400
Badge neutral:     bg-zinc-700 text-zinc-300
```

### Shared Components (create in `src/components/staff/`)
```
StaffTable.jsx          Sortable, filterable dark table with pagination
StaffStatCard.jsx       Dark KPI card (icon + value + delta + sub)
StaffBadge.jsx          Status badge (dark variant)
StaffModal.jsx          Dark modal overlay
StaffSearchBar.jsx      Dark search input
StaffTabBar.jsx         Dark tab switcher
StaffEmptyState.jsx     Empty state with icon + message
StaffPageHeader.jsx     Page title + breadcrumb + action buttons
```

---

## Phase 1 — Shared Components

**File: `src/components/staff/StaffStatCard.jsx`**
Props: `icon`, `label`, `value`, `delta` (±% vs last period), `sub`, `accent` (red/green/amber/violet)
Dark card: `bg-[#111111] border border-[#1e1e1e] rounded-xl p-5`

**File: `src/components/staff/StaffTable.jsx`**
Props: `columns` (array of {key, label, render}), `data`, `loading`, `onRowClick`
Dark table: striped rows, sticky header, loading skeleton rows

**File: `src/components/staff/StaffBadge.jsx`**
Maps status strings → color: active→green, pending→amber, rejected→red, etc.

**File: `src/components/staff/StaffPageHeader.jsx`**
Props: `title`, `subtitle`, `actions` (array of {label, onClick, variant})
Renders title + right-side action buttons

---

## Phase 2 — Layout Fix

**File: `src/components/layouts/StaffLayout.jsx`** — update only the nav structure
- Add `/staff/analytics` to Overview section
- Add `/staff/managed-projects` to Moderation section
- Keep all dark styling, no functional changes

---

## Phase 3 — Page Rewrites (Priority Order)

### 3.1 StaffDashboard.jsx — Complete rewrite

**Current problem**: Uses `bg-white` light cards — looks broken inside dark layout.

**New design**:
- 6 KPI cards (dark `StaffStatCard`): Total Users, Active Tournaments, Revenue MTD, Pending Approvals, Active Sponsorships, Active Providers
- Activity Feed (last 20 events from `audit_log`) — dark scrollable list
- Quick Actions row: "Approve Pending", "View Revenue", "Build Tournament"
- Revenue sparkline (last 30 days — 3 streams stacked bar)
- Top 5 pending approvals preview table

**Backend needed**:
```
GET /api/staff/dashboard
  → { users_count, tournaments_count, revenue_mtd, pending_approvals,
      active_sponsorships, active_providers, recent_activity[], revenue_chart[] }
```
This is a single aggregation endpoint to avoid 6 parallel calls on page load.

---

### 3.2 StaffUsers.jsx — Complete rewrite

**Current**: Basic table, role tabs.

**New design**:
- 4 tabs: Gamers, Organizers, Sponsors, Providers
- Per tab: searchable dark table with columns: Avatar, Name, Email, Status, Joined, Actions
- Actions per row: View Profile, Ban/Unban, Change Role
- Bulk actions: select multiple → bulk ban
- Stats row above table: total count, active count, banned count, new this week

**Backend needed**:
```
GET /api/staff/users?role=gamer&search=&status=&page=
PUT /api/staff/users/:id/ban
PUT /api/staff/users/:id/unban
PUT /api/staff/users/:id/role
```

---

### 3.3 StaffApprovals.jsx — Complete rewrite

**Current**: Multi-type queue, works but uses light theme.

**New design**:
- 5 tabs: Service Providers, Services/Listings, Organizer Verifications, Teams, Tournaments
- Each tab: pending items first, with approve/reject buttons inline
- Reject flow: modal with required notes field
- Approve flow: instant with optimistic update
- Stats: pending count badge per tab in tab header

**Backend needed** (most exists in `approvals.js`):
```
GET /api/staff/approvals?type=provider&status=pending
POST /api/staff/approvals/:id/approve  { notes? }
POST /api/staff/approvals/:id/reject   { notes }
```
Wire through to respective tables: `service_provider_profiles.approval_status`, `services.status`, `organizer_verifications.status`, `teams.status`, `tournaments.status`

---

### 3.4 StaffRevenue.jsx — Complete rewrite

**Current**: Horizontal bar chart, 3-stream breakdown. Light card wrappers.

**New design**:
- Date range picker (7d / 30d / 90d / custom)
- 4 KPI cards: Total Revenue, Service Booking Fees, Sponsorship Fees, Subscription MRR
- Revenue over time: stacked line chart (3 streams) — use Recharts (already in deps)
- Full ledger table: sortable by date, stream, amount — with export CSV button
- Stream breakdown donut chart

**Backend needed**:
```
GET /api/revenue?from=&to=&stream=
  → { summary: {total, by_stream}, chart: [{date, service, sponsorship, subscription}], ledger: [] }
```

---

### 3.5 StaffTournaments.jsx — Complete rewrite

**Current**: Basic list.

**New design**:
- Status filter tabs: All, Live, Published, Draft, Completed, Cancelled
- Search by name, game, organizer
- Dark table: Name, Game, Organizer, Status, Teams, Date, Prize Pool, Actions
- Actions: View CRM, Approve/Reject, Force Complete, Delete
- Quick stats row: Live count, Published count, Total prize pool

**Backend** (exists in `tournaments.js`):
```
GET /api/tournaments?status=&search=&page=   (staff sees all, no RLS filter)
PUT /api/tournaments/:id/status  { status }
DELETE /api/tournaments/:id
```

---

### 3.6 StaffOrganizers.jsx — Complete rewrite

**Current**: Basic list.

**New design**:
- Tabs: All, Verified, Pending Verification, Rejected
- Table: Brand Name, Contact, Tournaments, Verification Status, Joined, Actions
- Actions: View Profile, Approve Verification, Reject Verification, Ban
- Side panel: click row → slide-out with full organizer profile

**Backend needed**:
```
GET /api/organizers?verification_status=&search=
PUT /api/organizer-verifications/:id/approve
PUT /api/organizer-verifications/:id/reject  { notes }
```

---

### 3.7 StaffServices.jsx — Complete rewrite (Gig Requests)

**Current**: Approval queue for service listings.

**New design**:
- Tabs: Pending, Approved, Rejected, Suspended
- Table: Provider Name, Service Title, Category, Price, Submitted, Actions
- Actions: Approve (with optional adjusted price), Reject (with notes), Suspend
- Approve modal: confirm price, add staff notes
- Category filter pills

**Backend needed**:
```
GET /api/services?status=&category=&search=
PUT /api/services/:id/approve  { staff_adjusted_price?, staff_notes? }
PUT /api/services/:id/reject   { staff_notes }
PUT /api/services/:id/suspend
```

---

### 3.8 StaffGamers.jsx — Complete rewrite

**New design**:
- Search by username, game, rank
- Table: Avatar, Username, Games, Rank, Teams, Tournaments, Joined, Actions
- Actions: View Public Profile, Ban, Add Achievement Badge
- Gamer detail slide-out: full profile, connected accounts, tournament history

---

### 3.9 StaffAnalytics.jsx — Complete rewrite

**New design**:
- 4 chart sections:
  1. User Growth (line chart: gamers, organizers, sponsors, providers by week)
  2. Tournament Activity (bar: created vs published vs completed per month)
  3. Revenue by Stream (stacked area: service / sponsorship / subscription)
  4. Game Popularity (horizontal bar: tournaments per game)
- Date range picker at top
- Export as PNG/CSV per chart

**Backend needed**:
```
GET /api/staff/analytics?from=&to=
  → { user_growth[], tournament_activity[], revenue_streams[], game_popularity[] }
```

---

### 3.10 StaffRadarPanel.jsx — Complete rewrite

**New design**:
- 3 sections:
  1. All Sponsorship Packages (table: tournament, tier, price, status, sold/max)
  2. All Sponsorships (purchases: sponsor, package, amount, status, paid_at)
  3. Revenue summary: total sponsorship fees collected
- Filter: by status, tournament, date range
- Actions: Disable package, Refund sponsorship

---

### 3.11 StaffManagedProjects.jsx — Complete rewrite

**New design**:
- Tabs: Submitted, Reviewing, In Progress, Completed
- Table: Sponsor, Title, Budget, Status, Consultant, Submitted
- Actions: Assign Consultant, Send Proposal, Mark Complete
- Detail slide-out: full project brief + chat thread

---

### 3.12 StaffPlatformControl.jsx — Complete rewrite

**New design**:
- 3 sections:
  1. **Feature Toggles** — dark toggle switches: Enable Coaching, Enable Sponsorship Radar, Enable Community Builder, Enable Marketplace, Enable Managed Services
  2. **Fee Settings** — editable: Platform Fee %, Min Sponsorship Multiplier
  3. **Platform Status** — Maintenance mode toggle, announcement banner toggle + text

**Backend needed**:
```
GET /api/settings
PUT /api/settings  { key, value }   (one at a time or bulk)
```

---

### 3.13 StaffSettings.jsx — Complete rewrite

**New design**:
- Tabs: Platform Assumptions, Staff Access, Email Templates, Integrations
- Platform Assumptions tab: editable form of all `app_settings` rows
- Staff Access tab: list of active staff access keys, add/revoke keys
- Email Templates tab: edit subject/body for each notification type
- Integrations tab: Paymob status, Resend status, Riot API key status

**Backend needed**:
```
GET /api/staff/settings/access-keys
POST /api/staff/settings/access-keys      { key, staff_name, staff_email }
DELETE /api/staff/settings/access-keys/:id
```

---

### 3.14 StaffCMS.jsx — Complete rewrite

**Current**: Basic CMS editor.

**New design**:
- Left panel: list of CMS pages (Home, ForGamers, ForOrganizers, ForSponsors, ForProviders)
- Right panel: selected page fields (title, hero_text, sections as JSON editor)
- Monaco editor or simple textarea for JSON sections
- Preview button (opens public page in new tab)

---

### 3.15 StaffAuditTrail.jsx — Complete rewrite

**New design**:
- Search by user, action type, date range
- Dark table: Timestamp, User, Role, Action, Entity, IP
- Filter by action type: CREATE, UPDATE, DELETE, LOGIN, APPROVE, REJECT
- CSV export

---

### 3.16 StaffMessages.jsx — Complete rewrite

**New design**:
- Platform-wide broadcast message form (sends notification to all users or by role)
- Recent broadcasts list
- Individual user message search (to find a user's DMs for moderation)

---

### 3.17 Minor rewrites (light theme → dark only)

These pages have working logic, just need the dark theme applied:

| Page | What to Fix |
|------|-------------|
| `StaffBilling.jsx` | `bg-white` cards → dark cards |
| `StaffOrders.jsx` | Table light → dark |
| `StaffOrderDetail.jsx` | Card light → dark |
| `StaffTeams.jsx` | Table light → dark |
| `StaffBadges.jsx` | Cards + form light → dark |
| `StaffVenues.jsx` | Table light → dark |
| `StaffMarketplace.jsx` | Cards light → dark |
| `StaffTournamentOrders.jsx` | Table light → dark |
| `StaffTournamentDetail.jsx` | Detail cards light → dark |
| `StaffTournamentBuilder.jsx` | Form inputs light → dark |
| `StaffLogin.jsx` | Already has dark styling — keep |

---

## Phase 4 — Backend: New Staff Endpoints

### New routes to add to `backend/src/routes/staff.js`

```javascript
// Dashboard aggregate
GET  /api/staff/dashboard
// Users management
GET  /api/staff/users
PUT  /api/staff/users/:id/ban
PUT  /api/staff/users/:id/unban
PUT  /api/staff/users/:id/role
// Analytics
GET  /api/staff/analytics
// Access keys
GET  /api/staff/settings/access-keys
POST /api/staff/settings/access-keys
DELETE /api/staff/settings/access-keys/:id
```

### Enhance existing routes

| Route file | Enhancement |
|------------|-------------|
| `tournaments.js` | Add `PUT /:id/status` for staff force-status |
| `services.js` | Add `PUT /:id/suspend` |
| `revenue.js` | Add `?from=&to=&stream=` date filtering + chart aggregation |
| `organizer-verifications.js` | Wire approve/reject to `organizer_profiles.is_verified` |
| `settings.js` | Allow bulk `PUT /api/settings` with array of {key, value} |

### Guard: all new staff routes use `staffGuard.js`
```javascript
router.use(staffGuard)  // top of staff.js
```

---

## Phase 5 — Login Page (Keep, Minor Polish)

`StaffLogin.jsx` already has dark styling. Minor improvements:
- Add HeruLogo at top
- Add "God Mode" subtitle
- Error message styling (red, dark background)
- Loading state on submit button

---

## Implementation Order

| Step | Files | Priority |
|------|-------|----------|
| 1 | `src/components/staff/` — shared components (StatCard, Table, Badge, PageHeader) | P0 |
| 2 | `backend/src/routes/staff.js` — dashboard aggregate + user management endpoints | P0 |
| 3 | `StaffDashboard.jsx` | P0 |
| 4 | `StaffUsers.jsx` | P0 |
| 5 | `StaffApprovals.jsx` | P0 |
| 6 | `StaffRevenue.jsx` | P1 |
| 7 | `StaffTournaments.jsx` | P1 |
| 8 | `StaffOrganizers.jsx` | P1 |
| 9 | `StaffServices.jsx` | P1 |
| 10 | `StaffAnalytics.jsx` — new backend endpoint | P1 |
| 11 | `StaffRadarPanel.jsx` | P2 |
| 12 | `StaffManagedProjects.jsx` | P2 |
| 13 | `StaffPlatformControl.jsx` | P2 |
| 14 | `StaffSettings.jsx` | P2 |
| 15 | `StaffCMS.jsx` | P2 |
| 16 | `StaffAuditTrail.jsx` | P2 |
| 17 | `StaffGamers.jsx` | P2 |
| 18 | `StaffMessages.jsx` | P3 |
| 19 | Minor dark-theme-only rewrites (9 pages) | P3 |

---

## Verification Checklist

- [ ] `/admin` → dark login page with HeruLogo loads
- [ ] Staff dashboard shows 6 dark KPI cards with real data, no white backgrounds anywhere
- [ ] Approvals queue shows pending items per type, approve/reject work
- [ ] Revenue page shows 3-stream chart with date range picker
- [ ] Tournaments table filterable by status, approve/reject buttons work
- [ ] Services page: approve with adjusted price, reject with notes
- [ ] Settings page: change platform fee → immediately reflected in `/api/settings`
- [ ] All pages use consistent dark cards (`bg-[#111111] border-[#1e1e1e]`)
- [ ] No `bg-white` or `text-gray-900` in any staff page
- [ ] Sidebar active item highlighted in red accent
- [ ] All API calls use `X-Staff-Token` header via `apiCall()` (already handled by heruClient)
