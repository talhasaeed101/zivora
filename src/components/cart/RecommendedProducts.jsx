import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../icons';
import WishlistButton from '../WishlistButton.jsx';
import SafeImage from '../SafeImage.jsx';
import { ROUTES, searchPath, productPath } from '../../utils/navigation';
import {
  loadPublicProducts,
  loadRelatedProducts,
  loadGiftIdeas,
} from '../../services/catalogCache.js';
import {
  formatPrice,
  getProductImage,
  hasSale,
  getCategoryName,
} from '../../utils/products.js';
import { isCatalogOutOfStock } from '../../utils/inventory.js';
import '../TrendingProducts.css';

const HeartIcon = ({ className = 'w-4 h-4', filled }) => (
  <svg
    viewBox="0 0 20 20"
    fill={filled ? 'currentColor' : 'none'}
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M10.5167 17.3416C10.2333 17.4416 9.76666 17.4416 9.48332 17.3416C7.06666 16.5166 1.66666 13.0749 1.66666 7.24159C1.66666 4.66659 3.74166 2.58325 6.29999 2.58325C7.81666 2.58325 9.15832 3.31659 9.99999 4.44992C10.8417 3.31659 12.1917 2.58325 13.7 2.58325C16.2583 2.58325 18.3333 4.66659 18.3333 7.24159C18.3333 13.0749 12.9333 16.5166 10.5167 17.3416Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function truncateTitle(title) {
  const text = String(title || '').trim();
  if (text.length <= 20) return text;
  return `${text.slice(0, 20)}...`;
}

function HomeStyleProductCard({ product }) {
  const image = getProductImage(product);
  const showSale = hasSale(product);
  const categoryName = getCategoryName(product.category);
  const outOfStock = isCatalogOutOfStock(product);

  return (
    <Link to={productPath(product.slug)} className="trending-product-card-link">
      <article className="trending-product-card" style={{ position: 'relative' }}>
        <div className="trending-product-image-wrap">
          <SafeImage
            src={image}
            alt={product.title}
            className="trending-product-image"
            sizes="180px"
            width={320}
            height={400}
          />
        </div>
        {showSale ? <span className="trending-sale-badge">Sale!</span> : null}
        {outOfStock ? <span className="trending-sale-badge">Out of stock</span> : null}
        <div className="trending-product-text-wrap">
          <div className="trending-product-info-row">
            <h3 className="trending-product-name">{truncateTitle(product.title)}</h3>
            <WishlistButton
              productId={product._id}
              className="trending-wishlist-btn"
              activeClassName="trending-wishlist-btn-active"
              icon={HeartIcon}
            />
          </div>
          {categoryName ? (
            <p className="trending-product-category">{categoryName}</p>
          ) : null}
          <div className="trending-price-row">
            <span className="trending-price-current">{formatPrice(product.price)}</span>
            {product.oldPrice ? (
              <span className="trending-price-original">{formatPrice(product.oldPrice)}</span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}

/**
 * Cart conversion rails — same card UI as home Trending (fonts, arch, scroll).
 */
export default function RecommendedProducts({ cartItems = [] }) {
  const [products, setProducts] = useState([]);
  const [giftProducts, setGiftProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const seedProductId = useMemo(() => {
    const first = cartItems[0];
    const raw = first?.productId || first?.product?._id || first?.product;
    return raw ? String(raw) : null;
  }, [cartItems]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        let next = [];
        if (seedProductId) {
          next = await loadRelatedProducts(seedProductId, { limit: 8 });
        }
        if (!next?.length) {
          const response = await loadPublicProducts({ isFeatured: true, limit: 8 });
          next = response.data?.products || [];
        }

        const giftSections = await loadGiftIdeas({ limit: 4 }).catch(() => []);
        const gifts = [];
        const seen = new Set((next || []).map((p) => String(p._id)));
        for (const section of giftSections || []) {
          for (const product of section.products || []) {
            const id = String(product._id);
            if (seen.has(id)) continue;
            seen.add(id);
            gifts.push(product);
            if (gifts.length >= 4) break;
          }
          if (gifts.length >= 4) break;
        }

        if (isMounted) {
          setProducts(Array.isArray(next) ? next : []);
          setGiftProducts(gifts);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setProducts([]);
          setGiftProducts([]);
          setError(err.message || 'Unable to load recommendations.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [seedProductId]);

  return (
    <section className="cart-recommended trending-section">
      <div className="cart-recommended-inner trending-inner">
        <div className="cart-recommended-header trending-header-row">
          <h2 className="cart-section-title trending-heading">You might also like</h2>
          <Link to={searchPath()} className="cart-view-all trending-view-all-link">
            View All <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <p className="cart-rec-state-message">Loading recommendations…</p>
        ) : error ? (
          <p className="cart-rec-state-message cart-rec-state-error">{error}</p>
        ) : products.length === 0 ? (
          <p className="cart-rec-state-message">No recommendations available right now.</p>
        ) : (
          <div className="trending-products-row cart-rec-home-row">
            {products.slice(0, 8).map((product) => (
              <HomeStyleProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {giftProducts.length > 0 ? (
          <div className="cart-gift-ideas">
            <div className="cart-recommended-header trending-header-row">
              <h2 className="cart-section-title trending-heading">Gift ideas</h2>
              <Link to={ROUTES.collection} className="cart-view-all trending-view-all-link">
                View All <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="trending-products-row cart-rec-home-row">
              {giftProducts.map((product) => (
                <HomeStyleProductCard key={`gift-${product._id}`} product={product} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
