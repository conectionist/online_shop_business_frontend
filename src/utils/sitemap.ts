import { Product } from '@/types/api';

// Sitemap URL interface
interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

// Generate XML sitemap
export const generateSitemap = (baseUrl: string, products: Product[] = []): string => {
  const urls: SitemapUrl[] = [
    // Main page
    {
      loc: `${baseUrl}/`,
      changefreq: 'daily',
      priority: 1.0,
      lastmod: new Date().toISOString().split('T')[0]
    }
  ];

  // Add product pages
  products.forEach(product => {
    urls.push({
      loc: `${baseUrl}/product/${product.id}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date(product.updated_at).toISOString().split('T')[0]
    });
  });

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `    <lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `    <changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `    <priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return xml;
};

// Generate sitemap with dynamic data
export const generateDynamicSitemap = async (baseUrl: string): Promise<string> => {
  try {
    // In a real implementation, you would fetch products from your API
    // For now, we'll generate a basic sitemap
    return generateSitemap(baseUrl);
  } catch (error) {
    console.warn('Failed to generate dynamic sitemap:', error);
    // Fallback to basic sitemap
    return generateSitemap(baseUrl);
  }
};
