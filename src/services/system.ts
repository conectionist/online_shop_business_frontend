import { apiClient } from './api';
import { NextDeliveryDateResponse } from '@/types/api';

// System service functions
export const systemService = {
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
