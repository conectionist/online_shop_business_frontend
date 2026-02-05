import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear()
  }
})
afterAll(() => server.close())

// In-memory localStorage mock so Zustand persist (cartStore, authStore) has a working storage in jsdom
if (typeof window !== 'undefined') {
  const storage: Record<string, string> = {}
  const mockStorage = {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => {
      storage[key] = value
    },
    removeItem: (key: string) => {
      delete storage[key]
    },
    clear: () => {
      for (const key of Object.keys(storage)) delete storage[key]
    },
    get length() {
      return Object.keys(storage).length
    },
    key: (index: number) => {
      const keys = Object.keys(storage)
      return keys[index] ?? null
    },
  }
  Object.defineProperty(window, 'localStorage', { value: mockStorage, writable: true })
}

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


