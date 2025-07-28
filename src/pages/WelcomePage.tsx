import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const WelcomePage: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Online Shop Business
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Welcome to your online shop business frontend
          </p>
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Development Setup Complete! 🎉
            </h2>
            <p className="text-gray-600 mb-4">
              Your React + TypeScript + Vite project is ready with:
            </p>
            <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
              <li>✅ React 18 with TypeScript</li>
              <li>✅ Vite build tool</li>
              <li>✅ Tailwind CSS styling</li>
              <li>✅ Docker configuration</li>
              <li>✅ ESLint & Prettier</li>
              <li>✅ TanStack Query ready</li>
              <li>✅ Zustand state management</li>
              <li>✅ React Router navigation</li>
            </ul>
            <div className="space-y-4">
              <button
                onClick={() => setCount((count) => count + 1)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Count is {count}
              </button>
              <div className="flex space-x-4 justify-center">
                <Link
                  to="/admin"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Admin Area
                </Link>
                <Link
                  to="/customer"
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Customer Area
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage; 