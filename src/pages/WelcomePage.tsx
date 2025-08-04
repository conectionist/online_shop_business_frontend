import React from 'react';
import { useBusinessDetails } from '@/hooks/useBusinessDetails';
import { usePublishedList, useListProducts } from '@/hooks/useLists';
import { useCategories } from '@/hooks/useCategories';
import { useUnits } from '@/hooks/useUnits';
import { useDeliverySchedules } from '@/hooks/useDeliverySchedules';
import { useDeliveryTypes } from '@/hooks/useDeliveryTypes';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { Clock, Package, Truck, CreditCard, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';
import { Link } from 'react-router-dom';

const WelcomePage: React.FC = () => {
  const { data: businessDetailsArray } = useBusinessDetails();
  const { data: publishedList, isLoading, error } = usePublishedList();
  
  // Get the first business details (assuming there's only one or we want the first one)
  const businessDetails = businessDetailsArray && businessDetailsArray.length > 0 ? businessDetailsArray[0] : null;
  
  // Fetch data for the published list
  const { data: listProducts, isLoading: isLoadingListProducts } = useListProducts(publishedList?.id || 0);
  const { data: categories } = useCategories();
  const { data: units } = useUnits();
  const { data: deliverySchedules } = useDeliverySchedules();
  const { data: deliveryTypes } = useDeliveryTypes();
  const { data: paymentMethods } = usePaymentMethods();

  // Cart store
  const { addItem, getTotalItems } = useCartStore();

  // Helper functions
  const getCategoryName = (categoryId: number) => {
    return categories?.find(c => c.id === categoryId)?.name || 'Categorie necunoscută';
  };

  const getUnitName = (unitId: number) => {
    return units?.find(u => u.id === unitId)?.denumire || 'unitate';
  };

  // Cart functions
  const addToCart = (product: any) => {
    addItem({
      id: product.id,
      nume: product.nume,
      pret: product.pret,
      unitati_id: product.unitati_id,
      unitate_denumire: getUnitName(product.unitati_id),
      images: product.images
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Package className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Eroare la încărcarea listei
          </h1>
          <p className="text-gray-600 mb-6">
            A apărut o eroare la încărcarea listei de produse. Vă rugăm să încercați din nou.
          </p>
        </div>
      </div>
    );
  }

  if (!publishedList) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {businessDetails?.list_not_available_msg || 
              'Lista de produse nu a fost publicată încă. Vă rugăm să reveniți mai târziu.'}
          </h1>
        </div>
      </div>
    );
  }

  // Show the published list with exact same structure as admin preview
  return (
    <>


      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto">
        {/* Title */}
        <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {publishedList.mesaj_introducere || 'Listă de produse'}
        </h2>
      </div>

      {/* Products Section */}
      <div className="mb-6">
        {isLoadingListProducts ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-2">Se încarcă produsele...</p>
          </div>
        ) : listProducts && listProducts.length > 0 ? (
          <div className="space-y-6">
            {(() => {
              // Group products by category
              const productsByCategory = listProducts.reduce((acc: any, product: any) => {
                const categoryName = getCategoryName(product.category_id);
                if (!acc[categoryName]) {
                  acc[categoryName] = [];
                }
                acc[categoryName].push(product);
                return acc;
              }, {});

              return Object.entries(productsByCategory).map(([categoryName, products]: [string, any]) => (
                <div key={categoryName} className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 text-center">
                    {categoryName}
                  </h4>
                  <div className="space-y-3">
                    {products.map((product: any) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex space-x-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={`${import.meta.env.VITE_API_BASE_URL}/api/v1/static/uploads/${product.images[0].image_versions?.thumbnail}`}
                                alt={product.nume}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  // Fallback to package icon if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            {/* Fallback icon - hidden by default, shown if image fails or doesn't exist */}
                            <div className={`w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          </div>
                          
                          {/* Content Area - 3 Layers */}
                          <div className="flex-1 min-w-0 flex flex-col">
                            {/* Layer 1: Title - Full width */}
                            <div className="mb-2">
                              <Link 
                                to={`/product/${product.id}`}
                                className="hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors block"
                              >
                                <h5 className="font-medium text-gray-900">{product.nume}</h5>
                              </Link>
                            </div>
                            
                            {/* Layer 2: Description - Full width */}
                            {product.description && (
                              <div className="mb-3">
                                <Link 
                                  to={`/product/${product.id}`}
                                  className="hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors block"
                                >
                                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                                </Link>
                              </div>
                            )}
                            
                            {/* Layer 3: Price/Stock and Button - Split layout */}
                            <div className="flex justify-between items-end">
                              {/* Left side: Price and Stock */}
                              <div className="space-y-1">
                                <p className="text-sm text-gray-600">
                                  Preț: {product.pret} RON / {getUnitName(product.unitati_id)}
                                </p>
                                <p className="text-sm font-medium text-green-600">
                                  Stoc: {product.stoc_produs} {getUnitName(product.unitati_id)}
                                </p>
                              </div>
                              
                              {/* Right side: Button */}
                              <div className="flex-shrink-0">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    addToCart(product);
                                  }}
                                  className="px-3 py-1"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Adaugă
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-2">Nu există produse în această listă</p>
            <p className="text-sm text-gray-400">
              Adaugă produse în secțiunea de gestionare a listei
            </p>
          </div>
        )}
      </div>

      {/* Additional Details */}
      {publishedList.alte_detalii && (
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">{publishedList.alte_detalii}</p>
          </div>
        </div>
      )}

      {/* Delivery Schedule, Delivery Methods, and Payment Methods */}
      <div className="space-y-4">
        {/* Delivery Schedule */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Clock className="h-6 w-6 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">Orar Livrări</h4>
              <div className="text-sm text-gray-600 whitespace-pre-line">
                {deliverySchedules?.find(s => s.id === publishedList.orare_livrari_id)?.orar_livrari || 'Orar nedefinit'}
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Methods */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Truck className="h-6 w-6 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">Metode de Livrare</h4>
              <div className="text-sm text-gray-600">
                {deliveryTypes && deliveryTypes.length > 0 
                  ? deliveryTypes.map(dt => (
                      <div key={dt.id} className="mb-1 last:mb-0">
                        {dt.denumire}
                      </div>
                    ))
                  : 'Metode de livrare nedefinite'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CreditCard className="h-6 w-6 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">Metode de Plată</h4>
              <div className="text-sm text-gray-600">
                {paymentMethods && paymentMethods.length > 0 
                  ? paymentMethods.map(pm => (
                      <div key={pm.id} className="mb-1 last:mb-0">
                        {pm.description}
                      </div>
                    ))
                  : 'Metode de plată nedefinite'
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Action Button */}
      {getTotalItems() > 0 && (
        <div className="mt-8 text-center">
          <Link to="/cart">
            <Button variant="primary" className="px-8 py-3 text-lg">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Vezi Coșul ({getTotalItems()} produse)
            </Button>
          </Link>
        </div>
      )}
    </div>
    </>
  );
};

export default WelcomePage; 