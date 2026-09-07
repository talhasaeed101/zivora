import { publicCatalogApi } from './api.js';

const TTL_MS = 5 * 60 * 1000;

const createStore = () => ({
  values: new Map(),
  inflight: new Map(),
});

const categoriesStore = createStore();
const productsStore = createStore();
const slugStore = createStore();

const readFresh = (store, key) => {
  const entry = store.values.get(key);
  if (!entry) {
    return null;
  }
  if (Date.now() - entry.at > TTL_MS) {
    store.values.delete(key);
    return null;
  }
  return entry.value;
};

const write = (store, key, value) => {
  store.values.set(key, { value, at: Date.now() });
  return value;
};

const loadWithStore = async (store, key, loader) => {
  const cached = readFresh(store, key);
  if (cached) {
    return cached;
  }

  const pending = store.inflight.get(key);
  if (pending) {
    return pending;
  }

  const request = loader()
    .then((value) => write(store, key, value))
    .finally(() => {
      store.inflight.delete(key);
    });

  store.inflight.set(key, request);
  return request;
};

export const loadPublicCategories = () =>
  loadWithStore(categoriesStore, 'all', async () => {
    const response = await publicCatalogApi.getPublicCategories();
    return response.data || [];
  });

export const loadPublicProducts = (params = {}, options = {}) => {
  const key = JSON.stringify(params);
  const cached = readFresh(productsStore, key);
  if (cached) {
    return Promise.resolve(cached);
  }

  if (options.signal) {
    return publicCatalogApi.getPublicProducts(params, options).then((response) => {
      write(productsStore, key, response);
      return response;
    });
  }

  return loadWithStore(productsStore, key, () => publicCatalogApi.getPublicProducts(params));
};

export const loadPublicProductBySlug = (slug) => {
  if (!slug) {
    return Promise.resolve(null);
  }

  return loadWithStore(slugStore, slug, async () => {
    const response = await publicCatalogApi.getPublicProductBySlug(slug);
    return response.data || null;
  });
};

export const loadRelatedProducts = (productId, params = {}) => {
  if (!productId) {
    return Promise.resolve([]);
  }

  const key = `related:${productId}:${JSON.stringify(params)}`;
  return loadWithStore(productsStore, key, async () => {
    const response = await publicCatalogApi.getRelatedProducts(productId, params);
    return response.data?.products || [];
  });
};

export const loadProductsByIds = (ids = []) => {
  const unique = [...new Set((ids || []).map((id) => String(id)).filter(Boolean))];
  if (!unique.length) {
    return Promise.resolve([]);
  }

  const key = `by-ids:${unique.join(',')}`;
  return loadWithStore(productsStore, key, async () => {
    const response = await publicCatalogApi.getProductsByIds(unique);
    return response.data?.products || [];
  });
};

export const loadGiftIdeas = (params = {}) =>
  loadWithStore(productsStore, `gift-ideas:${JSON.stringify(params)}`, async () => {
    const response = await publicCatalogApi.getGiftIdeas(params);
    return response.data?.sections || [];
  });

export const loadProductSuggestions = (params = {}, options = {}) => {
  const key = `suggest:${JSON.stringify(params)}`;
  const cached = readFresh(productsStore, key);
  if (cached) {
    return Promise.resolve(cached);
  }

  if (options.signal) {
    return publicCatalogApi.suggestProducts(params, options).then((response) => {
      write(productsStore, key, response);
      return response;
    });
  }

  return loadWithStore(productsStore, key, () => publicCatalogApi.suggestProducts(params));
};
