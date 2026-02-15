import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiError } from '@/types/api';
import { getImageValidationMessage } from '@/utils/imageUploadErrors';
import { authService } from './authService';
import { useAuthStore } from '@/stores/authStore';

export const apiClient: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
  withCredentials: true, // Enable cookies for cross-origin requests
});

// Function to get API base URL dynamically
export const getApiBaseUrl = (): string => {
  // Check runtime config first, then build-time env vars
  let apiUrl = window.__RUNTIME_CONFIG__?.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL;
  
  if (!apiUrl) {
    console.warn('VITE_API_BASE_URL not set, using default: http://localhost:8001');
    return 'http://localhost:8001';
  }

  // If the frontend is served over HTTPS, force the API to use HTTPS as well
  if (window.location.protocol === 'https:' && apiUrl.startsWith('http://')) {
    apiUrl = apiUrl.replace('http://', 'https://');
  }

  return apiUrl;
};



apiClient.interceptors.request.use(
  (config: any) => {
    const baseUrl = getApiBaseUrl();
    config.baseURL = `${baseUrl}/api/v1`;
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Refresh mutex: ensures only one refresh request runs at a time.
// When multiple requests get 401 simultaneously, the first triggers the refresh
// and all others wait for the same promise. This prevents token rotation conflicts
// where concurrent refreshes invalidate each other's tokens.
let refreshPromise: Promise<void> | null = null;

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Check if response is HTML instead of JSON (indicates wrong endpoint)
    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('text/html') && !contentType.includes('application/json')) {
      return Promise.reject({
        code: 'ERR_WRONG_RESPONSE',
        message: 'Received HTML instead of JSON response',
        response: {
          status: 406,
          data: { detail: 'The API endpoint returned an unexpected response format.' }
        }
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // CRITICAL: Never retry /auth/refresh or /auth/logout to prevent infinite loops
    const isAuthEndpoint = originalRequest.url?.includes('/auth/refresh') ||
                          originalRequest.url?.includes('/auth/logout');

    // If /auth/refresh or /auth/logout fails with 401 → session dead, redirect to login
    if (error.response?.status === 401 && isAuthEndpoint) {
      // Clear local state without calling backend (session already revoked)
      refreshPromise = null;
      useAuthStore.getState().logout();
      const { queryClient } = await import('@/lib/queryClient');
      queryClient.clear();
      window.location.href = '/login';
      return Promise.reject(new Error('Session revoked'));
    }

    // Handle 401 on regular endpoints with automatic token refresh (max 1 retry)
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // If a refresh is already in flight, wait for it instead of starting another
        if (!refreshPromise) {
          refreshPromise = authService.refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        await refreshPromise;

        // Retry the original request (cookies updated automatically by backend)
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear state and redirect (don't call logout backend)
        useAuthStore.getState().logout();
        const { queryClient } = await import('@/lib/queryClient');
        queryClient.clear();
        window.location.href = '/login';
        return Promise.reject(new Error('Authentication failed - please log in again'));
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleApiError = (error: any): ApiError => {
  if (axios.isAxiosError(error)) {
    // Handle network errors (server unreachable)
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      return {
        detail: 'The service is temporarily unavailable. Please try again later.'
      };
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return {
        detail: 'The request is taking longer than expected. Please try again.'
      };
    }
    
    // Handle 5xx server errors
    if (error.response?.status && error.response.status >= 500) {
      return {
        detail: 'Something went wrong on our end. Please try again later.'
      };
    }
    
    // Handle specific 4xx client errors
    if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
      const status = error.response.status;
      const data = error.response?.data;
      
      // Handle 409 Conflict (duplicate resource)
      if (status === 409) {
        return {
          detail: data?.detail || 'Numele sau indexul este deja folosit.'
        };
      }
      
      // Handle 422 Validation Error
      if (status === 422) {
        return {
          detail: data?.detail || 'Date invalide. Verificați câmpurile și încercați din nou.'
        };
      }
      
      // Handle 404 Not Found
      if (status === 404) {
        return {
          detail: data?.detail || 'The requested item was not found.'
        };
      }

      // Handle 400 Image validation (body shape like 422: detail array with type starting with image_)
      if (status === 400) {
        const detail = data?.detail;
        if (Array.isArray(detail) && detail[0]?.type?.startsWith('image_')) {
          return { detail: getImageValidationMessage(error) };
        }
      }

      // Handle other 4xx errors
      return {
        detail: data?.detail || 'The request could not be completed.'
      };
    }
    
    return {
      detail: 'An unexpected error occurred. Please try again.'
    };
  }
  return {
    detail: 'Something went wrong. Please try again.'
  };
};

// Helper function for form data requests
export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });
  
  return formData;
};

// Helper function for query parameters
export const createQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
};

// Helper function to construct full image URLs
export const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /, it's already a relative path to the API
  if (imagePath.startsWith('/')) {
    const baseUrl = getApiBaseUrl();
    return `${baseUrl}${imagePath}`;
  }
  
  // Otherwise, construct the full URL
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api/v1/static/${imagePath}`;
};

// Utility function for category images
export const getCategoryImageUrl = (category: any, version: 'original' | 'medium' | 'thumbnail' = 'thumbnail') => {
  const baseUrl = getApiBaseUrl();
  
  if (!category.image_versions) {
    return `${baseUrl}/api/v1/static/placeholders/category_placeholder.jpg`;
  }
  
  const imagePath = category.image_versions[version];
  
  // If it's already a full URL (starts with /api/v1/static/), use it as is
  if (imagePath.startsWith('/api/v1/static/')) {
    return `${baseUrl}${imagePath}`;
  }
  
  // Otherwise, construct the full URL
  return `${baseUrl}/api/v1/static/uploads/${imagePath}`;
};

// Utility function for product images
export const getProductImageUrl = (product: any, version: 'original' | 'medium' | 'thumbnail' = 'thumbnail') => {
  const baseUrl = getApiBaseUrl();
  
  // Check if product has image_versions directly (like in products list)
  if (product.image_versions) {
    const imagePath = product.image_versions[version];
    
    // If it's already a full URL (starts with /api/v1/static/), use it as is
    if (imagePath.startsWith('/api/v1/static/')) {
      return `${baseUrl}${imagePath}`;
    }
    
    // Otherwise, construct the full URL
    return `${baseUrl}/api/v1/static/uploads/${imagePath}`;
  }
  
  // Check if product has images array (like in list preview)
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    if (firstImage.image_versions && firstImage.image_versions[version]) {
      const imagePath = firstImage.image_versions[version];
      
      // If it's already a full URL (starts with /api/v1/static/), use it as is
      if (imagePath.startsWith('/api/v1/static/')) {
        return `${baseUrl}${imagePath}`;
      }
      
      // Otherwise, construct the full URL
      return `${baseUrl}/api/v1/static/uploads/${imagePath}`;
    }
  }
  
  // Fallback to placeholder
  return `${baseUrl}/api/v1/static/placeholders/product_placeholder.jpg`;
};

// Utility function to build URL directly from a ProductImage entry
export const getProductImageUrlFromImage = (
  image: { image_versions?: Record<'original' | 'medium' | 'thumbnail', string> } | null | undefined,
  version: 'original' | 'medium' | 'thumbnail' = 'thumbnail'
): string => {
  const baseUrl = getApiBaseUrl();
  const imagePath = image?.image_versions?.[version];
  if (!imagePath) {
    return `${baseUrl}/api/v1/static/placeholders/product_placeholder.jpg`;
  }
  if (imagePath.startsWith('/api/v1/static/')) {
    return `${baseUrl}${imagePath}`;
  }
  return `${baseUrl}/api/v1/static/uploads/${imagePath}`;
};

// Utility function for logo images
export const getLogoUrl = (logoPath: string | null | undefined): string => {
  if (!logoPath) {
    return '/test/test_data/logo.jpg'; // Default logo served by frontend
  }
  
  // If it's already a full URL, return as is
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
    return logoPath;
  }
  
  // If it starts with /, it's a relative path to the frontend server
  if (logoPath.startsWith('/')) {
    return logoPath;
  }
  
  // Otherwise, assume it's a relative path to the frontend server
  return `/${logoPath}`;
}; 