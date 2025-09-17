import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import PWAInstallButton from '@/components/ui/PWAInstallButton';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        <Outlet />
      </div>
      <PWAInstallButton />
      <Footer />
    </div>
  );
};

export default AppLayout; 