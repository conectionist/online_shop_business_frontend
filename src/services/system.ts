import { apiClient } from './api';
import { NextDeliveryDateResponse, SystemConfig } from '@/types/api';

// System service functions
export const systemService = {
  // Get system config (max_image_size_mb, etc.)
  getConfig: async (): Promise<SystemConfig> => {
    const response = await apiClient.get<SystemConfig>('/system/config');
    return response.data;
  },

  // Get next delivery date (PUBLIC - no auth required)
  getNextDeliveryDate: async (referenceDate?: string): Promise<NextDeliveryDateResponse> => {
    const params = new URLSearchParams();
    
    if (referenceDate) {
      params.append('reference_date', referenceDate);
    }

    const response = await apiClient.get(`/system/next-delivery-date?${params.toString()}`);
    return response.data;
  },
};
