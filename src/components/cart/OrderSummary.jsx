function formatPrice(amount) {
  return `Rs. ${amount.toLocaleString('en-IN')}`;
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
  promoApplying = false,
  promoError = '',
  appliedPromo = null,
}) {
  const handleApply = (event) => {
    event.preventDefault();
    onApplyPromo?.(promoCode.trim());
  };

  return (
    <aside className="cart-summary">
      <div className="cart-summary-card">
        <h2 className="cart-summary-title">Summary ({itemCount} items)</h2>

        <form className="cart-promo-form" onSubmit={handleApply}>
          <label htmlFor="promo-code" className="cart-promo-label">Promo code</label>
          <div className="cart-promo-row">
            <input
              id="promo-code"
              type="text"
              placeholder="Type here..."
              className="cart-promo-input"
              value={promoCode}
              onChange={(event) => onPromoCodeChange?.(event.target.value)}
              disabled={promoApplying || checkingOut}
            />
            <button
              type="submit"
              className="cart-promo-apply"
              disabled={promoApplying || checkingOut || !promoCode.trim()}
            >
              {promoApplying ? 'Applying...' : 'Apply'}
            </button>
          </div>
          {promoError && <p className="cart-promo-error">{promoError}</p>}
          {appliedPromo && !promoError && (
            <p className="cart-promo-applied">
              Promo code {appliedPromo.code} applied
            </p>
          )}
        </form>

        <div className="cart-summary-rows">
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="cart-summary-row cart-summary-discount">
            <span>Discount</span>
            <span>{discount > 0 ? `-${formatPrice(discount)}` : '—'}</span>
          </div>
          <div className="cart-summary-row">
            <span>Tax &amp; fee</span>
            <span>{taxFee > 0 ? formatPrice(taxFee) : '—'}</span>
          </div>
          <div className="cart-summary-row cart-summary-total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {checkoutError && <p className="cart-checkout-error">{checkoutError}</p>}
        {checkoutSuccess && <p className="cart-checkout-success">{checkoutSuccess}</p>}

        <button
          type="button"
          className="cart-checkout-btn"
          onClick={onCheckout}
          disabled={!canCheckout || checkingOut}
        >
          {checkingOut ? 'Placing order...' : 'Continue to checkout'}
        </button>
      </div>
    </aside>
  );
}
