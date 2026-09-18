import { Link } from 'react-router-dom';
import { ROUTES, productPath } from '../../utils/navigation';
import { PLACEHOLDER_IMAGE, formatPrice } from '../../utils/products.js';
import { buildCustomizationSummaryLines } from '../../utils/customizationSummary.js';
import SafeImage from '../SafeImage.jsx';

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M9 14L4 9l5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9h10a6 6 0 010 12h-3" strokeLinecap="round" strokeLinejoin="round" />
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

function displayTitle(title) {
  const text = String(title || 'Product').trim();
  if (text.length <= 28) return text;
  return `${text.slice(0, 28).trimEnd()}…`;
}

export default function CartItem({
  item,
  onQuantityChange,
  onRemove,
  onSaveForLater,
  updating = false,
  removing = false,
  saving = false,
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
  const variantLabel = metalLabel || materialLabel || (item.ringSize ? `Size ${item.ringSize}` : '');
  const title = item.title || 'Product';
  const maxQuantity = Number(item.maxQuantity);
  const hasMax = Number.isFinite(maxQuantity);
  const atMax = hasMax && item.quantity >= maxQuantity;
  const remaining = hasMax ? Math.max(0, maxQuantity - item.quantity) : null;
  const shippingNote = item.shippingDate || item.product?.shippingDate || null;

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
            height={130}
            sizes="160px"
          />
        </Link>

        <div className="cart-item-details">
          <h3 className="cart-item-title" title={title}>
            <Link to={productHref} className="cart-item-title-link">
              {displayTitle(title)}
            </Link>
          </h3>

          {variantLabel ? <p className="cart-item-variant">{variantLabel}</p> : null}

          {(item.ringSize && metalLabel) || customizationLines.length > 0 ? (
            <ul className="cart-item-variants cart-item-variants-extra">
              {item.ringSize && metalLabel ? (
                <li>
                  <span className="cart-item-variant-label">Ring size</span>
                  <span>{item.ringSize}</span>
                </li>
              ) : null}
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

          <div className="cart-item-meta">
            {/* <span className="cart-item-meta-row">
              <ClockIcon />
              <span>{shippingNote || 'Nationwide delivery'}</span>
            </span> */}
            {/* <span className="cart-item-meta-divider" aria-hidden="true" /> */}
            <span className="cart-item-meta-row">
              <ReturnIcon />
              <span>
                <strong>7 days</strong> return available
              </span>
            </span>
          </div>

          {/* {onSaveForLater ? (
            <button
              type="button"
              className="cart-item-save-later"
              onClick={() => onSaveForLater(item)}
              disabled={updating || removing || saving}
            >
              {saving ? 'Saving…' : 'Save for later'}
            </button>
          ) : null} */}
        </div>
      </div>

      <div className="cart-item-qty-wrap">
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
          <p className="cart-item-stock-hint">Max quantity reached</p>
        ) : remaining !== null && remaining <= 5 ? (
          <p className="cart-item-stock-hint">
            {remaining === 1 ? 'Only 1 left' : `Only ${remaining} left`}
          </p>
        ) : null}
      </div>

      <div className="cart-item-price-col">
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
    </article>
  );
}
