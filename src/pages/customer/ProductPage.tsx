import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Plus, Minus, ShoppingCart, Share2, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';
import { usePublishedList, useListProductsOrdered } from '@/hooks/useLists';
import { useProduct, useProductOffer } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useUnits } from '@/hooks/useUnits';
import { useImageSize } from '@/hooks/useImageSize';
import { getProductImageUrl, getProductImageUrlFromImage } from '@/services/api';
import AppLightbox from '@/components/ui/Lightbox';
import SEO from '@/components/SEO';
import { generateProductSchema, injectSchemaMarkup, removeSchemaMarkup } from '@/utils/schema';
import { components } from '@/utils/theme';

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const imageSize = useImageSize();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  const { addItem, getTotalItems } = useCartStore();
  const { data: publishedList, isLoading: isLoadingPublishedList } = usePublishedList();
  
  // Fetch product directly from database
  const productIdNum = parseInt(productId || '0');
  const { data: product, isLoading: isLoadingProduct } = useProduct(productIdNum);
  
  // Get published list products to check availability
  const { data: publishedListProductsData, isLoading: isLoadingPublishedProducts } = useListProductsOrdered(publishedList?.id || 0);
  // Price, availability and unit pricing for the structured data, as the Merchant feed lists them
  const { data: offer } = useProductOffer(productIdNum);
  const { data: categories } = useCategories();
  const { data: units } = useUnits();

  // Extract products from published list to check if current product is available
  const publishedListProducts = React.useMemo(() => {
    if (!publishedListProductsData?.categories) return [];
    return publishedListProductsData.categories.flatMap((category: any) => 
      category.products.map((product: any) => ({
        ...product,
        category_id: category.id
      }))
    );
  }, [publishedListProductsData]);

  // Check if product is in published list
  const productInPublishedList = publishedListProducts?.find((p: any) => p.id === productIdNum);
  
  // Use published list product data if available (includes stoc_produs), otherwise use direct fetch
  const displayProduct = productInPublishedList || product;
  const isArchivedMode = !productInPublishedList;
  // Can be ordered: in the published list and not sold out
  const isInStock = !!productInPublishedList && productInPublishedList.stoc_produs !== 0;

  // Helper functions
  const getCategoryName = (categoryId: number) => {
    return categories?.find(c => c.id === categoryId)?.name || 'Categorie necunoscută';
  };

  const getUnitName = (unitId: number) => {
    return units?.find(u => u.id === unitId)?.denumire || 'unitate';
  };

  // Inject product schema markup for SEO - must be before any early returns.
  // Skipped until the offer arrives, and when it fails, so a guessed availability is never published.
  useEffect(() => {
    if (product && categories && units && offer) {
      try {
        const categoryName = getCategoryName(product.category_id);
        const unitName = getUnitName(product.unitati_id);
        const productSchema = generateProductSchema(product, categoryName, unitName, offer);
        injectSchemaMarkup(productSchema, 'product');
      } catch (error) {
        console.warn('Failed to generate product schema:', error);
      }
    }

    // Cleanup: remove schema markup when component unmounts
    return () => {
      removeSchemaMarkup('product');
    };
  }, [product, categories, units, offer]);

  // Show skeleton loader with layout immediately for better UX.
  // The list products query stays disabled (not loading) until the published list arrives,
  // so wait for the published list too, or the page briefly renders as archived.
  if (isLoadingProduct || isLoadingPublishedList || isLoadingPublishedProducts) {
    return (
      <>
        <SEO 
          title="Se încarcă produsul..."
          description="Se încarcă informațiile despre produs."
          robots="index, follow"
        />
        <div className={components.page.container}>
          <div className="max-w-4xl mx-auto px-4">
            <div className="mb-6">
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className={components.card.main + " overflow-hidden"}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                {/* Image Gallery Skeleton */}
                <div className="space-y-6">
                  <div className={components.interactive.imageContainer}>
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
                  </div>
                  <div className="flex space-x-3 overflow-x-auto pb-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex-shrink-0 w-20 h-20 rounded-xl bg-gray-200 animate-pulse"></div>
                    ))}
                  </div>
                </div>
                {/* Product Details Skeleton */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-6 pt-6 border-t border-amber-100">
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-14 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <SEO 
          title="Produsul nu a fost găsit"
          description="Produsul pe care îl cauți nu există sau nu este disponibil."
          robots="index, follow"
        />
        <div className={components.page.containerLarge}>
          <div className="max-w-2xl mx-auto px-4">
            <div className={components.card.main + " p-8 text-center"}>
              <Package className="h-16 w-16 text-amber-400 mx-auto mb-4" />
              <h1 className="text-1xl font-bold text-gray-900 mb-4">
                Produsul nu a fost găsit
              </h1>
              <p className="text-gray-600 mb-6">
                Produsul pe care îl cauți nu există sau nu este disponibil.
              </p>
              <Button 
                variant="primary" 
                onClick={() => navigate('/')}
                className={components.button.primary()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Înapoi la Produse
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const productImages = displayProduct.images || [];
  const hasMultipleImages = productImages.length > 1;
  const isUnavailable = !isInStock;

  // Generate product-specific SEO data
  const productTitle = displayProduct.nume;
  const productDescription = displayProduct.description || 
    `${displayProduct.nume} - produs proaspăt de brutărie cu maia. ${getCategoryName(displayProduct.category_id)}. Preț: ${displayProduct.pret} RON pentru ${displayProduct.cantitate} ${getUnitName(displayProduct.unitati_id)}. Comandă online cu livrare rapidă în Iasi.`;
  const productKeywords = `${displayProduct.nume}, ${getCategoryName(displayProduct.category_id)}, brutărie, maia, produse proaspete, comandă online, livrare, panificatie, românia, iasi`;
  const productImage = productImages.length > 0 ? getProductImageUrl(displayProduct, imageSize) : undefined;
  const productCanonical = `${window.location.origin}/product/${displayProduct.id}`;

  const addToCart = () => {
    // Don't allow adding to cart in archived mode
    if (isArchivedMode) {
      return;
    }
    
    if (!publishedList?.id) 
      return;
    
    if (isUnavailable) {
      return;
    }
    // Get current cart state to check if item exists
    const currentItems = useCartStore.getState().items;
    const existingItem = currentItems.find(item => item.id === displayProduct.id);
    
    if (existingItem) {
      // If item already exists, add the selected quantity to the existing quantity
      const newQuantity = existingItem.quantity + quantity;
      useCartStore.getState().updateQuantity(displayProduct.id, newQuantity);
    } else {
      // If it's a new item, add it with the selected quantity
      addItem({
        id: displayProduct.id,
        nume: displayProduct.nume,
        pret: displayProduct.pret,
        unitati_id: displayProduct.unitati_id,
        unitate_denumire: getUnitName(displayProduct.unitati_id),
        images: displayProduct.images,
        listId: publishedList.id
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

  const copyProductLink = async () => {
    const productUrl = `${window.location.origin}/product/${displayProduct.id}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(productUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = productUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const shareViaWhatsApp = () => {
    const productUrl = `${window.location.origin}/product/${displayProduct.id}`;
    const productName = displayProduct.nume;
    
    const shareText = `${productName} ${productUrl}`;
    const whatsappText = encodeURIComponent(shareText);
    const whatsappUrl = `https://wa.me/?text=${whatsappText}`;
    window.open(whatsappUrl, '_blank');
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
        ogImageAlt={`Imagine pentru ${productTitle} - ${getCategoryName(displayProduct.category_id)}`}
        ogType="product"
        twitterCard="summary_large_image"
      />

      {/* Floating Cart Icon - Hidden in archived mode */}
      {!isArchivedMode && (
        <div className="fixed top-4 right-4 z-50">
          <Link to="/cart" aria-label="Coș de cumpărături">
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

      <div className={components.page.container}>
        <div className="max-w-4xl mx-auto px-4">
          {/* Header with back button */}
          <div className="mb-6">
            <Button
              variant="secondary"
              onClick={() => navigate(!productInPublishedList ? '/catalog' : '/')}
              className={components.interactive.backButton + " mb-4"}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la {!productInPublishedList ? 'Catalog' : 'Produse'}
            </Button>
          </div>

          <div className={components.card.main + " overflow-hidden"}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Image Gallery */}
              <div className="space-y-6">
                {/* Main Image */}
                <div className={components.interactive.imageContainer}>
                  {productImages.length > 0 ? (
                    <img
                      src={getProductImageUrlFromImage(productImages[selectedImageIndex], imageSize)}
                      alt={displayProduct.nume}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onClick={() => setIsLightboxOpen(true)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  {/* Fallback icon */}
                  <div className={`w-full h-full ${components.backgrounds.fallback} flex items-center justify-center ${productImages.length > 0 ? 'hidden' : ''}`}>
                    <Package className="w-20 h-20 text-amber-400" />
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
                            ? 'border-amber-500 shadow-md scale-105'
                            : 'border-amber-200 hover:border-amber-300'
                        }`}
                      >
                        <img
                          src={getProductImageUrlFromImage(image, 'thumbnail')}
                          alt={`${displayProduct.nume} - imagine ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
                <AppLightbox
                  open={isLightboxOpen}
                  index={selectedImageIndex}
                  images={productImages.map((img: any, idx: number) => ({
                    src: getProductImageUrlFromImage(img, imageSize),
                    alt: `${displayProduct.nume} - imagine ${idx + 1}`,
                  }))}
                  onClose={() => setIsLightboxOpen(false)}
                />
              </div>

              {/* Product Details */}
              <div className="space-y-8">
                {/* Product Header */}
                <div className="space-y-4">
                  <div className={components.interactive.categoryBadge}>
                    {getCategoryName(displayProduct.category_id)}
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                    {displayProduct.nume}
                  </h1>
                </div>

                {/* Price Section */}
                <div className="space-y-4">
                  <div className={components.interactive.priceCard}>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-700">
                        {displayProduct.pret} RON / {displayProduct.cantitate} {getUnitName(displayProduct.unitati_id)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {displayProduct.description && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Despre acest produs
                    </h3>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-amber-100">
                      <p className="text-gray-700 leading-relaxed text-base">
                        {displayProduct.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Add to Cart Section - Hidden in archived mode */}
                {!isArchivedMode && (
                  <div className="space-y-6 pt-6 border-t border-amber-100">
                    {isUnavailable && (
                      <div className="flex justify-center">
                        <div className="text-sm font-bold inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                          Nu mai avem momentan
                        </div>
                      </div>
                    )}
                    {/* Quantity Selector */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-lg font-medium text-gray-700">
                          Cantitate
                        </label>
                        <div className="flex items-center space-x-4">
                          <Button
                            aria-label="Scade cantitatea"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={quantity <= 1}
                            className={components.interactive.quantityButton}
                          >
                            <Minus className="w-5 h-5" />
                          </Button>
                          <span className="text-2xl font-bold text-amber-700 w-16 text-center">
                            {quantity}
                          </span>
                          <Button
                            aria-label="Crește cantitatea"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(quantity + 1)}
                            // disabled={quantity >= product.stoc_produs}
                            className={components.interactive.quantityButton}
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
                      className={components.button.primary("w-full h-14 text-lg font-semibold")}
                      disabled={isUnavailable}
                    >
                      <Plus className="w-5 h-5 mr-3" />
                      {isUnavailable ? 'Indisponibil' : 'Adaugă în coș'}
                    </Button>
                  </div>
                )}
                
                {/* Archived mode message */}
                {isArchivedMode && (
                  <div className="pt-6 border-t border-amber-100">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                      <p className="text-amber-800 font-medium text-sm">
                        Acest produs nu este disponibil momentan.
                      </p>
                    </div>
                  </div>
                )}

                {/* Share Section */}
                <div className="space-y-3 pt-6 border-t border-amber-100">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Distribuie produsul
                  </h3>
                  <div className="flex flex-col items-start gap-3">
                    <Button
                      variant="secondary"
                      onClick={shareViaWhatsApp}
                      className={components.button.secondary("w-auto")}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Distribuie pe WhatsApp
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={copyProductLink}
                      className={components.button.secondary("w-auto")}
                    >
                      {linkCopied ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Link copiat!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copiază linkul
                        </>
                      )}
                    </Button>
                  </div>
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