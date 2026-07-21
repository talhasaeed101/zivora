import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons';
import WishlistButton from '../WishlistButton.jsx';
import SafeImage from '../SafeImage.jsx';
import { productPath, searchPath } from '../../utils/navigation';
import { publicCatalogApi } from '../../services/api.js';
import { formatPrice, getProductImage, hasSale } from '../../utils/products.js';

function RecommendedCard({ product }) {
  const image = getProductImage(product);
  const showSale = hasSale(product);
  const href = productPath(product.slug);

  return (
    <article className="cart-rec-card">
      <div className="cart-rec-image-wrap">
        <Link to={href} className="cart-rec-image-link" aria-label={product.title}>
          <SafeImage src={image} alt={product.title} className="cart-rec-image" />
        </Link>
        {showSale ? <span className="cart-rec-sale">Sale</span> : null}
        <WishlistButton
          productId={product._id}
          className="cart-rec-wishlist"
          activeClassName="cart-rec-wishlist-active"
        />
      </div>
      <div className="cart-rec-info">
        <h3 className="cart-rec-name">
          <Link to={href} className="cart-rec-name-link">
            {product.title}
          </Link>
        </h3>
        <div className="cart-rec-prices">
          <span className="cart-rec-price">{formatPrice(product.price)}</span>
          {product.oldPrice && product.oldPrice > product.price ? (
            <span className="cart-rec-price-old">{formatPrice(product.oldPrice)}</span>
          ) : null}
        </div>
      </div>
    </article>
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
        <div className="cart-rec-slider-wrap">
          <button
            type="button"
            className="cart-rec-nav cart-rec-nav-prev"
            onClick={() => scroll(-1)}
            aria-label="Previous recommendations"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div className="cart-rec-slider" ref={sliderRef}>
            {products.map((product) => (
              <RecommendedCard key={product._id} product={product} />
            ))}
          </div>
          <button
            type="button"
            className="cart-rec-nav cart-rec-nav-next"
            onClick={() => scroll(1)}
            aria-label="Next recommendations"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </section>
  );
}
