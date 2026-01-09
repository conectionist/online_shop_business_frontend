import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/orders';
import { OrderCreate } from '@/types/api';
import { queryKeys } from '@/lib/queryKeys';

// Hook to create an order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (args: { orderData: OrderCreate; source?: string }) =>
      orderService.createOrder(args.orderData, { source: args.source }),
    onSuccess: () => {
      // Invalidate all orders queries to refresh data, including filtered lists
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
};

// Hook to get a single order
export const useOrder = (id: number) => {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => orderService.getOrder(id),
    enabled: !!id,
    // Always treat as stale to ensure immediate refetch capability
    staleTime: 0,
    // Proactively refetch on app focus and reconnect to catch new orders
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    // Light polling to surface updates if the page stays open
    refetchInterval: 15000, // 15s
    refetchIntervalInBackground: true,
  });
};

// Hook to list orders with filters
export const useOrders = (filters?: {
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
  include_deleted?: boolean;
}) => {
  return useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: () => orderService.listOrders(filters),
    // Always treat as stale to force network where appropriate
    staleTime: 0,
    // Refetch aggressively to ensure the latest orders are shown
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    // Short polling for near-real-time updates while the tab is open
    refetchInterval: 15000, // 15s
    refetchIntervalInBackground: true,
  });
};

// Hook to update an order
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: number; 
      data: { 
        nume_client?: string; 
        order_notes?: string;
        delivery_type_id?: number;
        payment_method_id?: number;
        delivery_address?: string;
      } 
    }) =>
      orderService.updateOrder(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific order and orders list
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() });
      // Also invalidate all orders queries to ensure immediate refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
};

// Hook to add item to order
export const useAddOrderItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, item }: { 
      orderId: number; 
      item: { 
        produse_id: number;
        pret_produs: number;
        cantitate_produs: number;
        unitati_id: number;
      } 
    }) =>
      orderService.addOrderItem(orderId, item),
    onSuccess: (_, { orderId }) => {
      // Invalidate specific order and orders list
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() });
      // Also invalidate all orders queries to ensure immediate refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
};

// Hook to update item in order
export const useUpdateOrderItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, productId, item }: { 
      orderId: number; 
      productId: number;
      item: { 
        produse_id: number;
        pret_produs: number;
        cantitate_produs: number;
        unitati_id: number;
      } 
    }) =>
      orderService.updateOrderItem(orderId, productId, item),
    onSuccess: (_, { orderId }) => {
      // Invalidate specific order and orders list
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() });
      // Also invalidate all orders queries to ensure immediate refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
};

// Hook to remove item from order
export const useRemoveOrderItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, productId }: { 
      orderId: number; 
      productId: number;
    }) =>
      orderService.removeOrderItem(orderId, productId),
    onSuccess: (_, { orderId }) => {
      // Invalidate specific order and orders list
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() });
      // Also invalidate all orders queries to ensure immediate refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
};

// Hook to delete an order
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, permanent }: { id: number; permanent?: boolean }) => 
      orderService.deleteOrder(id, permanent || false),
    onSuccess: () => {
      // Invalidate all orders queries to refresh data, including filtered lists
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
};

// Hook to restore a soft-deleted order
export const useRestoreOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => orderService.restoreOrder(id),
    onSuccess: (_, id) => {
      // Invalidate specific order and orders list
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() });
      // Also invalidate all orders queries to ensure immediate refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
};
