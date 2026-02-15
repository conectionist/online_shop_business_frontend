import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { ChevronDown, LogOut, Monitor } from 'lucide-react';

export interface HeaderProps {
  // No props needed - header is now minimal
}

export const Header: React.FC<HeaderProps> = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, still logout and redirect
      authService.logout();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end items-center h-16">
          {/* User Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {/* User Avatar */}
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-blue-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              {/* User Name */}
              <span className="text-sm font-medium text-gray-700">
                Bună, {user.name}
              </span>
              
              {/* Dropdown Arrow */}
              <ChevronDown 
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/admin/sessions');
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  <Monitor className="w-4 h-4 mr-3 text-gray-400" />
                  Sesiuni Active
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 mr-3 text-gray-400" />
                  {isLoggingOut ? 'Se deconectează...' : 'Deconectare'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}; 