# Lighthouse Audit Action Plan

## Baseline (Lighthouse 11.7.1, http://localhost:3001/)
- Performance: 0.29 (FCP 7.7s, LCP 9.0s, TBT 270ms, CLS 0.699)
- Accessibility: 0.69
- Best Practices: 0.93
- SEO: 0.98
- PWA: 0.63
- Biggest opportunity: `assets/index-D3jiHfun.js` ~1.15 MB with ~701 KiB unused (62.7%) → ~3.45s potential savings on FCP/LCP.

## Top Issues
- Heavy main bundle with large unused JS hurting FCP/LCP.
- CLS very high (0.699) from unsized media/dynamic elements.
- PWA not fully installable/offline-ready.
- Accessibility gaps (labels/contrast/focus).

## Improvement Plan (baby steps, high impact first)
1) Reduce JS cost and block time
   - Route-level code splitting; lazy-load infrequently used views/modals.
   - Trim/replace heavy deps; ensure tree-shaking (ESM, avoid barrel imports).
   - Defer non-critical scripts (analytics/chat) to idle or user action.
   - Verify prod build flags; keep source maps out of prod bundle.

2) Fix LCP path
   - Identify LCP element (hero/image). Preload with `fetchpriority="high"` and compressed WebP/AVIF at display size.
   - Preload/inline critical CSS; defer non-critical CSS.
   - Add `preconnect`/`dns-prefetch` to API/CDN origins.

3) Eliminate CLS
   - Set width/height or aspect-ratio on hero/product images, carousels, and banners.
   - Reserve space for dynamic bars (promo/cookie/add-to-cart); prefer opacity transitions over height jumps.
   - Use `font-display: swap` and stable fallback fonts.

4) PWA hardening
   - Ensure manifest has start_url/scope/installability plus maskable icon.
   - Update service worker to cache app shell + critical assets; add offline fallback route.

5) Accessibility sweep
   - Add labels/aria for form controls and interactive elements.
   - Ensure focus-visible states and adequate color contrast.
   - Verify landmarks (main/nav/footer) and logical tab order.

6) Monitoring & gates
   - Add bundle-size budgets and Lighthouse CI in CI to guard regressions.
   - Re-run Lighthouse after each batch; track FCP, LCP, CLS deltas.

## Next Suggested Step
Start with JS bundle triage: identify top modules inside `assets/index-D3jiHfun.js`, propose concrete code-splitting targets, then re-run Lighthouse to measure FCP/LCP/CLS impact.

