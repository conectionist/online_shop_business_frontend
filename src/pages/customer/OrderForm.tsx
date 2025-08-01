import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCartStore } from '@/stores/cartStore';
import { usePublishedList } from '@/hooks/useLists';
import { useDeliveryTypes } from '@/hooks/useDeliveryTypes';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { ArrowLeft, User, CreditCard, Truck, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface OrderFormData {
  nume: string;
  prenume: string;
  payment_method_id: number | null;
  delivery_type_id: number | null;
  address?: string;
}

const OrderForm: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { data: publishedList } = usePublishedList();
  const { data: deliveryTypes } = useDeliveryTypes();
  const { data: paymentMethods } = usePaymentMethods();

  const [selectedDeliveryType, setSelectedDeliveryType] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<OrderFormData>({
    defaultValues: {
      nume: '',
      prenume: '',
      payment_method_id: null,
      delivery_type_id: null,
      address: ''
    }
  });

  const watchedPaymentMethod = watch('payment_method_id');
  const watchedDeliveryType = watch('delivery_type_id');

  // Update selected delivery type when form changes
  React.useEffect(() => {
    if (watchedDeliveryType && deliveryTypes) {
      const deliveryType = deliveryTypes.find(dt => dt.id === watchedDeliveryType);
      setSelectedDeliveryType(deliveryType);
    }
  }, [watchedDeliveryType, deliveryTypes]);

  const onSubmit = (data: OrderFormData) => {
    // Validate required fields
    if (!data.payment_method_id) {
      alert('Te rugăm să selectezi o metodă de plată.');
      return;
    }
    
    if (!data.delivery_type_id) {
      alert('Te rugăm să selectezi o metodă de livrare.');
      return;
    }
    
    // For now, just navigate to confirmation page with order data
    const orderData = {
      ...data,
      items,
      total: getTotalPrice(),
      deliveryType: selectedDeliveryType,
      paymentMethod: paymentMethods?.find(pm => pm.id === data.payment_method_id)
    };
    
    // Store order data in sessionStorage for confirmation page
    sessionStorage.setItem('orderData', JSON.stringify(orderData));
    
    // Clear cart and navigate to confirmation
    clearCart();
    navigate('/order-confirmation');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Coșul tău este gol
            </h1>
            <p className="text-gray-600 mb-6">
              Nu poți finaliza o comandă fără produse în coș.
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/cart')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la Coș
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Finalizează Comanda
          </h1>
          <p className="text-gray-600 mt-2">
            Completează informațiile pentru a finaliza comanda
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Informații Client
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prenume *
                </label>
                <Input
                  {...register('prenume', { required: 'Prenumele este obligatoriu' })}
                  placeholder="Prenumele tău"
                  error={errors.prenume?.message}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nume *
                </label>
                <Input
                  {...register('nume', { required: 'Numele este obligatoriu' })}
                  placeholder="Numele tău"
                  error={errors.nume?.message}
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-600" />
              Metoda de Plată
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selectează metoda de plată *
              </label>
              <Select
                options={paymentMethods?.map(pm => ({
                  value: pm.id.toString(),
                  label: pm.name
                })) || []}
                value={watchedPaymentMethod?.toString() || ''}
                onChange={(value) => {
                  setValue('payment_method_id', parseInt(value));
                }}
                placeholder="Alege metoda de plată"
              />
              {errors.payment_method_id && (
                <p className="text-red-500 text-sm mt-1">{errors.payment_method_id.message}</p>
              )}
            </div>
          </div>

          {/* Delivery Method */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-orange-600" />
              Metoda de Livrare
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selectează metoda de livrare *
                </label>
                <Select
                  options={deliveryTypes?.map(dt => ({
                    value: dt.id.toString(),
                    label: dt.denumire
                  })) || []}
                  value={watchedDeliveryType?.toString() || ''}
                  onChange={(value) => {
                    setValue('delivery_type_id', parseInt(value));
                  }}
                  placeholder="Alege metoda de livrare"
                />
                {errors.delivery_type_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.delivery_type_id.message}</p>
                )}
              </div>

              {/* Address field - only show if home delivery is selected */}
              {selectedDeliveryType && selectedDeliveryType.denumire.toLowerCase().includes('livrare') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Adresa de livrare *
                  </label>
                  <Input
                    {...register('address', { 
                      required: selectedDeliveryType.denumire.toLowerCase().includes('livrare') 
                        ? 'Adresa este obligatorie pentru livrare' 
                        : false 
                    })}
                    placeholder="Strada, numărul, orașul, codul poștal"
                    error={errors.address?.message}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Sumar Comandă
            </h2>
            
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <span className="font-medium">{item.quantity} x {item.nume}</span>
                    <span className="text-gray-500 ml-2">({item.pret} RON/{item.unitate_denumire})</span>
                  </div>
                  <span className="font-semibold">
                    {item.quantity * item.pret} RON
                  </span>
                </div>
              ))}
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {getTotalPrice()} RON
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="px-8 py-3"
            >
              {isSubmitting ? 'Se procesează...' : 'Finalizează Comanda'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm; 