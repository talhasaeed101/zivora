import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { wishlistApi } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const WishlistContext = createContext(null);

const extractProductIds = (wishlist) => {
  const products = wishlist?.products || [];
  return new Set(
    products.map((product) => {
      const id = typeof product === 'object' ? product._id : product;
      return id?.toString();
    }).filter(Boolean)
  );
};

const syncWishlistState = (wishlist, setProducts, setProductIds) => {
  setProducts(wishlist?.products || []);
  setProductIds(extractProductIds(wishlist));
};

export function WishlistProvider({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [productIds, setProductIds] = useState(() => new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [togglingIds, setTogglingIds] = useState(() => new Set());

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setProducts([]);
      setProductIds(new Set());
      setError('');
      return null;
    }

    setLoading(true);
    setError('');

    try {
      const response = await wishlistApi.getWishlist();
      syncWishlistState(response.data, setProducts, setProductIds);
      return response.data;
    } catch (err) {
      setError(err.message || 'Unable to load wishlist');
      setProducts([]);
      setProductIds(new Set());
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    refreshWishlist();
  }, [authLoading, refreshWishlist]);

  const applyWishlist = useCallback((wishlist) => {
    syncWishlistState(wishlist, setProducts, setProductIds);
    return wishlist;
  }, []);

  const addToWishlist = useCallback(async (productId) => {
    const response = await wishlistApi.addToWishlist(productId);
    applyWishlist(response.data);
    return response.data;
  }, [applyWishlist]);

  const removeFromWishlist = useCallback(async (productId) => {
    const response = await wishlistApi.removeFromWishlist(productId);
    applyWishlist(response.data);
    return response.data;
  }, [applyWishlist]);

  const toggleWishlist = useCallback(async (productId) => {
    const id = productId?.toString();
    if (!id) {
      return null;
    }

    setTogglingIds((current) => new Set(current).add(id));

    try {
      const response = await wishlistApi.toggleWishlist(productId);
      applyWishlist(response.data?.wishlist || response.data);
      return response.data;
    } finally {
      setTogglingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }, [applyWishlist]);

  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) {
        return false;
      }

      return productIds.has(productId.toString());
    },
    [productIds]
  );

  const isToggling = useCallback(
    (productId) => {
      if (!productId) {
        return false;
      }

      return togglingIds.has(productId.toString());
    },
    [togglingIds]
  );

  const value = useMemo(
    () => ({
      products,
      productIds,
      totalItems: productIds.size,
      loading,
      error,
      refreshWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      isToggling,
    }),
    [
      products,
      productIds,
      loading,
      error,
      refreshWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      isToggling,
    ]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
