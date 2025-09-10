/// <reference types="vite/client" />

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