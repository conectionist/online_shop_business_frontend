// SEO utility functions

// Generate canonical URL
export const generateCanonicalUrl = (path: string = ''): string => {
  const baseUrl = window.location.origin;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// Generate absolute URL
export const generateAbsoluteUrl = (path: string): string => {
  const baseUrl = window.location.origin;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// Generate meta description
export const generateMetaDescription = (description?: string, maxLength: number = 160): string => {
  if (!description) {
    return 'Comandă online produse proaspete de brutărie cu maia. Livrare rapidă în Iasi. Paini, covrigi, produse de patiserie.';
  }
  
  if (description.length <= maxLength) {
    return description;
  }
  
  // Truncate at word boundary
  const truncated = description.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
};

// Generate meta keywords
export const generateMetaKeywords = (keywords?: string[]): string => {
  const defaultKeywords = [
    'brutărie',
    'maia',
    'produse proaspete',
    'comandă online',
    'livrare',
    'panificatie',
    'românia',
    'iasi',
    'paini',
    'covrigi',
    'patiserie'
  ];
  
  const allKeywords = keywords ? [...defaultKeywords, ...keywords] : defaultKeywords;
  return allKeywords.join(', ');
};

// Generate Open Graph URL
export const generateOgUrl = (path: string = ''): string => {
  return generateCanonicalUrl(path);
};

// Generate Twitter Card URL
export const generateTwitterUrl = (path: string = ''): string => {
  return generateCanonicalUrl(path);
};
