import { apiClient } from './api';
import { authService } from '@/services/authService';
import { Unit, UnitCreate, UnitUpdate } from '@/types/api';

export interface UnitFilters {
  search?: string;
  limit?: number;
  offset?: number;
}

// Unit service functions
export const unitService = {
  // Get all units with optional filters (PUBLIC - no auth required)
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

  // Get a single unit by ID (PUBLIC - no auth required)
  getUnit: async (id: number): Promise<Unit> => {
    const response = await apiClient.get(`/unitati/${id}`);
    return response.data;
  },

  // Create a new unit (PROTECTED - requires auth)
  createUnit: async (data: UnitCreate): Promise<Unit> => {
    return authService.makeAuthenticatedRequest(async () => {
      const response = await apiClient.post('/unitati', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    });
  },

  // Update an existing unit (full replacement) (PROTECTED - requires auth)
  updateUnit: async (id: number, data: UnitCreate): Promise<Unit> => {
    return authService.makeAuthenticatedRequest(async () => {
      const response = await apiClient.put(`/unitati/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    });
  },

  // Partially update an existing unit (PROTECTED - requires auth)
  patchUnit: async (id: number, data: UnitUpdate): Promise<Unit> => {
    return authService.makeAuthenticatedRequest(async () => {
      const response = await apiClient.patch(`/unitati/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    });
  },

  // Delete a unit (PROTECTED - requires auth)
  deleteUnit: async (id: number): Promise<void> => {
    return authService.makeAuthenticatedRequest(async () => {
      await apiClient.delete(`/unitati/${id}`);
    });
  },
}; 