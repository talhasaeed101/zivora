import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/navigation';
import { formatPrice } from '../../utils/products.js';
import { formatPaymentMethodLabel } from '../../constants/bankTransfer.js';

const TRUST_ITEMS = [
  'Secure checkout',
  'Carefully packaged',
  'Nationwide delivery',
  'Customer support',
];

function formatAddressLine(address) {
  if (!address) {
    return '';
  }
  return [address.street, address.city, address.province, address.postalCode]
    .filter(Boolean)
    .join(', ');
}

export default function OrderSummary({
  itemCount,
  subtotal,
  discount,
  taxFee = 0,
  total,
  onCheckout,
  checkingOut = false,
  checkoutError = '',
  checkoutSuccess = '',
  canCheckout = true,
  promoCode = '',
  onPromoCodeChange,
  onApplyPromo,
  onRemovePromo,
  promoApplying = false,
  promoError = '',
  appliedPromo = null,
  reviewAddress = null,
  paymentMethod = 'cod',
  reviewItems = [],
}) {
  const handleApply = (event) => {
    event.preventDefault();
    onApplyPromo?.(promoCode.trim());
  };

  const itemLabel = itemCount === 1 ? '1 item' : `${itemCount} items`;
  const paymentLabel = formatPaymentMethodLabel(paymentMethod);
  const addressLine = formatAddressLine(reviewAddress);

  return (
    <aside className="cart-summary" id="checkout-review">
      <div className="cart-summary-card">
        <div className="checkout-section-header cart-summary-step-header">
          <span className="checkout-step-num" aria-hidden="true">
            3
          </span>
          <div>
            <h2 className="cart-summary-title">Order review</h2>
            <p className="cart-summary-subtitle">{itemLabel}</p>
          </div>
        </div>

        {reviewItems.length > 0 ? (
          <ul className="cart-review-items">
            {reviewItems.slice(0, 4).map((item) => (
              <li key={item.id}>
                <span className="cart-review-item-name">{item.title}</span>
                <span className="cart-review-item-meta">×{item.quantity}</span>
              </li>
            ))}
            {reviewItems.length > 4 ? (
              <li className="cart-review-item-more">
                +{reviewItems.length - 4} more
              </li>
            ) : null}
          </ul>
        ) : null}

        <div className="cart-review-meta">
          <div className="cart-review-meta-row">
            <span>Deliver to</span>
            <strong>
              {reviewAddress?.name || 'Add an address'}
              {addressLine ? (
                <span className="cart-review-meta-sub">{addressLine}</span>
              ) : null}
            </strong>
          </div>
          <div className="cart-review-meta-row">
            <span>Payment</span>
            <strong>{paymentLabel}</strong>
          </div>
        </div>

        {appliedPromo ? (
          <div className="cart-promo-applied-row">
            <div className="cart-promo-applied-info">
              <span className="cart-promo-applied-code">{appliedPromo.code}</span>
              <span className="cart-promo-applied-note">Promo applied</span>
            </div>
            <button
              type="button"
              className="cart-promo-remove"
              onClick={() => onRemovePromo?.()}
              disabled={promoApplying || checkingOut}
            >
              Remove
            </button>
          </div>
        ) : (
          <form className="cart-promo-form" onSubmit={handleApply}>
            <label htmlFor="promo-code" className="cart-promo-label">
              Promo code
            </label>
            <div className="cart-promo-row">
              <input
                id="promo-code"
                type="text"
                placeholder="Enter code"
                className="cart-promo-input"
                value={promoCode}
                onChange={(event) => onPromoCodeChange?.(event.target.value)}
                disabled={promoApplying || checkingOut}
                autoComplete="off"
              />
              <button
                type="submit"
                className="cart-promo-apply"
                disabled={promoApplying || checkingOut || !promoCode.trim()}
              >
                {promoApplying ? 'Applying…' : 'Apply'}
              </button>
            </div>
          </form>
        )}

        {promoError ? (
          <p className="cart-promo-error" role="alert">
            {promoError}
          </p>
        ) : null}

        <div className="cart-summary-rows">
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 ? (
            <div className="cart-summary-row cart-summary-discount">
              <span>Discount</span>
              <span>−{formatPrice(discount)}</span>
            </div>
          ) : null}
          {taxFee > 0 ? (
            <div className="cart-summary-row">
              <span>Tax &amp; fee</span>
              <span>{formatPrice(taxFee)}</span>
            </div>
          ) : null}
          <div className="cart-summary-row cart-summary-total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {checkoutError ? (
          <p className="cart-checkout-error" role="alert">
            {checkoutError}
          </p>
        ) : null}
        {checkoutSuccess ? (
          <p className="cart-checkout-success" role="status">
            {checkoutSuccess}
          </p>
        ) : null}

        <button
          type="button"
          className="cart-checkout-btn"
          onClick={onCheckout}
          disabled={!canCheckout || checkingOut}
          aria-busy={checkingOut || undefined}
        >
          {checkingOut ? 'Placing Order…' : 'Place Order'}
        </button>

        {!reviewAddress?.id ? (
          <p className="cart-checkout-helper">Add a delivery address to place your order.</p>
        ) : null}

        <Link to={ROUTES.collection} className="cart-summary-continue">
          Continue shopping
        </Link>

        <ul className="cart-trust-list" aria-label="Shopping assurances">
          {TRUST_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
