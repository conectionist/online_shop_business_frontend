import React from 'react';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { pushNotificationService } from '@/services/pushNotifications';

const PushNotifications: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Notificări Push</h2>
        <p className="mt-1 text-sm text-gray-500">Gestionează abonarea la notificări pentru acest dispozitiv.</p>
      </div>

      <Card>
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-gray-900">Trimite notificare de test</h3>
          <p className="text-sm text-gray-600">Aceasta va trimite o notificare de test către abonamentele valide (conform backend).</p>
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                try {
                  await pushNotificationService.sendTest({
                    title: 'Test notificare',
                    body: 'Aceasta este o notificare de test',
                    tag: 'admin_test',
                    data: { url: '/' },
                  });
                  alert('Notificare de test trimisă (verificați dispozitivele abonate)');
                } catch (e) {
                  alert('Eroare la trimiterea notificării de test');
                }
              }}
            >
              Trimite test
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PushNotifications;


