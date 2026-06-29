import { useEffect, useState } from 'react';
import { ArrowRightIcon } from './icons';
import WishlistButton from './WishlistButton.jsx';
import SafeImage from './SafeImage.jsx';
import { ROUTES, searchPath } from '../utils/navigation';
import { publicCatalogApi } from '../services/api.js';
import { formatPrice, getProductImage, hasSale, getCategoryName } from '../utils/products.js';
import { ProductRowSkeleton, SectionMessage } from './ProductSectionStates.jsx';
import './TrendingProducts.css';

export default function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    publicCatalogApi
      .getPublicProducts({ isTrending: true, limit: 8 })
      .then((response) => {
        if (isMounted) {
          setProducts(response.data?.products || []);
          setError('');
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Unable to load trending products.');
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
    <section id="collection" className="trending-section">
      <div className="trending-inner">
        <div className="trending-header-row">
          <h2 className="trending-heading">Trending</h2>
          <a href={searchPath()} className="trending-view-all-link">
            View All -&gt;
          </a>
        </div>

        {loading ? (
          <ProductRowSkeleton
            count={5}
            rowClassName="trending-products-row"
            cardClassName="trending-product-card"
            imageWrapClassName="trending-product-image-wrap"
          />
        ) : error ? (
          <SectionMessage message={error} className="section-state-message section-state-error" />
        ) : products.length === 0 ? (
          <SectionMessage message="No trending products available right now." />
        ) : (
          <div className="trending-products-row">
            {products.map((product) => {
              const image = getProductImage(product);
              const showSale = hasSale(product);
              const categoryName = getCategoryName(product.category);

              return (
                <a
                  key={product._id}
                  href={`/product/${product.slug}`}
                  className="trending-product-card-link"
                >
                  <article className="trending-product-card" style={{ position: 'relative' }}>
                    <div className="trending-product-image-wrap">
                      <SafeImage
                        src={image}
                        alt={product.title}
                        className="trending-product-image"
                      />
                    </div>
                    {showSale && <span className="trending-sale-badge">Sale!</span>}
                    <div className="trending-product-info-row">
                      <h3 className="trending-product-name">{product.title}</h3>
                      <WishlistButton
                        productId={product._id}
                        className="trending-wishlist-btn"
                        activeClassName="trending-wishlist-btn-active"
                      />
                    </div>
                    {categoryName && (
                      <p className="trending-product-category">{categoryName}</p>
                    )}
                    <div className="trending-price-row">
                      <span className="trending-price-current">{formatPrice(product.price)}</span>
                      {product.oldPrice && (
                        <span className="trending-price-original">
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
