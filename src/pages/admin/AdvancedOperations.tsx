import React from 'react';
import { Link } from 'react-router-dom';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import Card from '@/components/ui/Card';
import { Bell } from 'lucide-react';

const AdvancedOperations: React.FC = () => {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Operațiuni avansate"
        subtitle="Funcționalități avansate pentru administrare"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/advanced/notifications" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <Bell className="h-8 w-8 text-indigo-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Notificări</h3>
                  <p className="text-gray-600 text-sm">Administrare notificări push</p>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default AdvancedOperations;


