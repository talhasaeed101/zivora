import { resolveApiBaseUrl } from './apiBaseUrl.js';

const API_BASE_URL = resolveApiBaseUrl();

const SESSION_KEY = 'zivora_session_id';

const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
};

/** Strip undefined / empty values; never send emails or PII. */
const sanitizePayload = (payload = {}) => {
  const next = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (key.toLowerCase().includes('email') || key.toLowerCase().includes('phone')) return;
    next[key] = value;
  });
  return next;
};

export const trackEvent = async (eventType, payload = {}) => {
  try {
    await fetch(`${API_BASE_URL}/public/engagement/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: getSessionId(),
        eventType,
        path: window.location.pathname,
        referrer: document.referrer,
        ...sanitizePayload(payload),
      }),
    });
  } catch {
    // non-blocking analytics
  }
};

export const trackPageView = () => trackEvent('pageview');

export const trackProductView = (product) =>
  trackEvent('product_view', {
    productId: product?._id,
    productSlug: product?.slug,
  });

export const trackPersonalizationStart = ({ productId, productSlug } = {}) =>
  trackEvent('personalization_start', {
    productId: productId || undefined,
    productSlug: productSlug || undefined,
  });

export const trackAddToCart = (productId) =>
  trackEvent('add_to_cart', { productId });

export const trackCheckoutStart = () => trackEvent('checkout_start');

export const trackPurchase = ({ productId, productSlug } = {}) =>
  trackEvent('purchase', {
    productId: productId || undefined,
    productSlug: productSlug || undefined,
  });

export const trackRelatedProductClick = ({ productId, sourceProductId } = {}) =>
  trackEvent('related_product_click', {
    productId: productId || undefined,
    sourceProductId: sourceProductId || undefined,
  });

export const trackRecentlyViewedClick = ({ productId } = {}) =>
  trackEvent('recently_viewed_click', {
    productId: productId || undefined,
  });

export const trackCampaignClick = ({ campaignId, campaignSlug, href } = {}) =>
  trackEvent('campaign_click', {
    campaignId: campaignId || undefined,
    campaignSlug: campaignSlug || undefined,
    href: href || undefined,
  });

export const trackGiftIdeaClick = ({ productId, sectionKey } = {}) =>
  trackEvent('gift_idea_click', {
    productId: productId || undefined,
    sectionKey: sectionKey || undefined,
  });

export const trackWishlistAdd = ({ productId, productSlug } = {}) =>
  trackEvent('wishlist_add', {
    productId: productId || undefined,
    productSlug: productSlug || undefined,
  });

export const trackWishlistRemove = ({ productId, productSlug } = {}) =>
  trackEvent('wishlist_remove', {
    productId: productId || undefined,
    productSlug: productSlug || undefined,
  });

export const trackWishlistView = () => trackEvent('wishlist_view');

export const trackWishlistAddToCart = ({ productId, productSlug } = {}) =>
  trackEvent('wishlist_add_to_cart', {
    productId: productId || undefined,
    productSlug: productSlug || undefined,
  });

export const trackWishlistProductClick = ({ productId, productSlug } = {}) =>
  trackEvent('wishlist_product_click', {
    productId: productId || undefined,
    productSlug: productSlug || undefined,
  });
