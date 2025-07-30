import { apiClient } from './api';
import { 
  DeliverySchedule, 
  DeliveryScheduleCreate, 
  DeliveryScheduleUpdate
} from '@/types/api';

export const deliveryScheduleService = {
  // Get all delivery schedules
  async getAll(): Promise<DeliverySchedule[]> {
    const response = await apiClient.get('/orare-livrari');
    return response.data;
  },

  // Get delivery schedule by ID
  async getById(id: number): Promise<DeliverySchedule> {
    const response = await apiClient.get(`/orare-livrari/${id}`);
    return response.data;
  },

  // Create new delivery schedule
  async create(data: DeliveryScheduleCreate): Promise<DeliverySchedule> {
    const response = await apiClient.post('/orare-livrari', data);
    return response.data;
  },

  // Update delivery schedule
  async update(id: number, data: DeliveryScheduleUpdate): Promise<DeliverySchedule> {
    const response = await apiClient.put(`/orare-livrari/${id}`, data);
    return response.data;
  },

  // Delete delivery schedule
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/orare-livrari/${id}`);
  }
}; 