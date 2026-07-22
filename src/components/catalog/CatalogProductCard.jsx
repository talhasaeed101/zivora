import { Link } from 'react-router-dom';
import WishlistButton from '../WishlistButton.jsx';
import SafeImage from '../SafeImage.jsx';
import { formatPrice, getProductImage, getCategoryName, hasSale } from '../../utils/products.js';
import { productPath } from '../../utils/navigation';

export default function CatalogProductCard({
  product,
  variant = 'desktop',
  footer = null,
  className = '',
  removing = false,
}) {
  const image = getProductImage(product);
  const secondaryImage =
    Array.isArray(product?.images) && product.images.length > 1 ? product.images[1] : null;
  const showSale = hasSale(product);
  const outOfStock = typeof product?.stock === 'number' && product.stock <= 0;
  const categoryName = getCategoryName(product?.category);
  const href = productPath(product.slug);
  const isMobile = variant === 'mobile';
  const withFooter = Boolean(footer);
  const cardClass = `catalog-product-card${isMobile && !withFooter ? ' catalog-product-card-mobile' : ''}${
    outOfStock ? ' is-out-of-stock' : ''
  }${removing ? ' is-removing' : ''}${className ? ` ${className}` : ''}`;

  const badges = (
    <>
      {showSale ? <span className="catalog-sale-badge">Sale</span> : null}
      {outOfStock ? <span className="catalog-oos-badge">Out of stock</span> : null}
    </>
  );

  const imageInner = (
    <>
      <SafeImage src={image} alt={product.title || 'Product'} className="catalog-product-image" />
      {secondaryImage ? (
        <SafeImage
          src={secondaryImage}
          alt=""
          className="catalog-product-image catalog-product-image-secondary"
          aria-hidden="true"
        />
      ) : null}
    </>
  );

  if (withFooter) {
    return (
      <article className={cardClass} aria-busy={removing || undefined}>
        {badges}
        <Link
          to={href}
          className="catalog-product-image-link catalog-product-image-wrap"
          aria-label={`View ${product.title || 'product'}`}
        >
          {imageInner}
        </Link>

        <div className="catalog-product-info-row">
          <h3 className="catalog-product-name">
            <Link to={href} className="catalog-product-name-link">
              {product.title}
            </Link>
          </h3>
          <WishlistButton
            productId={product._id}
            className="catalog-wishlist-btn"
            activeClassName="catalog-wishlist-btn-active"
          />
        </div>
        {categoryName ? <p className="catalog-product-label">{categoryName}</p> : null}
        <div className="catalog-price-row">
          <span className="catalog-price-current">{formatPrice(product.price)}</span>
          {product.oldPrice && product.oldPrice > product.price ? (
            <span className="catalog-price-original">{formatPrice(product.oldPrice)}</span>
          ) : null}
        </div>
        <div className="catalog-product-footer">{footer}</div>
      </article>
    );
  }

  return (
    <a
      href={href}
      className={`catalog-product-card-link${isMobile ? ' catalog-product-card-link-mobile' : ''}`}
    >
      <article className={cardClass}>
        {badges}
        <div
          className={`catalog-product-image-wrap${
            isMobile ? ' catalog-product-image-wrap-mobile' : ''
          }`}
        >
          {imageInner}
          {isMobile ? (
            <div className="catalog-product-overlay">
              <div className="catalog-product-info-row">
                <h3 className="catalog-product-name catalog-product-name-mobile">{product.title}</h3>
                <WishlistButton
                  productId={product._id}
                  className="catalog-wishlist-btn"
                  activeClassName="catalog-wishlist-btn-active"
                />
              </div>
              {categoryName ? <p className="catalog-product-label">{categoryName}</p> : null}
              <div className="catalog-price-row">
                <span className="catalog-price-current">{formatPrice(product.price)}</span>
                {product.oldPrice && product.oldPrice > product.price ? (
                  <span className="catalog-price-original">{formatPrice(product.oldPrice)}</span>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        {!isMobile ? (
          <>
            <div className="catalog-product-info-row">
              <h3 className="catalog-product-name">{product.title}</h3>
              <WishlistButton
                productId={product._id}
                className="catalog-wishlist-btn"
                activeClassName="catalog-wishlist-btn-active"
              />
            </div>
            {categoryName ? <p className="catalog-product-label">{categoryName}</p> : null}
            <div className="catalog-price-row">
              <span className="catalog-price-current">{formatPrice(product.price)}</span>
              {product.oldPrice && product.oldPrice > product.price ? (
                <span className="catalog-price-original">{formatPrice(product.oldPrice)}</span>
              ) : null}
            </div>
          </>
        ) : null}
      </article>
    </a>
  );
}
