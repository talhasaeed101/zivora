import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartItem from '../components/cart/CartItem';
import OrderSummary from '../components/cart/OrderSummary';
import RecommendedProducts from '../components/cart/RecommendedProducts';
import DeliveryAddressSection from '../components/cart/DeliveryAddressSection';
import DeliveryAddressModal from '../components/cart/DeliveryAddressModal';
import RemoveFromBagModal from '../components/cart/RemoveFromBagModal';
import { ChevronDownIcon } from '../components/icons';
import { ROUTES } from '../utils/navigation';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { addressApi, orderApi, promoCodeApi } from '../services/api.js';
import { mapCartItemForUi } from '../utils/products.js';
import { mapAddressForApi, mapAddressForUi } from '../utils/addresses.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import './CartPage.css';

export default function CartPage() {
  usePageTitle('Shopping Cart | Zivora');

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

  const [sortBy, setSortBy] = useState('latest');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressModalError, setAddressModalError] = useState('');
  const [itemToRemove, setItemToRemove] = useState(null);
  const [actionError, setActionError] = useState('');
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
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
    } catch (err) {
      setAppliedPromo(null);
      setPromoError(err.message || 'Invalid promo code.');
    } finally {
      setPromoApplying(false);
    }
  };

  const sortedItems = useMemo(() => {
    const list = [...items];
    if (sortBy === 'price-low') {
      return list.sort((a, b) => a.unitPrice - b.unitPrice);
    }
    if (sortBy === 'price-high') {
      return list.sort((a, b) => b.unitPrice - a.unitPrice);
    }
    return list;
  }, [items, sortBy]);

  const handleQuantityChange = async (id, newQty) => {
    if (newQty < 1 || !isAuthenticated) {
      return;
    }

    setActionError('');
    setUpdatingItemId(id);

    try {
      await updateCartItem(id, { quantity: newQty });
      resetPromo();
    } catch (err) {
      setActionError(err.message || 'Failed to update cart item.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveRequest = (item) => {
    setItemToRemove(item);
  };

  const handleRemoveConfirm = async () => {
    if (!itemToRemove) {
      return;
    }

    setActionError('');
    setUpdatingItemId(itemToRemove.id);

    try {
      await removeCartItem(itemToRemove.id);
      setItemToRemove(null);
      resetPromo();
    } catch (err) {
      setActionError(err.message || 'Failed to remove cart item.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleMoveToWishlist = async () => {
    if (!itemToRemove?.productId) {
      await handleRemoveConfirm();
      return;
    }

    setUpdatingItemId(itemToRemove.id);
    setActionError('');

    try {
      await addToWishlist(itemToRemove.productId);
      await removeCartItem(itemToRemove.id);
      resetPromo();
      setItemToRemove(null);
    } catch (err) {
      setActionError(err.message || 'Failed to move item to wishlist.');
    } finally {
      setUpdatingItemId(null);
    }
  };

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

  const handleSelectAddress = async (addressId) => {
    setActionError('');
    setSelectedAddressId(addressId);

    try {
      await addressApi.setDefaultAddress(addressId);
      await loadAddresses();
    } catch (err) {
      setActionError(err.message || 'Failed to update default address.');
    }
  };

  const handleClearCart = async () => {
    setActionError('');
    setClearing(true);

    try {
      await clearCart();
      resetPromo();
    } catch (err) {
      setActionError(err.message || 'Failed to clear cart.');
    } finally {
      setClearing(false);
    }
  };

  const handleCheckout = async () => {
    setCheckoutError('');
    setActionError('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: ROUTES.cart } });
      return;
    }

    if (items.length === 0) {
      setCheckoutError('Your cart is empty.');
      return;
    }

    if (!selectedAddress?.id) {
      setCheckoutError('Please add a delivery address before checkout.');
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
      setCheckoutError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const showEmptyState = !loading && items.length === 0;
  const showCartContent = !loading && items.length > 0;

  return (
    <div className="cart-page">
      <Navbar activeLink="HOME" homeHref="/?home=true" />

      <main className="cart-main">
        <div className="cart-container">
          <div className="cart-header">
            <div className="cart-title-row">
              <h1 className="cart-title">Shopping Cart</h1>
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </div>
            {showCartContent && (
              <div className="cart-sort-wrap">
                <label htmlFor="cart-sort" className="cart-sort-label">Sort by:</label>
                <div className="cart-sort-select-wrap">
                  <select
                    id="cart-sort"
                    className="cart-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="latest">Latest added</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDownIcon className="cart-sort-chevron w-3.5 h-3.5" />
                </div>
              </div>
            )}
          </div>

          {!isAuthenticated && (
            <p className="cart-auth-message">
              Please <a href="/login">sign in</a> to view and manage your cart.
            </p>
          )}

          {(error || actionError) && (
            <p className="cart-error-message">{error || actionError}</p>
          )}

          {loading && isAuthenticated && (
            <p className="cart-loading-message">Loading your cart...</p>
          )}

          <div className="cart-body">
            <div className="cart-items-section">
              {showCartContent && (
                <DeliveryAddressSection
                  address={selectedAddress}
                  addresses={addresses}
                  loading={addressLoading}
                  onChangeClick={() => {
                    setAddressModalError('');
                    setAddressModalOpen(true);
                  }}
                  onSelectAddress={handleSelectAddress}
                />
              )}

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
                        <span className="payment-option-desc">Transfer directly to our Meezan Bank account.</span>
                      </div>
                    </label>
                  </div>

                  {paymentMethod === 'bank_transfer' && (
                    <div className="checkout-bank-details-card">
                      <div className="bank-details-header">
                        <span className="bank-badge">Meezan Bank</span>
                        <h4>Direct Bank Transfer Details</h4>
                      </div>
                      <div className="bank-details-body">
                        <div className="bank-detail-row">
                          <span className="label">Bank Name</span>
                          <span className="value">Meezan Bank</span>
                        </div>
                        <div className="bank-detail-row">
                          <span className="label">Account Title</span>
                          <span className="value">TALHA SAEED</span>
                        </div>
                        <div className="bank-detail-row">
                          <span className="label">Account Number</span>
                          <span className="value flex-row">
                            <strong>03380113919907</strong>
                            <button
                              type="button"
                              className="copy-btn"
                              onClick={() => {
                                navigator.clipboard.writeText('03380113919907');
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
                            <strong>PK62MEZN0003380113919907</strong>
                            <button
                              type="button"
                              className="copy-btn"
                              onClick={() => {
                                navigator.clipboard.writeText('PK62MEZN0003380113919907');
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
                  <button
                    type="button"
                    className="cart-clear-btn"
                    onClick={handleClearCart}
                    disabled={clearing}
                  >
                    {clearing ? 'CLEARING...' : '✕ CLEAR CART'}
                  </button>
                </div>
              )}

              {showEmptyState ? (
                <div className="cart-empty">
                  <h2 className="cart-empty-title">Your cart is empty</h2>
                  <p className="cart-empty-text">Start adding jewelry pieces you love.</p>
                  <a href={ROUTES.collection} className="cart-empty-link">Continue shopping</a>
                </div>
              ) : showCartContent ? (
                <div className="cart-items-list">
                  {sortedItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveRequest}
                      updating={updatingItemId === item.id}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            {showCartContent && (
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
                promoApplying={promoApplying}
                promoError={promoError}
                appliedPromo={activePromo}
              />
            )}
          </div>
        </div>

        <RecommendedProducts />
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

      {itemToRemove && (
        <RemoveFromBagModal
          item={itemToRemove}
          onClose={() => setItemToRemove(null)}
          onRemove={handleRemoveConfirm}
          onMoveToWishlist={handleMoveToWishlist}
        />
      )}
    </div>
  );
}
