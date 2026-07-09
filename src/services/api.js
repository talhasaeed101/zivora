const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://zivorabackend.vercel.app/api/v1';

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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    setStoredToken(null);
  }

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
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

// export const publicEngagementApi = {
//   submitContact: (payload) =>
//     request('/public/contact', {
//       method: 'POST',
//       body: JSON.stringify(payload),
//     }),

//   subscribeNewsletter: (payload) =>
//     request('/public/newsletter/subscribe', {
//       method: 'POST',
//       body: JSON.stringify(payload),
//     }),
// };

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
