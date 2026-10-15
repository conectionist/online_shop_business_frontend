# Dependency Upgrade Plan

**Status:** analysis done, nothing applied yet
**Versions checked:** 2026-10-15, against the npm registry (they will drift, so re-check before each step)
**Starting point:** `package.json` at v4.0.1, commit `0174ed0`

## Summary

With every package at its latest version, the app type-checks, passes all 773 tests, builds, and renders the same in a browser. The PDF and Excel exports came out identical. Getting there takes 6 small code or config changes (see [Required changes](#required-code-and-config-changes)).

Two upgrades should wait:

- **MSW 3** breaks about half the test files. It's test-only, so the app itself isn't at risk.
- **TypeScript 7** type-checks the code fine, but typescript-eslint can't run on it yet.

Three dependencies are never imported and can be removed: `react-dropzone`, `@hookform/resolvers` and `xlsx`.

The Docker builder image `node:25-alpine` is end-of-life (Node 25 support ended 2026-06-01). Vitest 5 and jsdom 30 don't support it.

## How this was verified

Every upgrade was tried in Docker on a throwaway copy of the repo. Each scenario ran `npm install`, `tsc --noEmit`, the full Vitest suite and `vite build`.

Browser checks used headless Chromium (Playwright in Docker) against the local API on :8000:

- **Customer pages:** home, catalog, product, cart, order form, a legal (markdown) page, login, and the admin redirect.
- **A test page for the admin-only features**, running the real `OrdersPDF` and `ProductsTotalsPDF` components, the `xlsx-js-style` export code, dnd-kit drag-reorder, the Lightbox, react-markdown with GFM, and lucide icons.

The baseline, the minor/patch-only set and the all-latest set gave identical results, apart from one redrawn icon.

## Risk scale

| Rating | Meaning |
|---|---|
| **None** | Not imported, or already the latest version |
| **Low** | Works as-is, or needs a one-line change |
| **Medium** | Must be upgraded together with other packages, or needs config changes, but works |
| **High** | Breaks, and needs real work |

## Runtime dependencies

| Package | Current → Latest | What's new (short) | Risk |
|---|---|---|---|
| react / react-dom | 19.2.4 → 19.3.1 | `<ViewTransition>`, refs on Fragments, transitions render independently, many fixes. The Trusted Types integration has no effect because our CSP doesn't enable it | **Low** |
| react-router-dom | 7.13.0 → 7.18.4 (end of the v7 line) | Bug and security fixes | **Low** |
| ↳ react-router (v8) | → **8.4.0** | v8 **removes the `react-router-dom` package**, so imports move to `react-router`. ESM-only, needs Node ≥22.22 and React ≥19.2.7 | **Low**: an import rename in 52 files, after which everything passes |
| @tanstack/react-query (+ devtools) | 5.90.20 / 5.91.3 → 5.104.3 | New `queryClient.query()`. `fetchQuery`-style methods are deprecated but still work. Performance and bug fixes | **Low** |
| zustand | 5.0.11 → 5.0.15 | Fixes to the `persist` and `devtools` middleware | **Low** |
| react-hook-form | 7.71.1 → 7.90.0 | Form-level `validate`, `setValues`, `<FieldArray>`, `<ErrorMessage>`. Many fixes to dirty and error tracking. `dirtyFields` no longer lists `false` entries | **Low–Medium**: tests pass, but check the order form and admin forms by hand |
| @hookform/resolvers | 5.2.2 → 5.9.1 | New resolvers, Zod 4 fixes | **None**: never imported, remove it |
| zod | 4.3.6 → 4.6.7 | `z.compile()`, `.validate()`. String length now counts code points, datetimes require seconds, stricter string formats | **Low**: our schemas (`src/utils/validation.ts`) only use basic rules |
| react-dropzone | 14.4.0 → 20.1.3 | Six major versions: ESM-only, Node 22, typing changes | **None**: never imported, remove it |
| lucide-react | 0.563.0 → 1.57.0 | v1.0: brand icons removed, some icons renamed, `aria-hidden` set by default | **Low**: every icon we import still exists. The only visible change is the redrawn shopping-cart icon |
| axios | 1.13.4 → 1.20.0 | Many **security fixes** (prototype pollution, header injection, XSRF-token leak, SSRF). 1.15.1 changed the response-header types | **Low**, but needs a one-line fix in `api.ts:56`, otherwise `tsc` and the Docker build fail. Recommended for the security fixes |
| @react-pdf/renderer | 4.3.2 → 4.9.0 | Switched from its pdfkit fork to upstream pdfkit, reworked text layout, added PDF/A support and experimental pagination | **Low**: both of our PDFs came out **pixel-identical** |
| react-markdown | 10.1.0 | Already latest | **None** |
| remark-gfm | 4.0.1 | Already latest | **None** |
| xlsx | 0.18.5 (npm's latest) | SheetJS stopped publishing to npm; their real latest is 0.20.3 on cdn.sheetjs.com. 0.18.5 has known advisories (CVE-2023-30533, CVE-2024-22363) | **None**: never imported, remove it |
| xlsx-js-style | 1.2.0 | Already latest; unmaintained since 2022 | **None**: the Excel export also works with Vite 8 |
| yet-another-react-lightbox | 3.28.0 → 3.32.2 | `closeOnEscape` option, right-to-left fixes, zoom on custom slides | **Low**: opens and closes the same way |
| @dnd-kit/core, @dnd-kit/sortable | 6.3.1, 10.0.0 | Already latest. The successor `@dnd-kit/react` is still at 0.5 and isn't a drop-in replacement | **None** |

## Dev dependencies

| Package | Current → Latest | What's new (short) | Risk |
|---|---|---|---|
| vite | 7.3.1 → 8.3.4 | Rolldown and Oxc replace Rollup and esbuild. Build time went from 10 s to 1.9 s, and the main bundle from 4.24 MB to 3.80 MB. Default minimum browsers rise to **Safari 16.4 / Chrome 111 / Firefox 114** | **Medium**: needs Vitest ≥4, plugin-react 6 and a regenerated lockfile. Tests, build, dev server and browser checks all pass |
| @vitejs/plugin-react | 4.7.0 → 6.1.2 | Babel dropped; Oxc does the transform. v6 requires Vite 8 | **Medium**: upgrade together with Vite |
| vite-plugin-pwa | 1.2.0 → 2.0.0 | Vite 8 support arrived in 1.3; 2.0 itself changes little | **Low**: prints one harmless `inlineDynamicImports` deprecation warning |
| vitest / @vitest/ui | 3.2.4 → 5.0.4 | v4 rewrote spies and worker pools. v5 clears mocks between tests by default, fails un-awaited async assertions, and **doesn't support Node 25** | **Medium**: needs jest-dom 7 plus a one-line setup change (without it, 280 type errors fail the Docker build). On Node 24/26 all tests pass; on Node 25, 6 upload tests hang |
| @testing-library/jest-dom | 6.9.1 → 7.0.1 | `@testing-library/dom` must now be installed alongside it. Node 22+. New matchers. (6.10.0 is deprecated, so skip it) | **Low**: required by Vitest 5 |
| @testing-library/react | 16.3.2 → 16.3.3 | `act()` fix | **Low** |
| @testing-library/user-event | 14.6.1 → 14.6.8 | Fixes | **Low** |
| msw | 2.12.8 → 3.0.3 | ESM-only, Node 22, `onUnhandledRequest` renamed to `onUnhandledFrame`, cookie and fake-timer handling changed | **High (tests only)**: 28–29 of the 58 test files fail because mocked requests aren't intercepted under jsdom. Stay on 2.15.0 for now |
| jsdom | 27.2.0 → 30.1.3 | Rewritten CSS and XHR internals, new resource-loading API. Drops Node 25 | **Low**: all tests pass |
| typescript | 5.9.3 → 7.0.2 | 6.0 deprecates `baseUrl` and changes defaults. 7.0 is the native Go compiler (~10× faster); it removes `baseUrl` and has **no programmatic API** | **6.0 Low**: delete one tsconfig line. **7.0 Medium**: type-checks fine, but typescript-eslint only supports TS <6.1 |
| @types/react, @types/react-dom | 19.2.13 / 19.2.3 → 19.3.0 | Types for React 19.3 | **Low** |
| @types/node | 25.2.1 → 26.6.5 | Node 26 types | **Low**: match it to the Node major we run (25 and 26 both tested fine) |
| eslint | 9.39.2 → 10.12.0 | v9 is now flagged unsupported on npm. v10 **removes `.eslintrc` support** | **None for the app.** Lint already doesn't run today and needs an `eslint.config.js` ([trial config](#appendix-trial-eslintconfigjs)) |
| eslint-plugin-react-hooks | 5.2.0 → 7.1.1 | React Compiler rules are on by default | **None for the app**: about 21 new lint errors |
| eslint-plugin-react-refresh | 0.5.0 → 0.5.7 | Fixes, ESLint 10 support | **Low** |
| @typescript-eslint/eslint-plugin, @typescript-eslint/parser | 8.54.0 → 8.71.2 | ESLint 10 and TS 6 support (requires TS <6.1) | **Low** |
| tailwindcss, @tailwindcss/postcss | 4.1.18 → 4.3.3 | New utilities (scrollbar, zoom, logical properties) and colour palettes. Default font list changed | **Low**: screenshots are identical |
| postcss | 8.5.6 → 8.5.30 | Security fixes (`</style>` escaping, source-map file reads) | **Low** |
| autoprefixer | 10.4.24 → 10.6.1 | Small fixes | **Low** |

## Packages that must move together

- **react + react-dom**, along with `@types/react` and `@types/react-dom`.
- **Vite 8 + @vitejs/plugin-react 6 + Vitest ≥4.** Vitest 3's `@vitest/mocker` only accepts Vite ≤7, so npm refuses to install. Regenerate `package-lock.json` for this jump, or `npm install` fails with `ERESOLVE`. That matters because the Dockerfile runs `npm install`.
- **Vitest 5 + @vitest/ui 5 + jest-dom 7 + @testing-library/dom**, plus the setup import change, on Node 22, 24 or 26.
- **ESLint 10 + flat config + eslint-plugin-react-hooks 7 + eslint-plugin-react-refresh 0.5.x + @eslint/js + globals.**
- **TypeScript 6** requires removing `baseUrl`. **TypeScript 7** is blocked by typescript-eslint.
- **React Router 8** means swapping the package, which requires Node ≥22.22 and React ≥19.2.7.

## Required code and config changes

1. **axios ≥1.15.1:** `src/services/api.ts:56`
   ```ts
   // before
   const contentType = response.headers['content-type'] || '';
   // after
   const contentType = String(response.headers['content-type'] ?? '');
   ```
2. **TypeScript ≥6:** delete `"baseUrl": "."` from `tsconfig.json`. The `paths` entries already start with `./`, so nothing else changes.
3. **Vitest 5:** in `src/test/setup.ts`
   ```ts
   import '@testing-library/jest-dom/vitest'   // was: import '@testing-library/jest-dom'
   ```
4. **React Router 8:**
   - Replace `from 'react-router-dom'` with `from 'react-router'` in all 52 files. They are all plain import lines, with no mocks of the module.
   - In `src/test/testUtils.tsx`, import `RouterProvider` from `'react-router/dom'`.
5. **Docker:** in `Dockerfile`, change `FROM node:25-alpine AS builder` to `node:24-alpine`. Node 24 is LTS until 2028-04; `Dockerfile.dev` already uses it. Node 26 also passed every check and becomes LTS on 2026-10-28.
6. **Vite 8:** regenerate `package-lock.json`.
7. *(Optional, future-proofing)* In `vite.config.ts`, replace `__dirname` with `import.meta.dirname`. Vite 8 warns that a future major version will need this.

## Upgrade checklist

Run installs inside Docker, matching the project's workflow. Note that `node_modules` is currently root-owned. Example:

```bash
docker run --rm -v "$PWD":/app -w /app node:24-alpine npm install <pkg>@<version> ...
```

After each step:

- Run tests: `docker compose -f docker-compose.test.yml run --build --rm frontend-test`
- Type-check with `npx tsc --noEmit -p .` in the container
- Run the build, then the [manual checks](#manual-checks-after-each-step)

### Step 1: minor and patch upgrades (verified together, plus fix #1)

- [ ] Runtime: `react@^19.3.1 react-dom@^19.3.1 react-router-dom@^7.18.4 @tanstack/react-query@^5.104.3 @tanstack/react-query-devtools@^5.104.3 zustand@^5.0.15 react-hook-form@^7.90.0 zod@^4.6.7 lucide-react@^0.577.0 axios@^1.20.0 @react-pdf/renderer@^4.9.0 yet-another-react-lightbox@^3.32.2`
- [ ] Dev: `@types/react@^19.3.0 @types/react-dom@^19.3.0 @typescript-eslint/eslint-plugin@^8.71.2 @typescript-eslint/parser@^8.71.2 autoprefixer@^10.6.1 eslint-plugin-react-refresh@^0.5.7 postcss@^8.5.30 tailwindcss@^4.3.3 @tailwindcss/postcss@^4.3.3 vite@^7.3.7 vite-plugin-pwa@^1.3.0 vitest@^3.2.7 @vitest/ui@^3.2.7 @testing-library/react@^16.3.3 @testing-library/user-event@^14.6.8 msw@^2.15.0 jsdom@^27.4.0`
- [ ] Apply fix #1 (axios header typing)
- [ ] Verified result: 0 `tsc` errors after the fix, 773/773 tests, build OK, browser checks identical to the baseline

### Step 2: runtime platform and cleanup

- [ ] Docker builder to `node:24-alpine` (fix #5), with `@types/node` matched to Node 24 (`@types/node@^24`)
- [ ] Remove unused packages: `npm uninstall react-dropzone @hookform/resolvers xlsx`
- [ ] Declare dependencies that are imported but undeclared, which today only resolve through other packages: `workbox-core workbox-precaching workbox-routing workbox-strategies workbox-cacheable-response workbox-expiration` (imported by `src/sw.ts`) and `@dnd-kit/utilities` (imported by `ProductImagesManager.tsx`)
- [ ] `lucide-react@^1.57.0`
- [ ] `react-router@^8.4.0`, uninstall `react-router-dom`, and apply fix #4
- [ ] `jsdom@^30.1.3`

### Step 3: test and build tooling

- [ ] `vitest@^5.0.4 @vitest/ui@^5.0.4 @testing-library/jest-dom@^7.0.1 @testing-library/dom@^10.4.2`, then apply fix #3
- [ ] `vite@^8.3.4 @vitejs/plugin-react@^6.1.2 vite-plugin-pwa@^2.0.0`, regenerate the lockfile (fix #6), and optionally apply fix #7
- [ ] Decide on browser support. Vite 8 drops Safari <16.4 (iOS <16.4) by default. To keep the old targets, set `build.target: ['chrome107', 'edge107', 'firefox104', 'safari16']`
- [ ] `typescript@^6.0.3`, then apply fix #2

### Step 4: lint

- [ ] `eslint@^10.12.0 eslint-plugin-react-hooks@^7.1.1 @eslint/js@^10.0.1 globals@^17.13.0`
- [ ] Add `eslint.config.js` (see the [appendix](#appendix-trial-eslintconfigjs)) and delete `.eslintrc.cjs`
- [ ] Simplify the `lint` script to `eslint . --report-unused-disable-directives --max-warnings 0`
- [ ] Work through the findings. The trial run reported 401 errors and 16 warnings:

  | Count | Severity | Rule | Source |
  |---|---|---|---|
  | 355 | error | `@typescript-eslint/no-explicit-any` | Existing debt; the old config already enabled this rule |
  | 18 | error | `react-hooks/set-state-in-effect` | New in react-hooks 7 |
  | 12 | error | `@typescript-eslint/no-unused-vars` | |
  | 10 | error | `@typescript-eslint/ban-ts-comment` | |
  | 2 | error | `react-hooks/static-components` | New in react-hooks 7 |
  | 1 | error | `react-hooks/purity` | New in react-hooks 7 |
  | 3 | error | `no-undef`, `no-empty-object-type`, `no-useless-assignment` (1 each) | |
  | 4 | warning | `react-hooks/incompatible-library` | New in react-hooks 7 |
  | 5 | warning | `react-hooks/exhaustive-deps` | |
  | 5 | warning | `react-refresh/only-export-components` | |
  | 2 | warning | (no rule ID) | Probably unused `eslint-disable` comments |

### On hold

- [ ] **MSW 3:** needs investigation of jsdom/XHR interception. On Node 25 the error was `RequestInit: Expected signal ("AbortSignal {}") to be an instance of AbortSignal`; on the latest stack every request returns `ERR_NETWORK`. The 2→3 migration guide doesn't cover jsdom. Revisit after MSW 3.1 or later.
- [ ] **TypeScript 7:** wait until typescript-eslint supports it, which expects the new TS 7.1 API. Until then it can only run alongside TS 6 (`@typescript/typescript6`).

## Manual checks after each step

These couldn't be fully verified in the simulation:

- [ ] Place a real order while a list is published. This covers the order form, react-hook-form, zod and axios. Locally, no list was published, so add-to-cart wasn't reachable.
- [ ] Admin → list → orders tab: export the orders PDF and the totals PDF, and "Save as XLS". The components and export code were verified on a test page, but not via the real admin page, because no login was available.
- [ ] Admin → product images: drag to reorder (dnd-kit). Customer product page: open the lightbox.
- [ ] Login, logout, and the access-token refresh path (401 → refresh → retry in `api.ts`).
- [ ] PWA: the service worker installs and updates after a redeploy, and push notifications still arrive.
- [ ] After Vite 8: check on an older iPhone, or set `build.target` as described in step 3.

## Simulation results

Scenarios were run in Docker on a copy of the repo. "Step 1 set" means all minor and patch upgrades, before fix #1. "tsc errors" counts `error TS` lines.

| Scenario | Node | tsc errors | Tests | Build |
|---|---|---|---|---|
| Baseline (current versions) | 25 | 0 | 773/773 | OK |
| Step 1 set | 25 | 2 (axios, fix #1) | 773/773 | OK |
| + lucide 1.57 | 25 | 2 (axios) | 773/773 | OK |
| + React Router 8 (with import rename) | 25 | 2 (axios) | 773/773 | OK |
| + jsdom 30 | 25 | 2 (axios) | 773/773 | OK (engines warning) |
| + jest-dom 7 | 25 | 2 (axios) | 773/773 | OK |
| + @types/node 26 | 25 | 2 (axios) | 773/773 | OK |
| + react-dropzone 20 | 25 | 2 (axios) | 773/773 | OK |
| + plugin-react 5 (on Vite 7) | 25 | 2 (axios) | 773/773 | OK |
| + TypeScript 6 (`baseUrl` kept) | 25 | 1 (`baseUrl` deprecated) | 773/773 | OK |
| + TypeScript 6 (`baseUrl` removed) | 25 | 2 (axios) | 1 flaky timeout* | OK |
| + TypeScript 7 (`baseUrl` removed) | 25 | 2 (axios) | 773/773 | OK |
| + Vitest 4 | 25 | 2 (axios) | 6 upload tests hang | OK |
| + Vitest 5 (jest-dom 6) | 25 | 280 (jest-dom types) | 6 upload tests hang | OK |
| + Vitest 5 + jest-dom 7 (old setup import) | 24 | 280 (jest-dom types) | 773/773 | OK |
| + Vite 8 + plugin-react 6 + PWA 2 (on Vitest 3) | 25 | install fails (`ERESOLVE`) | – | – |
| Vite 8 stack + Vitest 5 + fix #3, fresh lockfile | 24 | 2 (axios) | 773/773 | OK |
| + jsdom 30 | 24 | 2 (axios) | 773/773 | OK |
| + MSW 3 | 24 | 2 (axios) | **28 of 58 files fail** | OK |
| MSW 3 only (on Vitest 3) | 25 | 2 (axios) | **29 of 58 files fail** | OK |
| **All latest except MSW 3 and TS 7, all fixes** | **24** | **0** | **773/773** | **OK** |
| Same | 26 | 0 | 773/773 | OK |

\* The test "Statistics page › top customers › says when the API maximum of 100 is reached" takes about 2 s even on the baseline and hits the 5 s timeout under load. It's pre-existing flakiness, unrelated to the upgrade.

Browser comparison (baseline vs step 1 set vs all latest):

- No console or page errors in any run.
- PDFs are pixel-identical and their extracted text matches.
- The XLSX has the same column widths, bold header and centered quantities.
- Drag-reorder, lightbox open/close-on-Esc and GFM markdown behave the same.
- The Vite 8 dev server works (ready in 279 ms).
- The only visual difference is lucide 1.x's redrawn shopping-cart icon.

## Other findings (pre-existing, not caused by the upgrade)

- **Lint doesn't run.** ESLint 9 finds no flat config, and `.eslintrc.cjs` can't resolve `@typescript-eslint/recommended`.
- **Totals PDF text layer.** Copy and search drop some capital letters (for example "âine" instead of "Pâine"). It looks correct visually, and is the same before and after the upgrade.
- **Undeclared imports.** `workbox-*` and `@dnd-kit/utilities` are imported but not declared (see step 2).
- **Large main bundle.** It is 4.2 MB, mostly react-pdf. Lazy-loading the PDF components would shrink it a lot.

## Appendix: trial `eslint.config.js`

This config ran successfully with ESLint 10, typescript-eslint 8.71, react-hooks 7 and react-refresh 0.5.7. It's a starting point; it was not tuned.

```js
import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'
import { reactRefresh } from 'eslint-plugin-react-refresh'
import globals from 'globals'

export default [
  { ignores: ['dist', 'node_modules', 'public'] },
  js.configs.recommended,
  ...tsPlugin.configs['flat/recommended'],
  reactHooks.configs.flat ? reactHooks.configs.flat.recommended : reactHooks.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: tsParser, globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-refresh': reactRefresh.plugin },
    rules: { 'react-refresh/only-export-components': ['warn', { allowConstantExport: true }] },
  },
]
```

## Sources

- Each package's GitHub releases or CHANGELOG, and the npm registry (versions, dates, peer dependencies, engines).
- [Vite 8 migration guide](https://vite.dev/guide/migration)
- [TypeScript 6.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/) and [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [MSW 2→3 migration guide](https://mswjs.io/docs/migrations/2.x-to-3.x)
- [Node.js release schedule](https://github.com/nodejs/Release/blob/main/schedule.json)
- SheetJS: [cdn.sheetjs.com](https://cdn.sheetjs.com/) and the [git.sheetjs.com tags](https://git.sheetjs.com/sheetjs/sheetjs/tags)
- Secondary write-ups: [Migrating to Vite 8 + Rolldown](https://certificates.dev/blog/migrating-to-vite-8-rolldown), [Vitest 5 changes](https://blog.openreplay.com/vitest-5-changes/)
