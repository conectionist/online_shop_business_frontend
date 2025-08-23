import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SEOProps, SEOConfig, PageSEO } from '@/types/seo';
import { getAppName } from '@/utils/appConfig';

// Default SEO configuration
const defaultSEOConfig: SEOConfig = {
  baseTitle: getAppName(),
  defaultDescription: 'Magazin online de produse proaspete de brutărie cu maia. Comandă online cu livrare rapidă în Iasi.',
  defaultKeywords: 'maia, paine, brutărie, produse proaspete, comandă online, livrare, panificatie, românia',
  defaultAuthor: 'Online Shop Business',
  defaultOgType: 'website',
  defaultTwitterCard: 'summary_large_image',
  baseUrl: window.location.origin,
  defaultOgImage: '/assets/logo.jpg', // Default logo image
};

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  author,
  canonical,
  ogImage,
  ogImageAlt,
  ogType,
  twitterCard,
  noindex = false,
  nofollow = false,
  additionalMeta = [],
}) => {
  const location = useLocation();

  // Generate page-specific SEO data
  const pageSEO: PageSEO = {
    title: title ? `${title} | ${defaultSEOConfig.baseTitle}` : defaultSEOConfig.baseTitle,
    description: description || defaultSEOConfig.defaultDescription,
    keywords: keywords || defaultSEOConfig.defaultKeywords,
    canonical: canonical || `${defaultSEOConfig.baseUrl}${location.pathname}`,
    ogTitle: title || defaultSEOConfig.baseTitle,
    ogDescription: description || defaultSEOConfig.defaultDescription,
    ogImage: ogImage || defaultSEOConfig.defaultOgImage,
    ogType: ogType || defaultSEOConfig.defaultOgType,
    twitterCard: twitterCard || defaultSEOConfig.defaultTwitterCard,
    robots: `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`,
  };

  useEffect(() => {
    // Update document title
    document.title = pageSEO.title;

    // Update or create meta tags
    updateMetaTag('name', 'description', pageSEO.description);
    updateMetaTag('name', 'keywords', pageSEO.keywords);
    updateMetaTag('name', 'author', author || defaultSEOConfig.defaultAuthor);
    updateMetaTag('name', 'robots', pageSEO.robots);
    updateMetaTag('property', 'og:title', pageSEO.ogTitle);
    updateMetaTag('property', 'og:description', pageSEO.ogDescription);
    updateMetaTag('property', 'og:image', pageSEO.ogImage);
    updateMetaTag('property', 'og:image:alt', ogImageAlt || '');
    updateMetaTag('property', 'og:type', pageSEO.ogType);
    updateMetaTag('property', 'og:url', pageSEO.canonical);
    updateMetaTag('property', 'og:locale', 'ro_RO');
    updateMetaTag('property', 'og:site_name', defaultSEOConfig.baseTitle);
    updateMetaTag('name', 'twitter:card', pageSEO.twitterCard);
    updateMetaTag('name', 'twitter:title', pageSEO.ogTitle);
    updateMetaTag('name', 'twitter:description', pageSEO.ogDescription);
    updateMetaTag('name', 'twitter:image', pageSEO.ogImage);
    updateMetaTag('rel', 'canonical', pageSEO.canonical);

    // Add additional meta tags
    additionalMeta.forEach(meta => {
      if (meta.name) {
        updateMetaTag('name', meta.name, meta.content);
      }
      if (meta.property) {
        updateMetaTag('property', meta.property, meta.content);
      }
    });

    // Cleanup function to reset to defaults when component unmounts
    return () => {
      document.title = defaultSEOConfig.baseTitle;
      // Reset meta tags to defaults
      updateMetaTag('name', 'description', defaultSEOConfig.defaultDescription);
      updateMetaTag('name', 'keywords', defaultSEOConfig.defaultKeywords);
      updateMetaTag('name', 'author', defaultSEOConfig.defaultAuthor);
      updateMetaTag('name', 'robots', 'index, follow');
    };
  }, [pageSEO, author, additionalMeta]);

  // Helper function to update or create meta tags
  const updateMetaTag = (attr: 'name' | 'property' | 'rel', value: string, content: string) => {
    let meta = document.querySelector(`meta[${attr}="${value}"]`) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      if (attr === 'rel') {
        // For canonical links, we need a link element, not meta
        const link = document.createElement('link');
        link.rel = 'canonical';
        link.href = content;
        document.head.appendChild(link);
        return;
      } else {
        meta.setAttribute(attr, value);
        document.head.appendChild(meta);
      }
    }
    
    meta.setAttribute('content', content);
  };

  // This component doesn't render anything visible
  return null;
};

export { SEO };
export default SEO;
