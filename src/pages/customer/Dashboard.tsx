import React from 'react';

const CustomerDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Welcome to Customer Portal</h2>
        <p className="mt-1 text-sm text-gray-500">
          Browse products and place orders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900">Products</h3>
          <p className="mt-2 text-sm text-blue-700">
            Browse available products and categories.
          </p>
          <div className="mt-4">
            <span className="text-2xl font-bold text-blue-900">0</span>
            <span className="text-sm text-blue-700 ml-2">products available</span>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-green-900">Cart</h3>
          <p className="mt-2 text-sm text-green-700">
            View your shopping cart and checkout.
          </p>
          <div className="mt-4">
            <span className="text-2xl font-bold text-green-900">0</span>
            <span className="text-sm text-green-700 ml-2">items in cart</span>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-purple-900">Orders</h3>
          <p className="mt-2 text-sm text-purple-700">
            View your order history and track deliveries.
          </p>
          <div className="mt-4">
            <span className="text-2xl font-bold text-purple-900">0</span>
            <span className="text-sm text-purple-700 ml-2">orders placed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard; 