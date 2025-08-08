import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryScheduleService } from '@/services/deliverySchedules';
import { 
  DeliveryScheduleUpdate 
} from '@/types/api';
import { queryKeys } from '@/lib/queryKeys';

// Get all delivery schedules
export const useDeliverySchedules = () => {
  return useQuery({
    queryKey: queryKeys.deliverySchedules.all,
    queryFn: deliveryScheduleService.getAll,
  });
};

// Get delivery schedule by ID
export const useDeliverySchedule = (id: number) => {
  return useQuery({
    queryKey: queryKeys.deliverySchedules.detail(id),
    queryFn: () => deliveryScheduleService.getById(id),
    enabled: !!id,
  });
};

// Create delivery schedule
export const useCreateDeliverySchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deliveryScheduleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deliverySchedules.all });
    },
  });
};

// Update delivery schedule
export const useUpdateDeliverySchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DeliveryScheduleUpdate }) =>
      deliveryScheduleService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deliverySchedules.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.deliverySchedules.detail(id) });
    },
  });
};

// Delete delivery schedule
export const useDeleteDeliverySchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deliveryScheduleService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deliverySchedules.all });
    },
  });
}; 