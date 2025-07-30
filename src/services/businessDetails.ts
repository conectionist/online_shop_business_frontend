import { apiClient } from './api';
import { BusinessDetails, BusinessDetailsCreate, BusinessDetailsUpdate } from '@/types/api';

const BASE_URL = '/detalii-business';

export const businessDetailsService = {
  async getAll(): Promise<BusinessDetails[]> {
    const response = await apiClient.get<BusinessDetails[]>(BASE_URL);
    return response.data;
  },

  async getById(id: number): Promise<BusinessDetails> {
    const response = await apiClient.get<BusinessDetails>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async create(data: BusinessDetailsCreate): Promise<BusinessDetails> {
    const response = await apiClient.post<BusinessDetails>(BASE_URL, data);
    return response.data;
  },

  async update(id: number, data: BusinessDetailsUpdate): Promise<BusinessDetails> {
    const response = await apiClient.put<BusinessDetails>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  }
}; 