import { Link } from 'react-router-dom';
import { ROUTES, productPath } from '../../utils/navigation';
import { PLACEHOLDER_IMAGE, formatPrice } from '../../utils/products.js';
import SafeImage from '../SafeImage.jsx';

export default function SavedCartItem({
  item,
  onMoveToCart,
  onRemove,
  busy = false,
  showMoveToCart = true,
}) {
  const title = item.title || 'Product';
  const productHref = item.slug ? productPath(item.slug) : ROUTES.product;
  const imageSrc = item.image || PLACEHOLDER_IMAGE;
  const unitPrice = item.unitPrice ?? item.price ?? 0;

  return (
    <article className="cart-item cart-saved-item" aria-busy={busy || undefined}>
      <div className="cart-item-product">
        <Link to={productHref} className="cart-item-image-link">
          <SafeImage
            src={imageSrc}
            alt={title}
            className="cart-item-image"
            width={160}
            height={200}
            sizes="120px"
          />
        </Link>
        <div className="cart-item-details">
          <h3 className="cart-item-title">
            <Link to={productHref} className="cart-item-title-link">
              {title}
            </Link>
          </h3>
          <ul className="cart-item-variants">
            {item.ringSize ? (
              <li>
                <span className="cart-item-variant-label">Ring size</span>
                <span>{item.ringSize}</span>
              </li>
            ) : null}
            {item.metalColor ? (
              <li>
                <span className="cart-item-variant-label">Metal</span>
                <span>{item.metalColor}</span>
              </li>
            ) : null}
            <li>
              <span className="cart-item-variant-label">Qty</span>
              <span>{item.quantity || 1}</span>
            </li>
          </ul>
          <div className="cart-item-unit-price">
            <span className="cart-item-unit-current">{formatPrice(unitPrice)}</span>
          </div>
          <div className="cart-saved-actions">
            {showMoveToCart ? (
              <button
                type="button"
                className="cart-saved-move-btn"
                onClick={() => onMoveToCart?.(item)}
                disabled={busy}
              >
                {busy ? 'Moving…' : 'Move to cart'}
              </button>
            ) : null}
            <button
              type="button"
              className="cart-saved-remove-btn"
              onClick={() => onRemove?.(item)}
              disabled={busy}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
