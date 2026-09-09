import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AccountShell from '../components/account/AccountShell.jsx';
import Reveal from '../components/Reveal.jsx';
import CatalogProductCard from '../components/catalog/CatalogProductCard.jsx';
import { ShimmerProductGrid } from '../components/Shimmer.jsx';
import WishlistOptionsModal from '../components/wishlist/WishlistOptionsModal.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { toast } from '../context/ToastContext.jsx';
import { ROUTES, productPath } from '../utils/navigation';
import {
  findUniqueVariantId,
  getProductInventory,
  isCatalogOutOfStock,
  listInStockCombinations,
} from '../utils/inventory.js';
import {
  applyWishlistView,
  getWishlistPriceStatus,
  getWishlistStockLabel,
  getWishlistStockStatus,
  WISHLIST_FILTER_OPTIONS,
  WISHLIST_SORT_OPTIONS,
} from '../utils/wishlistShopping.js';
import { usePrivatePageSeo } from '../hooks/useSeo.js';
import PageBreadcrumbs from '../components/seo/PageBreadcrumbs.jsx';
import {
  trackWishlistView,
  trackWishlistAddToCart,
  trackWishlistProductClick,
} from '../utils/analytics.js';
import '../Pages/Collection.css';
import './Wishlist.css';

function resolveQuickAdd(product) {
  if (!product?._id || (product.status && product.status !== 'active')) {
    return { mode: 'view' };
  }

  if (product.isCustomizable) {
    return { mode: 'options', reason: 'customizable' };
  }

  if (getProductInventory(product).length === 0 && !(typeof product.stock === 'number' && product.stock > 0)) {
    return { mode: 'view' };
  }

  if (isCatalogOutOfStock(product)) {
    return { mode: 'oos' };
  }

  const combinations = listInStockCombinations(product);

  if (combinations.length === 1) {
    return { mode: 'add', combination: combinations[0] };
  }

  if (combinations.length > 1) {
    return { mode: 'options', reason: 'variants' };
  }

  return { mode: 'oos' };
}

function WishlistStatusRow({ product }) {
  const stockStatus = getWishlistStockStatus(product);
  const priceStatus = getWishlistPriceStatus(product);

  return (
    <div className="wishlist-status-row" aria-label="Availability and price status">
      <span className={`wishlist-status-pill wishlist-status-${stockStatus}`}>
        {getWishlistStockLabel(stockStatus)}
      </span>
      {priceStatus.priceDropped ? (
        <span className="wishlist-status-pill wishlist-status-drop">Price dropped</span>
      ) : null}
    </div>
  );
}

function WishlistCardActions({
  product,
  busy,
  onRemove,
  onAddToCart,
  onChooseOptions,
}) {
  const action = resolveQuickAdd(product);
  const href = productPath(product.slug);
  const title = product.title || 'product';

  return (
    <div className="wishlist-card-actions-wrap">
      <WishlistStatusRow product={product} />

      <div className="wishlist-card-actions">
        <button
          type="button"
          className="wishlist-action-btn wishlist-action-btn-secondary"
          onClick={() => onRemove(product)}
          disabled={busy}
          aria-label={`Remove ${title} from wishlist`}
          aria-busy={busy || undefined}
        >
          {busy ? 'Removing…' : 'Remove'}
        </button>

        {action.mode === 'oos' ? (
          <Link
            to={href}
            className="wishlist-action-btn wishlist-action-btn-primary"
            aria-label={`View ${title} for availability options`}
          >
            View Product
          </Link>
        ) : action.mode === 'add' ? (
          <button
            type="button"
            className="wishlist-action-btn wishlist-action-btn-primary"
            onClick={() => onAddToCart(product, action.combination)}
            disabled={busy}
            aria-label={`Add ${title} to cart`}
            aria-busy={busy || undefined}
          >
            {busy ? 'Adding…' : 'Add to Cart'}
          </button>
        ) : action.mode === 'options' && action.reason === 'variants' ? (
          <button
            type="button"
            className="wishlist-action-btn wishlist-action-btn-primary"
            onClick={() => onChooseOptions(product)}
            disabled={busy}
            aria-label={`Choose options for ${title}`}
          >
            Choose Options
          </button>
        ) : (
          <Link
            to={href}
            className="wishlist-action-btn wishlist-action-btn-primary"
            aria-label={
              action.mode === 'options'
                ? `Choose options for ${title}`
                : `View ${title}`
            }
          >
            {action.mode === 'options' ? 'Choose Options' : 'View Product'}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function Wishlist() {
  usePrivatePageSeo({
    title: 'Wishlist',
    description: 'Saved Zivorah jewelry. This page is private and is not indexed.',
    path: '/wishlist',
  });
  const navigate = useNavigate();

  const { products, loading, error, removeFromWishlist, refreshWishlist, totalItems } =
    useWishlist();
  const { addToCart } = useCart();
  const [busyProductId, setBusyProductId] = useState(null);
  const [removingIds, setRemovingIds] = useState([]);
  const [actionMessage, setActionMessage] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [sort, setSort] = useState('recent');
  const [filter, setFilter] = useState('all');
  const [optionsProduct, setOptionsProduct] = useState(null);

  useEffect(() => {
    trackWishlistView();
  }, []);

  const visibleProducts = useMemo(
    () => applyWishlistView(products, { sort, filter }),
    [products, sort, filter]
  );

  const handleRemove = useCallback(
    async (product) => {
      const productId = product._id;
      if (!productId || busyProductId || removingIds.includes(productId)) {
        return;
      }

      setActionMessage(null);
      setBusyProductId(productId);
      setRemovingIds((ids) => [...ids, productId]);

      try {
        await new Promise((resolve) => {
          window.setTimeout(resolve, 240);
        });
        await removeFromWishlist(productId, { productSlug: product.slug });
        setStatusMessage(`${product.title || 'Item'} removed from wishlist.`);
        toast.success('Removed from wishlist');
      } catch (err) {
        setRemovingIds((ids) => ids.filter((id) => id !== productId));
        setActionMessage({
          type: 'error',
          text: err.message || 'Unable to remove this piece. Please try again.',
        });
      } finally {
        setBusyProductId(null);
      }
    },
    [busyProductId, removingIds, removeFromWishlist]
  );

  const addProductToCart = useCallback(
    async (product, selection) => {
      if (!product?._id || busyProductId) {
        return;
      }

      setBusyProductId(product._id);
      setActionMessage(null);

      try {
        const variantId = findUniqueVariantId(product, {
          ringSize: selection?.ringSize || '',
          metalColor: selection?.metalColor || '',
        });

        await addToCart({
          productId: product._id,
          quantity: 1,
          ringSize: selection?.ringSize || undefined,
          metalColor: selection?.metalColor || undefined,
          ...(variantId ? { variantId } : {}),
        });
        trackWishlistAddToCart({ productId: product._id, productSlug: product.slug });
        setOptionsProduct(null);
        setActionMessage({
          type: 'success',
          text: `"${product.title}" added to cart.`,
        });
        setStatusMessage(`${product.title} added to cart.`);
        toast.success('Added to cart');
      } catch (err) {
        setActionMessage({
          type: 'error',
          text: err.message || 'Unable to add this piece to cart.',
        });
      } finally {
        setBusyProductId(null);
      }
    },
    [addToCart, busyProductId]
  );

  const handleAddToCart = useCallback(
    async (product, combination) => {
      const action = resolveQuickAdd(product);
      if (action.mode === 'options') {
        if (action.reason === 'variants') {
          setOptionsProduct(product);
          return;
        }
        trackWishlistProductClick({ productId: product._id, productSlug: product.slug });
        navigate(productPath(product.slug));
        return;
      }
      if (action.mode !== 'add') {
        return;
      }

      await addProductToCart(product, combination || action.combination);
    },
    [addProductToCart, navigate]
  );

  const handleChooseOptions = useCallback((product) => {
    setOptionsProduct(product);
  }, []);

  const handleOptionsConfirm = useCallback(
    async (selection) => {
      if (!optionsProduct) {
        return;
      }
      await addProductToCart(optionsProduct, selection);
    },
    [addProductToCart, optionsProduct]
  );

  const handleRetry = async () => {
    setActionMessage(null);
    setStatusMessage('Refreshing wishlist…');
    await refreshWishlist();
    setStatusMessage('Wishlist refreshed.');
  };

  const countLabel = totalItems === 1 ? '1 saved piece' : `${totalItems} saved pieces`;

  return (
    <AccountShell
      active="wishlist"
      title="Wishlist"
      description="A curated collection of jewelry you love."
      countLabel={!loading && !error && totalItems > 0 ? countLabel : undefined}
    >
      <div className="wishlist-page">
        <PageBreadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Wishlist' },
          ]}
        />
        <div className="wishlist-toolbar">
          <Link to={ROUTES.collection} className="wishlist-text-link">
            Continue Shopping
          </Link>
        </div>

        {!loading && !error && products.length > 0 ? (
          <div className="wishlist-controls">
            <div className="wishlist-filters" role="group" aria-label="Filter wishlist">
              {WISHLIST_FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`wishlist-filter-chip${filter === option.value ? ' is-active' : ''}`}
                  aria-pressed={filter === option.value}
                  onClick={() => setFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <label className="wishlist-sort">
              <span className="wishlist-sort-label">Sort</span>
              <select
                className="wishlist-sort-select"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                {WISHLIST_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {statusMessage}
        </div>

        {actionMessage ? (
          <div
            className={`wishlist-banner wishlist-banner-${actionMessage.type}`}
            role={actionMessage.type === 'error' ? 'alert' : 'status'}
          >
            <span>{actionMessage.text}</span>
            <button
              type="button"
              className="wishlist-banner-dismiss"
              onClick={() => setActionMessage(null)}
              aria-label="Dismiss message"
            >
              Dismiss
            </button>
          </div>
        ) : null}

        {error ? (
          <div className="wishlist-state wishlist-state-error" role="alert">
            <h2 className="wishlist-state-title">Unable to load wishlist</h2>
            <p className="wishlist-state-copy">
              {error.length > 140
                ? 'Something went wrong while loading your saved pieces.'
                : error}
            </p>
            <div className="wishlist-state-actions">
              <button type="button" className="wishlist-state-btn" onClick={handleRetry}>
                Retry
              </button>
              <Link to={ROUTES.collection} className="wishlist-state-link">
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div aria-busy="true" aria-live="polite">
            <span className="sr-only">Loading your wishlist</span>
            <ShimmerProductGrid count={8} className="wishlist-skeleton" />
          </div>
        ) : null}

        {!loading && !error && products.length === 0 ? (
          <Reveal className="wishlist-state wishlist-state-empty" variant="fade-up">
            <h2 className="wishlist-state-title">Your wishlist is waiting</h2>
            <p className="wishlist-state-copy">
              Save the pieces you love and return to them anytime.
            </p>
            <Link to={ROUTES.collection} className="wishlist-state-btn">
              Explore Collection
            </Link>
          </Reveal>
        ) : null}

        {!loading && !error && products.length > 0 && visibleProducts.length === 0 ? (
          <div className="wishlist-state">
            <h2 className="wishlist-state-title">No pieces match this filter</h2>
            <p className="wishlist-state-copy">Try another filter or show all saved jewelry.</p>
            <button
              type="button"
              className="wishlist-state-btn"
              onClick={() => setFilter('all')}
            >
              Show all
            </button>
          </div>
        ) : null}

        {!loading && !error && visibleProducts.length > 0 ? (
          <div className="wishlist-grid catalog-results-fade">
            {visibleProducts.map((product, index) => {
              const isBusy = busyProductId === product._id;
              const isRemoving = removingIds.includes(product._id);

              return (
                <Reveal
                  key={product._id}
                  className="wishlist-card-reveal"
                  variant="fade-up"
                  delay={Math.min(index, 7) * 40}
                >
                  <div
                    onClick={() =>
                      trackWishlistProductClick({
                        productId: product._id,
                        productSlug: product.slug,
                      })
                    }
                    onKeyDown={undefined}
                    role="presentation"
                  >
                    <CatalogProductCard
                      product={product}
                      variant="desktop"
                      removing={isRemoving}
                      showLowStock
                      footer={
                        <WishlistCardActions
                          product={product}
                          busy={isBusy}
                          onRemove={handleRemove}
                          onAddToCart={handleAddToCart}
                          onChooseOptions={handleChooseOptions}
                        />
                      }
                    />
                  </div>
                </Reveal>
              );
            })}
          </div>
        ) : null}
      </div>

      <WishlistOptionsModal
        isOpen={Boolean(optionsProduct)}
        product={optionsProduct}
        submitting={Boolean(optionsProduct && busyProductId === optionsProduct._id)}
        onClose={() => {
          if (!busyProductId) {
            setOptionsProduct(null);
          }
        }}
        onConfirm={handleOptionsConfirm}
      />
    </AccountShell>
  );
}
