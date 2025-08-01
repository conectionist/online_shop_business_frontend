import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidateQueries } from '@/lib/queryKeys';
import { listService, ListFilters } from '@/services/lists';
import { ListCreate, ListUpdate } from '@/types/api';

// Hook to get all lists
export const useLists = (filters?: ListFilters) => {
  return useQuery({
    queryKey: queryKeys.lists.list(filters || {}),
    queryFn: () => listService.getLists(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get the published list (for customers)
export const usePublishedList = () => {
  return useQuery({
    queryKey: [...queryKeys.lists.list({}), 'published'],
    queryFn: () => listService.getPublishedList(),
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter cache for customer-facing data
  });
};

// Hook to get a single list
export const useList = (id: number) => {
  return useQuery({
    queryKey: queryKeys.lists.detail(id),
    queryFn: () => listService.getList(id),
    enabled: !!id, // Only run if id is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create a list
export const useCreateList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ListCreate) => listService.createList(data),
    onSuccess: () => {
      // Invalidate and refetch lists
      queryClient.invalidateQueries({ queryKey: invalidateQueries.lists() });
    },
    onError: (error) => {
      console.error('Failed to create list:', error);
    },
  });
};

// Hook to update a list (PATCH)
export const useUpdateList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ListUpdate }) => 
      listService.updateList(id, data),
    onSuccess: (updatedList) => {
      // Update the specific list in cache
      queryClient.setQueryData(
        queryKeys.lists.detail(updatedList.id),
        updatedList
      );
      
      // Also update the list in the lists cache
      queryClient.setQueryData(
        queryKeys.lists.list({}),
        (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((list: any) => 
            list.id === updatedList.id ? updatedList : list
          );
        }
      );
      
      // Invalidate and refetch lists
      queryClient.invalidateQueries({ queryKey: invalidateQueries.lists() });
    },
    onError: (error) => {
      console.error('Failed to update list:', error);
    },
  });
};

// Hook to replace a list (PUT)
export const useReplaceList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ListCreate }) => 
      listService.replaceList(id, data),
    onSuccess: (updatedList) => {
      // Update the specific list in cache
      queryClient.setQueryData(
        queryKeys.lists.detail(updatedList.id),
        updatedList
      );
      
      // Also update the list in the lists cache
      queryClient.setQueryData(
        queryKeys.lists.list({}),
        (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((list: any) => 
            list.id === updatedList.id ? updatedList : list
          );
        }
      );
      
      // Invalidate and refetch lists
      queryClient.invalidateQueries({ queryKey: invalidateQueries.lists() });
    },
    onError: (error) => {
      console.error('Failed to replace list:', error);
    },
  });
};

// Hook to delete a list
export const useDeleteList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, permanent }: { id: number; permanent?: boolean }) => 
      listService.deleteList(id, permanent),
    onSuccess: (_, { id }) => {
      // Remove the specific list from cache
      queryClient.removeQueries({ queryKey: queryKeys.lists.detail(id) });
      
      // Invalidate and refetch lists
      queryClient.invalidateQueries({ queryKey: invalidateQueries.lists() });
    },
    onError: (error) => {
      console.error('Failed to delete list:', error);
    },
  });
};

// Hook to get list products
export const useListProducts = (listId: number) => {
  return useQuery({
    queryKey: [...queryKeys.lists.detail(listId), 'products'],
    queryFn: () => listService.getListProducts(listId),
    enabled: !!listId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to add product to list
export const useAddProductToList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, productId, stock }: { listId: number; productId: number; stock?: number }) => 
      listService.addProductToList(listId, productId, stock),
    onSuccess: (_, { listId }) => {
      // Invalidate list products
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.lists.detail(listId), 'products'] 
      });
    },
    onError: (error) => {
      console.error('Failed to add product to list:', error);
    },
  });
};

// Hook to remove product from list
export const useRemoveProductFromList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, productId }: { listId: number; productId: number }) => 
      listService.removeProductFromList(listId, productId),
    onSuccess: (_, { listId }) => {
      // Invalidate list products
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.lists.detail(listId), 'products'] 
      });
    },
    onError: (error) => {
      console.error('Failed to remove product from list:', error);
    },
  });
};

// Hook to replace list products
export const useReplaceListProducts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, productIds }: { listId: number; productIds: number[] }) => 
      listService.replaceListProducts(listId, productIds),
    onSuccess: (_, { listId }) => {
      // Invalidate list products
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.lists.detail(listId), 'products'] 
      });
    },
    onError: (error) => {
      console.error('Failed to replace list products:', error);
    },
  });
};

// Hook to get list delivery types
export const useListDeliveryTypes = (listId: number) => {
  return useQuery({
    queryKey: [...queryKeys.lists.detail(listId), 'delivery-types'],
    queryFn: () => listService.getListDeliveryTypes(listId),
    enabled: !!listId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to add delivery type to list
export const useAddDeliveryTypeToList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, deliveryTypeId }: { listId: number; deliveryTypeId: number }) => 
      listService.addDeliveryTypeToList(listId, deliveryTypeId),
    onSuccess: (_, { listId }) => {
      // Invalidate list delivery types
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.lists.detail(listId), 'delivery-types'] 
      });
    },
    onError: (error) => {
      console.error('Failed to add delivery type to list:', error);
    },
  });
};

// Hook to remove delivery type from list
export const useRemoveDeliveryTypeFromList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, deliveryTypeId }: { listId: number; deliveryTypeId: number }) => 
      listService.removeDeliveryTypeFromList(listId, deliveryTypeId),
    onSuccess: (_, { listId }) => {
      // Invalidate list delivery types
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.lists.detail(listId), 'delivery-types'] 
      });
    },
    onError: (error) => {
      console.error('Failed to remove delivery type from list:', error);
    },
  });
};

// Hook to replace list delivery types
export const useReplaceListDeliveryTypes = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, deliveryTypeIds }: { listId: number; deliveryTypeIds: number[] }) => 
      listService.replaceListDeliveryTypes(listId, deliveryTypeIds),
    onSuccess: (_, { listId }) => {
      // Invalidate list delivery types
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.lists.detail(listId), 'delivery-types'] 
      });
    },
    onError: (error) => {
      console.error('Failed to replace list delivery types:', error);
    },
  });
}; 