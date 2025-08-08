#!/bin/sh
set -e

# Generate fresh config.js with runtime environment variables
cat <<EOF > /usr/share/nginx/html/config.js
window.__RUNTIME_CONFIG__ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL:-http://localhost:8001}",
  VITE_APP_NAME: "${VITE_APP_NAME:-Online Shop Business}",
  VITE_LOGO_PATH: "${VITE_LOGO_PATH:-/test/test_data/logo.jpg}"
};
EOF

echo "Generated config.js with:"
echo "  VITE_API_BASE_URL: ${VITE_API_BASE_URL:-http://localhost:8001}"
echo "  VITE_APP_NAME: ${VITE_APP_NAME:-Online Shop Business}"
echo "  VITE_LOGO_PATH: ${VITE_LOGO_PATH:-/test/test_data/logo.jpg}"

# Start nginx
exec nginx -g "daemon off;"
