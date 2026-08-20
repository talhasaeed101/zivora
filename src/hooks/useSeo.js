import { useEffect } from 'react';
import { SEO_SITE_NAME } from '../constants/seo.js';
import {
  absoluteUrl,
  canonicalPath,
  defaultShareImage,
  formatSeoTitle,
  truncateText,
} from '../utils/seo.js';

const ATTR = 'data-zivorah-seo';

const upsertTag = (selector, create) => {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = create();
    node.setAttribute(ATTR, 'true');
    document.head.appendChild(node);
  }
  return node;
};

const setMeta = (key, value, { property = false } = {}) => {
  if (!value) {
    return;
  }
  const attr = property ? 'property' : 'name';
  const selector = `meta[${attr}="${key}"]`;
  const node = upsertTag(selector, () => {
    const meta = document.createElement('meta');
    meta.setAttribute(attr, key);
    return meta;
  });
  node.setAttribute('content', value);
};

const setLink = (rel, href) => {
  if (!href) {
    return;
  }
  const selector = `link[rel="${rel}"]`;
  const node = upsertTag(selector, () => {
    const link = document.createElement('link');
    link.setAttribute('rel', rel);
    return link;
  });
  node.setAttribute('href', href);
};

export function useSeo({
  title,
  description,
  path,
  robots = 'index, follow',
  image,
  type = 'website',
  prefetch = [],
} = {}) {
  const prefetchKey = Array.isArray(prefetch) ? prefetch.join('|') : '';

  useEffect(() => {
    const fullTitle = formatSeoTitle(title, { siteName: SEO_SITE_NAME });
    const desc = truncateText(description, 160);
    const canonical = absoluteUrl(canonicalPath(path || window.location.pathname));
    const shareImage = image ? absoluteUrl(image) : defaultShareImage();
    const previousTitle = document.title;
    const prefetchList = prefetchKey ? prefetchKey.split('|').filter(Boolean) : [];

    document.title = fullTitle;
    setMeta('description', desc);
    setMeta('robots', robots);
    setLink('canonical', canonical);

    setMeta('og:site_name', SEO_SITE_NAME, { property: true });
    setMeta('og:type', type, { property: true });
    setMeta('og:title', fullTitle, { property: true });
    setMeta('og:description', desc, { property: true });
    setMeta('og:url', canonical, { property: true });
    setMeta('og:image', shareImage, { property: true });
    setMeta('og:image:alt', fullTitle, { property: true });
    setMeta('og:locale', 'en_PK', { property: true });

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', shareImage);
    setMeta('twitter:image:alt', fullTitle);

    const prefetchNodes = prefetchList.map((href) => {
      const link = document.createElement('link');
      link.setAttribute(ATTR, 'prefetch');
      link.rel = 'prefetch';
      link.href = href.startsWith('http') ? href : absoluteUrl(href);
      document.head.appendChild(link);
      return link;
    });

    return () => {
      document.title = previousTitle;
      prefetchNodes.forEach((node) => node.remove());
    };
  }, [title, description, path, robots, image, type, prefetchKey]);
}

export function usePrivatePageSeo({ title, description, path } = {}) {
  useSeo({
    title,
    description:
      description || 'This Zivorah page is private and is not available for search indexing.',
    path,
    robots: 'noindex, nofollow',
  });
}
