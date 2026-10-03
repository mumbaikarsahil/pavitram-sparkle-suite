import { createClient } from '@supabase/supabase-js';

// Initialize Supabase using your environment variables
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

const BASE_URL = 'https://www.pavitram.co';

export default async function handler(req: any, res: any) {
  // 1. Core Static Routes
  const staticPaths = [
    '',
    '/stores',
    '/Shop',
    '/Search',
    '/policy/about',
  ];

  // 2. Policy Slugs
  const policySlugs = [
    'exchange-buyback',
    'gift-voucher',
    'shipping',
    'terms'
  ];

  try {
    // 3. Fetch data from Supabase
    const { data: categories } = await supabase.from('ecommerce_categories').select('slug').eq('is_active', true);
    const { data: products } = await supabase.from('ecommerce_products').select('slug').eq('is_active', true);

    const generateUrlNode = (path: string, priority: string, changefreq: string) => `
  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Inject all paths into XML
    staticPaths.forEach((path) => { xml += generateUrlNode(path, path === '' ? '1.0' : '0.8', 'weekly'); });
    policySlugs.forEach((slug) => { xml += generateUrlNode(`/policy/${slug}`, '0.5', 'monthly'); });
    categories?.forEach((cat) => { xml += generateUrlNode(`/category/${cat.slug}`, '0.9', 'daily'); });
    products?.forEach((prod) => { xml += generateUrlNode(`/product/${prod.slug}`, '0.7', 'weekly'); });

    xml += `\n</urlset>`;

    // 4. Send the XML response to Google
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).send(xml);
    
  } catch (error) {
    console.error("Sitemap generation failed:", error);
    res.status(500).send('Error generating sitemap');
  }
}