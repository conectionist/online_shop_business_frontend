### Push Notifications Implementation (Frontend)

This document describes the exact, working push notifications implementation (ported branch), with iOS-safe guards, and how to integrate it into another branch from scratch.

### Goals
- Add Web Push support for customers/admins
- Keep PWA behavior intact (auto-update SW, runtime caching)
- Avoid breaking iOS Safari (no unguarded Notification/PushManager access; no auto-subscribe)

### High-level architecture
- Vite PWA uses strategies: injectManifest with a custom service worker in `src/sw.ts`
- Service worker handles push events and notification clicks
- Frontend exposes a small API service for VAPID key retrieval and subscription management
- A React hook manages support detection, permission, subscribe/unsubscribe, and iOS guards
- Optional UI: a banner and settings switch to let users enable notifications explicitly

### Backend assumptions
- API base is injected by `apiClient` interceptor as `/api/v1`
- Endpoints used on the frontend are referenced relative to `/api/v1`:
  - `GET /push/public-key`
  - `POST /push/subscribe`
  - `DELETE /push/subscribe?endpoint=...`
  - Optional: admin/test endpoints if available

### Files to add
1) `src/types/pushNotifications.ts`
```ts
export interface PushSubscriptionData {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  user_agent: string;
}

export interface PushSubscriptionResponse {
  id: number;
  endpoint: string;
  is_active: boolean;
}

export interface VapidPublicKeyResponse { publicKey: string }

export interface NotificationAction { action: string; title: string; icon?: string }

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;     // e.g., { url: '/orders/123' }
  actions?: NotificationAction[];
}
```

2) `src/services/pushNotifications.ts`
```ts
import { apiClient } from './api';
import { PushSubscriptionData, PushSubscriptionResponse, VapidPublicKeyResponse } from '@/types/pushNotifications';

const BASE_URL = '/push'; // apiClient adds /api/v1 prefix

export const pushNotificationService = {
  async getVapidPublicKey(): Promise<string> {
    const { data } = await apiClient.get<VapidPublicKeyResponse>(`${BASE_URL}/public-key`);
    return data.publicKey;
  },

  async subscribe(subscriptionData: PushSubscriptionData): Promise<PushSubscriptionResponse> {
    const { data } = await apiClient.post<PushSubscriptionResponse>(`${BASE_URL}/subscribe`, subscriptionData);
    return data;
  },

  async unsubscribe(endpoint: string): Promise<{ status: string }> {
    const { data } = await apiClient.delete(`${BASE_URL}/subscribe?endpoint=${encodeURIComponent(endpoint)}`);
    return data;
  },
};
```

3) `src/hooks/usePushNotifications.ts` (iOS-safe)
```ts
import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService } from '@/services/pushNotifications';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  const checkSupport = useCallback(() => (
    'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  ), []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (permission === 'granted') return true;
    if (permission === 'denied') return false;
    try {
      if (!('Notification' in window) || typeof Notification.requestPermission !== 'function') return false;
      const newPermission = await Notification.requestPermission();
      setPermission(newPermission);
      return newPermission === 'granted';
    } catch (e) {
      console.error('Notification permission request failed:', e);
      return false;
    }
  }, [permission]);

  const arrayBufferToBase64 = (buffer: ArrayBuffer | null): string => {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let bin = '';
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
    return window.btoa(bin);
  };

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(base64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) arr[i] = raw.charCodeAt(i);
    return arr;
  };

  const subscribe = useCallback(async (): Promise<boolean> => {
    try {
      if (!isSupported) throw new Error('Push not supported');
      const hasPermission = await requestPermission();
      if (!hasPermission) throw new Error('Permission denied');

      const registration = await navigator.serviceWorker.ready;
      if (!registration.pushManager || typeof registration.pushManager.subscribe !== 'function') {
        throw new Error('PushManager not available');
      }

      const existing = await registration.pushManager.getSubscription?.();
      if (existing) {
        await pushNotificationService.subscribe({
          endpoint: existing.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(existing.getKey('p256dh')),
            auth: arrayBufferToBase64(existing.getKey('auth')),
          },
          user_agent: navigator.userAgent,
        });
        setIsSubscribed(true);
        return true;
      }

      const vapidPublicKey = await pushNotificationService.getVapidPublicKey();
      const appKey = urlBase64ToUint8Array(vapidPublicKey);
      const keyBuffer = new ArrayBuffer(appKey.byteLength);
      new Uint8Array(keyBuffer).set(appKey);

      const newSub = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBuffer });
      await pushNotificationService.subscribe({
        endpoint: newSub.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(newSub.getKey('p256dh')),
          auth: arrayBufferToBase64(newSub.getKey('auth')),
        },
        user_agent: navigator.userAgent,
      });
      setIsSubscribed(true);
      return true;
    } catch (e) {
      console.error('Push subscription failed:', e);
      return false;
    }
  }, [isSupported, requestPermission]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration.pushManager) return false;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await pushNotificationService.unsubscribe(subscription.endpoint);
        setIsSubscribed(false);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Unsubscribe failed:', e);
      return false;
    }
  }, []);

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration.pushManager) { setIsSubscribed(false); return; }
      const sub = await registration.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch (e) {
      console.error('Failed to check subscription status:', e);
      setIsSubscribed(false);
    }
  }, []);

  useEffect(() => {
    const supported = checkSupport();
    setIsSupported(supported);
    const current: NotificationPermission = ('Notification' in window && typeof Notification.permission !== 'undefined')
      ? Notification.permission
      : 'denied';
    setPermission(current);
    if (supported) checkSubscriptionStatus();
  }, [checkSupport, checkSubscriptionStatus]);

  return { isSupported, isSubscribed, permission, subscribe, unsubscribe, requestPermission, checkSubscriptionStatus };
};
```

4) `src/sw.ts` (custom service worker for push)
```ts
/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Activate new SW ASAP
// @ts-ignore
self.skipWaiting();
clientsClaim();

// Injected at build time
// @ts-ignore
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Runtime caching examples
registerRoute(
  ({ url, request }) => request.method === 'GET' && url.pathname.startsWith('/api/v1') && !url.pathname.includes('/auth/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] }), new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 3600 })],
  }),
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({ cacheName: 'images-cache', plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 604800 })] }),
);

// Push handlers
self.addEventListener('push', (event: any) => {
  if (!event.data) return;
  try {
    const data = event.data.json() as any;
    const title = data.title || 'Notificare';
    const options: any = {
      body: data.body,
      icon: data.icon || '/web-app-manifest-192x192.png',
      badge: data.badge || '/web-app-manifest-192x192.png',
      tag: data.tag,
      data: data.data,
      actions: data.actions || [
        { action: 'open', title: 'Deschide aplicația', icon: '/web-app-manifest-192x192.png' },
        { action: 'close', title: 'Închide', icon: '/web-app-manifest-192x192.png' },
      ],
    };
    // @ts-ignore
    event.waitUntil((self as any).registration.showNotification(title, options));
  } catch {}
});

self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();
  if (event.action === 'close') return;
  const targetUrl = (event.notification && (event.notification as any).data && (event.notification as any).data.url) || '/';
  // @ts-ignore
  event.waitUntil((async () => {
    // @ts-ignore
    const allClients = await (self as any).clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      if (client.url && client.url.includes(new URL(targetUrl, location.origin).pathname)) {
        // @ts-ignore
        await client.focus();
        return;
      }
    }
    // @ts-ignore
    await (self as any).clients.openWindow(targetUrl);
  })());
});
```

5) `vite.config.ts` (PWA plugin)
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: { maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 },
      manifest: false,
      includeAssets: ['favicon.ico', 'favicon.svg', 'favicon-96x96.png', 'apple-touch-icon.png', 'offline.html'],
      devOptions: { enabled: process.env.NODE_ENV !== 'production' },
    }),
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
```

6) `src/components/ui/PushNotificationBanner.tsx` (no auto-subscribe)
```tsx
import React from 'react';
import { Button } from '@/components/ui/Button';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const PushNotificationBanner: React.FC = () => {
  const { isSupported, permission, subscribe } = usePushNotifications();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const handler = () => {
      if (isSupported && permission === 'default') setVisible(true);
      else setVisible(false);
    };
    window.addEventListener('show-push-banner', handler as EventListener);
    return () => window.removeEventListener('show-push-banner', handler as EventListener);
  }, [isSupported, permission]);

  if (!visible) return null;

  const onEnable = async () => {
    if (!isSupported) return;
    const ok = await subscribe();
    if (ok) setVisible(false);
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Activează notificările</h3>
          <p className="text-sm text-blue-100">Primește notificări despre comenzi și actualizări importante</p>
        </div>
        <button onClick={() => setVisible(false)} className="ml-4 text-blue-200 hover:text-white">✕</button>
      </div>
      <div className="mt-3 flex gap-2">
        <Button onClick={onEnable} size="sm" variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50">Activează</Button>
        <Button onClick={() => setVisible(false)} variant="ghost" size="sm" className="text-white hover:bg-white/10">Mai târziu</Button>
      </div>
    </div>
  );
};

export default PushNotificationBanner;
```

### Integration steps (into an existing PWA branch)
1) Add files from sections above
2) Update `vite.config.ts` to use `strategies: 'injectManifest'` and point to `src/sw.ts`
3) Ensure icons referenced by SW exist in `public/`:
   - `/web-app-manifest-192x192.png`
   - `/web-app-manifest-512x512.png`
   - Add `public/favicon/site.webmanifest` entries if needed
4) Register SW in `src/main.tsx` using `virtual:pwa-register` (autoUpdate) if not already present
5) Render `PushNotificationBanner` in a global layout or trigger it via a custom event:
   ```ts
   window.dispatchEvent(new Event('show-push-banner'))
   ```
6) Verify API base URL environment and CORS

### iOS/Safari notes
- Never access `Notification.permission` or call `Notification.requestPermission()` without `'Notification' in window` guard
- Do not auto-subscribe on page load; require a user action
- iOS Safari requires PWA standalone mode for Web Push

### Testing checklist
- Permission request flows (default → granted/denied)
- Subscribe/unsubscribe and backend persistence
- Push delivery on Android/desktop browsers
- iOS PWA stability (no blank screen, no runtime errors)
- Notification click opens/focuses the intended URL (`data.url`)

### Troubleshooting
- If push events don’t fire, ensure `strategies: 'injectManifest'` is used and the custom `src/sw.ts` is built into `dist/sw.js`
- If icons 404 in notifications, align SW icon paths with actual files in `public/`
- If the app goes blank on iOS, check for unguarded Notification/PushManager access

### Security and production
- HTTPS only; never expose private VAPID keys
- Validate and sanitize subscription payloads server-side
- Clean up subscriptions on logout or when endpoints become invalid

This guide mirrors the known-working implementation and can be applied incrementally to an existing PWA codebase.


