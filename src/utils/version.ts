// Version information for the application
export const APP_VERSION = (globalThis as any).__APP_VERSION__ || '2.3.0';

// Build information (useful for debugging)
export const BUILD_INFO = {
  version: APP_VERSION,
  buildTime: (globalThis as any).__BUILD_TIME__ || new Date().toISOString(),
  environment: import.meta.env.MODE || 'development',
};

// Helper function to get full version info
export const getVersionInfo = () => {
  return {
    ...BUILD_INFO,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };
};

// Helper function to format version for display
export const getDisplayVersion = () => {
  const env = BUILD_INFO.environment;
  return env === 'production' ? `v${APP_VERSION}` : `v${APP_VERSION} (${env})`;
}; 