// SEO Component Types and Interfaces

type Robots = 
  | 'index, follow'
  | 'noindex, follow'
  | 'noindex, nofollow';

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
  /** Open Graph image width in pixels */
  ogImageWidth?: number;
  /** Open Graph image height in pixels */
  ogImageHeight?: number;
  /** Open Graph image MIME type */
  ogImageType?: string;
  /** Open Graph type (article, website, product, etc.) */
  ogType?: 'website' | 'article' | 'product' | 'profile' | 'book';
  /** Twitter Card type */
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  /** Twitter site handle (e.g., @businessname) */
  twitterSite?: string;
  /** Twitter creator handle */
  twitterCreator?: string;
  /** Whether to index the page */
  robots?: Robots;
  /** Page language */
  language?: string;
  /** Page locale */
  locale?: string;
}

export interface SEOConfig {
  /** Base title for the application */
  baseTitle: string;
  /** Default meta description */
  defaultDescription: string;
  /** Default meta keywords */
  defaultKeywords: string;
  /** Default author */
  defaultAuthor: string;
  /** Default Open Graph type */
  defaultOgType: 'website' | 'article' | 'product' | 'profile' | 'book';
  /** Default Twitter Card type */
  defaultTwitterCard: 'summary' | 'summary_large_image' | 'app' | 'player';
  /** Base URL for the application */
  baseUrl: string;
  /** Default Open Graph image */
  defaultOgImage: string;
  /** Default Open Graph image width */
  defaultOgImageWidth: number;
  /** Default Open Graph image height */
  defaultOgImageHeight: number;
  /** Default Open Graph image type */
  defaultOgImageType: string;
  /** Twitter site handle */
  twitterSite?: string;
  /** Twitter creator handle */
  twitterCreator?: string;
  /** Default locale */
  defaultLocale: string;
}

export interface PageSEO {
  /** Full page title */
  title: string;
  /** Page description */
  description: string;
  /** Page keywords */
  keywords: string;
  /** Page author */
  author: string;
  /** Canonical URL */
  canonical: string;
  /** Open Graph title */
  ogTitle: string;
  /** Open Graph description */
  ogDescription: string;
  /** Open Graph image */
  ogImage: string;
  /** Open Graph image alt */
  ogImageAlt: string;
  /** Open Graph image width */
  ogImageWidth: number;
  /** Open Graph image height */
  ogImageHeight: number;
  /** Open Graph image type */
  ogImageType: string;
  /** Open Graph type */
  ogType: 'website' | 'article' | 'product' | 'profile' | 'book';
  /** Open Graph URL */
  ogUrl: string;
  /** Open Graph locale */
  ogLocale: string;
  /** Open Graph site name */
  ogSiteName: string;
  /** Twitter Card type */
  twitterCard: 'summary' | 'summary_large_image' | 'app' | 'player';
  /** Twitter title */
  twitterTitle: string;
  /** Twitter description */
  twitterDescription: string;
  /** Twitter image */
  twitterImage: string;
  /** Twitter image alt */
  twitterImageAlt: string;
  /** Twitter site */
  twitterSite?: string;
  /** Twitter creator */
  twitterCreator?: string;
  /** Robots directive */
  robots: string;
  /** Page language */
  language: string;
}
