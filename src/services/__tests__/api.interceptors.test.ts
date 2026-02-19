import { vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { apiClient, getApiBaseUrl } from '../api'
import { useAuthStore } from '@/stores/authStore'

const API = 'http://localhost:8001/api/v1'

// Mock queryClient
vi.mock('@/lib/queryClient', () => ({
  queryClient: { clear: vi.fn() },
}))

let savedLocation: Location

beforeEach(() => {
  useAuthStore.getState().logout()
  vi.clearAllMocks()

  // Save and mock window.location (interceptor sets window.location.href = '/login')
  savedLocation = window.location
  delete (window as any).location
  ;(window as any).location = {
    href: 'http://localhost:3000/',
    protocol: 'http:',
  }

  // Clear runtime config
  delete (window as any).__RUNTIME_CONFIG__
})

afterEach(() => {
  ;(window as any).location = savedLocation
})

// ---------------------------------------------------------------------------
// getApiBaseUrl
// ---------------------------------------------------------------------------

describe('getApiBaseUrl', () => {
  test('returns runtime config URL when set', () => {
    ;(window as any).__RUNTIME_CONFIG__ = { VITE_API_BASE_URL: 'http://custom-api:9000' }
    expect(getApiBaseUrl()).toBe('http://custom-api:9000')
  })

  test('upgrades http→https when page is served over HTTPS', () => {
    ;(window as any).__RUNTIME_CONFIG__ = { VITE_API_BASE_URL: 'http://api.example.com' }
    ;(window as any).location.protocol = 'https:'
    expect(getApiBaseUrl()).toBe('https://api.example.com')
  })

  test('falls back to localhost:8001 when config is missing', () => {
    // No __RUNTIME_CONFIG__ and no env var set
    expect(getApiBaseUrl()).toBe('http://localhost:8001')
  })
})

// ---------------------------------------------------------------------------
// Request interceptor
// ---------------------------------------------------------------------------

describe('Request interceptor', () => {
  test('sets baseURL to {apiBaseUrl}/api/v1 on every request', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${API}/interceptor-test`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ ok: true })
      })
    )
    await apiClient.get('/interceptor-test')
    expect(capturedUrl).toBe(`${API}/interceptor-test`)
  })
})

// ---------------------------------------------------------------------------
// Response interceptor — HTML detection
// ---------------------------------------------------------------------------

describe('Response interceptor — HTML detection', () => {
  test('rejects response with HTML content-type', async () => {
    server.use(
      http.get(`${API}/html-endpoint`, () => {
        return new HttpResponse('<html><body>Not Found</body></html>', {
          headers: { 'Content-Type': 'text/html' },
        })
      })
    )
    try {
      await apiClient.get('/html-endpoint')
      expect.unreachable('Should have thrown')
    } catch (error: any) {
      expect(error.code).toBe('ERR_WRONG_RESPONSE')
    }
  })

  test('passes through JSON responses normally', async () => {
    server.use(
      http.get(`${API}/json-endpoint`, () => {
        return HttpResponse.json({ data: 'hello' })
      })
    )
    const response = await apiClient.get('/json-endpoint')
    expect(response.data).toEqual({ data: 'hello' })
  })
})

// ---------------------------------------------------------------------------
// Response interceptor — 401 refresh flow
// ---------------------------------------------------------------------------

describe('Response interceptor — 401 refresh flow', () => {
  test('refreshes token on 401 and retries original request', async () => {
    let endpointCalls = 0
    let refreshCalled = false
    server.use(
      http.get(`${API}/protected-resource`, () => {
        endpointCalls++
        if (endpointCalls === 1) {
          return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 })
        }
        return HttpResponse.json({ data: 'secret' })
      }),
      http.post(`${API}/auth/refresh`, () => {
        refreshCalled = true
        return HttpResponse.json({})
      })
    )

    const response = await apiClient.get('/protected-resource')

    expect(refreshCalled).toBe(true)
    expect(endpointCalls).toBe(2) // initial + retry
    expect(response.data).toEqual({ data: 'secret' })
  })

  test('only one refresh request when multiple 401s fire concurrently', async () => {
    let refreshCount = 0
    let endpointCalls = 0
    server.use(
      http.get(`${API}/concurrent-test`, () => {
        endpointCalls++
        if (endpointCalls <= 3) {
          return HttpResponse.json({}, { status: 401 })
        }
        return HttpResponse.json({ ok: true })
      }),
      http.post(`${API}/auth/refresh`, () => {
        refreshCount++
        return HttpResponse.json({})
      })
    )

    const results = await Promise.all([
      apiClient.get('/concurrent-test'),
      apiClient.get('/concurrent-test'),
      apiClient.get('/concurrent-test'),
    ])

    expect(refreshCount).toBe(1) // Only ONE refresh despite 3 concurrent 401s
    expect(results.every(r => r.data.ok)).toBe(true)
  })

  test('redirects to /login when refresh fails', async () => {
    server.use(
      http.get(`${API}/will-fail`, () => {
        return HttpResponse.json({}, { status: 401 })
      }),
      http.post(`${API}/auth/refresh`, () => {
        return HttpResponse.json({ detail: 'Token expired' }, { status: 401 })
      })
    )

    await expect(apiClient.get('/will-fail')).rejects.toThrow()
    expect(window.location.href).toBe('/login')
  })

  test('clears auth store when refresh fails', async () => {
    // Set up as authenticated
    useAuthStore.getState().login({ id: 1, email: 'a', name: 'a', role: 'admin' })
    expect(useAuthStore.getState().isAuthenticated).toBe(true)

    server.use(
      http.get(`${API}/will-fail`, () => {
        return HttpResponse.json({}, { status: 401 })
      }),
      http.post(`${API}/auth/refresh`, () => {
        return HttpResponse.json({}, { status: 401 })
      })
    )

    await expect(apiClient.get('/will-fail')).rejects.toThrow()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  test('clears React Query cache when refresh fails', async () => {
    server.use(
      http.get(`${API}/will-fail`, () => {
        return HttpResponse.json({}, { status: 401 })
      }),
      http.post(`${API}/auth/refresh`, () => {
        return HttpResponse.json({}, { status: 401 })
      })
    )

    await expect(apiClient.get('/will-fail')).rejects.toThrow()
    const { queryClient } = await import('@/lib/queryClient')
    expect(queryClient.clear).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Response interceptor — auth endpoint 401
// ---------------------------------------------------------------------------

describe('Response interceptor — auth endpoint 401', () => {
  test('does NOT retry /auth/refresh on 401 (prevents infinite loop)', async () => {
    let refreshCallCount = 0
    server.use(
      http.post(`${API}/auth/refresh`, () => {
        refreshCallCount++
        return HttpResponse.json({}, { status: 401 })
      })
    )

    // Call refresh directly — the interceptor should NOT retry it
    await expect(apiClient.post('/auth/refresh')).rejects.toThrow()
    expect(refreshCallCount).toBe(1) // Called once, not retried
    expect(window.location.href).toBe('/login')
  })

  test('does NOT retry /auth/logout on 401', async () => {
    let logoutCallCount = 0
    server.use(
      http.post(`${API}/auth/logout`, () => {
        logoutCallCount++
        return HttpResponse.json({}, { status: 401 })
      })
    )

    await expect(apiClient.post('/auth/logout')).rejects.toThrow()
    expect(logoutCallCount).toBe(1) // Called once, not retried
    expect(window.location.href).toBe('/login')
  })

  test('redirects to /login immediately on auth endpoint 401', async () => {
    useAuthStore.getState().login({ id: 1, email: 'a', name: 'a', role: 'admin' })

    server.use(
      http.post(`${API}/auth/refresh`, () => {
        return HttpResponse.json({}, { status: 401 })
      })
    )

    await expect(apiClient.post('/auth/refresh')).rejects.toThrow()

    // Verify cleanup happened
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(window.location.href).toBe('/login')
    const { queryClient } = await import('@/lib/queryClient')
    expect(queryClient.clear).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Response interceptor — non-401 errors
// ---------------------------------------------------------------------------

describe('Response interceptor — non-401 errors', () => {
  test('passes through 400, 403, 404, 500 errors unchanged', async () => {
    const statusCodes = [400, 403, 404, 500]

    for (const status of statusCodes) {
      server.use(
        http.get(`${API}/error-test`, () => {
          return HttpResponse.json({ detail: `Error ${status}` }, { status })
        })
      )

      try {
        await apiClient.get('/error-test')
        expect.unreachable(`Should have thrown for status ${status}`)
      } catch (error: any) {
        expect(error.response.status).toBe(status)
        expect(error.response.data.detail).toBe(`Error ${status}`)
      }
    }
  })
})
