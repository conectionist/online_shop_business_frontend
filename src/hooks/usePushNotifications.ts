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
    } catch (err) {
      console.error('Notification permission request failed:', err);
      return false;
    }
  }, [permission]);

  const arrayBufferToBase64 = (buffer: ArrayBuffer | null): string => {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return window.btoa(binary);
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
