import { apiClient, createFormData } from '@/services/api';
import { Category } from '@/types/api';

// Types for category operations
export interface CreateCategoryData {
  name: string;
  primary_image?: File;
}

export interface UpdateCategoryData {
  id: number;
  name?: string;
  clear_image?: boolean;
}

export interface CategoryFilters {
  search?: string;
  limit?: number;
  offset?: number;
}

// Category service functions
export const categoryService = {
  // Get all categories with optional filters
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

  // Get a single category by ID
  getCategory: async (id: number): Promise<Category> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  // Create a new category
  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    const formData = createFormData(data);
    const response = await apiClient.post('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update an existing category
  updateCategory: async (data: UpdateCategoryData): Promise<Category> => {
    const { id, ...categoryData } = data;
    
    const formData = new FormData();
    if (categoryData.name) {
      formData.append('name', categoryData.name);
    }
    if (categoryData.clear_image) {
      formData.append('clear_image', 'true');
    }
    
    const response = await apiClient.patch(`/categories/${id}`, formData, {
      headers: {
        'Content-Type': undefined, // Let Axios set the correct Content-Type for FormData
      },
    });
    return response.data;
  },

  // Delete a category (soft delete)
  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },

  // Upload category image
  uploadCategoryImage: async (id: number, image: File): Promise<Category> => {
    const formData = new FormData();
    formData.append('file', image);
    
    try {
      const response = await apiClient.post(`/categories/${id}/image`, formData, {
        headers: {
          'Content-Type': undefined, // Let Axios set the correct Content-Type for FormData
        },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
}; 