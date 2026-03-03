import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '@/components/layout/Footer';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default AppLayout; 