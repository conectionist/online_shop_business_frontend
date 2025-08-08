import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentMethodService } from '@/services/paymentMethods';
import { PaymentMethodUpdate } from '@/types/api';
import { queryKeys } from '@/lib/queryKeys';

// Get all payment methods
export const usePaymentMethods = () => {
  return useQuery({
    queryKey: queryKeys.paymentMethods.all,
    queryFn: paymentMethodService.getAll,
  });
};

// Get payment method by ID
export const usePaymentMethod = (id: number) => {
  return useQuery({
    queryKey: queryKeys.paymentMethods.detail(id),
    queryFn: () => paymentMethodService.getById(id),
    enabled: !!id,
  });
};

// Create payment method
export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: paymentMethodService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentMethods.all });
    },
  });
};

// Update payment method
export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PaymentMethodUpdate }) =>
      paymentMethodService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentMethods.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentMethods.detail(id) });
    },
  });
};

// Delete payment method
export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: paymentMethodService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentMethods.all });
    },
  });
}; 