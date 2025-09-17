/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_LOGO_PATH: string
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 

// Compile-time globals injected by Vite define
declare global {
  const __APP_VERSION__: string;
  const __BUILD_TIME__: string;
}

export {};

declare module 'virtual:pwa-register' {
  export function registerSW(options?: {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
  }): (reloadPage?: boolean) => void;
}