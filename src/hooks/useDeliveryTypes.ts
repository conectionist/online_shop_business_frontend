import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryTypeService } from '@/services/deliveryTypes';
import { DeliveryType, DeliveryTypeCreate, DeliveryTypeUpdate } from '@/types/api';
import { queryKeys } from '@/lib/queryKeys';

// Get all delivery types
export const useDeliveryTypes = () => {
  return useQuery({
    queryKey: queryKeys.deliveryTypes.all,
    queryFn: deliveryTypeService.getAll,
  });
};

// Get delivery type by ID
export const useDeliveryType = (id: number) => {
  return useQuery({
    queryKey: queryKeys.deliveryTypes.detail(id),
    queryFn: () => deliveryTypeService.getById(id),
    enabled: !!id,
  });
};

// Create delivery type
export const useCreateDeliveryType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deliveryTypeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveryTypes.all });
    },
  });
};

// Update delivery type
export const useUpdateDeliveryType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DeliveryTypeUpdate }) =>
      deliveryTypeService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveryTypes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveryTypes.detail(id) });
    },
  });
};

// Delete delivery type
export const useDeleteDeliveryType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deliveryTypeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveryTypes.all });
    },
  });
}; 