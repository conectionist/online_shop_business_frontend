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

  // Get the published list (for customers) (PUBLIC - no auth required)
  getPublishedList: async (): Promise<List | null> => {
    try {
      const params = new URLSearchParams();
      params.append('limit', '1000');
      const response = await apiClient.get(`/liste?${params.toString()}`);
      const lists = response.data;
      const publishedList = lists.find((list: List) => list.is_published && !list.is_deleted);

      // If there's a published list, ensure it is not expired
      if (publishedList) {
        const { expiration_date } = publishedList as { expiration_date?: string | null };
        if (expiration_date) {
          // With datetime support, treat expiration as an exact moment
          const now = new Date();
          const expiresAt = new Date(expiration_date);
          if (expiresAt.getTime() <= now.getTime()) {
            return null;
          }
        }
      }

      return publishedList || null;
    } catch (error) {
      console.error('Error fetching published list:', error);
      return null;
    }
  },

  // Get the last expired published list (for customers to view archived products) (PUBLIC - no auth required)
  getLastExpiredPublishedList: async (): Promise<List | null> => {
    try {
      const params = new URLSearchParams();
      params.append('limit', '1000');
      const response = await apiClient.get(`/liste?${params.toString()}`);
      const lists = response.data;
      const now = new Date();

      // Filter for published, non-deleted lists that have expired
      const expiredPublishedLists = lists.filter((list: List) => {
        if (!list.is_published || list.is_deleted) {
          return false;
        }

        const { expiration_date } = list as { expiration_date?: string | null };
        
        // If no expiration date, treat as never expires (not an expired list)
        if (!expiration_date) {
          return false;
        }

        // Check if expired
        const expiresAt = new Date(expiration_date);
        return expiresAt.getTime() <= now.getTime();
      });

      // If no expired published lists, return null
      if (expiredPublishedLists.length === 0) {
        return null;
      }

      // Return the most recently expired one (highest expiration_date)
      const lastExpiredList = expiredPublishedLists.reduce((latest: List, current: List) => {
        const latestExpiration = new Date((latest as any).expiration_date).getTime();
        const currentExpiration = new Date((current as any).expiration_date).getTime();
        return currentExpiration > latestExpiration ? current : latest;
      });

      return lastExpiredList;
    } catch (error) {
      console.error('Error fetching last expired published list:', error);
      return null;
    }
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