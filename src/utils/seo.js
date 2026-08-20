import { SEO_DEFAULT_OG_IMAGE } from '../constants/seo.js';

const DEFAULT_ORIGIN = 'https://zivorah.store';

export const getSiteOrigin = () => {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    const { origin, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return DEFAULT_ORIGIN;
    }
    return origin.replace(/\/$/, '');
  }

  return DEFAULT_ORIGIN;
};

export const absoluteUrl = (path = '/') => {
  if (!path) {
    return getSiteOrigin();
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteOrigin()}${normalized}`;
};

export const canonicalPath = (path = '/') => {
  if (!path || path === '/?home=true' || path.startsWith('/?home=')) {
    return '/';
  }

  const [pathname, search = ''] = path.split('?');
  if (!search) {
    return pathname || '/';
  }

  const params = new URLSearchParams(search);
  params.delete('home');
  params.delete('product');
  params.delete('search');
  const next = params.toString();
  return next ? `${pathname}?${next}` : pathname || '/';
};

export const truncateText = (value, max = 160) => {
  const text = String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= max) {
    return text;
  }

  return `${text.slice(0, max - 1).trim()}…`;
};

export const defaultShareImage = () => absoluteUrl(SEO_DEFAULT_OG_IMAGE);

export const formatSeoTitle = (title, { siteName = 'Zivorah' } = {}) => {
  const trimmed = String(title || '').trim();
  if (!trimmed) {
    return `${siteName} | Premium Jewelry`;
  }
  if (trimmed.includes(siteName)) {
    return trimmed;
  }
  return `${trimmed} | ${siteName}`;
};
