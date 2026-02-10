import { apiClient } from './api';
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

  // Create new delivery type (PROTECTED - requires auth, cookies sent automatically)
  async create(data: DeliveryTypeCreate): Promise<DeliveryType> {
    const response = await apiClient.post<DeliveryType>(BASE_URL, data);
    return response.data;
  },

  // Update delivery type (PROTECTED - requires auth, cookies sent automatically)
  async update(id: number, data: DeliveryTypeUpdate): Promise<DeliveryType> {
    const response = await apiClient.put<DeliveryType>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Patch delivery type (partial update) (PROTECTED - requires auth, cookies sent automatically)
  async patch(id: number, data: DeliveryTypeUpdate): Promise<DeliveryType> {
    const response = await apiClient.patch<DeliveryType>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete delivery type (PROTECTED - requires auth, cookies sent automatically)
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  // Bulk reorder delivery types (PROTECTED - requires auth, cookies sent automatically)
  async reorder(deliveryTypeIds: number[]): Promise<DeliveryType[]> {
    const response = await apiClient.put<DeliveryType[]>(`${BASE_URL}/reorder`, deliveryTypeIds);
    return response.data;
  }
}; 