// Version information for the application
// Vite inlines __APP_VERSION__ at build time via define in vite.config.ts
// Fallback remains for safety during non-Vite runtimes
export const APP_VERSION = (typeof __APP_VERSION__ !== 'undefined' && __APP_VERSION__) || '1.0.0';

// Build information (useful for debugging)
export const BUILD_INFO = {
  version: APP_VERSION,
  buildTime: (typeof __BUILD_TIME__ !== 'undefined' && __BUILD_TIME__) || new Date().toISOString(),
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