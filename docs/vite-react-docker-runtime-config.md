# Vite + React + Docker + Runtime Config Injection

This setup allows you to build a single Docker image for your frontend
that can be deployed in multiple environments **without rebuilding** ---
each deployment can have its own API URL (or other env vars) simply by
setting them in `docker-compose.yml`.

------------------------------------------------------------------------

## 1. Project Structure

    frontend/
      src/
        App.jsx
        main.jsx
      index.html
      package.json
      vite.config.js
      docker-entrypoint.sh
      nginx.conf
    Dockerfile
    docker-compose.yml

------------------------------------------------------------------------

## 2. React Code (Vite)

**src/App.jsx**

``` jsx
export default function App() {
  // Read API URL from runtime config
  const apiUrl = window.RUNTIME_CONFIG?.API_URL || "NOT SET";

  return (
    <div>
      <h1>Frontend</h1>
      <p>API URL: {apiUrl}</p>
    </div>
  );
}
```

**src/main.jsx**

``` jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**index.html**

``` html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Runtime Config Example</title>
  </head>
  <body>
    <div id="root"></div>
    <!-- Runtime config will be injected here -->
    <script src="/config.js"></script>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

------------------------------------------------------------------------

## 3. Docker Setup

**Dockerfile**

``` dockerfile
# Build stage
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
```

**nginx.conf**

``` nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

**docker-entrypoint.sh**

``` sh
#!/bin/sh
set -e

# Inject runtime API URL into config.js
cat <<EOF > /usr/share/nginx/html/config.js
window.RUNTIME_CONFIG = {
  API_URL: "${VITE_API_URL}"
};
EOF

exec nginx -g 'daemon off;'
```

------------------------------------------------------------------------

## 4. docker-compose

**docker-compose.yml**

``` yaml
version: "3.9"

services:
  frontend:
    build: .
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=https://api.example.com
```

------------------------------------------------------------------------

## 5. Build & Run

``` bash
docker compose build
docker compose up -d
```

Open **http://localhost:3000** --- you should see the API URL printed
from `window.RUNTIME_CONFIG`.

------------------------------------------------------------------------

## 6. Changing API URL Without Rebuild

If a user wants to deploy their own instance with a different API:

``` yaml
services:
  frontend:
    image: yourname/frontend:latest
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=https://my.custom.api
```

Then run:

``` bash
docker compose up -d
```

**No rebuild required** --- `docker-entrypoint.sh` generates a fresh
`config.js` every time the container starts.

------------------------------------------------------------------------

## 7. Why This Works

-   `config.js` is **not** baked into the Vite build --- it's generated
    at container startup.
-   React loads `config.js` before the app runs, so it always gets the
    correct values.
-   The **same image** works across dev, staging, and prod.

------------------------------------------------------------------------

✅ **Build once, deploy anywhere, configure via env vars at runtime.**
