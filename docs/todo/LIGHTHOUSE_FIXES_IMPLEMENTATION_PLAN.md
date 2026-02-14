# Lighthouse Fixes Implementation Plan

**Date:** 2026-02-14
**Baseline Report:** `temp1/localhost_3001-20260214T131012.json`
**Tested URL:** `http://localhost:3001/` (mobile emulation, Lighthouse 13.0.1)

## Baseline Scores

| Category | Score | Target |
|----------|------:|-------:|
| Performance | 48 | 90+ |
| Accessibility | 68 | 95+ |
| Best Practices | 88 | 100 |
| SEO | 100 | 100 |

## Baseline Core Web Vitals

| Metric | Current | Good Threshold | Status |
|--------|--------:|--------------:|--------|
| FCP | 7.7s | < 1.8s | FAIL |
| LCP | 10.5s | < 2.5s | FAIL |
| TBT | 380ms | < 200ms | Needs Work |
| CLS | 0 | < 0.1 | PASS |
| SI | 7.7s | < 3.4s | FAIL |

---

## Phase 1: Route-Based Code Splitting (Performance - High Impact)

**Problem:** All 26 routes are statically imported in `src/App.tsx`. The entire app ships as a single 1.26 MB JS bundle (`index-DlP5CAvA.js`), of which 64.7% (757 KiB) is unused on initial page load. This is the single biggest contributor to the 7.7s FCP and 10.5s LCP.

**Estimated Impact:** ~3,750ms reduction in FCP/LCP

### 1.1 Lazy-load all route components

**File:** `src/App.tsx`

Replace all static page imports (lines 6-47) with `React.lazy()`:

```typescript
import { lazy, Suspense } from 'react';

// Public routes
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const CartPage = lazy(() => import('./pages/customer/CartPage'));
const OrderForm = lazy(() => import('./pages/customer/OrderForm'));
const OrderConfirmation = lazy(() => import('./pages/customer/OrderConfirmation'));
const ProductPage = lazy(() => import('./pages/customer/ProductPage'));
const CatalogPage = lazy(() => import('./pages/customer/CatalogPage'));
const CategoryCatalogPage = lazy(() => import('./pages/customer/CategoryCatalogPage'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const CookiesPolicy = lazy(() => import('./pages/legal/CookiesPolicy'));
const ReturnsPolicy = lazy(() => import('./pages/legal/ReturnsPolicy'));
const TermsAndConditions = lazy(() => import('./pages/legal/TermsAndConditions'));
const ContactPage = lazy(() => import('./pages/customer/ContactPage'));

// Admin routes (all behind ProtectedRoute - definitely lazy)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const CategoriesList = lazy(() => import('./pages/admin/CategoriesList'));
const CategoryForm = lazy(() => import('./pages/admin/CategoryForm'));
const ProductsList = lazy(() => import('./pages/admin/ProductsList'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const UnitsList = lazy(() => import('./pages/admin/UnitsList'));
const UnitForm = lazy(() => import('./pages/admin/UnitForm'));
const DeliverySchedulesList = lazy(() => import('./pages/admin/DeliverySchedulesList'));
const DeliveryScheduleForm = lazy(() => import('./pages/admin/DeliveryScheduleForm'));
const DeliveryTypesList = lazy(() => import('./pages/admin/DeliveryTypesList'));
const DeliveryTypeForm = lazy(() => import('./pages/admin/DeliveryTypeForm'));
const PaymentMethodsList = lazy(() => import('./pages/admin/PaymentMethodsList'));
const PaymentMethodForm = lazy(() => import('./pages/admin/PaymentMethodForm'));
const BusinessDetailsList = lazy(() => import('./pages/admin/BusinessDetailsList'));
const BusinessDetailsForm = lazy(() => import('./pages/admin/BusinessDetailsForm'));
const SecurityPage = lazy(() => import('./pages/admin/SecurityPage'));
const SessionsList = lazy(() => import('./pages/admin/SessionsList'));
const ListsList = lazy(() => import('./pages/admin/ListsList'));
const ListForm = lazy(() => import('./pages/admin/ListForm'));
const ListProducts = lazy(() => import('./pages/admin/ListProducts'));
const ListManagement = lazy(() => import('./pages/admin/ListManagement'));
const AdvancedOperations = lazy(() => import('./pages/admin/AdvancedOperations'));
const NotificationsHome = lazy(() => import('./pages/admin/NotificationsHome'));
const MySubscriptions = lazy(() => import('./pages/admin/MySubscriptions'));
```

### 1.2 Add Suspense boundary

Wrap `<Routes>` in a `<Suspense>` fallback:

```tsx
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    {/* ... all routes ... */}
  </Routes>
</Suspense>
```

Create a minimal `LoadingSpinner` component (or reuse an existing one) that renders a lightweight loading indicator without pulling in large dependencies.

### 1.3 Verify chunk output

After building, verify Vite produces separate chunks per route:

```bash
npm run build
ls -la dist/assets/*.js | wc -l   # should be many files now, not 1
du -sh dist/assets/*.js | sort -rh | head -20
```

**Expected result:** The initial bundle should drop well below 500 KiB, with each route loading its own chunk on demand.

---

## Phase 2: Render-Blocking Resource Optimization (Performance)

**Estimated Impact:** ~300ms reduction in FCP

### 2.1 Defer `config.js` loading

**Problem:** `config.js` (1.2 KiB) is render-blocking, adding 300ms to FCP.

**File:** `index.html` (line 29)

Change from:
```html
<script src="/config.js"></script>
```

To:
```html
<script src="/config.js" defer></script>
```

**Caveat:** Verify that `src/utils/appConfig.ts` handles the case where `window.__RUNTIME_CONFIG__` may not be set yet at import time. Since `appConfig.ts` reads the config synchronously at module load, and `defer` still executes before `DOMContentLoaded`, this should work. Test thoroughly.

If `defer` causes timing issues, an alternative is to inline the config:

**File:** `docker-entrypoint.sh` — instead of writing a separate file, inject the config directly into index.html as a nonce-tagged inline script. This eliminates the network request entirely.

### 2.2 Add preconnect to API origin

**File:** `index.html` — add inside `<head>`:

```html
<link rel="preconnect" href="${VITE_API_BASE_URL}" crossorigin>
```

Since the API URL is dynamic (set at container start), this should be injected by `docker-entrypoint.sh` alongside the existing nonce replacements:

```bash
# In docker-entrypoint.sh, add a preconnect link injection
sed -i "s|<!-- PRECONNECT_PLACEHOLDER -->|<link rel=\"preconnect\" href=\"${VITE_API_BASE_URL}\" crossorigin>|g" ...
```

Or add a static placeholder in `index.html`:

```html
<!-- PRECONNECT_PLACEHOLDER -->
```

**Estimated Impact:** ~150ms LCP improvement

---

## Phase 3: Accessibility Fixes (Accessibility - 68 → 95+)

### 3.1 Fix 68 unnamed buttons (Serious)

**Problem:** Quantity +/- buttons only contain icons (`<Minus>`, `<Plus>`) with no accessible name.

**Files to update:**
- `src/pages/WelcomePage.tsx` (lines 503-524)
- `src/pages/customer/CatalogPage.tsx` (lines 708-729)
- `src/pages/customer/CategoryCatalogPage.tsx` (equivalent section)

**Fix:** Add `aria-label` to each button:

```tsx
<Button
  variant="secondary"
  size="sm"
  onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) - 1)}
  disabled={(quantities[product.id] || 1) <= 1}
  className="w-10 h-10 p-0 rounded-full"
  aria-label={`Scade cantitatea pentru ${product.nume}`}
>
  <Minus className="w-4 h-4" />
</Button>

{/* ... quantity display ... */}

<Button
  variant="secondary"
  size="sm"
  onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) + 1)}
  className="w-10 h-10 p-0 rounded-full"
  aria-label={`Crește cantitatea pentru ${product.nume}`}
>
  <Plus className="w-4 h-4" />
</Button>
```

Also add aria-label to the "Add to cart" button if it only contains an icon.

### 3.2 Fix color contrast failures (Serious — 48 elements)

**Problem:** `text-amber-600` (#d97706 / displayed as #e17100) on white background has a contrast ratio of 3.2:1. WCAG AA requires 4.5:1 for normal text.

**Solution:** Replace `text-amber-600` with `text-amber-800` (#92400e, contrast ~7.5:1) or `text-amber-700` (#b45309, contrast ~5.2:1) for text on white backgrounds.

**Files to update:**

1. **`src/utils/theme.ts`** (line 28) — update the theme token so all themed uses change at once:
   ```typescript
   // Change:
   secondary: 'text-amber-600'
   // To:
   secondary: 'text-amber-700'
   ```

2. **Direct usages** — search for and update all hardcoded `text-amber-600` on white/light backgrounds:
   - `src/pages/WelcomePage.tsx` — price labels (line 494), "Arată mai mult/puțin" buttons (lines 235, 463, 481)
   - `src/pages/customer/CatalogPage.tsx` — price labels, expand buttons
   - `src/pages/customer/CategoryCatalogPage.tsx` — same pattern

**Verification:** Use a contrast checker to confirm the chosen shade passes WCAG AA (4.5:1 for normal text, 3:1 for large text).

| Color | Hex | Contrast on White | WCAG AA |
|-------|-----|-------------------:|---------|
| amber-600 | #d97706 | 3.2:1 | FAIL |
| amber-700 | #b45309 | 5.2:1 | PASS |
| amber-800 | #92400e | 7.5:1 | PASS |

**Recommendation:** Use `text-amber-700` — it's the minimum change that passes while staying visually close to the current design.

### 3.3 Fix 2 unnamed links (Serious)

**Cart link — File:** `src/pages/WelcomePage.tsx` (lines 262-271)

```tsx
<Link to="/cart" aria-label="Coș de cumpărături">
  <div className={components.interactive.floatingCart}>
    <ShoppingCart className="h-6 w-6 text-amber-700" />
    {/* badge */}
  </div>
</Link>
```

**Product image link** — if the image-only `<Link>` lacks text, add:

```tsx
<Link
  to={`/product/${product.id}`}
  className="block"
  aria-label={product.nume}
>
```

Also check the same link patterns in `CatalogPage.tsx` and `CategoryCatalogPage.tsx`.

### 3.4 Fix heading hierarchy (Moderate)

**Problem:** `<h4>` used for category headings directly under `<h1>`, skipping h2 and h3.

**File:** `src/pages/WelcomePage.tsx` (line 381)

Change:
```tsx
<h4 className="text-lg font-bold text-amber-800">
```
To:
```tsx
<h2 className="text-lg font-bold text-amber-800">
```

Apply the same fix in `CatalogPage.tsx` and `CategoryCatalogPage.tsx`.

### 3.5 Add `<main>` landmark (Moderate)

**File:** `src/components/layout/AppLayout.tsx`

```tsx
const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
```

Change the inner `<div className="flex-1">` to `<main className="flex-1">`.

---

## Phase 4: Best Practices Fixes (Best Practices — 88 → 100)

### 4.1 Fix CSP nonce violations (3 inline scripts)

**Problem:** 3 inline scripts in `index.html` (lines 29, 39, 61) are blocked by the Content Security Policy. The `nonce="CSP_NONCE_PLACEHOLDER"` tokens are likely not being replaced correctly in all environments.

**File:** `docker-entrypoint.sh`

**Debug steps:**
1. Check that the sed replacement for `CSP_NONCE_PLACEHOLDER` covers ALL inline `<script>` tags
2. Ensure the nonce generated matches exactly what's in the CSP header
3. Verify that the replacement happens AFTER the CSP header nonce is set

**Fix:** Audit the sed commands in `docker-entrypoint.sh` to ensure every inline script tag has its `CSP_NONCE_PLACEHOLDER` replaced with the generated `$CSP_NONCE`. Ensure there are no whitespace or quoting mismatches.

If the issue is specific to the dev/preview server (which doesn't run `docker-entrypoint.sh`), add a Vite plugin to inject nonces during development, or skip CSP enforcement in dev.

### 4.2 Fix ANPC image aspect ratios

**Problem:** `anpc-sol.png` and `anpc-sal.png` have natural aspect ratios that don't match their forced `250px × 50px` display size.

**File:** `src/components/layout/Footer.tsx` (lines 177-184, 192-199)

**Options (pick one):**

**Option A — Use `object-fit: contain`** (preserve original proportions):
```tsx
<img
  decoding="async"
  style={{ width: '250px', height: '50px', objectFit: 'contain' }}
  src="/anpc-sal.png"
  alt="Soluționarea Alternativă a Litigiilor"
/>
```

**Option B — Resize the source images** to exactly 250×50 so there's no mismatch.

**Option C — Remove fixed height** and let the image scale naturally:
```tsx
<img
  decoding="async"
  className="rounded shadow-sm w-[250px] h-auto"
  src="/anpc-sal.png"
  alt="Soluționarea Alternativă a Litigiilor"
/>
```

**Recommendation:** Option A is the least-effort fix that passes the audit.

### 4.3 Add source maps for production build

**File:** `vite.config.ts`

```typescript
export default defineConfig({
  build: {
    sourcemap: true,  // or 'hidden' to avoid exposing to end users
  },
  // ... rest of config
})
```

Using `'hidden'` generates source maps but doesn't reference them in the built files, so they're available for error monitoring but not exposed in DevTools.

---

## Phase 5: Image Optimization (Performance)

**Problem:** 34 product images are served as unoptimized JPEGs, oversized (800×800 served for 324×324 display), and with no caching (`cache-control` TTL of 0). Total waste: ~2,598 KiB.

**Estimated Impact:** Significant reduction in total page weight; improved LCP for image-heavy pages.

### 5.1 Serve responsive images (frontend changes)

**Files:** `src/pages/WelcomePage.tsx`, `CatalogPage.tsx`, `CategoryCatalogPage.tsx`

If the backend supports image size parameters (e.g., `/media/products/{id}?w=324`), request appropriately sized images for card thumbnails.

Check the `getProductImageUrl()` utility function to see if an `imageSize` parameter is already supported and adjust accordingly. If the backend returns images at a fixed size, this requires a backend change to serve resized variants.

### 5.2 Serve modern image formats (backend change)

The backend image API should serve WebP or AVIF when the client supports it (via `Accept` header negotiation). This is a backend task and out of scope for this frontend plan, but it should be communicated to the backend team.

### 5.3 Add cache headers for product images (backend/infra change)

Product images from `localhost:8000` are served with `cache-control` TTL of 0. The backend/CDN should set appropriate cache headers:

```
Cache-Control: public, max-age=86400, immutable
```

This is a backend/infrastructure task. Frontend can add preloading hints for above-the-fold images:

```tsx
<link rel="preload" as="image" href={heroImageUrl} />
```

### 5.4 Add explicit width/height to prevent layout shift

Product card images should have explicit `width` and `height` attributes or use CSS `aspect-ratio` to reserve space:

```tsx
<img
  src={getProductImageUrl(product, imageSize)}
  alt={product.nume}
  className="w-full h-full object-cover"
  width={324}
  height={324}
  loading="lazy"
/>
```

Add `loading="lazy"` to all images below the fold.

---

## Phase 6: Caching & Delivery (Performance)

### 6.1 Fix back/forward cache (bfcache)

**Problem:** Page is ineligible for bfcache due to `Cache-Control: no-store` on the main document.

**File:** `nginx.conf` or `nginx-security-headers.conf`

For the HTML document, change:
```
Cache-Control: no-store
```
To:
```
Cache-Control: no-cache
```

`no-cache` still revalidates with the server on each visit but allows bfcache. `no-store` completely prevents caching and bfcache.

**Note:** Only change this for the HTML document, not for API responses that contain sensitive data.

---

## Implementation Order & Priority

| Priority | Phase | Effort | Scope | Risk | Expected Score Impact |
|----------|-------|--------|-------|------|----------------------|
| 1 | Phase 1: Code Splitting | Medium | Frontend only | **Medium-High** — No ErrorBoundary = white screen on chunk failure; PWA update race condition | Performance: 48 → ~70-75 |
| 2 | Phase 3: Accessibility | Low | Frontend only | **Low** — Visual color change needs stakeholder approval | Accessibility: 68 → 95+ |
| 3 | Phase 2: Render-Blocking | Low | Frontend + Docker | **High** — Breaks Rybbit analytics silently; Plausible loses configured domain | Performance: +5-10 pts |
| 4 | Phase 4: Best Practices | Low-Medium | Frontend + Docker + Nginx | **Medium** — Source maps expose code; CSP issue may be dev-only | Best Practices: 88 → 100 |
| 5 | Phase 5: Image Optimization | Medium-High | Frontend + Backend + Infra | **Medium** — `loading="lazy"` on above-fold images worsens LCP; responsive images & WebP need backend support | Performance: +5-10 pts |
| 6 | Phase 6: Caching | Low | Nginx only | **Low-Medium** — Back/forward after deploy could hit stale chunk references | Performance: +2-5 pts |

**Combined target:** Performance 85-90+, Accessibility 95+, Best Practices 100, SEO 100

---

## Verification

After implementing all phases, re-run the Lighthouse audit:

```bash
lighthouse http://localhost:3001 --output=json --output=html \
  --output-path=./temp1/lighthouse-post-fixes \
  --chrome-flags="--headless=new"
```

Compare against baseline scores and metrics documented above.
