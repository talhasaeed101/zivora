import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeliveryAddressModal from '../cart/DeliveryAddressModal.jsx';
import { addressApi, orderApi } from '../../services/api.js';
import { mapAddressForApi, mapAddressForUi } from '../../utils/addresses.js';
import { formatPrice, getProductImage } from '../../utils/products.js';
import '../../Pages/CartPage.css';
import './BuyNowCheckoutModal.css';

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

export default function BuyNowCheckoutModal({
  isOpen,
  onClose,
  product,
  quantity,
  ringSize,
  metalColor,
}) {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressModalError, setAddressModalError] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) || null,
    [addresses, selectedAddressId]
  );

  const lineTotal = (product?.price || 0) * quantity;

  const loadAddresses = useCallback(async () => {
    setAddressLoading(true);

    try {
      const response = await addressApi.getAddresses();
      const list = (response.data || []).map(mapAddressForUi);
      setAddresses(list);

      const defaultAddress = list.find((address) => address.isDefault) || list[0];
      setSelectedAddressId(defaultAddress?.id || null);
    } catch {
      setAddresses([]);
      setSelectedAddressId(null);
    } finally {
      setAddressLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    setCheckoutError('');
    setAddressModalError('');
    loadAddresses();
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, loadAddresses]);

  const handleSaveAddress = async (form) => {
    setAddressModalError('');
    setAddressSaving(true);

    try {
      const payload = mapAddressForApi(form);

      if (selectedAddress?.id) {
        await addressApi.updateAddress(selectedAddress.id, payload);
      } else {
        const response = await addressApi.createAddress(payload);
        setSelectedAddressId(response.data._id);
      }

      await loadAddresses();
      setAddressModalOpen(false);
    } catch (err) {
      setAddressModalError(err.message || 'Failed to save address.');
    } finally {
      setAddressSaving(false);
    }
  };

  const handlePlaceOrder = async () => {
    setCheckoutError('');

    if (!selectedAddress?.id) {
      setCheckoutError('Please add a delivery address to continue.');
      return;
    }

    if (!product?._id) {
      setCheckoutError('This product cannot be purchased yet.');
      return;
    }

    setCheckingOut(true);

    try {
      const response = await orderApi.checkout({
        addressId: selectedAddress.id,
        paymentMethod,
        buyNowItem: {
          productId: product._id,
          quantity,
          ringSize: ringSize || undefined,
          metalColor: metalColor || undefined,
        },
      });

      onClose();
      navigate(`/order-success/${response.data._id}`, { replace: true });
    } catch (err) {
      setCheckoutError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="cart-modal-overlay" onClick={onClose} role="presentation">
        <div
          className="cart-modal buy-now-modal"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="buy-now-modal-title"
        >
          <div className="cart-modal-header">
            <h2 id="buy-now-modal-title" className="cart-modal-title">Checkout</h2>
            <button type="button" className="cart-modal-close" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
          </div>

          <div className="buy-now-modal-body">
            <section className="buy-now-product-summary">
              <img
                src={getProductImage(product)}
                alt={product?.title || 'Product'}
                className="buy-now-product-image"
              />
              <div className="buy-now-product-details">
                <h3 className="buy-now-product-title">{product?.title}</h3>
                <p className="buy-now-product-meta">
                  Qty: {quantity}
                  {ringSize ? ` · Size: ${ringSize}` : ''}
                  {metalColor ? ` · ${metalColor}` : ''}
                </p>
                <p className="buy-now-product-price">{formatPrice(lineTotal)}</p>
              </div>
            </section>

            <section className="buy-now-address-section">
              <div className="buy-now-section-header">
                <h3 className="buy-now-section-title">Delivery Address</h3>
                <button
                  type="button"
                  className="buy-now-link-btn"
                  onClick={() => {
                    setAddressModalError('');
                    setAddressModalOpen(true);
                  }}
                >
                  {selectedAddress ? 'Change' : 'Add Address'}
                </button>
              </div>

              {addressLoading ? (
                <p className="buy-now-muted">Loading address...</p>
              ) : selectedAddress ? (
                <div className="buy-now-address-card">
                  <p className="buy-now-address-name">{selectedAddress.name}</p>
                  <p className="buy-now-address-line">
                    {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.province}{' '}
                    {selectedAddress.postalCode}
                  </p>
                  <p className="buy-now-address-line">{selectedAddress.phone}</p>
                </div>
              ) : (
                <p className="buy-now-muted">Add a delivery address to place your order.</p>
              )}

              {addresses.length > 1 && (
                <select
                  className="buy-now-address-select"
                  value={selectedAddressId || ''}
                  onChange={(event) => setSelectedAddressId(event.target.value)}
                >
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.name} — {address.city}
                      {address.isDefault ? ' (Default)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </section>

            <section className="buy-now-payment-selector-section">
              <h3 className="buy-now-section-title">Payment Method</h3>
              <div className="buy-now-payment-options">
                <label className={`buy-now-payment-option-card ${paymentMethod === 'cod' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="buyNowPaymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div className="option-label-text">
                    <strong>Cash on Delivery (COD)</strong>
                    <span>Pay with cash upon delivery.</span>
                  </div>
                </label>
                <label className={`buy-now-payment-option-card ${paymentMethod === 'bank_transfer' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="buyNowPaymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                  />
                  <div className="option-label-text">
                    <strong>Direct Bank Transfer</strong>
                    <span>Transfer to Meezan Bank account.</span>
                  </div>
                </label>
              </div>

              {paymentMethod === 'bank_transfer' && (
                <div className="buy-now-bank-details-box">
                  <div className="buy-now-bank-badge">Meezan Bank</div>
                  <div className="buy-now-bank-info">
                    <p><strong>Bank:</strong> Meezan Bank</p>
                    <p><strong>Title:</strong> TALHA SAEED</p>
                    <p className="copyable-row">
                      <strong>Account:</strong> <span>03380113919907</span>
                      <button
                        type="button"
                        className="buy-now-copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText('03380113919907');
                          alert('Account Number copied!');
                        }}
                      >
                        Copy
                      </button>
                    </p>
                    <p className="copyable-row">
                      <strong>IBAN:</strong> <span>PK62MEZN0003380113919907</span>
                      <button
                        type="button"
                        className="buy-now-copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText('PK62MEZN0003380113919907');
                          alert('IBAN copied!');
                        }}
                      >
                        Copy
                      </button>
                    </p>
                  </div>
                  <p className="buy-now-bank-note">
                    After placing the order, you will be prompted to send the transfer screenshot on WhatsApp for verification.
                  </p>
                </div>
              )}
            </section>

            <section className="buy-now-total-section">
              <div className="buy-now-total-row">
                <span>Subtotal</span>
                <span>{formatPrice(lineTotal)}</span>
              </div>
              <div className="buy-now-total-row buy-now-total-row-strong">
                <span>Total</span>
                <span>{formatPrice(lineTotal)}</span>
              </div>
              <p className="buy-now-payment-note">
                Payment: {paymentMethod === 'bank_transfer' ? 'Direct Bank Transfer' : 'Cash on delivery'}
              </p>
            </section>

            {checkoutError && <p className="cart-modal-error">{checkoutError}</p>}

            <button
              type="button"
              className="cart-modal-primary-btn buy-now-place-order-btn"
              onClick={handlePlaceOrder}
              disabled={checkingOut || addressLoading || !selectedAddress?.id}
            >
              {checkingOut ? 'Placing order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>

      <DeliveryAddressModal
        isOpen={addressModalOpen}
        address={selectedAddress}
        onClose={() => setAddressModalOpen(false)}
        onSave={handleSaveAddress}
        saving={addressSaving}
        error={addressModalError}
      />
    </>
  );
}
