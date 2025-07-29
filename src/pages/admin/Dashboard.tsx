import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Package, List } from 'lucide-react';
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

      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Development Mode
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                This is a development version. Backend integration will be added in Phase 2.3.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 