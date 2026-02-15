import { apiClient } from './api';
import { useAuthStore } from '@/stores/authStore';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  expires_in?: number;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

      const userData = {
        id: response.data.id,
        email: response.data.username,  // Backend returns 'username'
        name: response.data.username,
        // TODO(SECURITY): Role is hardcoded to 'admin'. When user accounts are added,
        // this MUST be read from the backend response. Failing to update this is a privilege escalation bug.
        role: 'admin' as const,
      };

      useAuthStore.getState().login(userData);

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async refreshAccessToken(): Promise<void> {
    try {
      await apiClient.post('/auth/refresh');
    } catch (error) {
      console.error('Token refresh error:', error);
      // Don't call this.logout() here - the interceptor handles cleanup.
      // Calling logout would trigger POST /auth/logout which also fails,
      // causing unnecessary requests.
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Logout request failed, clearing local state anyway:', error);
    }

    await this.cleanupPushSubscriptions();

    const { queryClient } = await import('@/lib/queryClient');
    queryClient.clear();

    useAuthStore.getState().logout();
  }

  async logoutOthers(): Promise<string> {
    const response = await apiClient.post<{ message: string }>('/auth/logout-others');
    return response.data.message;
  }

  async logoutAll(): Promise<void> {
    try {
      await apiClient.post('/auth/logout-all');
    } catch (error) {
      console.warn('Logout-all request failed, clearing local state anyway:', error);
    }

    await this.cleanupPushSubscriptions();

    const { queryClient } = await import('@/lib/queryClient');
    queryClient.clear();

    useAuthStore.getState().logout();
  }

  isAuthenticated(): boolean {
    return useAuthStore.getState().isAuthenticated;
  }

  private async cleanupPushSubscriptions(): Promise<void> {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          await subscription.unsubscribe();

          const { pushNotificationService } = await import('./pushNotifications');
          await pushNotificationService.unsubscribe(subscription.endpoint);
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup push subscriptions on logout:', error);
    }
  }

}

// Export singleton instance
export const authService = new AuthService();
