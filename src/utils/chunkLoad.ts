import { lazy, type ComponentType } from 'react';

type PageModule = { default: ComponentType<any> };

const RELOAD_KEY = 'chunk-reload-at';
// After one recovery reload, don't reload again until a page has loaded
// successfully (or this long has passed), however slowly the next failure
// arrives. A failure that reloading didn't fix shows the error boundary.
const RELOAD_BLOCK_MS = 60 * 60 * 1000;
// Delay before retrying a failed import once, in case the network blipped
export const RETRY_DELAY_MS = 500;

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

const isOffline = (): boolean => typeof navigator !== 'undefined' && navigator.onLine === false;

/**
 * Reloads the page to fetch fresh code, at most once until a page loads
 * successfully again. Never reloads while offline: that would replace the
 * running app with the browser's offline page.
 * Returns whether a reload was started.
 */
export const reloadOnce = (): boolean => {
  if (isOffline()) {
    return false;
  }
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < RELOAD_BLOCK_MS) {
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

/** Called after a page chunk loads: the next failure may reload again. */
const markLoadSucceeded = () => {
  try {
    sessionStorage.removeItem(RELOAD_KEY);
  } catch {
    // Storage blocked: nothing to clear
  }
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Loads a page chunk. On a chunk error it retries once (a brief network drop,
 * or an earlier background prefetch that failed); if that fails too, the page
 * reloads once to fetch fresh code, since some browsers keep returning a
 * failed import for the rest of the page's life. Otherwise the error is
 * rethrown for the route's error boundary.
 */
export const loadPage = async <T extends PageModule>(loader: () => Promise<T>): Promise<T> => {
  try {
    const module = await loader();
    markLoadSucceeded();
    return module;
  } catch (error) {
    if (!isChunkLoadError(error)) {
      throw error;
    }
    if (!isOffline()) {
      await wait(RETRY_DELAY_MS);
      try {
        const module = await loader();
        markLoadSucceeded();
        return module;
      } catch {
        // Still failing: fall through to the reload
      }
    }
    if (reloadOnce()) {
      // Never resolves: the page is reloading
      return new Promise<T>(() => {});
    }
    throw error;
  }
};

/** React.lazy for route pages, with the reload-once recovery above. */
export const lazyPage = <T extends PageModule>(loader: () => Promise<T>) =>
  lazy(() => loadPage(loader));
