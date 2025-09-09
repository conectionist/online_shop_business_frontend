import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { usePublishedList } from '@/hooks/useLists';
import { useListDeliveryTypes } from '@/hooks/useLists';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useCartStore } from '@/stores/cartStore';
import { ArrowLeft, User, CreditCard, Truck, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { requiresAddress, getDeliveryTax } from '@/utils/delivery';
import { useBusinessDetailsSingle } from '@/hooks/useBusinessDetails';
import { components } from '@/utils/theme';
import { PHONE_REGEX } from '@/utils/validation';

interface OrderFormData {
  nume: string;
  prenume: string;
  payment_method_id: number | null;
  delivery_type_id: number | null;
  address?: string;
  observatii?: string;
  phone_number?: string;
}

const OrderForm: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();

  // Get the current published list and list-specific delivery types
  const { data: publishedList, isLoading: isLoadingList } = usePublishedList();
  const { data: listDeliveryTypes, isLoading: isLoadingDeliveryTypes } = useListDeliveryTypes(publishedList?.id || 0);
  const { data: paymentMethods } = usePaymentMethods();
  const { data: businessDetails } = useBusinessDetailsSingle();

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
      address: '',
      phone_number: ''
    }
  });

  const watchedPaymentMethod = watch('payment_method_id');
  const watchedDeliveryType = watch('delivery_type_id');

  // Update selected delivery type when form changes
  React.useEffect(() => {
    if (watchedDeliveryType && listDeliveryTypes) {
      const deliveryType = listDeliveryTypes.find(dt => dt.id === watchedDeliveryType);
      setSelectedDeliveryType(deliveryType);
    }
  }, [watchedDeliveryType, listDeliveryTypes]);

  // Show loading state while fetching data
  if (isLoadingList || isLoadingDeliveryTypes) {
    return (
      <div className={components.page.containerLarge}>
        <div className="max-w-2xl mx-auto px-4">
          <div className={components.card.main + " p-8 text-center"}>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Se încarcă...
            </h1>
            <p className="text-gray-600">
              Se încarcă opțiunile de livrare și plată.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no published list
  if (!publishedList) {
    return (
      <div className={components.page.containerLarge}>
        <div className="max-w-2xl mx-auto px-4">
          <div className={components.card.main + " p-8 text-center"}>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Nu se poate finaliza comanda
            </h1>
            <p className="text-gray-600 mb-6">
              Nu s-a găsit o listă publicată.
            </p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/')}
              className={components.button.primary()}
            >
              Înapoi la Produse
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

    const subtotal = getTotalPrice();
    const deliveryTax = getDeliveryTax(selectedDeliveryType, businessDetails);
    const grandTotal = subtotal + deliveryTax;
    
    // For now, just navigate to confirmation page with order data
    const orderData = {
      ...data,
      // Convert empty string to null for phone_number as per backend requirements
      phone_number: data.phone_number?.trim() || null,
      items,
      subtotal,
      delivery_tax: deliveryTax,
      total: grandTotal,
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
      <div className={components.page.containerLarge}>
        <div className="max-w-2xl mx-auto px-4">
          <div className={components.card.main + " p-8 text-center"}>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Coșul tău este gol
            </h1>
            <p className="text-gray-600 mb-6">
              Nu poți finaliza o comandă fără produse în coș.
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
    );
  }

  const subtotal = getTotalPrice();
  const deliveryTax = getDeliveryTax(selectedDeliveryType, businessDetails);
  const grandTotal = subtotal + deliveryTax;

  return (
    <div className={components.page.container}>
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className={components.card.header + " p-6 mb-6"}>
          <div className="flex items-center space-x-3 mb-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/cart')}
              className={components.interactive.backButton}
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
          <div className={components.card.main + " p-6"}>
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
                  autoComplete="given-name"
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
                  autoComplete="family-name"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                Număr de telefon (opțional)
              </label>
              <Input
                {...register('phone_number', {
                  pattern: {
                    value: PHONE_REGEX,
                    message: 'Numărul de telefon trebuie să conțină 7-20 cifre cu prefix opțional +'
                  }
                })}
                placeholder="0741234567 sau +40741234567"
                error={errors.phone_number?.message}
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className={components.card.main + " p-6"}>
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
          <div className={components.card.main + " p-6"}>
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
                  options={listDeliveryTypes?.map(dt => ({
                    value: dt.id.toString(),
                    label: dt.description ? `${dt.denumire} — ${dt.description}` : dt.denumire
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

              {/* Address field - only show if delivery type requires address */}
              {selectedDeliveryType && requiresAddress(selectedDeliveryType) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Adresa de livrare
                  </label>
                  <Input
                    {...register('address', { 
                      required: requiresAddress(selectedDeliveryType)
                        ? 'Adresa este obligatorie pentru livrare' 
                        : false 
                    })}
                    placeholder="Strada, numărul, orașul, codul poștal"
                    error={errors.address?.message}
                    autoComplete="street-address"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Observații (Notes) */}
          <div className={components.card.main + " p-6"}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Observații pentru livrare sau comandă</label>
            <textarea
              {...register('observatii')}
              rows={3}
              placeholder="Scrie aici orice detalii speciale pentru livrare sau comandă..."
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Order Summary */}
          <div className={components.card.main + " p-6"}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Sumar Comandă
            </h2>
            
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <span className="font-medium">{item.quantity} x {item.nume}</span>
                  </div>
                  <span className="font-semibold">
                    {item.quantity * item.pret} RON
                  </span>
                </div>
              ))}
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Subtotal:</span>
                  <span className="text-sm font-medium">{subtotal} RON</span>
                </div>
                {selectedDeliveryType && requiresAddress(selectedDeliveryType) && businessDetails?.delivery_tax !== undefined && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-700">Taxă livrare:</span>
                    <span className="text-sm font-medium">{deliveryTax} RON</span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold text-blue-600">{grandTotal} RON</span>
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
              className={components.button.primary("px-8 py-3")}
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
