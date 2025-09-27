import { apiClient } from './api';
import {
  PushSubscriptionData,
  PushSubscriptionResponse,
  VapidPublicKeyResponse,
} from '@/types/pushNotifications';

const BASE_URL = '/push';

export const pushNotificationService = {
  async getVapidPublicKey(): Promise<string> {
    const response = await apiClient.get<VapidPublicKeyResponse>(`${BASE_URL}/public-key`);
    return response.data.publicKey;
  },

  async subscribe(subscriptionData: PushSubscriptionData): Promise<PushSubscriptionResponse> {
    const response = await apiClient.post<PushSubscriptionResponse>(
      `${BASE_URL}/subscribe`,
      subscriptionData,
    );
    return response.data;
  },

  async unsubscribe(endpoint: string): Promise<{ status: string }> {
    const response = await apiClient.delete(`${BASE_URL}/subscribe?endpoint=${encodeURIComponent(endpoint)}`);
    return response.data;
  },
};


