#!/bin/bash
set -e

# HERU.gg Deployment Script for Hostinger VPS
# Usage: ./deploy.sh [--branch <name>] [--skip-build] [--backend-only] [--frontend-only]
#
# Examples:
#   ./deploy.sh                                    # deploy main branch
#   ./deploy.sh --branch claude/review-sponsor-vendor-ffb6x  # deploy feature branch
#   ./deploy.sh --backend-only                     # restart backend only, no build
#   ./deploy.sh --frontend-only                    # rebuild frontend only

DEPLOY_PATH="/var/www/heru.gg"
SKIP_BUILD=false
BACKEND_ONLY=false
FRONTEND_ONLY=false
BRANCH="main"

while [[ $# -gt 0 ]]; do
  case $1 in
    --branch) BRANCH="$2"; shift 2 ;;
    --skip-build) SKIP_BUILD=true; shift ;;
    --backend-only) BACKEND_ONLY=true; shift ;;
    --frontend-only) FRONTEND_ONLY=true; shift ;;
    *) shift ;;
  esac
done

echo "========================================="
echo "  HERU.gg Deployment"
echo "  Branch: $BRANCH"
echo "========================================="
echo ""

cd "$DEPLOY_PATH"

# Pull latest code from the specified branch
echo "[1/6] Pulling latest code from '$BRANCH'..."
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

echo "  Commit: $(git log -1 --oneline)"

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
sudo cp nginx/heru.gg.conf /etc/nginx/sites-available/heru.gg 2>/dev/null || true
sudo ln -sf /etc/nginx/sites-available/heru.gg /etc/nginx/sites-enabled/heru.gg 2>/dev/null || true
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "========================================="
echo "  Deployment complete!"
echo "  Branch:   $BRANCH"
echo "  Frontend: https://heru.gg"
echo "  Backend:  https://heru.gg/api"
echo "========================================="
pm2 status
