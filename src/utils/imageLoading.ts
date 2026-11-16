type ImageLoadingProps = { loading: 'eager' | 'lazy'; fetchPriority?: 'high' };

/**
 * For a page's main image (product photo, category header): above the fold
 * and usually the page's largest element, so it loads right away at high
 * priority.
 */
export const HERO_IMAGE_LOADING: ImageLoadingProps = { loading: 'eager', fetchPriority: 'high' };

interface ListImageOptions {
  /** How many images, counting from the first one shown, are on screen when the page opens */
  eagerCount?: number;
  /** List index of the first entry that actually shows an image */
  firstImageIndex?: number;
  /** Give the first image high priority. Turn off when the page already has a hero image. */
  highPriority?: boolean;
}

/**
 * Loading hints for an image in a list: the first images on screen load right
 * away (the very first at high priority, unless turned off), the rest lazily
 * as the shopper scrolls. Counting starts at the first entry with an image, so
 * a leading entry without one doesn't push the first real image to lazy.
 */
export const listImageLoading = (
  index: number,
  { eagerCount = 1, firstImageIndex = 0, highPriority = true }: ListImageOptions = {}
): ImageLoadingProps => {
  const position = index - Math.max(firstImageIndex, 0);
  if (position < 0 || position >= eagerCount) {
    return { loading: 'lazy' };
  }
  return position === 0 && highPriority ? { loading: 'eager', fetchPriority: 'high' } : { loading: 'eager' };
};

/**
 * Columns of a `grid-cols-1 sm:grid-cols-2 md:grid-cols-3` grid on this screen,
 * i.e. how many tiles share the first row.
 */
export const gridColumnsOnScreen = (): number => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 1;
  }
  if (window.matchMedia('(min-width: 768px)').matches) {
    return 3;
  }
  return window.matchMedia('(min-width: 640px)').matches ? 2 : 1;
};
