export const ROUTES = {
  home: '/?home=true',
  search: '/search',
  collection: '/collection',
  product: '/?product=true',
  cart: '/cart',
  orders: '/orders',
  about: '/about',
  contact: '/contact',
  login: '/login',
  register: '/register',
  profile: '/profile',
  wishlist: '/wishlist',
  privacyPolicy: '/privacy-policy',
  termsOfUse: '/terms-of-use',
};

export function categoryPath(slug) {
  if (!slug) {
    return ROUTES.collection;
  }

  return `/category/${slug}`;
}

export function orderPath(id) {
  if (!id) {
    return ROUTES.orders;
  }

  return `/orders/${id}`;
}

export function productPath(slug) {
  if (!slug) {
    return ROUTES.product;
  }

  return `/product/${slug}`;
}

export function searchPath({ q, category } = {}) {
  const params = new URLSearchParams();

  if (q) {
    params.set('q', q);
  }

  if (category) {
    params.set('category', category);
  }

  const query = params.toString();
  return query ? `${ROUTES.search}?${query}` : ROUTES.search;
}

/** @deprecated Legacy query route — still supported via LegacyPages */
export function legacySearchPath({ q, category } = {}) {
  const params = new URLSearchParams({ search: 'true' });

  if (q) {
    params.set('q', q);
  }

  if (category) {
    params.set('category', category);
  }

  return `/?${params.toString()}`;
}

export function navigateTo(path) {
  window.location.href = path;
}

export function homeSection(hash) {
  return `/?home=true#${hash}`;
}

export const FOOTER_LINKS = {
  Home: ROUTES.home,
  Collection: ROUTES.collection,
  Collections: ROUTES.collection,
  Gifts: ROUTES.collection,
  Testimonials: homeSection('testimonials'),
  Contact: ROUTES.contact,
  About: ROUTES.about,
};

export const NAV_ROUTES = {
  HOME: ROUTES.home,
  COLLECTION: ROUTES.collection,
  BUNDLES: homeSection('bundles'),
  TESTIMONIALS: homeSection('testimonials'),
  CONTACT: ROUTES.contact,
};

export function getAccountRoute(isAuthenticated) {
  return isAuthenticated ? ROUTES.profile : ROUTES.login;
}

export function getSearchQueryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('q') || params.get('query') || '';
}

export function getSearchCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('category') || '';
}
