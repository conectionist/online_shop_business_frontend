import { apiClient } from '@/services/api';
import { Product, ProductCreate, ProductUpdate, ProductImage } from '@/types/api';

// Types for product operations
export interface ProductFilters {
  search?: string;
  category_id?: number;
  limit?: number;
  // Backend expects 'skip' for pagination offset
  skip?: number;
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
    if (filters?.skip) {
      params.append('skip', filters.skip.toString());
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

  // Create a new product (PROTECTED - requires auth, cookies sent automatically)
  createProduct: async (data: ProductCreate): Promise<Product> => {
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
    if (data.primary_image_upload_id) {
      formData.append('primary_image_upload_id', data.primary_image_upload_id);
    }

    const response = await apiClient.post('/products', formData, {
      headers: {
        'Content-Type': undefined, // Let Axios set the correct Content-Type for FormData
      },
    });
    return response.data;
  },

  // Update an existing product (PROTECTED - requires auth, cookies sent automatically)
  updateProduct: async (id: number, data: ProductUpdate): Promise<Product> => {
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
  },

  // Delete a product (PROTECTED - requires auth, cookies sent automatically)
  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  // Upload product image (PROTECTED - requires auth, cookies sent automatically)
  uploadProductImage: async (productId: number, image: File): Promise<ProductImage> => {
    const formData = new FormData();
    formData.append('file', image);

    const response = await apiClient.post(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': undefined, // Let Axios set the correct Content-Type for FormData
      },
      timeout: 120000, // 2 minutes for file uploads (global default is 10s)
    });
    return response.data;
  },

  // Get product images (PUBLIC)
  getProductImages: async (productId: number): Promise<ProductImage[]> => {
    const response = await apiClient.get(`/products/${productId}/images`);
    return response.data;
  },

  // Delete product image (PROTECTED - requires auth, cookies sent automatically)
  deleteProductImage: async (productId: number, imageId: number): Promise<void> => {
    await apiClient.delete(`/products/${productId}/images/${imageId}`);
  },

  // Set primary image (PROTECTED - requires auth, cookies sent automatically)
  setPrimaryImage: async (productId: number, imageId: number): Promise<void> => {
    await apiClient.put(`/products/${productId}/images/${imageId}/primary`);
  },

  // Update single image position (PROTECTED - requires auth, cookies sent automatically)
  updateImagePosition: async (productId: number, imageId: number, position: number): Promise<ProductImage> => {
    const formData = new FormData();
    formData.append('position', position.toString());
    const response = await apiClient.put(`/products/${productId}/images/${imageId}/position`, formData, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },

  // Reorder product images in bulk (PROTECTED - requires auth, cookies sent automatically)
  reorderProductImages: async (productId: number, mappings: Array<{ id: number; position: number }>): Promise<ProductImage[]> => {
    const response = await apiClient.put(`/products/${productId}/images/reorder`, mappings, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },
}; 