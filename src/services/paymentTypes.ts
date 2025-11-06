import { apiClient } from './api';
import { PaymentType } from '@/types/api';

const BASE_URL = '/payment-types';

export const paymentTypeService = {
  // Get all payment types (PUBLIC - no auth required)
  async getAll(): Promise<PaymentType[]> {
    const response = await apiClient.get<PaymentType[]>(BASE_URL);
    return response.data;
  },
};

