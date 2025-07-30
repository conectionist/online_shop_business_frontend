import { apiClient } from './api';
import { Unit, UnitCreate, UnitUpdate } from '@/types/api';

export interface UnitFilters {
  search?: string;
  limit?: number;
  offset?: number;
}

// Unit service functions
export const unitService = {
  // Get all units with optional filters
  getUnits: async (filters?: UnitFilters): Promise<Unit[]> => {
    const params = new URLSearchParams();
    
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters?.offset) {
      params.append('offset', filters.offset.toString());
    }

    const response = await apiClient.get(`/unitati?${params.toString()}`);
    return response.data;
  },

  // Get a single unit by ID
  getUnit: async (id: number): Promise<Unit> => {
    const response = await apiClient.get(`/unitati/${id}`);
    return response.data;
  },

  // Create a new unit
  createUnit: async (data: UnitCreate): Promise<Unit> => {
    const response = await apiClient.post('/unitati', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // Update an existing unit (full replacement)
  updateUnit: async (id: number, data: UnitCreate): Promise<Unit> => {
    const response = await apiClient.put(`/unitati/${id}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // Partially update an existing unit
  patchUnit: async (id: number, data: UnitUpdate): Promise<Unit> => {
    const response = await apiClient.patch(`/unitati/${id}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // Delete a unit (hard delete)
  deleteUnit: async (id: number): Promise<void> => {
    await apiClient.delete(`/unitati/${id}`);
  },
}; 