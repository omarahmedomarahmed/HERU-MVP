#!/usr/bin/env bash
# =============================================================================
# HERU.gg VPS Hardening Script — Ubuntu 22.04 LTS
# Run as root on your VPS: bash harden-vps.sh
# =============================================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[✗]${NC} $*"; exit 1; }

[[ $EUID -ne 0 ]] && err "Run as root: sudo bash harden-vps.sh"

# -----------------------------------------------------------------------
# 1. System update
# -----------------------------------------------------------------------
log "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq
apt-get autoremove -y -qq

# -----------------------------------------------------------------------
# 2. Install required packages
# -----------------------------------------------------------------------
log "Installing security packages..."
apt-get install -y -qq \
  ufw fail2ban unattended-upgrades \
  curl wget git nginx certbot python3-certbot-nginx \
  nodejs npm

# Install PM2 globally
npm install -g pm2 --quiet

# -----------------------------------------------------------------------
# 3. Create non-root deploy user
# -----------------------------------------------------------------------
if ! id "heru" &>/dev/null; then
  log "Creating deploy user 'heru'..."
  useradd -m -s /bin/bash heru
  usermod -aG sudo heru
  mkdir -p /home/heru/.ssh
  chmod 700 /home/heru/.ssh
  # Copy root's authorized_keys if they exist
  if [[ -f /root/.ssh/authorized_keys ]]; then
    cp /root/.ssh/authorized_keys /home/heru/.ssh/authorized_keys
    chmod 600 /home/heru/.ssh/authorized_keys
    chown -R heru:heru /home/heru/.ssh
    log "Copied authorized_keys to heru user"
  fi
  warn "Set a password for 'heru': passwd heru"
else
  warn "User 'heru' already exists — skipping creation"
fi

# -----------------------------------------------------------------------
# 4. SSH hardening
# -----------------------------------------------------------------------
log "Hardening SSH configuration..."
SSHD_CONFIG="/etc/ssh/sshd_config"

# Backup original config
cp -n "$SSHD_CONFIG" "${SSHD_CONFIG}.orig"

# Apply security settings
cat >> "$SSHD_CONFIG" << 'EOF'

# ===== HERU.gg Security Hardening =====
Protocol 2
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
PermitEmptyPasswords no
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding no
PrintMotd no
AllowAgentForwarding no
AllowTcpForwarding no
MaxAuthTries 3
MaxSessions 5
LoginGraceTime 30
ClientAliveInterval 300
ClientAliveCountMax 2
EOF

systemctl restart sshd
log "SSH hardened — root login and password auth disabled"
warn "IMPORTANT: Make sure you can SSH as 'heru' with your key BEFORE logging out!"

# -----------------------------------------------------------------------
# 5. UFW Firewall
# -----------------------------------------------------------------------
log "Configuring UFW firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (before enabling!)
ufw allow 22/tcp comment 'SSH'

# Allow HTTP and HTTPS
ufw allow 80/tcp  comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Block direct access to backend port 3001 from the internet
# (only Nginx should access it via localhost)
ufw deny 3001/tcp comment 'Block direct backend access'

ufw --force enable
log "UFW firewall enabled"
ufw status verbose

# -----------------------------------------------------------------------
# 6. Fail2ban
# -----------------------------------------------------------------------
log "Configuring Fail2ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime  = 3600
findtime = 600
maxretry = 5
destemail = root@localhost
sendername = Fail2Ban
mta = sendmail
action = %(action_)s

[sshd]
enabled  = true
port     = ssh
filter   = sshd
logpath  = /var/log/auth.log
maxretry = 3
bantime  = 86400

[nginx-http-auth]
enabled  = true
filter   = nginx-http-auth
port     = http,https
logpath  = /var/log/nginx/error.log

[nginx-limit-req]
enabled  = true
filter   = nginx-limit-req
port     = http,https
logpath  = /var/log/nginx/error.log
maxretry = 10
bantime  = 600

[nginx-botsearch]
enabled  = true
filter   = nginx-botsearch
port     = http,https
logpath  = /var/log/nginx/access.log
maxretry = 2
bantime  = 86400
EOF

systemctl enable fail2ban
systemctl restart fail2ban
log "Fail2ban configured and running"

# -----------------------------------------------------------------------
# 7. Automatic security updates
# -----------------------------------------------------------------------
log "Enabling automatic security updates..."
cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF

log "Automatic security updates enabled"

# -----------------------------------------------------------------------
# 8. Nginx configuration
# -----------------------------------------------------------------------
log "Setting up Nginx..."
mkdir -p /var/www/heru.gg/dist
chown -R heru:www-data /var/www/heru.gg

# Hide Nginx version in nginx.conf
if ! grep -q "server_tokens off" /etc/nginx/nginx.conf; then
  sed -i '/http {/a \\tserver_tokens off;' /etc/nginx/nginx.conf
fi

# Increase nginx security limits
cat > /etc/nginx/conf.d/security.conf << 'EOF'
# Limit request body size globally
client_max_body_size 20M;
client_body_timeout 12;
client_header_timeout 12;
keepalive_timeout 15;
send_timeout 10;

# Buffer size tuning
client_body_buffer_size 128k;
large_client_header_buffers 4 8k;
EOF

log "Nginx base config updated"

# -----------------------------------------------------------------------
# 9. System limits for Node.js
# -----------------------------------------------------------------------
log "Setting system limits for Node.js..."
cat >> /etc/security/limits.conf << 'EOF'
heru soft nofile 65536
heru hard nofile 65536
EOF

# -----------------------------------------------------------------------
# 10. PM2 startup
# -----------------------------------------------------------------------
log "Configuring PM2 startup..."
su -c "pm2 startup systemd -u heru --hp /home/heru" root || true
log "PM2 startup configured"

# -----------------------------------------------------------------------
# 11. Log rotation for the app
# -----------------------------------------------------------------------
log "Setting up log rotation..."
cat > /etc/logrotate.d/heru << 'EOF'
/home/heru/.pm2/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 heru heru
}
EOF

# -----------------------------------------------------------------------
# 12. Kernel hardening (sysctl)
# -----------------------------------------------------------------------
log "Applying kernel security hardening..."
cat > /etc/sysctl.d/99-heru-security.conf << 'EOF'
# IP Spoofing protection
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Ignore ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0

# Disable source routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0

# Log Martian packets
net.ipv4.conf.all.log_martians = 1

# Ignore send redirects
net.ipv4.conf.all.send_redirects = 0

# Ignore ping broadcasts
net.ipv4.icmp_echo_ignore_broadcasts = 1

# TCP SYN flood protection
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 5

# Disable IPv6 if not used
# net.ipv6.conf.all.disable_ipv6 = 1
EOF
sysctl -p /etc/sysctl.d/99-heru-security.conf
log "Kernel hardening applied"

# -----------------------------------------------------------------------
# Done
# -----------------------------------------------------------------------
echo ""
echo -e "${GREEN}============================================="
echo " VPS Hardening Complete!"
echo "=============================================${NC}"
echo ""
echo "NEXT STEPS (do these manually):"
echo ""
echo "1. SSH key setup:"
echo "   - Add your public key to /home/heru/.ssh/authorized_keys"
echo "   - Test SSH: ssh heru@72.60.214.57"
echo "   - Only THEN does root login being disabled matter"
echo ""
echo "2. Deploy the app:"
echo "   - Copy nginx/heru.gg.conf to /etc/nginx/sites-available/heru.gg"
echo "   - ln -sf /etc/nginx/sites-available/heru.gg /etc/nginx/sites-enabled/"
echo "   - nginx -t && systemctl reload nginx"
echo ""
echo "3. SSL certificate:"
echo "   - certbot --nginx -d heru.gg -d www.heru.gg"
echo ""
echo "4. Deploy frontend:"
echo "   - Build: npm run build"
echo "   - Copy dist/ to /var/www/heru.gg/dist/"
echo ""
echo "5. Start backend with PM2:"
echo "   - cd /var/www/heru.gg/backend"
echo "   - pm2 start index.js --name heru-backend"
echo "   - pm2 save"
echo ""
echo "6. Verify firewall:"
echo "   - ufw status verbose"
echo "   - Confirm port 3001 is NOT open to the world"
echo ""
