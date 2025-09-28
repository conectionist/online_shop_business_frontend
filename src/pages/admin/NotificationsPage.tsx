import React from 'react';
import { Link } from 'react-router-dom';
import { TestTube, ArrowLeft } from 'lucide-react';
import Card from '@/components/ui/Card';

const NotificationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/admin/dashboard"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Înapoi la Dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notificări</h1>
        <p className="text-gray-600">
          Gestionează notificările sistemului și testele
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Abonările mele - Hidden for now */}
        {/* <Link to="/admin/notifications/subscriptions" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Bell className="h-8 w-8 text-blue-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Abonările mele</h2>
                  <p className="text-gray-600 text-sm">Gestionează notificările tale</p>
                </div>
              </div>
            </div>
          </Card>
        </Link> */}

        {/* Notificări Clienți - Hidden for now */}
        {/* <Link to="/admin/notifications/client-notifications" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Notificări Clienți</h2>
                  <p className="text-gray-600 text-sm">Configurează notificările pentru clienți</p>
                </div>
              </div>
            </div>
          </Card>
        </Link> */}

        {/* Teste */}
        <Link to="/admin/notifications/tests" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <TestTube className="h-8 w-8 text-purple-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Teste</h2>
                  <p className="text-gray-600 text-sm">Testează sistemul de notificări</p>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default NotificationsPage;
