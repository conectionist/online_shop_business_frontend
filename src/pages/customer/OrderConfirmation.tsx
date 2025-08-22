import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface OrderData {
  prenume: string;
  nume: string;
  payment_method_id: number;
  delivery_type_id: number;
  address?: string;
  items: any[];
  total: number;
  deliveryType: any;
  paymentMethod: any;
}

const OrderConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedOrderData = sessionStorage.getItem('orderData');
    if (storedOrderData) {
      setOrderData(JSON.parse(storedOrderData));
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
    
    // Add total price
    orderText += `Total: ${orderData.total} RON\n`;
    
    // Add payment method
    if (orderData.paymentMethod) {
      orderText += `Plata ${orderData.paymentMethod.name.toLowerCase()}.\n`;
    }
    
    // Add delivery method
    if (orderData.deliveryType) {
      orderText += `${orderData.deliveryType.denumire}.\n`;
    }
    
    // Add address if it's home delivery
    if (orderData.address && orderData.deliveryType?.denumire.toLowerCase().includes('livrare')) {
      orderText += `Adresa: ${orderData.address}\n`;
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

  const shareOrder = () => {
    const orderText = formatOrderText();
    const whatsappText = encodeURIComponent(orderText);
    const whatsappUrl = `https://wa.me/?text=${whatsappText}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Comanda nu a fost găsită
            </h1>
            <p className="text-gray-600 mb-6">
              Nu s-a găsit nicio comandă pentru afișare.
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

  const orderText = formatOrderText();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Comanda a fost finalizată!
          </h1>
          <p className="text-gray-600">
            Comanda ta a fost pregătită. Copiază textul de mai jos și trimite-l prin WhatsApp.
          </p>
        </div>

        {/* Order Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Acțiuni
          </h3>
          
          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={copyToClipboard}
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copiat!' : 'Copiază Comanda'}
            </Button>
            
            <Button
              variant="secondary"
              onClick={shareOrder}
              className="w-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Trimite prin WhatsApp
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Următorii pași:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Copiază textul comenzii de mai sus</li>
            <li>Deschide WhatsApp</li>
            <li>Trimite textul către numărul de contact al magazinului</li>
            <li>Așteaptă confirmarea comenzii</li>
          </ol>
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
    </div>
  );
};

export default OrderConfirmation; 