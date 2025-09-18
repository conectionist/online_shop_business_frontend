import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService } from '@/services/pushNotifications';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  const checkSupport = useCallback(() => {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (permission === 'granted') return true;
    if (permission === 'denied') return false;
    const newPermission = await Notification.requestPermission();
    setPermission(newPermission);
    return newPermission === 'granted';
  }, [permission]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    try {
      if (!isSupported) throw new Error('Push notifications not supported');
      const hasPermission = await requestPermission();
      if (!hasPermission) throw new Error('Permission denied');

      const registration = await navigator.serviceWorker.ready;
      // If already subscribed, reuse existing subscription and (re)send to backend
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        const existingData = {
          endpoint: existing.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(existing.getKey('p256dh')),
            auth: arrayBufferToBase64(existing.getKey('auth')),
          },
          user_agent: navigator.userAgent,
        };
        await pushNotificationService.subscribe(existingData);
        setIsSubscribed(true);
        return true;
      }

      const vapidPublicKey = await pushNotificationService.getVapidPublicKey();
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      const keyBuffer = new ArrayBuffer(applicationServerKey.byteLength);
      new Uint8Array(keyBuffer).set(applicationServerKey);

      const newSub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBuffer,
      });

      const newData = {
        endpoint: newSub.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(newSub.getKey('p256dh')),
          auth: arrayBufferToBase64(newSub.getKey('auth')),
        },
        user_agent: navigator.userAgent,
      };

      await pushNotificationService.subscribe(newData);
      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return false;
    }
  }, [isSupported, requestPermission]);

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

  useEffect(() => {
    const supported = checkSupport();
    setIsSupported(supported);
    setPermission(Notification.permission);
    if (supported) {
      checkSubscriptionStatus();
    }
  }, [checkSupport, checkSubscriptionStatus]);

  return { isSupported, isSubscribed, permission, subscribe, unsubscribe, requestPermission, checkSubscriptionStatus };
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}


