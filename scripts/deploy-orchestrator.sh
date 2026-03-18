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
# Absolute path for Apache (no symlink ambiguity)
WEB_ROOT_ABS="$(cd "${APP_ROOT}" && cd dist 2>/dev/null && pwd || echo "${WEB_ROOT}")"
FRONTEND_DOMAIN="${FRONTEND_DOMAIN:-the-eliteblog.com}"
BACKEND_API_DOMAIN="${BACKEND_API_DOMAIN:-api.the-eliteblog.com}"
BACKEND_PORT="${BACKEND_PORT:-3005}"
APACHE_SITE_ID="${APACHE_SITE_ID:-elite-blog-frontend}"
# Sentinel outside repo so Apache config runs only once; survives git clean
SENTINEL="$(dirname "${APP_ROOT}")/.apache-blog-frontend-configured"

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

# When CI builds and uploads dist, we skip install/build to avoid long-running SSH (broken pipe)
if [ -n "${SKIP_BUILD}" ]; then
  echo "SKIP_BUILD set: using pre-built dist from CI (skipping npm install and build)."
else
  echo "Installing dependencies..."
  npm ci --legacy-peer-deps --no-audit --no-fund
  echo "Building..."
  npm run build
  echo "Build complete."
fi
echo "Serving from ${WEB_ROOT} (absolute: ${WEB_ROOT_ABS})"

# Require index.html so we don't configure Apache with an empty dir
if [ ! -f "${WEB_ROOT}/index.html" ]; then
  echo "ERROR: ${WEB_ROOT}/index.html not found. Deploy dist first (rsync from CI)."
  exit 1
fi

# Ensure Apache can read dist and SPA routing works
chmod -R o+rX "${WEB_ROOT}" 2>/dev/null || sudo chmod -R o+rX "${WEB_ROOT}"
# .htaccess fallback for SPA (in case FallbackResource in vhost is not applied)
cat > "${WEB_ROOT}/.htaccess" << 'HTACCESS'
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
HTACCESS

# Apache + certbot: single vhost file (80 + 443) serving from frontend/dist (run only once)
APACHE_CONF=""
if [ -d /etc/apache2 ]; then
  APACHE_CONF="/etc/apache2/sites-available/${APACHE_SITE_ID}.conf"
elif [ -d /etc/httpd ]; then
  APACHE_CONF="/etc/httpd/conf.d/${APACHE_SITE_ID}.conf"
fi

if [ -f "${SENTINEL}" ]; then
  echo "Apache already configured for this app (sentinel exists). Skipping vhost/certbot to avoid affecting other sites."
elif [ -z "${APACHE_CONF}" ]; then
  echo "Apache not found (no /etc/apache2 or /etc/httpd). Skipping."
else
  CERT_DIR="/etc/letsencrypt/live/${FRONTEND_DOMAIN}"

  # 1) If no cert yet, create HTTP-only vhost and obtain certificate via webroot
  if [ ! -d "${CERT_DIR}" ] && command -v certbot &>/dev/null; then
    echo "No existing certificate for ${FRONTEND_DOMAIN}. Creating HTTP vhost and requesting cert..."
    sudo tee "${APACHE_CONF}" >/dev/null <<APACHE_HTTP_ONLY
<VirtualHost *:80>
    ServerName ${FRONTEND_DOMAIN}
    DocumentRoot ${WEB_ROOT_ABS}
    <Directory "${WEB_ROOT_ABS}">
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        FallbackResource /index.html
    </Directory>
</VirtualHost>
APACHE_HTTP_ONLY

    if [ -d /etc/apache2 ] && [ -x /usr/sbin/a2ensite ]; then
      sudo a2ensite "${APACHE_SITE_ID}" 2>/dev/null || true
      sudo a2ensite 000-default 2>/dev/null || true
      sudo a2enmod rewrite ssl 2>/dev/null || true
    fi
    sudo apache2ctl configtest 2>/dev/null && sudo systemctl reload apache2 2>/dev/null || \
    sudo apachectl configtest 2>/dev/null && sudo systemctl reload httpd 2>/dev/null || true

    echo "Requesting certificate for ${FRONTEND_DOMAIN} with certbot (webroot)..."
    sudo certbot certonly --webroot -w "${WEB_ROOT_ABS}" \
      -d "${FRONTEND_DOMAIN}" --non-interactive --agree-tos -m "${CERTBOT_EMAIL}" || true
  fi

  # 2) Write final vhost with both HTTP and HTTPS in a single file
  if [ -d "${CERT_DIR}" ]; then
    echo "Writing combined HTTP/HTTPS vhost for ${FRONTEND_DOMAIN} at ${APACHE_CONF}..."
    sudo tee "${APACHE_CONF}" >/dev/null <<APACHE_FULL
<VirtualHost *:80>
    ServerName ${FRONTEND_DOMAIN}
    DocumentRoot ${WEB_ROOT_ABS}
    <Directory "${WEB_ROOT_ABS}">
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        FallbackResource /index.html
    </Directory>

    # Proxy SEO endpoints to backend (dynamic sitemap/robots/rss)
    ProxyPreserveHost On
    ProxyPass /sitemap.xml http://127.0.0.1:${BACKEND_PORT}/sitemap.xml
    ProxyPassReverse /sitemap.xml http://127.0.0.1:${BACKEND_PORT}/sitemap.xml
    ProxyPass /robots.txt http://127.0.0.1:${BACKEND_PORT}/robots.txt
    ProxyPassReverse /robots.txt http://127.0.0.1:${BACKEND_PORT}/robots.txt
    ProxyPass /rss.xml http://127.0.0.1:${BACKEND_PORT}/rss.xml
    ProxyPassReverse /rss.xml http://127.0.0.1:${BACKEND_PORT}/rss.xml
    ProxyPass /feed.xml http://127.0.0.1:${BACKEND_PORT}/feed.xml
    ProxyPassReverse /feed.xml http://127.0.0.1:${BACKEND_PORT}/feed.xml
</VirtualHost>

<VirtualHost *:443>
    ServerName ${FRONTEND_DOMAIN}
    DocumentRoot ${WEB_ROOT_ABS}
    <Directory "${WEB_ROOT_ABS}">
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        FallbackResource /index.html
    </Directory>

    # Proxy SEO endpoints to backend (dynamic sitemap/robots/rss)
    ProxyPreserveHost On
    ProxyPass /sitemap.xml http://127.0.0.1:${BACKEND_PORT}/sitemap.xml
    ProxyPassReverse /sitemap.xml http://127.0.0.1:${BACKEND_PORT}/sitemap.xml
    ProxyPass /robots.txt http://127.0.0.1:${BACKEND_PORT}/robots.txt
    ProxyPassReverse /robots.txt http://127.0.0.1:${BACKEND_PORT}/robots.txt
    ProxyPass /rss.xml http://127.0.0.1:${BACKEND_PORT}/rss.xml
    ProxyPassReverse /rss.xml http://127.0.0.1:${BACKEND_PORT}/rss.xml
    ProxyPass /feed.xml http://127.0.0.1:${BACKEND_PORT}/feed.xml
    ProxyPassReverse /feed.xml http://127.0.0.1:${BACKEND_PORT}/feed.xml

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/${FRONTEND_DOMAIN}/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/${FRONTEND_DOMAIN}/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf
</VirtualHost>
APACHE_FULL
  else
    echo "Certificate directory ${CERT_DIR} not found. Keeping HTTP-only vhost for ${FRONTEND_DOMAIN}."
  fi

  if [ -d /etc/apache2 ] && [ -x /usr/sbin/a2ensite ]; then
    sudo a2ensite "${APACHE_SITE_ID}" 2>/dev/null || true
    sudo a2ensite 000-default 2>/dev/null || true
    sudo a2enmod rewrite ssl proxy proxy_http 2>/dev/null || true
  fi
  sudo apache2ctl configtest 2>/dev/null && sudo systemctl reload apache2 2>/dev/null || \
  sudo apachectl configtest 2>/dev/null && sudo systemctl reload httpd 2>/dev/null || true
  touch "${SENTINEL}"
  echo "Apache configured once; sentinel created at ${SENTINEL}. Future deploys will skip Apache config."
fi
