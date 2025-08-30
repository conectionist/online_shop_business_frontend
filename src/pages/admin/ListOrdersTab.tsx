import React, { useState } from 'react';
import { Package, Eye, Trash2 } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useDeleteOrder } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useDeliveryTypes } from '@/hooks/useDeliveryTypes';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { OrderRead } from '@/types/api';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/ToastContainer';


interface ListOrdersTabProps {
  listId: number;
}

const ListOrdersTab: React.FC<ListOrdersTabProps> = ({ listId }) => {
  const [selectedOrder, setSelectedOrder] = useState<OrderRead | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<OrderRead | null>(null);

  // Fetch orders for this specific list
  const { data: orders, isLoading, error } = useOrders({ liste_id: listId });
  const { data: products } = useProducts(); // For product names
  const { data: deliveryTypes } = useDeliveryTypes(); // For delivery method names
  const { data: paymentMethods } = usePaymentMethods(); // For payment method names
  const deleteOrderMutation = useDeleteOrder();
  const { showToast } = useToast();

  const handleViewOrder = (order: OrderRead) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleDeleteOrder = (order: OrderRead) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      await deleteOrderMutation.mutateAsync(orderToDelete.id);
      showToast({
        type: 'success',
        title: 'Comanda a fost ștearsă cu succes'
      });
      setShowDeleteModal(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      showToast({
        type: 'error',
        title: 'Eroare la ștergerea comenzii'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateTotal = (order: OrderRead) => {
    return order.items?.reduce((total, item) => total + (item.pret_produs * item.cantitate_produs), 0) || 0;
  };

  const getProductName = (productId: number) => {
    const product = products?.find(p => p.id === productId);
    return product?.nume || `Produs #${productId}`;
  };

  const getDeliveryTypeName = (deliveryTypeId: number) => {
    const deliveryType = deliveryTypes?.find(dt => dt.id === deliveryTypeId);
    return deliveryType?.denumire || `Tip livrare #${deliveryTypeId}`;
  };

  const getPaymentMethodName = (paymentMethodId: number) => {
    const paymentMethod = paymentMethods?.find(pm => pm.id === paymentMethodId);
    return paymentMethod?.name || `Metodă plată #${paymentMethodId}`;
  };

  const formatOrderText = (order: OrderRead) => {
    let orderText = `${order.nume_client}\n`;
    
    // Add items
    order.items?.forEach(item => {
      const productName = getProductName(item.produse_id);
      orderText += `${item.cantitate_produs} x ${productName} (${item.pret_produs} RON)\n`;
    });
    
    // Add total price
    orderText += `Total: ${calculateTotal(order)} RON\n`;
    
    // Add payment method
    const paymentMethodName = getPaymentMethodName(order.payment_method_id);
    orderText += `Plata ${paymentMethodName.toLowerCase()}.\n`;
    
    // Add delivery method
    const deliveryTypeName = getDeliveryTypeName(order.delivery_type_id);
    orderText += `${deliveryTypeName}.\n`;
    
    // Add address if it's home delivery
    if (order.delivery_address && getDeliveryTypeName(order.delivery_type_id).toLowerCase().includes('livrare')) {
      orderText += `Adresa: ${order.delivery_address}\n`;
    }
    
    // Add observatii if present
    if (order.order_notes) {
      orderText += `Observații: ${order.order_notes}\n`;
    }

    return orderText.trim();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Se încarcă comenzile..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Eroare la încărcarea comenzilor"
        message="Nu s-au putut încărca comenzile. Vă rugăm să încercați din nou."
      />
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nu există comenzi
          </h3>
          <p className="text-gray-500">
            Nu s-au plasat încă comenzi pentru această listă.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Comenzi pentru această listă
          </h2>
          <p className="text-gray-600">
            {orders.length} {orders.length === 1 ? 'comandă găsită' : 'comenzi găsite'}
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-6">
            <div className="space-y-4">
              {/* Order Display - Similar to OrderConfirmation */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <pre className="whitespace-pre-line text-sm font-mono text-gray-800">
                  {formatOrderText(order)}
                </pre>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-start space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleViewOrder(order)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Vezi
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDeleteOrder(order)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Șterge
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title={`Comanda ${selectedOrder?.id}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Client:</span>
                <p className="text-gray-900">{selectedOrder.nume_client}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Data plasării:</span>
                <p className="text-gray-900">{formatDate(selectedOrder.data_plasarii)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total:</span>
                <p className="text-gray-900 font-semibold">{calculateTotal(selectedOrder)} RON</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Produse:</span>
                <p className="text-gray-900">{selectedOrder.items?.length || 0}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Metoda de plată:</span>
                <p className="text-gray-900">{getPaymentMethodName(selectedOrder.payment_method_id)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Metoda de livrare:</span>
                <p className="text-gray-900">{getDeliveryTypeName(selectedOrder.delivery_type_id)}</p>
              </div>
            </div>

            {selectedOrder.delivery_address && (
              <div>
                <span className="font-medium text-gray-700">Adresa de livrare:</span>
                <p className="text-gray-900 mt-1">{selectedOrder.delivery_address}</p>
              </div>
            )}

            {selectedOrder.order_notes && (
              <div>
                <span className="font-medium text-gray-700">Observații:</span>
                <p className="text-gray-900 mt-1">{selectedOrder.order_notes}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Produse comandate:</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
                    <span className="text-gray-900">
                      {item.cantitate_produs} x {getProductName(item.produse_id)}
                    </span>
                    <span className="text-gray-700 font-medium">
                      {item.pret_produs * item.cantitate_produs} RON
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmă ștergerea"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Ești sigur că vrei să ștergi comanda pentru clientul{' '}
            <span className="font-medium">{orderToDelete?.nume_client}</span>?
          </p>
          <p className="text-sm text-gray-500">
            Această acțiune nu poate fi anulată.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Anulează
            </Button>
            <Button
              variant="primary"
              onClick={confirmDeleteOrder}
              disabled={deleteOrderMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteOrderMutation.isPending ? 'Se șterge...' : 'Șterge'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ListOrdersTab;
