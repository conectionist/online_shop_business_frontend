import React from 'react';

const CustomerDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Bun venit la Portalul Clienților</h2>
        <p className="mt-1 text-sm text-gray-500">
          Navighează produsele și plasează comenzi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900">Produse</h3>
          <p className="mt-2 text-sm text-blue-700">
            Navighează produsele și categoriile disponibile.
          </p>
          <div className="mt-4">
            <span className="text-2xl font-bold text-blue-900">0</span>
            <span className="text-sm text-blue-700 ml-2">produse disponibile</span>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-green-900">Coș</h3>
          <p className="mt-2 text-sm text-green-700">
            Vezi coșul de cumpărături și finalizează comanda.
          </p>
          <div className="mt-4">
            <span className="text-2xl font-bold text-green-900">0</span>
            <span className="text-sm text-green-700 ml-2">articole în coș</span>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-purple-900">Comenzi</h3>
          <p className="mt-2 text-sm text-purple-700">
            Vezi istoricul comenzilor și urmărește livrările.
          </p>
          <div className="mt-4">
            <span className="text-2xl font-bold text-purple-900">0</span>
            <span className="text-sm text-purple-700 ml-2">comenzi plasate</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard; 