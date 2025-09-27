// Debug component for push notification detection
// Step 2: Display detection results - NO actual push implementation yet

import { usePushNotifications } from '@/hooks/usePushNotifications';
import { PushNotificationPermission } from './PushNotificationPermission';
import { useVapidKey } from '@/hooks/useVapidKey';
import { useCustomerPushSubscription } from '@/hooks/usePushSubscription';

interface PushNotificationDebugProps {
  show?: boolean;
}

/**
 * Debug component to display push notification detection results
 * This is safe for iOS as it only shows information, no actual push operations
 */
export function PushNotificationDebug({ show = false }: PushNotificationDebugProps) {
  const pushStatus = usePushNotifications();
  const { data: vapidKey, isLoading: vapidLoading, error: vapidError } = useVapidKey();
  const subscription = useCustomerPushSubscription();

  // Show when explicitly requested or in development
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
        
        <div className="flex justify-between">
          <span>VAPID Key:</span>
          <span className={
            vapidLoading ? 'text-yellow-400' :
            vapidError ? 'text-red-400' :
            vapidKey ? 'text-green-400' : 'text-gray-400'
          }>
            {vapidLoading ? 'Loading...' :
             vapidError ? 'Error' :
             vapidKey ? 'Available' : 'Not loaded'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Subscribed:</span>
          <span className={
            subscription.isSubscribing ? 'text-yellow-400' :
            subscription.isSubscribed ? 'text-green-400' :
            subscription.error ? 'text-red-400' : 'text-gray-400'
          }>
            {subscription.isSubscribing ? 'Subscribing...' :
             subscription.isSubscribed ? 'Yes' :
             subscription.error ? 'Error' : 'No'}
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
      
      {/* Permission Request Component - show in production for testing */}
      <div className="mt-4 pt-2 border-t border-gray-600">
        <h4 className="text-xs font-bold mb-2">Permission Test:</h4>
        <PushNotificationPermission 
          onPermissionGranted={() => console.log('Permission granted!')}
          onPermissionDenied={() => console.log('Permission denied!')}
          className="text-xs"
        />
      </div>
      
      {/* Subscription Test - THE MOMENT OF TRUTH! */}
      <div className="mt-4 pt-2 border-t border-gray-600">
        <h4 className="text-xs font-bold mb-2">Subscription Test:</h4>
        <div className="space-y-2">
          <button
            onClick={subscription.subscribe}
            disabled={!subscription.canSubscribe}
            className={`
              w-full px-2 py-1 text-xs rounded
              ${subscription.canSubscribe 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }
            `}
          >
            {subscription.isSubscribing ? 'Subscribing...' : 'Subscribe to Push'}
          </button>
          
          <button
            onClick={subscription.unsubscribe}
            disabled={!subscription.canUnsubscribe}
            className={`
              w-full px-2 py-1 text-xs rounded
              ${subscription.canUnsubscribe 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }
            `}
          >
            {subscription.isUnsubscribing ? 'Unsubscribing...' : 'Unsubscribe'}
          </button>
          
          {subscription.error && (
            <p className="text-xs text-red-400">{subscription.error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
