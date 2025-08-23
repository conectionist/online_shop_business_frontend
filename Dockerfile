# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

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

# Copy test data (including logo)
COPY --from=builder /app/test /usr/share/nginx/html/test

# Copy robots.txt for SEO
COPY robots.txt /usr/share/nginx/html/robots.txt

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 80

# Start with entrypoint
CMD ["/docker-entrypoint.sh"] 