/**
 * Utility functions for delivery-related operations
 */

import { DeliveryType } from '@/types/api';

/**
 * Check if a delivery type requires an address
 * @param deliveryType - The delivery type object
 * @returns true if the delivery type requires an address, false otherwise
 */
export const requiresAddress = (deliveryType: DeliveryType | null | undefined): boolean => {
  if (!deliveryType?.denumire) return false;
  const denumire = deliveryType.denumire.toLowerCase();
  return denumire.includes('livrare') || denumire.includes('curier');
};
