import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const NotificationsTests: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'admins' | 'clients'>('admins');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

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
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="select-all-admins" className="text-sm text-gray-700">
                      Selectează toți adminii
                    </label>
                  </div>
                  
                  {/* Admin List - Placeholder for now */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        id="admin-1"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="admin-1" className="text-sm text-gray-700">
                        Admin 1 (admin@example.com)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        id="admin-2"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="admin-2" className="text-sm text-gray-700">
                        Admin 2 (admin2@example.com)
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    disabled
                  >
                    Trimite notificare de test
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
                    disabled
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Trimite către toți clienții
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
