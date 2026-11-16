/**
 * Loading hints for an image in a list. The first `eagerCount` images are
 * usually on screen when the page opens, so they load right away (the very
 * first at high priority, as it is often the page's largest element); the
 * rest load lazily as the shopper scrolls.
 */
export const listImageLoading = (
  index: number,
  eagerCount = 1
): { loading: 'eager' | 'lazy'; fetchPriority?: 'high' | 'auto' } => {
  if (index >= eagerCount) {
    return { loading: 'lazy' };
  }
  return { loading: 'eager', fetchPriority: index === 0 ? 'high' : 'auto' };
};
