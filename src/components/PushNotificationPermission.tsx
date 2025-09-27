// Permission request component for push notifications
// Step 3: Permission request UI - NO actual subscription yet

import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useState } from 'react';

interface PushNotificationPermissionProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  className?: string;
}

/**
 * Component to request push notification permission
 * This is iOS-safe as it only requests permission, no subscription yet
 */
export function PushNotificationPermission({ 
  onPermissionGranted, 
  onPermissionDenied,
  className = ''
}: PushNotificationPermissionProps) {
  const pushStatus = usePushNotifications();
  const [isRequesting, setIsRequesting] = useState(false);
  const [lastResult, setLastResult] = useState<'granted' | 'denied' | null>(null);

  // Don't show if not supported
  if (!pushStatus.isSupported) {
    return null;
  }

  // Don't show if already granted
  if (pushStatus.permission === 'granted') {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              Notifications enabled
            </p>
            <p className="text-sm text-green-700">
              You'll receive push notifications from this app.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Don't show if already denied and can't request again
  if (pushStatus.permission === 'denied' && !pushStatus.canRequestPermission) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">
              Notifications blocked
            </p>
            <p className="text-sm text-red-700">
              You can enable notifications in your browser settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleRequestPermission = async () => {
    if (isRequesting) return;
    
    setIsRequesting(true);
    setLastResult(null);
    
    try {
      const granted = await pushStatus.requestPermission();
      setLastResult(granted ? 'granted' : 'denied');
      
      if (granted) {
        onPermissionGranted?.();
      } else {
        onPermissionDenied?.();
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      setLastResult('denied');
      onPermissionDenied?.();
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            Enable Push Notifications
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            {pushStatus.supportMessage}
          </p>
          
          {pushStatus.isSafari && pushStatus.isIOS && !pushStatus.isStandalone && (
            <p className="text-sm text-amber-700 mt-2 bg-amber-50 p-2 rounded">
              <strong>iOS Safari:</strong> For push notifications to work, please add this app to your home screen first.
            </p>
          )}
          
          <div className="mt-3">
            <button
              onClick={handleRequestPermission}
              disabled={isRequesting || !pushStatus.canRequestPermission}
              className={`
                inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md
                ${isRequesting || !pushStatus.canRequestPermission
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }
              `}
            >
              {isRequesting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Requesting...
                </>
              ) : (
                'Enable Notifications'
              )}
            </button>
          </div>
          
          {lastResult && (
            <div className={`mt-2 text-sm ${
              lastResult === 'granted' ? 'text-green-700' : 'text-red-700'
            }`}>
              {lastResult === 'granted' 
                ? '✅ Permission granted! You can now receive notifications.'
                : '❌ Permission denied. You can enable it later in browser settings.'
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
