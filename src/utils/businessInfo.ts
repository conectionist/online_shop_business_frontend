import { BusinessDetails } from '@/types/api';
import { getAppName } from './appConfig';

/**
 * Utility functions to extract business information from various sources
 * This prevents hardcoding and centralizes business information management
 */

// Business Details from API
export const getBusinessName = (businessDetails?: BusinessDetails): string => {
  if (businessDetails?.business_name) {
    return businessDetails.business_name;
  }
  // Fallback to app name from config
  return getAppName();
};

export const getBusinessAddress = (businessDetails?: BusinessDetails): string => {
  if (businessDetails?.adresa) {
    return businessDetails.adresa;
  }
  // TODO: Add default address to business details or environment config
  return 'Adresa va fi configurată în setările firmei';
};

export const getBusinessPhone = (businessDetails?: BusinessDetails): string => {
  if (businessDetails?.telefon) {
    return businessDetails.telefon;
  }
  // TODO: Add default phone to business details or environment config
  return '+40 XXX XXX XXX';
};

export const getBusinessEmail = (businessDetails?: BusinessDetails): string => {
  if (businessDetails?.email) {
    return businessDetails.email;
  }
  // Fallback to domain from app config
  const appName = getAppName().toLowerCase().replace(/\s+/g, '');
  return `contact@${appName}.ro`;
};

export const getBusinessCUI = (businessDetails?: BusinessDetails): string => {
  if (businessDetails?.CUI) {
    return businessDetails.CUI;
  }
  return 'ROXXXXXXXXX';
};

export const getBusinessRegistrationNumber = (businessDetails?: BusinessDetails): string => {
  if (businessDetails?.registration_number) {
    return businessDetails.registration_number;
  }
  return 'JXX/XXXX/XXXX';
};

export const getBusinessRepresentative = (businessDetails?: BusinessDetails): string => {
  if (businessDetails?.representative) {
    return businessDetails.representative;
  }
  return 'Reprezentantul va fi configurat în setările firmei';
};

// Business Operating Hours
export const getBusinessHours = (businessDetails?: BusinessDetails): {
  weekdays: string;
  saturday: string;
  sunday: string;
} => {
  if (businessDetails?.operating_hours) {
    // Parse the operating_hours string into structured format
    // For now, return as is - can be enhanced later
    return {
      weekdays: businessDetails.operating_hours,
      saturday: businessDetails.operating_hours,
      sunday: businessDetails.operating_hours
    };
  }
  // Fallback to default hours
  return {
    weekdays: 'Luni - Vineri: 8:00 - 18:00',
    saturday: 'Sâmbătă: 8:00 - 14:00',
    sunday: 'Duminică: Închis'
  };
};

// Business Motto/Slogan
export const getBusinessMotto = (businessDetails?: BusinessDetails): string => {
  if (businessDetails?.motto) {
    return businessDetails.motto;
  }
  // TODO: Add default motto to business details or environment config
  return 'Calitate și preț bun';
};

// Business Description
export const getBusinessDescription = (businessDetails?: BusinessDetails): string => {
  if (businessDetails?.alte_detalii) {
    return businessDetails.alte_detalii;
  }
  // TODO: Add description field to BusinessDetails API
  return 'Magazin online de produse proaspete de brutărie cu maia';
};

// Legal Information
export const getLegalReturnPolicy = (): string => {
  // This is a legal requirement, so it's hardcoded but should be configurable
  return 'Conform OUG 34/2014, aveți dreptul de a returna produsele în 14 zile calendaristice de la primire.';
};

export const getLegalReturnDays = (): number => {
  // Legal requirement - 14 days
  return 14;
};

// External Legal Links
export const getANPCLink = (): string => {
  return 'https://anpc.ro';
};

export const getSOLLink = (): string => {
  return 'https://ec.europa.eu/consumers/odr/';
};

export const getSALLink = (): string => {
  return 'https://anpc.ro/ce-este-sal/';
};

// Legal Page Routes
export const getLegalPageRoutes = () => {
  return {
    terms: '/termeni-si-conditii',
    privacy: '/politica-confidentialitate',
    cookies: '/politica-cookie-uri',
    returns: '/politica-retur',
    contact: '/contact'
  };
};

// Business Social Media (if any)
export const getBusinessSocialMedia = (_businessDetails?: BusinessDetails): {
  facebook?: string;
  instagram?: string;
  website?: string;
} => {
  // TODO: Add social_media field to BusinessDetails API
  return {
    // facebook: 'https://www.facebook.com/yourbusiness',
    // instagram: 'https://www.instagram.com/yourbusiness',
    // website: 'https://yourbusiness.ro'
  };
};

// Business Tax Information
export const getBusinessTaxInfo = (businessDetails?: BusinessDetails): {
  hasVAT: boolean;
  vatRate: number;
  deliveryTax?: number;
} => {
  return {
    hasVAT: true, // TODO: Make this configurable
    vatRate: 19, // TODO: Make this configurable
    deliveryTax: businessDetails?.delivery_tax
  };
};

// Business Payment Methods Display
export const getPaymentMethodsDisplay = (): string => {
  // TODO: Get this from PaymentMethods API
  return 'Card, numerar, transfer bancar';
};

// Business Delivery Methods Display
export const getDeliveryMethodsDisplay = (): string => {
  // TODO: Get this from DeliveryTypes API
  return 'Ridicare de la sediu, livrare la domiciliu';
};
