# Push Notifications Implementation Plan

This document outlines the complete implementation plan for integrating push notifications into the frontend application, based on the existing backend API support and current PWA infrastructure.

## Current State Analysis

### ✅ Already Implemented

1. **PWA Foundation**:
   - Vite PWA plugin configured (`vite-plugin-pwa`)
   - Service worker registered via `virtual:pwa-register` in `main.tsx`
   - PWA install button component (`PWAInstallButton.tsx`)
   - Web app manifest (`public/favicon/site.webmanifest`)
   - Offline support with Workbox caching

2. **Infrastructure**:
   - API client with proper base URL handling
   - Authentication service for protected requests
   - Toast notification system for user feedback
   - Error handling utilities

### ❌ Missing for Push Notifications

1. **No Push Notification Service**: No `pushNotifications.ts` service file
2. **No Service Worker for Push**: Current service worker only handles PWA updates, not push events
3. **No Push API Integration**: No VAPID key handling, subscription management
4. **No Push UI Components**: No subscription controls or permission handling
5. **No Push Types**: No TypeScript types for push notification data structures

## Backend API Support

The backend already provides complete push notification support:

- **VAPID Key Management**: `GET /api/v1/push/public-key`
- **Subscription Management**: 
  - `POST /api/v1/push/subscribe` - Subscribe to notifications
  - `DELETE /api/v1/push/subscribe` - Unsubscribe from notifications
- **Server-side Deduplication**: Using `event_id` parameter
- **Admin Test Endpoint**: For testing notifications
- **Automatic Cleanup**: Inactive subscription cleanup

## Implementation Plan

### Phase 1: Core Infrastructure

#### 1.1 TypeScript Types
**File**: `src/types/pushNotifications.ts`

```typescript
export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  user_agent: string;
}

export interface PushSubscriptionResponse {
  id: number;
  endpoint: string;
  is_active: boolean;
}

export interface VapidPublicKeyResponse {
  publicKey: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}
```

#### 1.2 API Service
**File**: `src/services/pushNotifications.ts`

```typescript
import { apiClient } from './api';
import { 
  PushSubscriptionData, 
  PushSubscriptionResponse, 
  VapidPublicKeyResponse 
} from '@/types/pushNotifications';

const BASE_URL = '/api/v1/push';

export const pushNotificationService = {
  // Get VAPID public key
  async getVapidPublicKey(): Promise<string> {
    const response = await apiClient.get<VapidPublicKeyResponse>(`${BASE_URL}/public-key`);
    return response.data.publicKey;
  },

  // Subscribe to push notifications
  async subscribe(subscriptionData: PushSubscriptionData): Promise<PushSubscriptionResponse> {
    const response = await apiClient.post<PushSubscriptionResponse>(
      `${BASE_URL}/subscribe`, 
      subscriptionData
    );
    return response.data;
  },

  // Unsubscribe from push notifications
  async unsubscribe(endpoint: string): Promise<{ status: string }> {
    const response = await apiClient.delete(`${BASE_URL}/subscribe?endpoint=${encodeURIComponent(endpoint)}`);
    return response.data;
  }
};
```

#### 1.3 Custom Hook
**File**: `src/hooks/usePushNotifications.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService } from '@/services/pushNotifications';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Check browser support
  const checkSupport = useCallback(() => {
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window;
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (permission === 'granted') return true;
    if (permission === 'denied') return false;
    
    const newPermission = await Notification.requestPermission();
    setPermission(newPermission);
    return newPermission === 'granted';
  }, [permission]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    try {
      if (!isSupported) throw new Error('Push notifications not supported');
      
      const hasPermission = await requestPermission();
      if (!hasPermission) throw new Error('Permission denied');
      
      const vapidPublicKey = await pushNotificationService.getVapidPublicKey();
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });
      
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: arrayBufferToBase64(subscription.getKey('auth'))
        },
        user_agent: navigator.userAgent
      };
      
      await pushNotificationService.subscribe(subscriptionData);
      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return false;
    }
  }, [isSupported, requestPermission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await pushNotificationService.unsubscribe(subscription.endpoint);
        setIsSubscribed(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      return false;
    }
  }, []);

  // Check current subscription status
  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      setIsSubscribed(false);
    }
  }, []);

  // Initialize hook
  useEffect(() => {
    const supported = checkSupport();
    setIsSupported(supported);
    setPermission(Notification.permission);
    
    if (supported) {
      checkSubscriptionStatus();
    }
  }, [checkSupport, checkSubscriptionStatus]);

  return {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
    requestPermission,
    checkSubscriptionStatus
  };
};

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
```

#### 1.4 Service Worker Update
**File**: `public/sw.js`

```javascript
// Extend existing service worker to handle push notifications
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/web-app-manifest-192x192.png',
      badge: '/web-app-manifest-192x192.png',
      tag: data.tag,
      data: data.data,
      actions: data.actions || [
        {
          action: 'open',
          title: 'Deschide aplicația',
          icon: '/web-app-manifest-192x192.png'
        },
        {
          action: 'close',
          title: 'Închide',
          icon: '/web-app-manifest-192x192.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event);
});
```

### Phase 2: UI Components

#### 2.1 Push Notification Settings Component
**File**: `src/components/ui/PushNotificationSettings.tsx`

```typescript
import React from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';

export const PushNotificationSettings: React.FC = () => {
  const { 
    isSupported, 
    isSubscribed, 
    permission, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications();

  const handleToggle = async (enabled: boolean) => {
    if (enabled) {
      await subscribe();
    } else {
      await unsubscribe();
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800">
          Notificările push nu sunt suportate în acest browser.
        </p>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800 mb-2">
          Notificările au fost blocate. Pentru a activa notificările, vă rugăm să:
        </p>
        <ol className="list-decimal list-inside text-red-700 text-sm space-y-1">
          <li>Faceți clic pe iconița de blocare din bara de adrese</li>
          <li>Selectați "Permite notificările"</li>
          <li>Reîncărcați pagina</li>
        </ol>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Notificări Push
          </h3>
          <p className="text-sm text-gray-500">
            Primește notificări despre comenzi și actualizări
          </p>
        </div>
        <Switch
          checked={isSubscribed}
          onCheckedChange={handleToggle}
          disabled={permission === 'default'}
        />
      </div>
      
      {permission === 'default' && (
        <Button
          onClick={() => subscribe()}
          className="w-full"
        >
          Activează notificările
        </Button>
      )}
      
      {isSubscribed && (
        <p className="text-sm text-green-600">
          ✓ Notificările sunt activate
        </p>
      )}
    </div>
  );
};
```

#### 2.2 Permission Request Banner
**File**: `src/components/ui/PushNotificationBanner.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

export const PushNotificationBanner: React.FC = () => {
  const { isSupported, permission, subscribe } = usePushNotifications();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner if push is supported and permission is default
    if (isSupported && permission === 'default') {
      setIsVisible(true);
    }
  }, [isSupported, permission]);

  const handleEnable = async () => {
    const success = await subscribe();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold mb-1">
            Activează notificările
          </h3>
          <p className="text-sm text-blue-100">
            Primește notificări despre comenzi și actualizări importante
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-4 text-blue-200 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          onClick={handleEnable}
          size="sm"
          className="bg-white text-blue-600 hover:bg-blue-50"
        >
          Activează
        </Button>
        <Button
          onClick={handleDismiss}
          variant="outline"
          size="sm"
          className="border-blue-300 text-white hover:bg-blue-500"
        >
          Mai târziu
        </Button>
      </div>
    </div>
  );
};
```

### Phase 3: Integration & Testing

#### 3.1 Admin Panel Integration
**File**: `src/pages/admin/PushNotificationsTab.tsx`

```typescript
import React from 'react';
import { PushNotificationSettings } from '@/components/ui/PushNotificationSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export const PushNotificationsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Setări Notificări Push</CardTitle>
        </CardHeader>
        <CardContent>
          <PushNotificationSettings />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Test Notificări</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Testează notificările push pentru a verifica funcționalitatea.
          </p>
          <Button
            onClick={() => {
              // This would call a backend test endpoint
              console.log('Test notification requested');
            }}
          >
            Trimite notificare de test
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
```

#### 3.2 App Integration
**File**: `src/App.tsx` (additions)

```typescript
// Add to existing App.tsx
import { PushNotificationBanner } from '@/components/ui/PushNotificationBanner';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <PushNotificationBanner />
        <OfflineBanner />
        {/* ... rest of existing code */}
      </ToastProvider>
    </QueryClientProvider>
  );
}
```

### Phase 4: Production Readiness

#### 4.1 PWA Manifest Update
**File**: `public/favicon/site.webmanifest` (additions)

```json
{
  "name": "Paine cu Maia de la Andreea",
  "short_name": "PCMA",
  "icons": [
    { "src": "/web-app-manifest-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/web-app-manifest-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/web-app-manifest-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/web-app-manifest-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/",
  "scope": "/",
  "orientation": "portrait",
  "id": "/",
  "gcm_sender_id": "103953800507"
}
```

#### 4.2 Error Handling & Cleanup
**File**: `src/hooks/usePushNotifications.ts` (additions)

```typescript
// Add cleanup on logout
useEffect(() => {
  const handleLogout = () => {
    if (isSubscribed) {
      unsubscribe();
    }
  };

  // Listen for logout events
  window.addEventListener('user-logout', handleLogout);
  
  return () => {
    window.removeEventListener('user-logout', handleLogout);
  };
}, [isSubscribed, unsubscribe]);
```

## Implementation Order

1. **Phase 1**: Core Infrastructure
   - Create types
   - Create API service
   - Create custom hook
   - Update service worker

2. **Phase 2**: UI Components
   - Create settings component
   - Create permission banner
   - Test components in isolation

3. **Phase 3**: Integration
   - Add to admin panel
   - Integrate with main app
   - Test full flow

4. **Phase 4**: Production
   - Update manifest
   - Add error handling
   - Add cleanup logic
   - Final testing

## Testing Strategy

### Manual Testing
1. **Permission Flow**: Test permission request and denial
2. **Subscription Flow**: Test subscribe/unsubscribe
3. **Notification Display**: Test notification appearance
4. **Notification Actions**: Test click and close actions
5. **Error Handling**: Test network errors and edge cases

### Browser Testing
- Chrome (primary)
- Firefox
- Safari (iOS)
- Edge

### Device Testing
- Desktop
- Mobile (Android/iOS)
- Tablet

## Security Considerations

1. **HTTPS Required**: Push notifications only work over HTTPS
2. **VAPID Keys**: Never expose private keys to frontend
3. **Validation**: Always validate subscription data
4. **Cleanup**: Unsubscribe on logout
5. **Permission Handling**: Respect user permission choices

## Performance Considerations

1. **Lazy Loading**: Only load push code when needed
2. **Error Recovery**: Handle subscription failures gracefully
3. **Memory Management**: Clean up event listeners
4. **Network Efficiency**: Minimize API calls

## User Experience Guidelines

1. **Progressive Enhancement**: Make push notifications optional
2. **Clear UI**: Show subscription status and controls
3. **Permission Handling**: Guide users through permission process
4. **Fallback**: Provide alternative notification methods
5. **Romanian Language**: All user-facing text in Romanian
6. **Theme Integration**: Use centralized theme system for user-facing components

## Success Metrics

1. **Subscription Rate**: Percentage of users who enable notifications
2. **Permission Grant Rate**: Percentage of users who grant permission
3. **Notification Click Rate**: Percentage of notifications clicked
4. **Error Rate**: Percentage of failed subscriptions/notifications
5. **User Satisfaction**: Feedback on notification experience

## Maintenance

1. **Regular Testing**: Test push notifications after each deployment
2. **Browser Updates**: Monitor browser compatibility changes
3. **API Changes**: Monitor backend API changes
4. **User Feedback**: Collect and act on user feedback
5. **Analytics**: Monitor push notification metrics

---

This implementation plan provides a comprehensive roadmap for integrating push notifications into the frontend application while maintaining the existing PWA functionality and following the established patterns and preferences of the codebase.
