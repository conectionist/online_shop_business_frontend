import React, { useState, useMemo } from 'react';
import { Copy, Share2, CheckCircle } from 'lucide-react';
import { useList } from '@/hooks/useLists';
import { useListProductsOrdered, useListDeliveryTypes } from '@/hooks/useLists';
import { useCategories } from '@/hooks/useCategories';
import { useUnits } from '@/hooks/useUnits';
import { useDeliverySchedules } from '@/hooks/useDeliverySchedules';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';

interface ListTextTabProps {
  listId: number;
}

const ListTextTab: React.FC<ListTextTabProps> = ({ listId }) => {
  const [copied, setCopied] = useState(false);

  // Queries
  const { data: list, isLoading: isLoadingList } = useList(listId);
  const { data: listProductsData, isLoading: isLoadingListProducts } = useListProductsOrdered(listId);
  const { data: categories } = useCategories();
  const { data: units } = useUnits();
  const { data: deliverySchedules } = useDeliverySchedules();
  const { data: listDeliveryTypes } = useListDeliveryTypes(listId);
  const { data: paymentMethods } = usePaymentMethods();

  // Extract products from the ordered structure
  const listProducts = useMemo(() => {
    if (!listProductsData?.categories) return [];
    
    // Flatten all products from all categories
    return listProductsData.categories.flatMap((category: { id: number; name: string; products: any[] }) => 
      category.products.map((product: any) => ({
        ...product,
        category_id: category.id,
        category_name: category.name
      }))
    );
  }, [listProductsData]);

  // Helper functions
  const getCategoryName = (categoryId: number) => {
    return categories?.find(c => c.id === categoryId)?.name || 'Categorie necunoscută';
  };

  const getUnitName = (unitId: number) => {
    return units?.find(u => u.id === unitId)?.denumire || 'unitate';
  };

  // Format the list as text (similar to main page display)
  const formatListText = () => {
    if (!list || !listProducts || listProducts.length === 0) {
      return 'Nu există produse în această listă.';
    }

    let listText = '';

    // Add list header
    if (list.mesaj_introducere) {
      listText += `${list.mesaj_introducere}\n\n`;
    } else {
      listText += `Lista ${list.data}\n\n`;
    }

    // Add products section header
    listText += `🛒 PRODUSE DISPONIBILE 🛒\n`;
    listText += '═'.repeat(25) + '\n\n';

    // Group products by category
    const productsByCategory = listProducts.reduce((acc: any, product: any) => {
      const categoryName = product.category_name || getCategoryName(product.category_id);
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(product);
      return acc;
    }, {});

    // Add products by category
    Object.entries(productsByCategory).forEach(([categoryName, products]: [string, any]) => {
      listText += `${categoryName.toUpperCase()}\n`;
      listText += '─'.repeat(categoryName.length + 3) + '\n';
      
      products.forEach((product: any) => {
        listText += `• ${product.nume}\n`;
        if (product.description) {
          listText += `  ${product.description}\n`;
        }
        listText += `  ${product.pret} RON / ${product.cantitate} ${getUnitName(product.unitati_id)}\n`;
        listText += '\n';
      });
    });

    // Add additional details if present
    if (list.alte_detalii) {
      listText += `📝 ${list.alte_detalii}\n\n`;
    }

    // Add business information section header
    listText += `ℹ️ INFORMAȚII ℹ️\n`;
    listText += '═'.repeat(25) + '\n\n';

    // Add delivery schedule if available
    if (list.orare_livrari_id && deliverySchedules) {
      const deliverySchedule = deliverySchedules.find(s => s.id === list.orare_livrari_id);
      if (deliverySchedule) {
        listText += `🕐 ORAR LIVRĂRI\n`;
        listText += '─'.repeat(15) + '\n';
        listText += `${deliverySchedule.orar_livrari}\n\n`;
      }
    }

    // Add delivery methods if available
    if (listDeliveryTypes && listDeliveryTypes.length > 0) {
      listText += `🚚 METODE DE LIVRARE\n`;
      listText += '─'.repeat(20) + '\n';
      listDeliveryTypes.forEach((dt: any) => {
        listText += `• ${dt.denumire}\n`;
      });
      listText += '\n';
    }

    // Add payment methods if available
    if (paymentMethods && paymentMethods.length > 0) {
      listText += `💳 METODE DE PLATĂ\n`;
      listText += '─'.repeat(18) + '\n';
      paymentMethods.forEach((pm: any) => {
        listText += `• ${pm.description}\n`;
      });
      listText += '\n';
    }

    // Add WhatsApp contact if available
    if (list.numar_whatsapp) {
      listText += `📱 Pentru comenzi: ${list.numar_whatsapp}\n`;
    }

    return listText.trim();
  };

  const copyToClipboard = async () => {
    const listText = formatListText();
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(listText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = listText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback: show the text in an alert for manual copying
      alert('Textul listei:\n\n' + listText);
    }
  };

  const shareViaWhatsApp = () => {
    const listText = formatListText();
    const whatsappText = encodeURIComponent(listText);
    const whatsappUrl = `https://wa.me/?text=${whatsappText}`;
    window.open(whatsappUrl, '_blank');
  };

  // Loading state
  if (isLoadingList || isLoadingListProducts) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Se încarcă lista..." />
      </div>
    );
  }

  // Error state
  if (!list) {
    return (
      <Alert
        type="error"
        title="Eroare la încărcarea listei"
        message="Nu s-a putut încărca lista. Vă rugăm să încercați din nou."
      />
    );
  }

  const listText = formatListText();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Format Text pentru Partajare
        </h2>
        <p className="text-gray-600">
          Copiază sau partajează această listă prin WhatsApp pentru a o distribui clienților.
        </p>
      </div>

      {/* List Display */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Lista în format text:
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <pre className="whitespace-pre-line text-sm font-mono text-gray-800 leading-relaxed">
              {listText}
            </pre>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Acțiuni
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              onClick={copyToClipboard}
              className="flex-1"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copiat!' : 'Copiază Lista'}
            </Button>
            
            <Button
              variant="secondary"
              onClick={shareViaWhatsApp}
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Trimite prin WhatsApp
            </Button>
          </div>

          {copied && (
            <div className="flex items-center justify-center text-green-600 bg-green-50 rounded-lg p-3">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Lista a fost copiată în clipboard!</span>
            </div>
          )}
        </div>
      </Card>

      {/* Instructions */}
      <Card>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Cum să folosești această listă:
          </h3>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 font-medium">1.</span>
              <span>Folosește butonul "Copiază Lista" pentru a copia textul în clipboard</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 font-medium">2.</span>
              <span>Lipește textul în orice aplicație de mesaje (WhatsApp, Telegram, etc.)</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 font-medium">3.</span>
              <span>Sau folosește butonul "Trimite prin WhatsApp" pentru a deschide WhatsApp direct</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ListTextTab;
