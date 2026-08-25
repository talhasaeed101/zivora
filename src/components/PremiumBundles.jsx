import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from './icons';
import WishlistButton from './WishlistButton.jsx';
import SafeImage from './SafeImage.jsx';
import { searchPath, productPath } from '../utils/navigation';
import { loadPublicProducts } from '../services/catalogCache.js';
import { formatPrice, getProductImage, hasSale, getCategoryName } from '../utils/products.js';
import { isCatalogOutOfStock } from '../utils/inventory.js';
import { ProductRowSkeleton, SectionMessage } from './ProductSectionStates.jsx';
import Reveal from './Reveal.jsx';
import './PremiumBundles.css';

const WhitelistIcon = ({ className = "w-4 h-4", filled }) => (
  <svg
    viewBox="0 0 20 20"
    fill={filled ? "currentColor" : "none"}
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

export default function PremiumBundles() {
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
          setError(err.message || 'Unable to load featured products.');
          setProducts([]);
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
    <section id="bundles" className="bundles-section">
      <div className="bundles-inner">
        <Reveal className="bundles-header-row" variant="fade-up">
          <h2 className="bundles-heading">Premium Bundles</h2>
          <Link to={searchPath()} prefetch="intent" className="bundles-view-all-link">
            View All <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </Reveal>

        {loading ? (
          <ProductRowSkeleton
            count={5}
            rowClassName="bundles-products-row"
            cardClassName="bundles-product-card"
            imageWrapClassName="bundles-product-image-wrap"
          />
        ) : error ? (
          <SectionMessage message={error} className="section-state-message section-state-error" />
        ) : products.length === 0 ? (
          <SectionMessage message="No featured products available right now." />
        ) : (
          <div className="bundles-products-row reveal-stagger">
            {products.map((product, index) => {
              const image = getProductImage(product);
              const showSale = hasSale(product);
              const categoryName = getCategoryName(product.category);
              const outOfStock = isCatalogOutOfStock(product);

              return (
                <Reveal
                  key={product._id}
                  as={Link}
                  to={productPath(product.slug)}
                  className="bundles-product-card-link"
                  variant="fade-up"
                  delay={Math.min(index, 7) * 70}
                >
                  <article
                    className="bundles-product-card"
                    style={{ position: "relative" }}
                  >
                    <div className="bundles-product-image-wrap">
                      <SafeImage
                        src={image}
                        alt={product.title}
                        className="bundles-product-image"
                        sizes="180px"
                        width={320}
                        height={400}
                      />
                    </div>
                    {showSale && <span className="bundles-sale-badge">Sale!</span>}
                    {outOfStock ? <span className="bundles-sale-badge">Out of stock</span> : null}
                    <div className="bundles-product-text-wrap">
                      <div className="bundles-product-info-row">
                        <h3 className="bundles-product-name">
                          {product.title?.length > 20
                            ? `${product.title.slice(0, 20)}...`
                            : product.title}
                        </h3>
                        <WishlistButton
                          productId={product._id}
                          className="bundles-wishlist-btn"
                          activeClassName="bundles-wishlist-btn-active"
                          icon={WhitelistIcon}
                        />
                      </div>
                      {/* {categoryName && (
                        <p className="bundles-product-category">
                          {categoryName}
                        </p>
                      )} */}
                      <div className="bundles-price-row">
                        <span className="bundles-price-current">
                          {formatPrice(product.price)}
                        </span>
                        {product.oldPrice && (
                          <span className="bundles-price-original">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
