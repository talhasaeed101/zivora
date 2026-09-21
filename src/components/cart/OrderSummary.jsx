import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/navigation';
import { formatPrice } from '../../utils/products.js';
import { formatPaymentMethodLabel } from '../../constants/bankTransfer.js';
import { PDP_TRUST_ITEMS } from '../../constants/storefrontCopy.js';

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
  discountLabel = null,
  loyaltyDiscount = null,
  loyaltyBalance = null,
  loyaltyPointsInput = '',
  onLoyaltyPointsChange,
  onApplyLoyalty,
  onRemoveLoyalty,
  loyaltyApplying = false,
  loyaltyError = '',
  taxFee = 0,
  total,
  onCheckout,
  checkingOut = false,
  checkoutError = '',
  checkoutSuccess = '',
  canCheckout = false,
  promoCode = '',
  onPromoCodeChange,
  onApplyPromo,
  onRemovePromo,
  promoApplying = false,
  promoError = '',
  appliedPromo = null,
  reviewAddress = null,
  paymentMethod = null,
  reviewItems = [],
  showLoyalty = false,
  onAddAddress,
}) {
  const handleApply = (event) => {
    event.preventDefault();
    onApplyPromo?.(promoCode.trim());
  };

  const handleApplyLoyalty = (event) => {
    event.preventDefault();
    onApplyLoyalty?.(loyaltyPointsInput);
  };

  const itemLabel = itemCount === 1 ? '1 item' : `${itemCount} items`;
  const paymentLabel = formatPaymentMethodLabel(paymentMethod);
  const addressLine = formatAddressLine(reviewAddress);
  const loyaltyPointsApplied = Number(loyaltyDiscount?.points) || 0;
  const loyaltyAmountApplied = Number(loyaltyDiscount?.amount) || 0;
  const availablePoints = Math.max(0, Math.trunc(Number(loyaltyBalance) || 0));

  return (
    <aside className="cart-summary" id="checkout-review">
      <div className="cart-summary-card">
        <div className="cart-summary-header">
          <h2 className="cart-summary-title">
            Summary{' '}
            <span className="cart-summary-count">({itemLabel})</span>
          </h2>
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
{/* 
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
        </div> */}

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
                placeholder="Type here..."
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
{/* 
        {showLoyalty ? (
          <div className="cart-loyalty-block">
            <p className="cart-loyalty-available">
              Available Points:{' '}
              <strong>{availablePoints.toLocaleString('en-US')}</strong>
            </p>

            {loyaltyPointsApplied > 0 ? (
              <div className="cart-promo-applied-row">
                <div className="cart-promo-applied-info">
                  <span className="cart-promo-applied-code">
                    {loyaltyPointsApplied.toLocaleString('en-US')} pts
                  </span>
                  <span className="cart-promo-applied-note">
                    Points used · {formatPrice(loyaltyAmountApplied)} discount
                  </span>
                </div>
                <button
                  type="button"
                  className="cart-promo-remove"
                  onClick={() => onRemoveLoyalty?.()}
                  disabled={loyaltyApplying || checkingOut}
                >
                  Remove
                </button>
              </div>
            ) : (
              <form className="cart-promo-form" onSubmit={handleApplyLoyalty}>
                <label htmlFor="loyalty-points" className="cart-promo-label">
                  Points to use
                </label>
                <div className="cart-promo-row">
                  <input
                    id="loyalty-points"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="500"
                    className="cart-promo-input"
                    value={loyaltyPointsInput}
                    onChange={(event) => onLoyaltyPointsChange?.(event.target.value)}
                    disabled={loyaltyApplying || checkingOut || availablePoints < 100}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="cart-promo-apply"
                    disabled={
                      loyaltyApplying ||
                      checkingOut ||
                      availablePoints < 100 ||
                      !String(loyaltyPointsInput || '').trim()
                    }
                  >
                    {loyaltyApplying ? 'Applying…' : 'Apply Loyalty Points'}
                  </button>
                </div>
                {availablePoints >= 100 && loyaltyPointsInput.trim() ? (
                  <p className="cart-loyalty-preview">
                    {Number(loyaltyPointsInput) || 0} points ={' '}
                    {formatPrice(Number(loyaltyPointsInput) || 0)} discount
                  </p>
                ) : availablePoints < 100 ? (
                  <p className="cart-loyalty-preview">
                    You need at least 100 points to redeem at checkout.
                  </p>
                ) : null}
              </form>
            )}

            {loyaltyError ? (
              <p className="cart-promo-error" role="alert">
                {loyaltyError}
              </p>
            ) : null}
          </div>
        ) : null} */}

        <div className="cart-summary-rows">
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 ? (
            <div className="cart-summary-row cart-summary-discount">
              <span>
                {discountLabel ? (
                  <>
                    <span className="cart-discount-label">{discountLabel}</span>
                    <span className="cart-discount-hint"> campaign / promo savings</span>
                  </>
                ) : (
                  'Discount'
                )}
              </span>
              <span>−{formatPrice(discount)}</span>
            </div>
          ) : (
            <div className="cart-summary-row cart-summary-discount">
              <span>Discount</span>
              <span>—</span>
            </div>
          )}
          {loyaltyAmountApplied > 0 ? (
            <div className="cart-summary-row cart-summary-discount">
              <span>Loyalty Discount</span>
              <span>−{formatPrice(loyaltyAmountApplied)}</span>
            </div>
          ) : null}
          <div className="cart-summary-row">
            <span>Tax &amp; fee</span>
            <span className={taxFee > 0 ? undefined : 'cart-summary-muted'}>
              {taxFee > 0 ? formatPrice(taxFee) : '—'}
            </span>
          </div>
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
          {checkingOut ? 'Continuing…' : 'Continue to checkout'}
        </button>

        <div className="cart-checkout-address-actions">
          {reviewAddress?.id ? (
            <div className="cart-checkout-address-preview">
              {/* <span className="cart-checkout-address-label">Deliver to</span>
              <strong className="cart-checkout-address-name">{reviewAddress.name}</strong> */}
              {/* {addressLine ? (
                <span className="cart-checkout-address-line">{addressLine}</span>
              ) : null} */}
              <button
                type="button"
                className="cart-add-address-link"
                onClick={() => onAddAddress?.()}
              >
                Change address
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="cart-add-address-link"
              onClick={() => onAddAddress?.()}
            >
              Add address
            </button>
          )}
        </div>

        <Link to={ROUTES.collection} className="cart-summary-continue">
          Continue shopping
        </Link>

        <ul className="cart-trust-list" aria-label="Shopping assurances">
          {PDP_TRUST_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
