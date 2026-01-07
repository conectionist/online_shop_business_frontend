# Lighthouse Performance Improvement Plan

## Executive Summary

**Current Scores:**
- **Performance**: 29% ⚠️ CRITICAL
- **Accessibility**: 69% ⚠️ NEEDS IMPROVEMENT
- **Best Practices**: 93% ✅ GOOD
- **SEO**: 98% ✅ EXCELLENT
- **PWA**: 63% ⚠️ NEEDS IMPROVEMENT

**Core Web Vitals:**
- First Contentful Paint (FCP): 0 (Very Poor)
- Largest Contentful Paint (LCP): 0.01 (Very Poor)
- Speed Index: 0.25 (Poor)
- Total Blocking Time (TBT): 0.82 (Good)
- Cumulative Layout Shift (CLS): 0.07 (Good)
- Time to Interactive (TTI): 0.26 (Poor)

---

## Priority 1: Critical Performance Issues (Estimated Impact: +40-50 points)

### 1.1 Image Optimization (Highest Impact: ~19.2s savings, 3.7 MB)

**Problem:**
- Images are served at full resolution (2.7MB+ for 324x324px display)
- No responsive image sizing
- Images not using modern formats (WebP/AVIF)
- No lazy loading for offscreen images

**Current State:**
- Product images loaded via `getProductImageUrl(product, 'original')` 
- Display size: 324x324px
- Actual image size: Up to 2.7MB (97% wasted bytes)

**Solution:**
1. **Implement responsive image sizes:**
   - Use `thumbnail` version for catalog grid (324x324px)
   - Use `medium` version for product detail pages
   - Use `original` only when user zooms/clicks

2. **Add lazy loading:**
   - Add `loading="lazy"` to all offscreen images
   - Use Intersection Observer for better control

3. **Implement modern image formats:**
   - Backend: Convert images to WebP/AVIF on upload
   - Frontend: Use `<picture>` element with fallbacks
   - Or: Use image CDN that handles format conversion

4. **Add proper image dimensions:**
   - Set explicit `width` and `height` attributes to prevent layout shift
   - Use aspect-ratio CSS for responsive containers

**Files to Modify:**
- `src/pages/customer/CatalogPage.tsx` (lines 383-393)
- `src/pages/WelcomePage.tsx` (lines 403-413)
- `src/pages/customer/ProductPage.tsx` (lines 273-283)
- `src/services/api.ts` (getProductImageUrl function)

**Expected Savings:**
- 3,766 KiB (3.7 MB) reduction
- ~19,210ms faster load time
- Significant improvement in LCP score

---

### 1.2 Reduce Unused JavaScript (High Impact: ~3.5s savings, 701 KB)

**Problem:**
- 62.7% of JavaScript bundle is unused (701 KB out of 1.1 MB)
- Main bundle: `index-D3jiHfun.js` contains unused code

**Solution:**
1. **Code splitting:**
   - Split routes into separate chunks
   - Lazy load admin components (not needed on customer pages)
   - Lazy load heavy libraries (PDF renderer, Excel, etc.)

2. **Tree shaking:**
   - Ensure Vite is properly tree-shaking unused exports
   - Review imports - use named imports instead of default imports where possible
   - Remove unused dependencies

3. **Dynamic imports:**
   ```typescript
   // Instead of:
   import { PDFDocument } from '@react-pdf/renderer';
   
   // Use:
   const PDFDocument = lazy(() => import('@react-pdf/renderer'));
   ```

**Files to Review:**
- `src/App.tsx` - Route configuration
- `vite.config.ts` - Build configuration
- All component imports

**Expected Savings:**
- 701 KiB reduction
- ~3,450ms faster FCP and LCP
- Better Time to Interactive

---

### 1.3 Modern Image Formats (Medium Impact: ~6.7s savings, 1.3 MB)

**Problem:**
- Images served as JPEG/PNG instead of WebP/AVIF
- Missing format conversion

**Solution:**
1. **Backend solution (recommended):**
   - Convert images to WebP on upload
   - Store multiple formats (JPEG, WebP, AVIF)
   - API returns format URLs or use Accept header

2. **Frontend solution (if backend unavailable):**
   - Use `<picture>` element with format fallbacks
   - Implement client-side conversion (not recommended for production)

**Expected Savings:**
- 1,288 KiB reduction
- ~6,750ms faster load time

---

## Priority 2: Accessibility Issues (Estimated Impact: +15-20 points)

### 2.1 Missing Button Names

**Problem:**
- Buttons without accessible names (pagination buttons, icon buttons)
- Screen readers announce them as just "button"

**Solution:**
- Add `aria-label` to all icon-only buttons
- Ensure buttons have visible or hidden text
- Use semantic HTML where possible

**Files to Fix:**
- Pagination buttons in `CatalogPage.tsx` (around line 2495)
- Icon buttons throughout the app

**Example Fix:**
```tsx
// Before:
<button className="..." disabled>

// After:
<button className="..." disabled aria-label="Previous page">
  <ChevronLeft />
</button>
```

---

### 2.2 Missing Link Names

**Problem:**
- Links without accessible text (cart icon link, product card links)
- Screen readers can't identify link purpose

**Solution:**
- Add `aria-label` to icon-only links
- Ensure product card links have accessible names
- Use hidden text for decorative links

**Files to Fix:**
- Cart link in navigation (around line 3678)
- Product card links (around line 3698)

**Example Fix:**
```tsx
// Before:
<a href="/cart" data-discover="true">

// After:
<a href="/cart" aria-label="Shopping cart" data-discover="true">
  <ShoppingCart />
  <span className="sr-only">Shopping cart</span>
</a>
```

---

### 2.3 Color Contrast Issues

**Problem:**
- Text color `#e17100` (amber-600) on white background has contrast ratio 3.19:1
- Required: 4.5:1 for normal text, 3:1 for large text

**Solution:**
- Use darker amber color (amber-700 or amber-800)
- Or use amber-600 only for large text (18px+)
- Test all color combinations

**Files to Fix:**
- Price display in product cards (around line 2894)
- Any other amber-600 text on white backgrounds

**Example Fix:**
```tsx
// Before:
<span className="text-lg font-bold text-amber-600">

// After:
<span className="text-lg font-bold text-amber-700">
// or
<span className="text-xl font-bold text-amber-600"> // Larger text meets 3:1 requirement
```

---

## Priority 3: PWA Improvements (Estimated Impact: +10-15 points)

### 3.1 Missing Service Worker / Manifest

**Problem:**
- Web app manifest or service worker don't meet installability requirements
- PWA score: 63%

**Solution:**
1. **Configure vite-plugin-pwa:**
   - Already installed, needs configuration
   - Add manifest.json configuration
   - Generate service worker

2. **Create manifest:**
   ```json
   {
     "name": "Online Shop",
     "short_name": "Shop",
     "description": "Online shop business management",
     "start_url": "/",
     "display": "standalone",
     "theme_color": "#e17100",
     "background_color": "#ffffff",
     "icons": [...]
   }
   ```

3. **Add theme color meta tag:**
   ```html
   <meta name="theme-color" content="#e17100">
   ```

**Files to Create/Modify:**
- `vite.config.ts` - Configure vite-plugin-pwa
- `index.html` - Add theme color meta tag

---

### 3.2 Missing Favicon Files

**Problem:**
- 404 errors for favicon files:
  - `/favicon.ico`
  - `/favicon.svg`
  - `/favicon-96x96.png`
  - `/web-app-manifest-192x192.png`

**Solution:**
- Generate favicon files in multiple sizes
- Place in `public/` directory
- Update `index.html` with proper favicon links

**Files to Create:**
- `public/favicon.ico`
- `public/favicon.svg`
- `public/favicon-96x96.png`
- `public/web-app-manifest-192x192.png` (or configure vite-plugin-pwa to generate)

---

## Priority 4: Additional Optimizations

### 4.1 Defer Offscreen Images

**Problem:**
- 71 KiB of offscreen images loaded immediately
- Should be lazy-loaded

**Solution:**
- Already addressed in Priority 1.1 (lazy loading)
- Ensure all images below fold have `loading="lazy"`

---

### 4.2 Image Aspect Ratio

**Problem:**
- Images displayed with incorrect aspect ratio
- Can cause layout shifts

**Solution:**
- Set explicit `width` and `height` on images
- Use CSS `aspect-ratio` property
- Reserve space for images to prevent CLS

---

## Implementation Roadmap

### Phase 1: Quick Wins (1-2 days)
1. ✅ Fix missing favicon files
2. ✅ Add aria-labels to buttons and links
3. ✅ Fix color contrast issues
4. ✅ Add lazy loading to images

**Expected Impact:** +10-15 points

### Phase 2: Image Optimization (2-3 days)
1. ✅ Implement responsive image sizes (use thumbnail/medium)
2. ✅ Add proper image dimensions
3. ✅ Implement modern image formats (WebP)
4. ✅ Optimize image loading strategy

**Expected Impact:** +25-35 points

### Phase 3: Code Splitting (1-2 days)
1. ✅ Analyze bundle composition
2. ✅ Implement route-based code splitting
3. ✅ Lazy load heavy dependencies
4. ✅ Optimize imports

**Expected Impact:** +10-15 points

### Phase 4: PWA Setup (1 day)
1. ✅ Configure vite-plugin-pwa
2. ✅ Create manifest.json
3. ✅ Add theme color
4. ✅ Test installability

**Expected Impact:** +10-15 points

---

## Success Metrics

**Target Scores:**
- Performance: 70-80% (from 29%)
- Accessibility: 85-90% (from 69%)
- PWA: 80-90% (from 63%)

**Target Core Web Vitals:**
- FCP: < 1.8s (Good)
- LCP: < 2.5s (Good)
- Speed Index: < 3.4s (Good)
- TTI: < 3.8s (Good)
- CLS: < 0.1 (Good) ✅ Already achieved

---

## Notes

- All changes should be tested in production Docker environment
- Run Lighthouse tests after each phase
- Monitor real user metrics if available
- Consider implementing image CDN for better performance
- Backend changes may be needed for image format conversion

