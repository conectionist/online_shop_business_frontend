// App configuration utilities
export const getAppName = (): string => {
  return import.meta.env.VITE_APP_NAME || 'Online Shop Business';
};

export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
};

export const getLogoPath = (): string => {
  return import.meta.env.VITE_LOGO_PATH || '/test/test_data/logo.jpg';
}; 