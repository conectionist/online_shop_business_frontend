import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidateQueries } from '@/lib/queryKeys';
import { categoryService, CreateCategoryData, UpdateCategoryData, CategoryFilters } from '@/services/categories';

// Hook to get all categories
export const useCategories = (filters?: CategoryFilters) => {
  return useQuery({
    queryKey: queryKeys.categories.list(filters || {}),
    queryFn: () => categoryService.getCategories(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get a single category
export const useCategory = (id: number) => {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => categoryService.getCategory(id),
    enabled: !!id, // Only run if id is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create a category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCategoryData) => categoryService.createCategory(data),
    onSuccess: () => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: invalidateQueries.categories() });
    },
    onError: (error) => {
      console.error('Failed to create category:', error);
      // Here we could show a toast notification
    },
  });
};

// Hook to update a category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateCategoryData) => categoryService.updateCategory(data),
    onSuccess: (updatedCategory) => {
      // Update the specific category in cache
      queryClient.setQueryData(
        queryKeys.categories.detail(updatedCategory.id),
        updatedCategory
      );
      
      // Also update the category in the categories list cache
      queryClient.setQueryData(
        queryKeys.categories.list({}),
        (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((category: any) => 
            category.id === updatedCategory.id ? updatedCategory : category
          );
        }
      );
      
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: invalidateQueries.categories() });
    },
    onError: (error) => {
      console.error('Failed to update category:', error);
      // Here we could show a toast notification
    },
  });
};

// Hook to delete a category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => categoryService.deleteCategory(id),
    onSuccess: (_, deletedId) => {
      // Remove the specific category from cache
      queryClient.removeQueries({ queryKey: queryKeys.categories.detail(deletedId) });
      
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: invalidateQueries.categories() });
    },
    onError: (error) => {
      console.error('Failed to delete category:', error);
      // Here we could show a toast notification
    },
  });
};

// Hook to upload category image
export const useUploadCategoryImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, image }: { id: number; image: File }) => 
      categoryService.uploadCategoryImage(id, image),
    onSuccess: (updatedCategory) => {
      // Update the specific category in cache
      queryClient.setQueryData(
        queryKeys.categories.detail(updatedCategory.id),
        updatedCategory
      );
      
      // Also update the category in the categories list cache immediately
      queryClient.setQueryData(
        queryKeys.categories.list({}),
        (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((category: any) => 
            category.id === updatedCategory.id ? updatedCategory : category
          );
        }
      );
      
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: invalidateQueries.categories() });
    },
    onError: (error) => {
      console.error('Failed to upload category image:', error);
      // Here we could show a toast notification
    },
  });
};

// Bulk reorder categories
export const useReorderCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryIds: number[]) => categoryService.reorder(categoryIds),
    onSuccess: (updatedCategories) => {
      // Update the cache with the new order
      queryClient.setQueryData(queryKeys.categories.list({}), updatedCategories);
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: invalidateQueries.categories() });
    },
  });
}; 