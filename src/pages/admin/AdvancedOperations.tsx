import React from 'react';
import { Link } from 'react-router-dom';
import { BellRing } from 'lucide-react';
import Card from '@/components/ui/Card';

const AdvancedOperations: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Operațiuni avansate</h2>
        <p className="mt-1 text-sm text-gray-500">Instrumente avansate pentru administrare.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/advanced/push" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <BellRing className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Notificări Push</h3>
                  <p className="text-gray-600 text-sm">Administrare abonare și test notificări</p>
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


