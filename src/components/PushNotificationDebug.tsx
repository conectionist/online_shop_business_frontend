// Debug component for push notification detection
// Step 2: Display detection results - NO actual push implementation yet

import { usePushNotifications } from '@/hooks/usePushNotifications';

interface PushNotificationDebugProps {
  show?: boolean;
}

/**
 * Debug component to display push notification detection results
 * This is safe for iOS as it only shows information, no actual push operations
 */
export function PushNotificationDebug({ show = false }: PushNotificationDebugProps) {
  const pushStatus = usePushNotifications();

  // Only show in development or when explicitly requested
  if (!show && process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs z-50">
      <h3 className="font-bold mb-2">Push Notification Debug</h3>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Supported:</span>
          <span className={pushStatus.isSupported ? 'text-green-400' : 'text-red-400'}>
            {pushStatus.isSupported ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Fully Supported:</span>
          <span className={pushStatus.isFullySupported ? 'text-green-400' : 'text-red-400'}>
            {pushStatus.isFullySupported ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Permission:</span>
          <span className={
            pushStatus.permission === 'granted' ? 'text-green-400' :
            pushStatus.permission === 'denied' ? 'text-red-400' : 'text-yellow-400'
          }>
            {pushStatus.permission}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Safari:</span>
          <span className={pushStatus.isSafari ? 'text-blue-400' : 'text-gray-400'}>
            {pushStatus.isSafari ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>iOS:</span>
          <span className={pushStatus.isIOS ? 'text-blue-400' : 'text-gray-400'}>
            {pushStatus.isIOS ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Standalone:</span>
          <span className={pushStatus.isStandalone ? 'text-green-400' : 'text-red-400'}>
            {pushStatus.isStandalone ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-600">
        <p className="text-xs text-gray-300">{pushStatus.supportMessage}</p>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs">Debug Info</summary>
          <pre className="text-xs mt-1 overflow-auto max-h-32">
            {JSON.stringify(pushStatus.debugInfo, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
