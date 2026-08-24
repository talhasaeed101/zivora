import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import AccountShell from '../components/account/AccountShell.jsx';
import Reveal from '../components/Reveal.jsx';
import CatalogProductCard from '../components/catalog/CatalogProductCard.jsx';
import { ShimmerProductGrid } from '../components/Shimmer.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { ROUTES, productPath } from '../utils/navigation';
import { productNeedsRingSize } from '../utils/categories.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import '../Pages/Collection.css';
import './Wishlist.css';

function canQuickAddToCart(product) {
  if (!product?._id) {
    return false;
  }

  if (product.status && product.status !== 'active') {
    return false;
  }

  if (typeof product.stock === 'number' && product.stock <= 0) {
    return false;
  }

  if (product.isCustomizable) {
    return false;
  }

  if (productNeedsRingSize(product)) {
    return false;
  }

  // Metal must be unambiguous — multiple or defaulted options require PDP selection.
  if (!Array.isArray(product.metalColors) || product.metalColors.length !== 1) {
    return false;
  }

  return true;
}

function WishlistCardActions({
  product,
  busy,
  onRemove,
  onAddToCart,
}) {
  const outOfStock = typeof product.stock === 'number' && product.stock <= 0;
  const quickAdd = canQuickAddToCart(product);
  const href = productPath(product.slug);
  const title = product.title || 'product';

  return (
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

      {outOfStock ? (
        <Link
          to={href}
          className="wishlist-action-btn wishlist-action-btn-primary"
          aria-label={`View ${title}`}
        >
          View Product
        </Link>
      ) : quickAdd ? (
        <button
          type="button"
          className="wishlist-action-btn wishlist-action-btn-primary"
          onClick={() => onAddToCart(product)}
          disabled={busy}
          aria-label={`Add ${title} to cart`}
          aria-busy={busy || undefined}
        >
          {busy ? 'Adding…' : 'Add to Cart'}
        </button>
      ) : (
        <Link
          to={href}
          className="wishlist-action-btn wishlist-action-btn-primary"
          aria-label={
            product.isCustomizable || productNeedsRingSize(product)
              ? `Choose options for ${title}`
              : `View ${title}`
          }
        >
          {product.isCustomizable || productNeedsRingSize(product)
            ? 'Choose Options'
            : 'View Product'}
        </Link>
      )}
    </div>
  );
}

export default function Wishlist() {
  usePageTitle('My Wishlist | Zivorah');

  const { products, loading, error, removeFromWishlist, refreshWishlist, totalItems } =
    useWishlist();
  const { addToCart } = useCart();
  const [busyProductId, setBusyProductId] = useState(null);
  const [removingIds, setRemovingIds] = useState([]);
  const [actionMessage, setActionMessage] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

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
        await removeFromWishlist(productId);
        setStatusMessage(`${product.title || 'Item'} removed from wishlist.`);
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

  const handleAddToCart = useCallback(
    async (product) => {
      if (!canQuickAddToCart(product) || busyProductId) {
        return;
      }

      setBusyProductId(product._id);
      setActionMessage(null);

      try {
        await addToCart({
          productId: product._id,
          quantity: 1,
          metalColor: product.metalColors[0],
        });
        setActionMessage({
          type: 'success',
          text: `"${product.title}" added to cart.`,
        });
        setStatusMessage(`${product.title} added to cart.`);
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
      title="My Wishlist"
      description="A curated collection of jewelry you love."
      countLabel={!loading && !error && totalItems > 0 ? countLabel : undefined}
    >
      <div className="wishlist-page">
        <div className="wishlist-toolbar">
          <Link to={ROUTES.collection} className="wishlist-text-link">
            Continue Shopping
          </Link>
        </div>

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

        {!loading && !error && products.length > 0 ? (
          <div className="wishlist-grid catalog-results-fade">
            {products.map((product, index) => {
              const isBusy = busyProductId === product._id;
              const isRemoving = removingIds.includes(product._id);

              return (
                <Reveal
                  key={product._id}
                  className="wishlist-card-reveal"
                  variant="fade-up"
                  delay={Math.min(index, 7) * 40}
                >
                  <CatalogProductCard
                    product={product}
                    variant="desktop"
                    removing={isRemoving}
                    footer={
                      <WishlistCardActions
                        product={product}
                        busy={isBusy}
                        onRemove={handleRemove}
                        onAddToCart={handleAddToCart}
                      />
                    }
                  />
                </Reveal>
              );
            })}
          </div>
        ) : null}
      </div>
    </AccountShell>
  );
}
