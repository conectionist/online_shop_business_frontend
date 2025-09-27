// Push notification service worker
// Step 5: THE MOMENT OF TRUTH - actual push notification handling!
// This works alongside the default Workbox service worker

// THE MOMENT OF TRUTH - Push event handler!
self.addEventListener('push', function(event) {
  console.log('Push Service Worker: Push event received:', event);
  
  if (event.data) {
    const data = event.data.json();
    console.log('Push Service Worker: Notification data:', data);
    
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: data.tag,
      data: data.data,
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/icon-192x192.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icon-192x192.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// THE MOMENT OF TRUTH - Notification click handler!
self.addEventListener('notificationclick', function(event) {
  console.log('Push Service Worker: Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Notification close handler
self.addEventListener('notificationclose', function(event) {
  console.log('Push Service Worker: Notification closed:', event);
});
