import React from 'react';

export interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'Afacere Online',
  onMenuClick 
}) => {
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
    </header>
  );
}; 