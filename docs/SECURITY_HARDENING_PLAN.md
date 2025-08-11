## Security Hardening Plan (Phased, baby steps)

### Objectives
- Reduce exploit surface and blast radius
- Prevent common web attacks (XSS, CSRF, clickjacking, supply chain)
- Improve detection, response, and rollback

### Assumptions
- Frontend is React/Vite served via Nginx in Docker/Compose
- HTTPS already enforced at the edge
- Auth uses strong passwords
- Follow a baby-steps rollout and roadmap structure

---

## Phase 0 — Discovery and Inventory
- Map all public endpoints, pages, and forms
- Inventory third-party domains used (fonts, analytics, CDN, APIs)
- Identify data flows and any PII
- Confirm token/cookie storage strategy and session lifetimes

Acceptance criteria:
- Asset/Domain inventory doc
- Data flow diagram
- List of risky inline scripts/unsafe DOM usage

---

## Phase 1 — Edge and Transport
- Enforce HSTS (includeSubDomains; preload)
- Force HTTPS redirects at edge
- Evaluate and (optionally) enable CDN/WAF (rate limiting, bot rules, basic managed rules)
- Publish `/.well-known/security.txt`

Acceptance criteria:
- HSTS visible in response headers
- Traffic always HTTPS
- Rate limits for login/forgot-password
- Security.txt reachable

---

## Phase 2 — Security Headers and CSP
- Set headers via Nginx:
  - Strict-Transport-Security, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
  - Frame protection: `frame-ancestors 'none'` (or X-Frame-Options: DENY)
  - Cross-Origin-Opener-Policy/Embedder-Policy if isolation is required
- Deploy CSP in Report-Only → tighten → Enforce
  - default-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'
  - Limit connect-src to explicit API origins
  - Nonce or hash for any inline script/style, or remove inline usage
  - Add `upgrade-insecure-requests`

Acceptance criteria:
- Headers verified on all routes
- CSP Report-Only shows no violations for normal user flows
- Then CSP enforced with zero critical breakage

---

## Phase 3 — Authentication & Session Controls
- Cookies (if used): HttpOnly, Secure, SameSite=Lax or Strict; short-lived tokens with refresh rotation
- Lock brute-force: per-IP and per-username rate limits; show generic error messages
- Limit session duration and idle timeout; device/session revocation capability

Acceptance criteria:
- Cookies have proper flags
- Brute-force attempts throttled
- Sessions expire as designed and are revocable

---

## Phase 4 — Frontend Code Hygiene
- Remove/avoid `dangerouslySetInnerHTML`; if unavoidable, sanitize with a well-vetted library
- Avoid unsafe DOM APIs; prevent DOM-based XSS
- Validate and constrain user inputs (lengths, types) and encode outputs
- Disable public source maps or serve “hidden” maps to error tracker only
- Eliminate dead code and unused third-party scripts

Acceptance criteria:
- Static checks pass (no unsafe patterns)
- No inline scripts/styles unless nonce-hardened
- Source maps not publicly accessible

---

## Phase 5 — CORS and API Surface
- Lock CORS to exact production origin(s); no `*`, credentials only if necessary
- If using cookies for auth, ensure CSRF protections on the server (same-site, anti-CSRF tokens, double-submit, or SameSite=Strict flows)
- Prevent IDOR: server-side authorization checks for every object access
- Prefer opaque IDs/UUIDs in URLs

Acceptance criteria:
- Preflight requests show strict CORS
- CSRF protections verified in flows
- Authorization checks confirmed for sensitive resources

---

## Phase 6 — File Uploads (if applicable)
- Enforce size limits, MIME/type/sniff checks, and extension allowlist
- Virus/malware scanning on uploads
- Store outside web root; randomize filenames; consider signed URLs and CDN

Acceptance criteria:
- Invalid files rejected and logged
- Uploaded files not directly executable
- Access governed by signed/expiring URLs (if used)

---

## Phase 7 — Container and Build Hardening
- Docker: run as non-root, read-only filesystem, drop capabilities, multi-stage builds, minimal final image
- Pin dependencies; build with `npm ci` and lockfile
- Regular base image and package updates via CI
- All test/build/run via Docker Compose

Acceptance criteria:
- Container starts as non-root with read-only FS
- Image size and SBOM generated
- CI enforces reproducible builds with lockfile

---

## Phase 8 — Secrets and Runtime Config
- No secrets in frontend bundles; expose only truly public config
- Read URLs from environment/config at runtime, not hardcoded
- Secret rotation process documented

Acceptance criteria:
- Build artifacts free of secrets
- Env-driven config verified in each environment
- Rotation playbook exists

---

## Phase 9 — Monitoring, Logging, and Alerting
- Client error tracking (e.g., Sentry) with PII redaction
- CSP report endpoint monitoring
- Uptime/synthetic checks and RUM performance baselines
- Security log alerts (suspicious auth, high CSP violations)
- Backup/restore test schedule

Acceptance criteria:
- Errors visible in dashboard with alerts
- CSP violations drop to near-zero
- Synthetic checks green; restore test logged

---

## Phase 10 — Testing and Scanning
- CI gates:
  - `npm audit` fail on high/critical
  - ESLint security rules and/or Semgrep
  - SCA (Dependabot/Snyk) and OS image scanning
- DAST (OWASP ZAP) against staging; nightly/prod baseline scans
- Regression tests for auth flows, headers, and security-critical paths
- Run tests via Docker Compose with `.env.test`

Acceptance criteria:
- CI blocks insecure deps
- ZAP baseline clean of high severity
- Tests cover headers, CSP, auth, CORS

---

## Phase 11 — Compliance and Privacy (if applicable)
- Cookie consent if tracking
- Data retention and deletion policy
- DPA/records for processors; list sub-processors
- Privacy notice updates

Acceptance criteria:
- Cookie banner implemented if required
- Retention policy documented and applied

---

## Rollout Plan (Baby Steps)
- Staging → canary → 100%
- Start CSP in Report-Only, fix violations, then enforce
- Announce change windows; have rollback for Nginx and Docker image
- Use feature flags/toggles where possible

---

## Maintenance Cadence
- Monthly patch day for dependencies, base images, and headers/CSP review
- Quarterly security review/pen test light
- Incident response drill twice per year

---

## Deliverables Checklist
- Nginx header and CSP config changes (staged → canary → prod)
- Dockerfile/Compose hardening
- CI security gates (audit, SAST, SCA, DAST)
- Monitoring/alerts (error tracking, CSP reports, uptime)
- Documentation: threat model, data flows, rotation playbook
- Version bump and CHANGELOG entry aligned to security improvements

---

## Success Metrics
- Zero known high/critical vulnerabilities in dependencies
- CSP violations near-zero in steady state
- No public source maps
- Failed brute-force attempts throttled and alerted
- Time-to-patch (deps/base images) within agreed SLO
