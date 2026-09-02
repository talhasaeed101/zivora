import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../icons';
import WishlistButton from '../WishlistButton.jsx';
import SafeImage from '../SafeImage.jsx';
import { productPath, searchPath } from '../../utils/navigation';
import { loadPublicProducts } from '../../services/catalogCache.js';
import { formatPrice, getProductImage, hasSale } from '../../utils/products.js';
import { isCatalogOutOfStock } from '../../utils/inventory.js';

const WhitelistIcon = ({ className = 'w-4 h-4', filled }) => (
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

export default function RecommendedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    loadPublicProducts({ isFeatured: true, limit: 8 })
      .then((response) => {
        if (isMounted) {
          setProducts(response.data?.products || []);
          setError('');
        }
      })
      .catch((err) => {
        if (isMounted) {
          setProducts([]);
          setError(err.message || 'Unable to load recommendations.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="cart-recommended">
      <div className="cart-recommended-inner">
        <div className="cart-recommended-header">
          <h2 className="cart-section-title">You might also like</h2>
          <Link to={searchPath()} className="cart-view-all">
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
          <div className="cart-rec-slider">
            {products.map((product) => {
              const image = getProductImage(product);
              const showSale = hasSale(product);
              const outOfStock = isCatalogOutOfStock(product);

              return (
                <Link
                  key={product._id}
                  to={productPath(product.slug)}
                  className="cart-rec-card-link"
                >
                  <article className="cart-rec-card">
                    <div className="cart-rec-image-wrap">
                      <SafeImage
                        src={image}
                        alt={product.title}
                        className="cart-rec-image"
                        sizes="180px"
                        width={320}
                        height={400}
                      />
                    </div>
                    {showSale ? <span className="cart-rec-sale">Sale!</span> : null}
                    {outOfStock ? <span className="cart-rec-sale">Out of stock</span> : null}
                    <div className="cart-rec-text-wrap">
                      <div className="cart-rec-info-row">
                        <h3 className="cart-rec-name">
                          {product.title?.length > 20
                            ? `${product.title.slice(0, 20)}...`
                            : product.title}
                        </h3>
                        <WishlistButton
                          productId={product._id}
                          className="cart-rec-wishlist"
                          activeClassName="cart-rec-wishlist-active"
                          icon={WhitelistIcon}
                        />
                      </div>
                      <div className="cart-rec-prices">
                        <span className="cart-rec-price">{formatPrice(product.price)}</span>
                        {product.oldPrice ? (
                          <span className="cart-rec-price-old">{formatPrice(product.oldPrice)}</span>
                        ) : null}
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
