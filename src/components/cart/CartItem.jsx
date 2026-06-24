import { ROUTES, productPath } from '../../utils/navigation';
import { PLACEHOLDER_IMAGE } from '../../utils/products.js';
import SafeImage from '../SafeImage.jsx';

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 14L4 9l5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9h12a4 4 0 014 4v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

function formatPrice(amount) {
  return `Rs. ${amount.toLocaleString('en-IN')}`;
}

export default function CartItem({ item, onQuantityChange, onRemove, updating = false }) {
  const lineTotal = item.unitPrice * item.quantity;
  const productHref = item.slug ? productPath(item.slug) : ROUTES.product;
  const imageSrc = item.image || PLACEHOLDER_IMAGE;

  return (
    <article className="cart-item">
      <div className="cart-item-product">
        <a href={productHref} className="cart-item-image-link">
          <SafeImage src={imageSrc} alt={item.title} className="cart-item-image" />
        </a>
        <div className="cart-item-details">
          <h3 className="cart-item-title">
            <a href={productHref} className="cart-item-title-link">{item.title}</a>
          </h3>
          <p className="cart-item-material">{item.material}</p>
          <div className="cart-item-meta">
            <span className="cart-item-meta-item">
              <CalendarIcon />
              {item.deliveryDate}
            </span>
            <span className="cart-item-meta-item">
              <ReturnIcon />
              {item.returnPolicy}
            </span>
          </div>
        </div>
      </div>

      <div className="cart-item-count">
        <div className="cart-item-qty">
          <button
            type="button"
            className="cart-item-qty-btn"
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            aria-label="Decrease quantity"
            disabled={updating || item.quantity <= 1}
          >
            −
          </button>
          <span className="cart-item-qty-value">{item.quantity}</span>
          <button
            type="button"
            className="cart-item-qty-btn"
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            aria-label="Increase quantity"
            disabled={updating}
          >
            +
          </button>
        </div>
      </div>

      <div className="cart-item-price-col">
        <span className="cart-item-price">{formatPrice(lineTotal)}</span>
      </div>

      <button
        type="button"
        className="cart-item-remove"
        onClick={() => onRemove(item)}
        aria-label="Remove item"
        disabled={updating}
      >
        <CloseIcon />
      </button>
    </article>
  );
}
