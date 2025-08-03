import { apiClient } from './api';
import { useAuthStore } from '@/stores/authStore';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: 'admin' | 'customer';
  };
}

export interface RefreshResponse {
  access_token: string;
}

class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = '/auth';
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(`${this.baseURL}/login`, credentials);
      
      const { access_token, refresh_token, user } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      // Update auth store
      useAuthStore.getState().login(access_token, user);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async refreshAccessToken(): Promise<RefreshResponse> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<RefreshResponse>(`${this.baseURL}/refresh`, {
        refresh_token: refreshToken,
      });

      const { access_token } = response.data;
      
      // Update stored token
      localStorage.setItem('access_token', access_token);
      
      // Update auth store token
      useAuthStore.getState().updateToken(access_token);
      
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      throw error;
    }
  }

  logout(): void {
    // Clear tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Update auth store
    useAuthStore.getState().logout();
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // Helper method to make authenticated requests with automatic token refresh
  async makeAuthenticatedRequest<T>(
    requestFn: () => Promise<T>
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error: any) {
      // If we get a 401, try to refresh the token and retry once
      if (error.response?.status === 401) {
        try {
          await this.refreshAccessToken();
          // Retry the request with new token
          return await requestFn();
        } catch (refreshError) {
          // If refresh fails, logout and throw error
          this.logout();
          throw new Error('Authentication failed');
        }
      }
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService(); 