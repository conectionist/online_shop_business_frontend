import { useEffect, useMemo, useState } from 'react'

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function detectIsIOSSafari(): boolean {
  const ua = navigator.userAgent || ''
  // Detect iPadOS 13+ without using deprecated navigator.platform
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && (navigator as any).maxTouchPoints > 1)
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
  return isIOS && isSafari
}

function detectIsStandalone(): boolean {
  // iOS Safari exposes navigator.standalone; other platforms use display-mode
  const isIOSStandalone = typeof (navigator as any).standalone !== 'undefined' && (navigator as any).standalone === true
  const isDisplayModeStandalone = window.matchMedia('(display-mode: standalone)').matches
  return isIOSStandalone || isDisplayModeStandalone
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallAvailable, setIsInstallAvailable] = useState(false)

  const isIOS = useMemo(() => detectIsIOSSafari(), [])
  const isStandalone = useMemo(() => detectIsStandalone(), [])

  useEffect(() => {
    if (isIOS) {
      // On iOS there is no beforeinstallprompt; show link only if not installed
      setIsInstallAvailable(!isStandalone)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault?.()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallAvailable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [isIOS, isStandalone])

  const promptInstall = async () => {
    if (!deferredPrompt) return { outcome: 'dismissed' as const }
    try {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setIsInstallAvailable(false)
      }
      return choice
    } catch {
      return { outcome: 'dismissed' as const }
    } finally {
      setDeferredPrompt(null)
    }
  }

  return {
    isIOS,
    isStandalone,
    isInstallAvailable,
    promptInstall,
  }
}
