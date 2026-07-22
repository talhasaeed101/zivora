import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Reveal from '../components/Reveal.jsx';
import CartItem from '../components/cart/CartItem';
import OrderSummary from '../components/cart/OrderSummary';
import RecommendedProducts from '../components/cart/RecommendedProducts';
import DeliveryAddressSection from '../components/cart/DeliveryAddressSection';
import DeliveryAddressModal from '../components/cart/DeliveryAddressModal';
import CheckoutPaymentSection from '../components/cart/CheckoutPaymentSection';
import RemoveFromBagModal from '../components/cart/RemoveFromBagModal';
import { ROUTES } from '../utils/navigation';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { addressApi, orderApi, promoCodeApi } from '../services/api.js';
import { mapCartItemForUi } from '../utils/products.js';
import { mapAddressForApi, mapAddressForUi } from '../utils/addresses.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import './CartPage.css';

function friendlyCartError(message, fallback) {
  const text = (message || '').trim();
  if (!text) {
    return fallback;
  }

  const lower = text.toLowerCase();
  if (lower.includes('stock') || lower.includes('available') || lower.includes('quantity')) {
    return 'Not enough stock available for that quantity.';
  }
  if (lower.includes('promo') || lower.includes('coupon') || lower.includes('expired')) {
    return text;
  }
  if (
    lower.includes('unauthorized') ||
    lower.includes('token') ||
    lower.includes('session') ||
    lower.includes('login')
  ) {
    return 'Your session has expired. Please sign in again to place your order.';
  }
  if (lower.includes('empty') || lower.includes('no items')) {
    return 'Your cart changed. Please review your items and try again.';
  }
  if (text.length > 140 || lower.includes('mongo') || lower.includes('stack')) {
    return fallback;
  }

  return text;
}

function scrollToCheckoutSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function CartSkeleton() {
  return (
    <div className="cart-skeleton" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your cart</span>
      <div className="cart-skeleton-body">
        <div className="cart-skeleton-items">
          {[0, 1, 2].map((index) => (
            <div key={index} className="cart-skeleton-item">
              <div className="cart-skeleton-image" />
              <div className="cart-skeleton-lines">
                <span className="cart-skeleton-line cart-skeleton-line-lg" />
                <span className="cart-skeleton-line cart-skeleton-line-md" />
                <span className="cart-skeleton-line cart-skeleton-line-sm" />
                <span className="cart-skeleton-block" />
              </div>
            </div>
          ))}
        </div>
        <div className="cart-skeleton-summary">
          <span className="cart-skeleton-line cart-skeleton-line-lg" />
          <span className="cart-skeleton-block cart-skeleton-block-tall" />
          <span className="cart-skeleton-line" />
          <span className="cart-skeleton-line" />
          <span className="cart-skeleton-block" />
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  usePageTitle('Shopping Cart | Zivorah');

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    cart,
    loading,
    error,
    totalItems,
    subtotal,
    updateCartItem,
    removeCartItem,
    clearCart,
    refreshCart,
  } = useCart();
  const { addToWishlist } = useWishlist();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressModalError, setAddressModalError] = useState('');
  const [addressSectionError, setAddressSectionError] = useState('');
  const [selectingAddressId, setSelectingAddressId] = useState(null);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [actionError, setActionError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [exitingIds, setExitingIds] = useState([]);
  const [clearing, setClearing] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentSectionError, setPaymentSectionError] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoCartSignature, setPromoCartSignature] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoApplying, setPromoApplying] = useState(false);

  const items = useMemo(
    () => (cart?.items || []).map(mapCartItemForUi),
    [cart]
  );

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) || null,
    [addresses, selectedAddressId]
  );

  const loadAddresses = useCallback(async () => {
    if (!isAuthenticated) {
      setAddresses([]);
      setSelectedAddressId(null);
      return;
    }

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
  }, [isAuthenticated]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const cartSignature = useMemo(
    () => (cart?.items || []).map((item) => `${item._id}:${item.quantity}`).join('|'),
    [cart]
  );

  const activePromo = promoCartSignature === cartSignature ? appliedPromo : null;

  const taxFee = 0;
  const discount = activePromo?.discountAmount ?? 0;
  const orderTotal = Math.max(0, subtotal - discount + taxFee);

  const resetPromo = () => {
    setAppliedPromo(null);
    setPromoCartSignature('');
    setPromoError('');
    setPromoInput('');
  };

  const handleApplyPromo = async (code) => {
    setPromoError('');

    if (!code) {
      setPromoError('Please enter a promo code.');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: ROUTES.cart } });
      return;
    }

    setPromoApplying(true);

    try {
      const response = await promoCodeApi.validatePromoCode({
        code,
        cartTotal: subtotal,
      });
      setAppliedPromo(response.data);
      setPromoCartSignature(cartSignature);
      setPromoInput(response.data.code);
      setStatusMessage(`Promo code ${response.data.code} applied.`);
    } catch (err) {
      setAppliedPromo(null);
      setPromoError(friendlyCartError(err.message, 'This promo code is invalid or expired.'));
    } finally {
      setPromoApplying(false);
    }
  };

  const handleQuantityChange = async (id, newQty) => {
    if (newQty < 1 || !isAuthenticated || updatingItemId || exitingIds.includes(id)) {
      return;
    }

    setActionError('');
    setUpdatingItemId(id);

    try {
      await updateCartItem(id, { quantity: newQty });
      resetPromo();
      setStatusMessage('Cart quantity updated.');
    } catch (err) {
      setActionError(friendlyCartError(err.message, 'Unable to update quantity. Please try again.'));
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveRequest = (item) => {
    if (updatingItemId || exitingIds.includes(item.id)) {
      return;
    }
    setItemToRemove(item);
  };

  const runRemoveWithExit = async (item, afterRemove) => {
    setActionError('');
    setItemToRemove(null);
    setExitingIds((ids) => (ids.includes(item.id) ? ids : [...ids, item.id]));
    setUpdatingItemId(item.id);

    try {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 280);
      });
      await afterRemove();
      resetPromo();
      setStatusMessage(`${item.title || 'Item'} removed from cart.`);
    } catch (err) {
      setActionError(friendlyCartError(err.message, 'Unable to remove item. Please try again.'));
    } finally {
      setExitingIds((ids) => ids.filter((value) => value !== item.id));
      setUpdatingItemId(null);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!itemToRemove) {
      return;
    }

    const item = itemToRemove;
    await runRemoveWithExit(item, () => removeCartItem(item.id));
  };

  const handleMoveToWishlist = async () => {
    if (!itemToRemove) {
      return;
    }

    const item = itemToRemove;

    if (!item.productId) {
      await runRemoveWithExit(item, () => removeCartItem(item.id));
      return;
    }

    await runRemoveWithExit(item, async () => {
      await addToWishlist(item.productId);
      await removeCartItem(item.id);
    });
  };

  const openAddAddress = () => {
    setEditingAddress(null);
    setAddressModalError('');
    setAddressModalOpen(true);
  };

  const openEditAddress = (address) => {
    setEditingAddress(address);
    setAddressModalError('');
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async (form) => {
    if (addressSaving) {
      return;
    }

    setAddressModalError('');
    setAddressSaving(true);

    try {
      const payload = mapAddressForApi(form);

      if (editingAddress?.id) {
        await addressApi.updateAddress(editingAddress.id, payload);
        setSelectedAddressId(editingAddress.id);
      } else {
        const response = await addressApi.createAddress(payload);
        setSelectedAddressId(response.data._id);
      }

      await loadAddresses();
      setAddressModalOpen(false);
      setEditingAddress(null);
      setAddressSectionError('');
      setStatusMessage('Delivery address saved.');
    } catch (err) {
      setAddressModalError(
        friendlyCartError(err.message, 'Unable to save address. Please try again.')
      );
    } finally {
      setAddressSaving(false);
    }
  };

  const handleSelectAddress = async (addressId) => {
    if (selectingAddressId || addressId === selectedAddressId) {
      return;
    }

    setActionError('');
    setAddressSectionError('');
    setSelectingAddressId(addressId);
    setSelectedAddressId(addressId);

    try {
      await addressApi.setDefaultAddress(addressId);
      await loadAddresses();
      setStatusMessage('Delivery address updated.');
    } catch (err) {
      setActionError(
        friendlyCartError(err.message, 'Unable to update the selected address.')
      );
    } finally {
      setSelectingAddressId(null);
    }
  };

  const handleClearCart = async () => {
    if (clearing || updatingItemId) {
      return;
    }

    setActionError('');
    setClearing(true);

    try {
      await clearCart();
      resetPromo();
      setStatusMessage('Cart cleared.');
    } catch (err) {
      setActionError(err.message || 'Failed to clear cart.');
    } finally {
      setClearing(false);
    }
  };

  const handleCheckout = async () => {
    if (checkingOut) {
      return;
    }

    setCheckoutError('');
    setActionError('');
    setAddressSectionError('');
    setPaymentSectionError('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: ROUTES.cart } });
      return;
    }

    if (items.length === 0) {
      setCheckoutError('Your cart is empty.');
      return;
    }

    if (!selectedAddress?.id) {
      const message = 'Please add a delivery address before placing your order.';
      setAddressSectionError(message);
      setCheckoutError(message);
      scrollToCheckoutSection('checkout-delivery');
      return;
    }

    if (!paymentMethod) {
      const message = 'Please select a payment method.';
      setPaymentSectionError(message);
      setCheckoutError(message);
      scrollToCheckoutSection('checkout-payment');
      return;
    }

    setCheckingOut(true);

    try {
      const response = await orderApi.checkout({
        addressId: selectedAddress.id,
        paymentMethod,
        promoCode: activePromo?.code,
      });

      resetPromo();
      await refreshCart();
      navigate(`/order-success/${response.data._id}`, { replace: true });
    } catch (err) {
      const message = friendlyCartError(
        err.message,
        'Unable to place your order. Please try again.'
      );
      setCheckoutError(message);

      if (message.toLowerCase().includes('sign in')) {
        navigate('/login', { state: { from: ROUTES.cart } });
      }
    } finally {
      setCheckingOut(false);
    }
  };

  const handleRetryCart = async () => {
    setActionError('');
    setStatusMessage('Refreshing cart…');
    try {
      await refreshCart();
      setStatusMessage('Cart refreshed.');
    } catch (err) {
      setActionError(err.message || 'Unable to refresh cart.');
    }
  };

  const showEmptyState = !loading && items.length === 0;
  const showCartContent = !loading && items.length > 0;
  const itemCountLabel = totalItems === 1 ? '1 item' : `${totalItems} items`;

  return (
    <div className="cart-page">
      <Navbar activeLink="HOME" homeHref="/?home=true" />

      <main id="main-content" className="cart-main">
        <div className="cart-container">
          <Reveal className="cart-header" variant="fade-up">
            <nav className="cart-breadcrumb" aria-label="Breadcrumb">
              <Link to={ROUTES.home}>Home</Link>
              <span className="cart-breadcrumb-sep" aria-hidden="true">
                /
              </span>
              <span className="cart-breadcrumb-current">Shopping Cart</span>
            </nav>

            <div className="cart-header-row">
              <div className="cart-title-row">
                <h1 className="cart-title">Shopping Cart</h1>
                {isAuthenticated && totalItems > 0 ? (
                  <span className="cart-count">{itemCountLabel}</span>
                ) : null}
              </div>

              <Link to={ROUTES.collection} className="cart-continue-link">
                Continue shopping
              </Link>
            </div>
          </Reveal>

          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {statusMessage}
          </div>

          {!isAuthenticated ? (
            <p className="cart-auth-message" role="status">
              Please <Link to={ROUTES.login} state={{ from: ROUTES.cart }}>sign in</Link> to view
              and manage your cart.
            </p>
          ) : null}

          {(error || actionError) && (
            <div className="cart-error-banner" role="alert">
              <p className="cart-error-message">{error || actionError}</p>
              {error ? (
                <button type="button" className="cart-retry-btn" onClick={handleRetryCart}>
                  Retry
                </button>
              ) : null}
            </div>
          )}

          {loading && isAuthenticated ? <CartSkeleton /> : null}

          {showEmptyState ? (
            <Reveal className="cart-empty" variant="fade-up">
              <h2 className="cart-empty-title">Your cart is empty</h2>
              <p className="cart-empty-text">
                Discover refined pieces and add something you love.
              </p>
              <div className="cart-empty-actions">
                <Link to={ROUTES.collection} className="cart-empty-primary">
                  Browse Collection
                </Link>
                {!isAuthenticated ? (
                  <Link
                    to={ROUTES.login}
                    state={{ from: ROUTES.cart }}
                    className="cart-empty-secondary"
                  >
                    Sign in
                  </Link>
                ) : null}
              </div>
            </Reveal>
          ) : null}

              {showCartContent && (
                <div className="checkout-payment-section">
                  <h3 className="checkout-payment-title">PAYMENT METHOD</h3>
                  <div className="checkout-payment-options">
                    <label className={`checkout-payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                      />
                      <div className="payment-option-details">
                        <span className="payment-option-name">Cash on Delivery (COD)</span>
                        <span className="payment-option-desc">Pay with cash upon delivery.</span>
                      </div>
                    </label>

                    <label className={`checkout-payment-option ${paymentMethod === 'bank_transfer' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={() => setPaymentMethod('bank_transfer')}
                      />
                      <div className="payment-option-details">
                        <span className="payment-option-name">Direct Bank Transfer</span>
                        <span className="payment-option-desc">Transfer directly to our UBL account.</span>
                      </div>
                    </label>
                  </div>

                  {paymentMethod === 'bank_transfer' && (
                    <div className="checkout-bank-details-card">
                      <div className="bank-details-header">
                        <span className="bank-badge">UBL</span>
                        <h4>Direct Bank Transfer Details</h4>
                      </div>
                      <div className="bank-details-body">
                        <div className="bank-detail-row">
                          <span className="label">Bank Name</span>
                          <span className="value">United Bank Limited (UBL)</span>
                        </div>
                        <div className="bank-detail-row">
                          <span className="label">Account Title</span>
                          <span className="value">TALHA SAEED</span>
                        </div>
                        <div className="bank-detail-row">
                          <span className="label">Account Number</span>
                          <span className="value flex-row">
                            <strong>0109000385727723</strong>
                            <button
                              type="button"
                              className="copy-btn"
                              onClick={() => {
                                navigator.clipboard.writeText('0109000385727723');
                                alert('Account Number copied!');
                              }}
                            >
                              Copy
                            </button>
                          </span>
                        </div>
                        <div className="bank-detail-row">
                          <span className="label">IBAN</span>
                          <span className="value flex-row">
                            <strong>PK09UNIL0109000385727723</strong>
                            <button
                              type="button"
                              className="copy-btn"
                              onClick={() => {
                                navigator.clipboard.writeText('PK09UNIL0109000385727723');
                                alert('IBAN copied!');
                              }}
                            >
                              Copy
                            </button>
                          </span>
                        </div>
                      </div>
                      <div className="bank-details-footer">
                        <p><strong>Please note:</strong> Transfer the total order amount to this account. After checkout, you will see a button to send the receipt screenshot to our WhatsApp to confirm your order.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {showCartContent && (
                <div className="cart-table-header">
                  <span className="cart-col-product">PRODUCT</span>
                  <span className="cart-col-count">COUNT</span>
                  <span className="cart-col-price">PRICE</span>
                </div>
              )}

          {showCartContent ? (
            <div className="cart-body">
              <div className="cart-items-column">
                <div className="cart-items-toolbar">
                  <p className="cart-items-toolbar-label">
                    Bag · {itemCountLabel}
                  </p>
                  <button
                    type="button"
                    className="cart-clear-btn"
                    onClick={handleClearCart}
                    disabled={clearing || Boolean(updatingItemId)}
                  >
                    {clearing ? 'Clearing…' : 'Clear cart'}
                  </button>
                </div>

                <div className="cart-items-list">
                  {items.map((item, index) => (
                    <Reveal
                      key={item.id}
                      variant="fade-up"
                      delay={Math.min(index, 7) * 40}
                    >
                      <CartItem
                        item={item}
                        onQuantityChange={handleQuantityChange}
                        onRemove={handleRemoveRequest}
                        updating={updatingItemId === item.id && !exitingIds.includes(item.id)}
                        removing={exitingIds.includes(item.id)}
                      />
                    </Reveal>
                  ))}
                </div>

                <Reveal className="cart-checkout-details" variant="fade-up" delay={80}>
                  <h2 className="cart-details-heading">Complete your order</h2>
                  <p className="cart-details-subheading">
                    Confirm delivery, payment, and review your totals before placing the order.
                  </p>

                  <DeliveryAddressSection
                    address={selectedAddress}
                    addresses={addresses}
                    loading={addressLoading}
                    error={addressSectionError}
                    selectingId={selectingAddressId}
                    onAddClick={openAddAddress}
                    onEditClick={openEditAddress}
                    onSelectAddress={handleSelectAddress}
                  />

                  <CheckoutPaymentSection
                    paymentMethod={paymentMethod}
                    onPaymentMethodChange={(method) => {
                      setPaymentMethod(method);
                      setPaymentSectionError('');
                    }}
                    orderTotal={orderTotal}
                    error={paymentSectionError}
                    disabled={checkingOut}
                  />
                </Reveal>
              </div>

              <Reveal variant="fade-up" delay={100}>
                <OrderSummary
                  itemCount={totalItems}
                  subtotal={subtotal}
                  discount={discount}
                  taxFee={taxFee}
                  total={orderTotal}
                  onCheckout={handleCheckout}
                  checkingOut={checkingOut}
                  checkoutError={checkoutError}
                  canCheckout={isAuthenticated && Boolean(selectedAddress?.id) && items.length > 0}
                  promoCode={promoInput}
                  onPromoCodeChange={setPromoInput}
                  onApplyPromo={handleApplyPromo}
                  onRemovePromo={resetPromo}
                  promoApplying={promoApplying}
                  promoError={promoError}
                  appliedPromo={activePromo}
                  reviewAddress={selectedAddress}
                  paymentMethod={paymentMethod}
                  reviewItems={items.map((item) => ({
                    id: item.id,
                    title: item.title,
                    quantity: item.quantity,
                  }))}
                />
              </Reveal>
            </div>
          ) : null}
        </div>

        <RecommendedProducts />
      </main>

      <Footer />

      <DeliveryAddressModal
        isOpen={addressModalOpen}
        address={editingAddress}
        onClose={() => {
          if (!addressSaving) {
            setAddressModalOpen(false);
            setEditingAddress(null);
          }
        }}
        onSave={handleSaveAddress}
        saving={addressSaving}
        error={addressModalError}
      />

      {itemToRemove ? (
        <RemoveFromBagModal
          item={itemToRemove}
          busy={Boolean(updatingItemId)}
          onClose={() => {
            if (!updatingItemId) {
              setItemToRemove(null);
            }
          }}
          onRemove={handleRemoveConfirm}
          onMoveToWishlist={handleMoveToWishlist}
        />
      ) : null}
    </div>
  );
}
