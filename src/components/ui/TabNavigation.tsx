import React from 'react';

interface TabNavigationProps {
  activeTab: 'edit' | 'products';
  onTabChange: (tab: 'edit' | 'products') => void;
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
          Detalii Listă
        </button>
        <button
          onClick={() => onTabChange('products')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'products'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Produse
        </button>
      </nav>
    </div>
  );
};

export default TabNavigation; 