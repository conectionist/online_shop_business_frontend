import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePublishedList } from '@/hooks/useLists';
import { useCreateOrder } from '@/hooks/useOrders';
import { OrderCreate } from '@/types/api';
import { requiresAddress } from '@/utils/delivery';
import { components } from '@/utils/theme';
import Footer from '@/components/layout/Footer';


interface OrderData {
  prenume: string;
  nume: string;
  payment_method_id: number;
  delivery_type_id: number;
  address?: string;
  observatii?: string;
  items: any[];
  subtotal?: number;
  delivery_tax?: number;
  total: number;
  deliveryType: any;
  paymentMethod: any;
}

const OrderConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [copied, setCopied] = useState(false);

  
  // Get the current published list for the order
  const { data: publishedList } = usePublishedList();
  const createOrderMutation = useCreateOrder();

  useEffect(() => {
    const storedOrderData = sessionStorage.getItem('orderData');
    if (storedOrderData) {
      const parsedData = JSON.parse(storedOrderData);
      setOrderData(parsedData);
    } else {
      // If no order data, redirect to home page
      navigate('/');
    }
  }, [navigate]);

  const formatOrderText = () => {
    if (!orderData) return '';

    let orderText = `${orderData.prenume} ${orderData.nume}\n`;
    
    // Add items
    orderData.items.forEach(item => {
      orderText += `${item.quantity} x ${item.nume} (${item.quantity * item.pret} RON)\n`;
    });
    
    // Add totals breakdown
    const subtotal = orderData.subtotal ?? orderData.items.reduce((t, it) => t + it.quantity * it.pret, 0);
    const deliveryTax = orderData.delivery_tax ?? 0;
    if (deliveryTax > 0) {
      orderText += `Subtotal: ${subtotal} RON\n`;
      orderText += `Taxă livrare: ${deliveryTax} RON\n`;
    }
    orderText += `Total: ${orderData.total} RON\n`;
    
    // Add payment method
    if (orderData.paymentMethod) {
      orderText += `Plata ${orderData.paymentMethod.name.toLowerCase()}.\n`;
    }
    
    // Add delivery method and address
    if (orderData.deliveryType) {
      if (orderData.address && requiresAddress(orderData.deliveryType)) {
        // If address is provided, show clean delivery message
        orderText += `Livrare la adresa: ${orderData.address}\n`;
      } else {
        // If no address, show the original delivery method description
        orderText += `${orderData.deliveryType.denumire}.\n`;
      }
    }
    

    
    // Add observatii if present
    if (orderData.observatii) {
      orderText += `Observații: ${orderData.observatii}\n`;
    }

    return orderText.trim();
  };

  const copyToClipboard = async () => {
    const orderText = formatOrderText();
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(orderText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers or when clipboard API is not available
        const textArea = document.createElement('textarea');
        textArea.value = orderText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          console.error('Failed to copy using fallback method');
          // Show a user-friendly error message
          alert('Nu s-a putut copia textul. Vă rugăm să selectați și copiați manual textul de mai sus.');
        }
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Show a user-friendly error message
      alert('Nu s-a putut copia textul. Vă rugăm să selectați și copiați manual textul de mai sus.');
    }
  };

  const submitOrderToServer = async () => {
    if (!orderData || !publishedList) {
      console.error('Order data or published list not available');
      return;
    }

    try {
      const orderCreateData: OrderCreate = {
        nume_client: `${orderData.prenume} ${orderData.nume}`,
        data_plasarii: new Date().toISOString(),
        liste_id: publishedList.id,
        delivery_type_id: orderData.delivery_type_id,
        payment_method_id: orderData.payment_method_id,
        delivery_address: orderData.address || undefined,
        order_notes: orderData.observatii || undefined,
        items: orderData.items.map(item => ({
          produse_id: item.id,
          pret_produs: item.pret,
          cantitate_produs: item.quantity,
          unitati_id: item.unitati_id,
        })),
      };

      await createOrderMutation.mutateAsync(orderCreateData);
      console.log('Order submitted successfully to server');
    } catch (error) {
      console.error('Failed to submit order to server:', error);
      // Don't show error to user as this is a background operation
      // The WhatsApp functionality will still work
    }
  };

  const shareOrder = async () => {
    // First submit the order to the server
    await submitOrderToServer();
    
    // Then proceed with WhatsApp sharing (existing functionality)
    const orderText = formatOrderText();
    const whatsappText = encodeURIComponent(orderText);
    const whatsappUrl = `https://wa.me/?text=${whatsappText}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!orderData) {
    return (
      <div className={components.page.containerLarge}>
        <div className="max-w-2xl mx-auto px-4">
          <div className={components.card.main + " p-8 text-center"}>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Comanda nu a fost găsită
            </h1>
            <p className="text-gray-600 mb-6">
              Nu s-a găsit nicio comandă pentru afișare.
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

  const orderText = formatOrderText();

  return (
    <div className={components.page.container}>
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className={components.card.header + " p-6 mb-6 text-center"}>
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Comanda a fost finalizată!
          </h1>
          <p className="text-gray-600">
            Comanda ta a fost pregătită. Copiază textul de mai jos și trimite-l prin WhatsApp.
          </p>
        </div>

        {/* Order Display */}
        <div className={components.card.main + " p-6 mb-6"}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Comanda ta:
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <pre className="whitespace-pre-line text-sm font-mono text-gray-800">
              {orderText}
            </pre>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={components.card.main + " p-6 mb-6"}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Acțiuni
          </h3>
          
          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={copyToClipboard}
              className={components.button.primary("w-full")}
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copiat!' : 'Copiază Comanda'}
            </Button>
            
            <Button
              variant="secondary"
              onClick={shareOrder}
              disabled={createOrderMutation.isPending}
              className={components.button.secondary("w-full")}
            >
              <Share2 className="w-4 h-4 mr-2" />
              {createOrderMutation.isPending ? 'Se trimite...' : 'Trimite prin WhatsApp'}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center">
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi la Produse
          </Button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default OrderConfirmation; 