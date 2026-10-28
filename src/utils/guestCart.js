/**
 * Guest Cart Storage Utility
 * Stores cart items in localStorage for unauthenticated users.
 */
const GUEST_CART_STORAGE_KEY = 'zivora_guest_cart';

export function getGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGuestCart(items) {
  try {
    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items || []));
  } catch {
    // Quota or private mode
  }
}

export function addToGuestCart(item) {
  const items = getGuestCart();
  const index = items.findIndex(
    (it) =>
      String(it.productId) === String(item.productId) &&
      (it.ringSize || '') === (item.ringSize || '') &&
      (it.metalColor || '') === (item.metalColor || '') &&
      (it.variantId || '') === (item.variantId || '')
  );

  if (index > -1) {
    items[index].quantity = (Number(items[index].quantity) || 1) + (Number(item.quantity) || 1);
    if (item.product || item.title || item.price) {
      items[index].product = item.product || items[index].product;
      items[index].title = item.product?.title || item.title || items[index].title;
      items[index].price = item.product?.price || item.price || items[index].price;
      items[index].image = item.product?.images?.[0] || item.image || items[index].image;
      items[index].slug = item.product?.slug || item.slug || items[index].slug;
    }
  } else {
    items.push({
      id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      productId: item.productId,
      quantity: Number(item.quantity) || 1,
      ringSize: item.ringSize || '',
      metalColor: item.metalColor || '',
      variantId: item.variantId || undefined,
      product: item.product || null,
      price: item.product?.price || item.price || 0,
      title: item.product?.title || item.title || '',
      image: item.product?.images?.[0] || item.image || '',
      slug: item.product?.slug || item.slug || '',
    });
  }

  saveGuestCart(items);
  return items;
}

export function updateGuestCartItem(id, quantity) {
  const items = getGuestCart();
  const nextQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
  const updated = items.map((it) => (it.id === id ? { ...it, quantity: nextQuantity } : it));
  saveGuestCart(updated);
  return updated;
}

export function removeGuestCartItem(id) {
  const items = getGuestCart();
  const filtered = items.filter((it) => it.id !== id);
  saveGuestCart(filtered);
  return filtered;
}

export function clearGuestCart() {
  saveGuestCart([]);
  return [];
}
