import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useBusinessDetails } from '@/hooks/useBusinessDetails';

const CustomerHeader: React.FC = () => {
  const { data: businessDetailsArray } = useBusinessDetails();
  
  // Get the first business details (assuming there's only one or we want the first one)
  const businessDetails = businessDetailsArray && businessDetailsArray.length > 0 ? businessDetailsArray[0] : null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/customer" className="flex items-center space-x-3">
              {businessDetails?.logo && (
                <img 
                  src={businessDetails.logo} 
                  alt="Logo" 
                  className="h-8 w-8 object-contain"
                />
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {businessDetails?.nume || 'Magazin Online'}
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {businessDetails?.description || 'Produse proaspete'}
                </p>
              </div>
            </Link>
          </div>

          {/* Cart Icon */}
          <div className="flex items-center">
            <Link 
              to="/customer/cart" 
              className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader; 