import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessDetailsService } from '@/services/businessDetails';
import { BusinessDetails, BusinessDetailsCreate, BusinessDetailsUpdate } from '@/types/api';
import { queryKeys } from '@/lib/queryKeys';

export const useBusinessDetails = () => {
  return useQuery({
    queryKey: queryKeys.business.details(),
    queryFn: businessDetailsService.getAll,
  });
};

export const useBusinessDetailsById = (id: number) => {
  return useQuery({
    queryKey: [...queryKeys.business.details(), id],
    queryFn: () => businessDetailsService.getById(id),
    enabled: !!id,
  });
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
    mutationFn: businessDetailsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.business.details() });
    },
  });
}; 