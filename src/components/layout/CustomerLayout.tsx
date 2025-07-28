import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Customer Portal" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Dashboard</h1>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout; 