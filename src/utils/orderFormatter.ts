import { OrderRead, DeliveryType, BusinessDetails } from '@/types/api';
import { requiresAddress, getDeliveryTax } from './delivery';

export interface OrderFormatterConfig {
  getProductName?: (productId: number) => string;
  getPaymentMethodName?: (paymentMethodId: number) => string;
  deliveryTypes?: DeliveryType[];
  businessDetails?: BusinessDetails | null;
  includeSeparator?: boolean;
  appendFooterText?: string;
}

export interface OrderConfirmationData {
  prenume: string;
  nume: string;
  phone_number?: string | null;
  items: Array<{
    quantity: number;
    nume: string;
    pret: number;
  }>;
  subtotal?: number;
  delivery_tax?: number;
  total: number;
  paymentMethod?: { name: string };
  deliveryType?: DeliveryType;
  address?: string;
  observatii?: string;
}

/**
 * Formats order data into a text representation for display
 * Supports both OrderRead (from API) and OrderConfirmationData (from order form)
 */
export function formatOrderText(
  order: OrderRead | OrderConfirmationData,
  config?: OrderFormatterConfig
): string {
  // Handle different data structures
  const isOrderRead = 'nume_client' in order;
  
  const customerName = isOrderRead 
    ? (order as OrderRead).nume_client
    : `${(order as OrderConfirmationData).prenume} ${(order as OrderConfirmationData).nume}`;
  
  let orderText = `${customerName}\n`;
  
  // Add items
  if (isOrderRead) {
    const orderRead = order as OrderRead;
    const getProductName = config?.getProductName;
    orderRead.items?.forEach(item => {
      const productName = getProductName ? getProductName(item.produse_id) : `Produs #${item.produse_id}`;
      const lineTotal = item.cantitate_produs * item.pret_produs;
      orderText += `${item.cantitate_produs} x ${productName} (${lineTotal} RON)\n`;
    });
  } else {
    const orderConfirmation = order as OrderConfirmationData;
    orderConfirmation.items.forEach(item => {
      orderText += `${item.quantity} x ${item.nume} (${item.quantity * item.pret} RON)\n`;
    });
  }
  
  // Add totals breakdown
  let subtotal: number;
  let deliveryTax: number;
  let total: number;
  
  if (isOrderRead) {
    const orderRead = order as OrderRead;
    subtotal = orderRead.items?.reduce((sum, item) => sum + (item.pret_produs * item.cantitate_produs), 0) || 0;
    if (config?.deliveryTypes && config?.businessDetails) {
      const deliveryType = config.deliveryTypes.find(dt => dt.id === orderRead.delivery_type_id);
      deliveryTax = getDeliveryTax(deliveryType, config.businessDetails);
    } else {
      deliveryTax = 0;
    }
    total = subtotal + deliveryTax;
  } else {
    const orderConfirmation = order as OrderConfirmationData;
    subtotal = orderConfirmation.subtotal ?? orderConfirmation.items.reduce((t, it) => t + it.quantity * it.pret, 0);
    deliveryTax = orderConfirmation.delivery_tax ?? 0;
    total = orderConfirmation.total;
  }
  
  // Separate products from the rest of the details for admin and shared usages (configurable)
  if (config?.includeSeparator !== false) {
    orderText += `==============================\n`;
  }

  if (deliveryTax > 0) {
    orderText += `Subtotal: ${subtotal} RON\n`;
    orderText += `Taxă livrare: ${deliveryTax} RON\n`;
  }
  orderText += `Total: ${total} RON\n`;
  
  // Add payment method
  if (isOrderRead) {
    const orderRead = order as OrderRead;
    const getPaymentMethodName = config?.getPaymentMethodName;
    if (getPaymentMethodName) {
      const paymentMethodName = getPaymentMethodName(orderRead.payment_method_id);
      orderText += `Plata ${paymentMethodName.toLowerCase()}.\n`;
    }
  } else {
    const orderConfirmation = order as OrderConfirmationData;
    if (orderConfirmation.paymentMethod) {
      orderText += `Plata ${orderConfirmation.paymentMethod.name.toLowerCase()}.\n`;
    }
  }
  
  // Add delivery method and address
  if (isOrderRead) {
    const orderRead = order as OrderRead;
    if (config?.deliveryTypes) {
      const addressDeliveryType = config.deliveryTypes.find(dt => dt.id === orderRead.delivery_type_id);
      if (addressDeliveryType) {
        if (orderRead.delivery_address && requiresAddress(addressDeliveryType)) {
          orderText += `Livrare la adresa: ${orderRead.delivery_address}\n`;
        } else {
          orderText += `${addressDeliveryType.denumire}.\n`;
        }
      }
    }
  } else {
    const orderConfirmation = order as OrderConfirmationData;
    if (orderConfirmation.deliveryType) {
      if (orderConfirmation.address && requiresAddress(orderConfirmation.deliveryType)) {
        orderText += `Livrare la adresa: ${orderConfirmation.address}\n`;
      } else {
        orderText += `${orderConfirmation.deliveryType.denumire}.\n`;
      }
    }
  }
  
  // Add phone number if provided
  const phoneNumber = isOrderRead 
    ? (order as OrderRead).phone_number
    : (order as OrderConfirmationData).phone_number;
    
  if (phoneNumber) {
    orderText += `Telefon: ${phoneNumber}\n`;
  }
  
  // Add observatii if present
  const notes = isOrderRead 
    ? (order as OrderRead).order_notes
    : (order as OrderConfirmationData).observatii;
    
  if (notes) {
    orderText += `Observații: ${notes}\n`;
  }

  // Optional footer text (e.g., customer marker)
  if (config?.appendFooterText) {
    orderText += `${config.appendFooterText}`;
  }

  return orderText.trim();
}
