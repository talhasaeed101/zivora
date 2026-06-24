import WishlistButton from '../WishlistButton.jsx';
import SafeImage from '../SafeImage.jsx';
import { formatPrice, getProductImage, hasSale } from '../../utils/products.js';
import { productPath } from '../../utils/navigation';

export default function CatalogProductCard({ product, variant = 'desktop' }) {
  const image = getProductImage(product);
  const showSale = hasSale(product);
  const href = productPath(product.slug);

  const cardContent = variant === 'mobile' ? (
    <>
      <div className="catalog-product-image-wrap catalog-product-image-wrap-mobile">
        <SafeImage src={image} alt={product.title} className="catalog-product-image" />
        {showSale && <span className="catalog-sale-badge">Sale!</span>}
        <div className="catalog-product-overlay">
          <div className="catalog-product-info-row">
            <h3 className="catalog-product-name catalog-product-name-mobile">{product.title}</h3>
            <WishlistButton
              productId={product._id}
              className="catalog-wishlist-btn"
              activeClassName="catalog-wishlist-btn-active"
            />
          </div>
          <div className="catalog-price-row">
            <span className="catalog-price-current">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="catalog-price-original">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
        </div>
      </div>
    </>
  ) : (
    <>
      <div className="catalog-product-image-wrap">
        <SafeImage src={image} alt={product.title} className="catalog-product-image" />
        {showSale && <span className="catalog-sale-badge">Sale!</span>}
      </div>
      <div className="catalog-product-info-row">
        <h3 className="catalog-product-name">{product.title}</h3>
        <WishlistButton
          productId={product._id}
          className="catalog-wishlist-btn"
          activeClassName="catalog-wishlist-btn-active"
        />
      </div>
      <div className="catalog-price-row">
        <span className="catalog-price-current">{formatPrice(product.price)}</span>
        {product.oldPrice && (
          <span className="catalog-price-original">{formatPrice(product.oldPrice)}</span>
        )}
      </div>
    </>
  );

  return (
    <a
      href={href}
      className={`catalog-product-card-link ${variant === 'mobile' ? 'catalog-product-card-link-mobile' : ''}`}
    >
      <article className={`catalog-product-card ${variant === 'mobile' ? 'catalog-product-card-mobile' : ''}`}>
        {cardContent}
      </article>
    </a>
  );
}
