import { SEO_CURRENCY } from '../constants/seo.js';

/**
 * Safely push ecommerce events to window.dataLayer for GTM / GA4 / Ads tracking.
 * Initializes window.dataLayer if not already present without overwriting it.
 */
function pushToDataLayer(payload) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

/**
 * Resolves the currency from the given entity, falling back to SEO_CURRENCY ('PKR').
 */
export function resolveCurrency(entity) {
  return (
    entity?.currency ||
    entity?.priceCurrency ||
    entity?.currencyCode ||
    SEO_CURRENCY
  );
}

const PURCHASE_TRACKED_KEY = 'zivora_tracked_purchases';
const MAX_TRACKED_PURCHASES = 30;

/**
 * Check if a transaction ID has already been tracked in the current browser session.
 */
export function isPurchaseTracked(transactionId) {
  if (!transactionId || typeof window === 'undefined') return false;
  try {
    const raw = sessionStorage.getItem(PURCHASE_TRACKED_KEY);
    if (!raw) return false;
    const tracked = JSON.parse(raw);
    return Array.isArray(tracked) && tracked.includes(String(transactionId));
  } catch {
    return false;
  }
}

/**
 * Record a transaction ID as tracked in the current browser session (bounded list).
 */
export function markPurchaseTracked(transactionId) {
  if (!transactionId || typeof window === 'undefined') return;
  try {
    const raw = sessionStorage.getItem(PURCHASE_TRACKED_KEY);
    let tracked = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) tracked = parsed;
    }
    const idStr = String(transactionId);
    if (!tracked.includes(idStr)) {
      tracked.push(idStr);
      if (tracked.length > MAX_TRACKED_PURCHASES) {
        tracked = tracked.slice(tracked.length - MAX_TRACKED_PURCHASES);
      }
      sessionStorage.setItem(PURCHASE_TRACKED_KEY, JSON.stringify(tracked));
    }
  } catch {
    // Graceful degradation when sessionStorage is blocked or unavailable
  }
}

/**
 * Map a product or cart/order item to standard GA4/GTM item object.
 */
export function mapItem(item, quantityFallback = 1) {
  if (!item) return null;
  const product = item?.product && typeof item.product === 'object' ? item.product : item;
  const itemId = String(
    item?.sku ||
    product?.sku ||
    item?.productId ||
    product?._id ||
    item?._id ||
    item?.id ||
    ''
  ).trim();

  const itemName = String(
    item?.title ||
    product?.title ||
    item?.name ||
    product?.name ||
    ''
  ).trim();

  const rawPrice =
    item?.price ??
    product?.price ??
    item?.unitPrice ??
    item?.basePrice ??
    0;
  const price = Number(rawPrice) || 0;

  const rawQuantity = item?.quantity ?? quantityFallback;
  const quantity = Math.max(1, Math.floor(Number(rawQuantity) || 1));

  const result = {
    item_id: itemId,
    item_name: itemName,
    price,
    quantity,
  };

  const itemCategory =
    typeof product?.category === 'object'
      ? product.category?.name
      : typeof item?.category === 'object'
      ? item.category?.name
      : undefined;
  if (itemCategory) {
    result.item_category = itemCategory;
  }

  const variant = item?.variantId || item?.ringSize || item?.metalColor;
  if (variant) {
    result.item_variant = [item.ringSize, item.metalColor].filter(Boolean).join(' / ') || String(variant);
  }

  return result;
}

/**
 * 1. Product View (view_item)
 */
export function pushViewItem({ product, currency }) {
  if (!product) return;
  const item = mapItem(product, 1);
  if (!item) return;

  const actualCurrency = currency || resolveCurrency(product);
  const actualPrice = item.price;

  pushToDataLayer({ ecommerce: null }); // Clear previous ecommerce object per GTM GA4 best practice
  pushToDataLayer({
    event: 'view_item',
    ecommerce: {
      currency: actualCurrency,
      value: actualPrice,
      items: [item],
    },
  });
}

/**
 * 2. Add to Cart (add_to_cart)
 */
export function pushAddToCart({ items, value, currency }) {
  const itemList = (Array.isArray(items) ? items : [items])
    .map((it) => (it && it.item_id ? it : mapItem(it, it?.quantity || 1)))
    .filter(Boolean);

  if (!itemList.length) return;

  const actualCurrency = currency || resolveCurrency(items?.[0] || items);
  const actualValue =
    typeof value === 'number'
      ? value
      : itemList.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);

  pushToDataLayer({ ecommerce: null });
  pushToDataLayer({
    event: 'add_to_cart',
    ecommerce: {
      currency: actualCurrency,
      value: actualValue,
      items: itemList,
    },
  });
}

/**
 * 3. Initiate Checkout (begin_checkout)
 */
export function pushBeginCheckout({ items, value, currency }) {
  const itemList = (Array.isArray(items) ? items : [items])
    .map((it) => (it && it.item_id ? it : mapItem(it, it?.quantity || 1)))
    .filter(Boolean);

  if (!itemList.length) return;

  const actualCurrency = currency || resolveCurrency(items?.[0] || items);
  const actualValue =
    typeof value === 'number'
      ? value
      : itemList.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);

  pushToDataLayer({ ecommerce: null });
  pushToDataLayer({
    event: 'begin_checkout',
    ecommerce: {
      currency: actualCurrency,
      value: actualValue,
      items: itemList,
    },
  });
}

/**
 * 4. Successful Purchase (purchase)
 */
export function pushPurchase({ orderId, value, currency, items }) {
  if (!orderId) return;

  const itemList = (Array.isArray(items) ? items : [items])
    .map((it) => (it && it.item_id ? it : mapItem(it, it?.quantity || 1)))
    .filter(Boolean);

  const actualCurrency = currency || resolveCurrency(items?.[0] || items);
  const actualValue = Number(value) || 0;

  pushToDataLayer({ ecommerce: null });
  pushToDataLayer({
    event: 'purchase',
    ecommerce: {
      transaction_id: String(orderId),
      currency: actualCurrency,
      value: actualValue,
      items: itemList,
    },
  });
}
