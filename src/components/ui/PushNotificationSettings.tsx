import React from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const PushNotificationSettings: React.FC = () => {
  const { isSupported, isSubscribed, permission, subscribe, unsubscribe } = usePushNotifications();

  const handleToggle = async (enable: boolean) => {
    if (enable) {
      await subscribe();
    } else {
      await unsubscribe();
    }
  };

  if (!isSupported) {
    return (
      <Card padding="md" shadow="sm" className="bg-yellow-50 border border-yellow-200">
        <p className="text-yellow-800">Notificările push nu sunt suportate în acest browser.</p>
      </Card>
    );
  }

  if (permission === 'denied') {
    return (
      <Card padding="md" shadow="sm" className="bg-red-50 border border-red-200">
        <p className="text-red-800 mb-2">Notificările au fost blocate. Pentru a activa notificările, vă rugăm să:</p>
        <ol className="list-decimal list-inside text-red-700 text-sm space-y-1">
          <li>Faceți clic pe iconița de blocare din bara de adrese</li>
          <li>Selectați "Permite notificările"</li>
          <li>Reîncărcați pagina</li>
        </ol>
      </Card>
    );
  }

  return (
    <Card padding="md" shadow="sm" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Notificări Push</h3>
          <p className="text-sm text-gray-500">Primește notificări despre comenzi și actualizări</p>
        </div>
        <Button
          variant={isSubscribed ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => handleToggle(!isSubscribed)}
        >
          {isSubscribed ? 'Dezactivează' : 'Activează'}
        </Button>
      </div>

      {permission === 'default' && (
        <Button onClick={() => subscribe()} className="w-full">
          Activează notificările
        </Button>
      )}

      {isSubscribed && (
        <p className="text-sm text-green-600">✓ Notificările sunt activate</p>
      )}
    </Card>
  );
};

export default PushNotificationSettings;
