import { useState } from 'react';
import { BANK_TRANSFER_DETAILS, PAYMENT_METHODS } from '../../constants/bankTransfer.js';
import { formatPrice } from '../../utils/products.js';

function CopyField({ label, value, onCopied }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopied?.(label);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      onCopied?.(null);
    }
  };

  return (
    <div className="bank-detail-row">
      <span className="label">{label}</span>
      <span className="value flex-row">
        <strong className="bank-detail-value">{value}</strong>
        <button
          type="button"
          className="copy-btn"
          onClick={handleCopy}
          aria-label={`Copy ${label}`}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </span>
    </div>
  );
}

export default function CheckoutPaymentSection({
  paymentMethod,
  onPaymentMethodChange,
  orderTotal,
  error = '',
  disabled = false,
}) {
  return (
    <section
      id="checkout-payment"
      className="checkout-section checkout-payment-section"
      aria-labelledby="checkout-payment-title"
    >
      <div className="checkout-section-header">
        <span className="checkout-step-num" aria-hidden="true">
          2
        </span>
        <div>
          <h2 id="checkout-payment-title" className="checkout-section-title">
            Payment method
          </h2>
          <p className="checkout-section-hint">Choose how you would like to pay.</p>
        </div>
      </div>

      <div className="checkout-payment-options" role="radiogroup" aria-label="Payment method">
        {PAYMENT_METHODS.map((method) => {
          const selected = paymentMethod === method.value;

          return (
            <label
              key={method.value}
              className={`checkout-payment-option${selected ? ' is-active' : ''}`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                checked={selected}
                disabled={disabled}
                onChange={() => onPaymentMethodChange(method.value)}
              />
              <span className="payment-option-details">
                <span className="payment-option-name">{method.label}</span>
                <span className="payment-option-desc">{method.description}</span>
              </span>
            </label>
          );
        })}
      </div>

      {paymentMethod === 'cod' ? (
        <div className="checkout-payment-note" role="status">
          <p>
            You will pay <strong>{formatPrice(orderTotal)}</strong> when your order is delivered.
            This order is not marked as paid until delivery.
          </p>
        </div>
      ) : null}

      {paymentMethod === 'bank_transfer' ? (
        <div className="checkout-bank-details-card">
          <div className="bank-details-header">
            <h3 className="bank-details-title">Bank transfer details</h3>
            <p className="bank-details-subtitle">
              Transfer the order total, then send your payment screenshot on WhatsApp after placing
              the order. Your order stays pending until payment is verified.
            </p>
          </div>
          <div className="bank-details-body">
            <div className="bank-detail-row">
              <span className="label">Bank name</span>
              <span className="value">{BANK_TRANSFER_DETAILS.bankName}</span>
            </div>
            <div className="bank-detail-row">
              <span className="label">Account title</span>
              <span className="value">{BANK_TRANSFER_DETAILS.accountTitle}</span>
            </div>
            <CopyField label="Account number" value={BANK_TRANSFER_DETAILS.accountNumber} />
            <CopyField label="IBAN" value={BANK_TRANSFER_DETAILS.iban} />
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="checkout-section-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
