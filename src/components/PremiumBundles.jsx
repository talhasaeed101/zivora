import { HeartIcon, ArrowRightIcon } from './icons';
import './PremiumBundles.css';

const bundleProducts = [
  { image: '/images/stack1.png', showSale: true },
  { image: '/images/stack2.png', showSale: false },
  { image: '/images/stack3.png', showSale: true },
  { image: '/images/stack4.png', showSale: true },
  { image: '/images/stack5.png', showSale: false },
];

export default function PremiumBundles() {
  return (
    <section id="bundles" className="bundles-section">
      <div className="bundles-inner">
        <div className="bundles-header-row">
          <h2 className="bundles-heading">Premium Bundles</h2>
          <a href="#" className="bundles-view-all-link">
            View All <ArrowRightIcon className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="bundles-products-row">
          {bundleProducts.map((product, index) => (
            <article key={index} className="bundles-product-card" style={{ position: 'relative' }}>
              <div className="bundles-product-image-wrap">
                <img
                  src={product.image}
                  alt="Minimal stacked rings"
                  className="bundles-product-image"
                />
              </div>
              {product.showSale && <span className="bundles-sale-badge">Sale!</span>}
              <div className="bundles-product-info-row">
                <h3 className="bundles-product-name">Minimal stacked rings</h3>
                <button type="button" className="bundles-wishlist-btn" aria-label="Add to wishlist">
                  <HeartIcon />
                </button>
              </div>
              <div className="bundles-price-row">
                <span className="bundles-price-current">$50.00</span>
                <span className="bundles-price-original">$52.00</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
