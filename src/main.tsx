import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set the document title using environment variable
document.title = import.meta.env.VITE_APP_NAME || 'Online Shop Business';

// Register PWA Service Worker and show a prompt when a new version is available
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
	immediate: true,
	onNeedRefresh() {
		if (confirm('Aplicația a fost actualizată. Reîncărcați pentru a vedea ultima versiune?')) {
			updateSW(true)
		}
	},
	onOfflineReady() {
		// Optionally notify that app is ready to work offline
		console.log('App ready to work offline')
	},
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 