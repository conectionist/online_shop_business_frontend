### Monorepo migration plan (admin, public, shared)

This document describes how to split the current frontend into a monorepo with three parts while keeping developer experience smooth and changes incremental.

Goals
- Separate deployable apps: admin and public (user-facing)
- Extract cross-cutting code into a shared package
- Keep Docker-first workflows, environment-driven config, and no hardcoded URLs
- Minimize downtime and enable baby-steps roll-out

Non-goals
- Backend changes
- Major UI redesign

Proposed structure
```text
repo-root/
  apps/
    admin/
      package.json
      index.html
      vite.config.ts
      tsconfig.json
      src/
        main.tsx
        App.tsx
        components/layout/{AdminLayout.tsx,AdminPageHeader.tsx,Header.tsx}
        components/features/admin/**
        pages/admin/**
        sw.ts
    public/
      package.json
      index.html
      vite.config.ts
      tsconfig.json
      src/
        main.tsx
        App.tsx
        components/layout/{AppLayout.tsx,Footer.tsx}
        pages/{WelcomePage.tsx,LoginPage.tsx,customer/**,legal/**,ContactPage.tsx,...}
        sw.ts
  packages/
    shared/
      package.json
      tsconfig.json
      src/
        components/ui/**
        components/{SEO.tsx,MarkdownPage.tsx}
        hooks/**
        services/**
        stores/**
        types/**
        utils/**
        lib/**
        route/{ProtectedRoute.tsx}
        app/{AuthInitializer.tsx,ScrollToTop.tsx}
  package.json           # workspaces + root scripts
  tsconfig.base.json     # shared compiler options
  docker-compose.yml     # two web services (admin, public)
  .env*, .env.admin*, .env.public*
```

High-level phases
1) Workspace scaffolding (monorepo) and app skeletons
2) Extract shared code into `packages/shared`
3) Wire admin app
4) Wire public app
5) Namespace storage keys and service worker scopes
6) Docker compose split and dev/prod flows
7) CI/CD and release/versioning
8) Cutover and cleanup

Detailed plan

Phase 0 – Preconditions & branching
- Create a feature branch (e.g., `feat/monorepo-admin-public-shared`).
- Freeze releases during directory moves to avoid painful rebases.
- Ensure all envs and API URLs are read from environment variables, not hardcoded.

Phase 1 – Workspace scaffolding
- Convert to npm workspaces (keeps current npm flow) or pnpm. Example (npm):
```json
{
  "name": "online-shop-business-frontend",
  "private": true,
  "workspaces": ["apps/*", "packages/*"]
}
```
- Add `tsconfig.base.json` with shared options and path aliases:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["packages/shared/src/*"]
    }
  }
}
```
- Scaffold `apps/admin` and `apps/public` with minimal Vite + React setups. Each app should import from `@shared/*` only for shared code.

Phase 2 – Extract shared package
- Move the following from current `src/` into `packages/shared/src/`:
  - `components/ui/**`
  - `components/SEO.tsx`, `components/MarkdownPage.tsx` (if used in both)
  - `hooks/**`
  - `services/**`
  - `stores/**` (will be slightly adjusted; see Phase 5)
  - `types/**`
  - `utils/**`
  - `lib/**`
  - `components/{ProtectedRoute.tsx}` → consider `route/ProtectedRoute.tsx`
  - `components/{AuthInitializer.tsx,ScrollToTop.tsx}` → consider `app/`
- `packages/shared/package.json` example:
```json
{
  "name": "@online-shop/shared",
  "version": "0.1.0",
  "private": false,
  "type": "module",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc -p tsconfig.json"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  }
}
```
- `packages/shared/tsconfig.json` should extend `../../tsconfig.base.json` and output to `dist/`.

Phase 3 – Wire the admin app
- Move admin-only code into `apps/admin/src/`:
  - `pages/admin/**`
  - `components/layout/AdminLayout.tsx`, `components/layout/AdminPageHeader.tsx`, `components/layout/Header.tsx`
  - `components/features/admin/**`
- Create `apps/admin/src/App.tsx` with only admin routes (no public routes).
- Add `vite.config.ts` with alias for `@shared` and app-only aliases.
- Add service worker `src/sw.ts` with admin-specific cache names (see Phase 5).

Phase 4 – Wire the public app
- Move public-only code into `apps/public/src/`:
  - `pages/customer/**` + public landing, login, and legal pages
  - `components/layout/AppLayout.tsx`, `components/layout/Footer.tsx`
- Create `apps/public/src/App.tsx` with only public routes.
- Add `vite.config.ts` with alias for `@shared` and app-only aliases.
- Add service worker `src/sw.ts` with public-specific cache names (see Phase 5).

Phase 5 – Storage keys and service workers
- Namespace persisted storage keys to avoid collisions when both apps share the same origin:
  - `auth-storage` → `auth-storage-admin` (admin) and `auth-storage-public` (public)
  - `cart-storage` → `cart-storage-public` (public only)
- Adjust SW cache names and scopes to be app-specific:
  - Admin example: `api-cache-admin`, `images-cache-admin`
  - Public example: `api-cache-public`, `images-cache-public`
- Register SW under app-specific scope: e.g., serve admin app at `/admin` and register `/admin/sw.js` so the scope stays confined.

Phase 6 – Docker compose and envs
- Create separate services for admin and public in `docker-compose.yml`:
```yaml
services:
  web-admin:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        APP_DIR: apps/admin
    environment:
      - VITE_API_BASE_URL=${VITE_API_BASE_URL}
    ports:
      - "3001:3000"
    command: ["npm", "run", "preview", "--workspace", "admin"]

  web-public:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        APP_DIR: apps/public
    environment:
      - VITE_API_BASE_URL=${VITE_API_BASE_URL}
    ports:
      - "3000:3000"
    command: ["npm", "run", "preview", "--workspace", "public"]
```
- Provide `.env.admin*` and `.env.public*` files as needed; keep URLs and secrets in envs only.
- Ensure Nginx (or equivalent) routes `/admin/*` to the admin app assets and `/` to public assets.

Phase 7 – CI/CD and versioning
- Build order: `shared` → `admin` and `public` (both depend on `shared`).
- Cache `node_modules` and `shared/dist` between steps.
- Build and push Docker images for each app separately.
- Versioning & changelog:
  - Bump minor version when adding features.
  - Write human-friendly changelog entries.
  - Tag releases per app if desired (e.g., `admin@2.36.0`, `public@2.36.0`) while keeping a top-level app version if you prefer.
- Tests:
  - Run unit/integration tests per workspace before releasing; avoid mocks where practical.

Phase 8 – Cutover & cleanup
- Dry-run builds locally via Docker for both apps.
- Deploy admin under `/admin` and public under `/`.
- Verify SW scopes, auth flows, and storage isolation.
- Remove dead imports and aliases from each app.

Key code adjustments (examples)
- Update imports from `@/...` to `@shared/...` where code moved to `packages/shared`.
- Per-app aliases for local pages and components:
```ts
// vite.config.ts (per app)
resolve: {
  alias: {
    '@shared': path.resolve(__dirname, '../../packages/shared/src'),
    '@app': path.resolve(__dirname, './src'),
  }
}
```
- Storage keys:
```ts
// Example (public):
persist(
  (set, get) => ({ /* ... */ }),
  { name: 'cart-storage-public' }
)
```
- Service worker cache names:
```ts
new NetworkFirst({ cacheName: 'api-cache-public', /* ... */ })
```

Theming guidance
- Keep the centralized theme system for user/public pages; admin can use a minimal or separate styling system.

Rollout strategy (baby steps)
1) Scaffold workspaces and add `packages/shared` without moving code; verify builds.
2) Move `utils`, `types`, `lib`, and `components/ui` to `shared`; fix imports.
3) Move `services` and `hooks` to `shared`; fix imports.
4) Create `apps/admin` with admin-only routes; point to shared; build and run in Docker.
5) Namespace storage keys and admin SW; smoke test.
6) Create `apps/public`; wire routes; build and run in Docker.
7) Namespace public SW and storage; smoke test.
8) CI/CD pipelines for both apps; add release notes and version bumps.
9) Switch production routing to two apps; monitor and then remove legacy paths if any.

Risk and mitigations
- Import churn: perform moves in small batches; rely on workspace path aliases.
- SW scope collisions: register under distinct scopes and unique cache names.
- LocalStorage collisions: namespace persist keys per app.
- CI complexity: build order and caches; keep shared small and fast to build.

Time estimate
- Monorepo split (workspaces + shared + two apps): ~2–4 days total including Docker and CI.

Open questions
- Package manager: npm vs pnpm.
- Bundling for `shared`: tsc-only vs tsup.
- Release versioning per app vs single top-level version.

Appendix: example root scripts
```json
{
  "scripts": {
    "build": "npm run build --workspaces",
    "build:shared": "npm run build -w @online-shop/shared",
    "build:admin": "npm run build -w admin",
    "build:public": "npm run build -w public",
    "dev:admin": "npm run dev -w admin",
    "dev:public": "npm run dev -w public",
    "test": "npm run test --workspaces"
  }
}
```


