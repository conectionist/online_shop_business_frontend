import { apiClient } from './api';
import { PaymentMethod, PaymentMethodCreate, PaymentMethodUpdate } from '@/types/api';

const BASE_URL = '/modalitati-plata';

export const paymentMethodService = {
  // Get all payment methods (PUBLIC - no auth required)
  async getAll(): Promise<PaymentMethod[]> {
    const response = await apiClient.get<PaymentMethod[]>(BASE_URL);
    return response.data;
  },

  // Get payment method by ID (PUBLIC - no auth required)
  async getById(id: number): Promise<PaymentMethod> {
    const response = await apiClient.get<PaymentMethod>(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create new payment method (PROTECTED - requires auth, cookies sent automatically)
  async create(data: PaymentMethodCreate): Promise<PaymentMethod> {
    const response = await apiClient.post<PaymentMethod>(BASE_URL, data);
    return response.data;
  },

  // Update payment method (PROTECTED - requires auth, cookies sent automatically)
  async update(id: number, data: PaymentMethodUpdate): Promise<PaymentMethod> {
    const response = await apiClient.put<PaymentMethod>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete payment method (PROTECTED - requires auth, cookies sent automatically)
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  }
}; 