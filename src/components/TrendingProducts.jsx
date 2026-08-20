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
import './TrendingProducts.css';

export default function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    loadPublicProducts({ isTrending: true, limit: 8 })
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
        <Reveal className="trending-header-row" variant="fade-up">
          <h2 className="trending-heading">Trending</h2>
          <Link to={searchPath()} prefetch="intent" className="trending-view-all-link">
            View All <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </Reveal>

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
          <div className="trending-products-row reveal-stagger">
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
                  className="trending-product-card-link"
                  variant="fade-up"
                  delay={Math.min(index, 7) * 70}
                >
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
                    {showSale && <span className="trending-sale-badge">Sale!</span>}
                    {outOfStock ? <span className="trending-sale-badge">Out of stock</span> : null}
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
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
