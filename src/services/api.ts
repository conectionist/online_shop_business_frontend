import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fail fast if API URL is not configured
if (!API_BASE_URL) {
  const error = new Error(
    'VITE_API_BASE_URL environment variable is required but not set. ' +
    'Please check your .env file and ensure VITE_API_BASE_URL is configured.'
  );
  throw error;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
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
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
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
    if (error.response?.status >= 500) {
      return {
        detail: 'Something went wrong on our end. Please try again later.'
      };
    }
    
    // Handle specific 4xx client errors
    if (error.response?.status >= 400 && error.response?.status < 500) {
      const status = error.response.status;
      const data = error.response?.data;
      
      // Handle 409 Conflict (duplicate resource)
      if (status === 409) {
        return {
          detail: data?.detail || 'This item already exists. Please use a different name.'
        };
      }
      
      // Handle 422 Validation Error
      if (status === 422) {
        return {
          detail: data?.detail || 'The provided data is invalid. Please check your input and try again.'
        };
      }
      
      // Handle 404 Not Found
      if (status === 404) {
        return {
          detail: data?.detail || 'The requested item was not found.'
        };
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
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // Otherwise, construct the full URL
  return `${API_BASE_URL}/api/v1/static/${imagePath}`;
};

// Utility function for category images
export const getCategoryImageUrl = (category: any, version: 'original' | 'medium' | 'thumbnail' = 'thumbnail') => {
  if (!category.image_versions) {
    return `${API_BASE_URL}/api/v1/static/placeholders/category_placeholder.jpg`;
  }
  
  const imagePath = category.image_versions[version];
  
  // If it's already a full URL (starts with /api/v1/static/), use it as is
  if (imagePath.startsWith('/api/v1/static/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // Otherwise, construct the full URL
  return `${API_BASE_URL}/api/v1/static/uploads/${imagePath}`;
}; 