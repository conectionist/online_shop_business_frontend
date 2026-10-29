import { lazy, type ComponentType } from 'react';

type PageModule = { default: ComponentType<any> };

const RELOAD_KEY = 'chunk-reload-at';
// A second failure within this window means reloading didn't help, so stop
// reloading and let the error boundary show its message instead of looping.
const RELOAD_WINDOW_MS = 10_000;

/**
 * True for errors thrown when a lazily loaded JS/CSS chunk can't be fetched:
 * a network drop, or a chunk removed by a newer deploy. Message texts differ
 * per browser.
 */
export const isChunkLoadError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }
  return (
    error.name === 'ChunkLoadError' ||
    /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS/i.test(
      error.message
    )
  );
};

/**
 * Reloads the page, unless it already did so moments ago.
 * Returns whether a reload was started.
 */
export const reloadOnce = (): boolean => {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < RELOAD_WINDOW_MS) {
      return false;
    }
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // Storage blocked: reloading without a guard could loop, so don't
    return false;
  }
  window.location.reload();
  return true;
};

/**
 * Loads a page chunk. A failed import stays failed for the rest of the page's
 * life (React.lazy and the browser both remember it), so on a chunk error the
 * page reloads once to fetch fresh code. A second failure is rethrown for the
 * route's error boundary.
 */
export const loadPage = async <T extends PageModule>(loader: () => Promise<T>): Promise<T> => {
  try {
    return await loader();
  } catch (error) {
    if (isChunkLoadError(error) && reloadOnce()) {
      // Never resolves: the page is reloading
      return new Promise<T>(() => {});
    }
    throw error;
  }
};

/** React.lazy for route pages, with the reload-once recovery above. */
export const lazyPage = <T extends PageModule>(loader: () => Promise<T>) =>
  lazy(() => loadPage(loader));
