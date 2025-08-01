import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';
import { usePublishedList, useListProducts } from '@/hooks/useLists';
import { useCategories } from '@/hooks/useCategories';
import { useUnits } from '@/hooks/useUnits';

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const { addItem } = useCartStore();
  const { data: publishedList } = usePublishedList();
  const { data: listProducts } = useListProducts(publishedList?.id || 0);
  const { data: categories } = useCategories();
  const { data: units } = useUnits();

  // Helper functions
  const getCategoryName = (categoryId: number) => {
    return categories?.find(c => c.id === categoryId)?.name || 'Categorie necunoscută';
  };

  const getUnitName = (unitId: number) => {
    return units?.find(u => u.id === unitId)?.denumire || 'unitate';
  };

  // Find the product
  const product = listProducts?.find(p => p.id === parseInt(productId || '0'));

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
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
    );
  }

  const productImages = product.images || [];
  const hasMultipleImages = productImages.length > 1;

  const addToCart = () => {
    addItem({
      id: product.id,
      nume: product.nume,
      pret: product.pret,
      unitati_id: product.unitati_id,
      unitate_denumire: getUnitName(product.unitati_id),
      images: product.images
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stoc_produs) {
      setQuantity(newQuantity);
    }
  };

  return (
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
                    src={`${import.meta.env.VITE_API_BASE_URL}/api/v1/static/uploads/${productImages[selectedImageIndex]?.image_versions?.original}`}
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
                  {productImages.map((image, index) => (
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
                        src={`${import.meta.env.VITE_API_BASE_URL}/api/v1/static/uploads/${image.image_versions?.thumbnail}`}
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
              <div className="space-y-2">
                <div className="flex items-baseline space-x-3">
                  <span className="text-4xl font-bold text-gray-900">
                    {product.pret}
                  </span>
                  <span className="text-xl text-gray-500 font-medium">
                    RON
                  </span>
                  <span className="text-lg text-gray-400">
                    / {getUnitName(product.unitati_id)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${product.stoc_produs > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {product.stoc_produs > 0 
                      ? `${product.stoc_produs} ${getUnitName(product.unitati_id)} disponibile`
                      : 'Stoc epuizat'
                    }
                  </span>
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
                  <label className="block text-sm font-medium text-gray-700">
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
                      disabled={quantity >= product.stoc_produs}
                      className="w-12 h-12 p-0 rounded-full"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  variant="primary"
                  onClick={addToCart}
                  className="w-full h-14 text-lg font-semibold"
                  disabled={product.stoc_produs === 0}
                >
                  <Plus className="w-5 h-5 mr-3" />
                  {product.stoc_produs === 0 ? 'Stoc epuizat' : 'Adaugă în coș'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage; 