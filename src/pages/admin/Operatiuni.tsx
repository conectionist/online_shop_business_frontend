import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Bell, ArrowLeft } from 'lucide-react';

const Operatiuni: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/admin/dashboard"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Înapoi la Dashboard</span>
        </Link>
        <div className="h-4 w-px bg-gray-300" />
        <h2 className="text-lg font-medium text-gray-900">Operațiuni</h2>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <nav className="flex space-x-1">
          <Link
            to="/admin/operatiuni/notificari"
            className="flex items-center space-x-2 px-4 py-2 rounded-md bg-white text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span>Notificări</span>
          </Link>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <Outlet />
      </div>
    </div>
  );
};

export default Operatiuni;


