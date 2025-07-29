import { apiClient } from '@/services/api';
import { Product, ProductCreate, ProductUpdate } from '@/types/api';

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
  // Get all products with optional filters
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

  // Get a single product by ID
  getProduct: async (id: number): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  // Create a new product
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

    const response = await apiClient.post('/products', formData, {
      headers: {
        'Content-Type': undefined, // Let Axios set the correct Content-Type for FormData
      },
    });
    return response.data;
  },

  // Update an existing product
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

  // Delete a product (soft delete by default)
  deleteProduct: async (id: number, permanent: boolean = false): Promise<void> => {
    const params = permanent ? '?permanent=true' : '';
    await apiClient.delete(`/products/${id}${params}`);
  },
}; 