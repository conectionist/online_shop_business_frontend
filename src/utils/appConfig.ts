import { getLogoUrl } from '@/services/api';

// Global type declaration for runtime config
declare global {
  interface Window {
    __RUNTIME_CONFIG__?: {
      VITE_API_BASE_URL?: string;
      VITE_APP_NAME?: string;
      VITE_LOGO_PATH?: string;
    };
  }
}

// App configuration utilities
export const getAppName = (): string => {
  return import.meta.env.VITE_APP_NAME || window.__RUNTIME_CONFIG__?.VITE_APP_NAME || 'Online Shop Business';
};

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

export const getLogoPath = (): string => {
  const logoPath = import.meta.env.VITE_LOGO_PATH || window.__RUNTIME_CONFIG__?.VITE_LOGO_PATH || '/test/test_data/logo.jpg';
  return getLogoUrl(logoPath);
}; 