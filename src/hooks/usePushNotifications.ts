// Hook for push notification capability detection
// Step 2: Detection only - NO actual push implementation yet

import { useState, useEffect } from 'react';
import { 
  isPushSupported, 
  isPushFullySupported, 
  getNotificationPermission,
  getPushSupportMessage,
  getPushDebugInfo,
  isSafari,
  isIOS,
  isStandalone
} from '@/utils/pushNotifications';

export interface PushNotificationStatus {
  isSupported: boolean;
  isFullySupported: boolean;
  permission: NotificationPermission;
  supportMessage: string;
  isSafari: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  debugInfo: ReturnType<typeof getPushDebugInfo>;
}

/**
 * Hook to detect push notification capabilities
 * This is iOS-safe as it only does detection, no actual push operations
 */
export function usePushNotifications(): PushNotificationStatus {
  const [status, setStatus] = useState<PushNotificationStatus>(() => ({
    isSupported: false,
    isFullySupported: false,
    permission: 'denied',
    supportMessage: 'Checking...',
    isSafari: false,
    isIOS: false,
    isStandalone: false,
    debugInfo: getPushDebugInfo()
  }));

  useEffect(() => {
    // Update status when component mounts
    const updateStatus = () => {
      const debugInfo = getPushDebugInfo();
      
      setStatus({
        isSupported: isPushSupported(),
        isFullySupported: isPushFullySupported(),
        permission: getNotificationPermission(),
        supportMessage: getPushSupportMessage(),
        isSafari: isSafari(),
        isIOS: isIOS(),
        isStandalone: isStandalone(),
        debugInfo
      });
    };

    // Initial check
    updateStatus();

    // Listen for permission changes
    const handlePermissionChange = () => {
      updateStatus();
    };

    // Note: We're not actually requesting permission yet - just listening for changes
    // This is safe for iOS as we're not triggering any push operations
    if ('Notification' in window) {
      // Some browsers support permission change events
      // This is safe to add even if not supported
      try {
        window.addEventListener('notificationpermissionchange', handlePermissionChange);
      } catch (error) {
        // Ignore if not supported
      }
    }

    return () => {
      try {
        window.removeEventListener('notificationpermissionchange', handlePermissionChange);
      } catch (error) {
        // Ignore if not supported
      }
    };
  }, []);

  return status;
}

/**
 * Hook specifically for admin push notification detection
 * Includes additional checks for admin-specific requirements
 */
export function useAdminPushNotifications() {
  const pushStatus = usePushNotifications();
  
  return {
    ...pushStatus,
    canSendNotifications: pushStatus.isFullySupported && pushStatus.permission === 'granted',
    requiresStandalone: pushStatus.isSafari && pushStatus.isIOS && !pushStatus.isStandalone
  };
}

/**
 * Hook specifically for customer push notification detection
 * Includes customer-specific requirements
 */
export function useCustomerPushNotifications() {
  const pushStatus = usePushNotifications();
  
  return {
    ...pushStatus,
    canReceiveNotifications: pushStatus.isFullySupported,
    requiresStandalone: pushStatus.isSafari && pushStatus.isIOS && !pushStatus.isStandalone
  };
}
