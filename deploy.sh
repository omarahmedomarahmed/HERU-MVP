#!/bin/bash
set -e

# HERU.gg Deployment Script for Hostinger VPS
# Usage: ./deploy.sh [--skip-build] [--backend-only] [--frontend-only]

DEPLOY_PATH="/var/www/heru.gg"
SKIP_BUILD=false
BACKEND_ONLY=false
FRONTEND_ONLY=false

for arg in "$@"; do
  case $arg in
    --skip-build) SKIP_BUILD=true ;;
    --backend-only) BACKEND_ONLY=true ;;
    --frontend-only) FRONTEND_ONLY=true ;;
  esac
done

echo "========================================="
echo "  HERU.gg Deployment"
echo "========================================="
echo ""

cd "$DEPLOY_PATH"

# Pull latest code
echo "[1/6] Pulling latest code..."
git pull origin main

# Backend
if [ "$FRONTEND_ONLY" = false ]; then
  echo "[2/6] Installing backend dependencies..."
  cd backend && npm ci --production && cd ..

  echo "[3/6] Restarting backend with PM2..."
  pm2 restart heru-backend 2>/dev/null || pm2 start backend/index.js --name heru-backend --env production
  pm2 save
fi

# Frontend
if [ "$BACKEND_ONLY" = false ]; then
  if [ "$SKIP_BUILD" = false ]; then
    echo "[4/6] Installing frontend dependencies..."
    npm ci

    echo "[5/6] Building frontend..."
    npm run build
  fi
fi

# Nginx
echo "[6/6] Reloading Nginx..."
sudo cp nginx/heru.gg.conf /etc/nginx/sites-available/heru.gg
sudo ln -sf /etc/nginx/sites-available/heru.gg /etc/nginx/sites-enabled/heru.gg
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "========================================="
echo "  Deployment complete!"
echo "  Frontend: https://heru.gg"
echo "  Backend:  https://heru.gg/api"
echo "========================================="
pm2 status
