import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Polyfill matchMedia used by usePWAInstall
const matchMediaPolyfill = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
}) as unknown as MediaQueryList

// @ts-ignore
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  // @ts-ignore
  window.matchMedia = matchMediaPolyfill
}
// Some libs may read from globalThis
// @ts-ignore
if (typeof globalThis !== 'undefined' && typeof (globalThis as any).matchMedia !== 'function') {
  ;(globalThis as any).matchMedia = matchMediaPolyfill
}


