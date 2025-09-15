import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePublishedList } from '@/hooks/useLists';
import { useBusinessDetailsSingle } from '@/hooks/useBusinessDetails';
import { getBusinessPhone } from '@/utils/businessInfo';
import { useCreateOrder } from '@/hooks/useOrders';
import { OrderCreate } from '@/types/api';
import { requiresAddress } from '@/utils/delivery';
import { components } from '@/utils/theme';


interface OrderData {
  prenume: string;
  nume: string;
  payment_method_id: number;
  delivery_type_id: number;
  address?: string;
  observatii?: string;
  phone_number?: string | null;
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
  const [showHelp, setShowHelp] = useState(false);

  
  // Get the current published list for the order
  const { data: publishedList } = usePublishedList();
  const { data: businessDetails } = useBusinessDetailsSingle();
  const createOrderMutation = useCreateOrder();
  // No client-side duplicate detection anymore; backend enforces duplicates

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
    
    // Add phone number if provided
    if (orderData.phone_number) {
      orderText += `Telefon: ${orderData.phone_number}\n`;
    }
    
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
    // First submit the order to the server
    await submitOrderToServer();
    
    // Then proceed with copying to clipboard
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
        phone_number: orderData.phone_number || undefined,
        items: orderData.items.map(item => ({
          produse_id: item.id,
          pret_produs: item.pret,
          cantitate_produs: item.quantity,
          unitati_id: item.unitati_id,
        })),
      };

      await createOrderMutation.mutateAsync(orderCreateData);
      console.log('Order submitted successfully to server');
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 409) {
        // Duplicate order: handle silently (copy/WhatsApp double action)
        console.info('Duplicate order (409) handled silently.');
      } else {
        console.error('Failed to submit order to server:', error);
      }
    }
  };

  // WhatsApp flow is now handled on the order form; no WhatsApp button here

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
  const whatsappContact = publishedList?.numar_whatsapp || getBusinessPhone(businessDetails || undefined);

  const formatRomanianDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const formatted = date.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    // Capitalize month (default is lowercase in ro-RO)
    return formatted.replace(/ (\p{L}+)/u, (m) => ` ${m.slice(1,2).toUpperCase()}${m.slice(2)}`);
  };

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
            Vei primi produsele comandate pe data de<br />
            <span className="font-medium">{formatRomanianDate(publishedList?.data)}</span>
          </p>
        </div>

        {/* Help / Fallback Section */}
        <div className={components.card.main + " p-6 mb-6"}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Dacă, însă, nu ai reușit să plasezi comanda pe WhatsApp,
            <button
              className="text-blue-600 underline ml-1"
              onClick={() => setShowHelp((s) => !s)}
            >
              dă click aici
            </button>
          </h3>

          {showHelp && (
            <div className="mt-4 space-y-4">
              <div className="text-gray-700 text-sm">
                <p className="mb-2 font-medium">Ce ai de făcut:</p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Apasă pe butonul "Copiază comanda" de mai jos.</li>
                  <li>
                    Deschide WhatsApp și selectează grupul de comenzi (dacă ești membru)
                    sau numărul {whatsappContact}.
                  </li>
                  <li>Lipește textul copiat în mesaj și trimite-l.</li>
                </ol>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Textul comenzii:</h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <pre className="whitespace-pre-line text-sm font-mono text-gray-800">
                    {orderText}
                  </pre>
                </div>
              </div>

              <div>
                <Button
                  variant="primary"
                  onClick={copyToClipboard}
                  className={components.button.primary("w-full sm:w-auto")}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copiat!' : 'Copiază Comanda'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* No WhatsApp button here anymore */}

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
    </div>
  );
};

export default OrderConfirmation; 