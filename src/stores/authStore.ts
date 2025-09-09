import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'customer';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: User) => void;
  updateToken: (token: string) => void;
  getCurrentToken: () => string | null;
  validateTokenOnInit: () => Promise<boolean>;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (token: string, user: User) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Store token in localStorage for backward compatibility
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', token); // Temporary, should be separate
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        
        // Remove tokens from localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      updateUser: (user: User) => {
        set({ user });
      },

      updateToken: (token: string) => {
        set({ token });
        // Update token in localStorage for backward compatibility
        localStorage.setItem('access_token', token);
      },

      getCurrentToken: () => {
        return get().token;
      },

      // Validate token on store initialization
      validateTokenOnInit: async () => {
        const state = get();
        if (!state.isAuthenticated || !state.token) {
          return false;
        }

        try {
          // Check if token is expiring soon
          if (authService.isTokenExpiringSoon()) {
            console.log('Token is expiring soon, refreshing...');
            await authService.refreshAccessToken();
            return true;
          }
          return true;
        } catch (error) {
          console.error('Token validation failed on init:', error);
          // If validation fails, logout
          get().logout();
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 