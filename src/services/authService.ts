import { apiClient, getApiBaseUrl } from './api';
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
      const baseUrl = window.__RUNTIME_CONFIG__?.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || getApiBaseUrl();
      const fullUrl = `${baseUrl}/api/v1/auth/login`;
      
      console.log('Login URL:', fullUrl);
      
      const response = await apiClient.post<AuthResponse>(fullUrl, credentials);
      
      const { access_token, refresh_token, user } = response.data;
      
      // Store refresh token in localStorage (needed for refresh calls)
      localStorage.setItem('refresh_token', refresh_token);
      
      // Transform user data for our auth store
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };
      
      // Update auth store (which will also store access_token in localStorage)
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
      
      // Update token in auth store (which will also update localStorage)
      useAuthStore.getState().updateToken(access_token);
      
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return this.makeAuthenticatedRequest(async () => {
      // Use absolute URL to avoid any baseURL confusion like in login
      const baseUrl = window.__RUNTIME_CONFIG__?.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || getApiBaseUrl();
      const fullUrl = `${baseUrl}/api/v1/auth/change-password`;
      await apiClient.post(fullUrl, {
        current_password: currentPassword,
        new_password: newPassword,
      });
    });
  }

  logout(): void {
    // Clear tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Clean up push notifications on logout (security requirement)
    this.cleanupPushSubscriptions();
    
    // Clear push notification state (Samsung Internet compatible)
    this.clearPushNotificationState();
    
    // Update auth store
    useAuthStore.getState().logout();
  }

  isAuthenticated(): boolean {
    return useAuthStore.getState().isAuthenticated;
  }

  getAccessToken(): string | null {
    return useAuthStore.getState().getCurrentToken();
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

  // Clean up push notifications on logout (security requirement)
  private async cleanupPushSubscriptions(): Promise<void> {
    try {
      // Check if service worker and push manager are available
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          // Unsubscribe from push notifications
          await subscription.unsubscribe();
          console.log('Push notifications unsubscribed on logout');
        }
      }
    } catch (error) {
      // Silently fail - don't block logout if push cleanup fails
      console.warn('Failed to cleanup push subscriptions on logout:', error);
    }
  }

  // Clear push notification state (Samsung Internet compatible)
  private clearPushNotificationState(): void {
    try {
      const isSamsung = /SamsungBrowser/i.test(navigator.userAgent);
      const hasIndexedDB = 'indexedDB' in window;

      if (isSamsung && hasIndexedDB) {
        const request = indexedDB.open('PushNotificationsDB', 1);

        // Ensure the object store exists
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('subscriptions')) {
            db.createObjectStore('subscriptions');
          }
        };

        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('subscriptions', 'readwrite');
          const store = tx.objectStore('subscriptions');

          // Delete stored keys safely
          try {
            store.delete('admin_push_subscription_id');
            store.delete('admin_push_selected_topics');
          } catch (err) {
            console.warn('IndexedDB delete failed, falling back to localStorage', err);
            localStorage.removeItem('admin_push_subscription_id');
            localStorage.removeItem('admin_push_selected_topics');
          }

          tx.oncomplete = () => db.close();
        };

        request.onerror = () => {
          console.warn('IndexedDB open failed, falling back to localStorage');
          localStorage.removeItem('admin_push_subscription_id');
          localStorage.removeItem('admin_push_selected_topics');
        };
      } else {
        // Non-Samsung or no IndexedDB support
        localStorage.removeItem('admin_push_subscription_id');
        localStorage.removeItem('admin_push_selected_topics');
      }
    } catch (e) {
      console.warn('Error clearing push state, fallback to localStorage', e);
      localStorage.removeItem('admin_push_subscription_id');
      localStorage.removeItem('admin_push_selected_topics');
    }
  }
}

// Export singleton instance
export const authService = new AuthService(); 