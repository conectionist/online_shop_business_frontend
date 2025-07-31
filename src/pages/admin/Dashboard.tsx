import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Package, List, Settings, Building2, CreditCard, Truck, Clock, Ruler, Wrench } from 'lucide-react';
import Card from '@/components/ui/Card';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Bun venit la Panoul de Administrare</h2>
        <p className="mt-1 text-sm text-gray-500">
          Gestionează-ți afacerea online de aici.
        </p>
      </div>

      {/* Content Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Conținut</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/categories" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <FolderOpen className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Categorii</h3>
                    <p className="text-gray-600 text-sm">Gestionează categoriile de produse</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/products" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <Package className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Produse</h3>
                    <p className="text-gray-600 text-sm">Gestionează catalogul de produse</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/lists" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <List className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Liste</h3>
                    <p className="text-gray-600 text-sm">Creează și gestionează listele de produse</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Settings Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Setări</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/business-details" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-8 w-8 text-indigo-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Detalii Afacere</h3>
                    <p className="text-gray-600 text-sm">Gestionează informațiile companiei</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/payment-methods" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-8 w-8 text-emerald-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Metode de Plată</h3>
                    <p className="text-gray-600 text-sm">Configurează opțiunile de plată</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/delivery-types" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <Truck className="h-8 w-8 text-orange-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Metode de Livrare</h3>
                    <p className="text-gray-600 text-sm">Configurează opțiunile de livrare</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/delivery-schedules" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <Clock className="h-8 w-8 text-cyan-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Programe de Livrare</h3>
                    <p className="text-gray-600 text-sm">Setează intervalele de livrare</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/units" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <Ruler className="h-8 w-8 text-orange-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Unități</h3>
                    <p className="text-gray-600 text-sm">Gestionează unitățile de măsură</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Card className="opacity-60 cursor-not-allowed">
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <Wrench className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Operațiuni</h3>
                  <p className="text-gray-600 text-sm">Operațiuni avansate ale sistemului</p>
                  <p className="text-xs text-gray-500 mt-1">În curând</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 