import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNotifySpecificAdmin, useNotifyAllCustomers } from '@/hooks/useNotifications';
import { useToast } from '@/components/ui/ToastContainer';

const NotificationsTests: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'admins' | 'clients'>('admins');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedAdmins, setSelectedAdmins] = useState<number[]>([]);
  const [selectAllAdmins, setSelectAllAdmins] = useState(false);

  // Hardcoded admin list (until backend implements /admins API)
  // TODO: Replace with useAdmins() hook when backend API is ready
  const admins = [
    { id: 1, username: 'admin', email: 'admin@example.com', is_active: true }
  ];
  
  // Notification mutations
  const notifySpecificAdminMutation = useNotifySpecificAdmin();
  const notifyAllCustomersMutation = useNotifyAllCustomers();
  
  // Toast for feedback
  const { showToast } = useToast();

  // Handle admin selection
  const handleAdminToggle = (adminId: number) => {
    setSelectedAdmins(prev => 
      prev.includes(adminId) 
        ? prev.filter(id => id !== adminId)
        : [...prev, adminId]
    );
  };

  const handleSelectAllAdmins = () => {
    if (selectAllAdmins) {
      setSelectedAdmins([]);
      setSelectAllAdmins(false);
    } else {
      const allAdminIds = admins?.map(admin => admin.id) || [];
      setSelectedAdmins(allAdminIds);
      setSelectAllAdmins(true);
    }
  };

  // Handle notification sending
  const handleSendToAdmins = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      showToast({
        type: 'error',
        title: 'Câmpuri obligatorii',
        message: 'Vă rugăm să completați titlul și mesajul notificării.',
      });
      return;
    }

    if (selectedAdmins.length === 0) {
      showToast({
        type: 'error',
        title: 'Selecție necesară',
        message: 'Vă rugăm să selectați cel puțin un admin.',
      });
      return;
    }

    try {
      const payload = {
        title: notificationTitle,
        body: notificationMessage,
        data: {
          type: 'test_notification',
          timestamp: new Date().toISOString(),
        },
        tag: `test_${Date.now()}`,
      };

      // Send to selected admins
      for (const adminId of selectedAdmins) {
        await notifySpecificAdminMutation.mutateAsync({ adminId, payload });
      }

      showToast({
        type: 'success',
        title: 'Notificare trimisă',
        message: `Notificare trimisă cu succes către ${selectedAdmins.length} admin(i)!`,
      });
      setNotificationTitle('');
      setNotificationMessage('');
      setSelectedAdmins([]);
      setSelectAllAdmins(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      showToast({
        type: 'error',
        title: 'Eroare la trimitere',
        message: 'Eroare la trimiterea notificării. Vă rugăm să încercați din nou.',
      });
    }
  };

  const handleSendToAllCustomers = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      showToast({
        type: 'error',
        title: 'Câmpuri obligatorii',
        message: 'Vă rugăm să completați titlul și mesajul notificării.',
      });
      return;
    }

    try {
      const payload = {
        title: notificationTitle,
        body: notificationMessage,
        data: {
          type: 'test_notification',
          timestamp: new Date().toISOString(),
        },
        tag: `test_${Date.now()}`,
      };

      await notifyAllCustomersMutation.mutateAsync(payload);
      showToast({
        type: 'success',
        title: 'Notificare trimisă',
        message: 'Notificare trimisă cu succes către toți clienții!',
      });
      setNotificationTitle('');
      setNotificationMessage('');
    } catch (error) {
      console.error('Error sending notification:', error);
      showToast({
        type: 'error',
        title: 'Eroare la trimitere',
        message: 'Eroare la trimiterea notificării. Vă rugăm să încercați din nou.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/admin/notifications"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Înapoi la Notificări
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teste Notificări</h1>
        <p className="text-gray-600">
          Testează sistemul de notificări
        </p>
      </div>

      <Card>
        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'admins'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Admins
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'clients'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Clienți
            </button>
          </div>

          {/* Client Tab Warning - Show at top when client tab is active */}
          {activeTab === 'clients' && (
            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">
                      Atenție: Notificări către clienți reali
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Această funcție va trimite notificări către toți clienții din producție. 
                      Folosește cu precauție și doar pentru teste reale.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Content */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Conținutul notificării
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="notification-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Titlul notificării
                </label>
                <Input
                  id="notification-title"
                  type="text"
                  placeholder="Ex: Test de notificare"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="notification-message" className="block text-sm font-medium text-gray-700 mb-2">
                  Mesajul notificării
                </label>
                <textarea
                  id="notification-message"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Aceasta este o notificare de test pentru a verifica funcționalitatea sistemului."
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Admin Tab */}
          {activeTab === 'admins' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Trimite notificare de test către admins
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Selectează adminii către care vrei să trimiți notificarea de test
                </p>
                
                {/* Admin Selection */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="select-all-admins"
                      checked={selectAllAdmins}
                      onChange={handleSelectAllAdmins}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="select-all-admins" className="text-sm text-gray-700">
                      Selectează toți adminii
                    </label>
                  </div>
                  
                  {/* Admin List */}
                  {admins && admins.length > 0 ? (
                    <div className="space-y-2">
                      {admins.map((admin) => (
                        <div key={admin.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            id={`admin-${admin.id}`}
                            checked={selectedAdmins.includes(admin.id)}
                            onChange={() => handleAdminToggle(admin.id)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`admin-${admin.id}`} className="text-sm text-gray-700">
                            {admin.username} {admin.email && `(${admin.email})`}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">
                      Nu au fost găsiți admini în sistem.
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSendToAdmins}
                    disabled={
                      !notificationTitle.trim() || 
                      !notificationMessage.trim() || 
                      selectedAdmins.length === 0 ||
                      notifySpecificAdminMutation.isPending
                    }
                  >
                    {notifySpecificAdminMutation.isPending ? 'Se trimite...' : 'Trimite notificare de test'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Client Tab */}
          {activeTab === 'clients' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Trimite notificare de test către toți clienții
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Notificarea va fi trimisă către toți utilizatorii care au activat notificările
                </p>
                
                <div className="mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSendToAllCustomers}
                    disabled={
                      !notificationTitle.trim() || 
                      !notificationMessage.trim() ||
                      notifyAllCustomersMutation.isPending
                    }
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {notifyAllCustomersMutation.isPending ? 'Se trimite...' : 'Trimite către toți clienții'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NotificationsTests;
