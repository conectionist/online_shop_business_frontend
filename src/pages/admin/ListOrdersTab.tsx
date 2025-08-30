import React, { useState } from 'react';
import { Package, Eye, Trash2, MoreVertical, Printer, FileText } from 'lucide-react';
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
import { requiresAddress } from '@/utils/delivery';


interface ListOrdersTabProps {
  listId: number;
}

const ListOrdersTab: React.FC<ListOrdersTabProps> = ({ listId }) => {
  const [selectedOrder, setSelectedOrder] = useState<OrderRead | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<OrderRead | null>(null);
  const [openDropdown, setOpenDropdown] = useState(false);

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
    
    // Add delivery method and address
    const deliveryType = deliveryTypes?.find(dt => dt.id === order.delivery_type_id);
    if (deliveryType) {
      if (order.delivery_address && requiresAddress(deliveryType)) {
        // If address is provided, show clean delivery message
        orderText += `Livrare la adresa: ${order.delivery_address}\n`;
      } else {
        // If no address, show the original delivery method description
        orderText += `${deliveryType.denumire}.\n`;
      }
    }
    
    // Add observatii if present
    if (order.order_notes) {
      orderText += `Observații: ${order.order_notes}\n`;
    }

    return orderText.trim();
  };

  const toggleDropdown = () => {
    setOpenDropdown(!openDropdown);
  };

  const closeDropdown = () => {
    setOpenDropdown(false);
  };

  const handlePrintList = () => {
    closeDropdown();
    
    // Create a formatted print view
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lista Comenzi - ${listId}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { margin: 0; color: #333; }
            .header p { margin: 5px 0; color: #666; }
            .order { margin-bottom: 30px; page-break-inside: avoid; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .order-header { font-weight: bold; margin-bottom: 10px; color: #333; }
            .order-content { background: #f9f9f9; padding: 15px; border-radius: 5px; font-family: monospace; white-space: pre-line; }
            .order-details { margin-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .detail-item { display: flex; justify-content: space-between; }
            .detail-label { font-weight: bold; color: #555; }
            .detail-value { color: #333; }
            .total { font-weight: bold; font-size: 1.1em; color: #333; margin-top: 10px; text-align: right; }
            @media print {
              body { margin: 15px; }
              .order { border: 1px solid #ccc; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lista Comenzi</h1>
            <p>ID Lista: ${listId}</p>
            <p>Data generării: ${new Date().toLocaleDateString('ro-RO')}</p>
            <p>Total comenzi: ${orders?.length || 0}</p>
          </div>
          
          ${orders?.map((order) => `
            <div class="order">
              <div class="order-header">Comanda #${order.id} - ${order.nume_client}</div>
              <div class="order-content">${formatOrderText(order)}</div>
              <div class="order-details">
                <div class="detail-item">
                  <span class="detail-label">Data plasării:</span>
                  <span class="detail-value">${formatDate(order.data_plasarii)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Metoda de plată:</span>
                  <span class="detail-value">${getPaymentMethodName(order.payment_method_id)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Metoda de livrare:</span>
                  <span class="detail-value">${getDeliveryTypeName(order.delivery_type_id)}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Total produse:</span>
                  <span class="detail-value">${order.items?.length || 0}</span>
                </div>
              </div>
              <div class="total">Total: ${calculateTotal(order)} RON</div>
            </div>
          `).join('') || '<p>Nu există comenzi pentru această listă.</p>'}
        </body>
      </html>
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        // Close the window after printing
        printWindow.onafterprint = () => printWindow.close();
      };
    } else {
      // Fallback: print the current page
      window.print();
    }
  };

  const handleSaveAsPDF = async () => {
    closeDropdown();
    
    try {
      // Dynamic import of jsPDF to avoid build issues
      const { default: jsPDF } = await import('jspdf');
      
      // Create new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      
      let yPosition = margin;
      
      // Add header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Lista Comenzi', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`ID Lista: ${listId}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Data generării: ${new Date().toLocaleDateString('ro-RO')}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Total comenzi: ${orders?.length || 0}`, margin, yPosition);
      yPosition += 20;
      
      // Add orders
      if (orders && orders.length > 0) {
        orders.forEach((order, index) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 60) {
            pdf.addPage();
            yPosition = margin;
          }
          
          // Order header
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`Comanda #${order.id} - ${order.nume_client}`, margin, yPosition);
          yPosition += 8;
          
          // Order content
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const orderText = formatOrderText(order);
          const lines = pdf.splitTextToSize(orderText, contentWidth);
          
          // Add background for order content
          const textHeight = lines.length * 5;
          pdf.setFillColor(249, 249, 249);
          pdf.rect(margin, yPosition - 2, contentWidth, textHeight + 4, 'F');
          
          pdf.text(lines, margin + 2, yPosition + 2);
          yPosition += textHeight + 8;
          
          // Order details
          const details = [
            ['Data plasării:', formatDate(order.data_plasarii)],
            ['Metoda de plată:', getPaymentMethodName(order.payment_method_id)],
            ['Metoda de livrare:', getDeliveryTypeName(order.delivery_type_id)],
            ['Total produse:', `${order.items?.length || 0}`]
          ];
          
          details.forEach(([label, value]) => {
            if (yPosition > pageHeight - 40) {
              pdf.addPage();
              yPosition = margin;
            }
            
            pdf.setFont('helvetica', 'bold');
            pdf.text(label, margin, yPosition);
            pdf.setFont('helvetica', 'normal');
            pdf.text(value, margin + 60, yPosition);
            yPosition += 6;
          });
          
          // Total
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = margin;
          }
          
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`Total: ${calculateTotal(order)} RON`, pageWidth - margin, yPosition, { align: 'right' });
          yPosition += 20;
          
          // Add separator line
          if (index < orders.length - 1) {
            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 10;
          }
        });
      } else {
        pdf.setFontSize(12);
        pdf.text('Nu există comenzi pentru această listă.', margin, yPosition);
      }
      
      // Save the PDF
      pdf.save(`lista-comenzi-${listId}-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback: show error message
      alert('Eroare la generarea PDF-ului. Vă rugăm să încercați din nou.');
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        const target = event.target as Element;
        const dropdownElement = document.querySelector('[data-dropdown-id="orders-actions"]');
        
        if (dropdownElement && !dropdownElement.contains(target)) {
          closeDropdown();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

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
        
        {/* 3-dot Menu */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {openDropdown && (
            <div 
              className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
              data-dropdown-id="orders-actions"
            >
              {/* Print List Option */}
              <button
                onClick={handlePrintList}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <Printer className="w-4 h-4 mr-3 text-gray-400" />
                Tipareste Lista
              </button>

              {/* Save as PDF Option */}
              <button
                onClick={handleSaveAsPDF}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <FileText className="w-4 h-4 mr-3 text-gray-400" />
                Salveaza ca PDF
              </button>
            </div>
          )}
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
