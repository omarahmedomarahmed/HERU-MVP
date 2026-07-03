# HERU.gg — VPS Deployment Guide (Hostinger Ubuntu 22.04)

## Prerequisites

- Ubuntu 22.04 VPS with root SSH access
- Domain pointing to VPS IP (e.g. heru.gg)
- Supabase project with all migrations applied

## 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx certbot python3-certbot-nginx

# Create app directory
sudo mkdir -p /var/www/heru
sudo chown $USER:$USER /var/www/heru
```

## 2. Deploy Application

```bash
# Clone repo
cd /var/www/heru
git clone https://github.com/omarabdelgawad001-cmd/HERU-MVP.git .

# Install dependencies
npm ci
cd backend && npm ci && cd ..

# Build frontend
npm run build
```

## 3. Environment Variables

**Frontend** (`.env` in project root):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=/api
```

**Backend** (`backend/.env`):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://heru.gg
PLATFORM_FEE_PERCENT=15
PAYMOB_ENABLED=false
PAYMOB_API_KEY=
PAYMOB_INTEGRATION_ID=
PAYMOB_IFRAME_ID=
PAYMOB_HMAC_SECRET=
RESEND_API_KEY=
FROM_EMAIL=noreply@heru.gg
```

> **IMPORTANT:** `SUPABASE_ANON_KEY` is required in the backend — the auth route's
> `createAuthClient()` function needs it for `signInWithPassword` to avoid
> contaminating the service-role client's session.

## 4. PM2 Process Manager

```bash
cd /var/www/heru/backend
pm2 start index.js --name heru-backend --node-args="--experimental-modules"
pm2 save
pm2 startup
```

## 5. Nginx Configuration

Copy the provided config:
```bash
sudo cp /var/www/heru/nginx/heru.gg.conf /etc/nginx/sites-available/heru.gg
sudo ln -sf /etc/nginx/sites-available/heru.gg /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 6. SSL Certificate

```bash
sudo certbot --nginx -d heru.gg -d www.heru.gg
```

## 7. Redeploy Script

Create `deploy.sh` in project root:
```bash
#!/bin/bash
cd /var/www/heru
git pull origin main
npm ci
cd backend && npm ci && cd ..
npm run build
pm2 restart heru-backend
echo "Deployed successfully"
```

## Troubleshooting

- **502 Bad Gateway:** Check PM2 status: `pm2 status`, `pm2 logs heru-backend`
- **RLS errors:** Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly in backend/.env
- **Auth failures:** Ensure `SUPABASE_ANON_KEY` is set in backend/.env
- **Upload failures:** Check that the heru-uploads bucket exists in Supabase Storage
