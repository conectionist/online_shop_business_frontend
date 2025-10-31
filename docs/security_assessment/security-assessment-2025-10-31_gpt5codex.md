# Security Assessment — Online Shop Business Frontend

- **Date:** 2025-10-31
- **Assessor:** GPT-5 Codex (Cursor agent)
- **Repository:** `online_shop_business_frontend`

## Scope & Methodology

- Reviewed Docker/Compose deployment assets, runtime entrypoint scripts, and Nginx configuration.
- Inspected frontend authentication, storage, and API access patterns for exposure of sensitive data.
- Evaluated build tooling, dependency management, and service worker behaviour for security posture.
- Compared current implementation against the internal `SECURITY_HARDENING_PLAN.md` roadmap to gauge execution status.

## Executive Summary

Current production artefacts are not ready for Internet exposure. High-severity gaps include lack of HTTPS enforcement and defensive headers, client-side storage of long-lived tokens, and permissive service-worker caching of authenticated API responses. Container hardening, logging hygiene, and supply-chain controls also require work. Address the high findings before publishing the site.

## Findings Overview

| Severity | Finding | Evidence | Recommendation |
| --- | --- | --- | --- |
| High | No TLS/HSTS or edge protections | `docker-compose.yml` exposes port `80` without upstream controls. | Place Nginx behind managed HTTPS (reverse proxy/CDN) with HSTS, rate limiting, and WAF rules before Internet exposure. |
| High | Missing security headers & CSP | `nginx.conf` serves SPA without header hardening. | Add HSTS, `X-Frame-Options`/`frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and progressive CSP (report-only → enforce). |
| High | Tokens persisted in `localStorage` | Auth store and login flow write access + refresh tokens to `localStorage`. | Move to httpOnly cookies or short-lived in-memory tokens with refresh rotation to resist XSS. |
| Medium | Service worker caches authenticated API data | `sw.ts` caches `/api/v1` responses for 1 hour. | Restrict caching to public resources or add cache-busting per-user controls. |
| Medium | Verbose console logging reveals context | Auth initializer and error handler log sensitive environment data. | Remove/guard console output in production builds. |
| Medium | Container runs as root & ships test assets | Final image copies `/test` directory and keeps default user. | Drop privileges, remove test fixtures, enable read-only FS, and trim image. |
| Medium | Dependency hygiene gaps | Lockfile version mismatch and `npm install` used for builds. | Align lockfile with release, switch to `npm ci`, add automated `npm audit`/SAST/DAST in CI. |

## Detailed Findings & Recommendations

### 1. Missing Transport/Edge Hardening (High)

The Compose stack publishes Nginx directly on port `80` with bind-mounted assets and no reverse proxy.

```6:23:/home/dan/.cursor/worktrees/online_shop_business_frontend/DdGJT/docker-compose.yml
  frontend-prod:
    build: .
    ports:
      - 3001:80
    env_file:
      - .env
    volumes:
      - ./assets/logo.jpg:/usr/share/nginx/html/assets/logo.jpg 
```

**Risk:** Without enforced HTTPS, HSTS, rate limiting, or WAF, the site is susceptible to downgrade attacks, credential leakage, and brute-force attempts.

**Action:** Deploy behind a managed HTTPS edge (e.g., CDN, reverse proxy) with certificate automation, HSTS (`max-age ≥ 31536000; includeSubDomains; preload`), request throttling, and logging.

### 2. Absent Security Headers & CSP (High)

Nginx config focuses on caching but omits defensive headers entirely.

```9:46:/home/dan/.cursor/worktrees/online_shop_business_frontend/DdGJT/nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    ...
}
```

**Risk:** Clickjacking, MIME sniffing, referrer leakage, and unmitigated script injection.

**Action:** Extend `nginx.conf` with:

- `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;`
- `add_header X-Frame-Options "DENY" always;` or `Content-Security-Policy: frame-ancestors 'none';`
- `add_header X-Content-Type-Options "nosniff" always;`
- `add_header Referrer-Policy "same-origin" always;`
- `add_header Permissions-Policy "geolocation=(), camera=(), microphone=(), fullscreen=(self)" always;`
- CSP rollout: start report-only with tight `default-src 'self'; connect-src` limited to backend/API origins; add nonces for inline scripts if necessary; move to enforce once telemetry is clean.

### 3. Token Persistence in `localStorage` (High)

Access and refresh tokens are stored via Zustand persistence and manual `localStorage` calls.

```41:83:/home/dan/.cursor/worktrees/online_shop_business_frontend/DdGJT/src/stores/authStore.ts
      login: (token: string, user: User) => {
        ...
        localStorage.setItem('access_token', token);
      },
```

```70:78:/home/dan/.cursor/worktrees/online_shop_business_frontend/DdGJT/src/pages/LoginPage.tsx
      localStorage.setItem('refresh_token', refresh_token);
      useAuthStore.getState().login(access_token, userData);
```

**Risk:** Any XSS grants persistent credential theft and allows indefinite session refresh.

**Action:** Transition to server-issued, httpOnly secure cookies or in-memory access tokens with short lifetimes and refresh rotations. Clear tokens on logout and disable automatic persistence.

### 4. Service Worker Caching Sensitive Data (Medium)

The PWA caches authenticated GET responses for up to an hour.

```21:30:/home/dan/.cursor/worktrees/online_shop_business_frontend/DdGJT/src/sw.ts
registerRoute(
  ({ url, request }) => request.method === 'GET' && url.pathname.startsWith('/api/v1') && !url.pathname.includes('/auth/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 }),
    ],
  }),
)
```

**Risk:** Shared machines or compromised sessions may leak cached personal data; an attacker with the service worker context can replay cached responses.

**Action:** Limit caching to explicitly public, non-sensitive endpoints, or disable caching for authenticated routes. Consider per-user cache keys or `cache-control: private, no-store` responses from the API.

### 5. Verbose Console Logging (Medium)

Auth initialization and error handling log contextual information (URLs, stack traces).

```47:54:/home/dan/.cursor/worktrees/online_shop_business_frontend/DdGJT/src/hooks/useErrorHandler.ts
    console.error('Error occurred:', {
      error,
      userAction,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
```

**Risk:** Production consoles (browser devtools, remote logging) may expose sensitive error payloads or user journey data.

**Action:** Strip or gate console logging behind development flags and ensure any remote logging solution redacts PII.

### 6. Container Hardening Gaps (Medium)

Docker file copies the entire `/test` directory and leaves default root user in place.

```27:43:/home/dan/.cursor/worktrees/online_shop_business_frontend/DdGJT/Dockerfile
COPY --from=builder /app/test /usr/share/nginx/html/test
```

**Risk:** Test fixtures and root privileges expand attack surface if Nginx is compromised.

**Action:** Remove non-production assets, create a non-root user, drop capabilities, enable read-only filesystem, and tighten Nginx permissions.

### 7. Build & Dependency Hygiene (Medium)

`package-lock.json` lags behind `package.json`, and build stage uses `npm install`, reducing reproducibility.

```1:10:/home/dan/.cursor/worktrees/online_shop_business_frontend/DdGJT/package-lock.json
"version": "2.21.1",
```

```9:24:/home/dan/.cursor/worktrees/online_shop_business_frontend/DdGJT/Dockerfile
RUN npm install
```

**Risk:** Harder to track vulnerable dependencies; builds may drift. No automated security scans currently block risky packages.

**Action:** Sync lockfile/versioning, switch to `npm ci`, and integrate `npm audit --production`, SAST (ESLint security rules/Semgrep), and DAST (OWASP ZAP baseline) into CI as per `SECURITY_HARDENING_PLAN.md` Phases 7 & 10.

## Additional Observations

- Runtime config (`config.js`) derives from environment variables, which is appropriate, but treat everything written there as public — keep secrets out of frontend build artefacts.
- `docs/SECURITY_HARDENING_PLAN.md` already outlines phased improvements; treat the recommendations above as concrete next actions for Phases 1–4 and 7.

## Next Steps

1. Implement HTTPS edge services, header hardening, and CSP prior to any public launch.
2. Refactor authentication storage to eliminate long-lived tokens from `localStorage`.
3. Reconfigure the service worker to avoid caching authenticated data.
4. Harden container runtime (non-root, minimal assets) and integrate CI security checks with reproducible builds.
5. Re-run this assessment post-remediation to confirm readiness for production deployment.


