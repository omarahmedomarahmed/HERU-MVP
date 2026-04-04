#!/usr/bin/env bash
# ============================================================
# HERU.gg — Hostinger VPS Setup Script (Ubuntu 22.04 / 24.04)
# Run as root: sudo bash scripts/setup-vps.sh
# ============================================================

set -euo pipefail

echo "============================================"
echo "  HERU.gg VPS Setup — Starting..."
echo "============================================"

# -----------------------------------------------------------
# 1. System update
# -----------------------------------------------------------
echo "[1/8] Updating system packages..."
apt update && apt upgrade -y

# -----------------------------------------------------------
# 2. Install Node.js 20 LTS
# -----------------------------------------------------------
echo "[2/8] Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    echo "  Node.js already installed: $(node -v)"
fi

echo "  Node: $(node -v)"
echo "  npm:  $(npm -v)"

# -----------------------------------------------------------
# 3. Install PM2 globally
# -----------------------------------------------------------
echo "[3/8] Installing PM2..."
npm install -g pm2

# -----------------------------------------------------------
# 4. Install Nginx
# -----------------------------------------------------------
echo "[4/8] Installing Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx

# -----------------------------------------------------------
# 5. Install Certbot (for SSL later)
# -----------------------------------------------------------
echo "[5/8] Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# -----------------------------------------------------------
# 6. Install Git
# -----------------------------------------------------------
echo "[6/8] Installing Git..."
apt install -y git

# -----------------------------------------------------------
# 7. Create app directory and PM2 log directory
# -----------------------------------------------------------
echo "[7/8] Creating directories..."
mkdir -p /var/www/heru.gg
mkdir -p /var/log/pm2

# -----------------------------------------------------------
# 8. Configure firewall (UFW)
# -----------------------------------------------------------
echo "[8/8] Configuring firewall..."
apt install -y ufw
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo ""
echo "============================================"
echo "  VPS Setup Complete!"
echo "============================================"
echo ""
echo "  Next steps:"
echo "  1. Clone your repo:"
echo "     cd /var/www/heru.gg"
echo "     git clone https://github.com/YOUR_USER/YOUR_REPO.git ."
echo ""
echo "  2. Create environment files:"
echo "     cp .env.example .env"
echo "     cp .env.example backend/.env"
echo "     nano .env           # Edit frontend env vars"
echo "     nano backend/.env   # Edit backend env vars (add SERVICE_ROLE_KEY)"
echo ""
echo "  3. Install dependencies and build:"
echo "     npm ci"
echo "     npm run build"
echo "     cd backend && npm ci --production && cd .."
echo ""
echo "  4. Setup Nginx:"
echo "     cp nginx/heru.gg-initial.conf /etc/nginx/sites-available/heru.gg"
echo "     ln -sf /etc/nginx/sites-available/heru.gg /etc/nginx/sites-enabled/heru.gg"
echo "     rm -f /etc/nginx/sites-enabled/default"
echo "     nginx -t && systemctl reload nginx"
echo ""
echo "  5. Start backend with PM2:"
echo "     pm2 start ecosystem.config.cjs"
echo "     pm2 save"
echo "     pm2 startup    # Follow the output command to enable boot start"
echo ""
echo "  6. Test: Open http://YOUR_VPS_IP in your browser"
echo ""
echo "  7. Later — Add SSL (after pointing your domain):"
echo "     sudo certbot --nginx -d heru.gg -d www.heru.gg"
echo ""
