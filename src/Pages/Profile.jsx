import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DeliveryAddressModal from '../components/cart/DeliveryAddressModal';
import { ShimmerProfilePage } from '../components/Shimmer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { addressApi, orderApi } from '../services/api.js';
import { ROUTES, orderPath } from '../utils/navigation';
import { mapAddressForApi, mapAddressForUi } from '../utils/addresses.js';
import { formatPrice } from '../utils/products.js';
import './Profile.css';
import './CartPage.css';

function formatOrderDate(value) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatMemberSince(value) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

function getInitials(name) {
  if (!name) {
    return 'Z';
  }

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export default function Profile() {
  usePageTitle('My Profile | Zivora');

  const navigate = useNavigate();
  const { customer, logout, loading: authLoading } = useAuth();
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
  const [addressModalError, setAddressModalError] = useState('');
  const [addressActionId, setAddressActionId] = useState(null);

  const pageLoading = authLoading || ordersLoading || addressesLoading;

  const memberSince = formatMemberSince(customer?.createdAt);
  const reviewsCount = customer?.reviewCount ?? 0;

  const stats = useMemo(
    () => [
      { label: 'Total Orders', value: orders.length },
      { label: 'Saved Addresses', value: addresses.length },
      { label: 'Wishlist Items', value: wishlistCount },
      { label: 'Reviews Written', value: reviewsCount },
    ],
    [orders.length, addresses.length, wishlistCount, reviewsCount]
  );

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

  useEffect(() => {
    let isMounted = true;

    orderApi
      .getOrders()
      .then((response) => {
        if (isMounted) {
          setOrders(response.data || []);
          setOrdersError('');
        }
      })
      .catch((err) => {
        if (isMounted) {
          setOrdersError(err.message || 'Unable to load orders.');
          setOrders([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setOrdersLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.login, { replace: true });
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
    setAddressModalError('');
    setAddressSaving(true);

    try {
      const payload = mapAddressForApi(form);

      if (editingAddress?.id) {
        await addressApi.updateAddress(editingAddress.id, payload);
      } else {
        await addressApi.createAddress(payload);
      }

      await loadAddresses();
      setAddressModalOpen(false);
      setEditingAddress(null);
    } catch (err) {
      setAddressModalError(err.message || 'Failed to save address.');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Delete this address?')) {
      return;
    }

    setAddressActionId(addressId);
    setAddressesError('');

    try {
      await addressApi.deleteAddress(addressId);
      await loadAddresses();
    } catch (err) {
      setAddressesError(err.message || 'Failed to delete address.');
    } finally {
      setAddressActionId(null);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    setAddressActionId(addressId);
    setAddressesError('');

    try {
      await addressApi.setDefaultAddress(addressId);
      await loadAddresses();
    } catch (err) {
      setAddressesError(err.message || 'Failed to set default address.');
    } finally {
      setAddressActionId(null);
    }
  };

  return (
    <>
      <Navbar homeHref={ROUTES.home} />
      <main className="profile-page">
        <div className="profile-inner">
          <p className="profile-dashboard-label">Account Dashboard</p>
          <h1 className="profile-page-title">My Profile</h1>

          {pageLoading ? (
            <ShimmerProfilePage />
          ) : (
            <>
              <section className="profile-header-card" aria-label="Profile overview">
                <div className="profile-avatar" aria-hidden="true">
                  {getInitials(customer?.name)}
                </div>
                <div className="profile-header-copy">
                  <h2 className="profile-header-name">{customer?.name || '—'}</h2>
                  <p className="profile-header-email">{customer?.email || '—'}</p>
                  {customer?.phone && <p className="profile-header-phone">{customer.phone}</p>}
                  {memberSince && (
                    <span className="profile-member-since">Member since {memberSince}</span>
                  )}
                </div>
              </section>

              <section className="profile-stats-grid" aria-label="Account summary">
                {stats.map((stat) => (
                  <article key={stat.label} className="profile-stat-card">
                    <p className="profile-stat-value">{stat.value}</p>
                    <p className="profile-stat-label">{stat.label}</p>
                  </article>
                ))}
              </section>

              <section className="profile-section-card">
                <div className="profile-section-header">
                  <div>
                    <p className="profile-section-kicker">Delivery</p>
                    <h2 className="profile-section-title">My Addresses</h2>
                  </div>
                  <button type="button" className="profile-add-btn" onClick={openAddAddress}>
                    Add Address
                  </button>
                </div>

                {addressesError && <p className="profile-error">{addressesError}</p>}

                {!addressesError && addresses.length === 0 && (
                  <p className="profile-message">You have not saved any addresses yet.</p>
                )}

                {addresses.length > 0 && (
                  <div className="profile-addresses-list">
                    {addresses.map((address) => (
                      <article key={address.id} className="profile-address-card">
                        <div className="profile-address-top">
                          <strong>{address.name}</strong>
                          {address.isDefault && (
                            <span className="profile-address-default">Default</span>
                          )}
                        </div>
                        <p className="profile-address-line">{address.phone}</p>
                        <p className="profile-address-line">{address.email}</p>
                        <p className="profile-address-line">
                          {address.street}, {address.city}, {address.province} {address.postalCode}
                        </p>
                        <div className="profile-address-actions">
                          <button
                            type="button"
                            className="profile-address-action"
                            onClick={() => openEditAddress(address)}
                          >
                            Edit
                          </button>
                          {!address.isDefault && (
                            <button
                              type="button"
                              className="profile-address-action"
                              disabled={addressActionId === address.id}
                              onClick={() => handleSetDefaultAddress(address.id)}
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            type="button"
                            className="profile-address-action profile-address-action-danger"
                            disabled={addressActionId === address.id}
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="profile-section-card">
                <div className="profile-section-header">
                  <div>
                    <p className="profile-section-kicker">Purchases</p>
                    <h2 className="profile-section-title">Recent Orders</h2>
                  </div>
                  {orders.length > 0 && (
                    <Link to={ROUTES.orders} className="profile-view-all-link">
                      View All
                    </Link>
                  )}
                </div>

                {ordersError && <p className="profile-error">{ordersError}</p>}

                {!ordersError && orders.length === 0 && (
                  <p className="profile-message">You have not placed any orders yet.</p>
                )}

                {orders.length > 0 && (
                  <div className="profile-orders-list">
                    {orders.slice(0, 3).map((order) => (
                      <Link
                        key={order._id}
                        to={orderPath(order._id)}
                        className="profile-order-card"
                      >
                        <div className="profile-order-top">
                          <strong>{order.orderNumber}</strong>
                          <span className={`profile-order-status profile-order-status-${order.orderStatus}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <div className="profile-order-meta">
                          <span>{formatOrderDate(order.createdAt)}</span>
                          <span>{formatPrice(order.total)}</span>
                          <span>{order.totalItems} items</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              <section className="profile-section-card">
                <div className="profile-section-header">
                  <div>
                    <p className="profile-section-kicker">Settings</p>
                    <h2 className="profile-section-title">Account Actions</h2>
                  </div>
                </div>
                <div className="profile-actions-grid">
                  <Link to={ROUTES.wishlist} className="profile-action-link">
                    View Wishlist
                  </Link>
                  <Link to={ROUTES.orders} className="profile-action-link">
                    View All Orders
                  </Link>
                  <Link to={ROUTES.collection} className="profile-action-link">
                    Shop Collection
                  </Link>
                  <Link to={ROUTES.contact} className="profile-action-link">
                    Contact Support
                  </Link>
                </div>
                <button type="button" className="profile-logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />

      <DeliveryAddressModal
        isOpen={addressModalOpen}
        address={editingAddress}
        onClose={() => {
          setAddressModalOpen(false);
          setEditingAddress(null);
        }}
        onSave={handleSaveAddress}
        saving={addressSaving}
        error={addressModalError}
      />
    </>
  );
}
