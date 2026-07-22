import { useEffect } from 'react';
import SafeImage from '../SafeImage.jsx';
import { PLACEHOLDER_IMAGE } from '../../utils/products.js';

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

export default function RemoveFromBagModal({
  item,
  onClose,
  onRemove,
  onMoveToWishlist,
  busy = false,
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [busy, onClose]);

  if (!item) return null;

  const title = item.title || 'this item';

  return (
    <div className="cart-modal-overlay" onClick={busy ? undefined : onClose} role="presentation">
      <div
        className="cart-modal cart-remove-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-modal-title"
      >
        <div className="cart-modal-header">
          <h2 id="remove-modal-title" className="cart-modal-title">
            Remove from cart
          </h2>
          <button
            type="button"
            className="cart-modal-close"
            onClick={onClose}
            aria-label="Close"
            disabled={busy}
          >
            <CloseIcon />
          </button>
        </div>

        <p className="cart-remove-text">
          Remove <strong>{title}</strong> from your cart, or move it to your wishlist?
        </p>

        <div className="cart-remove-product">
          <SafeImage src={item.image || PLACEHOLDER_IMAGE} alt={title} className="cart-remove-image" />
          <div className="cart-remove-details">
            <p className="cart-remove-name">{title}</p>
            {item.material ? <p className="cart-remove-material">{item.material}</p> : null}
          </div>
        </div>

        <div className="cart-remove-actions">
          <button
            type="button"
            className="cart-modal-secondary-btn"
            onClick={onRemove}
            disabled={busy}
            aria-label={`Remove ${title} from cart`}
          >
            {busy ? 'Removing…' : 'Remove'}
          </button>
          <button
            type="button"
            className="cart-modal-primary-btn"
            onClick={onMoveToWishlist}
            disabled={busy}
            aria-label={`Move ${title} to wishlist`}
          >
            {busy ? 'Moving…' : 'Move to Wishlist'}
          </button>
        </div>
      </div>
    </div>
  );
}
