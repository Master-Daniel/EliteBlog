#!/usr/bin/env bash
# Run from frontend repo root (DEPLOY_PATH). Builds in place, serves from frontend/dist, configures Apache + certbot.
# Usage: ./scripts/deploy-orchestrator.sh [production]
# Env: FRONTEND_DOMAIN. Creates .env with production URLs (api.the-eliteblog.com) before build.
CERTBOT_EMAIL="${CERTBOT_EMAIL:-admin@the-eliteblog.com}"

set -e
ENV="${1:-production}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
WEB_ROOT="${APP_ROOT}/dist"
FRONTEND_DOMAIN="${FRONTEND_DOMAIN:-the-eliteblog.com}"
BACKEND_API_DOMAIN="${BACKEND_API_DOMAIN:-api.the-eliteblog.com}"
APACHE_SITE_ID="${APACHE_SITE_ID:-elite-blog-frontend}"
SENTINEL="${APP_ROOT}/.apache-domain-configured"

cd "${APP_ROOT}"

# Create .env only on first deploy (do not overwrite existing .env)
if [ ! -f "${APP_ROOT}/.env" ]; then
  echo "Creating production .env (first-time)..."
  cat > "${APP_ROOT}/.env" << ENVFILE
VITE_FRONTEND_URL="https://${FRONTEND_DOMAIN}"
VITE_API_URL="https://${BACKEND_API_DOMAIN}"
VITE_BASE_URL="https://${BACKEND_API_DOMAIN}/api"
VITE_GOOGLE_OAUTH_CLIENT_ID="${VITE_GOOGLE_OAUTH_CLIENT_ID:-249661581186-6avjnq3ql43qupmumv84ta44mhvi5tp3.apps.googleusercontent.com}"
VITE_GOOGLE_OAUTH_CLIENT_SECRET="${VITE_GOOGLE_OAUTH_CLIENT_SECRET:-}"
VITE_GITHUB_CLIENT_ID="${VITE_GITHUB_CLIENT_ID:-Ov23liYY4dwJHihd3R1k}"
VITE_GITHUB_REDIRECT_URI="https://${BACKEND_API_DOMAIN}/api/auth/github/callback"
VITE_OPEN_AI_KEY="${VITE_OPEN_AI_KEY:-}"
ENVFILE
else
  echo "Keeping existing .env (not overwriting)."
fi

echo "Installing dependencies..."
npm ci --legacy-peer-deps --no-audit --no-fund
echo "Building..."
npm run build
echo "Build complete. Serving from ${WEB_ROOT}"

# Apache: ensure vhost exists, then always run certbot
APACHE_CONF=""
if [ -d /etc/apache2 ]; then
  APACHE_CONF="/etc/apache2/sites-available/${APACHE_SITE_ID}.conf"
elif [ -d /etc/httpd ]; then
  APACHE_CONF="/etc/httpd/conf.d/${APACHE_SITE_ID}.conf"
fi

if [ -z "${APACHE_CONF}" ]; then
  echo "Apache not found (no /etc/apache2 or /etc/httpd). Skipping."
else
  # 1) Create or update vhost (always write so DocumentRoot stays correct, e.g. frontend/dist)
  echo "Creating/updating Apache vhost for ${FRONTEND_DOMAIN} at ${APACHE_CONF}..."
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

  # 2) Always run certbot (get cert or renew; idempotent)
  if command -v certbot &>/dev/null || [ -x /usr/bin/certbot ]; then
    echo "Running certbot for ${FRONTEND_DOMAIN}..."
    sudo certbot --apache -d "${FRONTEND_DOMAIN}" --non-interactive --agree-tos -m "${CERTBOT_EMAIL}"
  else
    echo "certbot not found. Install: sudo apt install certbot python3-certbot-apache"
  fi

  touch "${SENTINEL}"
fi
