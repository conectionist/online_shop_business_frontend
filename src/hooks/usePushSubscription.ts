// Hook for push notification subscription management
// Step 5: THE MOMENT OF TRUTH - actual push subscription logic!

import { useState, useEffect, useCallback } from 'react';
import { 
  subscribeToCustomerPush, 
  subscribeToAdminPush, 
  unsubscribeFromPush, 
  getSubscriptionStatus 
} from '@/utils/pushSubscription';
import { usePushNotifications } from './usePushNotifications';
import { useVapidKey } from './useVapidKey';

export interface PushSubscriptionState {
  isSubscribed: boolean;
  isSubscribing: boolean;
  isUnsubscribing: boolean;
  error: string | null;
  subscriptionId: number | null;
}

/**
 * Hook for customer push notification subscription
 * THE MOMENT OF TRUTH - actual push subscription management!
 */
export function useCustomerPushSubscription() {
  const pushStatus = usePushNotifications();
  const { data: vapidKey, isLoading: vapidLoading, error: vapidError } = useVapidKey();
  const vapidAvailable = !!vapidKey && !vapidLoading && !vapidError;
  const [state, setState] = useState<PushSubscriptionState>({
    isSubscribed: false,
    isSubscribing: false,
    isUnsubscribing: false,
    error: null,
    subscriptionId: null
  });

  // Check subscription status on mount
  useEffect(() => {
    const checkStatus = async () => {
      if (pushStatus.isSupported && vapidAvailable) {
        try {
          const isSubscribed = await getSubscriptionStatus();
          setState(prev => ({ ...prev, isSubscribed }));
        } catch (error) {
          console.error('Failed to check subscription status:', error);
        }
      }
    };

    checkStatus();
  }, [pushStatus.isSupported, vapidAvailable]);

  const subscribe = useCallback(async () => {
    if (!pushStatus.isSupported || !vapidAvailable) {
      setState(prev => ({ 
        ...prev, 
        error: 'Push notifications not supported or VAPID key not available' 
      }));
      return;
    }

    setState(prev => ({ ...prev, isSubscribing: true, error: null }));

    try {
      const result = await subscribeToCustomerPush();
      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isSubscribing: false,
        subscriptionId: result.id,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSubscribing: false,
        error: error instanceof Error ? error.message : 'Subscription failed'
      }));
    }
  }, [pushStatus.isSupported, vapidAvailable]);

  const unsubscribe = useCallback(async () => {
    setState(prev => ({ ...prev, isUnsubscribing: true, error: null }));

    try {
      await unsubscribeFromPush();
      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isUnsubscribing: false,
        subscriptionId: null,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isUnsubscribing: false,
        error: error instanceof Error ? error.message : 'Unsubscription failed'
      }));
    }
  }, []);

  return {
    ...state,
    subscribe,
    unsubscribe,
    canSubscribe: pushStatus.isSupported && vapidAvailable && !state.isSubscribed,
    canUnsubscribe: state.isSubscribed && !state.isSubscribing && !state.isUnsubscribing
  };
}

/**
 * Hook for admin push notification subscription
 * THE MOMENT OF TRUTH - actual push subscription with authentication!
 */
export function useAdminPushSubscription(adminToken: string | null) {
  const pushStatus = usePushNotifications();
  const { data: vapidKey, isLoading: vapidLoading, error: vapidError } = useVapidKey();
  const vapidAvailable = !!vapidKey && !vapidLoading && !vapidError;
  const [state, setState] = useState<PushSubscriptionState>({
    isSubscribed: false,
    isSubscribing: false,
    isUnsubscribing: false,
    error: null,
    subscriptionId: null
  });

  // Check subscription status on mount
  useEffect(() => {
    const checkStatus = async () => {
      if (pushStatus.isSupported && vapidAvailable && adminToken) {
        try {
          const isSubscribed = await getSubscriptionStatus();
          setState(prev => ({ ...prev, isSubscribed }));
        } catch (error) {
          console.error('Failed to check subscription status:', error);
        }
      }
    };

    checkStatus();
  }, [pushStatus.isSupported, vapidAvailable, adminToken]);

  const subscribe = useCallback(async () => {
    if (!pushStatus.isSupported || !vapidAvailable || !adminToken) {
      setState(prev => ({ 
        ...prev, 
        error: 'Push notifications not supported, VAPID key not available, or admin token missing' 
      }));
      return;
    }

    setState(prev => ({ ...prev, isSubscribing: true, error: null }));

    try {
      const result = await subscribeToAdminPush(adminToken);
      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isSubscribing: false,
        subscriptionId: result.id,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSubscribing: false,
        error: error instanceof Error ? error.message : 'Subscription failed'
      }));
    }
  }, [pushStatus.isSupported, vapidAvailable, adminToken]);

  const unsubscribe = useCallback(async () => {
    setState(prev => ({ ...prev, isUnsubscribing: true, error: null }));

    try {
      await unsubscribeFromPush();
      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isUnsubscribing: false,
        subscriptionId: null,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isUnsubscribing: false,
        error: error instanceof Error ? error.message : 'Unsubscription failed'
      }));
    }
  }, []);

  return {
    ...state,
    subscribe,
    unsubscribe,
    canSubscribe: pushStatus.isSupported && vapidAvailable && adminToken && !state.isSubscribed,
    canUnsubscribe: state.isSubscribed && !state.isSubscribing && !state.isUnsubscribing
  };
}
