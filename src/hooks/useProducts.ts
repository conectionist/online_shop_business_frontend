import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, ProductFilters } from '@/services/products';
import { Product, ProductCreate, ProductUpdate } from '@/types/api';
import { queryKeys, invalidateQueries } from '@/lib/queryKeys';

// Hook to fetch all products
export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: queryKeys.products.list(filters || {}),
    queryFn: () => productService.getProducts(filters),
  });
};

// Hook to fetch a single product
export const useProduct = (id: number) => {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
  });
};

// Hook to create a product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProductCreate) => productService.createProduct(data),
    onSuccess: () => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: invalidateQueries.products() });
    },
    onError: (error) => {
      console.error('Failed to create product:', error);
    },
  });
};

// Hook to update a product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { id: number; data: ProductUpdate }) => 
      productService.updateProduct(data.id, data.data),
    onSuccess: (updatedProduct) => {
      // Update the specific product in cache
      queryClient.setQueryData(
        queryKeys.products.detail(updatedProduct.id),
        updatedProduct
      );
      
      // Also update the product in the products list cache
      queryClient.setQueryData(
        queryKeys.products.list({}),
        (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((product: any) => 
            product.id === updatedProduct.id ? updatedProduct : product
          );
        }
      );
      
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: invalidateQueries.products() });
    },
    onError: (error) => {
      console.error('Failed to update product:', error);
    },
  });
};

// Hook to delete a product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, permanent }: { id: number; permanent?: boolean }) => 
      productService.deleteProduct(id, permanent),
    onSuccess: (_, { id }) => {
      // Remove the specific product from cache
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(id) });
      
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: invalidateQueries.products() });
    },
    onError: (error) => {
      console.error('Failed to delete product:', error);
    },
  });
}; 