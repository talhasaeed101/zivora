export const ROUTES = {
  home: '/?home=true',
  search: '/?search=true',
  product: '/?product=true',
  cart: '/?cart=true',
  login: '/login',
  register: '/register',
  profile: '/profile',
};

export function navigateTo(path) {
  window.location.href = path;
}

export function homeSection(hash) {
  return `/?home=true#${hash}`;
}

export const FOOTER_LINKS = {
  Home: ROUTES.home,
  Collection: ROUTES.search,
  Collections: ROUTES.search,
  Gifts: ROUTES.search,
  Testimonials: homeSection('testimonials'),
  Contact: homeSection('contact'),
};

export const NAV_ROUTES = {
  HOME: ROUTES.home,
  COLLECTION: ROUTES.search,
  BUNDLES: homeSection('bundles'),
  TESTIMONIALS: homeSection('testimonials'),
  CONTACT: homeSection('contact'),
};

export function getAccountRoute(isAuthenticated) {
  return isAuthenticated ? ROUTES.profile : ROUTES.login;
}
