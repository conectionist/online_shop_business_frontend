import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Package, List, Settings, Building2, CreditCard, Truck, Clock, Ruler, Wrench } from 'lucide-react';
import Card from '@/components/ui/Card';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Welcome to Admin Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your online shop business from here.
        </p>
      </div>

      {/* Content Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Content</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/categories" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <FolderOpen className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                    <p className="text-gray-600 text-sm">Manage product categories</p>
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
                    <h3 className="text-lg font-semibold text-gray-900">Products</h3>
                    <p className="text-gray-600 text-sm">Manage your product catalog</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Card className="opacity-60 cursor-not-allowed">
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <List className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Lists</h3>
                  <p className="text-gray-600 text-sm">Create and manage product lists</p>
                  <p className="text-xs text-gray-500 mt-1">Coming soon</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Settings Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="opacity-60 cursor-not-allowed">
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-indigo-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Business Details</h3>
                  <p className="text-gray-600 text-sm">Manage company information</p>
                  <p className="text-xs text-gray-500 mt-1">Coming soon</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="opacity-60 cursor-not-allowed">
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-8 w-8 text-emerald-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                  <p className="text-gray-600 text-sm">Configure payment options</p>
                  <p className="text-xs text-gray-500 mt-1">Coming soon</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="opacity-60 cursor-not-allowed">
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <Truck className="h-8 w-8 text-orange-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delivery Methods</h3>
                  <p className="text-gray-600 text-sm">Configure shipping options</p>
                  <p className="text-xs text-gray-500 mt-1">Coming soon</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="opacity-60 cursor-not-allowed">
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-cyan-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delivery Schedules</h3>
                  <p className="text-gray-600 text-sm">Set delivery timeframes</p>
                  <p className="text-xs text-gray-500 mt-1">Coming soon</p>
                </div>
              </div>
            </div>
          </Card>

          <Link to="/admin/units" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <Ruler className="h-8 w-8 text-orange-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Units</h3>
                    <p className="text-gray-600 text-sm">Manage measurement units</p>
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
                  <h3 className="text-lg font-semibold text-gray-900">Operations</h3>
                  <p className="text-gray-600 text-sm">Advanced system operations</p>
                  <p className="text-xs text-gray-500 mt-1">Coming soon</p>
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