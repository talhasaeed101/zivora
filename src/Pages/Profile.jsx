import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AccountShell from '../components/account/AccountShell.jsx';
import Reveal from '../components/Reveal.jsx';
import DeliveryAddressModal from '../components/cart/DeliveryAddressModal';
import StatusBadge from '../components/orders/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { usePrivatePageSeo } from '../hooks/useSeo.js';
import { addressApi, orderApi } from '../services/api.js';
import { ROUTES, orderPath } from '../utils/navigation';
import { mapAddressForApi, mapAddressForUi } from '../utils/addresses.js';
import { formatPrice } from '../utils/products.js';
import { formatOrderDate } from '../utils/orderDisplay.js';
import '../components/orders/orderStatus.css';
import './Profile.css';
import './CartPage.css';
import { toast } from '../context/ToastContext.jsx';

function getInitials(name) {
  if (!name) {
    return 'Z';
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function formatMemberSince(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

function ProfileSkeleton() {
  return (
    <div className="profile-skeleton" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your account</span>
      <div className="profile-skeleton-hero" />
      <div className="profile-skeleton-actions">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="profile-skeleton-block" />
      <div className="profile-skeleton-block" />
    </div>
  );
}

export default function Profile() {
  usePrivatePageSeo({ title: 'My Account', path: '/profile' });

  const { customer, loading: authLoading } = useAuth();
  const { totalItems: wishlistCount } = useWishlist();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressesError, setAddressesError] = useState('');
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressActionId, setAddressActionId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const pageLoading = authLoading || ordersLoading || addressesLoading;
  const memberSince = formatMemberSince(customer?.createdAt);
  const firstName = customer?.name?.trim().split(/\s+/)[0] || '';

  const loadAddresses = useCallback(async () => {
    setAddressesLoading(true);

    try {
      const response = await addressApi.getAddresses();
      setAddresses((response.data || []).map(mapAddressForUi));
      setAddressesError('');
    } catch (err) {
      setAddresses([]);
      setAddressesError(err.message || 'Unable to load addresses.');
    } finally {
      setAddressesLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const response = await orderApi.getOrders();
      setOrders(response.data || []);
      setOrdersError('');
    } catch (err) {
      setOrdersError(err.message || 'Unable to load orders.');
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const openAddAddress = () => {
    setEditingAddress(null);
    setAddressModalOpen(true);
  };

  const openEditAddress = (address) => {
    setEditingAddress(address);
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async (form) => {
    setAddressSaving(true);

    try {
      const payload = mapAddressForApi(form);

      if (editingAddress?.id) {
        await addressApi.updateAddress(editingAddress.id, payload);
        toast.success('Address updated successfully.');
      } else {
        await addressApi.createAddress(payload);
        toast.success('Address saved successfully.');
      }

      await loadAddresses();
      setAddressModalOpen(false);
      setEditingAddress(null);
      setStatusMessage('Address saved successfully.');
    } catch (err) {
      // Error toast handled automatically by api.js
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (addressActionId || !window.confirm('Delete this address?')) {
      return;
    }

    setAddressActionId(addressId);

    try {
      await addressApi.deleteAddress(addressId);
      await loadAddresses();
      toast.success('Address deleted.');
      setStatusMessage('Address deleted.');
    } catch (err) {
      // Error toast handled automatically by api.js
    } finally {
      setAddressActionId(null);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    if (addressActionId) {
      return;
    }

    setAddressActionId(addressId);

    try {
      await addressApi.setDefaultAddress(addressId);
      await loadAddresses();
      toast.success('Default address updated.');
      setStatusMessage('Default address updated.');
    } catch (err) {
      // Error toast handled automatically by api.js
    } finally {
      setAddressActionId(null);
    }
  };

  const quickActions = [
    { to: ROUTES.orders, label: 'View Orders', hint: 'Track purchases' },
    { to: ROUTES.wishlist, label: 'Manage Wishlist', hint: 'Saved jewelry' },
    { to: ROUTES.supportTickets, label: 'Contact Support', hint: 'Need help?' },
    { to: ROUTES.collection, label: 'Browse Collection', hint: 'Continue shopping' },
  ];

  return (
    <AccountShell
      active="overview"
      title="Account Overview"
      description="Manage your profile details, delivery addresses, and recent activity."
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>

      {pageLoading ? <ProfileSkeleton /> : null}

      {!pageLoading ? (
        <div className="profile-layout">
          <Reveal className="profile-greeting" variant="fade-up">
            <div className="profile-avatar" aria-hidden="true">
              {getInitials(customer?.name)}
            </div>
            <div className="profile-greeting-copy">
              <h2 className="profile-greeting-title">
                {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
              </h2>
              {customer?.email ? <p className="profile-greeting-email">{customer.email}</p> : null}
              {customer?.phone ? <p className="profile-greeting-meta">{customer.phone}</p> : null}
              {memberSince ? (
                <p className="profile-greeting-meta">Member since {memberSince}</p>
              ) : null}
            </div>
          </Reveal>

          <Reveal className="profile-summary-row" variant="fade-up" delay={40}>
            <p>
              <Link to={ROUTES.orders}>{orders.length} orders</Link>
              <span aria-hidden="true"> · </span>
              <Link to={ROUTES.wishlist}>{wishlistCount} wishlist</Link>
              <span aria-hidden="true"> · </span>
              <a href="#profile-addresses">{addresses.length} addresses</a>
            </p>
          </Reveal>

          <section className="profile-section" aria-label="Quick actions">
            <h2 className="profile-section-title">Quick actions</h2>
            <div className="profile-quick-grid">
              {quickActions.map((action, index) => (
                <Reveal
                  key={action.to}
                  variant="fade-up"
                  delay={60 + Math.min(index, 4) * 35}
                >
                  <Link to={action.to} className="profile-quick-link">
                    <span className="profile-quick-label">{action.label}</span>
                    <span className="profile-quick-hint">{action.hint}</span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>

          <Reveal as="section" className="profile-section" variant="fade-up" delay={80} id="profile-details">
            <h2 className="profile-section-title">Personal information</h2>
            <dl className="profile-details-list">
              <div>
                <dt>Name</dt>
                <dd>{customer?.name || '—'}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{customer?.email || '—'}</dd>
              </div>
              {customer?.phone ? (
                <div>
                  <dt>Phone</dt>
                  <dd>{customer.phone}</dd>
                </div>
              ) : null}
            </dl>
            <p className="profile-helper">
              Profile details come from your account registration. Password changes use the{' '}
              <Link to={ROUTES.forgetPassword}>Forgot Password</Link> flow from the sign-in page —
              there is no in-account password form yet.
            </p>
          </Reveal>

          <Reveal as="section" className="profile-section" variant="fade-up" delay={90} id="profile-security">
            <h2 className="profile-section-title">Password &amp; security</h2>
            <p className="profile-helper">
              To reset your password, request a secure link via email. You will be signed out of this
              session only after you complete the reset on the recovery pages.
            </p>
            <Link to={ROUTES.forgetPassword} className="profile-text-link">
              Reset password
            </Link>
          </Reveal>

          <Reveal
            as="section"
            className="profile-section"
            variant="fade-up"
            delay={100}
            id="profile-addresses"
          >
            <div className="profile-section-header">
              <h2 className="profile-section-title">Saved addresses</h2>
              <button type="button" className="profile-add-btn" onClick={openAddAddress}>
                Add Address
              </button>
            </div>



            {!addressesError && addresses.length === 0 ? (
              <div className="profile-empty">
                <p>You have not saved any addresses yet.</p>
                <button type="button" className="profile-add-btn" onClick={openAddAddress}>
                  Add Address
                </button>
              </div>
            ) : null}

            {addresses.length > 0 ? (
              <div className="profile-addresses-list">
                {addresses.map((address, index) => (
                  <Reveal
                    as="article"
                    key={address.id}
                    className="profile-address-card"
                    variant="fade-up"
                    delay={Math.min(index, 5) * 30}
                  >
                    <div className="profile-address-top">
                      <strong>{address.name}</strong>
                      {address.isDefault ? (
                        <span className="profile-address-default">Default</span>
                      ) : null}
                    </div>
                    {address.phone ? <p className="profile-address-line">{address.phone}</p> : null}
                    <p className="profile-address-line">
                      {[address.street, address.city, address.province, address.postalCode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    <div className="profile-address-actions">
                      <button
                        type="button"
                        className="profile-address-action"
                        onClick={() => openEditAddress(address)}
                        disabled={Boolean(addressActionId)}
                        aria-label={`Edit address for ${address.name}`}
                      >
                        Edit
                      </button>
                      {!address.isDefault ? (
                        <button
                          type="button"
                          className="profile-address-action"
                          disabled={addressActionId === address.id}
                          onClick={() => handleSetDefaultAddress(address.id)}
                          aria-label={`Set ${address.name} address as default`}
                        >
                          {addressActionId === address.id ? 'Updating…' : 'Set Default'}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="profile-address-action profile-address-action-danger"
                        disabled={addressActionId === address.id}
                        onClick={() => handleDeleteAddress(address.id)}
                        aria-label={`Delete address for ${address.name}`}
                      >
                        {addressActionId === address.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </Reveal>
                ))}
              </div>
            ) : null}
          </Reveal>

          <Reveal as="section" className="profile-section" variant="fade-up" delay={120}>
            <div className="profile-section-header">
              <h2 className="profile-section-title">Recent orders</h2>
              {orders.length > 0 ? (
                <Link to={ROUTES.orders} className="profile-text-link">
                  View all
                </Link>
              ) : null}
            </div>

            {ordersError ? (
              <div className="profile-error-banner" role="alert">
                <p>{ordersError}</p>
                <button type="button" className="profile-retry-btn" onClick={loadOrders}>
                  Retry
                </button>
              </div>
            ) : null}

            {!ordersError && orders.length === 0 ? (
              <div className="profile-empty">
                <p>You have not placed any orders yet.</p>
                <Link to={ROUTES.collection} className="profile-add-btn">
                  Browse Collection
                </Link>
              </div>
            ) : null}

            {orders.length > 0 ? (
              <div className="profile-orders-list">
                {orders.slice(0, 3).map((order) => (
                  <Link key={order._id} to={orderPath(order._id)} className="profile-order-card">
                    <div className="profile-order-top">
                      <strong>{order.orderNumber}</strong>
                      <StatusBadge type="order" status={order.orderStatus} />
                    </div>
                    <div className="profile-order-meta">
                      <span>{formatOrderDate(order.createdAt)}</span>
                      <span>{formatPrice(order.total)}</span>
                      <span>
                        {order.totalItems === 1 ? '1 item' : `${order.totalItems} items`}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </Reveal>
        </div>
      ) : null}

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
      />
    </AccountShell>
  );
}
