import React from 'react';
import { Outlet } from 'react-router-dom';
import CustomerHeader from './CustomerHeader';
import CustomerFooter from './CustomerFooter';
import VersionDisplay from '@/components/ui/VersionDisplay';

const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <CustomerHeader />
      
      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <CustomerFooter />
      
      {/* Version Display - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-center py-2 bg-gray-100 border-t">
          <VersionDisplay />
        </div>
      )}
    </div>
  );
};

export default CustomerLayout; 