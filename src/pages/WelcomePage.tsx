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
import { getAppName, getLogoPath } from '@/utils/appConfig';

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

  // Interactive states
  const [addingToCart, setAddingToCart] = React.useState<{ [key: number]: boolean }>({});
  const [showSuccessMessage, setShowSuccessMessage] = React.useState<{ [key: number]: boolean }>({});

  // Helper functions
  const getCategoryName = (categoryId: number) => {
    return categories?.find(c => c.id === categoryId)?.name || 'Categorie necunoscută';
  };

  const getUnitName = (unitId: number) => {
    return units?.find(u => u.id === unitId)?.denumire || 'unitate';
  };

  // Enhanced cart function with animations
  const addToCart = async (product: any) => {
    const productId = product.id;
    
    // Set loading state
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Add to cart
    addItem({
      id: product.id,
      nume: product.nume,
      pret: product.pret,
      unitati_id: product.unitati_id,
      unitate_denumire: getUnitName(product.unitati_id),
      images: product.images
    });
    
    // Show success state
    setAddingToCart(prev => ({ ...prev, [productId]: false }));
    setShowSuccessMessage(prev => ({ ...prev, [productId]: true }));
    
    // Hide success message after 2 seconds
    setTimeout(() => {
      setShowSuccessMessage(prev => ({ ...prev, [productId]: false }));
    }, 2000);
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
      {/* Beautiful Header Section */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-b border-amber-200 mb-8">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            {/* Logo and App Name */}
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                <img 
                  src={getLogoPath()} 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if logo fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                  {getAppName()}
                </h1>
                <p className="text-amber-700 font-medium text-sm md:text-base">Produse proaspete de brutărie</p>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-px bg-amber-300"></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <div className="w-8 h-px bg-amber-300"></div>
            </div>
            
            {/* Introduction Message */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-amber-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {publishedList.mesaj_introducere || 'Listă de produse'}
              </h2>
              <p className="text-gray-600 text-sm">
                Comandă produsele tale preferate pentru livrare
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto">
      {/* Products Section */}
      <div className="mb-6">
        {isLoadingListProducts ? (
          <div className="space-y-4">
            {/* Skeleton Loading States */}
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="p-6">
                  <div className="flex space-x-4">
                    {/* Skeleton Image */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
                    </div>
                    
                    {/* Skeleton Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="space-y-2">
                        {/* Skeleton Title */}
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        
                        {/* Skeleton Description */}
                        <div className="space-y-1">
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                        
                        {/* Skeleton Price */}
                        <div className="flex items-center space-x-4 pt-2">
                          <div className="h-5 bg-gray-200 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                      
                      {/* Skeleton Button */}
                      <div className="flex-shrink-0 pt-3">
                        <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                <div key={categoryName} className="space-y-4">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-6 py-4 text-center">
                    <h4 className="text-lg font-bold text-amber-800">
                      {categoryName}
                    </h4>
                    <div className="w-12 h-0.5 bg-amber-400 mx-auto mt-2 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    {products.map((product: any, index: number) => (
                      <div 
                        key={product.id} 
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group animate-fade-in-up"
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animationFillMode: 'both'
                        }}
                      >
                        <div className="p-6">
                          <div className="flex space-x-4">
                            {/* Product Image - Enhanced */}
                            <div className="flex-shrink-0">
                              {product.images && product.images.length > 0 ? (
                                <div className="relative">
                                  <img
                                    src={`${import.meta.env.VITE_API_BASE_URL}/api/v1/static/uploads/${product.images[0].image_versions?.thumbnail}`}
                                    alt={product.nume}
                                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl border-2 border-amber-100 shadow-sm group-hover:border-amber-200 transition-colors duration-300"
                                    onError={(e) => {
                                      // Fallback to package icon if image fails to load
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                  {/* Subtle overlay on hover */}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-xl"></div>
                                </div>
                              ) : (
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-100 flex items-center justify-center shadow-sm group-hover:border-amber-200 transition-colors duration-300">
                                  <Package className="w-8 h-8 text-amber-400" />
                                </div>
                              )}
                            </div>
                            
                            {/* Content Area - Redesigned */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              {/* Product Info */}
                              <div className="space-y-2">
                                {/* Product Name */}
                                <div>
                                  <Link 
                                    to={`/product/${product.id}`}
                                    className="hover:bg-amber-50 rounded-lg p-2 -m-2 transition-colors block"
                                  >
                                    <h5 className="font-semibold text-gray-900 text-lg group-hover:text-amber-700 transition-colors duration-300">
                                      {product.nume}
                                    </h5>
                                  </Link>
                                </div>
                                
                                {/* Description */}
                                {product.description && (
                                  <div>
                                    <Link 
                                      to={`/product/${product.id}`}
                                      className="hover:bg-amber-50 rounded-lg p-2 -m-2 transition-colors block"
                                    >
                                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                        {product.description}
                                      </p>
                                    </Link>
                                  </div>
                                )}
                                
                                {/* Price and Quantity - Enhanced */}
                                <div className="flex items-center space-x-4 pt-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-lg font-bold text-amber-600">
                                      {product.pret} RON
                                    </span>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-sm text-gray-500">
                                      {product.cantitate} {getUnitName(product.unitati_id)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Add to Cart Button - Enhanced */}
                              <div className="flex-shrink-0 pt-3">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    addToCart(product);
                                  }}
                                  disabled={addingToCart[product.id]}
                                  className={`w-full font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 ${
                                    showSuccessMessage[product.id]
                                      ? 'bg-green-500 hover:bg-green-600'
                                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                                  } text-white`}
                                >
                                  {addingToCart[product.id] ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Se adaugă...
                                    </>
                                  ) : showSuccessMessage[product.id] ? (
                                    <>
                                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Adăugat!
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-4 h-4 mr-2" />
                                      Adaugă în coș
                                    </>
                                  )}
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