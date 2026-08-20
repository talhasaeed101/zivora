import { useEffect } from 'react';

const DEFAULT_TITLE = 'Zivorah Pakistan | Premium Jewelry';
const DEFAULT_DESCRIPTION = 'Shop premium jewelry in Pakistan. Discover premium rings, necklaces, bracelets and personalized gifts with fast nationwide delivery.';
const DEFAULT_IMAGE = 'https://zivorah.store/favicon.ico';

export function useSEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  url,
  image = DEFAULT_IMAGE,
  type = 'website',
  schema,
  canonicalUrl,
}) {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // Helper to update or create meta tags
    const updateMetaTag = (selector, attribute, value) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        
        // Handle attribute creation (name vs property)
        if (selector.includes('name=')) {
          const name = selector.match(/name="([^"]+)"/)[1];
          element.setAttribute('name', name);
        } else if (selector.includes('property=')) {
          const property = selector.match(/property="([^"]+)"/)[1];
          element.setAttribute('property', property);
        }
        
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    // 2. Update Description
    updateMetaTag('meta[name="description"]', 'content', description);

    // 3. Update Open Graph
    updateMetaTag('meta[property="og:title"]', 'content', title);
    updateMetaTag('meta[property="og:description"]', 'content', description);
    updateMetaTag('meta[property="og:type"]', 'content', type);
    updateMetaTag('meta[property="og:image"]', 'content', image);
    if (url) updateMetaTag('meta[property="og:url"]', 'content', url);

    // 4. Update Twitter
    updateMetaTag('meta[name="twitter:title"]', 'content', title);
    updateMetaTag('meta[name="twitter:description"]', 'content', description);
    updateMetaTag('meta[name="twitter:image"]', 'content', image);
    if (url) updateMetaTag('meta[name="twitter:url"]', 'content', url);
    updateMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');

    // 5. Update Canonical URL
    if (canonicalUrl || url) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl || url);
    }

    // 6. Update Schema (JSON-LD)
    let scriptEl = null;
    if (schema) {
      scriptEl = document.createElement('script');
      scriptEl.type = 'application/ld+json';
      scriptEl.innerHTML = JSON.stringify(schema);
      scriptEl.id = 'dynamic-schema';
      // Remove old dynamic schema if exists
      const oldSchema = document.getElementById('dynamic-schema');
      if (oldSchema) {
        oldSchema.remove();
      }
      document.head.appendChild(scriptEl);
    }

    return () => {
      if (scriptEl) {
        scriptEl.remove();
      }
    };
  }, [title, description, url, image, type, schema, canonicalUrl]);
}
