import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, ProductFilters } from '@/services/products';
import { uploadService } from '@/services/uploads';
import { ProductCreate, ProductUpdate } from '@/types/api';
import { queryKeys, invalidateQueries } from '@/lib/queryKeys';

// Hook to fetch all products
export const useProducts = (filters?: ProductFilters) => {
  const effectiveFilters: ProductFilters = {
    limit: 1000,
    skip: 0,
    ...(filters || {}),
  };

  return useQuery({
    queryKey: queryKeys.products.list(effectiveFilters),
    queryFn: () => productService.getProducts(effectiveFilters),
  });
};

// Alias for fetching all products (for catalog page)
export const useAllProducts = () => {
  return useProducts({ limit: 1000, skip: 0 });
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
    mutationFn: ({ id }: { id: number }) => 
      productService.deleteProduct(id),
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

// Hook to upload product image
export const useUploadProductImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, image }: { productId: number; image: File }) => 
      productService.uploadProductImage(productId, image),
    onSuccess: (_, { productId }) => {
      // Force refresh the data by invalidating queries
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.list({}) });
    },
    onError: (error) => {
      console.error('Failed to upload product image:', error);
    },
  });
};

// Hook to upload an image to staging (upload-first flow)
export const useUploadImageToStaging = () => {
  return useMutation({
    mutationFn: (file: File) => uploadService.uploadImageToStaging(file),
  });
};

// Hook to delete product image
export const useDeleteProductImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) => 
      productService.deleteProductImage(productId, imageId),
    onSuccess: (_, { productId, imageId }) => {
      // Update the specific product in cache
      queryClient.setQueryData(
        queryKeys.products.detail(productId),
        (oldProduct: any) => {
          if (!oldProduct) return oldProduct;
          return {
            ...oldProduct,
            images: (oldProduct.images || []).filter((img: any) => img.id !== imageId),
          };
        }
      );
      
      // Also update the product in the products list cache
      queryClient.setQueryData(
        queryKeys.products.list({}),
        (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((product: any) => {
            if (product.id === productId) {
              return {
                ...product,
                images: (product.images || []).filter((img: any) => img.id !== imageId),
              };
            }
            return product;
          });
        }
      );
      
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: invalidateQueries.products() });
    },
    onError: (error) => {
      console.error('Failed to delete product image:', error);
    },
  });
}; 

// Hook to set primary image
export const useSetPrimaryImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) =>
      productService.setPrimaryImage(productId, imageId),
    onSuccess: (_, { productId, imageId }) => {
      // Optimistically move imageId to position 0 and set is_primary
      queryClient.setQueryData(
        queryKeys.products.detail(productId),
        (oldProduct: any) => {
          if (!oldProduct?.images) return oldProduct;
          const images = oldProduct.images
            .map((img: any) => ({ ...img, is_primary: img.id === imageId }))
            .sort((a: any, b: any) => (a.id === imageId ? -1 : b.id === imageId ? 1 : a.position - b.position))
            .map((img: any, idx: number) => ({ ...img, position: idx }));
          return { ...oldProduct, images };
        }
      );
      queryClient.invalidateQueries({ queryKey: invalidateQueries.products() });
    },
  });
};

// Hook to update single image position
export const useUpdateImagePosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, imageId, position }: { productId: number; imageId: number; position: number }) =>
      productService.updateImagePosition(productId, imageId, position),
    onSuccess: (_, { productId, imageId, position }) => {
      queryClient.setQueryData(
        queryKeys.products.detail(productId),
        (oldProduct: any) => {
          if (!oldProduct?.images) return oldProduct;
          const moved = oldProduct.images.map((img: any) => (img.id === imageId ? { ...img, position } : img));
          const reordered = moved.sort((a: any, b: any) => a.position - b.position).map((img: any, idx: number) => ({ ...img, position: idx }));
          return { ...oldProduct, images: reordered };
        }
      );
    },
  });
};

// Hook to bulk reorder images
export const useReorderProductImages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, mappings }: { productId: number; mappings: Array<{ id: number; position: number }> }) =>
      productService.reorderProductImages(productId, mappings),
    onSuccess: (newImages, { productId }) => {
      queryClient.setQueryData(queryKeys.products.detail(productId), (oldProduct: any) => {
        if (!oldProduct) return oldProduct;
        return { ...oldProduct, images: newImages };
      });
      queryClient.invalidateQueries({ queryKey: invalidateQueries.products() });
    },
  });
};