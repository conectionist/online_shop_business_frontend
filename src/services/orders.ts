import { apiClient } from './api';
import { OrderCreate, OrderRead } from '@/types/api';

export const orderService = {
  // Create a new order (PUBLIC - no auth required for customer orders)
  createOrder: async (orderData: OrderCreate): Promise<OrderRead> => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  // Get order by ID (PROTECTED - requires auth)
  getOrder: async (id: number): Promise<OrderRead> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  // List orders with filters (PROTECTED - requires auth)
  listOrders: async (filters?: {
    nume_client?: string;
    liste_id?: number;
    delivery_type_id?: number;
    payment_method_id?: number;
    data_plasarii_start?: string;
    data_plasarii_end?: string;
    skip?: number;
    limit?: number;
    sort_by?: 'data_plasarii' | 'nume_client' | 'liste_id' | 'delivery_type_id' | 'payment_method_id';
    sort_order?: 'asc' | 'desc';
    merge_similar?: boolean;
  }): Promise<OrderRead[]> => {
    const params = new URLSearchParams();
    
    if (filters?.nume_client) {
      params.append('nume_client', filters.nume_client);
    }
    if (filters?.liste_id) {
      params.append('liste_id', filters.liste_id.toString());
    }
    if (filters?.delivery_type_id) {
      params.append('delivery_type_id', filters.delivery_type_id.toString());
    }
    if (filters?.payment_method_id) {
      params.append('payment_method_id', filters.payment_method_id.toString());
    }
    if (filters?.data_plasarii_start) {
      params.append('data_plasarii_start', filters.data_plasarii_start);
    }
    if (filters?.data_plasarii_end) {
      params.append('data_plasarii_end', filters.data_plasarii_end);
    }
    if (filters?.skip) {
      params.append('skip', filters.skip.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters?.sort_by) {
      params.append('sort_by', filters.sort_by);
    }
    if (filters?.sort_order) {
      params.append('sort_order', filters.sort_order);
    }
    if (filters?.merge_similar) {
      params.append('merge_similar', filters.merge_similar.toString());
    }

    const response = await apiClient.get(`/orders?${params.toString()}`);
    return response.data;
  },

  // Update order (PROTECTED - requires auth)
  updateOrder: async (id: number, orderData: { 
    nume_client?: string; 
    order_notes?: string;
    delivery_type_id?: number;
    payment_method_id?: number;
    delivery_address?: string;
    phone_number?: string;
  }): Promise<OrderRead> => {
    const response = await apiClient.patch(`/orders/${id}`, orderData);
    return response.data;
  },

  // Delete order (PROTECTED - requires auth)
  deleteOrder: async (id: number): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
  },

  // Order Items Management (PROTECTED - requires auth)
  
  // Add item to order
  addOrderItem: async (orderId: number, item: {
    produse_id: number;
    pret_produs: number;
    cantitate_produs: number;
    unitati_id: number;
  }): Promise<any> => {
    const response = await apiClient.post(`/orders/${orderId}/products`, item);
    return response.data;
  },

  // Update item in order
  updateOrderItem: async (orderId: number, productId: number, item: {
    produse_id: number;
    pret_produs: number;
    cantitate_produs: number;
    unitati_id: number;
  }): Promise<any> => {
    const response = await apiClient.patch(`/orders/${orderId}/products/${productId}`, item);
    return response.data;
  },

  // Remove item from order
  removeOrderItem: async (orderId: number, productId: number): Promise<void> => {
    await apiClient.delete(`/orders/${orderId}/products/${productId}`);
  },
};
