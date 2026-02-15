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
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: User) => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      updateUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// One-time migration: Clear old auth data from localStorage-based auth
export const migrateAuthStorage = () => {
  const migrated = localStorage.getItem('auth_migrated_to_cookies_v2');

  if (!migrated) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    const oldStorage = localStorage.getItem('auth-storage');
    if (oldStorage) {
      try {
        const parsed = JSON.parse(oldStorage);
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
        localStorage.removeItem('auth-storage');
      }
    }

    localStorage.setItem('auth_migrated_to_cookies_v2', 'true');
  }
};

// Run migration on module load
migrateAuthStorage();
