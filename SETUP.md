# HERU.gg — Local & Production Setup Guide

---

## Local Development Setup

### Step 1 — Install prerequisites

```bash
# Node.js 20 (via nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20 && nvm use 20

# Supabase CLI
npm install -g supabase
```

### Step 2 — Clone and install dependencies

```bash
git clone <repo-url> heru-mvp
cd heru-mvp
npm install
cd backend && npm install && cd ..
```

### Step 3 — Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Supabase (get from supabase.com → project settings → API)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Backend
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Paymob (leave disabled for local dev)
PAYMOB_ENABLED=false
PAYMOB_API_KEY=
PAYMOB_INTEGRATION_ID=
PAYMOB_IFRAME_ID=
PAYMOB_HMAC_SECRET=

# Email (optional for local dev)
RESEND_API_KEY=
FROM_EMAIL=noreply@heru.gg

# Platform
PLATFORM_FEE_PERCENT=15
JWT_SECRET=any-random-string-for-local-dev
```

### Step 4 — Set up database

**Option A — Hosted Supabase (recommended)**

1. Go to [supabase.com](https://supabase.com), create a project
2. Open SQL Editor
3. Run migration files in order from `supabase/migrations/`
4. Run `supabase/seed/seed.sql` to load demo data

**Option B — Local Supabase**

```bash
supabase start
# This starts a local Supabase on port 54321
# Update .env with the local URLs printed after start
supabase db push
```

### Step 5 — Run the app

```bash
# Terminal 1 — Frontend
npm run dev
# Runs on http://localhost:5173

# Terminal 2 — Backend
cd backend && npm start
# Runs on http://localhost:3001
```

### Step 6 — Create seed users in Supabase Auth

In your Supabase project → Authentication → Users, create:

| Email | Password | Then insert into user_profiles |
|-------|----------|-------------------------------|
| omarabdelgawad001@gmail.com | (your choice) | role = 'admin' |
| mr.3omar.a7mad@gmail.com | (your choice) | role = 'organizer' |
| habibaheikal27@gmail.com | (your choice) | role = 'gamer' |

Insert staff access key in `staff_access_keys` table:
```sql
INSERT INTO staff_access_keys (access_key, staff_name, staff_email, is_active)
VALUES ('HERU-STAFF-OMAR-2026', 'Omar', 'omarabdelgawad001@gmail.com', true);
```

---

## Production Deployment (Hostinger VPS)

### Server requirements
- Ubuntu 22.04 LTS
- 2+ vCPU, 4GB+ RAM
- Node.js 20, Nginx, PM2, Certbot

### Step 1 — Server initial setup

```bash
# SSH into your VPS
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2, Nginx, Certbot
npm install -g pm2
apt install -y nginx certbot python3-certbot-nginx
```

### Step 2 — Deploy code

```bash
# Create app directory
mkdir -p /var/www/heru

# Clone repo (or copy via rsync/scp)
git clone <repo-url> /var/www/heru
cd /var/www/heru

# Install dependencies
npm install
cd backend && npm install && cd ..

# Copy environment file
cp .env.example .env
nano .env  # fill in production credentials
```

### Step 3 — Build frontend

```bash
cd /var/www/heru
npm run build
# Output: dist/
```

### Step 4 — Configure Nginx

Create `/etc/nginx/sites-available/heru.gg`:

```nginx
server {
    listen 80;
    server_name heru.gg www.heru.gg;

    root /var/www/heru/dist;
    index index.html;

    # Frontend — serve SPA, handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API — proxy to Node.js
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # File upload size limit
    client_max_body_size 50M;
}
```

```bash
ln -s /etc/nginx/sites-available/heru.gg /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### Step 5 — Enable HTTPS

```bash
certbot --nginx -d heru.gg -d www.heru.gg
# Follow prompts — certbot auto-updates nginx config
```

### Step 6 — Start backend with PM2

```bash
cd /var/www/heru/backend
pm2 start index.js --name heru-backend
pm2 save
pm2 startup  # run the printed command to enable auto-start on reboot
```

### Step 7 — Run database migrations

```bash
# Migrations are run against hosted Supabase — not on the VPS
# Go to supabase.com → your project → SQL Editor
# Paste and run each migration file from supabase/migrations/ in order
```

---

## CI/CD with GitHub Actions

The `.github/workflows/deploy.yml` automates deployment on push to `main`:

1. Pushes to `main` trigger the workflow
2. SSH into VPS, pull latest code
3. `npm install` + `npm run build`
4. `cd backend && npm install`
5. `pm2 reload heru-backend`
6. `nginx -s reload`

Required GitHub secrets:
- `VPS_HOST` — server IP
- `VPS_USER` — SSH user (usually `root`)
- `VPS_SSH_KEY` — private SSH key
- `VPS_APP_PATH` — `/var/www/heru`

---

## Useful PM2 Commands

```bash
pm2 status                  # Check running processes
pm2 logs heru-backend       # Stream backend logs
pm2 reload heru-backend     # Zero-downtime reload
pm2 stop heru-backend       # Stop
pm2 delete heru-backend     # Remove from PM2
```

---

## Database Migrations

Apply migrations in order. If adding a new migration:

```bash
# File naming convention:
# supabase/migrations/NNN_description.sql
# Where NNN is the next sequential number (023, 024, ...)
```

To check current migration state, query Supabase:
```sql
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (backend only) |
| `PORT` | Yes | Backend port (default: 3001) |
| `NODE_ENV` | Yes | `development` or `production` |
| `CORS_ORIGIN` | Yes | Frontend URL for CORS |
| `PAYMOB_ENABLED` | No | Set to `true` to enable payments |
| `PAYMOB_API_KEY` | Paymob | From Paymob dashboard |
| `PAYMOB_INTEGRATION_ID` | Paymob | Card integration ID |
| `PAYMOB_IFRAME_ID` | Paymob | Payment iframe ID |
| `PAYMOB_HMAC_SECRET` | Paymob | For webhook verification |
| `RESEND_API_KEY` | No | For transactional emails |
| `FROM_EMAIL` | No | Sender email (e.g. noreply@heru.gg) |
| `PLATFORM_FEE_PERCENT` | No | Default: 15 |
| `JWT_SECRET` | Yes | Secret for token signing |
