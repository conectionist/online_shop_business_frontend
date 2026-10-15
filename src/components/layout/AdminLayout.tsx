import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import VersionDisplay from '@/components/ui/VersionDisplay';

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0">
        <div className="bg-white rounded-lg shadow-md p-6 print:shadow-none print:p-0">
          <Outlet />
        </div>
        <div className="mt-4 text-center print:hidden">
          <VersionDisplay />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 