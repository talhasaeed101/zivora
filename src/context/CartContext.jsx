import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { cartApi } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import {
  addGuestSavedItem,
  clearGuestSavedItems,
  getGuestSavedItems,
  guestSavedItemsForMerge,
  removeGuestSavedItem,
} from '../utils/saveForLaterStorage.js';
import {
  getGuestCart,
  addToGuestCart as addGuestCartItem,
  updateGuestCartItem as updateGuestCartItemStorage,
  removeGuestCartItem as removeGuestCartItemStorage,
  clearGuestCart as clearGuestCartStorage,
} from '../utils/guestCart.js';

const CartContext = createContext(null);

function mapServerSavedToGuest(item) {
  const product = item?.product && typeof item.product === 'object' ? item.product : null;
  const productId = String(product?._id || product?.id || item?.product || '').trim();
  if (!productId) return null;

  return {
    productId,
    title: product?.title || item.title || '',
    image:
      (Array.isArray(product?.images) && product.images[0]) ||
      item.image ||
      '',
    price: Number(item.price) || 0,
    oldPrice: item.oldPrice ?? product?.oldPrice ?? null,
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
    slug: product?.slug || item.slug || '',
  };
}

export function CartProvider({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(null);
  const [guestCartItems, setGuestCartItems] = useState(() => getGuestCart());
  const [guestSavedItems, setGuestSavedItems] = useState(() => getGuestSavedItems());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mergeDoneForSession, setMergeDoneForSession] = useState(false);
  const wasAuthenticatedRef = useRef(false);
  const lastServerSavedRef = useRef([]);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setError('');
      setGuestCartItems(getGuestCart());
      setGuestSavedItems(getGuestSavedItems());
      return null;
    }

    setLoading(true);
    setError('');

    try {
      const response = await cartApi.getCart();
      setCart(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'Unable to load cart');
      setCart(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    refreshCart();
  }, [authLoading, refreshCart]);

  useEffect(() => {
    if (isAuthenticated && Array.isArray(cart?.savedItems)) {
      lastServerSavedRef.current = cart.savedItems;
    }
  }, [isAuthenticated, cart?.savedItems]);

  // Mirror server saved items into guest localStorage on logout
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (wasAuthenticatedRef.current && !isAuthenticated) {
      const serverSaved = lastServerSavedRef.current || [];
      if (serverSaved.length) {
        clearGuestSavedItems();
        for (const item of serverSaved) {
          const guestItem = mapServerSavedToGuest(item);
          if (guestItem) {
            addGuestSavedItem(guestItem);
          }
        }
        setGuestSavedItems(getGuestSavedItems());
      }
      lastServerSavedRef.current = [];
    }

    wasAuthenticatedRef.current = isAuthenticated;
  }, [authLoading, isAuthenticated]);

  // Merge guest saved items once per authenticated session
  useEffect(() => {
    if (authLoading || !isAuthenticated || mergeDoneForSession) {
      return;
    }

    const guestItems = guestSavedItemsForMerge();
    if (!guestItems.length) {
      setMergeDoneForSession(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await cartApi.mergeGuestSavedItems(guestItems);
        if (cancelled) return;
        setCart(response.data);
        clearGuestSavedItems();
        setGuestSavedItems([]);
      } catch {
        // Keep guest items for a later retry
      } finally {
        if (!cancelled) {
          setMergeDoneForSession(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, mergeDoneForSession]);

  useEffect(() => {
    if (!isAuthenticated) {
      setMergeDoneForSession(false);
    }
  }, [isAuthenticated]);

  const addToCart = useCallback(async (payload) => {
    if (!isAuthenticated) {
      const updated = addGuestCartItem(payload);
      setGuestCartItems(updated);
      return { items: updated };
    }
    const response = await cartApi.addToCart(payload);
    setCart(response.data);
    return response.data;
  }, [isAuthenticated]);

  const updateCartItem = useCallback(async (itemId, payload) => {
    if (!isAuthenticated) {
      const updated = updateGuestCartItemStorage(itemId, payload?.quantity);
      setGuestCartItems(updated);
      return { items: updated };
    }
    const response = await cartApi.updateCartItem(itemId, payload);
    setCart(response.data);
    return response.data;
  }, [isAuthenticated]);

  const removeCartItem = useCallback(async (itemId) => {
    if (!isAuthenticated) {
      const updated = removeGuestCartItemStorage(itemId);
      setGuestCartItems(updated);
      return { items: updated };
    }
    const response = await cartApi.removeCartItem(itemId);
    setCart(response.data);
    return response.data;
  }, [isAuthenticated]);

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      const updated = clearGuestCartStorage();
      setGuestCartItems(updated);
      return { items: updated };
    }
    const response = await cartApi.clearCart();
    setCart(response.data);
    return response.data;
  }, [isAuthenticated]);

  const saveItemForLater = useCallback(async (itemId) => {
    const response = await cartApi.saveItemForLater(itemId);
    setCart(response.data);
    return response.data;
  }, []);

  const moveSavedToCart = useCallback(async (itemId) => {
    const response = await cartApi.moveSavedToCart(itemId);
    setCart(response.data);
    return response.data;
  }, []);

  const removeSavedItem = useCallback(async (itemId) => {
    const response = await cartApi.removeSavedItem(itemId);
    setCart(response.data);
    return response.data;
  }, []);

  const saveGuestItemForLater = useCallback((item) => {
    const result = addGuestSavedItem(item);
    setGuestSavedItems(result.items);
    return result;
  }, []);

  const removeGuestSaved = useCallback((clientId) => {
    const items = removeGuestSavedItem(clientId);
    setGuestSavedItems(items);
    return items;
  }, []);

  const savedItems = useMemo(() => {
    if (isAuthenticated) {
      return Array.isArray(cart?.savedItems) ? cart.savedItems : [];
    }
    return guestSavedItems;
  }, [isAuthenticated, cart?.savedItems, guestSavedItems]);

  const effectiveCart = useMemo(() => {
    if (isAuthenticated) {
      return cart;
    }
    const subtotal = guestCartItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
    const totalItems = guestCartItems.reduce(
      (sum, item) => sum + (Number(item.quantity) || 1),
      0
    );
    return {
      items: guestCartItems,
      subtotal,
      total: subtotal,
      totalItems,
      discount: 0,
      discountAmount: 0,
    };
  }, [isAuthenticated, cart, guestCartItems]);

  const value = useMemo(
    () => ({
      cart: effectiveCart,
      loading,
      error,
      totalItems: effectiveCart?.totalItems || 0,
      subtotal: effectiveCart?.subtotal || 0,
      savedItems,
      refreshCart,
      addToCart,
      updateCartItem,
      removeCartItem,
      clearCart,
      saveItemForLater,
      moveSavedToCart,
      removeSavedItem,
      saveGuestItemForLater,
      removeGuestSaved,
    }),
    [
      effectiveCart,
      loading,
      error,
      savedItems,
      refreshCart,
      addToCart,
      updateCartItem,
      removeCartItem,
      clearCart,
      saveItemForLater,
      moveSavedToCart,
      removeSavedItem,
      saveGuestItemForLater,
      removeGuestSaved,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
