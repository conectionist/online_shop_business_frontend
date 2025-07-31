import { apiClient } from '@/services/api';
import { List, ListCreate, ListUpdate } from '@/types/api';

// Types for list operations
export interface ListFilters {
  search?: string;
  limit?: number;
  offset?: number;
  include_deleted?: boolean;
}

// List service functions
export const listService = {
  // Get all lists with optional filters
  getLists: async (filters?: ListFilters): Promise<List[]> => {
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
    if (filters?.include_deleted) {
      params.append('include_deleted', 'true');
    }

    const response = await apiClient.get(`/liste?${params.toString()}`);
    return response.data;
  },

  // Get a single list by ID
  getList: async (id: number): Promise<List> => {
    const response = await apiClient.get(`/liste/${id}`);
    return response.data;
  },

  // Create a new list
  createList: async (data: ListCreate): Promise<List> => {
    const response = await apiClient.post('/liste', data);
    return response.data;
  },

  // Update an existing list (PATCH for partial updates)
  updateList: async (id: number, data: ListUpdate): Promise<List> => {
    const response = await apiClient.patch(`/liste/${id}`, data);
    return response.data;
  },

  // Update an existing list (PUT for full replacement)
  replaceList: async (id: number, data: ListCreate): Promise<List> => {
    const response = await apiClient.put(`/liste/${id}`, data);
    return response.data;
  },

  // Delete a list (soft delete by default)
  deleteList: async (id: number, permanent: boolean = false): Promise<void> => {
    const params = permanent ? '?soft_delete=false' : '';
    await apiClient.delete(`/liste/${id}${params}`);
  },

  // Get products for a specific list
  getListProducts: async (listId: number): Promise<any[]> => {
    const response = await apiClient.get(`/liste/${listId}/products`);
    return response.data;
  },

  // Add a product to a list
  addProductToList: async (listId: number, productId: number, stock?: number): Promise<any> => {
    const data = stock !== undefined ? { stoc_produs: stock } : {};
    const response = await apiClient.post(`/liste/${listId}/products/${productId}`, data);
    return response.data;
  },

  // Remove a product from a list
  removeProductFromList: async (listId: number, productId: number): Promise<void> => {
    await apiClient.delete(`/liste/${listId}/products/${productId}`);
  },

  // Replace all products in a list
  replaceListProducts: async (listId: number, productIds: number[]): Promise<any[]> => {
    const response = await apiClient.put(`/liste/${listId}/products`, productIds);
    return response.data;
  },

  // Get delivery types for a specific list
  getListDeliveryTypes: async (listId: number): Promise<any[]> => {
    const response = await apiClient.get(`/liste/${listId}/delivery-types`);
    return response.data;
  },

  // Add a delivery type to a list
  addDeliveryTypeToList: async (listId: number, deliveryTypeId: number): Promise<any> => {
    const response = await apiClient.post(`/liste/${listId}/delivery-types/${deliveryTypeId}`);
    return response.data;
  },

  // Remove a delivery type from a list
  removeDeliveryTypeFromList: async (listId: number, deliveryTypeId: number): Promise<void> => {
    await apiClient.delete(`/liste/${listId}/delivery-types/${deliveryTypeId}`);
  },

  // Replace all delivery types in a list
  replaceListDeliveryTypes: async (listId: number, deliveryTypeIds: number[]): Promise<any[]> => {
    const response = await apiClient.put(`/liste/${listId}/delivery-types`, deliveryTypeIds);
    return response.data;
  },
}; 