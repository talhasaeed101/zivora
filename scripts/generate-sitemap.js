import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://zivorah.store';
const API_URL = 'https://zivorabackend.vercel.app/api/v1';

async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/public/products?limit=1000`);
    const data = await res.json();
    return data?.data?.products || [];
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return [];
  }
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API_URL}/public/categories`);
    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
    return [];
  }
}

async function generateSitemap() {
  console.log('Generating sitemap...');
  const products = await fetchProducts();
  const categories = await fetchCategories();

  const staticRoutes = [
    '',
    '/collection',
    '/about',
    '/contact',
    '/login',
    '/register',
    '/privacy-policy',
    '/terms-of-use',
  ];

  const currentDate = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static routes
  staticRoutes.forEach(route => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${route}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n`;
    xml += `  </url>\n`;
  });

  // Add category pages
  categories.forEach(cat => {
    if (cat.slug) {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/category/${cat.slug}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    }
  });

  // Add product pages
  products.forEach(prod => {
    if (prod.slug) {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/product/${prod.slug}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    }
  });

  xml += '</urlset>';

  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, xml);
  console.log(`Sitemap generated successfully at ${outputPath}`);
}

generateSitemap();
