// SEO Component Types and Interfaces

export interface SEOProps {
  /** Page title - will be appended to the base title */
  title?: string;
  /** Page description - overrides default description */
  description?: string;
  /** Page keywords - overrides default keywords */
  keywords?: string;
  /** Page author - overrides default author */
  author?: string;
  /** Canonical URL for the page */
  canonical?: string;
  /** Open Graph image URL */
  ogImage?: string;
  /** Open Graph image alt text */
  ogImageAlt?: string;
  /** Open Graph type (article, website, product, etc.) */
  ogType?: 'website' | 'article' | 'product' | 'profile' | 'book';
  /** Twitter Card type */
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  /** Whether to index this page (default: true) */
  noindex?: boolean;
  /** Whether to follow links on this page (default: true) */
  nofollow?: boolean;
  /** Additional meta tags */
  additionalMeta?: Array<{
    name?: string;
    property?: string;
    content: string;
  }>;
}

export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

export interface SEOConfig {
  /** Base title for the application */
  baseTitle: string;
  /** Default description */
  defaultDescription: string;
  /** Default keywords */
  defaultKeywords: string;
  /** Default author */
  defaultAuthor: string;
  /** Default Open Graph type */
  defaultOgType: string;
  /** Default Twitter Card type */
  defaultTwitterCard: string;
  /** Base URL for canonical URLs */
  baseUrl: string;
  /** Default Open Graph image */
  defaultOgImage: string;
}

export interface PageSEO {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  robots: string;
}
