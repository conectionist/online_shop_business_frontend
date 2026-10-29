import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import RouteSuspense from '@/components/layout/RouteSuspense';
import CartAnnouncer from '@/components/layout/CartAnnouncer';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        <RouteSuspense>
          <Outlet />
        </RouteSuspense>
      </div>
      <Footer />
      <CartAnnouncer />
    </div>
  );
};

export default AppLayout; 