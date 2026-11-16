import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Set the document title using environment variable
document.title = import.meta.env.VITE_APP_NAME || 'Online Shop Business';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 

// Register service worker for PWA
const updateSW = registerSW({
  // Register after the page has loaded, so precaching doesn't compete with
  // the first render for bandwidth
  immediate: false,
  onNeedRefresh() {
    updateSW(true)
  },
})