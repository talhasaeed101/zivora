import { resolveApiBaseUrl } from '../utils/apiBaseUrl.js';
import { toast } from '../context/ToastContext.jsx';

const API_BASE_URL = resolveApiBaseUrl();

const TOKEN_KEY = 'zivora_customer_token';

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

let onUnauthorized = null;

export const setOnUnauthorized = (handler) => {
  onUnauthorized = typeof handler === 'function' ? handler : null;
};

const clearSessionOnUnauthorized = (hadToken) => {
  if (!hadToken) {
    return;
  }

  setStoredToken(null);
  onUnauthorized?.();
};

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

async function request(endpoint, options = {}) {
  const { suppressErrorToast = false, headers: optionHeaders, ...fetchOptions } = options;
  const token = getStoredToken();
  const hadToken = Boolean(token);
  const headers = {
    'Content-Type': 'application/json',
    ...optionHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });
  } catch (networkError) {
    if (networkError?.name === 'AbortError') {
      throw networkError;
    }

    const hint =
      networkError?.message?.includes('Failed to fetch')
        ? 'Unable to reach the server.'
        : networkError.message || 'Network request failed';

    throw new Error(`${hint} [${fetchOptions.method || 'GET'} ${API_BASE_URL}${endpoint}]`, {
      cause: networkError,
    });
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    clearSessionOnUnauthorized(hadToken);
  }

  if (!response.ok) {
    const validationErrors = data.errors || (Array.isArray(data.data) ? data.data : null);
    const details = validationErrors?.length
      ? validationErrors.map((item) => item.msg || item.message).filter(Boolean).join(', ')
      : data.errorMessage || '';
    const rateLimitedMessage =
      response.status === 429
        ? 'Too many requests. Please wait a few minutes and try again.'
        : '';
    const message =
      rateLimitedMessage || details || data.message || `Request failed (${response.status})`;
    const error = new Error(message);
    // Attach additional data to the error object for frontend handling
    error.data = data;
    error.status = response.status;

    // Automatically show toast for mutation errors unless suppressed by the caller
    if (fetchOptions.method && fetchOptions.method !== 'GET' && !suppressErrorToast) {
      toast.error(message);
    }

    throw error;
  }

  return data;
}

export const customerAuthApi = {
  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  googleLogin: (token) =>
    request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  getProfile: () => request('/auth/profile'),

  forgotPassword: (email) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token, password, confirmPassword) =>
    request(`/auth/reset-password/${encodeURIComponent(token)}`, {
      method: 'POST',
      body: JSON.stringify({ password, confirmPassword }),
    }),

  verifyEmail: (token) =>
    request(`/auth/verify-email/${encodeURIComponent(token)}`, {
      method: 'POST',
    }),

  resendVerificationEmail: (email) =>
    request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};

export const publicCatalogApi = {
  getPublicCategories: (options = {}) => request('/public/categories', options),

  getPublicProducts: (params = {}, options = {}) =>
    request(`/public/products${buildQueryString(params)}`, options),

  getPublicProductBySlug: (slug, options = {}) =>
    request(`/public/products/${encodeURIComponent(slug)}`, options),

  getRelatedProducts: (productId, params = {}, options = {}) =>
    request(
      `/public/products/${encodeURIComponent(productId)}/related${buildQueryString(params)}`,
      options
    ),

  getProductsByIds: (ids = [], options = {}) =>
    request(`/public/products/by-ids${buildQueryString({ ids: ids.join(',') })}`, options),

  getGiftIdeas: (params = {}, options = {}) =>
    request(`/public/products/gift-ideas${buildQueryString(params)}`, options),

  suggestProducts: (params = {}, options = {}) =>
    request(`/public/products/suggest${buildQueryString(params)}`, options),
};

export const cartApi = {
  getCart: () => request('/cart'),

  quoteCart: (payload = {}) =>
    request('/cart/quote', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  addToCart: (payload) =>
    request('/cart/items', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateCartItem: (itemId, payload) =>
    request(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  removeCartItem: (itemId) =>
    request(`/cart/items/${itemId}`, {
      method: 'DELETE',
    }),

  clearCart: () =>
    request('/cart/clear', {
      method: 'DELETE',
    }),

  saveItemForLater: (itemId) =>
    request(`/cart/items/${itemId}/save-for-later`, {
      method: 'POST',
    }),

  moveSavedToCart: (itemId) =>
    request(`/cart/saved/${itemId}/move-to-cart`, {
      method: 'POST',
    }),

  removeSavedItem: (itemId) =>
    request(`/cart/saved/${itemId}`, {
      method: 'DELETE',
    }),

  mergeGuestSavedItems: (items) =>
    request('/cart/saved/merge', {
      method: 'POST',
      body: JSON.stringify({ items }),
      suppressErrorToast: true,
    }),
};

export const publicCampaignApi = {
  getActive: (options = {}) => request('/public/campaigns/active', options),

  getBySlug: (slug, params = {}, options = {}) =>
    request(`/public/campaigns/${encodeURIComponent(slug)}${buildQueryString(params)}`, options),
};

export const addressApi = {
  getAddresses: () => request('/addresses'),

  getDefaultAddress: () => request('/addresses/default'),

  createAddress: (payload) =>
    request('/addresses', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateAddress: (id, payload) =>
    request(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteAddress: (id) =>
    request(`/addresses/${id}`, {
      method: 'DELETE',
    }),

  setDefaultAddress: (id) =>
    request(`/addresses/${id}/default`, {
      method: 'PATCH',
    }),
};

export const orderApi = {
  checkout: (payload) =>
    request('/checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getOrders: () => request('/orders'),

  getOrder: (id) => request(`/orders/${id}`),
};

export const promoCodeApi = {
  validatePromoCode: (payload) =>
    request('/promo-codes/validate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export const publicEngagementApi = {
  submitContact: (payload) =>
    request('/public/engagement/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  subscribeNewsletter: (payload) =>
    request('/public/engagement/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export const backInStockApi = {
  subscribe: (payload, options = {}) =>
    request('/back-in-stock', {
      method: 'POST',
      body: JSON.stringify(payload),
      suppressErrorToast: true,
      ...options,
    }),
};

export const priceAlertApi = {
  subscribe: (payload, options = {}) =>
    request('/price-alerts', {
      method: 'POST',
      body: JSON.stringify(payload),
      suppressErrorToast: true,
      ...options,
    }),

  listMine: (options = {}) => request('/price-alerts/me', options),

  cancelMine: (id, options = {}) =>
    request(`/price-alerts/me/${id}`, {
      method: 'DELETE',
      suppressErrorToast: true,
      ...options,
    }),

  unsubscribe: (token, options = {}) =>
    request(`/price-alerts/unsubscribe/${encodeURIComponent(token)}`, {
      method: 'DELETE',
      suppressErrorToast: true,
      ...options,
    }),
};

export const wishlistApi = {
  getWishlist: () => request('/wishlist'),

  addToWishlist: (productId) =>
    request(`/wishlist/${productId}`, {
      method: 'POST',
    }),

  removeFromWishlist: (productId) =>
    request(`/wishlist/${productId}`, {
      method: 'DELETE',
    }),

  toggleWishlist: (productId) =>
    request(`/wishlist/${productId}/toggle`, {
      method: 'POST',
    }),
};

export const loyaltyApi = {
  getAccount: (options = {}) => request('/loyalty', options),

  getHistory: (params = {}, options = {}) =>
    request(`/loyalty/history${buildQueryString(params)}`, options),

  getSummary: (options = {}) => request('/loyalty/summary', options),

  redeem: (payload, options = {}) =>
    request('/loyalty/redeem', {
      method: 'POST',
      body: JSON.stringify(payload),
      suppressErrorToast: true,
      ...options,
    }),
};

export const socialProofApi = {
  getProduct: (slug, options = {}) =>
    request(`/social-proof/product/${encodeURIComponent(slug)}`, {
      suppressErrorToast: true,
      ...options,
    }),

  getHome: (options = {}) =>
    request('/social-proof/home', {
      suppressErrorToast: true,
      ...options,
    }),
};

export const uploadApi = {
  uploadCustomizationImage: async (file) => {
    const token = getStoredToken();
    const hadToken = Boolean(token);
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/uploads/customization-image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      clearSessionOnUnauthorized(hadToken);
    }

    if (!response.ok) {
      throw new Error(data.message || 'Unable to upload image');
    }

    return data;
  },

  uploadReviewImage: async (file) => {
    const token = getStoredToken();
    const hadToken = Boolean(token);
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/uploads/review-image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      clearSessionOnUnauthorized(hadToken);
    }

    if (!response.ok) {
      throw new Error(data.message || 'Unable to upload review image');
    }

    return data;
  },
};

export const notificationApi = {
  getNotifications: (params = {}) => request(`/users/notifications${buildQueryString(params)}`),
  getUnreadCount: () => request('/users/notifications/unread-count'),
  markAsRead: (id) => request(`/users/notifications/${id}/read`, { method: 'PATCH' }),
  markAllAsRead: () => request('/users/notifications/read-all', { method: 'PATCH' }),
};

export const ticketApi = {
  submitTicket: (data) => request('/users/support/tickets', {
    method: 'POST', body: JSON.stringify(data) }),
  getTickets: (params = {}) => request(`/users/support/tickets${buildQueryString(params)}`),
  getTicket: (id) => request(`/users/support/tickets/${id}`),
  replyToTicket: (id, message) => request(`/users/support/tickets/${id}/reply`, {
    method: 'POST', body: JSON.stringify({ message }) }),
};

export const reviewApi = {
  getProductReviews: (productId, params = {}) =>
    request(`/public/products/${productId}/reviews${buildQueryString(params)}`),

  getProductReviewSummary: (productId) =>
    request(`/public/products/${productId}/reviews/summary`),

  getProductReviewHighlights: (productId) =>
    request(`/public/products/${productId}/reviews/highlights`),

  getMyReviewForProduct: (productId) => request(`/reviews/product/${productId}`),

  createReview: (payload) =>
    request('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateReview: (id, payload) =>
    request(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteReview: (id) =>
    request(`/reviews/${id}`, {
      method: 'DELETE',
    }),

  likeReview: (id) =>
    request(`/reviews/${id}/like`, {
      method: 'POST',
    }),

  dislikeReview: (id) =>
    request(`/reviews/${id}/dislike`, {
      method: 'POST',
    }),

  voteReview: (id, voteType) =>
    request(`/reviews/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    }),

  removeVote: (id) =>
    request(`/reviews/${id}/vote`, {
      method: 'DELETE',
    }),
};
