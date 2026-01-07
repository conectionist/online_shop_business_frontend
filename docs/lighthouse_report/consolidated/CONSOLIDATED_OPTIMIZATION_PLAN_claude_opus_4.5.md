# Consolidated Lighthouse Optimization Plan

**Date:** January 7, 2026  
**Source:** Combined analysis from 4 AI-generated optimization plans  
**Approach:** Baby steps with high-impact-first prioritization

---

## Executive Summary

| Category | Current Score | Target Score | Status |
|----------|---------------|--------------|--------|
| **Performance** | **29** | 75-90 | 🔴 Critical |
| Accessibility | 69 | 85-90 | 🟠 Needs Work |
| Best Practices | 93 | 95+ | 🟢 Good |
| SEO | 98 | 98+ | 🟢 Excellent |
| PWA | 63 | 80-90 | 🟠 Needs Work |

### Core Web Vitals

| Metric | Current | Target (Good) | Status |
|--------|---------|---------------|--------|
| **FCP** (First Contentful Paint) | **7.7s** | < 1.8s | 🔴 Critical |
| **LCP** (Largest Contentful Paint) | **9.0s** | < 2.5s | 🔴 Critical |
| **CLS** (Cumulative Layout Shift) | **0.699** | < 0.1 | 🔴 Critical |
| **TBT** (Total Blocking Time) | 270ms | < 200ms | 🟡 Acceptable |
| **Speed Index** | 7.7s | < 3.4s | 🔴 Poor |
| **TTI** (Time to Interactive) | 10.1s | < 3.8s | 🔴 Critical |

### Root Cause Summary

| Issue | Impact | Savings Potential |
|-------|--------|-------------------|
| Oversized images (loading `original` instead of `thumbnail`) | 🔴 Critical | 3,766 KiB (~19s) |
| Unused JavaScript (62.7% of 1.1MB bundle) | 🔴 High | 701 KiB (~3.5s) |
| No modern image formats (WebP/AVIF) | 🟠 Medium | 1,288 KiB (~6.7s) |
| CLS from unsized images | 🔴 Critical | N/A (visual stability) |
| No code splitting | 🔴 High | 60-70% bundle reduction |

---

## Phase 1: Quick Wins (1-2 days)

**Expected Impact: +30-40 performance points**

### Step 1.1: Use Proper Image Sizes (HIGHEST IMPACT)

**The Problem:** Images are loaded at full resolution (2.7MB for a 324x324px display = 97% wasted bytes)

**Root Cause:** In `CatalogPage.tsx` line 385:
```tsx
src={getProductImageUrl(product, 'original')}  // ❌ Loading full resolution
```

**The Fix:**
```tsx
src={getProductImageUrl(product, 'thumbnail')}  // ✅ Use optimized size
// or 'medium' if thumbnail is too small for the display
```

**Files to Update:**
| File | Line | Change |
|------|------|--------|
| `src/pages/customer/CatalogPage.tsx` | ~385 | `'original'` → `'thumbnail'` |
| `src/pages/WelcomePage.tsx` | ~403 | `'original'` → `'thumbnail'` |
| `src/pages/customer/ProductPage.tsx` | ~273 | `'original'` → `'medium'` |

**Expected Savings:** 3,766 KiB (~3.7 MB), ~19s faster load

---

### Step 1.2: Add Lazy Loading to Images

```tsx
<img
  src={getProductImageUrl(product, 'thumbnail')}
  alt={product.nume}
  loading="lazy"  // ✅ Add this
  className="w-full h-full object-cover"
/>
```

**Expected Savings:** 71 KiB deferred, faster initial paint

---

### Step 1.3: Fix CLS with Explicit Dimensions

**The Problem:** CLS of 0.699 is 7x worse than the 0.1 threshold

**The Fix:**
```tsx
<div className="aspect-square relative">
  <img
    src={getProductImageUrl(product, 'thumbnail')}
    alt={product.nume}
    width={324}   // ✅ Explicit dimensions
    height={324}  // ✅ Prevents layout shift
    loading="lazy"
    className="w-full h-full object-cover"
  />
</div>
```

---

### Step 1.4: Fix Accessibility Quick Wins

#### Missing Button Names
```tsx
// Before:
<button className="..." disabled>
  <ChevronLeft />
</button>

// After:
<button className="..." disabled aria-label="Pagina anterioară">
  <ChevronLeft />
</button>
```

#### Missing Link Names
```tsx
// Before:
<a href="/cart" data-discover="true">
  <ShoppingCart />
</a>

// After:
<a href="/cart" aria-label="Coș de cumpărături" data-discover="true">
  <ShoppingCart />
  <span className="sr-only">Coș de cumpărături</span>
</a>
```

#### Color Contrast
```tsx
// Before: amber-600 has contrast 3.19:1 (fails WCAG AA)
<span className="text-lg font-bold text-amber-600">

// After: amber-700 meets 4.5:1 requirement
<span className="text-lg font-bold text-amber-700">
```

---

## Phase 2: Code Splitting (2-3 days)

**Expected Impact: +10-15 performance points**

### Step 2.1: Route-Based Code Splitting

**The Problem:** 
- Main bundle: 1,149 KiB
- Unused JavaScript: 718 KiB (62.7%)
- Heavy deps loading everywhere: `@react-pdf/renderer`, `xlsx`, `yet-another-react-lightbox`

**The Fix in `App.tsx`:**
```tsx
import { lazy, Suspense } from 'react';

// ❌ Before: Static imports load everything
import AdminPanel from './pages/admin/AdminPanel';
import CatalogPage from './pages/customer/CatalogPage';

// ✅ After: Dynamic imports create separate chunks
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));
const CatalogPage = lazy(() => import('./pages/customer/CatalogPage'));
const CartPage = lazy(() => import('./pages/customer/CartPage'));
const ProductPage = lazy(() => import('./pages/customer/ProductPage'));

// Wrap in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/admin/*" element={<AdminPanel />} />
    <Route path="/catalog" element={<CatalogPage />} />
    <Route path="/cart" element={<CartPage />} />
  </Routes>
</Suspense>
```

**Expected Impact:**
- Initial bundle: 1.1MB → 200-400KB (65-80% reduction)
- Customer pages won't load admin code
- Admin pages won't load PDF/Excel until needed

---

### Step 2.2: Vite Manual Chunks Configuration

**Add to `vite.config.ts`:**
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        pdf: ['@react-pdf/renderer'],
        excel: ['xlsx', 'xlsx-js-style'],
        gallery: ['yet-another-react-lightbox'],
        dnd: ['@dnd-kit/core', '@dnd-kit/sortable']
      }
    }
  }
}
```

---

### Step 2.3: Lazy Load Heavy Dependencies

```tsx
// ❌ Before: PDF library loads on every page
import { PDFDocument } from '@react-pdf/renderer';

// ✅ After: Load only when user clicks "Generate PDF"
const generatePDF = async () => {
  const { PDFDocument } = await import('@react-pdf/renderer');
  // ... generate PDF
};
```

---

## Phase 3: PWA & Advanced Optimizations (1-2 days)

**Expected Impact: +10-15 points**

### Step 3.1: Configure vite-plugin-pwa

**In `vite.config.ts`:**
```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Online Shop Business',
        short_name: 'Shop',
        description: 'Magazin online',
        start_url: '/',
        display: 'standalone',
        theme_color: '#d97706', // amber-600
        background_color: '#ffffff',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ]
});
```

### Step 3.2: Add Theme Color & Preconnect

**In `index.html`:**
```html
<head>
  <meta name="theme-color" content="#d97706">
  <link rel="preconnect" href="http://localhost:8000">
  <link rel="dns-prefetch" href="http://localhost:8000">
</head>
```

### Step 3.3: Create Favicon Files

Generate and place in `public/`:
- `favicon.ico`
- `favicon.svg`
- `icon-192.png`
- `icon-512.png`

---

## Phase 4: Backend Image Optimization (Optional, 3-5 days)

**Expected Impact: Additional +5-10 points**

This requires backend changes but provides significant benefits:

### Step 4.1: Modern Image Formats

Backend should convert uploads to WebP/AVIF and serve based on Accept header.

**Frontend implementation:**
```tsx
<picture>
  <source 
    srcSet={getProductImageUrl(product, 'thumbnail', 'webp')} 
    type="image/webp" 
  />
  <source 
    srcSet={getProductImageUrl(product, 'thumbnail', 'jpg')} 
    type="image/jpeg" 
  />
  <img 
    src={getProductImageUrl(product, 'thumbnail')} 
    alt={product.nume}
    loading="lazy"
    width={324}
    height={324}
  />
</picture>
```

**Expected Savings:** 1,288 KiB (~6.7s)

---

## Implementation Priority Matrix

| Task | Impact | Effort | Phase | Priority |
|------|--------|--------|-------|----------|
| Switch to `thumbnail`/`medium` images | 🔴 Critical | 🟢 Low | 1 | **#1** |
| Add `loading="lazy"` to images | 🟠 High | 🟢 Low | 1 | **#2** |
| Add explicit `width`/`height` to images | 🟠 High | 🟢 Low | 1 | **#3** |
| Add `aria-label` to buttons/links | 🟡 Medium | 🟢 Low | 1 | **#4** |
| Fix color contrast (amber-600 → amber-700) | 🟡 Medium | 🟢 Low | 1 | **#5** |
| Implement route-based code splitting | 🔴 Critical | 🟡 Medium | 2 | **#6** |
| Configure Vite manual chunks | 🟠 High | 🟡 Medium | 2 | **#7** |
| Lazy load heavy dependencies | 🟠 High | 🟡 Medium | 2 | **#8** |
| Configure PWA manifest | 🟡 Medium | 🟡 Medium | 3 | **#9** |
| Create favicon files | 🟢 Low | 🟢 Low | 3 | **#10** |
| Backend WebP/AVIF conversion | 🟠 High | 🔴 High | 4 | **#11** |

---

## Expected Results

| Metric | Current | After Phase 1 | After Phase 2 | After All |
|--------|---------|---------------|---------------|-----------|
| **Performance Score** | 29 | 60-70 | 75-85 | 85-95 |
| **FCP** | 7.7s | 2-3s | 1.5-2s | 1-1.5s |
| **LCP** | 9.0s | 3-4s | 2.5-3s | 2-2.5s |
| **CLS** | 0.699 | 0.1-0.2 | <0.1 | <0.1 |
| **Bundle Size** | 1.1MB | 1.1MB | 200-400KB | 200-400KB |
| **Page Size** | 5.6MB | 1-1.5MB | 1-1.5MB | 500KB-1MB |

---

## Risk Assessment & Mitigation

| Risk | Severity | Mitigation |
|------|----------|------------|
| Code splitting breaking component loading | 🟠 Medium | Implement gradually, test each route |
| Image format browser compatibility | 🟢 Low | Use `<picture>` with fallbacks |
| Over-chunking causing waterfall loading | 🟠 Medium | Monitor network waterfall, adjust chunking |
| Service worker cache invalidation | 🟡 Medium | Implement proper versioning |

---

## Monitoring & CI/CD Integration

### Performance Budgets

Add to CI pipeline:
```json
{
  "budgets": [
    {
      "path": "/",
      "resourceSizes": [
        {"resourceType": "script", "budget": 300000},
        {"resourceType": "total", "budget": 1000000}
      ],
      "timings": [
        {"metric": "firstContentfulPaint", "budget": 1800},
        {"metric": "largestContentfulPaint", "budget": 2500}
      ]
    }
  ]
}
```

### Bundle Analysis Script

Add to `package.json`:
```json
{
  "scripts": {
    "analyze": "vite build --mode production && npx vite-bundle-visualizer"
  }
}
```

### Lighthouse CI

Run after each phase to measure progress:
```bash
npx lighthouse http://localhost:3001 --output=json --output=html --output-path=./lighthouse-report
```

---

## Baby Steps Checklist

### Phase 1 (Days 1-2)
- [ ] Update `CatalogPage.tsx` to use `'thumbnail'` instead of `'original'`
- [ ] Update `WelcomePage.tsx` to use `'thumbnail'`
- [ ] Update `ProductPage.tsx` to use `'medium'`
- [ ] Add `loading="lazy"` to all product images
- [ ] Add `width` and `height` attributes to all images
- [ ] Add `aria-label` to pagination buttons
- [ ] Add `aria-label` to cart link
- [ ] Change `text-amber-600` to `text-amber-700` for price displays
- [ ] Run Lighthouse, verify +30-40 points improvement

### Phase 2 (Days 3-5)
- [ ] Convert static route imports to `lazy()` in `App.tsx`
- [ ] Add `Suspense` wrapper with loading fallback
- [ ] Configure `manualChunks` in `vite.config.ts`
- [ ] Convert PDF import to dynamic import
- [ ] Convert Excel import to dynamic import
- [ ] Build and verify bundle sizes
- [ ] Run Lighthouse, verify +10-15 points improvement

### Phase 3 (Days 6-7)
- [ ] Install/configure `vite-plugin-pwa`
- [ ] Add manifest configuration
- [ ] Add theme-color meta tag
- [ ] Add preconnect for API origin
- [ ] Generate favicon files
- [ ] Test PWA installability
- [ ] Run Lighthouse, verify final scores

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Lighthouse Performance | > 75 |
| Lighthouse Accessibility | > 85 |
| Lighthouse PWA | > 80 |
| FCP | < 1.8s |
| LCP | < 2.5s |
| CLS | < 0.1 |
| Initial Bundle | < 500KB |

---

## References

- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse Performance Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)
- [React Code Splitting](https://react.dev/reference/react/lazy)
- [Vite Code Splitting](https://vitejs.dev/guide/build.html#chunking-strategy)
- [Image Optimization Guide](https://web.dev/fast/#optimize-your-images)
- [WCAG 2.1 Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

*This consolidated plan combines insights from 4 separate AI analyses (Composer, GPT-5.1, Claude Opus 4.5, and Grok) to provide the most comprehensive and actionable optimization strategy.*

