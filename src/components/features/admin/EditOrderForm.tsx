import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { OrderRead, Product, DeliveryType, PaymentMethod, BusinessDetails, OrderItem } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { getDeliveryTax, requiresAddress } from '@/utils/delivery';
import { useAddOrderItem, useUpdateOrderItem, useRemoveOrderItem } from '@/hooks/useOrders';
import { Plus, Trash2, Minus } from 'lucide-react';

interface EditOrderFormProps {
  order: OrderRead;
  deliveryTypes: DeliveryType[];
  paymentMethods: PaymentMethod[];
  products: Product[];
  businessDetails: BusinessDetails | null;
  onSave: (data: {
    nume_client: string;
    order_notes?: string;
    delivery_type_id: number;
    payment_method_id: number;
    delivery_address?: string;
    phone_number?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

interface FormData {
  nume_client: string;
  order_notes: string;
  delivery_type_id: number;
  payment_method_id: number;
  delivery_address: string;
  phone_number: string;
}

export const EditOrderForm: React.FC<EditOrderFormProps> = ({
  order,
  deliveryTypes,
  paymentMethods,
  products,
  businessDetails,
  onSave,
  onCancel,
  isLoading
}) => {
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<DeliveryType | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(order.items || []);
  const [originalOrderItems, setOriginalOrderItems] = useState<OrderItem[]>(order.items || []);
  
  // Update orderItems when order changes
  useEffect(() => {
    setOrderItems(order.items || []);
    setOriginalOrderItems(order.items || []);
  }, [order.items]);

  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // Order item management hooks
  const addOrderItemMutation = useAddOrderItem();
  const updateOrderItemMutation = useUpdateOrderItem();
  const removeOrderItemMutation = useRemoveOrderItem();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<FormData>({
    defaultValues: {
      nume_client: order.nume_client,
      order_notes: order.order_notes || '',
      delivery_type_id: order.delivery_type_id,
      payment_method_id: order.payment_method_id,
      delivery_address: order.delivery_address || '',
      phone_number: order.phone_number || ''
    }
  });

  const watchedDeliveryType = watch('delivery_type_id');

  // Update selected delivery type when form changes
  useEffect(() => {
    if (watchedDeliveryType && deliveryTypes) {
      const deliveryType = deliveryTypes.find(dt => dt.id === watchedDeliveryType);
      setSelectedDeliveryType(deliveryType || null);
    }
  }, [watchedDeliveryType, deliveryTypes]);

  // Handle adding a product to the order (visual only until save)
  const handleAddProduct = (product: Product, quantity: number) => {
    const newItem: OrderItem = {
      comenzi_id: order.id,
      produse_id: product.id,
      pret_produs: product.pret,
      cantitate_produs: quantity,
      unitati_id: product.unitati_id
    };
    
    // Update local state only - no backend call yet
    setOrderItems(prev => [...prev, newItem]);
    setShowAddProductModal(false);
  };

  // Handle updating product quantity (visual only until save)
  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveProduct(productId);
      return;
    }

    // Update local state only - no backend call yet
    setOrderItems(prev => prev.map(item => 
      item.produse_id === productId 
        ? { ...item, cantitate_produs: newQuantity }
        : item
    ));
  };

  // Handle removing a product from the order (visual only until save)
  const handleRemoveProduct = (productId: number) => {
    // Update local state only - no backend call yet
    setOrderItems(prev => prev.filter(item => item.produse_id !== productId));
  };

  // Check if products have been modified
  const productsModified = () => {
    if (orderItems.length !== originalOrderItems.length) return true;
    
    // Check if any item has changed
    for (const currentItem of orderItems) {
      const originalItem = originalOrderItems.find(item => item.produse_id === currentItem.produse_id);
      if (!originalItem || 
          originalItem.cantitate_produs !== currentItem.cantitate_produs ||
          originalItem.pret_produs !== currentItem.pret_produs) {
        return true;
      }
    }
    
    // Check if any original item was removed
    for (const originalItem of originalOrderItems) {
      const currentItem = orderItems.find(item => item.produse_id === originalItem.produse_id);
      if (!currentItem) return true;
    }
    
    return false;
  };

  const onSubmit = async (data: FormData) => {
    try {
      // First, update the main order data
      await onSave({
        nume_client: data.nume_client,
        order_notes: data.order_notes || undefined,
        delivery_type_id: data.delivery_type_id,
        payment_method_id: data.payment_method_id,
        delivery_address: data.delivery_address || undefined,
        phone_number: data.phone_number || undefined
      });

      // Then handle product changes if any
      if (productsModified()) {
        // Find items to add (in current but not in original)
        const itemsToAdd = orderItems.filter(currentItem => 
          !originalOrderItems.some(originalItem => originalItem.produse_id === currentItem.produse_id)
        );

        // Find items to remove (in original but not in current)
        const itemsToRemove = originalOrderItems.filter(originalItem => 
          !orderItems.some(currentItem => currentItem.produse_id === originalItem.produse_id)
        );

        // Find items to update (in both but with different quantities)
        const itemsToUpdate = orderItems.filter(currentItem => {
          const originalItem = originalOrderItems.find(item => item.produse_id === currentItem.produse_id);
          return originalItem && originalItem.cantitate_produs !== currentItem.cantitate_produs;
        });

        // Apply all changes
        for (const item of itemsToAdd) {
          await addOrderItemMutation.mutateAsync({
            orderId: order.id,
            item: {
              produse_id: item.produse_id,
              pret_produs: item.pret_produs,
              cantitate_produs: item.cantitate_produs,
              unitati_id: item.unitati_id
            }
          });
        }

        for (const item of itemsToRemove) {
          await removeOrderItemMutation.mutateAsync({
            orderId: order.id,
            productId: item.produse_id
          });
        }

        for (const item of itemsToUpdate) {
          await updateOrderItemMutation.mutateAsync({
            orderId: order.id,
            productId: item.produse_id,
            item: {
              produse_id: item.produse_id,
              pret_produs: item.pret_produs,
              cantitate_produs: item.cantitate_produs,
              unitati_id: item.unitati_id
            }
          });
        }
      }
    } catch (error) {
      console.error('Error saving order changes:', error);
      throw error;
    }
  };

  // Calculate totals based on current order items
  const subtotal = orderItems.reduce((total, item) => total + (item.pret_produs * item.cantitate_produs), 0);
  const deliveryTax = getDeliveryTax(selectedDeliveryType, businessDetails);
  const grandTotal = subtotal + deliveryTax;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Informații Client</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nume Client *
          </label>
          <Input
            {...register('nume_client', { required: 'Numele clientului este obligatoriu' })}
            className={errors.nume_client ? 'border-red-300' : ''}
          />
          {errors.nume_client && (
            <p className="text-sm text-red-600 mt-1">{errors.nume_client.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefon
          </label>
          <Input
            {...register('phone_number')}
            placeholder="Ex: 0712345678"
          />
        </div>
      </div>

      {/* Delivery and Payment */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Livrare și Plată</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metoda de Livrare *
            </label>
            <Select
              value={watch('delivery_type_id').toString()}
              onChange={(value) => setValue('delivery_type_id', parseInt(value), { shouldDirty: true })}
              options={deliveryTypes.map(dt => ({
                value: dt.id.toString(),
                label: dt.denumire
              }))}
              className={errors.delivery_type_id ? 'border-red-300' : ''}
            />
            {errors.delivery_type_id && (
              <p className="text-sm text-red-600 mt-1">{errors.delivery_type_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metoda de Plată *
            </label>
            <Select
              value={watch('payment_method_id').toString()}
              onChange={(value) => setValue('payment_method_id', parseInt(value), { shouldDirty: true })}
              options={paymentMethods
                .slice()
                .sort((a, b) => a.description.localeCompare(b.description))
                .map(pm => ({
                value: pm.id.toString(),
                label: pm.name
              }))}
              className={errors.payment_method_id ? 'border-red-300' : ''}
            />
            {errors.payment_method_id && (
              <p className="text-sm text-red-600 mt-1">{errors.payment_method_id.message}</p>
            )}
          </div>
        </div>

        {/* Address field - only show if delivery type requires address */}
        {selectedDeliveryType && requiresAddress(selectedDeliveryType) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresa de Livrare *
            </label>
            <Input
              {...register('delivery_address', { 
                required: requiresAddress(selectedDeliveryType) ? 'Adresa de livrare este obligatorie' : false 
              })}
              placeholder="Adresa completă de livrare"
              className={errors.delivery_address ? 'border-red-300' : ''}
            />
            {errors.delivery_address && (
              <p className="text-sm text-red-600 mt-1">{errors.delivery_address.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Order Items (Editable) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Produse Comandate</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowAddProductModal(true)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adaugă Produs
          </Button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          {orderItems.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Nu există produse în această comandă. Adaugă produse pentru a continua.
            </p>
          ) : (
            <div className="space-y-3">
              {orderItems.map((item, index) => {
                const product = products.find(p => p.id === item.produse_id);
                return (
                  <div key={index} className="grid grid-cols-12 gap-4 items-center p-3 bg-white rounded-lg border border-gray-200">
                    {/* Product Info - Takes more space */}
                    <div className="col-span-5">
                      <div className="font-medium text-gray-900">
                        {product?.nume || `Produs #${item.produse_id}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        Preț: {item.pret_produs} RON
                      </div>
                    </div>
                    
                    {/* Quantity Controls - Compact */}
                    <div className="col-span-3 flex items-center justify-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.produse_id, item.cantitate_produs - 1)}
                        disabled={removeOrderItemMutation.isPending || updateOrderItemMutation.isPending}
                        className="p-1 h-8 w-8"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-medium w-8 text-center">
                        {item.cantitate_produs}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateQuantity(item.produse_id, item.cantitate_produs + 1)}
                        disabled={removeOrderItemMutation.isPending || updateOrderItemMutation.isPending}
                        className="p-1 h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Total Price - Center aligned */}
                    <div className="col-span-2 text-center">
                      <div className="font-semibold text-gray-900">
                        {item.cantitate_produs * item.pret_produs} RON
                      </div>
                    </div>
                    
                    {/* Delete Button - Minimal space */}
                    <div className="col-span-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveProduct(item.produse_id)}
                        disabled={removeOrderItemMutation.isPending}
                        className="p-1 h-10 w-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-8 w-8" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Order Totals */}
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Subtotal:</span>
              <span className="text-sm font-medium">{subtotal} RON</span>
            </div>
            {deliveryTax > 0 && (
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

      {/* Order Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observații
        </label>
        <textarea
          {...register('order_notes')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Observații suplimentare pentru comandă"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            // Revert all changes including product changes
            setOrderItems(originalOrderItems);
            onCancel();
          }}
          disabled={isLoading}
        >
          Anulează
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || (!isDirty && !productsModified())}
          loading={isLoading}
        >
          Salvează Modificările
        </Button>
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <AddProductModal
          products={products.filter(p => !orderItems.some(item => item.produse_id === p.id))}
          onAdd={handleAddProduct}
          onCancel={() => setShowAddProductModal(false)}
        />
      )}
    </form>
  );
};

// Add Product Modal Component
interface AddProductModalProps {
  products: Product[];
  onAdd: (product: Product, quantity: number) => void;
  onCancel: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ products, onAdd, onCancel }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [query, setQuery] = useState<string>('');

  const normalizeString = (value: string) =>
    (value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const normalizedQuery = normalizeString(query.trim());
  const filteredProducts = (normalizedQuery
    ? products.filter(p => normalizeString(p.nume || '').includes(normalizedQuery))
    : products
  ).slice().sort((a, b) => normalizeString(a.nume || '').localeCompare(normalizeString(b.nume || '')));

  const selectedProduct = products.find(p => p.id.toString() === selectedProductId);

  const handleSubmit = () => {
    if (!selectedProduct) return;
    onAdd(selectedProduct, quantity);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] isolation-isolate">
      <div className="bg-white rounded-lg p-6 w-full max-w-xs sm:max-w-sm mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Adaugă Produs</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caută produs
            </label>
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tastează pentru a filtra după nume"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alege din listă
            </label>
            <div className="border border-gray-300 rounded-md max-h-64 overflow-auto divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">Niciun produs găsit</div>
              ) : (
                filteredProducts.map(product => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => setSelectedProductId(product.id.toString())}
                    className={`w-full text-left p-3 hover:bg-blue-50 transition-colors ${
                      selectedProductId === product.id.toString() ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{product.nume}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700 select-none">Cantitate</span>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="p-0 h-9 w-9"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                aria-label="Scade cantitatea"
              >
                <Minus className="h-5 w-5" />
              </Button>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 text-center"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="p-0 h-9 w-9"
                onClick={() => setQuantity(prev => prev + 1)}
                aria-label="Crește cantitatea"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Anulează
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={!selectedProduct}
          >
            Adaugă
          </Button>
        </div>
      </div>
    </div>
  );
};

