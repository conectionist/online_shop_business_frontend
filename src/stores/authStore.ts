import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'customer';
}

export interface AuthState {
  user: User | null;
  // token removed - stored in httpOnly cookies
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  login: (user: User) => void;  // No token parameter
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: User) => void;
  // Removed: updateToken, getCurrentToken, validateTokenOnInit
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (user: User) => {  // No token parameter
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        // No token storage - cookies handle this
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        // Backend clears cookies
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      updateUser: (user: User) => {
        set({ user });
      },

      // Removed obsolete methods (cookie-based auth doesn't need them):
      // - updateToken() - can't update httpOnly cookies from JS
      // - getCurrentToken() - can't access httpOnly cookies from JS
      // - validateTokenOnInit() - backend validates via /auth/me
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // token removed
      }),
    }
  )
);

// One-time migration: Clear old auth data
export const migrateAuthStorage = () => {
  const migrated = localStorage.getItem('auth_migrated_to_cookies_v2');

  if (!migrated) {
    console.log('Migrating auth storage to cookie-based model...');

    // Clear old token storage (if any)
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // Clear old Zustand persist (has token field)
    const oldStorage = localStorage.getItem('auth-storage');
    if (oldStorage) {
      try {
        const parsed = JSON.parse(oldStorage);
        // Keep user and isAuthenticated, remove token
        const migrated = {
          state: {
            user: parsed.state?.user || null,
            isAuthenticated: false,  // Force re-auth to be safe
            isLoading: false,
          },
          version: 0,
        };
        localStorage.setItem('auth-storage', JSON.stringify(migrated));
      } catch (e) {
        // If parsing fails, just remove it
        localStorage.removeItem('auth-storage');
      }
    }

    localStorage.setItem('auth_migrated_to_cookies_v2', 'true');
    console.log('Migration complete. Please log in again if needed.');
  }
};

// Run migration on module load
migrateAuthStorage(); 