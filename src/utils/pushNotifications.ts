// Push notification utility functions
// Step 2: Browser capability detection only - NO actual push implementation yet

/**
 * Check if the browser supports push notifications
 * This is iOS-safe as it only does detection, no actual push operations
 */
export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Check if the browser is Safari (iOS/macOS)
 * Safari has specific requirements for PWA push notifications
 */
export function isSafari(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('safari') && !userAgent.includes('chrome');
}

/**
 * Check if the device is iOS
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Check if the device is macOS
 */
export function isMacOS(): boolean {
  // Use modern userAgentData API when available
  if ('userAgentData' in navigator) {
    return (navigator as any).userAgentData.platform === 'macOS';
  }
  
  // Fallback to userAgent string detection
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('mac os x') || userAgent.includes('macintosh');
}

/**
 * Check if the PWA is running in standalone mode (added to home screen)
 * This is important for iOS push notifications
 */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Get the current notification permission status
 * This is safe to call on all browsers
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Check if push notifications are supported and properly configured
 * This combines all the checks needed for a working push notification setup
 */
export function isPushFullySupported(): boolean {
  // Basic browser support
  if (!isPushSupported()) {
    return false;
  }

  // For Safari/iOS, check if it's in standalone mode
  if (isSafari() && isIOS()) {
    return isStandalone();
  }

  // For other browsers, basic support is enough
  return true;
}

/**
 * Get a user-friendly message about push notification support
 * This helps with debugging and user education
 */
export function getPushSupportMessage(): string {
  if (!isPushSupported()) {
    return 'Push notifications are not supported in this browser.';
  }

  if (isSafari() && isIOS()) {
    if (!isStandalone()) {
      return 'Push notifications on iOS require adding this app to your home screen.';
    }
    return 'Push notifications are supported on this device.';
  }

  return 'Push notifications are supported in this browser.';
}

/**
 * Debug information about push notification support
 * Useful for development and troubleshooting
 */
export function getPushDebugInfo() {
  return {
    isPushSupported: isPushSupported(),
    isSafari: isSafari(),
    isIOS: isIOS(),
    isMacOS: isMacOS(),
    isStandalone: isStandalone(),
    permission: getNotificationPermission(),
    userAgent: navigator.userAgent,
    platform: 'userAgentData' in navigator ? (navigator as any).userAgentData.platform : 'detected via userAgent',
    isFullySupported: isPushFullySupported(),
    supportMessage: getPushSupportMessage()
  };
}
