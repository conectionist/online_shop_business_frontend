import React from 'react';
import { Link } from 'react-router-dom';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import Card from '@/components/ui/Card';

const NotificationsHome: React.FC = () => {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Notificări"
        subtitle="Setări și operațiuni pentru sistemul de notificări"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Abonarile mele */}
        <Link to="/admin/advanced/notifications/my-subscriptions" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Abonările mele</h3>
              <p className="text-gray-600 text-sm">Activează notificările și alege topici</p>
            </div>
          </Card>
        </Link>

        {/* Notificari pentru clienti - disabled */}
        <div className="opacity-60 cursor-not-allowed">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Notificări pentru clienți</h3>
              <p className="text-gray-600 text-sm">În curând</p>
            </div>
          </Card>
        </div>

        {/* Teste - disabled */}
        <div className="opacity-60 cursor-not-allowed">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Teste</h3>
              <p className="text-gray-600 text-sm">În curând</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationsHome;


