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
  defaultOgImageWidth: 1200,
  defaultOgImageHeight: 630,
  defaultOgImageType: 'image/jpeg',
  twitterSite: '@paine_cu_maia',
  twitterCreator: '@andreea_brutarie',
  defaultLocale: 'ro_RO',
};

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  author,
  canonical,
  ogImage,
  ogImageAlt,
  ogImageWidth,
  ogImageHeight,
  ogImageType,
  ogType,
  twitterCard,
  twitterSite,
  twitterCreator,
  robots = 'index, follow',
  language = 'ro',
  locale = 'ro_RO',
}) => {
  const location = useLocation();

  useEffect(() => {
    // Prepare page SEO data
    const pageSEO: PageSEO = {
      title: title ? `${title} | ${defaultSEOConfig.baseTitle}` : defaultSEOConfig.baseTitle,
      description: description || defaultSEOConfig.defaultDescription,
      keywords: keywords || defaultSEOConfig.defaultKeywords,
      author: author || defaultSEOConfig.defaultAuthor,
      canonical: canonical || `${defaultSEOConfig.baseUrl}${location.pathname}`,
      ogTitle: title ? `${title} | ${defaultSEOConfig.baseTitle}` : defaultSEOConfig.baseTitle,
      ogDescription: description || defaultSEOConfig.defaultDescription,
      ogImage: ogImage || defaultSEOConfig.defaultOgImage,
      ogImageAlt: ogImageAlt || `Imagine pentru ${title || defaultSEOConfig.baseTitle}`,
      ogImageWidth: ogImageWidth || defaultSEOConfig.defaultOgImageWidth,
      ogImageHeight: ogImageHeight || defaultSEOConfig.defaultOgImageHeight,
      ogImageType: ogImageType || defaultSEOConfig.defaultOgImageType,
      ogType: ogType || defaultSEOConfig.defaultOgType,
      ogUrl: canonical || `${defaultSEOConfig.baseUrl}${location.pathname}`,
      ogLocale: locale || defaultSEOConfig.defaultLocale,
      ogSiteName: defaultSEOConfig.baseTitle,
      twitterCard: twitterCard || defaultSEOConfig.defaultTwitterCard,
      twitterTitle: title ? `${title} | ${defaultSEOConfig.baseTitle}` : defaultSEOConfig.baseTitle,
      twitterDescription: description || defaultSEOConfig.defaultDescription,
      twitterImage: ogImage || defaultSEOConfig.defaultOgImage,
      twitterImageAlt: ogImageAlt || `Imagine pentru ${title || defaultSEOConfig.baseTitle}`,
      twitterSite: twitterSite || defaultSEOConfig.twitterSite,
      twitterCreator: twitterCreator || defaultSEOConfig.twitterCreator,
      robots,
      language,
    };

    // Update document title
    document.title = pageSEO.title;

    // Helper function to update or create meta tags
    const updateMetaTag = (attr: 'name' | 'property' | 'rel', value: string, content: string) => {
      let meta = document.querySelector(`meta[${attr}="${value}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, value);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update or create meta tags
    updateMetaTag('name', 'description', pageSEO.description);
    updateMetaTag('name', 'keywords', pageSEO.keywords);
    updateMetaTag('name', 'author', pageSEO.author);
    updateMetaTag('name', 'robots', pageSEO.robots);
    updateMetaTag('name', 'language', pageSEO.language);
    
    // Open Graph meta tags
    updateMetaTag('property', 'og:title', pageSEO.ogTitle);
    updateMetaTag('property', 'og:description', pageSEO.ogDescription);
    updateMetaTag('property', 'og:image', pageSEO.ogImage);
    updateMetaTag('property', 'og:image:alt', pageSEO.ogImageAlt);
    updateMetaTag('property', 'og:image:width', pageSEO.ogImageWidth.toString());
    updateMetaTag('property', 'og:image:height', pageSEO.ogImageHeight.toString());
    updateMetaTag('property', 'og:image:type', pageSEO.ogImageType);
    updateMetaTag('property', 'og:type', pageSEO.ogType);
    updateMetaTag('property', 'og:url', pageSEO.ogUrl);
    updateMetaTag('property', 'og:locale', pageSEO.ogLocale);
    updateMetaTag('property', 'og:site_name', pageSEO.ogSiteName);
    
    // Twitter Card meta tags
    updateMetaTag('name', 'twitter:card', pageSEO.twitterCard);
    updateMetaTag('name', 'twitter:title', pageSEO.twitterTitle);
    updateMetaTag('name', 'twitter:description', pageSEO.twitterDescription);
    updateMetaTag('name', 'twitter:image', pageSEO.twitterImage);
    updateMetaTag('name', 'twitter:image:alt', pageSEO.twitterImageAlt);
    
    if (pageSEO.twitterSite) {
      updateMetaTag('name', 'twitter:site', pageSEO.twitterSite);
    }
    
    if (pageSEO.twitterCreator) {
      updateMetaTag('name', 'twitter:creator', pageSEO.twitterCreator);
    }

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', pageSEO.canonical);

  }, [title, description, keywords, author, canonical, ogImage, ogImageAlt, ogImageWidth, ogImageHeight, ogImageType, ogType, twitterCard, twitterSite, twitterCreator, robots, language, locale, location.pathname]);

  // This component doesn't render anything visible
  return null;
};

export { SEO };
export default SEO;
