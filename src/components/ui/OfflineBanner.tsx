import React, { useEffect, useState } from 'react'

const bannerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  background: '#111827',
  color: '#F9FAFB',
  padding: '10px 16px',
  textAlign: 'center',
  fontSize: 14,
}

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div style={bannerStyle} role="status" aria-live="polite">
      Sunteți offline. Unele funcționalități pot fi indisponibile.
    </div>
  )
}


