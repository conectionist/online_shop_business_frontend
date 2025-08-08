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
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Get the full URL directly
      const baseUrl = window.__RUNTIME_CONFIG__?.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
      const fullUrl = `${baseUrl}/api/v1/auth/login`;
      
      console.log('Login URL:', fullUrl);
      
      const response = await apiClient.post<AuthResponse>(fullUrl, credentials);
      
      const { access_token, refresh_token, user } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      // Transform user data for our auth store
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };
      
      // Update auth store
      useAuthStore.getState().login(access_token, userData);
      
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

      const response = await apiClient.post<RefreshResponse>('/auth/refresh', {
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

  // Check if token is about to expire (within 5 minutes)
  isTokenExpiringSoon(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      // Decode JWT token (without verification for expiration check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

      return (expirationTime - currentTime) < fiveMinutes;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return false;
    }
  }

  // Proactively refresh token if it's expiring soon
  async refreshTokenIfNeeded(): Promise<void> {
    if (this.isTokenExpiringSoon()) {
      try {
        await this.refreshAccessToken();
        console.log('Token refreshed proactively');
      } catch (error) {
        console.error('Failed to refresh token proactively:', error);
        // Don't logout here, let the next request handle it
      }
    }
  }

  // Helper method to make authenticated requests with automatic token refresh
  async makeAuthenticatedRequest<T>(
    requestFn: () => Promise<T>
  ): Promise<T> {
    try {
      // Check if token needs refresh before making request
      await this.refreshTokenIfNeeded();
      
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