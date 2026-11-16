import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { readFileSync } from 'fs'

// Read package.json for version
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // The PDF and Excel libraries (~850 kB gzipped) are only used by admin
        // exports. Keep them out of the precache so shoppers never download
        // them; sw.ts caches them at runtime once an admin uses an export.
        globIgnores: ['**/node_modules/**/*', '**/assets/react-pdf*.js', '**/assets/xlsx*.js'],
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'favicon.svg'],
      manifest: false,
      devOptions: { enabled: true },
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      usePolling: true
    }
  },
  preview: {
    port: 3000,
    host: '0.0.0.0'
  }
}) 