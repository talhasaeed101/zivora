import WishlistButton from '../WishlistButton.jsx';
import SafeImage from '../SafeImage.jsx';
import { productPath } from '../../utils/navigation';
import { mapProductForCard } from '../../utils/products.js';

export default function ProductCard({ product, variant = 'slider' }) {
  const cardProduct = product.slug ? mapProductForCard(product) : product;
  const href = cardProduct.slug ? productPath(cardProduct.slug) : productPath();
  const productId = product._id || cardProduct.id;

  return (
    <a href={href} className="pd-product-card-link">
      <article className={`pd-product-card ${variant === 'mobile' ? 'pd-product-card-mobile' : ''}`}>
      <div className="pd-product-card-image-wrap">
        <SafeImage src={cardProduct.image} alt={cardProduct.name} className="pd-product-card-image" />
        {cardProduct.showSale && <span className="pd-product-card-sale">Sale!</span>}
        {variant === 'mobile' && (
          <div className="pd-product-card-overlay">
            <div className="pd-product-card-info-row">
              <h3 className="pd-product-card-name">{cardProduct.name}</h3>
              <WishlistButton
                productId={productId}
                className="pd-product-card-wishlist"
                activeClassName="pd-product-card-wishlist-active"
              />
            </div>
            <div className="pd-product-card-prices">
              <span className="pd-product-card-price">{cardProduct.price}</span>
              {cardProduct.originalPrice && (
                <span className="pd-product-card-price-old">{cardProduct.originalPrice}</span>
              )}
            </div>
          </div>
        )}
      </div>
      {variant !== 'mobile' && (
        <>
          <div className="pd-product-card-info-row">
            <h3 className="pd-product-card-name">{cardProduct.name}</h3>
            <WishlistButton
              productId={productId}
              className="pd-product-card-wishlist"
              activeClassName="pd-product-card-wishlist-active"
            />
          </div>
          <div className="pd-product-card-prices">
            <span className="pd-product-card-price">{cardProduct.price}</span>
            {cardProduct.originalPrice && (
              <span className="pd-product-card-price-old">{cardProduct.originalPrice}</span>
            )}
          </div>
        </>
      )}
      </article>
    </a>
  );
}
