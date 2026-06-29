const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const SESSION_KEY = 'zivora_session_id';

const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
};

export const trackEvent = async (eventType, payload = {}) => {
  try {
    await fetch(`${API_BASE_URL}/public/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: getSessionId(),
        eventType,
        path: window.location.pathname,
        referrer: document.referrer,
        ...payload,
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

export const trackAddToCart = (productId) =>
  trackEvent('add_to_cart', { productId });

export const trackCheckoutStart = () => trackEvent('checkout_start');
