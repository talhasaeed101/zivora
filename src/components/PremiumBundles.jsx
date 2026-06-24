import { useEffect, useState } from 'react';
import { ArrowRightIcon } from './icons';
import WishlistButton from './WishlistButton.jsx';
import SafeImage from './SafeImage.jsx';
import { searchPath } from '../utils/navigation';
import { publicCatalogApi } from '../services/api.js';
import { formatPrice, getProductImage, hasSale, getCategoryName } from '../utils/products.js';
import { ProductRowSkeleton, SectionMessage } from './ProductSectionStates.jsx';
import './PremiumBundles.css';

export default function PremiumBundles() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    publicCatalogApi
      .getPublicProducts({ isFeatured: true, limit: 8 })
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
        <div className="bundles-header-row">
          <h2 className="bundles-heading">Premium Bundles</h2>
          <a href={searchPath()} className="bundles-view-all-link">
            View All <ArrowRightIcon className="w-3.5 h-3.5" />
          </a>
        </div>

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
          <div className="bundles-products-row">
            {products.map((product) => {
              const image = getProductImage(product);
              const showSale = hasSale(product);
              const categoryName = getCategoryName(product.category);

              return (
                <a
                  key={product._id}
                  href={`/product/${product.slug}`}
                  className="bundles-product-card-link"
                >
                  <article className="bundles-product-card" style={{ position: 'relative' }}>
                    <div className="bundles-product-image-wrap">
                      <SafeImage
                        src={image}
                        alt={product.title}
                        className="bundles-product-image"
                      />
                    </div>
                    {showSale && <span className="bundles-sale-badge">Sale!</span>}
                    <div className="bundles-product-info-row">
                      <h3 className="bundles-product-name">{product.title}</h3>
                      <WishlistButton
                        productId={product._id}
                        className="bundles-wishlist-btn"
                        activeClassName="bundles-wishlist-btn-active"
                      />
                    </div>
                    {categoryName && (
                      <p className="bundles-product-category">{categoryName}</p>
                    )}
                    <div className="bundles-price-row">
                      <span className="bundles-price-current">{formatPrice(product.price)}</span>
                      {product.oldPrice && (
                        <span className="bundles-price-original">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                    </div>
                  </article>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
