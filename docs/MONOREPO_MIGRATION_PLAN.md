# Monorepo migration plan (admin, customer, shared)

Last revised: 2026-11-13, against frontend v4.1.0.

This document describes how to split the frontend into two independently deployable apps (admin panel and customer site) plus a shared package, inside this repository.

## Why

Today the admin panel and the customer site are one Vite build, one Docker image and one container. That causes two problems:

- **Redeploy downtime**: any admin change recreates the container that also serves the shop.
- **Shared blast radius**: `src/App.tsx` eagerly imports every admin page (only `Statistics` is lazy), so an admin module that throws at load time takes the shop down with it.

## Goals

- Two deployable apps: `admin` and `customer`, each with its own image, container, version and CI pipeline.
- An admin-only change builds and redeploys only the admin container.
- A small `shared` package for code both apps really use.
- No backend changes.
- Every step is shippable on its own; production keeps working throughout.

## Non-goals and limits

- No UI redesign.
- A change to `shared` still rebuilds and redeploys both apps. Keeping `shared` small is what makes the split worthwhile.
- The backend stays a single API. A backend deploy or bug still affects both apps.

## Current state

Reachability from the admin routes and from the customer routes in `src/App.tsx` (tests excluded):

| Bucket | Files | Lines | Contents |
|---|---|---|---|
| Admin only | 93 | ~17,600 | `pages/admin`, `components/features/admin`, admin layout, login, 12 of the 16 `components/ui` |
| Customer only | 29 | ~5,800 | `pages/customer`, welcome/legal/contact pages, footer, SEO, cart store, theme |
| Shared | 32 | ~4,000 | `services/*`, most data hooks, `types/api.ts`, query client/keys, auth store, Button/Input/Modal, a few utils |
| App shell | 12 | ~600 | `App.tsx`, `main.tsx`, `sw.ts`, `AuthInitializer`, etc. |

No customer page imports admin code and no admin page imports customer code. The coupling is limited to:

| Coupling point | Where | Resolution |
|---|---|---|
| Single router, eager admin imports | `src/App.tsx` | One `App.tsx` per app |
| Auth wraps the whole app | `AuthInitializer` in `App.tsx` | Admin app only; customers never log in |
| Hard redirect to `/login` on 401 | `src/services/api.ts:83`, `:107` | Configurable handler; login moves to `/admin/login` |
| Cross-links | `Footer.tsx:215` (`/admin`), `LoginPage.tsx:87` | Footer link becomes a plain `<a href>` |
| One service worker for caching and push | `src/sw.ts`, scope `/` | See "Service worker and push" |
| One image, nginx config, entrypoint, workflow | `Dockerfile`, `nginx.conf`, `docker-entrypoint.sh`, `.github/workflows/` | One image per app, path-filtered workflows |
| Absolute static paths in admin code | `/fonts/Roboto-Regular.ttf` in `OrdersPDF.tsx`, `ProductsTotalsPDF.tsx` | Prefix with `import.meta.env.BASE_URL` |

## Key decisions

### 1. Admin is served under `/admin` on the same domain

The reverse proxy sends `/admin` and `/admin/*` to the admin container and everything else to the customer container.

- Existing bookmarks, auth cookies, CORS settings and the `FRONTEND_URL`-based push deep links (`{FRONTEND_URL}/admin/lists/...`) keep working unchanged.
- No backend change is needed.

A separate subdomain was considered and rejected for now. It would need a second backend setting, because `FRONTEND_URL` is used for both customer feed links and admin push links, plus a CORS entry, and admins would have to reinstall the PWA and resubscribe to push.

### 2. Admin routes stay absolute, without a router `basename`

Admin code contains 77 hardcoded `/admin/...` paths across 28 files. The admin app keeps its routes as `/admin/...` and uses a plain `BrowserRouter`, so none of them change. Only asset URLs get the prefix, through Vite's `base: '/admin/'`.

### 3. Login moves to `/admin/login`

This keeps the proxy rule to a single prefix. The customer app keeps a `/login` route that does a full-page redirect to `/admin/login` for old bookmarks.

### 4. `shared` is consumed as TypeScript source

No build step and no `dist/` for `shared`. Each app resolves `@shared/*` to `packages/shared/src/*` through a Vite alias and a tsconfig path, and Vite compiles it as part of the app. This removes build ordering from CI and from local development.

### 5. `shared` holds only what both apps import today

Code moves into `shared` when a second consumer appears, not in anticipation. In particular, only `Button`, `Input` and `Modal` go to `shared`; the 12 admin-only UI components move to the admin app and `Lightbox` to the customer app. Otherwise an admin-only UI tweak would redeploy the shop.

### 6. npm workspaces, per-app versions

Keep npm. Each app has its own `package.json` version and `CHANGELOG.md`. Heavy admin-only dependencies (`@react-pdf/renderer`, `xlsx`, `xlsx-js-style`) move to the admin app's `package.json`, and customer-only ones (`react-markdown`, `remark-gfm`, `yet-another-react-lightbox`) to the customer app's.

## Target structure

```text
repo-root/
  apps/
    admin/
      package.json  index.html  vite.config.ts  tsconfig.json  nginx.conf
      public/fonts/
      src/
        main.tsx  App.tsx  index.css
        pages/            # current pages/admin/** and LoginPage
        components/
          layout/         # AdminLayout, AdminPageHeader, Header
          features/       # current components/features/admin/**
          ui/             # the 12 admin-only UI components
          ProtectedRoute.tsx  AuthInitializer.tsx  RouteErrorBoundary.tsx
        hooks/ services/ types/ utils/   # admin-only ones
    customer/
      package.json  index.html  vite.config.ts  tsconfig.json  nginx.conf
      public/             # legal/, anpc-sal.png, bootstrap.js, favicons
      robots.txt  site.webmanifest  google*.html
      src/
        main.tsx  App.tsx  index.css  sw.ts
        pages/            # current pages/customer/**, WelcomePage, legal, ContactPage
        components/       # AppLayout, Footer, SEO, MarkdownPage, ScrollToTop, Lightbox
        stores/cartStore.ts
        hooks/ types/ utils/             # customer-only ones
  packages/
    shared/
      package.json  tsconfig.json
      src/
        services/  hooks/  types/  lib/  utils/
        stores/authStore.ts
        components/ui/    # Button, Input, Modal
        test/             # setup.ts, testUtils.tsx, mocks/
  docker/
    Dockerfile            # one file, ARG APP=admin|customer
    docker-entrypoint.sh
  package.json            # workspaces + root scripts
  tsconfig.base.json
  docker-compose.yml      # two services
```

The exact file lists per bucket can be regenerated at any time by walking the imports from each app's route list.

## Service worker and push

This is the only part that is not mechanical.

Today one service worker at scope `/` does precaching, runtime caching and push for everyone. Customers subscribe from the footer and admins from `/admin/advanced/notifications`; both use `navigator.serviceWorker.ready`.

**Proposal: the customer app keeps the one service worker at scope `/`; the admin app registers none.**

- A scope of `/` also covers `/admin/*`, so on admin pages `navigator.serviceWorker.ready` still resolves to the same registration. Existing admin push subscriptions keep working with no migration and no duplicates.
- The service worker has no navigation fallback route, so navigations to `/admin/*` go to the network and reach the admin container. **This must stay true**: if a `NavigationRoute` is ever added, it needs a denylist for `/admin`.
- The admin app loses precaching. That is acceptable, and even desirable: admins always get the latest build.
- The installed PWA (`site.webmanifest`, scope `/`) keeps covering both apps.

Accepted trade-off: admin push delivery depends on the customer app's service worker. The push handlers (`push`, `notificationclick`) are stable and rarely change.

Giving the admin app its own service worker at scope `/admin/` is possible later, but requires migrating each admin's push subscription to the new registration and cleaning up the old one on the backend.

## Phases

Each phase ends in a state that can be merged and deployed.

### Phase 0 – Decouple inside the current single app (about half a day)

These changes are useful even if the split is never finished.

1. Lazy-load all admin routes in `App.tsx` with `React.lazy`, inside the existing `RouteErrorBoundary` and `Suspense`. This alone removes most of the "admin bug breaks the shop" risk and takes the PDF and Excel libraries out of the shop's initial bundle.
2. Move login to `/admin/login`. Update `ProtectedRoute.tsx`, `withAuthValidation.tsx`, `Header.tsx` and `LoginPage.tsx`; keep `/login` as a redirect.
3. Replace the two hard-coded `window.location.href = '/login'` in `services/api.ts` with a handler the app registers at startup (for example `setUnauthorizedHandler(...)`).
4. Wrap only the admin routes in `AuthInitializer`, so the shop no longer waits on an auth check before rendering.
5. Change the footer's admin `Link` to a plain `<a href="/admin">`.
6. Prefix the PDF font URLs with `import.meta.env.BASE_URL`.

### Phase 1 – Workspaces and the shared package (about 1 day)

1. Add `workspaces: ["apps/*", "packages/*"]` to the root `package.json` and create `tsconfig.base.json`.
2. Move the current app as a whole into `apps/customer` (temporarily still containing admin) and confirm build, tests and Docker image still work.
3. Create `packages/shared` and move the shared bucket into it in small batches: `types` and `lib` first, then `services` and `stores/authStore.ts`, then `hooks`, then the three UI components and the test helpers. Replace `@/...` imports with `@shared/...` as files move.

Per-app alias setup:

```ts
// apps/<app>/vite.config.ts
resolve: {
  alias: {
    '@shared': path.resolve(__dirname, '../../packages/shared/src'),
    '@': path.resolve(__dirname, './src'),
  },
}
```

Tailwind v4 only scans the app's own directory by default, so each app's `index.css` needs:

```css
@source "../../../packages/shared/src";
```

### Phase 2 – Extract the admin app (about 1 day)

1. Scaffold `apps/admin` with `base: '/admin/'` in `vite.config.ts` and no PWA plugin.
2. Move the admin bucket out of `apps/customer` into `apps/admin`.
3. Write `apps/admin/src/App.tsx` with the admin routes and `/admin/login`, wrapped in `AuthInitializer`, and a catch-all that redirects to `/admin/dashboard`.
4. Reduce `apps/customer/src/App.tsx` to the public routes plus the `/login` redirect.
5. Move the 58 test files next to the code they test; give each workspace a `vitest.config.ts` pointing at the shared test setup.
6. Move dependencies to the workspace that uses them.

### Phase 3 – Docker and nginx (about half a day)

1. One `docker/Dockerfile` with `ARG APP`, built from the repository root so it can see `packages/shared`. Replace `npm install` with `npm ci`.
2. Customer image: as today (sitemap, robots, manifest, legal volume, payment-type assets).
3. Admin image: build output copied to `/usr/share/nginx/html/admin/`, with:

```nginx
location = /admin { return 301 /admin/; }
location /admin/ {
    add_header X-Robots-Tag "noindex, nofollow" always;
    include /etc/nginx/conf.d/security-headers.conf;
    try_files $uri $uri/ /admin/index.html;
}
```

4. The admin `index.html` loads `/admin/config.js`; the entrypoint writes `config.js` into the app's own directory and skips the sitemap for admin.
5. `docker-compose.yml` gets two services, `frontend-customer` (port 3001, as today) and `frontend-admin` (new port, e.g. 3002). Update `docker-compose.dev.yml`, `docker-compose.test.yml`, `example-deployment/` and `scripts/rollback.sh` (which needs an app argument).

### Phase 4 – CI (about half a day)

1. Turn the current build into a reusable workflow that takes the app name as input.
2. Add one caller workflow per app, triggered by path:

```yaml
# customer
paths: ['apps/customer/**', 'packages/shared/**', 'docker/**', 'package-lock.json']
# admin
paths: ['apps/admin/**', 'packages/shared/**', 'docker/**', 'package-lock.json']
```

3. Publish two images: `ghcr.io/<repo>/customer` and `ghcr.io/<repo>/admin`, each tagged with its own app version. Each pipeline runs the shared tests plus its own app's tests.

### Phase 5 – Production cutover (about half a day)

1. Start the admin container alongside the existing combined container. Nothing routes to it yet.
2. Add the proxy rule sending `/admin` and `/admin/*` to the admin container. From here the admin panel is served by the new app; the old container still serves the shop.
3. Verify: login, session refresh, logout, PDF and Excel export, image upload, push notification delivery and its deep link, the installed PWA.
4. Replace the combined container with the customer-only image.
5. Verify the shop: catalog, cart persistence, order submission, push subscribe from the footer, legal pages, `sitemap.xml`, `robots.txt`.

Rollback at any point: remove the proxy rule and redeploy the last combined image tag.

## Risks

| Risk | Mitigation |
|---|---|
| Import churn during file moves | Small batches; `tsc` and tests after each; freeze feature work on the files being moved |
| Service worker starts intercepting `/admin` navigations | No navigation fallback in `sw.ts`; add a test or a comment guarding this |
| `shared` grows until every change redeploys both apps | Decision 5; review additions to `shared` |
| Tailwind classes from `shared` missing in production builds | `@source` directive in each app; visual check of Button, Input, Modal |
| Admin static assets resolving against the customer container | All admin asset URLs go through `import.meta.env.BASE_URL`; check the network tab for non-`/admin/` requests |
| CSP differences between apps | Start with the same generated headers for both; tighten the customer policy later |

## Effort

About 3 to 5 focused days in total. Phase 0 is worth doing first and on its own.

## Open questions

- Which reverse proxy fronts the containers in production, and who adds the `/admin` rule?
- Should `robots.txt` on the customer site explicitly disallow `/admin`?
- Can the customer app's CSP drop `'wasm-unsafe-eval'` once the PDF renderer is admin-only? Needs testing.
