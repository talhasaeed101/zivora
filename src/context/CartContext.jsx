import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cartApi } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setError('');
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

  const addToCart = useCallback(async (payload) => {
    const response = await cartApi.addToCart(payload);
    setCart(response.data);
    return response.data;
  }, []);

  const updateCartItem = useCallback(async (itemId, payload) => {
    const response = await cartApi.updateCartItem(itemId, payload);
    setCart(response.data);
    return response.data;
  }, []);

  const removeCartItem = useCallback(async (itemId) => {
    const response = await cartApi.removeCartItem(itemId);
    setCart(response.data);
    return response.data;
  }, []);

  const clearCart = useCallback(async () => {
    const response = await cartApi.clearCart();
    setCart(response.data);
    return response.data;
  }, []);

  const value = useMemo(
    () => ({
      cart,
      loading,
      error,
      totalItems: cart?.totalItems || 0,
      subtotal: cart?.subtotal || 0,
      refreshCart,
      addToCart,
      updateCartItem,
      removeCartItem,
      clearCart,
    }),
    [cart, loading, error, refreshCart, addToCart, updateCartItem, removeCartItem, clearCart]
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
