import { Product } from '@/types/api';
import { getProductImageUrl } from '@/services/api';

// Product Schema Markup Generator
export const generateProductSchema = (product: Product, categoryName: string, unitName: string) => {
  const baseUrl = window.location.origin;
  
  // Use the existing getProductImageUrl function to get the correct image URL
  const imageUrl = getProductImageUrl(product, 'original');
  
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
      "availability": "https://schema.org/InStock",
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
export const injectSchemaMarkup = (schema: any) => {
  try {
    // Validate schema before injecting
    if (!schema || typeof schema !== 'object') {
      console.warn('Invalid schema provided to injectSchemaMarkup');
      return;
    }

    // Remove any existing schema markup
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create new schema script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    
    // Insert into head
    document.head.appendChild(script);
  } catch (error) {
    console.warn('Failed to inject schema markup:', error);
  }
};

// Helper function to remove schema markup
export const removeSchemaMarkup = () => {
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }
};
