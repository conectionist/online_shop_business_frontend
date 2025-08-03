import { apiClient } from './api';
import { authService } from '@/services/authService';
import { DeliveryType, DeliveryTypeCreate, DeliveryTypeUpdate } from '@/types/api';

const BASE_URL = '/tipuri-livrare';

export const deliveryTypeService = {
  // Get all delivery types (PUBLIC - no auth required)
  async getAll(): Promise<DeliveryType[]> {
    const response = await apiClient.get<DeliveryType[]>(BASE_URL);
    return response.data;
  },

  // Get delivery type by ID (PUBLIC - no auth required)
  async getById(id: number): Promise<DeliveryType> {
    const response = await apiClient.get<DeliveryType>(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create new delivery type (PROTECTED - requires auth)
  async create(data: DeliveryTypeCreate): Promise<DeliveryType> {
    return authService.makeAuthenticatedRequest(async () => {
      const response = await apiClient.post<DeliveryType>(BASE_URL, data);
      return response.data;
    });
  },

  // Update delivery type (PROTECTED - requires auth)
  async update(id: number, data: DeliveryTypeUpdate): Promise<DeliveryType> {
    return authService.makeAuthenticatedRequest(async () => {
      const response = await apiClient.put<DeliveryType>(`${BASE_URL}/${id}`, data);
      return response.data;
    });
  },

  // Delete delivery type (PROTECTED - requires auth)
  async delete(id: number): Promise<void> {
    return authService.makeAuthenticatedRequest(async () => {
      await apiClient.delete(`${BASE_URL}/${id}`);
    });
  }
}; 