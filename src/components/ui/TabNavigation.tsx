import React from 'react';

interface TabNavigationProps {
  activeTab: 'edit' | 'products2' | 'products3' | 'orders' | 'text';
  onTabChange: (tab: 'edit' | 'products2' | 'products3' | 'orders' | 'text') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200 mb-6 relative">
      <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onTabChange('edit')}
          className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
            activeTab === 'edit'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Detalii
        </button>
        <button
          onClick={() => onTabChange('products2')}
          className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
            activeTab === 'products2'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Produse
        </button>
        <button
          onClick={() => onTabChange('products3')}
          className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
            activeTab === 'products3'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Produse3
        </button>
        <button
          onClick={() => onTabChange('orders')}
          className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
            activeTab === 'orders'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Comenzi
        </button>
        <button
          onClick={() => onTabChange('text')}
          className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
            activeTab === 'text'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Text
        </button>
      </nav>
      {/* Fade gradient to indicate scrollability on mobile */}
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-0 pointer-events-none bg-gradient-to-l from-white via-white/80 to-transparent" />
    </div>
  );
};

export default TabNavigation; 