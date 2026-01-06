import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBusinessDetailsSingle } from '@/hooks/useBusinessDetails';
import { useLastExpiredList, useListProductsOrdered, useListDeliveryTypes } from '@/hooks/useLists';
import { useCategories } from '@/hooks/useCategories';
import { useUnits } from '@/hooks/useUnits';
import { useDeliverySchedules } from '@/hooks/useDeliverySchedules';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { Clock, Package, Truck, CreditCard, Camera, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getAppName, getLogoPath } from '@/utils/appConfig';
import { getProductImageUrl } from '@/services/api';
import { generateOrganizationSchema, injectSchemaMarkup, removeSchemaMarkup } from '@/utils/schema';
import { components } from '@/utils/theme';
import { formatDateRomanian } from '@/utils/dateFormatters';
import SEO from '@/components/SEO';

const ArchivedProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: businessDetails } = useBusinessDetailsSingle();
  const { data: lastExpiredList, isLoading, error } = useLastExpiredList();
  
  // Fetch data for the expired list
  const { data: listProductsData, isLoading: isLoadingListProducts } = useListProductsOrdered(lastExpiredList?.id || 0);
  const { data: categories } = useCategories();
  const { data: units } = useUnits();
  const { data: deliverySchedules } = useDeliverySchedules();
  // Fetch list-specific delivery types instead of all system delivery types
  const { data: listDeliveryTypes } = useListDeliveryTypes(lastExpiredList?.id || 0);
  const { data: paymentMethods } = usePaymentMethods();

  // Extract products from the new ordered structure
  const listProducts = React.useMemo(() => {
    if (!listProductsData?.categories) return [];
    
    // Flatten all products from all categories
    return listProductsData.categories.flatMap((category: any) => 
      category.products.map((product: any) => ({
        ...product,
        category_id: category.id // Ensure category_id is set
      }))
    );
  }, [listProductsData]);

  // Description expansion state for each product
  const [expandedDescriptions, setExpandedDescriptions] = React.useState<{ [key: number]: boolean }>({});

  // Inject schema markup for SEO
  useEffect(() => {
    // Inject organization schema
    try {
      const organizationSchema = generateOrganizationSchema(businessDetails);
      injectSchemaMarkup(organizationSchema, 'organization');
    } catch (error) {
      console.warn('Failed to inject organization schema:', error);
    }

    // Cleanup: remove schema markup when component unmounts
    return () => {
      removeSchemaMarkup('organization');
    };
  }, [businessDetails]);

  // Helper functions
  const getCategoryName = (categoryId: number) => {
    return categories?.find(c => c.id === categoryId)?.name || 'Categorie necunoscută';
  };

  const getUnitName = (unitId: number) => {
    return units?.find(u => u.id === unitId)?.denumire || 'unitate';
  };

  // Handle description toggle
  const toggleDescription = (productId: number) => {
    setExpandedDescriptions(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  // Truncate helper to cut at word boundary
  const truncateText = (text: string, limit: number): string => {
    if (!text || text.length <= limit) return text;
    const slice = text.slice(0, limit);
    const lastSpace = slice.lastIndexOf(' ');
    const cut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
    return cut + '…';
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto px-6 sm:px-6">
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
          <Button 
            variant="primary" 
            onClick={() => navigate('/')}
            className={components.button.primary()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi la Pagina Principală
          </Button>
        </div>
      </div>
    );
  }

  if (!lastExpiredList) {
    return (
      <>
        <SEO 
          title="Produse Arhivate"
          description="Nu există produse arhivate disponibile momentan."
          robots="noindex, nofollow"
        />
        <div className="text-center py-12">
          <div className="max-w-md mx-auto px-6 sm:px-6">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Nu există produse arhivate disponibile
            </h1>
            <p className="text-gray-600 mb-6">
              Nu există liste expirate de produse de vizualizat momentan.
            </p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/')}
              className={components.button.primary()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la Pagina Principală
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Show the expired list with same structure as WelcomePage but without cart functionality
  return (
    <>
      <SEO 
        title="Produse Arhivate"
        description={`Vizualizați produsele disponibile pentru data de ${formatDateRomanian(lastExpiredList.data)}`}
        robots="noindex, nofollow"
      />
      
      {/* Beautiful Header Section */}
      <div className={`${components.backgrounds.header} border-b ${components.borders.primary} mb-8`}>
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
            
            {/* Introduction Message - Modified for Archived */}
            <div className={`${components.backgrounds.card} rounded-xl p-6 shadow-sm border ${components.borders.primary}`}>
              <p className="text-gray-800 text-lg font-semibold leading-relaxed text-center">
                Produsele de mai jos au fost disponibile pe {formatDateRomanian(lastExpiredList.data)}, iar multe dintre ele vor fi disponibile din nou în zilele următoare.
              </p>
            </div>
            
            {/* Back Button */}
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={() => navigate('/')}
                className={components.button.primary()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Înapoi la Pagina Principală
              </Button>
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
                        </div>
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
                  <div className={`${components.backgrounds.category} border ${components.borders.primary} rounded-xl px-6 py-4 text-center`}>
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
                        {/* Large Top Image */}
                        <Link 
                          to={`/product/${product.id}`}
                          className="block"
                        >
                          <div className="p-4">
                            <div className={components.interactive.imageContainer + " relative"}>
                              {product.images && product.images.length > 0 ? (
                                <>
                                  <img
                                    src={getProductImageUrl(product, 'original')}
                                    alt={product.nume}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                  {/* Multiple images indicator */}
                                  {product.images.length > 1 && (
                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-sm px-2.5 py-1.5 rounded-full flex items-center gap-1.5">
                                      <Camera className="w-4 h-4" />
                                      <span>{product.images.length}</span>
                                    </div>
                                  )}
                                </>
                              ) : null}
                              {/* Fallback icon */}
                              <div className={`w-full h-full ${components.backgrounds.fallback} flex items-center justify-center ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>
                                <Package className="w-12 h-12 text-amber-400" />
                              </div>
                            </div>
                          </div>
                        </Link>

                        {/* Content Area */}
                        <div className="p-6">
                          <div className="flex-1 min-w-0 flex flex-col justify-between text-center">
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
                                    {expandedDescriptions[product.id] ? (
                                      <div className="text-sm text-gray-600 leading-relaxed">
                                        <span>{product.description}</span>
                                        {product.description.length > 100 && (
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              toggleDescription(product.id);
                                            }}
                                            className="text-amber-600 hover:text-amber-700 text-xs font-medium ml-1 align-baseline"
                                          >
                                            Arată mai puțin
                                          </button>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-600 leading-relaxed">
                                        <span>
                                          {truncateText(product.description, 120)}
                                        </span>
                                        {product.description.length > 100 && (
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              toggleDescription(product.id);
                                            }}
                                            className="ml-1 text-amber-600 hover:text-amber-700 text-xs font-medium align-baseline whitespace-nowrap"
                                          >
                                            Arată mai mult
                                          </button>
                                        )}
                                      </p>
                                    )}
                                  </div>
                                )}
                                
                                {/* Price - For Reference Only */}
                                <div className="pt-2">
                                  <div>
                                    <span className="text-lg font-bold text-amber-600">
                                      {product.pret} RON / {product.cantitate} {getUnitName(product.unitati_id)}
                                    </span>
                                  </div>
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
          </div>
        )}
      </div>

      {/* VAT Information */}
      <div className="mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-amber-800 font-medium text-sm">
            Toate produsele includeau TVA
          </p>
        </div>
      </div>

      {/* Additional Details */}
      {lastExpiredList.alte_detalii && (
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">{lastExpiredList.alte_detalii}</p>
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
                {deliverySchedules?.find(s => s.id === lastExpiredList.orare_livrari_id)?.orar_livrari || 'Orar nedefinit'}
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
                {listDeliveryTypes && listDeliveryTypes.length > 0 
                  ? listDeliveryTypes.map(dt => (
                      <div key={dt.id} className="mb-2 last:mb-0">
                        <div className="font-medium text-gray-900 text-sm">
                          {dt.denumire}
                        </div>
                        {dt.description && (
                          <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                            {dt.description.length > 80 
                              ? `${dt.description.substring(0, 80)}...` 
                              : dt.description
                            }
                          </div>
                        )}
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
                  ? paymentMethods
                      .slice()
                      .sort((a, b) => a.description.localeCompare(b.description))
                      .map(pm => (
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

      {/* Back to Main Page Button */}
      <div className="mt-8 text-center">
        <Button 
          variant="primary" 
          onClick={() => navigate('/')}
          className={components.button.primary("px-8 py-3 text-lg")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Înapoi la Pagina Principală
        </Button>
      </div>
    </div>
    </>
  );
};

export default ArchivedProductsPage;

