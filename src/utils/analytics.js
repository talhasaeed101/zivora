import { resolveApiBaseUrl } from './apiBaseUrl.js';

const API_BASE_URL = resolveApiBaseUrl();

const VISITOR_KEY = 'zivora_visitor_id';
const SESSION_KEY = 'zivora_session_id';
const SESSION_STARTED_KEY = 'zivora_session_started';
const SESSION_ACTIVITY_KEY = 'zivora_session_activity';
const UTM_KEY = 'zivora_utm';
const SESSION_IDLE_MS = 30 * 60 * 1000;

const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `ziv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const getVisitorId = () => {
  try {
    let visitorId = localStorage.getItem(VISITOR_KEY);
    if (!visitorId) {
      // Migrate previous persistent session key to visitor id (one-time).
      const legacy = localStorage.getItem(SESSION_KEY);
      visitorId = legacy || createId();
      localStorage.setItem(VISITOR_KEY, visitorId);
    }
    return visitorId;
  } catch {
    return createId();
  }
};

const touchSession = () => {
  const now = Date.now();
  try {
    const lastActivity = Number(sessionStorage.getItem(SESSION_ACTIVITY_KEY) || 0);
    let sessionId = sessionStorage.getItem(SESSION_KEY);

    if (!sessionId || (lastActivity && now - lastActivity > SESSION_IDLE_MS)) {
      sessionId = createId();
      sessionStorage.setItem(SESSION_KEY, sessionId);
      sessionStorage.removeItem(SESSION_STARTED_KEY);
    }

    sessionStorage.setItem(SESSION_ACTIVITY_KEY, String(now));
    return sessionId;
  } catch {
    return createId();
  }
};

const captureUtmsFromLocation = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');
    if (!utmSource && !utmMedium && !utmCampaign) {
      return getStoredUtms();
    }
    const utm = {
      utmSource: utmSource || undefined,
      utmMedium: utmMedium || undefined,
      utmCampaign: utmCampaign || undefined,
    };
    sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
    return utm;
  } catch {
    return {};
  }
};

const getStoredUtms = () => {
  try {
    const raw = sessionStorage.getItem(UTM_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const classifyDeviceType = () => {
  const ua = navigator.userAgent || '';
  if (/iPad|Tablet|Kindle|Silk|(Android(?!.*Mobile))/i.test(ua)) return 'tablet';
  if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return 'mobile';
  return 'desktop';
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

let lastPageViewKey = '';
let lastPageViewAt = 0;

export const trackEvent = async (eventType, payload = {}) => {
  try {
    const sessionId = touchSession();
    const visitorId = getVisitorId();
    const utm = captureUtmsFromLocation();

    // Fire session_start once per browser session (after idle refresh).
    if (eventType === 'pageview') {
      try {
        if (!sessionStorage.getItem(SESSION_STARTED_KEY)) {
          sessionStorage.setItem(SESSION_STARTED_KEY, '1');
          await fetch(`${API_BASE_URL}/public/engagement/analytics/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              visitorId,
              eventType: 'session_start',
              path: window.location.pathname,
              referrer: document.referrer || undefined,
              deviceType: classifyDeviceType(),
              ...utm,
            }),
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        /* ignore */
      }
    }

    if (eventType === 'pageview') {
      const key = `${sessionId}:${window.location.pathname}`;
      const now = Date.now();
      if (key === lastPageViewKey && now - lastPageViewAt < 2000) {
        return;
      }
      lastPageViewKey = key;
      lastPageViewAt = now;
    }

    await fetch(`${API_BASE_URL}/public/engagement/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        visitorId,
        eventType,
        path: window.location.pathname,
        referrer: document.referrer || undefined,
        deviceType: classifyDeviceType(),
        ...utm,
        ...sanitizePayload(payload),
      }),
      keepalive: true,
    });
  } catch {
    // non-blocking analytics — never break shopping flows
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

export const trackAddToCart = (productId, productSlug) =>
  trackEvent('add_to_cart', {
    productId,
    productSlug: productSlug || undefined,
  });

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
