# HERU.gg — Auth Migration Guide

This guide explains how to swap Supabase Auth for another authentication provider without breaking the platform.

---

## Current Auth Architecture

### How Auth Works Today

1. **User registers** via Supabase Auth (`supabase.auth.signUp`) → Supabase creates a user in `auth.users` with a UUID
2. **Backend receives** the Supabase JWT in `Authorization: Bearer <token>` header
3. **Backend verifies** the JWT using Supabase's `getUser()` call
4. **Backend looks up** the HERU profile in `user_profiles` where `auth_user_id = <supabase_uid>`
5. **Role is returned** from `user_profiles.role` — not from Supabase

### What's Supabase-Specific

| Component | File | Supabase Usage |
|-----------|------|----------------|
| Auth client | `src/lib/AuthContext.jsx` | `createClient`, `supabase.auth.*` |
| Token on frontend | `src/api/heruClient.js` | `session.access_token` from Supabase session |
| Token verification | `backend/src/middleware/auth.js` | `supabaseAdmin.auth.getUser(token)` |
| User creation hook | DB trigger or backend route | writes to `user_profiles` after auth signup |
| Staff login | `backend/src/routes/auth.js` | custom token in `localStorage.heru_staff_token` |
| Realtime | `src/pages/gamer/GamerMessages.jsx` | Supabase Realtime subscriptions |
| File storage | Booking/portfolio file uploads | Supabase Storage |

### What is NOT Supabase-Specific

- All business logic — roles, escrow, fee calculation, ledger
- All database tables (except `auth.users` which is Supabase-managed)
- Staff login (uses a custom session token, completely independent)
- All API routes (Express, no Supabase dependency in route logic)

---

## Option A — Stay on Supabase Auth (Recommended)

No changes needed. Supabase Auth supports:
- Email/password (currently used)
- Magic link (passwordless email)
- OAuth (Google, Apple, Discord, Twitter)
- Phone OTP
- Enterprise SSO (SAML)

To add OAuth (e.g., Discord for gamers):

```javascript
// src/lib/AuthContext.jsx — add alongside email login
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'discord',
  options: { redirectTo: `${window.location.origin}/auth/callback` }
});
```

---

## Option B — Firebase Auth

### 1. Install Firebase

```bash
npm install firebase
npm install firebase-admin  # backend
```

### 2. Replace frontend auth

**Current (`src/lib/AuthContext.jsx`):**
```javascript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, anonKey);

// Login
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
const token = data.session.access_token;
```

**New (Firebase):**
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

const app = initializeApp({ /* firebaseConfig */ });
const auth = getAuth(app);

// Login
const credential = await signInWithEmailAndPassword(auth, email, password);
const token = await credential.user.getIdToken();

// Watch auth state
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    const token = await firebaseUser.getIdToken();
    // fetch HERU profile from /api/auth/me using this token
  }
});
```

### 3. Replace token in API calls

**Current (`src/api/heruClient.js`):**
```javascript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

**New (Firebase):**
```javascript
import { getAuth } from 'firebase/auth';
const token = await getAuth().currentUser?.getIdToken();
```

### 4. Replace backend verification

**Current (`backend/src/middleware/auth.js`):**
```javascript
const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
if (error || !user) return res.status(401).json({ error: 'Unauthorized' });
const authUserId = user.id;
```

**New (Firebase Admin):**
```javascript
import { getAuth } from 'firebase-admin/auth';

const decoded = await getAuth().verifyIdToken(token);
if (!decoded) return res.status(401).json({ error: 'Unauthorized' });
const authUserId = decoded.uid;
```

Then the `user_profiles` lookup stays identical:
```javascript
const { data: profile } = await supabaseAdmin
  .from('user_profiles')
  .select('*')
  .eq('auth_user_id', authUserId)
  .single();
req.user = profile;
```

### 5. Create user_profiles on register

In Supabase, you would trigger profile creation after `auth.signUp`. With Firebase, do it in your backend register route:

```javascript
// backend/src/routes/auth.js — POST /api/auth/register/gamer
import { getAuth } from 'firebase-admin/auth';

const firebaseUser = await getAuth().createUser({ email, password });
const authUserId = firebaseUser.uid;

await supabaseAdmin.from('user_profiles').insert({
  auth_user_id: authUserId,
  email,
  username,
  role: 'gamer'
});
```

### 6. Migrate existing users

Firebase does not support bulk password import of Supabase-hashed passwords (bcrypt). Options:

**Option 1 — Force password reset:**
```javascript
// Export emails from Supabase auth.users
// Create Firebase users with no password, send reset email
const user = await getAuth().createUser({ email, emailVerified: false });
await getAuth().generatePasswordResetLink(email);
```

**Option 2 — Supabase Admin SDK export (if available):**
Supabase Enterprise allows password hash export. Contact Supabase support.

**Option 3 — Lazy migration:**
Keep Supabase Auth running for existing users, use Firebase for new users. Detect at login which provider the user belongs to by email lookup.

---

## Option C — Auth0 / Clerk / Better Auth

The pattern is the same for any JWT-based auth provider:

### Frontend changes

Replace the Supabase auth calls with your chosen provider's SDK. The result should be the same: a JWT token stored in state/localStorage.

### Backend changes

Replace `supabaseAdmin.auth.getUser(token)` with your provider's JWT verification:

```javascript
// Auth0
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
const client = jwksClient({ jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json` });
// verify JWT against JWKS...

// Clerk
import { clerkClient } from '@clerk/clerk-sdk-node';
const session = await clerkClient.sessions.verifySession(sessionId, sessionToken);
const authUserId = session.userId;

// Better Auth
// Follow Better Auth docs for session verification
```

The key: once you extract `authUserId` from the verified token, the rest of the backend (role check, profile lookup, business logic) is unchanged.

### Environment variables to update

```env
# Remove:
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Add (example for Auth0):
AUTH0_DOMAIN=heru.us.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
AUTH0_AUDIENCE=https://api.heru.gg
```

---

## Option D — Custom JWT (No Third-Party Auth)

Build your own auth if you want zero external dependencies.

### Backend: issue tokens

```javascript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// POST /api/auth/login
const user = await db.query('SELECT * FROM user_profiles WHERE email = $1', [email]);
const valid = await bcrypt.compare(password, user.password_hash);
if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

const token = jwt.sign(
  { sub: user.auth_user_id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
res.json({ token });
```

### Backend: verify tokens

```javascript
// backend/src/middleware/auth.js
import jwt from 'jsonwebtoken';

const decoded = jwt.verify(token, process.env.JWT_SECRET);
const authUserId = decoded.sub;
// lookup user_profiles as normal
```

### Database: add password_hash column

```sql
ALTER TABLE user_profiles ADD COLUMN password_hash TEXT;
```

### Frontend: store token

```javascript
// On login
const { token } = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }).then(r => r.json());
localStorage.setItem('heru_token', token);

// In heruClient.js — replace Supabase session:
const token = localStorage.getItem('heru_token');
```

---

## Staff Auth (Unchanged for All Options)

The staff login system is already independent of Supabase Auth:

- Staff logs in with email + StaffAccessKey at `/admin`
- Backend (`POST /api/auth/staff-login`) validates:
  1. `user_profiles.role === 'admin'`
  2. `staff_access_keys` table has matching active key
- Returns a custom `heru_staff_token` (JWT signed with `STAFF_JWT_SECRET`)
- Frontend stores it in `localStorage.heru_staff_token`
- Backend verifies it via `X-Staff-Token` header in `staffGuard.js`

**No changes needed to staff auth when migrating Supabase.**

---

## Realtime (Direct Messages / Live Brackets)

If you migrate away from Supabase, you also lose Supabase Realtime.

### Replacement options

| Solution | Effort | Cost |
|----------|--------|------|
| Keep Supabase only for Realtime (hybrid) | Low | Free tier |
| Socket.IO | Medium | Free (self-hosted) |
| Pusher / Ably | Low | Paid after limits |
| Firebase Realtime DB (just for messages) | Medium | Free tier |
| Server-Sent Events (SSE) | Low | Free (no library) |

### Socket.IO replacement (GamerMessages)

```javascript
// backend/index.js — add Socket.IO
import { Server } from 'socket.io';
const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL } });

io.on('connection', (socket) => {
  socket.on('join_conversation', ({ partnerId }) => {
    socket.join(`dm_${[socket.userId, partnerId].sort().join('_')}`);
  });
  socket.on('send_message', async ({ recipientId, content }) => {
    // save to DB, then emit to room
    io.to(`dm_${[socket.userId, recipientId].sort().join('_')}`).emit('new_message', message);
  });
});
```

```javascript
// src/pages/gamer/GamerMessages.jsx — replace Supabase subscription
import { io } from 'socket.io-client';
const socket = io(import.meta.env.VITE_API_URL);
socket.emit('join_conversation', { partnerId: selectedUser.id });
socket.on('new_message', (msg) => setMessages(prev => [...prev, msg]));
```

---

## File Storage (Booking Files / Portfolio)

Supabase Storage is used for:
- Booking file attachments (`/bookings/:id` → upload files)
- Provider portfolio images/videos
- Tournament banners

### Replacement options

| Provider | SDK | Notes |
|----------|-----|-------|
| AWS S3 | `@aws-sdk/client-s3` | Production standard |
| Cloudflare R2 | S3-compatible SDK | No egress fees |
| Uploadthing | `uploadthing` | Easy React integration |
| Cloudinary | `cloudinary` | Best for image/video transforms |

### S3 replacement example

```javascript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
const s3 = new S3Client({ region: process.env.AWS_REGION });

// Upload file
await s3.send(new PutObjectCommand({
  Bucket: process.env.S3_BUCKET,
  Key: `bookings/${bookingId}/${fileName}`,
  Body: fileBuffer,
  ContentType: mimeType
}));

const publicUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/bookings/${bookingId}/${fileName}`;
```

Replace Supabase storage calls in any backend route that handles file uploads.

---

## Migration Checklist

When migrating auth providers:

- [ ] Replace `supabase.auth.*` in `src/lib/AuthContext.jsx`
- [ ] Replace `session.access_token` in `src/api/heruClient.js`
- [ ] Replace `supabaseAdmin.auth.getUser()` in `backend/src/middleware/auth.js`
- [ ] Update register routes in `backend/src/routes/auth.js` to create users in new provider
- [ ] Migrate existing users (password reset flow or hash export)
- [ ] Update environment variables (remove Supabase keys, add new provider keys)
- [ ] If also migrating Realtime: replace Supabase subscriptions in GamerMessages.jsx
- [ ] If also migrating Storage: replace Supabase storage calls in upload routes
- [ ] Staff auth: no changes needed (it is already custom JWT)
- [ ] Row Level Security (`105_rls.sql`): remove or rewrite for new DB
- [ ] Test all 5 auth flows: gamer register, organizer register, sponsor register, provider register, staff login
