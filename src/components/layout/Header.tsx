import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';

export interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'Afacere Online',
  onMenuClick 
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  // Debug logging
  console.log('Header - Auth State:', { isAuthenticated, user });

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-700 hover:text-gray-900">
              Acasă
            </a>
            <a href="/products" className="text-gray-700 hover:text-gray-900">
              Produse
            </a>
            <a href="/lists" className="text-gray-700 hover:text-gray-900">
              Liste
            </a>
          </nav>

          {/* User Menu / Logout */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  Bună, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Deconectare
                </button>
              </div>
            )}
            
            {/* Mobile menu button */}
            {onMenuClick && (
              <div className="md:hidden">
                <button
                  onClick={onMenuClick}
                  className="text-gray-700 hover:text-gray-900"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}; 