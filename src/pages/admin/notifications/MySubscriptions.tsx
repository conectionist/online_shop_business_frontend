import React, { useCallback, useEffect, useState } from 'react';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import { useToast } from '@/components/ui/ToastContainer';
import { pushNotificationService } from '@/services/pushNotifications';

interface Topic { id: number; name: string }


function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) arr[i] = raw.charCodeAt(i);
  return arr;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary);
}

const MySubscriptions: React.FC = () => {
  const { showToast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const checkSupport = useCallback(() => (
    'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  ), []);

  useEffect(() => {
    const supported = checkSupport();
    setIsSupported(supported);
    const current: NotificationPermission = ('Notification' in window && typeof Notification.permission !== 'undefined')
      ? Notification.permission
      : 'denied';
    setPermission(current);
  }, [checkSupport]);

  useEffect(() => {
    async function loadTopics() {
      try {
        const t = await pushNotificationService.getTopics();
        setTopics(t);
      } catch (e) {
        // ignore or toast later on demand
      }
    }
    loadTopics();
  }, []);

  // Restore subscription state on page load
  useEffect(() => {
    async function restoreSubscriptionState() {
      try {
        // Check if we have a stored subscription ID
        const storedSubscriptionId = localStorage.getItem('admin_push_subscription_id');
        const storedSelectedTopics = localStorage.getItem('admin_push_selected_topics');
        
        if (storedSubscriptionId) {
          // Check if we still have a browser subscription
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          
          if (subscription) {
            // Restore subscription ID and selected topics
            setSubscriptionId(parseInt(storedSubscriptionId));
            
            if (storedSelectedTopics) {
              try {
                const topicIds = JSON.parse(storedSelectedTopics);
                setSelected(new Set(topicIds));
              } catch (e) {
                console.warn('Failed to parse stored topics:', e);
              }
            }
          } else {
            // Browser subscription is gone, clear stored data
            localStorage.removeItem('admin_push_subscription_id');
            localStorage.removeItem('admin_push_selected_topics');
          }
        }
      } catch (e) {
        console.warn('Failed to restore subscription state:', e);
      }
    }
    
    if (isSupported && permission === 'granted') {
      restoreSubscriptionState();
    }
  }, [isSupported, permission]);

  const handleEnable = useCallback(async () => {
    try {
      if (!isSupported) throw new Error('Browserul nu suportă notificări push.');
      if (permission === 'denied') throw new Error('Permisiunea pentru notificări a fost respinsă.');

      let perm: NotificationPermission = permission;
      if (perm !== 'granted') {
        perm = await Notification.requestPermission();
        setPermission(perm);
      }
      if (perm !== 'granted') throw new Error('Permisiunea nu a fost acordată.');

      setLoading(true);
      const registration = await navigator.serviceWorker.ready;
      const vapid = await pushNotificationService.getVapidPublicKey();
      const appKey = urlBase64ToUint8Array(vapid);
      const keyBuffer = new ArrayBuffer(appKey.byteLength);
      new Uint8Array(keyBuffer).set(appKey);

      const sub = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBuffer });
      const res = await pushNotificationService.adminSubscribe({
        endpoint: sub.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(sub.getKey('p256dh')),
          auth: arrayBufferToBase64(sub.getKey('auth')),
        },
        user_agent: navigator.userAgent,
      });
      setSubscriptionId(res.id);
      // Store subscription ID in localStorage for persistence
      localStorage.setItem('admin_push_subscription_id', res.id.toString());
      showToast({ type: 'success', title: 'Activat', message: 'Notificările au fost activate pentru acest dispozitiv.' });
    } catch (e: any) {
      showToast({ type: 'error', title: 'Eroare', message: e?.message || 'Activarea notificărilor a eșuat.' });
    } finally {
      setLoading(false);
    }
  }, [isSupported, permission, showToast]);

  const toggleTopic = useCallback(async (topicId: number) => {
    if (!subscriptionId) {
      showToast({ type: 'warning', title: 'Necesită activare', message: 'Activează notificările înainte de a gestiona topicile.' });
      return;
    }
    try {
      const isOn = selected.has(topicId);
      if (isOn) {
        await pushNotificationService.topicsUnsubscribe(subscriptionId, [topicId]);
        const next = new Set(selected);
        next.delete(topicId);
        setSelected(next);
        // Update localStorage
        localStorage.setItem('admin_push_selected_topics', JSON.stringify(Array.from(next)));
      } else {
        await pushNotificationService.topicsSubscribe(subscriptionId, [topicId]);
        const next = new Set(selected);
        next.add(topicId);
        setSelected(next);
        // Update localStorage
        localStorage.setItem('admin_push_selected_topics', JSON.stringify(Array.from(next)));
      }
    } catch (e) {
      showToast({ type: 'error', title: 'Eroare', message: 'Nu s-a putut actualiza abonarea pentru topic.' });
    }
  }, [selected, subscriptionId, showToast]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Abonările mele"
        subtitle="Activează notificările și alege topici pentru acest dispozitiv"
      />

      <Card className="p-6">
        <div className="space-y-2">
          <p className="text-sm text-gray-700">Suport browser: {isSupported ? 'Da' : 'Nu'}</p>
          <p className="text-sm text-gray-700">Permisiune notificări: {permission}</p>
        </div>
        <div className="mt-4">
          <Button 
            variant="primary" 
            size="md" 
            onClick={handleEnable} 
            disabled={loading || (subscriptionId !== null)}
          >
            {loading ? 'Se activează...' : subscriptionId ? 'Notificările sunt activate' : 'Activează notificările'}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Topici disponibile</h3>
        {topics.length === 0 ? (
          <div className="py-4"><Loading text="Se încarcă topici..." /></div>
        ) : (
          <div className="space-y-3">
            {topics.map((t) => (
              <div key={t.id} className="flex items-center justify-between border rounded-md p-3">
                <div className="text-sm font-medium text-gray-800">{t.name}</div>
                <Button
                  variant={selected.has(t.id) ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => toggleTopic(t.id)}
                >
                  {selected.has(t.id) ? 'Dezactivează' : 'Activează'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default MySubscriptions;


