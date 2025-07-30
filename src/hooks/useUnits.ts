import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidateQueries } from '@/lib/queryKeys';
import { unitService, UnitFilters } from '@/services/units';
import { UnitCreate, UnitUpdate } from '@/types/api';

// Hook to get all units
export const useUnits = (filters?: UnitFilters) => {
  return useQuery({
    queryKey: queryKeys.units.list(filters || {}),
    queryFn: () => unitService.getUnits(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get a single unit
export const useUnit = (id: number) => {
  return useQuery({
    queryKey: queryKeys.units.detail(id),
    queryFn: () => unitService.getUnit(id),
    enabled: !!id, // Only run if id is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create a unit
export const useCreateUnit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UnitCreate) => unitService.createUnit(data),
    onSuccess: () => {
      // Invalidate and refetch units list
      queryClient.invalidateQueries({ queryKey: invalidateQueries.units() });
    },
    onError: (error) => {
      console.error('Failed to create unit:', error);
      // Here we could show a toast notification
    },
  });
};

// Hook to update a unit (full replacement)
export const useUpdateUnit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UnitCreate }) => 
      unitService.updateUnit(id, data),
    onSuccess: (updatedUnit) => {
      // Update the specific unit in cache
      queryClient.setQueryData(
        queryKeys.units.detail(updatedUnit.id),
        updatedUnit
      );
      
      // Also update the unit in the units list cache
      queryClient.setQueryData(
        queryKeys.units.list({}),
        (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((unit: any) => 
            unit.id === updatedUnit.id ? updatedUnit : unit
          );
        }
      );
      
      // Invalidate and refetch units list
      queryClient.invalidateQueries({ queryKey: invalidateQueries.units() });
    },
    onError: (error) => {
      console.error('Failed to update unit:', error);
      // Here we could show a toast notification
    },
  });
};

// Hook to patch a unit (partial update)
export const usePatchUnit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UnitUpdate }) => 
      unitService.patchUnit(id, data),
    onSuccess: (updatedUnit) => {
      // Update the specific unit in cache
      queryClient.setQueryData(
        queryKeys.units.detail(updatedUnit.id),
        updatedUnit
      );
      
      // Also update the unit in the units list cache
      queryClient.setQueryData(
        queryKeys.units.list({}),
        (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((unit: any) => 
            unit.id === updatedUnit.id ? updatedUnit : unit
          );
        }
      );
      
      // Invalidate and refetch units list
      queryClient.invalidateQueries({ queryKey: invalidateQueries.units() });
    },
    onError: (error) => {
      console.error('Failed to patch unit:', error);
      // Here we could show a toast notification
    },
  });
};

// Hook to delete a unit
export const useDeleteUnit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => unitService.deleteUnit(id),
    onSuccess: (_, deletedId) => {
      // Remove the specific unit from cache
      queryClient.removeQueries({ queryKey: queryKeys.units.detail(deletedId) });
      
      // Invalidate and refetch units list
      queryClient.invalidateQueries({ queryKey: invalidateQueries.units() });
    },
    onError: (error) => {
      console.error('Failed to delete unit:', error);
      // Here we could show a toast notification
    },
  });
}; 