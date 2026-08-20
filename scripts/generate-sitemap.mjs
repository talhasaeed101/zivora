const STATIC_PATHS = [
  '/',
  '/collection',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-of-use',
];

const origin = (process.env.VITE_SITE_URL || 'https://zivorah.store').replace(/\/$/, '');
const apiBase = (process.env.VITE_API_URL || 'https://zivorabackend.vercel.app/api/v1').replace(
  /\/$/,
  ''
);

const urlset = (locs) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs
  .map(
    (loc) => `  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const fetchJson = async (path) => {
  const response = await fetch(`${apiBase}${path}`);
  if (!response.ok) {
    throw new Error(`Sitemap fetch failed ${response.status} ${path}`);
  }
  return response.json();
};

const unique = (values) => [...new Set(values.filter(Boolean))];

async function loadCatalogUrls() {
  const urls = [];

  try {
    const categories = await fetchJson('/public/categories');
    const list = categories.data || [];
    list.forEach((category) => {
      if (category?.slug) {
        urls.push(`${origin}/category/${category.slug}`);
      }
    });
  } catch (error) {
    console.warn('Sitemap: categories unavailable', error.message);
  }

  let page = 1;
  let hasNext = true;

  while (hasNext && page <= 50) {
    try {
      const payload = await fetchJson(`/public/products?page=${page}&limit=100`);
      const products = payload.data?.products || [];
      products.forEach((product) => {
        if (product?.slug) {
          urls.push(`${origin}/product/${product.slug}`);
        }
      });
      hasNext = Boolean(payload.data?.pagination?.hasNextPage);
      if (!payload.data?.pagination) {
        hasNext = products.length >= 100;
      }
      if (products.length === 0) {
        hasNext = false;
      }
      page += 1;
    } catch (error) {
      console.warn('Sitemap: products unavailable', error.message);
      hasNext = false;
    }
  }

  return urls;
}

const xml = urlset(
  unique([...STATIC_PATHS.map((path) => `${origin}${path}`), ...(await loadCatalogUrls())])
);

await import('node:fs/promises').then((fs) =>
  fs.writeFile(new URL('../public/sitemap.xml', import.meta.url), xml)
);

console.log('Wrote public/sitemap.xml');
