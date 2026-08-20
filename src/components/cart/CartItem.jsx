import { Link } from 'react-router-dom';
import { ROUTES, productPath } from '../../utils/navigation';
import { PLACEHOLDER_IMAGE, formatPrice } from '../../utils/products.js';
import { buildCustomizationSummaryLines } from '../../utils/customizationSummary.js';
import SafeImage from '../SafeImage.jsx';

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

function formatMetalLabel(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function CartItem({
  item,
  onQuantityChange,
  onRemove,
  updating = false,
  removing = false,
}) {
  const lineTotal = item.unitPrice * item.quantity;
  const productHref = item.slug ? productPath(item.slug) : ROUTES.product;
  const imageSrc = item.image || PLACEHOLDER_IMAGE;
  const customizationLines = item.isCustomized
    ? buildCustomizationSummaryLines(item.product, item.customization).filter(
        (line) => line?.label && line?.value != null && String(line.value).trim() !== ''
      )
    : [];
  const metalLabel = formatMetalLabel(item.metalColor);
  const materialLabel =
    item.material && item.material !== item.metalColor ? item.material : null;
  const showSale = Boolean(item.oldPrice && item.oldPrice > item.unitPrice);
  const title = item.title || 'Product';
  const maxQuantity = Number(item.maxQuantity);
  const hasMax = Number.isFinite(maxQuantity);
  const atMax = hasMax && item.quantity >= maxQuantity;
  const remaining = hasMax ? Math.max(0, maxQuantity - item.quantity) : null;

  return (
    <article
      className={`cart-item${removing ? ' is-removing' : ''}${updating ? ' is-updating' : ''}`}
      aria-busy={updating || removing || undefined}
    >
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
            {metalLabel ? (
              <li>
                <span className="cart-item-variant-label">Metal</span>
                <span>{metalLabel}</span>
              </li>
            ) : null}
            {materialLabel && !metalLabel ? (
              <li>
                <span className="cart-item-variant-label">Material</span>
                <span>{materialLabel}</span>
              </li>
            ) : null}
          </ul>

          {customizationLines.length > 0 ? (
            <ul className="cart-item-customization">
              {customizationLines.map((line) => (
                <li key={`${line.label}-${line.value}`}>
                  <strong>{line.label}:</strong> {line.value}
                </li>
              ))}
            </ul>
          ) : null}

          {item.isCustomized && item.extraPrice > 0 ? (
            <p className="cart-item-extra-price">
              Customization extras: {formatPrice(item.extraPrice)} each
            </p>
          ) : null}

          <div className="cart-item-unit-price">
            <span className="cart-item-unit-current">{formatPrice(item.unitPrice)}</span>
            {showSale ? (
              <span className="cart-item-unit-old">{formatPrice(item.oldPrice)}</span>
            ) : null}
            <span className="cart-item-unit-note">each</span>
          </div>
        </div>
      </div>

      <div className="cart-item-actions">
        <div className="cart-item-qty" role="group" aria-label={`Quantity for ${title}`}>
          <button
            type="button"
            className="cart-item-qty-btn"
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            aria-label={`Decrease quantity of ${title}`}
            disabled={updating || removing || item.quantity <= 1}
          >
            −
          </button>
          <span className="cart-item-qty-value" aria-live="polite">
            {item.quantity}
          </span>
          <button
            type="button"
            className="cart-item-qty-btn"
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            aria-label={`Increase quantity of ${title}`}
            disabled={updating || removing || atMax}
          >
            +
          </button>
        </div>
        {atMax ? (
          <p className="cart-item-stock-hint">Maximum available quantity reached.</p>
        ) : remaining !== null && remaining <= 5 ? (
          <p className="cart-item-stock-hint">
            {remaining === 1 ? 'Only 1 left' : `Only ${remaining} left`}
          </p>
        ) : null}

        <div className="cart-item-price-col">
          <span className="cart-item-price-label">Line total</span>
          <span className="cart-item-price">{formatPrice(lineTotal)}</span>
        </div>

        <button
          type="button"
          className="cart-item-remove"
          onClick={() => onRemove(item)}
          aria-label={`Remove ${title} from cart`}
          disabled={updating || removing}
        >
          <CloseIcon />
        </button>
      </div>
    </article>
  );
}
