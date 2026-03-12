import { getLogoUrl } from '@/services/api';

// Global type declaration for runtime config
declare global {
  interface Window {
    __RUNTIME_CONFIG__?: {
      VITE_API_BASE_URL?: string;
      VITE_APP_NAME?: string;
      VITE_LOGO_PATH?: string;
      VITE_SITE_URL?: string;
      VITE_RYBBIT_SITE_ID?: string;
      VITE_PLAUSIBLE_DOMAIN?: string;
      VITE_PLAUSIBLE_SCRIPT_URL?: string;
      VITE_RYBBIT_SCRIPT_URL?: string;
      NODE_ENV?: string;
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

  // Get environment (runtime config takes precedence)
  const nodeEnv = window.__RUNTIME_CONFIG__?.NODE_ENV || import.meta.env.MODE || 'production';
  const isDevelopment = nodeEnv === 'development';

  // If the frontend is served over HTTPS, force the API to use HTTPS as well
  // BUT: In development mode, be permissive and allow HTTP (for local dev without SSL)
  if (window.location.protocol === 'https:' && apiUrl.startsWith('http://') && !isDevelopment) {
    apiUrl = apiUrl.replace('http://', 'https://');
    console.info('Auto-upgraded API URL to HTTPS:', apiUrl);
  }

  return apiUrl;
};

export const getLogoPath = (): string => {
  const logoPath = import.meta.env.VITE_LOGO_PATH || window.__RUNTIME_CONFIG__?.VITE_LOGO_PATH || '/test/test_data/logo.jpg';
  return getLogoUrl(logoPath);
}; 