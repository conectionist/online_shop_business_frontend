import { apiClient } from './api';
import {
  DeliverySchedule,
  DeliveryScheduleCreate,
  DeliveryScheduleUpdate
} from '@/types/api';

const BASE_URL = '/orare-livrari';

export const deliveryScheduleService = {
  // Get all delivery schedules (PUBLIC - no auth required)
  async getAll(): Promise<DeliverySchedule[]> {
    const response = await apiClient.get<DeliverySchedule[]>(BASE_URL);
    return response.data;
  },

  // Get delivery schedule by ID (PUBLIC - no auth required)
  async getById(id: number): Promise<DeliverySchedule> {
    const response = await apiClient.get<DeliverySchedule>(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create new delivery schedule (PROTECTED - requires auth, cookies sent automatically)
  async create(data: DeliveryScheduleCreate): Promise<DeliverySchedule> {
    const response = await apiClient.post<DeliverySchedule>(BASE_URL, data);
    return response.data;
  },

  // Update delivery schedule (PROTECTED - requires auth, cookies sent automatically)
  async update(id: number, data: DeliveryScheduleUpdate): Promise<DeliverySchedule> {
    const response = await apiClient.put<DeliverySchedule>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete delivery schedule (PROTECTED - requires auth, cookies sent automatically)
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  }
}; 