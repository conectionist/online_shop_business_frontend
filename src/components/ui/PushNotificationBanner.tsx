import React from 'react';
import { Button } from '@/components/ui/Button';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const PushNotificationBanner: React.FC = () => {
  const { isSupported, permission, subscribe } = usePushNotifications();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const handler = () => {
      if (isSupported && permission === 'default') {
        setVisible(true);
      } else {
        // Do not auto-subscribe on load; avoid iOS/Safari issues and require explicit user action
        setVisible(false);
      }
    };
    window.addEventListener('show-push-banner', handler as EventListener);
    return () => window.removeEventListener('show-push-banner', handler as EventListener);
  }, [isSupported, permission, subscribe]);

  if (!visible) return null;

  const onEnable = async () => {
    if (!isSupported) return;
    const ok = await subscribe();
    if (ok) setVisible(false);
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Activează notificările</h3>
          <p className="text-sm text-blue-100">Primește notificări despre comenzi și actualizări importante</p>
        </div>
        <button onClick={() => setVisible(false)} className="ml-4 text-blue-200 hover:text-white">✕</button>
      </div>
      <div className="mt-3 flex gap-2">
        <Button onClick={onEnable} size="sm" variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50">
          Activează
        </Button>
        <Button onClick={() => setVisible(false)} variant="ghost" size="sm" className="text-white hover:bg-white/10">
          Mai târziu
        </Button>
      </div>
    </div>
  );
};

export default PushNotificationBanner;


