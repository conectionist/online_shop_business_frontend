# Lighthouse Performance Analysis Report

**Date:** January 7, 2026  
**Page Tested:** Catalog Page (localhost:3001)

---

## Executive Summary

The current performance score is critically low at **29/100**, primarily due to oversized images being loaded at original resolution when displayed in small containers. Quick optimizations could potentially raise this to 60-70+ by simply using appropriate image sizes.

---

## Current Scores

| Category | Score | Status |
|----------|-------|--------|
| **Performance** | **29** | 🔴 Poor |
| Accessibility | 69 | 🟠 Needs Improvement |
| Best Practices | 93 | 🟢 Good |
| SEO | 98 | 🟢 Excellent |

---

## Core Web Vitals Analysis

| Metric | Current Value | Target (Good) | Target (Needs Improvement) | Status |
|--------|---------------|---------------|---------------------------|--------|
| **FCP** (First Contentful Paint) | **7.7s** | < 1.8s | < 3.0s | 🔴 Critical |
| **LCP** (Largest Contentful Paint) | **9.0s** | < 2.5s | < 4.0s | 🔴 Critical |
| **Speed Index** | **7.7s** | < 3.4s | < 5.8s | 🔴 Poor |
| **TBT** (Total Blocking Time) | 270ms | < 200ms | < 600ms | 🟡 Acceptable |
| **CLS** (Cumulative Layout Shift) | **0.699** | < 0.1 | < 0.25 | 🔴 Critical |

### What These Metrics Mean

- **FCP (First Contentful Paint):** Time until the first text/image appears. Users see a blank screen for 7.7 seconds.
- **LCP (Largest Contentful Paint):** Time until the main content is visible. The largest element takes 9 seconds to load.
- **Speed Index:** How quickly content is visually populated. The page feels very slow to load.
- **TBT (Total Blocking Time):** Time the main thread is blocked. This is acceptable at 270ms.
- **CLS (Cumulative Layout Shift):** How much elements move around during load. A score of 0.699 means significant visual instability.

---

## Critical Issues Identified

### 1. 🔴 Oversized Images (Primary Issue)

**Total Page Size: 5,636 KiB (5.5 MB)**

The biggest performance killer is image handling. Images are loaded at original resolution even when displayed in small containers.

#### Breakdown of Potential Savings

| Opportunity | Potential Savings | Priority |
|-------------|-------------------|----------|
| Properly size images | **3,766 KiB** | Critical |
| Modern image formats (WebP/AVIF) | 1,288 KiB | High |
| Efficiently encode images | 233 KiB | Medium |
| Defer offscreen images (lazy loading) | 71 KiB | High |
| **Total** | **~5,358 KiB** | - |

#### Specific Examples

| Image | Actual Size | Display Size | Wasted |
|-------|-------------|--------------|--------|
| Hummus.jpg | 2,790 KiB | 324×324px | **97%** |
| Paine neagra.jpg | 386 KiB | 324×324px | 85% |
| Other product images | Various | 324×324px | 80-95% |

#### Root Cause

In `CatalogPage.tsx` (line 385), images are loaded at `'original'` size:

```tsx
src={getProductImageUrl(product, 'original')}
```

The API already supports three image versions:
- `thumbnail` - Small, optimized for lists
- `medium` - Medium size for cards
- `original` - Full resolution for lightbox/detail views

**Solution:** Use `thumbnail` or `medium` for catalog display.

---

### 2. 🔴 Cumulative Layout Shift (CLS): 0.699

The CLS score is nearly **7x worse** than the acceptable threshold of 0.1.

#### Causes
- Images loading without reserved dimensions
- Dynamic content insertion
- Font loading causing text reflow

#### Solutions
- Add explicit `width` and `height` attributes to images
- Use `aspect-ratio` CSS property
- Implement skeleton loaders
- Preload critical fonts

---

### 3. 🟠 Unused JavaScript (701 KiB)

**Main Bundle Size:** 1,236 KiB (1.2 MB)

The JavaScript bundle is large and includes code that may not be needed on initial load.

#### Potential Savings: 3,450ms on FCP/LCP

#### Causes
- No code splitting
- All routes bundled together
- Potentially unused library code

#### Solutions
- Implement route-based code splitting with `React.lazy()`
- Analyze bundle composition with tools like `vite-bundle-analyzer`
- Tree-shake unused exports

---

### 4. 🟠 Accessibility Issues (Score: 69)

#### Color Contrast
- Some text/background combinations don't meet WCAG 2.1 AA requirements
- Minimum contrast ratio should be 4.5:1 for normal text

#### Links Without Discernible Names
- Some links lack descriptive text or aria-labels
- Screen readers cannot properly announce link purposes

---

### 5. 🟢 Minor Issues

| Issue | Potential Savings | Notes |
|-------|-------------------|-------|
| Text compression | 13 KiB | Enable gzip/brotli |
| Offscreen images | 71 KiB | Add lazy loading |

---

## Network Payload Analysis

### Top 10 Largest Resources

| Resource | Size | Type |
|----------|------|------|
| Hummus product image | 2,790 KiB | Image |
| index-D3jiHfun.js | 1,237 KiB | JavaScript |
| Product image 2 | 411 KiB | Image |
| Product image 3 | 386 KiB | Image |
| Product image 4 | 357 KiB | Image |
| Product image 5 | 238 KiB | Image |
| Product image 6 | 206 KiB | Image |
| anpc-sol.png | 63 KiB | Image |
| logo.jpg | 20 KiB | Image |
| index-D3aRXaNz.css | 13 KiB | CSS |

---

## Improvement Plan

### Phase 1: Quick Wins (1-2 days) - Expected Performance Gain: +30-40 points

#### 1.1 Use Proper Image Sizes
```tsx
// Before (CatalogPage.tsx line 385)
src={getProductImageUrl(product, 'original')}

// After
src={getProductImageUrl(product, 'thumbnail')}
// or 'medium' if thumbnail is too small
```

#### 1.2 Add Lazy Loading
```tsx
<img
  src={getProductImageUrl(product, 'thumbnail')}
  alt={product.nume}
  loading="lazy"  // Add this
  className="w-full h-full object-cover"
/>
```

#### 1.3 Fix CLS with Explicit Dimensions
```tsx
<div className="aspect-square relative">
  <img
    src={getProductImageUrl(product, 'thumbnail')}
    alt={product.nume}
    width={324}   // Add explicit dimensions
    height={324}
    loading="lazy"
    className="w-full h-full object-cover"
  />
</div>
```

---

### Phase 2: JavaScript Optimization (2-3 days) - Expected Gain: +5-15 points

#### 2.1 Route-Based Code Splitting
```tsx
// In App.tsx
import { lazy, Suspense } from 'react';

const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));
const CartPage = lazy(() => import('./pages/customer/CartPage'));
const CatalogPage = lazy(() => import('./pages/customer/CatalogPage'));

// Wrap routes in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/admin/*" element={<AdminPanel />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/catalog" element={<CatalogPage />} />
  </Routes>
</Suspense>
```

#### 2.2 Bundle Analysis
```bash
# Add to package.json scripts
"analyze": "vite build --mode production && npx vite-bundle-visualizer"
```

---

### Phase 3: Advanced Optimizations (3-5 days)

#### 3.1 Preload Critical Resources
```html
<!-- In index.html -->
<link rel="preconnect" href="http://localhost:8000">
<link rel="preload" href="/fonts/main-font.woff2" as="font" crossorigin>
```

#### 3.2 Modern Image Formats (Backend Change)
- Serve WebP/AVIF with fallbacks
- Implement responsive images with `srcset`

```tsx
<picture>
  <source srcset={getProductImageUrl(product, 'thumbnail', 'webp')} type="image/webp" />
  <source srcset={getProductImageUrl(product, 'thumbnail', 'jpg')} type="image/jpeg" />
  <img src={getProductImageUrl(product, 'thumbnail')} alt={product.nume} />
</picture>
```

#### 3.3 Accessibility Improvements
- Audit and fix color contrast issues
- Add aria-labels to icon-only links
- Ensure all interactive elements are keyboard accessible

---

## Implementation Priority Matrix

| Task | Impact | Effort | Priority |
|------|--------|--------|----------|
| Switch to thumbnail/medium images | 🔴 High | 🟢 Low | **1** |
| Add lazy loading to images | 🟠 Medium | 🟢 Low | **2** |
| Add explicit image dimensions | 🟠 Medium | 🟢 Low | **3** |
| Implement code splitting | 🟠 Medium | 🟡 Medium | **4** |
| Fix accessibility issues | 🟡 Medium | 🟡 Medium | **5** |
| Optimize backend images | 🟡 Medium | 🔴 High | **6** |

---

## Expected Results After Optimization

| Metric | Current | After Phase 1 | After All Phases |
|--------|---------|---------------|------------------|
| Performance Score | 29 | ~60-70 | ~85-95 |
| FCP | 7.7s | ~2-3s | ~1-1.5s |
| LCP | 9.0s | ~3-4s | ~2-2.5s |
| CLS | 0.699 | ~0.1-0.2 | <0.1 |
| Page Size | 5.6 MB | ~1-1.5 MB | ~500 KB-1 MB |

---

## How to Re-run Lighthouse

```bash
# Using the project's lighthouse dependency
npx lighthouse http://localhost:3001 --output=json --output=html --output-path=./lighthouse-report

# Or with Chrome DevTools
# 1. Open Chrome DevTools (F12)
# 2. Go to "Lighthouse" tab
# 3. Select categories and run audit
```

---

## References

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Lighthouse Performance Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)
- [Image Optimization Guide](https://web.dev/fast/#optimize-your-images)
- [Code Splitting in React](https://react.dev/reference/react/lazy)
- [WCAG 2.1 Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

