import { useRef, useState } from 'react';
import { HeartIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons';
import { ROUTES } from '../../utils/navigation';

const PRODUCTS = [
  { id: 1, image: '/images/stack1.png', name: 'Minimal stacked rings', price: 'Rs. 1,999', originalPrice: 'Rs. 2,499', showSale: true },
  { id: 2, image: '/images/stack2.png', name: 'Minimal stacked rings', price: 'Rs. 1,999', originalPrice: 'Rs. 2,499', showSale: false },
  { id: 3, image: '/images/stack3.png', name: 'Minimal stacked rings', price: 'Rs. 1,999', originalPrice: 'Rs. 2,499', showSale: true },
  { id: 4, image: '/images/stack4.png', name: 'Minimal stacked rings', price: 'Rs. 1,999', originalPrice: 'Rs. 2,499', showSale: true },
  { id: 5, image: '/images/stack5.png', name: 'Minimal stacked rings', price: 'Rs. 1,999', originalPrice: 'Rs. 2,499', showSale: false },
  { id: 6, image: '/images/stack1.png', name: 'Minimal stacked rings', price: 'Rs. 1,999', originalPrice: 'Rs. 2,499', showSale: true },
];

function RecommendedCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <a href={ROUTES.product} className="cart-rec-card-link">
      <article className="cart-rec-card">
      <div className="cart-rec-image-wrap">
        <img src={product.image} alt={product.name} className="cart-rec-image" />
        {product.showSale && <span className="cart-rec-sale">Sale!</span>}
      </div>
      <div className="cart-rec-info">
        <div className="cart-rec-info-row">
          <h3 className="cart-rec-name">{product.name}</h3>
          <button
            type="button"
            className={`cart-rec-wishlist ${wishlisted ? 'cart-rec-wishlist-active' : ''}`}
            aria-label="Add to wishlist"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setWishlisted(!wishlisted);
            }}
          >
            <HeartIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="cart-rec-prices">
          <span className="cart-rec-price">{product.price}</span>
          <span className="cart-rec-price-old">{product.originalPrice}</span>
        </div>
      </div>
      </article>
    </a>
  );
}

export default function RecommendedProducts() {
  const sliderRef = useRef(null);

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
        <a href={ROUTES.search} className="cart-view-all">
          View All <ArrowRightIcon className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="cart-rec-slider-wrap">
        <button type="button" className="cart-rec-nav cart-rec-nav-prev" onClick={() => scroll(-1)} aria-label="Previous">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <div className="cart-rec-slider" ref={sliderRef}>
          {PRODUCTS.map((product) => (
            <RecommendedCard key={product.id} product={product} />
          ))}
        </div>
        <button type="button" className="cart-rec-nav cart-rec-nav-next" onClick={() => scroll(1)} aria-label="Next">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
