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

  async adminSubscribe(subscriptionData: PushSubscriptionData): Promise<PushSubscriptionResponse> {
    const response = await apiClient.post<PushSubscriptionResponse>(
      `${BASE_URL}/admin/subscribe`,
      subscriptionData,
    );
    return response.data;
  },

  async getTopics(): Promise<Array<{ id: number; name: string }>> {
    const response = await apiClient.get(`${BASE_URL}/topics`);
    return response.data;
  },

  async topicsSubscribe(subscriptionId: number, topicIds: number[]): Promise<{ created: number }>{
    const response = await apiClient.post(`${BASE_URL}/topics/subscribe`, {
      subscription_id: subscriptionId,
      topic_ids: topicIds,
    });
    return response.data;
  },

  async topicsUnsubscribe(subscriptionId: number, topicIds: number[]): Promise<{ deleted?: number }>{
    const response = await apiClient.delete(`${BASE_URL}/topics/subscribe`, {
      data: { subscription_id: subscriptionId, topic_ids: topicIds },
    } as any);
    return response.data;
  },

  async getAllTopics(): Promise<Array<{ id: number; name: string; description: string }>> {
    const response = await apiClient.get(`${BASE_URL}/topics`);
    return response.data;
  },

  async getAdminTopics(): Promise<Array<{ id: number; name: string; description: string }>> {
    const response = await apiClient.get(`${BASE_URL}/admin/topics`);
    return response.data;
  },

  async adminTopicsSubscribe(subscriptionId: number, topicIds: number[]): Promise<{ created: number }> {
    const response = await apiClient.post(`${BASE_URL}/admin/topics/subscribe`, {
      subscription_id: subscriptionId, // Required by validation but ignored by backend
      topic_ids: topicIds,
    });
    return response.data;
  },

  async adminTopicsUnsubscribe(subscriptionId: number, topicIds: number[]): Promise<{ removed: number }> {
    const response = await apiClient.delete(`${BASE_URL}/admin/topics/subscribe`, {
      data: { subscription_id: subscriptionId, topic_ids: topicIds }, // Required by validation but ignored by backend
    } as any);
    return response.data;
  },
};


