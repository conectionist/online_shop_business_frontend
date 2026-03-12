#!/bin/sh
set -e

# Generate fresh config.js with runtime environment variables
cat <<EOF > /usr/share/nginx/html/config.js
window.__RUNTIME_CONFIG__ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL:-http://localhost:8001}",
  VITE_APP_NAME: "${VITE_APP_NAME:-Online Shop Business}",
  VITE_LOGO_PATH: "${VITE_LOGO_PATH:-/test/test_data/logo.jpg}",
  VITE_SITE_URL: "${VITE_SITE_URL:-http://localhost}",
  VITE_RYBBIT_SITE_ID: "${VITE_RYBBIT_SITE_ID:-}",
  NODE_ENV: "${NODE_ENV:-production}"
};
EOF

echo "Generated config.js with:"
echo "  VITE_API_BASE_URL: ${VITE_API_BASE_URL:-http://localhost:8001}"
echo "  VITE_APP_NAME: ${VITE_APP_NAME:-Online Shop Business}"
echo "  VITE_LOGO_PATH: ${VITE_LOGO_PATH:-/test/test_data/logo.jpg}"
echo "  VITE_SITE_URL: ${VITE_SITE_URL:-http://localhost}"
echo "  VITE_RYBBIT_SITE_ID: ${VITE_RYBBIT_SITE_ID:-}"
echo "  NODE_ENV: ${NODE_ENV:-production}"

# Generate sitemap.xml dynamically using VITE_SITE_URL (fallback to http://localhost)
SITE_URL=${VITE_SITE_URL:-http://localhost}
TODAY=$(date +%F)
cat <<EOF > /usr/share/nginx/html/sitemap.xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
EOF

echo "Generated sitemap.xml with base URL: ${SITE_URL}"

# Generate CSP connect-src from VITE_API_BASE_URL so CSP matches the API origin
API_URL="${VITE_API_BASE_URL:-http://localhost:8001}"
# Extract just the origin (scheme + host + optional port), strip any path/query
API_ORIGIN=$(printf '%s\n' "$API_URL" | sed -E 's#(https?://[^/]+).*#\1#')

# Build the connect-src value: API origin + analytics endpoints
# For localhost, include both http and https variants to support auto-upgrade in appConfig.ts
if echo "${API_ORIGIN}" | grep -qE '^https?://localhost(:[0-9]+)?$'; then
  # Extract port if present
  HTTP_ORIGIN=$(echo "${API_ORIGIN}" | sed 's|^https://|http://|')
  HTTPS_ORIGIN=$(echo "${API_ORIGIN}" | sed 's|^http://|https://|')
  CONNECT_SRC="${HTTP_ORIGIN} ${HTTPS_ORIGIN} https://analytics.akdscloud.eu https://ranalytics.akdscloud.eu"
  IMG_SRC="${HTTP_ORIGIN} ${HTTPS_ORIGIN} data: blob:"
else
  CONNECT_SRC="${API_ORIGIN} https://analytics.akdscloud.eu https://ranalytics.akdscloud.eu"
  IMG_SRC="${API_ORIGIN} data: blob:"
fi

echo "Configuring CSP connect-src with: ${CONNECT_SRC}"
echo "Configuring CSP img-src with: ${IMG_SRC}"
echo "Configuring CSP with dev-permissive / prod-strict script-src (no nonce)"

# Generate environment-appropriate security headers
if [ "${NODE_ENV}" = "development" ]; then
  echo "Development mode: using permissive security headers"
  # Development: permissive CSP, no upgrade-insecure-requests
  cat > /etc/nginx/conf.d/security-headers.conf <<EOF
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; connect-src 'self' ${CONNECT_SRC} data:; img-src 'self' ${IMG_SRC}; script-src 'self' 'unsafe-eval' https://analytics.akdscloud.eu https://ranalytics.akdscloud.eu; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'none'; form-action 'self';" always;
EOF
else
  echo "Production mode: using strict security headers"
  # Production: strict CSP and upgrade-insecure-requests
  cat > /etc/nginx/conf.d/security-headers.conf <<EOF
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; connect-src 'self' ${CONNECT_SRC} data:; img-src 'self' ${IMG_SRC}; script-src 'self' 'wasm-unsafe-eval' https://analytics.akdscloud.eu https://ranalytics.akdscloud.eu; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'none'; form-action 'self'; upgrade-insecure-requests;" always;
add_header Cross-Origin-Opener-Policy "same-origin-allow-popups" always;
add_header Cross-Origin-Resource-Policy "cross-origin" always;
EOF
fi

# Start nginx
exec nginx -g "daemon off;"
