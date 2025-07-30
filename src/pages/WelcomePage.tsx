import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const WelcomePage: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Afacere Online
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Bine ai venit la interfața pentru afacerea ta online
          </p>
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Configurarea de Dezvoltare Completă! 🎉
            </h2>
            <p className="text-gray-600 mb-4">
              Proiectul tău React + TypeScript + Vite este gata cu:
            </p>
            <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
              <li>✅ React 18 cu TypeScript</li>
              <li>✅ Vite build tool</li>
              <li>✅ Tailwind CSS styling</li>
              <li>✅ Configurare Docker</li>
              <li>✅ ESLint & Prettier</li>
              <li>✅ TanStack Query gata</li>
              <li>✅ Zustand state management</li>
              <li>✅ React Router navigation</li>
            </ul>
            <div className="space-y-4">
              <button
                onClick={() => setCount((count) => count + 1)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Numărul este {count}
              </button>
              <div className="flex space-x-4 justify-center">
                <Link
                  to="/admin"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Zona Admin
                </Link>
                <Link
                  to="/customer"
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Zona Clienți
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