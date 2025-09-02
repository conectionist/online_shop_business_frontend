import React from 'react';
import { useBusinessDetailsSingle } from '@/hooks/useBusinessDetails';
import { getProductImageUrl } from '@/services/api';
import { useCartStore } from '@/stores/cartStore';
import { Package, Trash2, Plus, Minus, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

const CartPage: React.FC = () => {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getTotalItems, 
    getTotalPrice 
  } = useCartStore();
  const { data: businessDetails } = useBusinessDetailsSingle();

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200 p-8 text-center">
            <ShoppingCart className="h-16 w-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Coșul tău este gol
            </h1>
            <p className="text-gray-600 mb-6">
              Nu ai adăugat încă produse în coș. Navighează la lista de produse pentru a începe să faci cumpărături.
            </p>
            <Link to="/">
              <Button 
                variant="primary"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Înapoi la Produse
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-6 w-6 text-amber-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Coșul tău
              </h1>
            </div>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={clearCart}
              className="bg-white/80 backdrop-blur-sm border-amber-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-300"
            >
              Golește coșul
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            {getTotalItems()} produse în coș
          </p>
        </div>

        {/* Cart Items */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Produse în coș
          </h2>
          
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border border-amber-200 rounded-xl p-4 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300">
                {/* Product Info Section */}
                <div className="flex items-start space-x-4 mb-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={getProductImageUrl(item, 'thumbnail')}
                        alt={item.nume}
                        className="w-16 h-16 object-cover rounded-xl border-2 border-amber-100 shadow-sm"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    {/* Fallback icon */}
                    <div className={`w-16 h-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-100 flex items-center justify-center ${item.images && item.images.length > 0 ? 'hidden' : ''}`}>
                      <Package className="w-6 h-6 text-amber-400" />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">
                      {item.nume}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Preț unitar: {item.pret} RON
                    </p>
                    <p className="text-sm font-medium text-amber-600 mt-1">
                      Preț total: {item.pret * item.quantity} RON
                    </p>
                  </div>
                </div>

                {/* Controls Section - Bottom */}
                <div className="flex items-center justify-center pt-3 border-t border-amber-100 space-x-4">
                  {/* Delete Button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="bg-white/80 backdrop-blur-sm border-amber-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="w-8 h-8 p-0 bg-white/80 backdrop-blur-sm border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all duration-300"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center text-amber-700">
                      {item.quantity}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="w-8 h-8 p-0 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sumar comandă
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Numărul de produse:</span>
              <span className="font-medium text-amber-700">{getTotalItems()}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold border-t border-amber-200 pt-3">
              <span>Total:</span>
              <span className="text-amber-600">{getTotalPrice()} RON</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Dacă alegi livrare la domiciliu, se va aplica o taxă de livrare{businessDetails?.delivery_tax ? ` de ${businessDetails.delivery_tax} RON` : ''}.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/" className="flex-1">
            <Button 
              variant="secondary" 
              className="w-full bg-white/80 backdrop-blur-sm border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continuă cumpărăturile
            </Button>
          </Link>
          <Link to="/order-form" className="flex-1">
            <Button 
              variant="primary" 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Finalizează comanda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 