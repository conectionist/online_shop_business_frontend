import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';

/**
 * Hook for proactive authentication validation and token refresh
 * This prevents the frustrating experience of being logged out mid-work
 */
export const useAuthValidation = () => {
  const { isAuthenticated, token } = useAuthStore();

  // Check if token is valid and refresh if needed
  const validateAndRefreshToken = useCallback(async () => {
    if (!isAuthenticated || !token) {
      return false;
    }

    try {
      // Check if token is expiring soon and refresh if needed
      await authService.refreshTokenIfNeeded();
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      // If validation fails, logout the user
      authService.logout();
      return false;
    }
  }, [isAuthenticated, token]);

  // Validate token on mount and periodically
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Initial validation
    validateAndRefreshToken();

    // Set up periodic validation every 2 minutes
    const interval = setInterval(() => {
      validateAndRefreshToken();
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, validateAndRefreshToken]);

  // Validate token before user interactions
  const validateBeforeAction = useCallback(async (actionName: string = 'action') => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    const isValid = await validateAndRefreshToken();
    if (!isValid) {
      throw new Error(`Authentication expired before ${actionName}. Please log in again.`);
    }
    return true;
  }, [isAuthenticated, validateAndRefreshToken]);

  return {
    validateBeforeAction,
    validateAndRefreshToken,
  };
};
