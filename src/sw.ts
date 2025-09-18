/* eslint-disable no-restricted-globals */
/* eslint-disable no-underscore-dangle */

import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'

// Activate new service worker as soon as it's finished installing
// @ts-ignore
self.skipWaiting()
clientsClaim()

// Precache assets injected at build time
// @ts-ignore
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Keep runtime caching parity with previous config
registerRoute(
  ({ url, request }) => request.method === 'GET' && url.pathname.startsWith('/api/v1') && !url.pathname.includes('/auth/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 }),
    ],
  }),
)

registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 7 * 24 * 60 * 60 })],
  }),
)

// Push notifications handlers
self.addEventListener('push', (event: any) => {
  if (!event.data) return
  try {
    const data = event.data.json() as any
    const title = data.title || 'Notificare'
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
    }
    // @ts-ignore
    event.waitUntil((self as any).registration.showNotification(title, options))
  } catch (e) {
    // ignore malformed payloads
  }
})

self.addEventListener('notificationclick', (event: any) => {
  event.notification.close()
  if (event.action === 'close') return
  const targetUrl = (event.notification && (event.notification as any).data && (event.notification as any).data.url) || '/'
  // @ts-ignore
  event.waitUntil(
    (async () => {
      // @ts-ignore
      const allClients = await (self as any).clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const client of allClients) {
        if (client.url && client.url.includes(new URL(targetUrl, location.origin).pathname)) {
          // @ts-ignore
          await client.focus()
          return
        }
      }
      // @ts-ignore
      await (self as any).clients.openWindow(targetUrl)
    })(),
  )
})

self.addEventListener('notificationclose', () => {
  // no-op; reserved for future analytics
})


