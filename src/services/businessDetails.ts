import { apiClient } from './api';
import { authService } from '@/services/authService';
import { BusinessDetails, BusinessDetailsCreate, BusinessDetailsUpdate } from '@/types/api';

const BASE_URL = '/detalii-business';

export const businessDetailsService = {
  // Get business details (PUBLIC - no auth required)
  async get(): Promise<BusinessDetails> {
    const response = await apiClient.get<BusinessDetails>(BASE_URL);
    return response.data;
  },

  // Create business details (PROTECTED - requires auth)
  async create(data: BusinessDetailsCreate): Promise<BusinessDetails> {
    return authService.makeAuthenticatedRequest(async () => {
      const response = await apiClient.post<BusinessDetails>(BASE_URL, data);
      return response.data;
    });
  },

  // Update business details (PROTECTED - requires auth)
  async update(id: number, data: BusinessDetailsUpdate): Promise<BusinessDetails> {
    return authService.makeAuthenticatedRequest(async () => {
      const response = await apiClient.put<BusinessDetails>(`${BASE_URL}/${id}`, data);
      return response.data;
    });
  },

  // Delete business details (PROTECTED - requires auth)
  async delete(id: number): Promise<void> {
    return authService.makeAuthenticatedRequest(async () => {
      await apiClient.delete(`${BASE_URL}/${id}`);
    });
  }
}; 