import React, { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBusinessDetailsSingle } from '@/hooks/useBusinessDetails';
import { usePublishedList, useListProductsOrdered } from '@/hooks/useLists';
import { useAllProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useUnits } from '@/hooks/useUnits';
import { Package, Camera, ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';
import { getAppName, getLogoPath } from '@/utils/appConfig';
import { getProductImageUrl } from '@/services/api';
import { generateOrganizationSchema, injectSchemaMarkup, removeSchemaMarkup } from '@/utils/schema';
import { components } from '@/utils/theme';
import SEO from '@/components/SEO';

const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: businessDetails } = useBusinessDetailsSingle();
  const { data: allProducts, isLoading, error } = useAllProducts();
  const { data: publishedList } = usePublishedList();
  const { data: listProductsData } = useListProductsOrdered(publishedList?.id || 0);
  const { data: categories } = useCategories();
  const { data: units } = useUnits();

  // Cart store
  const { addItem, getTotalItems } = useCartStore();

  // Interactive states
  const [addingToCart, setAddingToCart] = React.useState<{ [key: number]: boolean }>({});
  const [quantities, setQuantities] = React.useState<{ [key: number]: number }>({});
  const [expandedDescriptions, setExpandedDescriptions] = React.useState<{ [key: number]: boolean }>({});

  // Refs for animation
  const cartIconRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<{ [key: number]: HTMLImageElement | null }>({});

  // Get list of product IDs that are in the published list
  const publishedProductIds = React.useMemo(() => {
    if (!listProductsData?.categories) return new Set<number>();
    
    const ids = new Set<number>();
    listProductsData.categories.forEach((category: any) => {
      category.products.forEach((product: any) => {
        ids.add(product.id);
      });
    });
    return ids;
  }, [listProductsData]);

  // Group all products by category
  const productsByCategory = React.useMemo(() => {
    if (!allProducts || !categories) return {};
    
    const grouped: { [key: string]: any[] } = {};
    
    allProducts.forEach((product: any) => {
      const categoryName = categories.find(c => c.id === product.category_id)?.name || 'Fără categorie';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(product);
    });
    
    return grouped;
  }, [allProducts, categories]);

  // Inject schema markup for SEO
  useEffect(() => {
    try {
      const organizationSchema = generateOrganizationSchema(businessDetails);
      injectSchemaMarkup(organizationSchema, 'organization');
    } catch (error) {
      console.warn('Failed to inject organization schema:', error);
    }

    return () => {
      removeSchemaMarkup('organization');
    };
  }, [businessDetails]);

  // Helper functions
  const getUnitName = (unitId: number) => {
    return units?.find(u => u.id === unitId)?.denumire || 'unitate';
  };

  // Check if product is available for purchase
  const isProductAvailable = (product: any) => {
    return publishedProductIds.has(product.id) && product.stoc_produs > 0;
  };

  // Add to cart with quantity logic
  const animateImageToCart = (productId: number) => {
    const img = imageRefs.current[productId];
    const cartIcon = cartIconRef.current;
    
    if (!img || !cartIcon) return;

    const imgRect = img.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    const clone = img.cloneNode(true) as HTMLImageElement;
    clone.style.position = 'fixed';
    clone.style.top = `${imgRect.top}px`;
    clone.style.left = `${imgRect.left}px`;
    clone.style.width = `${imgRect.width}px`;
    clone.style.height = `${imgRect.height}px`;
    clone.style.zIndex = '9999';
    clone.style.transition = 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
    clone.style.pointerEvents = 'none';
    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.top = `${cartRect.top}px`;
      clone.style.left = `${cartRect.left}px`;
      clone.style.width = '40px';
      clone.style.height = '40px';
      clone.style.opacity = '0.3';
      clone.style.transform = 'scale(0.1)';
    });

    setTimeout(() => {
      document.body.removeChild(clone);
    }, 800);
  };

  const addToCartWithQuantity = (product: any) => {
    if (!publishedList?.id || !isProductAvailable(product)) return;

    const quantity = quantities[product.id] || 1;
    
    const currentItems = useCartStore.getState().items;
    const existingItem = currentItems.find(item => item.id === product.id);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      useCartStore.getState().updateQuantity(product.id, newQuantity);
    } else {
      addItem({
        id: product.id,
        nume: product.nume,
        pret: product.pret,
        unitati_id: product.unitati_id,
        unitate_denumire: getUnitName(product.unitati_id),
        images: product.images,
        listId: publishedList.id
      });
      
      setTimeout(() => {
        useCartStore.getState().updateQuantity(product.id, quantity);
      }, 0);
    }

    setAddingToCart({ ...addingToCart, [product.id]: true });
    animateImageToCart(product.id);
    
    setTimeout(() => {
      setAddingToCart({ ...addingToCart, [product.id]: false });
      setQuantities({ ...quantities, [product.id]: 1 });
    }, 1000);
  };

  const handleQuantityChange = (productId: number, delta: number) => {
    const currentQuantity = quantities[productId] || 1;
    const newQuantity = Math.max(1, currentQuantity + delta);
    setQuantities({ ...quantities, [productId]: newQuantity });
  };

  const toggleDescription = (productId: number) => {
    setExpandedDescriptions(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

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
            Eroare la încărcarea catalogului
          </h1>
          <p className="text-gray-600 mb-6">
            A apărut o eroare la încărcarea catalogului de produse. Vă rugăm să încercați din nou.
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

  if (!allProducts || allProducts.length === 0) {
    return (
      <>
        <SEO
          title="Catalog Produse"
          description="Nu există produse disponibile în catalog."
          robots="index, follow"
        />
        <div className="text-center py-12">
          <div className="max-w-md mx-auto px-6 sm:px-6">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Nu există produse disponibile în catalog.
            </h1>
            <p className="text-gray-600 mb-6">
              Vă rugăm să reveniți mai târziu sau să contactați administratorul.
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

  return (
    <>
      <SEO
        title="Catalog Produse"
        description="Explorează catalogul nostru complet de produse proaspete de brutărie cu maia."
        robots="index, follow"
      />

      {/* Floating Cart Icon */}
      {publishedList && (
        <div ref={cartIconRef} className="fixed top-4 right-4 z-50">
          <Link to="/cart">
            <div className={components.interactive.floatingCart}>
              <ShoppingCart className="h-6 w-6 text-amber-700" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg">
                  {getTotalItems()}
                </span>
              )}
            </div>
          </Link>
        </div>
      )}

      {/* Header */}
      <div className={`${components.backgrounds.header} border-b ${components.borders.primary} mb-8`}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                <img
                  src={getLogoPath()}
                  alt="Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                  {getAppName()}
                </h1>
                <p className="text-amber-700 font-medium text-sm md:text-base">Catalog Produse</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-px bg-amber-300"></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <div className="w-8 h-px bg-amber-300"></div>
            </div>

            <div className={`${components.backgrounds.card} rounded-xl p-6 shadow-sm border ${components.borders.primary}`}>
              <p className="text-gray-700 text-lg font-semibold text-center">
              Mai jos gasesti o lista cu toate produsele noastre. {publishedList ? 'Produsele disponibile pentru comandă sunt afișate cu opțiunea de adăugare în coș.' : ''}
              </p>
            </div>

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

      {/* Products Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="space-y-6">
            {Object.entries(productsByCategory).map(([categoryName, products]: [string, any]) => (
              <div key={categoryName} className="space-y-4">
                <div className={`${components.backgrounds.category} border ${components.borders.primary} rounded-xl px-6 py-4 text-center`}>
                  <h4 className="text-lg font-bold text-amber-800">
                    {categoryName}
                  </h4>
                  <div className="w-12 h-0.5 bg-amber-400 mx-auto mt-2 rounded-full"></div>
                </div>
                <div className="space-y-4">
                  {products.map((product: any, index: number) => {
                    const available = isProductAvailable(product);
                    const currentQuantity = quantities[product.id] || 1;
                    const isUnavailable = product.stoc_produs === 0;
                    
                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group animate-fade-in-up"
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animationFillMode: 'both'
                        }}
                      >
                        <Link
                          to={`/product/${product.id}`}
                          className="block"
                        >
                          <div className="p-4">
                            <div className={components.interactive.imageContainer + " relative"}>
                              {product.images && product.images.length > 0 ? (
                                <>
                                  <img
                                    ref={(el) => { imageRefs.current[product.id] = el; }}
                                    src={getProductImageUrl(product, 'original')}
                                    alt={product.nume}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                  {product.images.length > 1 && (
                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-sm px-2.5 py-1.5 rounded-full flex items-center gap-1.5">
                                      <Camera className="w-4 h-4" />
                                      <span>{product.images.length}</span>
                                    </div>
                                  )}
                                </>
                              ) : null}
                              <div className={`w-full h-full ${components.backgrounds.fallback} flex items-center justify-center ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>
                                <Package className="w-12 h-12 text-amber-400" />
                              </div>
                            </div>
                          </div>
                        </Link>

                        <div className="p-6">
                          <div className="flex-1 min-w-0 flex flex-col justify-between text-center">
                            <div className="space-y-2">
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

                              {product.description && (
                                <div>
                                  <p className="text-sm text-gray-600 leading-relaxed">
                                    {expandedDescriptions[product.id] || product.description.length <= 80 ? (
                                      <span>{product.description}</span>
                                    ) : (
                                      <span>{truncateText(product.description, 80)}</span>
                                    )}
                                    {product.description.length > 80 && (
                                      <button
                                        onClick={() => toggleDescription(product.id)}
                                        className="text-amber-600 hover:text-amber-700 font-medium ml-1"
                                      >
                                        {expandedDescriptions[product.id] ? 'mai puțin' : 'mai mult'}
                                      </button>
                                    )}
                                  </p>
                                </div>
                              )}

                              <div className="pt-2">
                                <div>
                                  <span className="text-lg font-bold text-amber-600">
                                    {product.pret} RON / {product.cantitate} {getUnitName(product.unitati_id)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Cart Controls or Unavailable Message */}
                            {available ? (
                              <div className="space-y-3 mt-4">
                                <div className="flex items-center justify-center space-x-4">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleQuantityChange(product.id, -1)}
                                    disabled={currentQuantity <= 1}
                                    className={components.interactive.quantityButton}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <span className="text-xl font-bold text-amber-700 w-12 text-center">
                                    {currentQuantity}
                                  </span>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleQuantityChange(product.id, 1)}
                                    className={components.interactive.quantityButton}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>

                                <Button
                                  variant="primary"
                                  onClick={() => addToCartWithQuantity(product)}
                                  disabled={addingToCart[product.id]}
                                  className={`${components.button.primary()} w-full`}
                                >
                                  {addingToCart[product.id] ? (
                                    <span className="flex items-center justify-center">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Adăugat!
                                    </span>
                                  ) : (
                                    <>
                                      <Plus className="w-4 h-4 mr-2" />
                                      Adaugă în coș
                                    </>
                                  )}
                                </Button>
                              </div>
                            ) : (
                              <div className="mt-4 flex justify-center">
                                <div className="text-sm font-bold inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                                  {isUnavailable ? 'Nu mai avem momentan' : 'Momentan indisponibil'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button variant="primary" onClick={() => navigate('/')} className={components.button.primary("px-8 py-3 text-lg")}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Înapoi la Pagina Principală
          </Button>
        </div>
      </div>
    </>
  );
};

export default CatalogPage;

