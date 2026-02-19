import { useAuthStore, migrateAuthStorage } from '@/stores/authStore'
import type { User } from '@/stores/authStore'

const testUser: User = {
  id: 1,
  email: 'admin@test.ro',
  name: 'admin',
  role: 'admin',
}

beforeEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false })
  localStorage.clear()
})

describe('login', () => {
  test('sets user and isAuthenticated=true', () => {
    useAuthStore.getState().login(testUser)
    const state = useAuthStore.getState()
    expect(state.user).toEqual(testUser)
    expect(state.isAuthenticated).toBe(true)
  })

  test('sets isLoading=false', () => {
    useAuthStore.setState({ isLoading: true })
    useAuthStore.getState().login(testUser)
    expect(useAuthStore.getState().isLoading).toBe(false)
  })
})

describe('logout', () => {
  test('clears user and sets isAuthenticated=false', () => {
    useAuthStore.getState().login(testUser)
    useAuthStore.getState().logout()
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  test('sets isLoading=false', () => {
    useAuthStore.setState({ isLoading: true })
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().isLoading).toBe(false)
  })
})

describe('setLoading', () => {
  test('updates isLoading flag', () => {
    useAuthStore.getState().setLoading(true)
    expect(useAuthStore.getState().isLoading).toBe(true)
    useAuthStore.getState().setLoading(false)
    expect(useAuthStore.getState().isLoading).toBe(false)
  })
})

describe('updateUser', () => {
  test('updates user without changing isAuthenticated', () => {
    useAuthStore.getState().login(testUser)
    const updatedUser = { ...testUser, name: 'updated' }
    useAuthStore.getState().updateUser(updatedUser)
    expect(useAuthStore.getState().user?.name).toBe('updated')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })
})

describe('migrateAuthStorage', () => {
  test('clears old token keys from localStorage', () => {
    localStorage.setItem('access_token', 'old-access')
    localStorage.setItem('refresh_token', 'old-refresh')
    // Remove flag so migration runs
    localStorage.removeItem('auth_migrated_to_cookies_v2')

    migrateAuthStorage()

    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
  })

  test('forces isAuthenticated=false in migrated data', () => {
    const oldData = {
      state: { user: testUser, isAuthenticated: true },
      version: 0,
    }
    localStorage.setItem('auth-storage', JSON.stringify(oldData))
    localStorage.removeItem('auth_migrated_to_cookies_v2')

    migrateAuthStorage()

    const stored = JSON.parse(localStorage.getItem('auth-storage')!)
    expect(stored.state.isAuthenticated).toBe(false)
  })

  test('preserves user data during migration', () => {
    const oldData = {
      state: { user: testUser, isAuthenticated: true },
      version: 0,
    }
    localStorage.setItem('auth-storage', JSON.stringify(oldData))
    localStorage.removeItem('auth_migrated_to_cookies_v2')

    migrateAuthStorage()

    const stored = JSON.parse(localStorage.getItem('auth-storage')!)
    expect(stored.state.user).toEqual(testUser)
  })

  test('sets migration flag', () => {
    localStorage.removeItem('auth_migrated_to_cookies_v2')
    migrateAuthStorage()
    expect(localStorage.getItem('auth_migrated_to_cookies_v2')).toBe('true')
  })

  test('no-ops if already migrated', () => {
    localStorage.setItem('auth_migrated_to_cookies_v2', 'true')
    localStorage.setItem('access_token', 'should-stay')
    migrateAuthStorage()
    // Token should NOT be removed because migration was already done
    expect(localStorage.getItem('access_token')).toBe('should-stay')
  })

  test('handles corrupt JSON gracefully', () => {
    localStorage.setItem('auth-storage', 'not-json{{{')
    localStorage.removeItem('auth_migrated_to_cookies_v2')

    expect(() => migrateAuthStorage()).not.toThrow()
    // Corrupt data should be removed
    expect(localStorage.getItem('auth-storage')).toBeNull()
    // Migration flag should still be set
    expect(localStorage.getItem('auth_migrated_to_cookies_v2')).toBe('true')
  })
})
