import { resolveApiBaseUrl } from '../utils/apiBaseUrl.js';

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
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkError) {
    const hint =
      networkError?.message?.includes('Failed to fetch')
        ? 'Unable to reach the server.'
        : networkError.message || 'Network request failed';

    throw new Error(`${hint} [${options.method || 'GET'} ${API_BASE_URL}${endpoint}]`, {
      cause: networkError,
    });
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    setStoredToken(null);
  }

  if (!response.ok) {
    const validationErrors = data.errors || (Array.isArray(data.data) ? data.data : null);
    const details = validationErrors?.length
      ? validationErrors.map((item) => item.msg || item.message).filter(Boolean).join(', ')
      : data.errorMessage || '';
    const message = details || data.message || `Request failed (${response.status})`;
    throw new Error(message);
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
};

export const publicCatalogApi = {
  getPublicCategories: () => request('/public/categories'),

  getPublicProducts: (params = {}) => request(`/public/products${buildQueryString(params)}`),

  getPublicProductBySlug: (slug) => request(`/public/products/${encodeURIComponent(slug)}`),
};

export const cartApi = {
  getCart: () => request('/cart'),

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

export const uploadApi = {
  uploadCustomizationImage: async (file) => {
    const token = getStoredToken();
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/uploads/customization-image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Unable to upload image');
    }

    return data;
  },
};

export const reviewApi = {
  getProductReviews: (productId, params = {}) =>
    request(`/public/products/${productId}/reviews${buildQueryString(params)}`),

  getProductReviewSummary: (productId) =>
    request(`/public/products/${productId}/reviews/summary`),

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
};
