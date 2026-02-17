import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute'
import { useAuthStore } from '@/stores/authStore'

const LocationDisplay = () => {
  const location = useLocation()
  return (
    <>
      <div data-testid="location-pathname">{location.pathname}</div>
      <div data-testid="location-state">{JSON.stringify(location.state)}</div>
    </>
  )
}

beforeEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false })
})

const renderProtectedRoute = (initialPath = '/protected') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <>
              <div>Login Page</div>
              <LocationDisplay />
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  test('renders children when authenticated', () => {
    useAuthStore.setState({ isAuthenticated: true, isLoading: false })
    renderProtectedRoute()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  test('redirects to /login when not authenticated', () => {
    useAuthStore.setState({ isAuthenticated: false, isLoading: false })
    renderProtectedRoute()
    expect(screen.getByTestId('location-pathname')).toHaveTextContent('/login')
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  test('preserves location state (return URL) in redirect', () => {
    useAuthStore.setState({ isAuthenticated: false, isLoading: false })
    renderProtectedRoute('/protected')
    expect(screen.getByTestId('location-pathname')).toHaveTextContent('/login')
    const stateEl = screen.getByTestId('location-state')
    const state = JSON.parse(stateEl.textContent!)
    expect(state.from.pathname).toBe('/protected')
  })

  test('shows loading spinner when isLoading=true', () => {
    useAuthStore.setState({ isAuthenticated: false, isLoading: true })
    renderProtectedRoute()
    expect(screen.getByText('Se verifică autentificarea...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
