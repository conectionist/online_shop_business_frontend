import { vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import LoginPage from '../LoginPage'
import { useAuthStore } from '@/stores/authStore'

const API = 'http://localhost:8001/api/v1'

const LocationDisplay = () => {
  const location = useLocation()
  return <div data-testid="location-pathname">{location.pathname}</div>
}

beforeEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false })
})

const renderLoginPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <>
                <div>Dashboard</div>
                <LocationDisplay />
              </>
            }
          />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('LoginPage', () => {
  test('renders login form with username and password fields', () => {
    renderLoginPage()
    expect(screen.getByLabelText(/Nume de utilizator/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Parola/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Conectare/i })).toBeInTheDocument()
  })

  test('shows validation error for empty fields', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.click(screen.getByRole('button', { name: /Conectare/i }))

    expect(screen.getByText('Vă rugăm să completați toate câmpurile.')).toBeInTheDocument()
  })

  test('calls POST /auth/login on submit', async () => {
    let capturedBody: any = null
    server.use(
      http.post(`${API}/auth/login`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ id: 1, username: 'admin' })
      })
    )

    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/Nume de utilizator/i), 'admin')
    await user.type(screen.getByLabelText(/Parola/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /Conectare/i }))

    await waitFor(() => {
      expect(capturedBody).toEqual({ username: 'admin', password: 'secret123' })
    })
  })

  test('shows error message on failed login (401)', async () => {
    server.use(
      http.post(`${API}/auth/login`, () => {
        return HttpResponse.json({ detail: 'Invalid credentials' }, { status: 401 })
      })
    )

    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/Nume de utilizator/i), 'admin')
    await user.type(screen.getByLabelText(/Parola/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /Conectare/i }))

    await screen.findByText('Numele de utilizator sau parola sunt incorecte.')
  })

  test('shows error message on validation error (422)', async () => {
    server.use(
      http.post(`${API}/auth/login`, () => {
        return HttpResponse.json({ detail: 'Validation error' }, { status: 422 })
      })
    )

    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/Nume de utilizator/i), 'admin')
    await user.type(screen.getByLabelText(/Parola/i), 'pass')
    await user.click(screen.getByRole('button', { name: /Conectare/i }))

    await screen.findByText('Datele introduse nu sunt valide.')
  })

  test('redirects to /admin/dashboard on successful login', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })

    server.use(
      http.post(`${API}/auth/login`, () => {
        return HttpResponse.json({ id: 1, username: 'admin' })
      })
    )

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderLoginPage()

    await user.type(screen.getByLabelText(/Nume de utilizator/i), 'admin')
    await user.type(screen.getByLabelText(/Parola/i), 'pass123')
    await user.click(screen.getByRole('button', { name: /Conectare/i }))

    // Wait for success message
    await screen.findByText('Conectare reușită! Se redirecționează...')

    // Advance past the 500ms delay
    vi.advanceTimersByTime(600)

    await waitFor(() => {
      expect(screen.getByTestId('location-pathname')).toHaveTextContent('/admin/dashboard')
    })

    vi.useRealTimers()
  })

  test('updates auth store on successful login', async () => {
    server.use(
      http.post(`${API}/auth/login`, () => {
        return HttpResponse.json({ id: 1, username: 'testadmin' })
      })
    )

    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText(/Nume de utilizator/i), 'testadmin')
    await user.type(screen.getByLabelText(/Parola/i), 'pass123')
    await user.click(screen.getByRole('button', { name: /Conectare/i }))

    await waitFor(() => {
      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.user).toMatchObject({
        id: 1,
        email: 'testadmin',
        name: 'testadmin',
        role: 'admin',
      })
    })
  })
})
