#!/bin/sh
set -e

# Generate fresh config.js with runtime environment variables
cat <<EOF > /usr/share/nginx/html/config.js
window.__RUNTIME_CONFIG__ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL:-http://localhost:8001}",
  VITE_APP_NAME: "${VITE_APP_NAME:-Online Shop Business}",
  VITE_LOGO_PATH: "${VITE_LOGO_PATH:-/test/test_data/logo.jpg}",
  VITE_SITE_URL: "${VITE_SITE_URL:-http://localhost}",
  VITE_RYBBIT_SITE_ID: "${VITE_RYBBIT_SITE_ID:-}"
};
EOF

echo "Generated config.js with:"
echo "  VITE_API_BASE_URL: ${VITE_API_BASE_URL:-http://localhost:8001}"
echo "  VITE_APP_NAME: ${VITE_APP_NAME:-Online Shop Business}"
echo "  VITE_LOGO_PATH: ${VITE_LOGO_PATH:-/test/test_data/logo.jpg}"
echo "  VITE_SITE_URL: ${VITE_SITE_URL:-http://localhost}"
echo "  VITE_RYBBIT_SITE_ID: ${VITE_RYBBIT_SITE_ID:-}"

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
CONNECT_SRC="${API_ORIGIN} https://analytics.akdscloud.eu https://ranalytics.akdscloud.eu"

echo "Configuring CSP connect-src with: ${CONNECT_SRC}"

# Replace placeholder in nginx security headers snippet
if [ -f /etc/nginx/conf.d/security-headers.conf ]; then
  sed -i "s#__CONNECT_SRC__#${CONNECT_SRC}#g" /etc/nginx/conf.d/security-headers.conf
else
  echo "WARNING: /etc/nginx/conf.d/security-headers.conf not found; CSP connect-src not configured"
fi

# Start nginx
exec nginx -g "daemon off;"
