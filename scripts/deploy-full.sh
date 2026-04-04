#!/usr/bin/env bash
# ============================================================
# HERU.gg — Full VPS Deployment Script
# This script does EVERYTHING to get HERU.gg running on a
# fresh Ubuntu VPS. Just paste and go.
#
# Prerequisites: This script must be run from the cloned repo
# directory (/var/www/heru.gg)
#
# Usage: bash scripts/deploy-full.sh
# ============================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "============================================"
echo "    HERU.gg — Full VPS Deployment"
echo "============================================"
echo -e "${NC}"

# -----------------------------------------------------------
# Verify we're in the right directory
# -----------------------------------------------------------
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    echo -e "${RED}ERROR: This script must be run from the HERU.gg repo root.${NC}"
    echo "Expected to find package.json and backend/ directory."
    echo "Run: cd /var/www/heru.gg && bash scripts/deploy-full.sh"
    exit 1
fi

echo -e "${GREEN}[✓] Running from $(pwd)${NC}"

# -----------------------------------------------------------
# Step 1: Prompt for Supabase Service Role Key
# -----------------------------------------------------------
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  I need your Supabase Service Role Key${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Find it at: Supabase Dashboard → Settings → API → service_role (secret)"
echo ""
read -p "Paste your Supabase Service Role Key: " SUPABASE_SERVICE_ROLE_KEY

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}ERROR: Service Role Key cannot be empty.${NC}"
    exit 1
fi

echo -e "${GREEN}[✓] Got Service Role Key${NC}"

# -----------------------------------------------------------
# Step 2: System Setup (Node.js, Nginx, PM2, etc.)
# -----------------------------------------------------------
echo ""
echo -e "${CYAN}[1/7] Installing system packages...${NC}"

# Update system
apt update && apt upgrade -y

# Install Node.js 20 if not present
if ! command -v node &> /dev/null; then
    echo "  Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    echo "  Node.js already installed: $(node -v)"
fi

# Install Nginx
apt install -y nginx
systemctl enable nginx
systemctl start nginx

# Install PM2
npm install -g pm2

# Install Certbot for SSL later
apt install -y certbot python3-certbot-nginx

# Create PM2 log directory
mkdir -p /var/log/pm2

# Configure firewall
apt install -y ufw
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo -e "${GREEN}[✓] System packages installed${NC}"
echo "  Node: $(node -v) | npm: $(npm -v) | PM2: $(pm2 -v)"

# -----------------------------------------------------------
# Step 3: Create environment files
# -----------------------------------------------------------
echo ""
echo -e "${CYAN}[2/7] Creating environment files...${NC}"

# Hardcoded values from the codebase
SUPABASE_URL="https://utlxvkwdcpwvdnkthksk.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bHh2a3dkY3B3dmRua3Roa3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNDM3NzAsImV4cCI6MjA5MDgxOTc3MH0.maTgrS_ecWgo5nPOOkFsGzuEoU66kvru2bm4_X_HeMk"

# Get VPS IP for CORS
VPS_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

# Frontend .env
cat > .env << ENVEOF
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
VITE_API_URL=/api
ENVEOF

# Backend .env
cat > backend/.env << ENVEOF
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://${VPS_IP}

SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}

PLATFORM_FEE_PERCENT=15
PAYMOB_ENABLED=false
ENVEOF

echo -e "${GREEN}[✓] Environment files created${NC}"

# -----------------------------------------------------------
# Step 4: Install frontend dependencies and build
# -----------------------------------------------------------
echo ""
echo -e "${CYAN}[3/7] Installing frontend dependencies...${NC}"
npm ci

echo ""
echo -e "${CYAN}[4/7] Building frontend...${NC}"
npm run build

echo -e "${GREEN}[✓] Frontend built → dist/${NC}"

# -----------------------------------------------------------
# Step 5: Install backend dependencies
# -----------------------------------------------------------
echo ""
echo -e "${CYAN}[5/7] Installing backend dependencies...${NC}"
cd backend
npm ci --production
cd ..

echo -e "${GREEN}[✓] Backend dependencies installed${NC}"

# -----------------------------------------------------------
# Step 6: Configure Nginx
# -----------------------------------------------------------
echo ""
echo -e "${CYAN}[6/7] Configuring Nginx...${NC}"

# Copy the initial HTTP-only config
cp nginx/heru.gg-initial.conf /etc/nginx/sites-available/heru.gg

# Enable the site
ln -sf /etc/nginx/sites-available/heru.gg /etc/nginx/sites-enabled/heru.gg

# Remove default Nginx page
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t
systemctl reload nginx

echo -e "${GREEN}[✓] Nginx configured and running${NC}"

# -----------------------------------------------------------
# Step 7: Start backend with PM2
# -----------------------------------------------------------
echo ""
echo -e "${CYAN}[7/7] Starting backend with PM2...${NC}"

# Stop existing instance if any
pm2 delete heru-backend 2>/dev/null || true

# Start from ecosystem config
pm2 start ecosystem.config.cjs

# Save PM2 process list for auto-restart on reboot
pm2 save

# Generate startup script (auto-start PM2 on boot)
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo -e "${GREEN}[✓] Backend running on port 3001${NC}"

# -----------------------------------------------------------
# Done!
# -----------------------------------------------------------
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}    HERU.gg is LIVE! 🎉${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "  ${CYAN}Your site:${NC}     http://${VPS_IP}"
echo -e "  ${CYAN}API health:${NC}    http://${VPS_IP}/api/health"
echo ""
echo -e "  ${CYAN}Test logins:${NC}"
echo -e "    Gamer:     http://${VPS_IP}/auth/gamer/login"
echo -e "    Organizer: http://${VPS_IP}/auth/organizer/login"
echo -e "    Staff:     http://${VPS_IP}/admin"
echo ""
echo -e "  ${YELLOW}PM2 status:${NC}  pm2 status"
echo -e "  ${YELLOW}PM2 logs:${NC}    pm2 logs heru-backend"
echo -e "  ${YELLOW}Restart:${NC}     pm2 restart heru-backend"
echo ""
echo -e "  ${YELLOW}Add SSL later (after pointing your domain):${NC}"
echo -e "    sudo certbot --nginx -d heru.gg -d www.heru.gg"
echo ""
