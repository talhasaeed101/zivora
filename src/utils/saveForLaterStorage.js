/**
 * Guest Save for Later — localStorage line items (variant/customization preserved).
 * Auth customers persist via /cart savedItems; guest list merges on login.
 */
const STORAGE_KEY = 'zivora_save_for_later';
export const SAVE_FOR_LATER_MAX = 20;

const normalizeOption = (value) => String(value || '').trim().toLowerCase();

export const buildSaveForLaterKey = ({
  productId,
  variantId = '',
  ringSize = '',
  metalColor = '',
  isCustomized = false,
  customizationKey = '',
} = {}) => {
  if (isCustomized && customizationKey) {
    return `c:${String(productId)}:${String(customizationKey)}`;
  }
  if (variantId) {
    return `v:${String(productId)}:${String(variantId)}`;
  }
  return `p:${String(productId)}:${normalizeOption(ringSize)}:${normalizeOption(metalColor)}`;
};

const readRaw = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => entry && entry.productId).slice(0, SAVE_FOR_LATER_MAX);
  } catch {
    return [];
  }
};

const writeRaw = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, SAVE_FOR_LATER_MAX)));
  } catch {
    // quota / private mode
  }
};

export const getGuestSavedItems = () => readRaw();

export const clearGuestSavedItems = () => {
  writeRaw([]);
  return [];
};

/**
 * Add or reject duplicate. Returns { items, added, reason }.
 */
export const addGuestSavedItem = (item) => {
  const productId = String(item?.productId || '').trim();
  if (!productId) {
    return { items: readRaw(), added: false, reason: 'invalid' };
  }

  const nextItem = {
    clientId: String(item.clientId || `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    productId,
    title: item.title || '',
    image: item.image || '',
    price: Number(item.price) || 0,
    oldPrice: item.oldPrice ?? null,
    quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
    ringSize: item.ringSize || '',
    metalColor: item.metalColor || '',
    variantId: item.variantId ? String(item.variantId) : '',
    material: item.material || '',
    sku: item.sku || '',
    isCustomized: Boolean(item.isCustomized),
    customization: item.customization || null,
    customizationKey: item.customizationKey || '',
    basePrice: item.basePrice ?? item.price,
    extraPrice: item.extraPrice || 0,
    slug: item.slug || '',
  };

  const key = buildSaveForLaterKey(nextItem);
  const current = readRaw();
  if (current.some((entry) => buildSaveForLaterKey(entry) === key)) {
    return { items: current, added: false, reason: 'duplicate' };
  }
  if (current.length >= SAVE_FOR_LATER_MAX) {
    return { items: current, added: false, reason: 'full' };
  }

  const items = [...current, nextItem].slice(0, SAVE_FOR_LATER_MAX);
  writeRaw(items);
  return { items, added: true, reason: 'added' };
};

export const removeGuestSavedItem = (clientId) => {
  const id = String(clientId || '').trim();
  const items = readRaw().filter((entry) => entry.clientId !== id);
  writeRaw(items);
  return items;
};

/** Payload for POST /cart/saved/merge */
export const guestSavedItemsForMerge = () =>
  readRaw().map((entry) => ({
    productId: entry.productId,
    quantity: entry.quantity,
    ringSize: entry.ringSize || undefined,
    metalColor: entry.metalColor || undefined,
    variantId: entry.variantId || undefined,
    isCustomized: entry.isCustomized,
    customization: entry.customization || undefined,
  }));
