import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';
import { usePublishedList, useListProductsOrdered } from '@/hooks/useLists';
import { useCategories } from '@/hooks/useCategories';
import { useUnits } from '@/hooks/useUnits';
import { getProductImageUrl } from '@/services/api';
import SEO from '@/components/SEO';
import { generateProductSchema, injectSchemaMarkup, removeSchemaMarkup } from '@/utils/schema';

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const { addItem, getTotalItems } = useCartStore();
  const { data: publishedList } = usePublishedList();
  const { data: listProductsData } = useListProductsOrdered(publishedList?.id || 0);
  const { data: categories } = useCategories();
  const { data: units } = useUnits();

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

  // Helper functions
  const getCategoryName = (categoryId: number) => {
    return categories?.find(c => c.id === categoryId)?.name || 'Categorie necunoscută';
  };

  const getUnitName = (unitId: number) => {
    return units?.find(u => u.id === unitId)?.denumire || 'unitate';
  };

  // Find the product
  const product = listProducts?.find((p: any) => p.id === parseInt(productId || '0'));

  // Inject product schema markup for SEO - must be before any early returns
  useEffect(() => {
    if (product && categories && units) {
      try {
        const categoryName = getCategoryName(product.category_id);
        const unitName = getUnitName(product.unitati_id);
        const productSchema = generateProductSchema(product, categoryName, unitName);
        injectSchemaMarkup(productSchema);
      } catch (error) {
        console.warn('Failed to generate product schema:', error);
      }
    }

    // Cleanup: remove schema markup when component unmounts
    return () => {
      removeSchemaMarkup();
    };
  }, [product, categories, units]);

  if (!product) {
    return (
      <>
        <SEO 
          title="Produsul nu a fost găsit"
          description="Produsul pe care îl cauți nu există sau nu este disponibil."
          robots="noindex, nofollow"
        />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-1xl font-bold text-gray-900 mb-4">
                Produsul nu a fost găsit
              </h1>
              <p className="text-gray-600 mb-6">
                Produsul pe care îl cauți nu există sau nu este disponibil.
              </p>
              <Button variant="primary" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Înapoi la Produse
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const productImages = product.images || [];
  const hasMultipleImages = productImages.length > 1;

  // Generate product-specific SEO data
  const productTitle = product.nume;
  const productDescription = product.description || 
    `${product.nume} - produs proaspăt de brutărie cu maia. ${getCategoryName(product.category_id)}. Preț: ${product.pret} RON pentru ${product.cantitate} ${getUnitName(product.unitati_id)}. Comandă online cu livrare rapidă în Iasi.`;
  const productKeywords = `${product.nume}, ${getCategoryName(product.category_id)}, brutărie, maia, produse proaspete, comandă online, livrare, panificatie, românia, iasi`;
  const productImage = productImages.length > 0 ? getProductImageUrl(product, 'original') : undefined;
  const productCanonical = `${window.location.origin}/product/${product.id}`;

  const addToCart = () => {
    // Get current cart state to check if item exists
    const currentItems = useCartStore.getState().items;
    const existingItem = currentItems.find(item => item.id === product.id);
    
    if (existingItem) {
      // If item already exists, add the selected quantity to the existing quantity
      const newQuantity = existingItem.quantity + quantity;
      useCartStore.getState().updateQuantity(product.id, newQuantity);
    } else {
      // If it's a new item, add it with the selected quantity
      addItem({
        id: product.id,
        nume: product.nume,
        pret: product.pret,
        unitati_id: product.unitati_id,
        unitate_denumire: getUnitName(product.unitati_id),
        images: product.images
      });
      
      // Update the quantity to the selected amount since addItem always adds with quantity 1
      setTimeout(() => {
        useCartStore.getState().updateQuantity(product.id, quantity);
      }, 0);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    // if (newQuantity >= 1 && newQuantity <= product.stoc_produs) {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  return (
    <>
      {/* SEO Component for Product-Specific Meta Tags */}
      <SEO 
        title={productTitle}
        description={productDescription}
        keywords={productKeywords}
        canonical={productCanonical}
        ogImage={productImage}
        ogImageAlt={`Imagine pentru ${productTitle} - ${getCategoryName(product.category_id)}`}
        ogType="product"
        twitterCard="summary_large_image"
      />

      {/* Floating Cart Icon */}
      <div className="fixed top-4 right-4 z-50">
        <Link to="/cart">
          <div className="relative bg-white rounded-full shadow-lg border border-gray-200 p-3 hover:shadow-xl transition-shadow">
            <ShoppingCart className="h-6 w-6 text-gray-700" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {getTotalItems()}
              </span>
            )}
          </div>
        </Link>
      </div>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header with back button */}
          <div className="mb-6">
            <Button
              variant="secondary"
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la Produse
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              {/* Image Gallery */}
              <div className="space-y-6">
                {/* Main Image */}
                <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden shadow-lg">
                  {productImages.length > 0 ? (
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
                  ) : null}
                  {/* Fallback icon */}
                  <div className={`w-full h-full bg-gray-50 flex items-center justify-center ${productImages.length > 0 ? 'hidden' : ''}`}>
                    <Package className="w-20 h-20 text-gray-300" />
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                {hasMultipleImages && (
                  <div className="flex space-x-3 overflow-x-auto pb-2">
                    {productImages.map((image: any, index: number) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                          selectedImageIndex === index
                            ? 'border-blue-500 shadow-md scale-105'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={getProductImageUrl(product, 'thumbnail')}
                          alt={`${product.nume} - imagine ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-8">
                {/* Product Header */}
                <div className="space-y-3">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                    {getCategoryName(product.category_id)}
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                    {product.nume}
                  </h1>
                </div>

                {/* Price Section */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-lg font-medium text-gray-900">
                      Preț: {product.pret} RON
                    </p>
                    <p className="text-lg font-medium text-gray-900">
                      Cantitate: {product.cantitate} {getUnitName(product.unitati_id)}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Despre acest produs
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-base">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Add to Cart Section */}
                <div className="space-y-6 pt-6 border-t border-gray-100">
                  {/* Quantity Selector */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-lg font-medium text-gray-700">
                        Cantitate
                      </label>
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1}
                          className="w-12 h-12 p-0 rounded-full"
                        >
                          <Minus className="w-5 h-5" />
                        </Button>
                        <span className="text-2xl font-bold text-gray-900 w-16 text-center">
                          {quantity}
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleQuantityChange(quantity + 1)}
                          // disabled={quantity >= product.stoc_produs}
                          className="w-12 h-12 p-0 rounded-full"
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    variant="primary"
                    onClick={addToCart}
                    className="w-full h-14 text-lg font-semibold"
                    // disabled={product.stoc_produs === 0}
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    {/* {product.stoc_produs === 0 ? 'Stoc epuizat' : 'Adaugă în coș'} */}
                    Adaugă în coș
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage; 