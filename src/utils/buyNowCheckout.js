const BUY_NOW_STORAGE_KEY = 'zivora_buy_now_checkout';

export function storeBuyNowCheckout(payload) {
  try {
    sessionStorage.setItem(BUY_NOW_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

export function storeCartCheckout(payload) {
  storeBuyNowCheckout({
    mode: 'cart',
    ...payload,
  });
}

export function readBuyNowCheckout(locationState) {
  if (locationState?.mode === 'cart' || locationState?.product?._id) {
    return locationState;
  }

  try {
    const raw = sessionStorage.getItem(BUY_NOW_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearBuyNowCheckout() {
  try {
    sessionStorage.removeItem(BUY_NOW_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
