// Push subscription utilities
// Step 5: Actual push subscription logic - THE MOMENT OF TRUTH!

import { getVapidPublicKey } from '@/services/pushService';

/**
 * Convert VAPID public key from base64 to Uint8Array
 * Required for push subscription
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
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

/**
 * Convert ArrayBuffer to base64 string
 * Required for sending subscription data to backend
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Subscribe to customer push notifications
 * THE MOMENT OF TRUTH - actual push subscription!
 */
export async function subscribeToCustomerPush(): Promise<{
  id: number;
  endpoint: string;
  is_active: boolean;
}> {
  try {
    // Get VAPID public key from backend
    const vapidPublicKey = await getVapidPublicKey();
    
    // Convert VAPID key to Uint8Array
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    
    // Subscribe to push service
    const registration = await navigator.serviceWorker.ready;

    // Debug: Log the registration object to see what's available
    console.log('Service Worker Registration:', registration);
    console.log('PushManager available:', !!registration.pushManager);
    console.log('Registration keys:', Object.keys(registration));

    // Check if pushManager is available (iOS Safari doesn't expose it)
    if (!registration.pushManager) {
      throw new Error('PushManager not available in this browser');
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as unknown as ArrayBuffer
    });
    
    // Send subscription to backend
    const { subscribeToCustomerPush: apiSubscribe } = await import('@/services/pushService');
    const result = await apiSubscribe({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!)
      },
      user_agent: navigator.userAgent
    });
    
    console.log('Successfully subscribed to customer notifications:', result);
    return result;
  } catch (error) {
    console.error('Customer push subscription failed:', error);
    throw error;
  }
}

/**
 * Subscribe to admin push notifications
 * THE MOMENT OF TRUTH - actual push subscription with auth!
 */
export async function subscribeToAdminPush(adminToken: string): Promise<{
  id: number;
  endpoint: string;
  is_active: boolean;
}> {
  try {
    // Get VAPID public key from backend
    const vapidPublicKey = await getVapidPublicKey();
    
    // Convert VAPID key to Uint8Array
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    
    // Subscribe to push service
    const registration = await navigator.serviceWorker.ready;

    // Debug: Log the registration object to see what's available
    console.log('Service Worker Registration:', registration);
    console.log('PushManager available:', !!registration.pushManager);
    console.log('Registration keys:', Object.keys(registration));

    // Check if pushManager is available (iOS Safari doesn't expose it)
    if (!registration.pushManager) {
      throw new Error('PushManager not available in this browser');
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as unknown as ArrayBuffer
    });
    
    // Send subscription to backend
    const { subscribeToAdminPush: apiSubscribe } = await import('@/services/pushService');
    const result = await apiSubscribe(adminToken, {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!)
      },
      user_agent: navigator.userAgent
    });
    
    console.log('Successfully subscribed to admin notifications:', result);
    return result;
  } catch (error) {
    console.error('Admin push subscription failed:', error);
    throw error;
  }
}

/**
 * Unsubscribe from push notifications
 * THE MOMENT OF TRUTH - actual push unsubscription!
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      // Unsubscribe from push service
      await subscription.unsubscribe();
      
      // Notify backend
      const { unsubscribeFromPush: apiUnsubscribe } = await import('@/services/pushService');
      await apiUnsubscribe(subscription.endpoint);
      
      console.log('Successfully unsubscribed from push notifications');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Unsubscribe failed:', error);
    throw error;
  }
}

/**
 * Check if user is currently subscribed to push notifications
 * THE MOMENT OF TRUTH - actual subscription status check!
 */
export async function getSubscriptionStatus(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (error) {
    console.error('Failed to check subscription status:', error);
    return false;
  }
}
