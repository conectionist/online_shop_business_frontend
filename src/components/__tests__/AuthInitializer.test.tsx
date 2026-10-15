import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import AuthInitializer from '../AuthInitializer'
import { useAuthStore } from '@/stores/authStore'

const API = 'http://localhost:8001/api/v1'

const renderAuthInitializer = () => {
  return render(
    <BrowserRouter>
      <AuthInitializer>
        <div>App Content</div>
      </AuthInitializer>
    </BrowserRouter>
  )
}

beforeEach(() => {
  useAuthStore.getState().logout()
})

describe('AuthInitializer — when user appears authenticated', () => {
  beforeEach(() => {
    useAuthStore.getState().login({ id: 1, email: 'admin', name: 'admin', role: 'admin' })
  })

  test('shows loading spinner during initialization', async () => {
    server.use(
      http.get(`${API}/auth/me`, async () => {
        // Delay response to keep spinner visible
        await new Promise(r => setTimeout(r, 100))
        return HttpResponse.json({ id: 1, username: 'admin' })
      })
    )
    renderAuthInitializer()
    expect(screen.getByText('Se inițializează aplicația...')).toBeInTheDocument()
    // Let the delayed response land in this test: arriving later, it would log the
    // shared store back in during another test
    await screen.findByText('App Content')
  })

  test('calls GET /auth/me to validate session', async () => {
    let handlerCalled = false
    server.use(
      http.get(`${API}/auth/me`, () => {
        handlerCalled = true
        return HttpResponse.json({ id: 1, username: 'admin' })
      })
    )
    renderAuthInitializer()
    await screen.findByText('App Content')
    expect(handlerCalled).toBe(true)
  })

  test('renders children after successful validation', async () => {
    server.use(
      http.get(`${API}/auth/me`, () => {
        return HttpResponse.json({ id: 1, username: 'admin' })
      })
    )
    renderAuthInitializer()
    await screen.findByText('App Content')
    expect(screen.queryByText('Se inițializează aplicația...')).not.toBeInTheDocument()
  })

  test('updates user data from /auth/me response', async () => {
    // Subscribe to store changes to capture the login update reliably,
    // since getState() can miss updates due to persist middleware timing.
    const userSnapshots: any[] = []
    const unsub = useAuthStore.subscribe((state) => {
      if (state.user) userSnapshots.push({ ...state.user })
    })

    server.use(
      http.get(`${API}/auth/me`, () => {
        return HttpResponse.json({ id: 42, username: 'superadmin' })
      })
    )
    renderAuthInitializer()
    await screen.findByText('App Content')

    await waitFor(() => {
      expect(userSnapshots).toContainEqual(
        expect.objectContaining({
          id: 42,
          email: 'superadmin',
          name: 'superadmin',
          role: 'admin',
        })
      )
    })

    unsub()
  })

  test('logs out and renders children when /auth/me fails (401)', async () => {
    // The 401 from /auth/me triggers the axios interceptor which tries to refresh.
    // We need to also fail the refresh so the interceptor gives up and logs out.
    const consoleError = vi.spyOn(console, 'error')
    server.use(
      http.get(`${API}/auth/me`, () => {
        return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 })
      }),
      http.post(`${API}/auth/refresh`, () => {
        return HttpResponse.json({ detail: 'Token expired' }, { status: 401 })
      })
    )
    renderAuthInitializer()
    await screen.findByText('App Content')

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    // The interceptor logs the store out before its own chain ends, which already shows
    // the children. Wait for AuthInitializer to handle the failure: finishing after the
    // test environment is torn down, the chain throws "window is not defined".
    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith('Auth initialization failed:', expect.anything())
    )
    consoleError.mockRestore()
  })
})

describe('AuthInitializer — when user is not authenticated', () => {
  test('skips /auth/me call', async () => {
    let handlerCalled = false
    server.use(
      http.get(`${API}/auth/me`, () => {
        handlerCalled = true
        return HttpResponse.json({ id: 1, username: 'admin' })
      })
    )
    renderAuthInitializer()
    await screen.findByText('App Content')
    expect(handlerCalled).toBe(false)
  })

  test('renders children immediately (after init)', async () => {
    renderAuthInitializer()
    await screen.findByText('App Content')
  })
})
