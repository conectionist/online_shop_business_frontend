import React from 'react';

interface TabNavigationProps {
  activeTab: 'edit' | 'products2' | 'orders' | 'text';
  onTabChange: (tab: 'edit' | 'products2' | 'orders' | 'text') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => onTabChange('edit')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'edit'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Detalii
        </button>
        <button
          onClick={() => onTabChange('products2')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'products2'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Produse
        </button>
        <button
          onClick={() => onTabChange('orders')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'orders'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Comenzi
        </button>
        <button
          onClick={() => onTabChange('text')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'text'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Text
        </button>
      </nav>
    </div>
  );
};

export default TabNavigation; 