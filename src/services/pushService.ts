// Push notification API service
// Step 4: VAPID key API integration - NO actual subscription yet

import { apiClient } from './api';

export interface VapidPublicKey {
  publicKey: string;
}

export interface PushSubscription {
  id: number;
  endpoint: string;
  is_active: boolean;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  icon?: string;
  tag?: string;
  event_id?: string;
}

/**
 * Get VAPID public key from backend
 * This is iOS-safe as it only retrieves the key, no subscription yet
 */
export async function getVapidPublicKey(): Promise<string> {
  try {
    const response = await apiClient.get<VapidPublicKey>('/push/public-key');
    return response.data.publicKey;
  } catch (error) {
    console.error('Failed to get VAPID public key:', error);
    throw new Error('Failed to retrieve VAPID public key');
  }
}

/**
 * Subscribe to customer push notifications
 * This will be implemented in later steps - just the interface for now
 */
export async function subscribeToCustomerPush(subscriptionData: {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  user_agent: string;
}): Promise<PushSubscription> {
  try {
    const response = await apiClient.post<PushSubscription>('/push/subscribe', subscriptionData);
    return response.data;
  } catch (error) {
    console.error('Failed to subscribe to customer push notifications:', error);
    throw new Error('Failed to subscribe to customer push notifications');
  }
}

/**
 * Subscribe to admin push notifications
 * This will be implemented in later steps - just the interface for now
 */
export async function subscribeToAdminPush(
  adminToken: string,
  subscriptionData: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
    user_agent: string;
  }
): Promise<PushSubscription> {
  try {
    const response = await apiClient.post<PushSubscription>(
      '/push/admin/subscribe',
      subscriptionData,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to subscribe to admin push notifications:', error);
    throw new Error('Failed to subscribe to admin push notifications');
  }
}

/**
 * Unsubscribe from push notifications
 * This will be implemented in later steps - just the interface for now
 */
export async function unsubscribeFromPush(endpoint: string): Promise<{ status: string }> {
  try {
    const response = await apiClient.delete<{ status: string }>(`/push/subscribe?endpoint=${encodeURIComponent(endpoint)}`);
    return response.data;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    throw new Error('Failed to unsubscribe from push notifications');
  }
}

/**
 * Send notification to all admins
 * This will be implemented in later steps - just the interface for now
 */
export async function notifyAllAdmins(
  adminToken: string,
  notification: NotificationPayload
): Promise<{ status: string }> {
  try {
    const response = await apiClient.post<{ status: string }>(
      '/push/admin/notify',
      notification,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    throw new Error('Failed to send admin notification');
  }
}

/**
 * Send notification to specific admin
 * This will be implemented in later steps - just the interface for now
 */
export async function notifySpecificAdmin(
  adminToken: string,
  adminId: number,
  notification: NotificationPayload
): Promise<{ status: string }> {
  try {
    const response = await apiClient.post<{ status: string }>(
      `/push/admin/notify/${adminId}`,
      notification,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    throw new Error('Failed to send admin notification');
  }
}
