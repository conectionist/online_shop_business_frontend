import { vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { authService } from '../authService'
import { useAuthStore } from '@/stores/authStore'

const API = 'http://localhost:8001/api/v1'

// Mock queryClient
vi.mock('@/lib/queryClient', () => ({
  queryClient: {
    clear: vi.fn(),
  },
}))

beforeEach(() => {
  useAuthStore.getState().logout()
  vi.clearAllMocks()
})

describe('authService.login', () => {
  test('calls POST /auth/login with credentials', async () => {
    let capturedBody: any = null
    server.use(
      http.post(`${API}/auth/login`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 1, username: 'admin' })
      })
    )
    await authService.login({ username: 'admin', password: 'secret' })
    expect(capturedBody).toEqual({ username: 'admin', password: 'secret' })
  })

  test('transforms response: username → email/name, hardcodes role=admin', async () => {
    server.use(
      http.post(`${API}/auth/login`, () => {
        return HttpResponse.json({ id: 1, username: 'testuser' })
      })
    )
    await authService.login({ username: 'testuser', password: 'pass' })
    const state = useAuthStore.getState()
    expect(state.user).toMatchObject({
      id: 1,
      email: 'testuser',
      name: 'testuser',
      role: 'admin',
    })
  })

  test('updates auth store with user data', async () => {
    server.use(
      http.post(`${API}/auth/login`, () => {
        return HttpResponse.json({ id: 1, username: 'admin' })
      })
    )
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    await authService.login({ username: 'admin', password: 'pass' })
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  test('returns response data', async () => {
    server.use(
      http.post(`${API}/auth/login`, () => {
        return HttpResponse.json({ id: 1, username: 'admin', expires_in: 1800 })
      })
    )
    const result = await authService.login({ username: 'admin', password: 'pass' })
    expect(result).toMatchObject({ id: 1, username: 'admin', expires_in: 1800 })
  })

  test('throws on 401 (wrong credentials)', async () => {
    server.use(
      http.post(`${API}/auth/login`, () => {
        return HttpResponse.json({ detail: 'Invalid credentials' }, { status: 401 })
      })
    )
    await expect(authService.login({ username: 'admin', password: 'wrong' })).rejects.toThrow()
  })

  test('throws on network error', async () => {
    server.use(
      http.post(`${API}/auth/login`, () => HttpResponse.error())
    )
    await expect(authService.login({ username: 'admin', password: 'pass' })).rejects.toThrow()
  })
})

describe('authService.refreshAccessToken', () => {
  test('calls POST /auth/refresh', async () => {
    let called = false
    server.use(
      http.post(`${API}/auth/refresh`, () => {
        called = true
        return HttpResponse.json({})
      })
    )
    await authService.refreshAccessToken()
    expect(called).toBe(true)
  })

  test('does not call logout on failure (interceptor handles it)', async () => {
    const logoutSpy = vi.spyOn(authService, 'logout')
    server.use(
      http.post(`${API}/auth/refresh`, () => {
        return HttpResponse.json({ detail: 'Token expired' }, { status: 401 })
      })
    )

    await expect(authService.refreshAccessToken()).rejects.toThrow()

    // refreshAccessToken must NOT call this.logout() — the interceptor handles cleanup
    expect(logoutSpy).not.toHaveBeenCalled()
    logoutSpy.mockRestore()
  })

  test('throws on failure', async () => {
    server.use(
      http.post(`${API}/auth/refresh`, () => {
        return HttpResponse.json({ detail: 'Token expired' }, { status: 401 })
      })
    )
    await expect(authService.refreshAccessToken()).rejects.toThrow()
  })
})

describe('authService.changePassword', () => {
  test('calls POST /auth/change-password with current_password and new_password', async () => {
    let capturedBody: any = null
    server.use(
      http.post(`${API}/auth/change-password`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({})
      })
    )
    await authService.changePassword('old123', 'new456')
    expect(capturedBody).toEqual({ current_password: 'old123', new_password: 'new456' })
  })
})

describe('authService.logout', () => {
  test('calls POST /auth/logout', async () => {
    let called = false
    server.use(
      http.post(`${API}/auth/logout`, () => {
        called = true
        return HttpResponse.json({})
      })
    )
    await authService.logout()
    expect(called).toBe(true)
  })

  test('clears auth store even if backend call fails', async () => {
    server.use(
      http.post(`${API}/auth/logout`, () => {
        return HttpResponse.json({ detail: 'error' }, { status: 500 })
      })
    )
    // Set up as authenticated first
    useAuthStore.getState().login({ id: 1, email: 'a', name: 'a', role: 'admin' })
    expect(useAuthStore.getState().isAuthenticated).toBe(true)

    await authService.logout()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  test('clears React Query cache', async () => {
    server.use(
      http.post(`${API}/auth/logout`, () => HttpResponse.json({}))
    )
    await authService.logout()
    const { queryClient } = await import('@/lib/queryClient')
    expect(queryClient.clear).toHaveBeenCalled()
  })
})

describe('authService.logoutOthers', () => {
  test('calls POST /auth/logout-others', async () => {
    server.use(
      http.post(`${API}/auth/logout-others`, () => {
        return HttpResponse.json({ message: 'Logged out 2 sessions' })
      })
    )
    const result = await authService.logoutOthers()
    expect(result).toBe('Logged out 2 sessions')
  })
})

describe('authService.logoutAll', () => {
  test('calls POST /auth/logout-all', async () => {
    let called = false
    server.use(
      http.post(`${API}/auth/logout-all`, () => {
        called = true
        return HttpResponse.json({})
      })
    )
    await authService.logoutAll()
    expect(called).toBe(true)
  })

  test('clears auth store even if backend call fails', async () => {
    server.use(
      http.post(`${API}/auth/logout-all`, () => {
        return HttpResponse.json({ detail: 'error' }, { status: 500 })
      })
    )
    useAuthStore.getState().login({ id: 1, email: 'a', name: 'a', role: 'admin' })
    expect(useAuthStore.getState().isAuthenticated).toBe(true)

    await authService.logoutAll()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  test('clears React Query cache', async () => {
    server.use(
      http.post(`${API}/auth/logout-all`, () => HttpResponse.json({}))
    )
    await authService.logoutAll()
    const { queryClient } = await import('@/lib/queryClient')
    expect(queryClient.clear).toHaveBeenCalled()
  })
})

describe('authService.isAuthenticated', () => {
  test('returns auth store isAuthenticated value', () => {
    expect(authService.isAuthenticated()).toBe(false)
    useAuthStore.getState().login({ id: 1, email: 'a', name: 'a', role: 'admin' })
    expect(authService.isAuthenticated()).toBe(true)
  })
})
