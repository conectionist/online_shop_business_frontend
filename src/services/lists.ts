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
  // Get all lists with optional filters (PUBLIC - no auth required)
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

  // Get the list customers can order from right now, or null (PUBLIC - no auth required).
  // The backend checks expiry in Romania time, so this doesn't depend on the browser's timezone.
  // Errors are thrown, not returned as null, so a failed request isn't mistaken for "no list".
  getPublishedList: async (): Promise<List | null> => {
    const response = await apiClient.get('/liste/published');
    return response.data ?? null;
  },

  // Get the most recently expired published list, or null (for customers to view archived products) (PUBLIC - no auth required)
  getLastExpiredPublishedList: async (): Promise<List | null> => {
    const response = await apiClient.get('/liste/last-expired');
    return response.data ?? null;
  },

  // Get a single list by ID (PUBLIC - no auth required)
  getList: async (id: number): Promise<List> => {
    const response = await apiClient.get(`/liste/${id}`);
    return response.data;
  },

  // Create a new list (PROTECTED - requires auth)
  createList: async (data: ListCreate): Promise<List> => {
        const response = await apiClient.post('/liste', data);
    return response.data;
  },

  // Update an existing list (PATCH for partial updates) (PROTECTED - requires auth)
  updateList: async (id: number, data: ListUpdate): Promise<List> => {
        const response = await apiClient.patch(`/liste/${id}`, data);
    return response.data;
  },

  // Update an existing list (PUT for full replacement) (PROTECTED - requires auth)
  replaceList: async (id: number, data: ListCreate): Promise<List> => {
        const response = await apiClient.put(`/liste/${id}`, data);
    return response.data;
  },

  // Clone an existing list (PROTECTED - requires auth)
  cloneList: async (id: number): Promise<List> => {
        const response = await apiClient.post(`/liste/${id}/clone`, {});
    return response.data;
  },

  // Delete a list (PROTECTED - requires auth)
  deleteList: async (id: number): Promise<void> => {
        await apiClient.delete(`/liste/${id}`);
  },

  // Get products for a specific list (PUBLIC - no auth required)
  getListProducts: async (listId: number): Promise<any[]> => {
    const response = await apiClient.get(`/liste/${listId}/products`);
    return response.data;
  },

  // Get ordered products for a specific list (PUBLIC - no auth required)
  getListProductsOrdered: async (listId: number): Promise<any> => {
    const response = await apiClient.get(`/liste/${listId}/products/ordered`);
    return response.data;
  },

  // Add a product to a list (PROTECTED - requires auth)
  addProductToList: async (listId: number, productId: number, stock?: number): Promise<any> => {
        const data = stock !== undefined ? { stoc_produs: stock } : {};
    const response = await apiClient.post(`/liste/${listId}/products/${productId}`, data);
    return response.data;
  },

  // Update stock (availability) for a product already in a list (PROTECTED)
  updateListProductStock: async (
    listId: number,
    productId: number,
    stock: number | null
  ): Promise<{ list_id: number; product_id: number; stoc_produs: number | null }> => {
        const response = await apiClient.patch(`/liste/${listId}/products/${productId}`, { stoc_produs: stock });
    return response.data;
  },

  // Add multiple products to a list in batch (PROTECTED - requires auth)
  addProductsToList: async (listId: number, productIds: number[]): Promise<any[]> => {
        const response = await apiClient.patch(`/liste/${listId}/products`, productIds);
    return response.data;
  },

  // Remove a product from a list (PROTECTED - requires auth)
  removeProductFromList: async (listId: number, productId: number): Promise<void> => {
        await apiClient.delete(`/liste/${listId}/products/${productId}`);
  },

  // Replace all products in a list (PROTECTED - requires auth)
  replaceListProducts: async (listId: number, productIds: number[]): Promise<any[]> => {
        const response = await apiClient.put(`/liste/${listId}/products`, productIds);
    return response.data;
  },

  // Get delivery types for a specific list (PUBLIC - no auth required)
  getListDeliveryTypes: async (listId: number): Promise<any[]> => {
    const response = await apiClient.get(`/liste/${listId}/delivery-types`);
    return response.data;
  },

  // Add a delivery type to a list (PROTECTED - requires auth)
  addDeliveryTypeToList: async (listId: number, deliveryTypeId: number): Promise<any> => {
        const response = await apiClient.post(`/liste/${listId}/delivery-types/${deliveryTypeId}`);
    return response.data;
  },

  // Remove a delivery type from a list (PROTECTED - requires auth)
  removeDeliveryTypeFromList: async (listId: number, deliveryTypeId: number): Promise<void> => {
        await apiClient.delete(`/liste/${listId}/delivery-types/${deliveryTypeId}`);
  },

  // Replace all delivery types in a list (PROTECTED - requires auth)
  replaceListDeliveryTypes: async (listId: number, deliveryTypeIds: number[]): Promise<any[]> => {
        const response = await apiClient.put(`/liste/${listId}/delivery-types`, deliveryTypeIds);
    return response.data;
  },

  // Bulk update positions for categories and products in a list (PROTECTED - requires auth)
  bulkUpdatePositions: async (listId: number, positions: Array<{ category_id: number; products: number[] }>): Promise<any> => {
        const response = await apiClient.put(`/liste/${listId}/positions`, { positions });
    return response.data;
  },
}; 