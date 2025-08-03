import { apiClient } from '@/services/api';
import { authService } from '@/services/authService';
import { Product, ProductCreate, ProductUpdate, ProductImage } from '@/types/api';

// Types for product operations
export interface ProductFilters {
  search?: string;
  category_id?: number;
  limit?: number;
  offset?: number;
  include_deleted?: boolean;
}

// Product service functions
export const productService = {
  // Get all products with optional filters (PUBLIC - no auth required)
  getProducts: async (filters?: ProductFilters): Promise<Product[]> => {
    const params = new URLSearchParams();
    
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.category_id) {
      params.append('category_id', filters.category_id.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters?.offset) {
      params.append('offset', filters.offset.toString());
    }
    if (filters?.include_deleted) {
      params.append('include_deleted', 'true');
    }

    const response = await apiClient.get(`/products?${params.toString()}`);
    return response.data;
  },

  // Get a single product by ID (PUBLIC - no auth required)
  getProduct: async (id: number): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  // Create a new product (PROTECTED - requires auth)
  createProduct: async (data: ProductCreate): Promise<Product> => {
    return authService.makeAuthenticatedRequest(async () => {
      const formData = new FormData();
      
      // Add required fields
      formData.append('nume', data.nume);
      formData.append('cantitate', data.cantitate.toString());
      formData.append('pret', data.pret.toString());
      formData.append('unitati_id', data.unitati_id.toString());
      
      // Add optional fields
      if (data.description) {
        formData.append('description', data.description);
      }
      if (data.category_id) {
        formData.append('category_id', data.category_id.toString());
      }

      const response = await apiClient.post('/products', formData, {
        headers: {
          'Content-Type': undefined, // Let Axios set the correct Content-Type for FormData
        },
      });
      return response.data;
    });
  },

  // Update an existing product (PROTECTED - requires auth)
  updateProduct: async (id: number, data: ProductUpdate): Promise<Product> => {
    return authService.makeAuthenticatedRequest(async () => {
      const formData = new FormData();
      
      // Add fields that are present
      if (data.nume) {
        formData.append('nume', data.nume);
      }
      if (data.cantitate !== undefined) {
        formData.append('cantitate', data.cantitate.toString());
      }
      if (data.pret !== undefined) {
        formData.append('pret', data.pret.toString());
      }
      if (data.description !== undefined) {
        formData.append('description', data.description);
      }
      if (data.category_id !== undefined) {
        formData.append('category_id', data.category_id.toString());
      }
      if (data.unitati_id !== undefined) {
        formData.append('unitati_id', data.unitati_id.toString());
      }

      const response = await apiClient.patch(`/products/${id}`, formData, {
        headers: {
          'Content-Type': undefined, // Let Axios set the correct Content-Type for FormData
        },
      });
      return response.data;
    });
  },

  // Delete a product (PROTECTED - requires auth)
  deleteProduct: async (id: number): Promise<void> => {
    return authService.makeAuthenticatedRequest(async () => {
      await apiClient.delete(`/products/${id}`);
    });
  },

  // Upload product image (PROTECTED - requires auth)
  uploadProductImage: async (productId: number, image: File): Promise<ProductImage> => {
    return authService.makeAuthenticatedRequest(async () => {
      const formData = new FormData();
      formData.append('file', image);
      
      const response = await apiClient.post(`/products/${productId}/images`, formData, {
        headers: {
          'Content-Type': undefined, // Let Axios set the correct Content-Type for FormData
        },
      });
      return response.data;
    });
  },

  // Delete product image (PROTECTED - requires auth)
  deleteProductImage: async (productId: number, imageId: number): Promise<void> => {
    return authService.makeAuthenticatedRequest(async () => {
      await apiClient.delete(`/products/${productId}/images/${imageId}`);
    });
  },

  // Set primary image (PROTECTED - requires auth)
  setPrimaryImage: async (productId: number, imageId: number): Promise<void> => {
    return authService.makeAuthenticatedRequest(async () => {
      await apiClient.put(`/products/${productId}/images/${imageId}/primary`);
    });
  },

  // Reorder product images (PROTECTED - requires auth)
  reorderProductImages: async (productId: number, imageIds: number[]): Promise<void> => {
    return authService.makeAuthenticatedRequest(async () => {
      await apiClient.put(`/products/${productId}/images/reorder`, {
        image_ids: imageIds,
      });
    });
  },
}; 