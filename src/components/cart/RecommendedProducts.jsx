import { useEffect, useRef, useState } from 'react';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons';
import WishlistButton from '../WishlistButton.jsx';
import SafeImage from '../SafeImage.jsx';
import { searchPath } from '../../utils/navigation';
import { publicCatalogApi } from '../../services/api.js';
import { formatPrice, getProductImage, hasSale } from '../../utils/products.js';

function RecommendedCard({ product }) {
  const image = getProductImage(product);
  const showSale = hasSale(product);

  return (
    <a href={`/product/${product.slug}`} className="cart-rec-card-link">
      <article className="cart-rec-card">
        <div className="cart-rec-image-wrap">
          <SafeImage src={image} alt={product.title} className="cart-rec-image" />
          {showSale && <span className="cart-rec-sale">Sale!</span>}
        </div>
        <div className="cart-rec-info">
          <div className="cart-rec-info-row">
            <h3 className="cart-rec-name">{product.title}</h3>
            <WishlistButton
              productId={product._id}
              className="cart-rec-wishlist"
              activeClassName="cart-rec-wishlist-active"
            />
          </div>
          <div className="cart-rec-prices">
            <span className="cart-rec-price">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="cart-rec-price-old">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
        </div>
      </article>
    </a>
  );
}

export default function RecommendedProducts() {
  const sliderRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    publicCatalogApi
      .getPublicProducts({ isFeatured: true, limit: 6 })
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

  const scroll = (direction) => {
    if (!sliderRef.current) return;
    const card = sliderRef.current.querySelector('.cart-rec-card');
    const cardWidth = card?.offsetWidth || 260;
    sliderRef.current.scrollBy({ left: direction * (cardWidth + 20), behavior: 'smooth' });
  };

  return (
    <section className="cart-recommended">
      <div className="cart-recommended-header">
        <h2 className="cart-section-title">You might also like</h2>
        <a href={searchPath()} className="cart-view-all">
          View All <ArrowRightIcon className="w-3.5 h-3.5" />
        </a>
      </div>

      {loading ? (
        <p className="cart-rec-state-message">Loading recommendations...</p>
      ) : error ? (
        <p className="cart-rec-state-message cart-rec-state-error">{error}</p>
      ) : products.length === 0 ? (
        <p className="cart-rec-state-message">No recommendations available right now.</p>
      ) : (
        <div className="cart-rec-slider-wrap">
          <button type="button" className="cart-rec-nav cart-rec-nav-prev" onClick={() => scroll(-1)} aria-label="Previous">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div className="cart-rec-slider" ref={sliderRef}>
            {products.map((product) => (
              <RecommendedCard key={product._id} product={product} />
            ))}
          </div>
          <button type="button" className="cart-rec-nav cart-rec-nav-next" onClick={() => scroll(1)} aria-label="Next">
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </section>
  );
}
