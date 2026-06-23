import { useState } from 'react';
import { ROUTES } from '../../utils/navigation';

function formatPrice(amount) {
  return `Rs. ${amount.toLocaleString('en-IN')}`;
}

export default function OrderSummary({ itemCount, subtotal, discount, total }) {
  const [promoCode, setPromoCode] = useState('');
  const [applied, setApplied] = useState(false);

  const handleApply = (e) => {
    e.preventDefault();
    setApplied(promoCode.trim().length > 0);
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
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <button type="submit" className="cart-promo-apply">Apply</button>
          </div>
          {applied && (
            <p className="cart-promo-applied">Promo code applied</p>
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
            <span>—</span>
          </div>
          <div className="cart-summary-row cart-summary-total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <a href={ROUTES.home} className="cart-checkout-btn">
          Continue to checkout
        </a>
      </div>
    </aside>
  );
}
