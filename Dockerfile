# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files (including package-lock.json if it exists)
COPY package*.json ./

# Install dependencies (using npm install to handle out-of-sync lock files)
RUN npm install

# Copy source code
COPY . .

# Create public directory if it doesn't exist and create a placeholder config.js (will be replaced at runtime)
RUN mkdir -p public && echo 'window.__RUNTIME_CONFIG__ = { VITE_API_BASE_URL: "PLACEHOLDER", VITE_APP_NAME: "PLACEHOLDER", VITE_LOGO_PATH: "PLACEHOLDER" };' > public/config.js

# Build arguments for environment variables
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME
ARG VITE_LOGO_PATH

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy placeholder config.js (will be replaced by entrypoint)
COPY --from=builder /app/public/config.js /usr/share/nginx/html/config.js

# Copy fonts for PDF generation
COPY --from=builder /app/public/fonts /usr/share/nginx/html/fonts

# Copy ANPC pictograms for legal compliance
COPY --from=builder /app/public/anpc-*.png /usr/share/nginx/html/

# Copy test data (including logo)
COPY --from=builder /app/test /usr/share/nginx/html/test

# Copy robots.txt for SEO
COPY robots.txt /usr/share/nginx/html/robots.txt

# sitemap.xml is generated at runtime by entrypoint

# Copy web manifest for PWA support (from public assets)
#COPY --from=builder /app/public/favicon/site.webmanifest /usr/share/nginx/html/site.webmanifest

# Copy Google verification file for Search Console
COPY google*.html /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 80

# Start with entrypoint
CMD ["/docker-entrypoint.sh"] 