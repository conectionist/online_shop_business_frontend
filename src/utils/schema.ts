import { Product } from '@/types/api';
import { getProductImageUrl } from '@/services/api';
import { getUnitPricing, UN_CEFACT_CODES } from '@/utils/unitPricing';

// Product Schema Markup Generator
export const generateProductSchema = (product: Product, categoryName: string, unitName: string, inStock: boolean) => {
  const baseUrl = window.location.origin;

  // Use the existing getProductImageUrl function to get the correct image URL
  const imageUrl = getProductImageUrl(product, 'original');

  // Price per kg / per litre for products sold by weight or volume (EU unit pricing)
  const unitPricing = getUnitPricing(product.cantitate, unitName);
  const priceSpecification = unitPricing ? {
    "@type": "UnitPriceSpecification",
    "price": product.pret,
    "priceCurrency": "RON",
    "referenceQuantity": {
      "@type": "QuantitativeValue",
      "value": String(unitPricing.measure.value),
      "unitCode": UN_CEFACT_CODES[unitPricing.measure.unit],
      "valueReference": {
        "@type": "QuantitativeValue",
        "value": String(unitPricing.base.value),
        "unitCode": UN_CEFACT_CODES[unitPricing.base.unit]
      }
    }
  } : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.nume,
    "description": product.description || `${product.nume} - produs proaspăt de brutărie cu maia`,
    "image": imageUrl,
    "category": categoryName,
    "brand": {
      "@type": "Brand",
      "name": "Paine cu Maia de la Andreea"
    },
    "offers": {
      "@type": "Offer",
      "price": product.pret,
      "priceCurrency": "RON",
      "priceSpecification": priceSpecification,
      "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": `${baseUrl}/product/${product.id}`,
      "seller": {
        "@type": "Organization",
        "name": "Paine cu Maia de la Andreea"
      }
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "unit",
        "value": unitName
      },
      {
        "@type": "PropertyValue", 
        "name": "quantity",
        "value": product.cantitate
      }
    ]
  };
};

// Organization Schema Markup Generator
export const generateOrganizationSchema = (businessDetails?: any) => {
  const baseUrl = window.location.origin;
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Paine cu Maia de la Andreea",
    "url": baseUrl,
    "logo": businessDetails?.logo_path ? `${baseUrl}${businessDetails.logo_path}` : undefined,
    "description": "Magazin online de produse proaspete de brutărie cu maia. Comandă online cu livrare rapidă în Iasi.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Iasi",
      "addressCountry": "RO"
    },
    "contactPoint": businessDetails?.telefon ? {
      "@type": "ContactPoint",
      "telephone": businessDetails.telefon,
      "contactType": "customer service"
    } : undefined,
    "sameAs": [
      "https://www.facebook.com/profile.php/?id=100063483733785",
      "https://www.instagram.com/paine_cu_maia"
    ]
  };
};

// Main Page Schema Markup Generator
export const generateMainPageSchema = (businessDetails?: any) => {
  const baseUrl = window.location.origin;
  
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Produse Proaspete de Brutărie cu Maia",
    "description": "Comandă online produse proaspete de brutărie cu maia. Livrare rapidă în Iasi. Paini, covrigi, produse de patiserie.",
    "url": baseUrl,
    "mainEntity": {
      "@type": "ItemList",
      "name": "Lista de Produse",
      "description": "Produse disponibile pentru comandă"
    },
    "publisher": generateOrganizationSchema(businessDetails)
  };
};

// Helper function to inject schema markup into the DOM
export const injectSchemaMarkup = (schema: any, id?: string) => {
  try {
    // Validate schema before injecting
    if (!schema || typeof schema !== 'object') {
      console.warn('Invalid schema provided to injectSchemaMarkup');
      return;
    }

    // If ID is provided, remove only that specific schema
    if (id) {
      const existingScript = document.querySelector(`script[data-schema-id="${id}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    } else {
      // Remove any existing schema markup (for backward compatibility)
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }
    }

    // Create new schema script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    
    // Add ID as a separate attribute for our internal management
    if (id) {
      script.setAttribute('data-schema-id', id);
    }
    
    // Insert into head
    document.head.appendChild(script);
  } catch (error) {
    console.warn('Failed to inject schema markup:', error);
  }
};

// Helper function to remove schema markup
export const removeSchemaMarkup = (id?: string) => {
  if (id) {
    // Remove specific schema by ID
    const existingScript = document.querySelector(`script[data-schema-id="${id}"]`);
    if (existingScript) {
      existingScript.remove();
    }
  } else {
    // Remove any existing schema markup (for backward compatibility)
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }
  }
};
