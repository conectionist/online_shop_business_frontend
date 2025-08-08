import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessDetailsService } from '@/services/businessDetails';
import { BusinessDetailsUpdate } from '@/types/api';
import { queryKeys } from '@/lib/queryKeys';

export const useBusinessDetails = () => {
  return useQuery({
    queryKey: queryKeys.business.details(),
    queryFn: businessDetailsService.get,
  });
};

// Hook for getting a single business details item (for backward compatibility)
export const useBusinessDetailsSingle = () => {
  const { data: businessDetailsList, isLoading, error } = useBusinessDetails();
  
  // Return the first business details item, or null if none exist
  const businessDetails = businessDetailsList && businessDetailsList.length > 0 ? businessDetailsList[0] : null;
  
  return {
    data: businessDetails,
    isLoading,
    error
  };
};

export const useCreateBusinessDetails = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: businessDetailsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.business.details() });
    },
  });
};

export const useUpdateBusinessDetails = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BusinessDetailsUpdate }) =>
      businessDetailsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.business.details() });
    },
  });
};

export const useDeleteBusinessDetails = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => businessDetailsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.business.details() });
    },
  });
}; 