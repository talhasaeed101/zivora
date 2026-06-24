import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WishlistButton from '../components/WishlistButton.jsx';
import { ShimmerProductGrid } from '../components/Shimmer.jsx';
import SafeImage from '../components/SafeImage.jsx';
import { HeartIcon } from '../components/icons';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { ROUTES, productPath, searchPath } from '../utils/navigation';
import { usePageTitle } from '../hooks/usePageTitle.js';
import {
  formatPrice,
  getProductImage,
  hasSale,
  getCategoryName,
} from '../utils/products.js';
import './Wishlist.css';

export default function Wishlist() {
  usePageTitle('Wishlist | Zivora');

  const { products, loading, error, removeFromWishlist, refreshWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [actionProductId, setActionProductId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const handleRemove = async (productId) => {
    setActionProductId(productId);
    setActionMessage(null);

    try {
      await removeFromWishlist(productId);
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to remove item.' });
    } finally {
      setActionProductId(null);
    }
  };

  const handleAddToCart = async (product) => {
    setActionProductId(product._id);
    setActionMessage(null);

    try {
      await addToCart({
        productId: product._id,
        quantity: 1,
        ringSize: product.ringSizes?.[0] || '',
        metalColor: product.metalColors?.[0] || '',
      });
      setActionMessage({ type: 'success', text: `"${product.title}" added to cart.` });
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to add to cart.' });
    } finally {
      setActionProductId(null);
    }
  };

  return (
    <div className="wishlist-page">
      <Navbar activeLink="COLLECTION" homeHref={ROUTES.home} />

      <main className="wishlist-main">
        <div className="wishlist-inner">
          <div className="wishlist-header">
            <h1 className="wishlist-title">My Wishlist</h1>
            <p className="wishlist-subtitle">Save your favorite jewelry pieces here.</p>
          </div>

          {actionMessage && (
            <div className={`wishlist-banner wishlist-banner-${actionMessage.type}`}>
              {actionMessage.text}
            </div>
          )}

          {error && (
            <div className="wishlist-banner wishlist-banner-error">
              {error}
              <button type="button" className="wishlist-retry-btn" onClick={refreshWishlist}>
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <ShimmerProductGrid count={4} />
          ) : products.length === 0 ? (
            <div className="wishlist-empty">
              <div className="wishlist-empty-icon" aria-hidden="true">
                <HeartIcon className="w-8 h-8" />
              </div>
              <h2>Your wishlist is empty</h2>
              <p>Save your favorite jewelry pieces here.</p>
              <a href={searchPath()} className="wishlist-shop-btn">
                Continue Shopping
              </a>
            </div>
          ) : (
            <div className="wishlist-grid">
              {products.map((product) => {
                const image = getProductImage(product);
                const showSale = hasSale(product);
                const categoryName = getCategoryName(product.category);
                const isBusy = actionProductId === product._id;

                return (
                  <article key={product._id} className="wishlist-card">
                    <div className="wishlist-card-image-wrap">
                      <Link to={productPath(product.slug)} className="wishlist-card-image-link">
                        <SafeImage src={image} alt={product.title} className="wishlist-card-image" />
                      </Link>
                      {showSale && <span className="wishlist-sale-badge">Sale!</span>}
                      <WishlistButton
                        productId={product._id}
                        className="wishlist-card-heart"
                        activeClassName="wishlist-card-heart-active"
                      />
                    </div>

                    <div className="wishlist-card-body">
                      {categoryName && (
                        <p className="wishlist-card-category">{categoryName}</p>
                      )}
                      <Link to={productPath(product.slug)} className="wishlist-card-title">
                        {product.title}
                      </Link>
                      <div className="wishlist-card-prices">
                        <span className="wishlist-card-price">{formatPrice(product.price)}</span>
                        {product.oldPrice && (
                          <span className="wishlist-card-price-old">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                      </div>

                      <div className="wishlist-card-actions">
                        <button
                          type="button"
                          className="wishlist-action-btn wishlist-action-btn-secondary"
                          onClick={() => handleRemove(product._id)}
                          disabled={isBusy}
                        >
                          {isBusy ? 'Removing...' : 'Remove'}
                        </button>
                        <button
                          type="button"
                          className="wishlist-action-btn wishlist-action-btn-primary"
                          onClick={() => handleAddToCart(product)}
                          disabled={isBusy || product.status !== 'active'}
                        >
                          {isBusy ? 'Adding...' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
