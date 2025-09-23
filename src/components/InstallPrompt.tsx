import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault?.()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsVisible(true)
    }

    const onAppInstalled = () => {
      setDeferredPrompt(null)
      setIsVisible(false)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  if (!isVisible || !deferredPrompt) return null

  const handleInstall = async () => {
    try {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
    } catch (_) {
      // ignore
    } finally {
      setDeferredPrompt(null)
      setIsVisible(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  return (
    <div style={{
      position: 'fixed',
      left: 16,
      right: 16,
      bottom: 16,
      zIndex: 1000,
      background: 'rgba(255,255,255,0.98)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      borderRadius: 8,
      padding: 12,
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <span>Instalează aplicația pe dispozitivul tău?</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleDismiss} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', background: '#f8f9fa', cursor: 'pointer' }}>Mai târziu</button>
        <button onClick={handleInstall} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid transparent', background: '#111827', color: 'white', cursor: 'pointer' }}>Instalează</button>
      </div>
    </div>
  )
}

export default InstallPrompt


