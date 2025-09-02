/**
 * Utility functions for delivery-related operations
 */

import { DeliveryType, BusinessDetails } from '@/types/api';

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

/**
 * Get the applicable delivery tax for a given delivery type and business details.
 * Rule:
 * - Apply tax only when the selected delivery type represents home delivery
 *   (we reuse requiresAddress heuristic).
 * - Use the optional businessDetails.delivery_tax value; default to 0 if missing.
 */
export const getDeliveryTax = (
  deliveryType: DeliveryType | null | undefined,
  businessDetails: BusinessDetails | null | undefined
): number => {
  if (!deliveryType || !businessDetails) return 0;
  if (!requiresAddress(deliveryType)) return 0;
  const value = businessDetails.delivery_tax ?? 0;
  return Number.isFinite(value) ? value : 0;
};
