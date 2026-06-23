import { useState } from 'react';
import { HeartIcon } from '../icons';
import { ROUTES } from '../../utils/navigation';

export default function ProductCard({ product, variant = 'slider' }) {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <a href={ROUTES.product} className="pd-product-card-link">
      <article className={`pd-product-card ${variant === 'mobile' ? 'pd-product-card-mobile' : ''}`}>
      <div className="pd-product-card-image-wrap">
        <img src={product.image} alt={product.name} className="pd-product-card-image" />
        {product.showSale && <span className="pd-product-card-sale">Sale!</span>}
        {variant === 'mobile' && (
          <div className="pd-product-card-overlay">
            <div className="pd-product-card-info-row">
              <h3 className="pd-product-card-name">{product.name}</h3>
              <button
                type="button"
                className={`pd-product-card-wishlist ${wishlisted ? 'pd-product-card-wishlist-active' : ''}`}
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
            <div className="pd-product-card-prices">
              <span className="pd-product-card-price">{product.price}</span>
              <span className="pd-product-card-price-old">{product.originalPrice}</span>
            </div>
          </div>
        )}
      </div>
      {variant !== 'mobile' && (
        <>
          <div className="pd-product-card-info-row">
            <h3 className="pd-product-card-name">{product.name}</h3>
            <button
              type="button"
              className={`pd-product-card-wishlist ${wishlisted ? 'pd-product-card-wishlist-active' : ''}`}
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
          <div className="pd-product-card-prices">
            <span className="pd-product-card-price">{product.price}</span>
            <span className="pd-product-card-price-old">{product.originalPrice}</span>
          </div>
        </>
      )}
      </article>
    </a>
  );
}
