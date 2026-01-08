import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { usePublishedList, useListProductsOrdered } from '@/hooks/useLists';
import { useProducts } from '@/hooks/useProducts';
import { useUnits } from '@/hooks/useUnits';
import { useCategory } from '@/hooks/useCategories';
import { Package, Camera, ArrowLeft, Plus, Minus, ShoppingCart, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';
import { getCategoryImageUrl, getProductImageUrl } from '@/services/api';
import { generateOrganizationSchema, injectSchemaMarkup, removeSchemaMarkup } from '@/utils/schema';
import { components } from '@/utils/theme';
import SEO from '@/components/SEO';
import { useBusinessDetailsSingle } from '@/hooks/useBusinessDetails';

const CategoryCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const numericCategoryId = Number(categoryId);

  const { data: businessDetails } = useBusinessDetailsSingle();
  const { data: category, isLoading: isLoadingCategory, error: categoryError } = useCategory(numericCategoryId);
  const { data: products, isLoading: isLoadingProducts, error: productsError } = useProducts({
    category_id: numericCategoryId,
    limit: 1000,
    skip: 0,
  });
  const { data: publishedList } = usePublishedList();
  const { data: listProductsData } = useListProductsOrdered(publishedList?.id || 0);
  const { data: units } = useUnits();

  const { addItem, getTotalItems } = useCartStore();

  const [addingToCart, setAddingToCart] = React.useState<{ [key: number]: boolean }>({});
  const [quantities, setQuantities] = React.useState<{ [key: number]: number }>({});
  const [expandedDescriptions, setExpandedDescriptions] = React.useState<{ [key: number]: boolean }>({});
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'age-newest' | 'age-oldest'>('name-asc');

  const cartIconRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<{ [key: number]: HTMLImageElement | null }>({});

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

  useEffect(() => {
    if (Number.isNaN(numericCategoryId)) {
      navigate('/catalog', { replace: true });
    }
  }, [numericCategoryId, navigate]);

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

  // Map productId -> per-list stock (stoc_produs) as provided by the published list endpoint.
  const publishedListStockByProductId = React.useMemo(() => {
    const map = new Map<number, number | null | undefined>();
    if (!listProductsData?.categories) return map;

    listProductsData.categories.forEach((category: any) => {
      category.products.forEach((product: any) => {
        map.set(product.id, product?.stoc_produs);
      });
    });

    return map;
  }, [listProductsData]);

  const getUnitName = (unitId: number) => {
    return units?.find(u => u.id === unitId)?.denumire || 'unitate';
  };

  const isProductAvailable = (product: any) => {
    if (!publishedProductIds.has(product.id)) return false;

    const listStock = publishedListStockByProductId.get(product.id);

    if (typeof listStock === 'number') return listStock > 0;
    return true;
  };

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

  // Helper function to remove diacritics for search
  const removeDiacritics = (str: string): string => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    if (!products) return [];

    // Filter by search term (product name only, case-insensitive and diacritic-insensitive)
    let filtered = products;
    if (searchTerm.trim()) {
      const searchNormalized = removeDiacritics(searchTerm.toLowerCase());
      filtered = products.filter(product => {
        const productNameNormalized = removeDiacritics(product.nume.toLowerCase());
        return productNameNormalized.includes(searchNormalized);
      });
    }

    // Sort products
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.nume.localeCompare(b.nume, 'ro');
        case 'name-desc':
          return b.nume.localeCompare(a.nume, 'ro');
        case 'price-asc':
          return a.pret - b.pret;
        case 'price-desc':
          return b.pret - a.pret;
        case 'age-newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'age-oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [products, searchTerm, sortBy]);

  const isLoading = isLoadingCategory || isLoadingProducts;
  const error = categoryError || productsError;

  // Show skeleton loaders instead of spinner for better UX
  if (isLoading) {
    return (
      <>
        <SEO
          title="Catalog Produse"
          description="Produsele din categorie."
          robots="index, follow"
        />
        <div className={`${components.backgrounds.header} border-b ${components.borders.primary} mb-8`}>
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-full max-w-[280px]">
                <div className="aspect-square rounded-xl overflow-hidden relative border border-gray-200 shadow-sm bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
              </div>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto">
          <div className="space-y-6">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="p-4">
                  <div className={`${components.interactive.imageContainer} relative`}>
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-32 mx-auto"></div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="h-10 w-10 bg-gray-200 rounded"></div>
                      <div className="h-6 w-12 bg-gray-200 rounded"></div>
                      <div className="h-10 w-10 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Package className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Eroare la încărcarea categoriei
          </h1>
          <p className="text-gray-600 mb-6">
            A apărut o eroare la încărcarea acestei categorii. Vă rugăm să încercați din nou.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/catalog')}
            className={components.button.primary()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi la catalog
          </Button>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-4">
            Categoria nu a fost găsită.
          </h1>
          <Button
            variant="primary"
            onClick={() => navigate('/catalog')}
            className={components.button.primary()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi la catalog
          </Button>
        </div>
      </div>
    );
  }

  // Note: We don't early return for empty products array - let the main render handle it with search/sort controls

  return (
    <>
      <SEO
        title={`Catalog - ${category.name}`}
        description={`Produsele din categoria ${category.name}.`}
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
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-full max-w-[280px]">
              <div className="aspect-square rounded-xl overflow-hidden relative border border-gray-200 shadow-sm">
                <img
                  srcSet={`
                    ${getCategoryImageUrl(category, 'thumbnail')} 300w,
                    ${getCategoryImageUrl(category, 'medium')} 600w,
                    ${getCategoryImageUrl(category, 'original')} 1200w
                  `}
                  sizes="(max-width: 640px) 200px, 280px"
                  src={getCategoryImageUrl(category, 'medium')}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
            <h1 className="font-bold text-lg md:text-xl text-gray-900 text-center tracking-tight leading-tight">
              {category.name}
            </h1>
            <Button
              variant="primary"
              onClick={() => navigate('/catalog')}
              className={components.button.primary("gap-2 px-6 md:px-8")}
            >
              <ArrowLeft className="w-4 h-4" />
              Înapoi la catalog
            </Button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto">
        {/* Search and Sort Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Caută produse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 sm:w-auto">
                <label htmlFor="sort-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Ordonează după:
                </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
              >
                <option value="name-asc">Nume (A-Z)</option>
                <option value="name-desc">Nume (Z-A)</option>
                <option value="price-asc">Preț (crescător)</option>
                <option value="price-desc">Preț (descrescător)</option>
                <option value="age-newest">Cel mai nou</option>
                <option value="age-oldest">Cel mai vechi</option>
              </select>
            </div>
          </div>
          {/* Results Count */}
          {searchTerm.trim() && (
            <p className="text-sm text-gray-600">
              {filteredAndSortedProducts.length === 0
                ? 'Nu s-au găsit produse'
                : `${filteredAndSortedProducts.length} ${filteredAndSortedProducts.length === 1 ? 'produs găsit' : 'produse găsite'}`
              }
            </p>
          )}
        </div>

        <div className="space-y-6">
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm.trim() ? 'Nu s-au găsit produse' : 'Nu există produse în această categorie'}
              </h3>
              <p className="text-gray-600">
                {searchTerm.trim()
                  ? 'Încearcă să modifici termenii de căutare.'
                  : 'Vă rugăm să reveniți mai târziu sau să explorați alte categorii.'}
              </p>
            </div>
          ) : (
            filteredAndSortedProducts.map((product: any, index: number) => {
            const available = isProductAvailable(product);
            const currentQuantity = quantities[product.id] || 1;
            const listStock = publishedListStockByProductId.get(product.id);
            const isInPublishedList = publishedProductIds.has(product.id);
            const isUnavailable = isInPublishedList && typeof listStock === 'number' && listStock === 0;
            
            return (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group animate-fade-in-up"
                style={{
                  animationDelay: `${Math.min(index * 50, 500)}ms`,
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
                            srcSet={`
                              ${getProductImageUrl(product, 'thumbnail')} 300w,
                              ${getProductImageUrl(product, 'medium')} 600w,
                              ${getProductImageUrl(product, 'original')} 1200w
                            `}
                            sizes="(max-width: 640px) 200px, (max-width: 1024px) 400px, 500px"
                            src={getProductImageUrl(product, 'thumbnail')}
                            alt={product.nume}
                            className="w-full h-full object-cover"
                            loading="lazy"
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
                          size="sm"
                          onClick={() => addToCartWithQuantity(product)}
                          disabled={addingToCart[product.id]}
                          className={components.button.primary("w-full sm:w-auto font-medium py-2 px-4 rounded-lg mt-1")}
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
            })
          )}
        </div>

        <div className="mt-8 text-center">
          <Button variant="primary" onClick={() => navigate('/catalog')} className={components.button.primary("px-8 py-3 text-lg")}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Înapoi la catalog
          </Button>
        </div>
      </div>
    </>
  );
};

export default CategoryCatalogPage;
