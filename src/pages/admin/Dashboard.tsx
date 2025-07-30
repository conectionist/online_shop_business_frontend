import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Package, List, Ruler } from 'lucide-react';
import Card from '@/components/ui/Card';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Welcome to Admin Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your online shop business from here.
        </p>
      </div>

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

        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-purple-900">Lists</h3>
          <p className="mt-2 text-sm text-purple-700">
            Create and manage product lists for customers.
          </p>
          <div className="mt-4">
            <span className="text-2xl font-bold text-purple-900">0</span>
            <span className="text-sm text-purple-700 ml-2">lists</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 