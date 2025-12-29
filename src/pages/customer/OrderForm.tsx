import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { usePublishedList } from '@/hooks/useLists';
import { useListDeliveryTypes } from '@/hooks/useLists';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useCartStore } from '@/stores/cartStore';
import { ArrowLeft, User, CreditCard, Truck, MapPin, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { PaymentTypeIcon } from '@/utils/paymentTypes';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { requiresAddress, getDeliveryTax } from '@/utils/delivery';
import { useBusinessDetailsSingle } from '@/hooks/useBusinessDetails';
import { components } from '@/utils/theme';
import { PHONE_REGEX } from '@/utils/validation';
import { useCreateOrder } from '@/hooks/useOrders';
import { OrderCreate } from '@/types/api';
import { formatOrderText as formatOrderTextUtil } from '@/utils/orderFormatter';
import Modal from '@/components/ui/Modal';

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
  const { items, getTotalPrice, clearCart, removeItem } = useCartStore();

  // Get the current published list and list-specific delivery types
  const { data: publishedList, isLoading: isLoadingList } = usePublishedList();
  const { data: listDeliveryTypes, isLoading: isLoadingDeliveryTypes } = useListDeliveryTypes(publishedList?.id || 0);
  const { data: paymentMethods } = usePaymentMethods();
  const { data: businessDetails } = useBusinessDetailsSingle();

  const [selectedDeliveryType, setSelectedDeliveryType] = useState<any>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [outOfStockModalOpen, setOutOfStockModalOpen] = useState(false);
  const [outOfStockProducts, setOutOfStockProducts] = useState<Array<{ id: number; nume: string }>>([]);
  const [serverErrorModalOpen, setServerErrorModalOpen] = useState(false);

  // Prepare order creation
  const createOrderMutation = useCreateOrder();

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
  // No client-side duplicate detection; backend enforces duplicates now

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


  // Parse error response to extract out-of-stock product IDs
  const parseOutOfStockProducts = (error: any): number[] => {
    const productIds: number[] = [];
    
    try {
      const errorDetail = error?.response?.data?.detail;
      if (typeof errorDetail === 'string') {
        // Try to extract product IDs from error message like "Insufficient stock for product 1 in list 15"
        const matches = errorDetail.match(/product\s+(\d+)/gi);
        if (matches) {
          matches.forEach(match => {
            const idMatch = match.match(/\d+/);
            if (idMatch) {
              const productId = parseInt(idMatch[0], 10);
              if (!productIds.includes(productId)) {
                productIds.push(productId);
              }
            }
          });
        }
      } else if (Array.isArray(errorDetail)) {
        // Handle array of errors
        errorDetail.forEach((err: any) => {
          if (err?.loc && Array.isArray(err.loc) && err.loc.includes('items')) {
            // Try to extract product ID from validation error
            const productIdMatch = err.msg?.match(/product\s+(\d+)/i);
            if (productIdMatch) {
              const productId = parseInt(productIdMatch[1], 10);
              if (!productIds.includes(productId)) {
                productIds.push(productId);
              }
            }
          }
        });
      }
    } catch (e) {
      console.error('Error parsing out-of-stock products:', e);
    }
    
    return productIds;
  };

  const submitOrderToServer = async (orderData: ReturnType<typeof buildOrderDataForSession>, source?: string): Promise<{ success: boolean; status?: number; outOfStockProductIds?: number[] }> => {
    if (!publishedList) {
      return { success: false };
    }

    const orderCreateData: OrderCreate = {
      nume_client: `${orderData.prenume} ${orderData.nume}`.trim(),
      data_plasarii: new Date().toISOString(),
      liste_id: publishedList.id,
      delivery_type_id: orderData.delivery_type_id!,
      payment_method_id: orderData.payment_method_id!,
      delivery_address: orderData.address || undefined,
      order_notes: orderData.observatii || undefined,
      phone_number: orderData.phone_number || undefined,
      items: orderData.items.map((item) => ({
        produse_id: item.id,
        pret_produs: item.pret,
        cantitate_produs: item.quantity,
        unitati_id: item.unitati_id,
      })),
    };

    try {
      await createOrderMutation.mutateAsync({ orderData: orderCreateData, source });
      return { success: true, status: 200 };
    } catch (error: any) {
      const status = error?.response?.status;
      
      if (status === 409) {
        // Duplicate order: treat as success (server handles duplicates)
        return { success: true, status: 409 };
      } else if (status === 400) {
        // Insufficient stock: extract product IDs
        const outOfStockProductIds = parseOutOfStockProducts(error);
        return { success: false, status: 400, outOfStockProductIds };
      } else if (status === 500 || status >= 500) {
        // Server error
        return { success: false, status: 500 };
      } else {
        // Other errors
        console.error('Failed to submit order to server:', error);
        return { success: false, status };
      }
    }
  };

  const buildOrderDataForSession = (data: OrderFormData) => {
    const subtotal = getTotalPrice();
    const deliveryTax = getDeliveryTax(selectedDeliveryType, businessDetails);
    const grandTotal = subtotal + deliveryTax;

    return {
      ...data,
      nume: data.nume?.trim() || '',
      prenume: data.prenume?.trim() || '',
      phone_number: data.phone_number?.trim() || null,
      address: data.address?.trim() || undefined,
      observatii: data.observatii?.trim() || undefined,
      items,
      subtotal,
      delivery_tax: deliveryTax,
      total: grandTotal,
      deliveryType: selectedDeliveryType,
      paymentMethod: paymentMethods?.find(pm => pm.id === data.payment_method_id) as
        | { id: number; name: string }
        | undefined,
    };
  };

  const onSubmit = async (data: OrderFormData) => {
    // Validate required fields
    if (!data.payment_method_id) {
      alert('Te rugăm să selectezi o metodă de plată.');
      return;
    }
    
    if (!data.delivery_type_id) {
      alert('Te rugăm să selectezi o metodă de livrare.');
      return;
    }

    const orderData = buildOrderDataForSession(data);
    setIsSubmittingOrder(true);

    // Submit the order to the server first (before opening WhatsApp)
    const result = await submitOrderToServer(orderData, 'whatsapp_button');

    setIsSubmittingOrder(false);

    // Handle different response statuses
    if (result.success && result.status && (result.status === 200 || result.status === 409)) {
      // Success or duplicate (treated as success)
      const whatsappText = encodeURIComponent(formatOrderTextUtil(orderData, { 
        includeSeparator: true,
        listDate: publishedList?.data
      }));
      const whatsappUrl = `https://wa.me/?text=${whatsappText}`;
      
      // Persist for confirmation page
      sessionStorage.setItem('orderData', JSON.stringify(orderData));

      // Clear cart
      clearCart();

      // Open WhatsApp using setTimeout(0) to preserve gesture context on iOS
      // This queues the open in the next event loop tick, which helps on iOS Safari
      setTimeout(() => {
        // Try to open in new window first
        const whatsappWindow = window.open(whatsappUrl, '_blank');
        if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed === 'undefined') {
          // Fallback: redirect directly (works on all platforms including iOS)
          window.location.href = whatsappUrl;
          return; // Don't navigate to confirmation if redirecting
        }

        // Navigate to confirmation page (only if window.open succeeded)
        navigate('/order-confirmation');
      }, 0);
    } else if (result.status === 400 && result.outOfStockProductIds && result.outOfStockProductIds.length > 0) {
      // Insufficient stock: show modal and remove products from cart
      const removedProducts = items
        .filter(item => result.outOfStockProductIds!.includes(item.id))
        .map(item => ({ id: item.id, nume: item.nume }));
      
      setOutOfStockProducts(removedProducts);
      
      // Remove out-of-stock products from cart
      result.outOfStockProductIds.forEach(productId => {
        removeItem(productId);
      });
      
      setOutOfStockModalOpen(true);
    } else if (result.status && (result.status === 500 || result.status >= 500)) {
      // Server error: show generic error message
      setServerErrorModalOpen(true);
    } else {
      // Other errors: show generic error
      console.error('Unexpected error during order submission');
      setServerErrorModalOpen(true);
    }
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
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Selectează metoda de plată *
              </label>
              <div className="space-y-2">
                {paymentMethods
                  ?.slice()
                  .sort((a, b) => a.description.localeCompare(b.description))
                  .map((pm) => {
                  const isSelected = watchedPaymentMethod === pm.id;
                  return (
                    <label
                      key={pm.id}
                      className={`
                        flex items-center p-2.5 rounded-lg border-2 cursor-pointer transition-all
                        ${isSelected 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="payment_method_id"
                        value={pm.id}
                        checked={isSelected}
                        onChange={(e) => {
                          setValue('payment_method_id', parseInt(e.target.value), { shouldValidate: true });
                        }}
                        className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 leading-tight">{pm.description}</span>
                        </div>
                        
                        {/* Business payment details for Revolut */}
                        {pm.payment_type_id === 4 && pm.required_data?.phone_number && (
                          <div className="mt-1.5 text-sm text-gray-600">
                            <span className="font-medium">{pm.required_data.phone_number}</span>
                          </div>
                        )}
                        
                        {/* Business payment details for Bank Transfer */}
                        {pm.payment_type_id === 5 && pm.required_data && (
                          <div className="mt-1.5 text-sm text-gray-600 space-y-0.5">
                            {pm.required_data.iban && (
                              <div>
                                <span className="font-medium text-xs sm:text-sm">
                                  IBAN: {pm.required_data.iban.replace(/\s+/g, '')}
                                </span>
                              </div>
                            )}
                            {pm.required_data.recipient_name && (
                              <div>
                                <span className="font-medium">Destinatar: {pm.required_data.recipient_name}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <PaymentTypeIcon 
                        paymentTypeId={pm.payment_type_id || 0} 
                        size={18}
                        className="flex-shrink-0 ml-3"
                      />
                    </label>
                  );
                })}
              </div>
              {errors.payment_method_id && (
                <p className="text-red-500 text-sm mt-2">{errors.payment_method_id.message}</p>
              )}
            </div>
          </div>

          {/* Delivery Method */}
          <div className={components.card.main + " p-6"}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-orange-600" />
              Metoda de Livrare
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Selectează metoda de livrare *
              </label>
              <div className="space-y-2">
                {listDeliveryTypes
                  ?.slice()
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((dt) => {
                  const isSelected = watchedDeliveryType === dt.id;
                  return (
                    <label
                      key={dt.id}
                      className={`
                        flex items-center p-2.5 rounded-lg border-2 cursor-pointer transition-all
                        ${isSelected 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="delivery_type_id"
                        value={dt.id}
                        checked={isSelected}
                        onChange={(e) => {
                          setValue('delivery_type_id', parseInt(e.target.value), { shouldValidate: true });
                        }}
                        className="mr-3 h-4 w-4 text-orange-600 focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 leading-tight">{dt.denumire}</span>
                        {dt.description && (
                          <div className="mt-1 text-sm text-gray-600">
                            {dt.description}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.delivery_type_id && (
                <p className="text-red-500 text-sm mt-2">{errors.delivery_type_id.message}</p>
              )}

              {/* Address field - only show if delivery type requires address */}
              {selectedDeliveryType && requiresAddress(selectedDeliveryType) && (
                <div className="mt-4">
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
          <div className="flex justify-center">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || isSubmittingOrder}
              className={components.button.primary("px-8 py-3")}
            >
              {isSubmitting || isSubmittingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Se procesează...
                </>
              ) : (
                'Trimite comanda pe Whatsapp'
              )}
            </Button>
          </div>
        </form>

        {/* Out of Stock Modal */}
        <Modal
          isOpen={outOfStockModalOpen}
          onClose={() => setOutOfStockModalOpen(false)}
          title="Produse indisponibile"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-orange-50 border border-orange-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-orange-800">
                  Următoarele produse nu mai sunt disponibile și au fost eliminate automat din coșul tău:
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              {outOfStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <span className="font-medium text-gray-900">{product.nume}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="primary"
                onClick={() => {
                  setOutOfStockModalOpen(false);
                  // If cart is now empty, navigate to products page
                  if (items.length === 0) {
                    navigate('/');
                  }
                }}
                className="w-full"
              >
                Am înțeles
              </Button>
            </div>
          </div>
        </Modal>

        {/* Server Error Modal */}
        <Modal
          isOpen={serverErrorModalOpen}
          onClose={() => setServerErrorModalOpen(false)}
          title="Eroare la procesarea comenzii"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-800">
                  Serverul întâmpină probleme tehnice în acest moment. Te rugăm să încerci din nou mai târziu.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="primary"
                onClick={() => setServerErrorModalOpen(false)}
                className="w-full"
              >
                Am înțeles
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default OrderForm;
