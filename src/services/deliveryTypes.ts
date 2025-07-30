import { apiClient } from './api';
import { DeliveryType, DeliveryTypeCreate, DeliveryTypeUpdate } from '@/types/api';

const BASE_URL = '/tipuri-livrare';

export const deliveryTypeService = {
  // Get all delivery types
  async getAll(): Promise<DeliveryType[]> {
    const response = await apiClient.get<DeliveryType[]>(BASE_URL);
    return response.data;
  },

  // Get delivery type by ID
  async getById(id: number): Promise<DeliveryType> {
    const response = await apiClient.get<DeliveryType>(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create new delivery type
  async create(data: DeliveryTypeCreate): Promise<DeliveryType> {
    const response = await apiClient.post<DeliveryType>(BASE_URL, data);
    return response.data;
  },

  // Update delivery type
  async update(id: number, data: DeliveryTypeUpdate): Promise<DeliveryType> {
    const response = await apiClient.put<DeliveryType>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete delivery type
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  }
}; 