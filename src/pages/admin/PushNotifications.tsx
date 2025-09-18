import React from 'react';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { pushNotificationService } from '@/services/pushNotifications';

const PushNotifications: React.FC = () => {
  const [title, setTitle] = React.useState('Test notificare');
  const [body, setBody] = React.useState('Aceasta este o notificare de test');
  const [tag, setTag] = React.useState('admin_test');
  const [url, setUrl] = React.useState('/');
  const [sending, setSending] = React.useState(false);
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const onSend = async () => {
    if (!title.trim() || !body.trim()) {
      alert('Completați titlul și mesajul notificării.');
      return;
    }
    setSending(true);
    try {
      await pushNotificationService.sendTest({
        title: title.trim(),
        body: body.trim(),
        tag: tag.trim() || undefined,
        data: url.trim() ? { url: url.trim() } : undefined,
      });
      alert('Notificare trimisă.');
    } catch (e) {
      alert('Eroare la trimiterea notificării. Verificați consola și backend-ul.');
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Notificări Push</h2>
        <p className="mt-1 text-sm text-gray-500">Trimite notificări personalizate pentru testare administrativă.</p>
      </div>

      <Card>
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-gray-900">Trimite notificare personalizată</h3>
          
          {/* Basic fields - always visible */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Titlu</label>
              <Input value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} placeholder="Titlul notificării" />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Mesaj</label>
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Textul notificării"
              />
            </div>
          </div>

          {/* Advanced options toggle */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Opțiuni avansate</h4>
                <p className="text-xs text-gray-500">Tag pentru deduplicare și URL personalizat</p>
              </div>
              <Switch
                checked={showAdvanced}
                onCheckedChange={setShowAdvanced}
              />
            </div>
          </div>

          {/* Advanced fields - conditionally visible */}
          {showAdvanced && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-md">
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Tag (opțional, pentru deduplicare)</label>
                <Input value={tag} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTag(e.target.value)} placeholder="ex: admin_test" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">URL la click (opțional)</label>
                <Input value={url} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)} placeholder="ex: /comenzi/123" />
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button onClick={onSend} loading={sending}>
              Trimite notificare
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PushNotifications;


