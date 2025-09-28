import React, { useRef, useState } from 'react';
import { Package, Eye, Trash2, MoreVertical, Printer, FileText, Edit, Info } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useDeleteOrder, useUpdateOrder } from '@/hooks/useOrders';
import { useListProductsOrdered } from '@/hooks/useLists';
import { useDeliveryTypes } from '@/hooks/useDeliveryTypes';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useBusinessDetailsSingle } from '@/hooks/useBusinessDetails';
import { OrderRead } from '@/types/api';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/ToastContainer';
import { getDeliveryTax } from '@/utils/delivery';
import { formatOrderText as formatOrderTextUtil } from '@/utils/orderFormatter';
import OrdersPDF from '@/components/features/admin/OrdersPDF';
import { EditOrderForm } from '@/components/features/admin/EditOrderForm';
import { pdf } from '@react-pdf/renderer';


interface ListOrdersTabProps {
  listId: number;
}

const ListOrdersTab: React.FC<ListOrdersTabProps> = ({ listId }) => {
  const [selectedOrder, setSelectedOrder] = useState<OrderRead | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<OrderRead | null>(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<OrderRead | null>(null);

  // Local UI state
  const [showExtraOptions, setShowExtraOptions] = useState(false);
  const [groupByDelivery, setGroupByDelivery] = useState(true);
  const [sortBy, setSortBy] = useState<'chronological' | 'alphabetical'>('chronological');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [mergeSimilar, setMergeSimilar] = useState(false);
  const [multiSelectEnabled, setMultiSelectEnabled] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(new Set());
  const [showMergeInfo, setShowMergeInfo] = useState(false);
  const mergeInfoRef = useRef<HTMLDivElement | null>(null);

  // Fetch orders for this specific list
  const { data: orders, isLoading, error } = useOrders(
    mergeSimilar ? { liste_id: listId, merge_similar: true } : { liste_id: listId }
  );
  const { data: listProductsData } = useListProductsOrdered(listId); // List-scoped products
  const { data: deliveryTypes } = useDeliveryTypes(); // For delivery method names
  const { data: paymentMethods } = usePaymentMethods(); // For payment method names
  const { data: businessDetails } = useBusinessDetailsSingle(); // For delivery tax calculation
  const deleteOrderMutation = useDeleteOrder();
  const updateOrderMutation = useUpdateOrder();
  const { showToast } = useToast();

  // Sort orders based on user preferences
  const sortedOrders = React.useMemo(() => {
    if (!orders || !deliveryTypes) return [];
    
    // If grouping is disabled, sort all orders globally
    if (!groupByDelivery) {
      return [...orders].sort((a, b) => {
        let comparison = 0;
        
        if (sortBy === 'chronological') {
          // Sort by date (data_plasarii)
          const dateA = new Date(a.data_plasarii).getTime();
          const dateB = new Date(b.data_plasarii).getTime();
          comparison = dateA - dateB;
        } else if (sortBy === 'alphabetical') {
          // Sort by customer name
          comparison = a.nume_client.localeCompare(b.nume_client, 'ro-RO');
        }
        
        // Apply sort order (asc/desc)
        if (sortOrder === 'desc') {
          comparison = -comparison;
        }
        
        return comparison;
      });
    }
    
    // If grouping is enabled, don't sort globally - sorting will be done within groups
    return [...orders];
  }, [orders, deliveryTypes, sortBy, sortOrder, groupByDelivery]);

  // Flatten list products for easy access
  const listProducts = React.useMemo(() => {
    if (!listProductsData?.categories) return [] as Array<{ id: number; nume: string; pret: number; unitati_id: number; category_id?: number }>;
    return listProductsData.categories.flatMap((category: any) =>
      (category.products || []).map((product: { id: number; nume: string; pret: number; unitati_id: number }) => ({
        ...product,
        category_id: category.id,
      }))
    );
  }, [listProductsData]);

  // Calculate total quantities for each product across all orders
  const orderTotals = React.useMemo(() => {
    if (!orders || !listProducts) return {};
    
    const totals: { [productId: number]: { name: string; quantity: number } } = {};
    
    orders.forEach(order => {
      order.items?.forEach(item => {
        const product = listProducts.find((p: { id: number; nume: string }) => p.id === item.produse_id);
        if (product) {
          if (!totals[item.produse_id]) {
            totals[item.produse_id] = {
              name: product.nume,
              quantity: 0
            };
          }
          totals[item.produse_id].quantity += item.cantitate_produs;
        }
      });
    });
    
    return totals;
  }, [orders, listProducts]);

  const handleViewOrder = (order: OrderRead) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleDeleteOrder = (order: OrderRead) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const handleEditOrder = (order: OrderRead) => {
    setOrderToEdit(order);
    setShowEditModal(true);
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
    const subtotal = order.items?.reduce((total, item) => total + (item.pret_produs * item.cantitate_produs), 0) || 0;
    const deliveryType = deliveryTypes?.find(dt => dt.id === order.delivery_type_id);
    const deliveryTax = getDeliveryTax(deliveryType, businessDetails);
    return subtotal + deliveryTax;
  };

  const getProductName = (productId: number) => {
    const product = listProducts?.find((p: { id: number; nume: string }) => p.id === productId);
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
    return formatOrderTextUtil(order, {
      getProductName,
      getPaymentMethodName,
      deliveryTypes,
      businessDetails
    });
  };



  const toggleDropdown = () => {
    setOpenDropdown(!openDropdown);
  };

  const closeDropdown = () => {
    setOpenDropdown(false);
  };

  const handlePrintList = () => {
    closeDropdown();
    
    // Determine which orders to include based on multiselect
    const ordersForActions = multiSelectEnabled && selectedOrderIds.size > 0
      ? sortedOrders.filter(o => selectedOrderIds.has(o.id))
      : sortedOrders;

    if (multiSelectEnabled && selectedOrderIds.size === 0) {
      showToast({
        type: 'warning',
        title: 'Selectați comenzi',
        message: 'Nu ați selectat nicio comandă pentru tipărire.'
      });
      return;
    }

    let printContent = '';
    
    if (groupByDelivery) {
      // Group orders by delivery type ID
      const ordersByDeliveryTypeId = ordersForActions.reduce((groups, order) => {
        const key = order.delivery_type_id;
        if (!groups[key]) {
          groups[key] = [] as typeof sortedOrders;
        }
        (groups[key] as typeof sortedOrders).push(order);
        return groups;
      }, {} as Record<number, typeof sortedOrders>);

      // Sort delivery types by order_index (same as display)
      const sortedDeliveryTypes = (deliveryTypes || []).slice().sort((a, b) => a.order_index - b.order_index);

      // Create a formatted print view with grouping
      printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lista Comenzi - ${new Date().toLocaleDateString('ro-RO')}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; font-size: 16px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { margin: 0; color: #333; font-size: 28px; }
            .delivery-group { margin-bottom: 40px; break-inside: avoid; page-break-inside: avoid; }
            .delivery-group + .delivery-group { break-before: page; page-break-before: always; }
            .delivery-group.first-group { break-before: auto; page-break-before: auto; }
            .delivery-header { border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 20px; }
            .delivery-title { font-size: 22px; font-weight: bold; color: #333; margin: 0; }
            .delivery-count { font-size: 16px; color: #666; margin: 2px 0 0 0; }
            .order { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 8px; break-inside: avoid; page-break-inside: avoid; }
            .order-content { background: #f9f9f9; padding: 15px; border-radius: 5px; font-family: monospace; white-space: pre-line; }
            @media print { body { margin: 15px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lista Comenzi ${new Date().toLocaleDateString('ro-RO')}</h1>
          </div>
          
          ${ordersForActions && ordersForActions.length > 0 ? 
            sortedDeliveryTypes
              .filter(dt => ordersByDeliveryTypeId[dt.id] && ordersByDeliveryTypeId[dt.id].length > 0)
              .map((dt, groupIndex) => `
              <div class="delivery-group ${groupIndex === 0 ? 'first-group' : ''}">
                <div class="delivery-header">
                  <h2 class="delivery-title">${dt.denumire}</h2>
                  <p class="delivery-count">${ordersByDeliveryTypeId[dt.id].length} ${ordersByDeliveryTypeId[dt.id].length === 1 ? 'comandă' : 'comenzi'}</p>
                </div>
                ${ordersByDeliveryTypeId[dt.id]
                  .sort((a, b) => {
                    let comparison = 0;
                    
                    if (sortBy === 'chronological') {
                      // Sort by date (data_plasarii)
                      const dateA = new Date(a.data_plasarii).getTime();
                      const dateB = new Date(b.data_plasarii).getTime();
                      comparison = dateA - dateB;
                    } else if (sortBy === 'alphabetical') {
                      // Sort by customer name
                      comparison = a.nume_client.localeCompare(b.nume_client, 'ro-RO');
                    }
                    
                    // Apply sort order (asc/desc)
                    if (sortOrder === 'desc') {
                      comparison = -comparison;
                    }
                    
                    return comparison;
                  })
                  .map((order) => `
                  <div class="order">
                    <div class="order-content">${formatOrderText(order)}</div>
                  </div>
                `).join('')}
              </div>
            `).join('') : 
            '<p>Nu există comenzi pentru această listă.</p>'}
        </body>
      </html>
    `;
    } else {
      // Create a formatted print view without grouping
      printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lista Comenzi - ${new Date().toLocaleDateString('ro-RO')}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; font-size: 16px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { margin: 0; color: #333; font-size: 28px; }
            .order { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 8px; break-inside: avoid; page-break-inside: avoid; }
            .order-content { background: #f9f9f9; padding: 15px; border-radius: 5px; font-family: monospace; white-space: pre-line; }
            @media print { body { margin: 15px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Lista Comenzi ${new Date().toLocaleDateString('ro-RO')}</h1>
          </div>
          
          ${ordersForActions && ordersForActions.length > 0 ? 
            ordersForActions
              .sort((a, b) => {
                let comparison = 0;
                
                if (sortBy === 'chronological') {
                  // Sort by date (data_plasarii)
                  const dateA = new Date(a.data_plasarii).getTime();
                  const dateB = new Date(b.data_plasarii).getTime();
                  comparison = dateA - dateB;
                } else if (sortBy === 'alphabetical') {
                  // Sort by customer name
                  comparison = a.nume_client.localeCompare(b.nume_client, 'ro-RO');
                }
                
                // Apply sort order (asc/desc)
                if (sortOrder === 'desc') {
                  comparison = -comparison;
                }
                
                return comparison;
              })
              .map((order) => `
              <div class="order">
                <div class="order-content">${formatOrderText(order)}</div>
              </div>
            `).join('') : 
            '<p>Nu există comenzi pentru această listă.</p>'}
        </body>
      </html>
    `;
    }

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
      // Determine which orders to include based on multiselect
      const ordersForActions = multiSelectEnabled && selectedOrderIds.size > 0
        ? sortedOrders.filter(o => selectedOrderIds.has(o.id))
        : sortedOrders;

      if (multiSelectEnabled && selectedOrderIds.size === 0) {
        showToast({
          type: 'warning',
          title: 'Selectați comenzi',
          message: 'Nu ați selectat nicio comandă pentru export PDF.'
        });
        return;
      }

      // Create PDF document using react-pdf/renderer
      const pdfDoc = (
        <OrdersPDF
          orders={ordersForActions || []}
          deliveryTypes={deliveryTypes || []}
          getProductName={getProductName}
          getPaymentMethodName={getPaymentMethodName}
          businessDetails={businessDetails}
          groupByDelivery={groupByDelivery}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      );
      
      // Generate PDF blob
      const blob = await pdf(pdfDoc).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lista-comenzi-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast({
        type: 'error',
        title: 'Eroare la generarea PDF-ului',
        message: 'Vă rugăm să încercați din nou.'
      });
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
      // Close merge info popover when clicking outside
      if (showMergeInfo) {
        const target = event.target as Node;
        if (mergeInfoRef.current && !mergeInfoRef.current.contains(target)) {
          setShowMergeInfo(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown, showMergeInfo]);

  // Close popover on Escape
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowMergeInfo(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
      {/* Extra Options Toggle */}
      <div className="mb-4">
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-800">
                Opțiuni avansate
              </span>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                4 opțiuni
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowExtraOptions(!showExtraOptions)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              showExtraOptions ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            aria-label="Toggle opțiuni avansate"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showExtraOptions ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        {/* Extra Options Group - only shown when toggle is on */}
        {showExtraOptions && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-3">
              {/* Group by Delivery Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  id="group-by-delivery-toggle"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={groupByDelivery}
                  onChange={(e) => setGroupByDelivery(e.target.checked)}
                />
                <label htmlFor="group-by-delivery-toggle" className="text-sm text-gray-700 select-none cursor-pointer">
                  Grupează după metoda de livrare
                </label>
              </div>

              {/* Sorting Options */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sortează comenzi
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      id="sort-chronological"
                      type="radio"
                      name="sortBy"
                      value="chronological"
                      checked={sortBy === 'chronological'}
                      onChange={(e) => setSortBy(e.target.value as 'chronological' | 'alphabetical')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="sort-chronological" className="text-sm text-gray-700 select-none cursor-pointer">
                      Cronologic
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="sort-alphabetical"
                      type="radio"
                      name="sortBy"
                      value="alphabetical"
                      checked={sortBy === 'alphabetical'}
                      onChange={(e) => setSortBy(e.target.value as 'chronological' | 'alphabetical')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="sort-alphabetical" className="text-sm text-gray-700 select-none cursor-pointer">
                      Alfabetic
                    </label>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      id="sort-asc"
                      type="radio"
                      name="sortOrder"
                      value="asc"
                      checked={sortOrder === 'asc'}
                      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="sort-asc" className="text-sm text-gray-700 select-none cursor-pointer">
                      Crescător
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="sort-desc"
                      type="radio"
                      name="sortOrder"
                      value="desc"
                      checked={sortOrder === 'desc'}
                      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="sort-desc" className="text-sm text-gray-700 select-none cursor-pointer">
                      Descrescător
                    </label>
                  </div>
                </div>
              </div>

              {/* Merge Similar Orders */}
              <div className="flex items-center space-x-2" ref={mergeInfoRef}>
                <input
                  id="merge-similar-toggle"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={mergeSimilar}
                  onChange={(e) => setMergeSimilar(e.target.checked)}
                />
                <label htmlFor="merge-similar-toggle" className="text-sm text-gray-700 select-none cursor-pointer">
                  Unește comenzile acelorași clienți
                </label>
                <button
                  type="button"
                  onClick={() => setShowMergeInfo((v) => !v)}
                  className="inline-flex items-center justify-center p-0.5 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Deschide explicația pentru unirea comenzilor"
                >
                  <Info className="w-4 h-4 text-gray-400" />
                </button>
                {showMergeInfo && (
                  <div className="relative">
                    <div className="absolute z-50 mt-2 w-96 max-w-[28rem] rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-700 shadow-lg">
                      Dacă un client dă o comandă și apoi își amintește că mai vrea un produs sau mai multe și mai plasează o comandă, vor apărea două comenzi listate aici.
                      <br />
                      Bifând această căsuță, comenzile care aparțin aceluiași client pot fi unite într-una singură.
                    </div>
                  </div>
                )}
              </div>

              {/* Multi-select Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  id="multi-select-toggle"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={multiSelectEnabled}
                  onChange={(e) => {
                    setMultiSelectEnabled(e.target.checked);
                    setSelectedOrderIds(new Set());
                  }}
                />
                <label htmlFor="multi-select-toggle" className="text-sm text-gray-700 select-none cursor-pointer">
                  Selectare multiplă
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

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
      <div className="space-y-6">
        {(() => {
          if (groupByDelivery) {
            // Group orders by delivery type ID and iterate delivery types in backend order
            const ordersByDeliveryTypeId = sortedOrders.reduce((groups, order) => {
              const key = order.delivery_type_id;
              if (!groups[key]) {
                groups[key] = [] as typeof sortedOrders;
              }
              (groups[key] as typeof sortedOrders).push(order);
              return groups;
            }, {} as Record<number, typeof sortedOrders>);

            // Sort delivery types by their order_index (always maintain delivery method order)
            const sortedDeliveryTypes = (deliveryTypes || []).slice().sort((a, b) => a.order_index - b.order_index);

            return sortedDeliveryTypes
              .filter(dt => ordersByDeliveryTypeId[dt.id] && ordersByDeliveryTypeId[dt.id].length > 0)
              .map(dt => (
              <div key={dt.id} className="space-y-4">
                {/* Delivery Type Header */}
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {dt.denumire}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {ordersByDeliveryTypeId[dt.id].length} {ordersByDeliveryTypeId[dt.id].length === 1 ? 'comandă' : 'comenzi'}
                  </p>
                </div>
                
                {/* Orders for this delivery type - sorted within group */}
                <div className="space-y-4">
                  {ordersByDeliveryTypeId[dt.id]
                    .sort((a, b) => {
                      let comparison = 0;
                      
                      if (sortBy === 'chronological') {
                        // Sort by date (data_plasarii)
                        const dateA = new Date(a.data_plasarii).getTime();
                        const dateB = new Date(b.data_plasarii).getTime();
                        comparison = dateA - dateB;
                      } else if (sortBy === 'alphabetical') {
                        // Sort by customer name
                        comparison = a.nume_client.localeCompare(b.nume_client, 'ro-RO');
                      }
                      
                      // Apply sort order (asc/desc)
                      if (sortOrder === 'desc') {
                        comparison = -comparison;
                      }
                      
                      return comparison;
                    })
                    .map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="space-y-4">
                      {/* Order row with optional checkbox on the left */}
                      <div className="flex items-center">
                        {multiSelectEnabled && (
                          <div className="mr-3 self-center">
                            <input
                              aria-label="Selectează comanda"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={selectedOrderIds.has(order.id)}
                              onChange={(e) => {
                                setSelectedOrderIds(prev => {
                                  const next = new Set(prev);
                                  if (e.target.checked) {
                                    next.add(order.id);
                                  } else {
                                    next.delete(order.id);
                                  }
                                  return next;
                                });
                              }}
                            />
                          </div>
                        )}

                        {/* Order Display - Similar to OrderConfirmation */}
                        <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <pre className="whitespace-pre-line text-sm font-mono text-gray-800">
                            {formatOrderText(order)}
                          </pre>
                        </div>
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
                          onClick={() => handleEditOrder(order)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editează
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
            </div>
          ));
          } else {
            // Show orders without grouping - use the same detailed format as grouped
            return (
              <div className="space-y-4">
                {sortedOrders.map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="space-y-4">
                      {/* Order row with optional checkbox on the left */}
                      <div className="flex items-center">
                        {multiSelectEnabled && (
                          <div className="mr-3 self-center">
                            <input
                              aria-label="Selectează comanda"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={selectedOrderIds.has(order.id)}
                              onChange={(e) => {
                                const newSelectedIds = new Set(selectedOrderIds);
                                if (e.target.checked) {
                                  newSelectedIds.add(order.id);
                                } else {
                                  newSelectedIds.delete(order.id);
                                }
                                setSelectedOrderIds(newSelectedIds);
                              }}
                            />
                          </div>
                        )}

                        {/* Order Display - Same detailed format as grouped */}
                        <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <pre className="whitespace-pre-line text-sm font-mono text-gray-800">
                            {formatOrderText(order)}
                          </pre>
                        </div>
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
                          onClick={() => handleEditOrder(order)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editează
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
            );
          }
        })()}
      </div>

      {/* Order Totals Summary */}
      {Object.keys(orderTotals).length > 0 && (
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Total Comenzi per Produs
            </h3>
            <p className="text-sm text-gray-600">
              Suma totală comandată pentru fiecare produs din această listă
            </p>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(orderTotals)
                  .sort(([, a], [, b]) => b.quantity - a.quantity) // Sort by quantity descending
                  .map(([productId, product]) => (
                    <div key={productId} className="flex justify-between items-center bg-white px-3 py-2 rounded border">
                      <span className="font-medium text-gray-900">{product.name}</span>
                      <span className="text-blue-600 font-semibold">
                        {product.quantity}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Card>
      )}

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

            {/* Order Totals Breakdown */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-700 mb-2">Detalii preț:</h4>
              <div className="space-y-1 text-sm">
                {(() => {
                  const subtotal = selectedOrder.items?.reduce((total, item) => total + (item.pret_produs * item.cantitate_produs), 0) || 0;
                  const modalDeliveryType = deliveryTypes?.find(dt => dt.id === selectedOrder.delivery_type_id);
                  const deliveryTax = getDeliveryTax(modalDeliveryType, businessDetails);
                  
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal produse:</span>
                        <span className="font-medium">{subtotal} RON</span>
                      </div>
                      {deliveryTax > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Taxă livrare:</span>
                          <span className="font-medium">{deliveryTax} RON</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-gray-200 pt-1">
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="font-bold text-gray-900">{subtotal + deliveryTax} RON</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {selectedOrder.delivery_address && (
              <div>
                <span className="font-medium text-gray-700">Adresa de livrare:</span>
                <p className="text-gray-900 mt-1">{selectedOrder.delivery_address}</p>
              </div>
            )}

            {selectedOrder.phone_number && (
              <div>
                <span className="font-medium text-gray-700">Telefon:</span>
                <p className="text-gray-900 mt-1">{selectedOrder.phone_number}</p>
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

      {/* Edit Order Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Editează Comanda ${orderToEdit?.id}`}
        size="lg"
      >
        {orderToEdit && (
          <EditOrderForm
            order={orderToEdit}
            deliveryTypes={deliveryTypes || []}
            paymentMethods={paymentMethods || []}
            products={listProducts || []}
            businessDetails={businessDetails}
            onSave={async (updatedData) => {
              try {
                await updateOrderMutation.mutateAsync({
                  id: orderToEdit.id,
                  data: updatedData
                });
                showToast({
                  type: 'success',
                  title: 'Comanda a fost actualizată cu succes'
                });
                setShowEditModal(false);
              } catch (error) {
                console.error('Error updating order:', error);
                showToast({
                  type: 'error',
                  title: 'Eroare la actualizarea comenzii'
                });
              }
            }}
            onCancel={() => setShowEditModal(false)}
            isLoading={updateOrderMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
};

export default ListOrdersTab;
