import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ROUTES, orderPath } from '../../utils/navigation.js';
import './OrderThankYouModal.css';

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

export default function OrderThankYouModal({
  isOpen,
  orderId,
  onClose,
  continueHref = ROUTES.collection,
}) {
  if (!isOpen || typeof document === 'undefined' || !orderId) {
    return null;
  }

  const viewOrderHref = orderPath(orderId);

  return createPortal(
    <div
      className="order-thankyou-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="order-thankyou-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-thankyou-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="order-thankyou-close"
          onClick={onClose}
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        <img
          src="/images/thankyoupic.svg"
          alt=""
          className="order-thankyou-image"
          width={195}
          height={111}
        />

        <h2 id="order-thankyou-title" className="order-thankyou-title">
          Thank you for Ordering!
        </h2>

        <p className="order-thankyou-text">
          Your order has been placed successfully. We&apos;re preparing it now and will keep you
          updated on its progress.
        </p>

        <div className="order-thankyou-actions">
          {/* <Link to={viewOrderHref} className="order-thankyou-btn order-thankyou-btn-secondary" onClick={onClose}>
            View Order
          </Link> */}
          <Link to={continueHref} className="order-thankyou-btn order-thankyou-btn-primary" onClick={onClose}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
