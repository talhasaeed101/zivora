import { HeartIcon, ArrowRightIcon } from './icons';
import './TrendingProducts.css';

const trendingProducts = [
  { image: '/images/trending-product-1.png', showSale: true },
  { image: '/images/trending-product-2.png', showSale: false },
  { image: '/images/trending-product-3.png', showSale: true },
  { image: '/images/trending-product-4.png', showSale: true },
  { image: '/images/trending-product-5.png', showSale: false },
];

export default function TrendingProducts() {
  return (
    <section id="collection" className="trending-section">
      <div className="trending-inner">
        <div className="trending-header-row">
          <h2 className="trending-heading">Trending</h2>
          <a href="#" className="trending-view-all-link">
            View All <ArrowRightIcon className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="trending-products-row">
          {trendingProducts.map((product, index) => (
            <article key={index} className="trending-product-card">
              <div className="trending-product-image-wrap">
                <img
                  src={product.image}
                  alt="Minimal stacked rings"
                  className="trending-product-image"
                />
                {product.showSale && <span className="trending-sale-badge">Sale!</span>}
              </div>
              <div className="trending-product-info-row">
                <h3 className="trending-product-name">Minimal stacked rings</h3>
                <button type="button" className="trending-wishlist-btn" aria-label="Add to wishlist">
                  <HeartIcon />
                </button>
              </div>
              <div className="trending-price-row">
                <span className="trending-price-current">Rs. 1,999</span>
                <span className="trending-price-original">Rs. 2,499</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
