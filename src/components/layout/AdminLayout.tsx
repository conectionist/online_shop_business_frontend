import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import VersionDisplay from '@/components/ui/VersionDisplay';

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Panou de Administrare</h1>
          <Outlet />
        </div>
        <div className="mt-4 text-center">
          <VersionDisplay />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 