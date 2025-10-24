import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePublishedList } from '@/hooks/useLists';
import { useBusinessDetailsSingle } from '@/hooks/useBusinessDetails';
import { getBusinessPhone } from '@/utils/businessInfo';
import { useCreateOrder } from '@/hooks/useOrders';
import { OrderCreate } from '@/types/api';
import { components } from '@/utils/theme';
import { formatOrderText as formatOrderTextUtil } from '@/utils/orderFormatter';

interface CopyOrderButtonProps {
  formatOrderText: () => string;
  submitOrderToServer: (source: string) => Promise<void>;
}

const CopyOrderButton: React.FC<CopyOrderButtonProps> = ({
  formatOrderText,
  submitOrderToServer,
}) => {
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const timeoutRef = useRef<number | null>(null);

  const fallbackCopyText = (text: string): boolean => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;

      // iOS quirks
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      textarea.style.top = `${window.scrollY || 0}px`; // keep inside viewport on iOS
      textarea.style.fontSize = '12pt'; // prevents zoom on focus

      document.body.appendChild(textarea);

      // Preserve selection
      const selection = document.getSelection();
      let savedRange: Range | null = null;
      if (selection && selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0);
      }

      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length); // iOS fix

      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }

      // Cleanup
      document.body.removeChild(textarea);

      // Restore previous selection
      if (selection) {
        selection.removeAllRanges();
        if (savedRange) selection.addRange(savedRange);
      }

      return ok;
    } catch (err) {
      console.error('Fallback copy failed', err);
      return false;
    }
  };

  const handleClick = async () => {
    setErrorMsg('');
    const text = formatOrderText();

    try {
      // Do the copy immediately (before async operations)
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ok = fallbackCopyText(text);
        if (!ok) throw new Error('Fallback copy failed');
      }

      // Success
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);

      // Now safe to do async operations
      try {
        await submitOrderToServer('copy_button');
      } catch (submitErr) {
        console.error('Submit failed after copy:', submitErr);
      }
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed, trying fallback', err);
      const fallbackOk = fallbackCopyText(text);
      if (fallbackOk) {
        setCopied(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);

        try {
          await submitOrderToServer('copy_button');
        } catch (submitErr) {
          console.error('Submit failed after fallback copy:', submitErr);
        }
        return;
      }

      console.error('Both clipboard API and fallback copy failed', err);
      setErrorMsg(
        'Nu s-a putut copia automat textul. Te rugăm să selectezi manual textul și să-l copiezi.'
      );
    }
  };

  return (
    <div>
      <Button
        variant="primary"
        onClick={handleClick}
        className={components.button.primary("w-full sm:w-auto")}
        aria-pressed={copied}
      >
        <Copy className="w-4 h-4 mr-2" />
        {copied ? 'Copiat ✅' : 'Copiază comanda'}
      </Button>

      {errorMsg && (
        <div role="alert" className="mt-2 text-sm text-red-600">
          {errorMsg}
        </div>
      )}
    </div>
  );
};

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
    return formatOrderTextUtil(orderData, {
      // Use admin-style separator for customer copy text
      includeSeparator: true,
      listDate: publishedList?.data
    });
  };


  const submitOrderToServer = async (source?: string) => {
    if (!orderData || !publishedList) {
      console.error('Order data or published list not available');
      return;
    }

    try {
      const orderCreateData: OrderCreate = {
        nume_client: `${orderData.prenume?.trim() || ''} ${orderData.nume?.trim() || ''}`.trim(),
        data_plasarii: new Date().toISOString(),
        liste_id: publishedList.id,
        delivery_type_id: orderData.delivery_type_id,
        payment_method_id: orderData.payment_method_id,
        delivery_address: orderData.address?.trim() || undefined,
        order_notes: orderData.observatii?.trim() || undefined,
        phone_number: orderData.phone_number?.trim() || undefined,
        items: orderData.items.map(item => ({
          produse_id: item.id,
          pret_produs: item.pret,
          cantitate_produs: item.quantity,
          unitati_id: item.unitati_id,
        })),
      };

      await createOrderMutation.mutateAsync({ orderData: orderCreateData, source });
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
                <CopyOrderButton
                  formatOrderText={formatOrderText}
                  submitOrderToServer={submitOrderToServer}
                />
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