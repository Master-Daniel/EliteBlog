#!/usr/bin/env bash
# Run from frontend repo root (DEPLOY_PATH). Builds, copies dist, and (once) configures Apache + certbot.
# Usage: ./scripts/deploy-orchestrator.sh [production]
# Env: FRONTEND_WEB_ROOT, FRONTEND_DOMAIN, CERTBOT_EMAIL (required for first-time HTTPS). Domain config runs only once.

set -e
ENV="${1:-production}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
WEB_ROOT="${FRONTEND_WEB_ROOT:-/var/www/elite-blog/frontend-dist}"
FRONTEND_DOMAIN="${FRONTEND_DOMAIN:-www.the-eliteblog.com}"
APACHE_SITE_ID="${APACHE_SITE_ID:-elite-blog-frontend}"
SENTINEL="${APP_ROOT}/.apache-domain-configured"

cd "${APP_ROOT}"
echo "Installing dependencies..."
npm ci --legacy-peer-deps --no-audit --no-fund
echo "Building..."
npm run build
echo "Build complete."

mkdir -p "${WEB_ROOT}"
echo "Copying dist to ${WEB_ROOT}..."
rsync -av --delete "${APP_ROOT}/dist/" "${WEB_ROOT}/" 2>/dev/null || cp -R "${APP_ROOT}/dist/"* "${WEB_ROOT}/"
echo "Frontend deployment complete. Serve from ${WEB_ROOT}"

# Apache + certbot: run when vhost config is missing (not just sentinel)
APACHE_CONF=""
if [ -d /etc/apache2 ]; then
  APACHE_CONF="/etc/apache2/sites-available/${APACHE_SITE_ID}.conf"
elif [ -d /etc/httpd ]; then
  APACHE_CONF="/etc/httpd/conf.d/${APACHE_SITE_ID}.conf"
fi

if [ -z "${APACHE_CONF}" ]; then
  echo "Apache not found (no /etc/apache2 or /etc/httpd). Skipping domain config."
elif [ -f "${APACHE_CONF}" ] && grep -q "ServerName ${FRONTEND_DOMAIN}" "${APACHE_CONF}" 2>/dev/null; then
  echo "Apache vhost for ${FRONTEND_DOMAIN} already configured. Skipping."
elif command -v apache2 &>/dev/null || command -v httpd &>/dev/null; then
  echo "Creating Apache vhost for ${FRONTEND_DOMAIN}..."

  # 1) HTTP-only vhost
  sudo tee "${APACHE_CONF}" >/dev/null <<APACHE_HTTP
<VirtualHost *:80>
    ServerName ${FRONTEND_DOMAIN}
    DocumentRoot ${WEB_ROOT}
    <Directory ${WEB_ROOT}>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        FallbackResource /index.html
    </Directory>
</VirtualHost>
APACHE_HTTP

  if [ -d /etc/apache2 ] && [ -x /usr/sbin/a2ensite ]; then
    sudo a2ensite "${APACHE_SITE_ID}" 2>/dev/null || true
    sudo a2dissite 000-default 2>/dev/null || true
    sudo a2enmod rewrite ssl 2>/dev/null || true
  fi
  sudo apache2ctl configtest 2>/dev/null && sudo systemctl reload apache2 2>/dev/null || \
  sudo apachectl configtest 2>/dev/null && sudo systemctl reload httpd 2>/dev/null || true

  # 2) Certbot (optional)
  if [ -n "${CERTBOT_EMAIL}" ] && command -v certbot &>/dev/null; then
    sudo certbot --apache -d "${FRONTEND_DOMAIN}" --non-interactive --agree-tos -m "${CERTBOT_EMAIL}"
  else
    echo "CERTBOT_EMAIL not set or certbot not installed. Skipping SSL."
  fi

  touch "${SENTINEL}"
  echo "Apache vhost created for ${FRONTEND_DOMAIN}. Reload Apache if needed: sudo systemctl reload apache2"
fi
