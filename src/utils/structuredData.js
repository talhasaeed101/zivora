import { ABOUT_FAQ, CONTACT_FAQ, SEO_BRAND_NAME, SEO_CURRENCY, SEO_SOCIAL_PROFILES } from '../constants/seo.js';
import { isCatalogOutOfStock } from './inventory.js';
import { absoluteUrl, truncateText } from './seo.js';

export const organizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SEO_BRAND_NAME,
  url: absoluteUrl('/'),
  logo: absoluteUrl('/favicon.ico'),
  sameAs: SEO_SOCIAL_PROFILES,
});

export const websiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SEO_BRAND_NAME,
  url: absoluteUrl('/'),
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${absoluteUrl('/search')}?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

export const faqJsonLd = (entries) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: entries.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
});

export const aboutFaqJsonLd = () => faqJsonLd(ABOUT_FAQ);
export const contactFaqJsonLd = () => faqJsonLd(CONTACT_FAQ);

export const productJsonLd = (product, { url } = {}) => {
  if (!product) {
    return null;
  }

  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const inStock = !isCatalogOutOfStock(product);
  const description = truncateText(
    product.shortDescription || product.description || `${product.title} from Zivorah.`,
    300
  );

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description,
    sku: product.sku || undefined,
    image: images.map((src) => absoluteUrl(src)),
    brand: {
      '@type': 'Brand',
      name: SEO_BRAND_NAME,
    },
    offers: {
      '@type': 'Offer',
      url: url || absoluteUrl(`/product/${product.slug}`),
      priceCurrency: SEO_CURRENCY,
      price: Number(product.price) || 0,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  const reviewCount = Number(product.reviewCount) || 0;
  const rating = Number(product.averageRating) || 0;
  if (reviewCount > 0 && rating > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount,
    };
  }

  return data;
};
