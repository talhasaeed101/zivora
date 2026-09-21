import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DeliveryAddressModal from '../components/cart/DeliveryAddressModal.jsx';
import { BANK_TRANSFER_DETAILS } from '../constants/bankTransfer.js';
import { addressApi, orderApi } from '../services/api.js';
import { mapAddressForApi, mapAddressForUi } from '../utils/addresses.js';
import { formatPrice, getProductImage } from '../utils/products.js';
import { trackCheckoutStart } from '../utils/analytics.js';
import { ROUTES, productPath } from '../utils/navigation.js';
import {
  clearBuyNowCheckout,
  readBuyNowCheckout,
} from '../utils/buyNowCheckout.js';
import { useCart } from '../context/CartContext.jsx';
import { toast } from '../context/ToastContext.jsx';
import { openBankTransferWhatsApp } from '../utils/whatsappPayment.js';
import { usePrivatePageSeo } from '../hooks/useSEO.js';
import './CartPage.css';
import './BuyNowCheckout.css';

function CodIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 7h18v12H3z" strokeLinejoin="round" />
      <path d="M3 11h18M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" strokeLinecap="round" />
    </svg>
  );
}

function BankIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 10h18M5 10v8M19 10v8M9 10v8M15 10v8M2 18h20M12 3l9 5H3l9-5z" strokeLinejoin="round" />
    </svg>
  );
}

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="bn-bank-row">
      <span className="bn-bank-label">{label}</span>
      <span className="bn-bank-value">
        <strong>{value}</strong>
        <button type="button" className="bn-copy-btn" onClick={handleCopy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </span>
    </div>
  );
}

export default function BuyNowCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, refreshCart } = useCart();
  const checkout = useMemo(() => readBuyNowCheckout(location.state), [location.state]);

  const isCartCheckout = checkout?.mode === 'cart';
  const product = checkout?.product || null;
  const quantity = Number(checkout?.quantity) || 1;
  const ringSize = checkout?.ringSize || undefined;
  const metalColor = checkout?.metalColor || undefined;
  const variantId = checkout?.variantId || undefined;
  const preferredAddressId = checkout?.addressId || null;
  const promoCode = checkout?.promoCode || undefined;
  const loyaltyPoints = checkout?.loyaltyPoints || undefined;
  const checkoutSummary = checkout?.summary || null;
  const returnTo = isCartCheckout
    ? ROUTES.cart
    : checkout?.returnTo || (product?.slug ? productPath(product.slug) : ROUTES.collection);

  const cartItems = useMemo(() => cart?.items || [], [cart?.items]);
  const cartSubtotal = Number(checkoutSummary?.subtotal ?? cart?.subtotal) || 0;
  const cartDiscount = Number(checkoutSummary?.discount ?? cart?.discountAmount ?? cart?.discount) || 0;
  const cartTotal =
    Number(checkoutSummary?.total) ||
    Number(cart?.total) ||
    Math.max(0, cartSubtotal - cartDiscount);
  const cartItemCount =
    Number(checkoutSummary?.itemCount) ||
    cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressModalError, setAddressModalError] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  usePrivatePageSeo({
    title: 'Select Payment Method | Zivorah',
    description: 'Choose COD or bank transfer and place your Zivorah order.',
    path: ROUTES.buyNow,
  });

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) || null,
    [addresses, selectedAddressId]
  );

  const lineTotal = isCartCheckout ? cartTotal : (product?.price || 0) * quantity;
  const itemLabel = isCartCheckout
    ? cartItemCount === 1
      ? '1 item'
      : `${cartItemCount} items`
    : quantity === 1
      ? '1 item'
      : `${quantity} items`;

  const loadAddresses = useCallback(async () => {
    setAddressLoading(true);

    try {
      const response = await addressApi.getAddresses();
      const list = (response.data || []).map(mapAddressForUi);
      setAddresses(list);

      const preferred =
        (preferredAddressId && list.find((address) => address.id === preferredAddressId)) ||
        list.find((address) => address.isDefault) ||
        list[0];
      setSelectedAddressId(preferred?.id || null);
    } catch {
      setAddresses([]);
      setSelectedAddressId(null);
    } finally {
      setAddressLoading(false);
    }
  }, [preferredAddressId]);

  useEffect(() => {
    if (isCartCheckout) {
      if (!cartItems.length) {
        return undefined;
      }
    } else if (!product?._id) {
      return undefined;
    }

    loadAddresses();
    return undefined;
  }, [isCartCheckout, cartItems.length, product?._id, loadAddresses]);

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
      toast.success('Delivery address saved.');
    } catch (err) {
      setAddressModalError(err.message || 'Failed to save address.');
    } finally {
      setAddressSaving(false);
    }
  };

  const handlePlaceOrder = async () => {
    setCheckoutError('');

    if (!selectedAddress?.id) {
      const message = 'Add address please';
      setCheckoutError(message);
      toast.error(message);
      return;
    }

    if (isCartCheckout) {
      if (!cartItems.length) {
        setCheckoutError('Your cart is empty.');
        toast.error('Your cart is empty.');
        return;
      }
    } else if (!product?._id) {
      setCheckoutError('This product cannot be purchased yet.');
      return;
    }

    setCheckingOut(true);
    trackCheckoutStart();

    try {
      const response = await orderApi.checkout(
        isCartCheckout
          ? {
              addressId: selectedAddress.id,
              paymentMethod,
              promoCode: promoCode || undefined,
              loyaltyPoints: loyaltyPoints || undefined,
            }
          : {
              addressId: selectedAddress.id,
              paymentMethod,
              buyNowItem: {
                productId: product._id,
                quantity,
                ringSize: ringSize || undefined,
                metalColor: metalColor || undefined,
                ...(variantId ? { variantId } : {}),
              },
            }
      );

      clearBuyNowCheckout();
      if (isCartCheckout) {
        await refreshCart();
      }

      const placedOrder = response.data;
      const orderId = placedOrder._id;

      if (paymentMethod === 'bank_transfer') {
        openBankTransferWhatsApp({
          orderNumber: placedOrder.orderNumber,
          customerName: selectedAddress?.name,
          totalLabel: formatPrice(placedOrder.total),
        });
      }

      navigate(`/order-success/${orderId}`, {
        replace: true,
        state: {
          openWhatsApp: paymentMethod === 'bank_transfer',
        },
      });
    } catch (err) {
      setCheckoutError(err.message || 'Checkout failed. Please try again.');
      toast.error(err.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (isCartCheckout) {
    if (!cartItems.length) {
      return <Navigate to={ROUTES.cart} replace />;
    }
  } else if (!product?._id) {
    return <Navigate to={ROUTES.collection} replace />;
  }

  return (
    <div className="bn-page">
      <a href="#main-content" className="sr-only">
        Skip to main content
      </a>
      <Navbar />

      <main id="main-content" className="bn-main">
        <div className="bn-page-header">
          <Link to={returnTo} className="bn-back-link">
            {isCartCheckout ? '← Back to cart' : '← Back to product'}
          </Link>
          <h1 className="bn-page-title">Select Payment Method</h1>
        </div>

        <div className="bn-layout">
          <div className="bn-main-col">
            <section className="bn-payment-type">
              <p className="bn-label-caps">Payment type</p>
              <div className="bn-payment-tiles" role="radiogroup" aria-label="Payment method">
                <button
                  type="button"
                  role="radio"
                  aria-checked={paymentMethod === 'cod'}
                  className={`bn-payment-tile${paymentMethod === 'cod' ? ' is-active' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <CodIcon />
                  <span>COD</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={paymentMethod === 'bank_transfer'}
                  className={`bn-payment-tile${paymentMethod === 'bank_transfer' ? ' is-active' : ''}`}
                  onClick={() => setPaymentMethod('bank_transfer')}
                >
                  <BankIcon />
                  <span>Bank</span>
                </button>
              </div>
            </section>

            <section className="bn-payment-body">
              {paymentMethod === 'cod' ? (
                <div className="bn-cod-panel" role="status">
                  <h2 className="bn-panel-heading">Cash on Delivery</h2>
                  <p className="bn-panel-text">
                    Pay <strong>{formatPrice(lineTotal)}</strong> in cash when your order is
                    delivered. No card details required.
                  </p>
                  <ul className="bn-cod-points">
                    <li>Pay at your doorstep</li>
                    <li>Order confirmed after address review</li>
                    <li>Inspect items before paying</li>
                  </ul>
                </div>
              ) : (
                <div className="bn-bank-panel">
                  <h2 className="bn-panel-heading">Bank transfer details</h2>
                  <p className="bn-panel-text">
                    Transfer the order total using the details below. After you place the order,
                    WhatsApp will open with your order and bank details — send your payment
                    screenshot there. Admin verifies payment, then your order is confirmed.
                  </p>
                  <div className="bn-bank-details">
                    <div className="bn-bank-row">
                      <span className="bn-bank-label">Bank name</span>
                      <span className="bn-bank-value">{BANK_TRANSFER_DETAILS.bankName}</span>
                    </div>
                    <div className="bn-bank-row">
                      <span className="bn-bank-label">Account title</span>
                      <span className="bn-bank-value">{BANK_TRANSFER_DETAILS.accountTitle}</span>
                    </div>
                    <CopyField label="Account number" value={BANK_TRANSFER_DETAILS.accountNumber} />
                    <CopyField label="IBAN" value={BANK_TRANSFER_DETAILS.iban} />
                  </div>
                </div>
              )}
            </section>

            <section className="bn-address-section">
              <div className="bn-address-header">
                <p className="bn-label-caps">Delivery address</p>
                <button
                  type="button"
                  className="bn-link-btn"
                  onClick={() => {
                    setAddressModalError('');
                    setAddressModalOpen(true);
                  }}
                >
                  {selectedAddress ? 'Change' : 'Add Address'}
                </button>
              </div>

              {addressLoading ? (
                <p className="bn-muted">Loading address...</p>
              ) : selectedAddress ? (
                <div className="bn-address-card">
                  <p className="bn-address-name">{selectedAddress.name}</p>
                  <p className="bn-address-line">
                    {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.province}{' '}
                    {selectedAddress.postalCode}
                  </p>
                  <p className="bn-address-line">{selectedAddress.phone}</p>
                </div>
              ) : (
                <p className="bn-muted">Add a delivery address to place your order.</p>
              )}

              {addresses.length > 1 && (
                <select
                  className="bn-address-select"
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
          </div>

          <aside className="bn-summary">
            <div className="bn-summary-header">
              <h2 className="bn-summary-title">Summary</h2>
              <span className="bn-summary-count">({itemLabel})</span>
            </div>

            {isCartCheckout ? (
              <ul className="bn-summary-cart-list">
                {cartItems.slice(0, 4).map((item) => {
                  const title =
                    item?.product?.title || item?.title || 'Product';
                  const qty = Number(item.quantity) || 1;
                  return (
                    <li key={item._id || item.id || `${title}-${qty}`} className="bn-summary-cart-item">
                      <img
                        src={getProductImage(item.product || item)}
                        alt={title}
                        className="bn-summary-image"
                      />
                      <div className="bn-summary-product-meta">
                        <p className="bn-summary-product-title">{title}</p>
                        <p className="bn-summary-product-line">Qty: {qty}</p>
                      </div>
                    </li>
                  );
                })}
                {cartItems.length > 4 ? (
                  <li className="bn-summary-cart-more">+{cartItems.length - 4} more</li>
                ) : null}
              </ul>
            ) : (
              <div className="bn-summary-product">
                <img
                  src={getProductImage(product)}
                  alt={product?.title || 'Product'}
                  className="bn-summary-image"
                />
                <div className="bn-summary-product-meta">
                  <p className="bn-summary-product-title">{product?.title}</p>
                  <p className="bn-summary-product-line">
                    Qty: {quantity}
                    {ringSize ? ` · Size: ${ringSize}` : ''}
                    {metalColor ? ` · ${metalColor}` : ''}
                  </p>
                </div>
              </div>
            )}

            <div className="bn-summary-prices">
              <div className="bn-price-row">
                <span>Subtotal</span>
                <span className="bn-price-value">
                  {formatPrice(isCartCheckout ? cartSubtotal : lineTotal)}
                </span>
              </div>
              <div className="bn-price-row">
                <span>Discount</span>
                <span className={isCartCheckout && cartDiscount > 0 ? 'bn-price-value' : 'bn-price-muted'}>
                  {isCartCheckout && cartDiscount > 0 ? `−${formatPrice(cartDiscount)}` : '—'}
                </span>
              </div>
              <div className="bn-price-row">
                <span>Tax &amp; fee</span>
                <span className="bn-price-muted">—</span>
              </div>
              <div className="bn-price-row bn-price-total">
                <span>Total</span>
                <span>{formatPrice(lineTotal)}</span>
              </div>
            </div>

            <p className="bn-summary-payment">
              Payment:{' '}
              <strong>
                {paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery'}
              </strong>
            </p>

            {checkoutError ? <p className="bn-error">{checkoutError}</p> : null}

            <button
              type="button"
              className="bn-place-order-btn"
              onClick={handlePlaceOrder}
              disabled={checkingOut || addressLoading}
            >
              {checkingOut ? 'Placing order...' : 'Place Order'}
            </button>
          </aside>
        </div>
      </main>

      <Footer />

      <DeliveryAddressModal
        isOpen={addressModalOpen}
        address={selectedAddress}
        onClose={() => setAddressModalOpen(false)}
        onSave={handleSaveAddress}
        saving={addressSaving}
        error={addressModalError}
      />
    </div>
  );
}
