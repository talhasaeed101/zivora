import { hasSale } from './products.js';
import { getProductInventory, isCatalogOutOfStock } from './inventory.js';

/** Total units across cells — low-stock threshold for wishlist shopping status. */
export const WISHLIST_LOW_STOCK_THRESHOLD = 3;

export const WISHLIST_SORT_OPTIONS = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'title_asc', label: 'Name: A to Z' },
  { value: 'title_desc', label: 'Name: Z to A' },
];

export const WISHLIST_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'on_sale', label: 'On Sale' },
];

export function getWishlistAvailableQuantity(product) {
  const inventory = getProductInventory(product);

  if (inventory.length > 0) {
    return inventory.reduce((sum, row) => sum + (Math.max(0, Number(row.quantity) || 0)), 0);
  }

  if (typeof product?.stock === 'number' && Number.isFinite(product.stock)) {
    return Math.max(0, product.stock);
  }

  return 0;
}

/**
 * Real availability for wishlist display — uses existing inventory helpers only.
 * @returns {'in_stock' | 'low_stock' | 'out_of_stock'}
 */
export function getWishlistStockStatus(product) {
  if (!product || (product.status && product.status !== 'active')) {
    return 'out_of_stock';
  }

  if (isCatalogOutOfStock(product)) {
    return 'out_of_stock';
  }

  const quantity = getWishlistAvailableQuantity(product);
  if (quantity > 0 && quantity <= WISHLIST_LOW_STOCK_THRESHOLD) {
    return 'low_stock';
  }

  return 'in_stock';
}

export function getWishlistStockLabel(status) {
  if (status === 'out_of_stock') return 'Out of Stock';
  if (status === 'low_stock') return 'Low Stock';
  return 'In Stock';
}

/**
 * Price display facts from current catalog prices (no historical snapshot / no price-alert system).
 * `priceDropped` mirrors an active sale (oldPrice > price).
 */
export function getWishlistPriceStatus(product) {
  const current = Number(product?.price);
  const original = Number(product?.oldPrice);
  const onSale = hasSale(product);
  const priceDropped = onSale;

  return {
    current: Number.isFinite(current) ? current : null,
    original: Number.isFinite(original) && original > current ? original : null,
    onSale,
    priceDropped,
  };
}

export function sortWishlistProducts(products = [], sortKey = 'recent') {
  const list = [...(products || [])];

  if (sortKey === 'price_asc') {
    return list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
  }

  if (sortKey === 'price_desc') {
    return list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
  }

  if (sortKey === 'title_asc') {
    return list.sort((a, b) =>
      String(a.title || '').localeCompare(String(b.title || ''), undefined, { sensitivity: 'base' })
    );
  }

  if (sortKey === 'title_desc') {
    return list.sort((a, b) =>
      String(b.title || '').localeCompare(String(a.title || ''), undefined, { sensitivity: 'base' })
    );
  }

  // recently added — wishlist API returns products in storage order (newest $addToSet last)
  return list.reverse();
}

export function filterWishlistProducts(products = [], filterKey = 'all') {
  const list = products || [];

  if (filterKey === 'in_stock') {
    return list.filter((product) => getWishlistStockStatus(product) !== 'out_of_stock');
  }

  if (filterKey === 'out_of_stock') {
    return list.filter((product) => getWishlistStockStatus(product) === 'out_of_stock');
  }

  if (filterKey === 'on_sale') {
    return list.filter((product) => hasSale(product));
  }

  return list;
}

export function applyWishlistView(products = [], { sort = 'recent', filter = 'all' } = {}) {
  return sortWishlistProducts(filterWishlistProducts(products, filter), sort);
}
