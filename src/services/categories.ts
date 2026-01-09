import { apiClient, createFormData } from '@/services/api';
import { authService } from '@/services/authService';
import { Category } from '@/types/api';

// Types for category operations
export interface CreateCategoryData {
  name: string;
  order_index: number;
  primary_image?: File;
}

export interface UpdateCategoryData {
  id: number;
  name?: string;
  clear_image?: boolean;
  order_index?: number;
}

export interface CategoryFilters {
  search?: string;
  limit?: number;
  offset?: number;
}

// Category service functions
export const categoryService = {
  // Get all categories with optional filters (PUBLIC - no auth required)
  getCategories: async (filters?: CategoryFilters): Promise<Category[]> => {
    const params = new URLSearchParams();
    
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters?.offset) {
      params.append('offset', filters.offset.toString());
    }

    const response = await apiClient.get(`/categories?${params.toString()}`);
    return response.data;
  },

  // Get a single category by ID (PUBLIC - no auth required)
  getCategory: async (id: number): Promise<Category> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  // Create a new category (PROTECTED - requires auth)
  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    return authService.makeAuthenticatedRequest(async () => {
      const formData = createFormData(data);
      const response = await apiClient.post('/categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    });
  },

  // Update an existing category (PROTECTED - requires auth)
  updateCategory: async (data: UpdateCategoryData): Promise<Category> => {
    return authService.makeAuthenticatedRequest(async () => {
      const { id, ...categoryData } = data;
      
      const formData = new FormData();
      if (categoryData.name) {
        formData.append('name', categoryData.name);
      }
      if (categoryData.clear_image) {
        formData.append('clear_image', 'true');
      }
      if (categoryData.order_index !== undefined) {
        formData.append('order_index', categoryData.order_index.toString());
      }
      
      const response = await apiClient.patch(`/categories/${id}`, formData, {
        headers: {
          'Content-Type': undefined, // Let Axios set the correct Content-Type for FormData
        },
      });
      return response.data;
    });
  },

  // Delete a category (PROTECTED - requires auth)
  deleteCategory: async (id: number): Promise<void> => {
    return authService.makeAuthenticatedRequest(async () => {
      await apiClient.delete(`/categories/${id}`);
    });
  },

  // Upload category image (PROTECTED - requires auth)
  uploadCategoryImage: async (id: number, image: File): Promise<Category> => {
    return authService.makeAuthenticatedRequest(async () => {
      const formData = new FormData();
      formData.append('file', image);
      
      const response = await apiClient.post(`/categories/${id}/image`, formData, {
        headers: {
          'Content-Type': undefined, // Let Axios set the correct Content-Type for FormData
        },
      });
      return response.data;
    });
  },

  // Bulk reorder categories (PROTECTED - requires auth)
  reorder: async (categoryIds: number[]): Promise<Category[]> => {
    return authService.makeAuthenticatedRequest(async () => {
      const response = await apiClient.put<Category[]>('/categories/reorder', categoryIds);
      return response.data;
    });
  },
}; 