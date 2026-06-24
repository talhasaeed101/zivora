import { useEffect } from 'react';
import SafeImage from '../SafeImage.jsx';
import { PLACEHOLDER_IMAGE } from '../../utils/products.js';

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

export default function RemoveFromBagModal({ item, onClose, onRemove, onMoveToWishlist }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!item) return null;

  return (
    <div className="cart-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="cart-modal cart-remove-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-modal-title"
      >
        <div className="cart-modal-header">
          <h2 id="remove-modal-title" className="cart-modal-title">Move from Bag</h2>
          <button type="button" className="cart-modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <p className="cart-remove-text">Are you sure you want to move this item from bag?</p>

        <div className="cart-remove-product">
          <SafeImage src={item.image || PLACEHOLDER_IMAGE} alt={item.title} className="cart-remove-image" />
          <div className="cart-remove-details">
            <p className="cart-remove-name">{item.title}</p>
            <p className="cart-remove-material">{item.material}</p>
          </div>
        </div>

        <div className="cart-remove-actions">
          <button type="button" className="cart-modal-secondary-btn" onClick={onRemove}>
            Remove
          </button>
          <button type="button" className="cart-modal-primary-btn" onClick={onMoveToWishlist}>
            Move to Wishlist
          </button>
        </div>
      </div>
    </div>
  );
}
