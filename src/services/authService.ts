import { apiClient } from './api';
import { useAuthStore } from '@/stores/authStore';

export interface LoginCredentials {
  username: string;
  password: string;
}

// Response from /auth/login (cookie-only mode)
// Tokens are in cookies, not response body
export interface AuthResponse {
  id: number;
  username: string;
  expires_in?: number;  // Cookie expiration (e.g., 1800 seconds)
}

// Response from /auth/refresh (cookie-only mode)
// Backend updates cookies via Set-Cookie headers
export interface RefreshResponse {
  success?: boolean;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Attempting login...');

      // Backend sets cookies via Set-Cookie headers
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

      // Extract user info only (no tokens in response body)
      const userData = {
        id: response.data.id,
        email: response.data.username,  // Backend returns 'username'
        name: response.data.username,
        role: 'admin' as const  // Assuming admin for now
      };

      // Update auth store (NO token parameter)
      useAuthStore.getState().login(userData);

      console.log('Login successful, cookies set by backend');
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async refreshAccessToken(): Promise<void> {
    try {
      // Backend reads refresh_token from cookie automatically
      // Backend updates cookies via Set-Cookie headers
      await apiClient.post('/auth/refresh');

      console.log('Token refreshed successfully (cookies updated by backend)');
      // No need to update anything in frontend state - cookies are managed by browser
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.logout();
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // Use relative path (consistent with other endpoints)
    // 401 interceptor handles token refresh automatically
    await apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  async logout(): Promise<void> {
    try {
      // Call backend to clear cookies
      await apiClient.post('/auth/logout');
      console.log('Logged out, cookies cleared by backend');
    } catch (error) {
      // Even if backend call fails, clear local state
      console.warn('Logout request failed, clearing local state anyway:', error);
    }

    // Clean up push notifications (keep this!)
    await this.cleanupPushSubscriptions();

    // Clear React Query cache
    const { queryClient } = await import('@/lib/queryClient');
    queryClient.clear();

    // Update auth store
    useAuthStore.getState().logout();
  }

  isAuthenticated(): boolean {
    return useAuthStore.getState().isAuthenticated;
  }

  // Removed obsolete methods (cookie-based auth doesn't need them):
  // - getAccessToken() - can't access httpOnly cookies from JS
  // - getRefreshToken() - can't access httpOnly cookies from JS
  // - isTokenExpiringSoon() - can't decode httpOnly cookies
  // - refreshTokenIfNeeded() - backend manages cookie expiry
  // - makeAuthenticatedRequest() - 401 interceptor handles refresh

  // Clean up push notifications on logout (security requirement)
  private async cleanupPushSubscriptions(): Promise<void> {
    try {
      // Check if service worker and push manager are available
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          // Unsubscribe from browser
          await subscription.unsubscribe();
          
          // Also tell the server to remove this browser's subscription
          const { pushNotificationService } = await import('./pushNotifications');
          await pushNotificationService.unsubscribe(subscription.endpoint);
          
          console.log('Push notifications unsubscribed on logout');
        }
      }
    } catch (error) {
      // Silently fail - don't block logout if push cleanup fails
      console.warn('Failed to cleanup push subscriptions on logout:', error);
    }
  }

}

// Export singleton instance
export const authService = new AuthService(); 