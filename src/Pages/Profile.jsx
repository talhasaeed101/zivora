import { useCallback, useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import AccountShell from '../components/account/AccountShell.jsx';
import Reveal from '../components/Reveal.jsx';
import DeliveryAddressModal from '../components/cart/DeliveryAddressModal';
import StatusBadge from '../components/orders/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { usePrivatePageSeo } from '../hooks/useSEO.js';
import { addressApi, orderApi, loyaltyApi } from '../services/api.js';
import { ROUTES, orderPath } from '../utils/navigation';
import { mapAddressForApi, mapAddressForUi } from '../utils/addresses.js';
import { formatPrice } from '../utils/products.js';
import { formatOrderDate } from '../utils/orderDisplay.js';
import { formatLoyaltyPoints } from '../utils/loyaltyDisplay.js';
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

  const formId = useId();
  const {
    customer,
    loading: authLoading,
    updateProfile,
    changePassword,
    cancelEmailChange,
    resendEmailChange,
    refreshCustomer,
  } = useAuth();
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
  const [loyalty, setLoyalty] = useState(null);
  const [loyaltyLoading, setLoyaltyLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [emailActionLoading, setEmailActionLoading] = useState('');
  const [profileInitialized, setProfileInitialized] = useState(false);

  const pageLoading = authLoading || ordersLoading || addressesLoading;
  const memberSince = formatMemberSince(customer?.createdAt);
  const firstName = customer?.name?.trim().split(/\s+/)[0] || '';
  const pendingEmail = customer?.pendingEmail || '';

  useEffect(() => {
    if (!customer) {
      return;
    }

    setProfileForm({
      name: customer.name || '',
      email: customer.pendingEmail || customer.email || '',
      phone: customer.phone || '',
    });
    setProfileInitialized(true);
  }, [customer]);

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

  useEffect(() => {
    let isMounted = true;
    setLoyaltyLoading(true);

    loyaltyApi
      .getAccount()
      .then((response) => {
        if (isMounted) {
          setLoyalty(response.data || null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoyalty(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoyaltyLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
    } catch {
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
    } catch {
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
    } catch {
      // Error toast handled automatically by api.js
    } finally {
      setAddressActionId(null);
    }
  };

  const updateProfileField = (field) => (event) => {
    setProfileForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (profileErrors[field]) {
      setProfileErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updatePasswordField = (field) => (event) => {
    setPasswordForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (passwordErrors[field]) {
      setPasswordErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateProfile = () => {
    const next = {};
    if (!profileForm.name.trim()) {
      next.name = 'Name is required.';
    }
    if (!profileForm.email.trim()) {
      next.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    setProfileErrors(next);
    return Object.keys(next).length === 0;
  };

  const validatePassword = () => {
    const next = {};
    if (!passwordForm.newPassword) {
      next.newPassword = 'Enter a new password.';
    } else if (passwordForm.newPassword.length < 8) {
      next.newPassword = 'Password must be at least 8 characters.';
    }
    if (!passwordForm.confirmPassword) {
      next.confirmPassword = 'Confirm your new password.';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      next.confirmPassword = 'Passwords do not match.';
    }
    if (customer?.hasPassword && !passwordForm.currentPassword) {
      next.currentPassword = 'Enter your current password.';
    }
    setPasswordErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    if (profileSaving || !validateProfile()) {
      return;
    }

    setProfileSaving(true);
    try {
      const result = await updateProfile({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
      });
      toast.success(result.message || 'Profile updated successfully.');
      setStatusMessage(result.message || 'Profile updated successfully.');
    } catch {
      // Error toast handled automatically by api.js
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (passwordSaving || !validatePassword()) {
      return;
    }

    setPasswordSaving(true);
    try {
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword || undefined,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success(result.message || 'Password updated successfully.');
      setStatusMessage(result.message || 'Password updated successfully.');
    } catch {
      // Error toast handled automatically by api.js
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleResendEmailChange = async () => {
    if (emailActionLoading) {
      return;
    }
    setEmailActionLoading('resend');
    try {
      const result = await resendEmailChange();
      toast.success(result.message || 'Verification email sent.');
      setStatusMessage(result.message || 'Verification email sent.');
    } catch {
      // Error toast handled automatically by api.js
    } finally {
      setEmailActionLoading('');
    }
  };

  const handleCancelEmailChange = async () => {
    if (emailActionLoading) {
      return;
    }
    setEmailActionLoading('cancel');
    try {
      const result = await cancelEmailChange();
      toast.success(result.message || 'Email change cancelled.');
      setStatusMessage(result.message || 'Email change cancelled.');
      await refreshCustomer();
    } catch {
      // Error toast handled automatically by api.js
    } finally {
      setEmailActionLoading('');
    }
  };

  const quickActions = [
    { to: ROUTES.orders, label: 'View Orders', hint: 'Track purchases' },
    { to: ROUTES.wishlist, label: 'Manage Wishlist', hint: 'Saved jewelry' },
    { to: ROUTES.loyalty, label: 'Loyalty & Rewards', hint: 'Points & tiers' },
    { to: ROUTES.supportTickets, label: 'Contact Support', hint: 'Need help?' },
    { to: ROUTES.collection, label: 'Browse Collection', hint: 'Continue shopping' },
  ];

  const nameId = `${formId}-name`;
  const emailId = `${formId}-email`;
  const phoneId = `${formId}-phone`;
  const currentPasswordId = `${formId}-current-password`;
  const newPasswordId = `${formId}-new-password`;
  const confirmPasswordId = `${formId}-confirm-password`;

  return (
    <AccountShell
      active="overview"
      title="Account Overview"
      description="Manage your profile details, delivery addresses, and recent activity."
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>

      {pageLoading || !profileInitialized ? <ProfileSkeleton /> : null}

      {!pageLoading && profileInitialized ? (
        <div className="profile-layout">
          {/* <Reveal className="profile-greeting" variant="fade-up">
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
          </Reveal> */}

          {/* <Reveal className="profile-summary-row" variant="fade-up" delay={40}>
            <p>
              <Link to={ROUTES.orders}>{orders.length} orders</Link>
              <span aria-hidden="true"> · </span>
              <Link to={ROUTES.wishlist}>{wishlistCount} wishlist</Link>
              <span aria-hidden="true"> · </span>
              <a href="#profile-addresses">{addresses.length} addresses</a>
            </p>
          </Reveal> */}

          {/* {!loyaltyLoading && loyalty ? (
            <Reveal className="profile-loyalty-summary" variant="fade-up" delay={50}>
              <div className="profile-loyalty-copy">
                <p className="profile-loyalty-eyebrow">Zivora Rewards</p>
                <p className="profile-loyalty-tier">{loyalty.tier} tier</p>
                <p className="profile-loyalty-points">
                  {formatLoyaltyPoints(loyalty.balance)} points available
                </p>
              </div>
              <Link to={ROUTES.loyalty} className="profile-loyalty-link">
                View Rewards
              </Link>
            </Reveal>
          ) : null} */}

          {/* <section className="profile-section" aria-label="Quick actions">
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
          </section> */}

          <Reveal
            as="section"
            className="profile-section"
            variant="fade-up"
            delay={80}
            id="profile-details"
          >
            <h2 className="profile-section-title">Personal information</h2>

            {pendingEmail ? (
              <div className="profile-pending-banner" role="status">
                <p>
                  Confirm <strong>{pendingEmail}</strong> via the link we sent. Your current email
                  stays active until then.
                </p>
                <div className="profile-pending-actions">
                  <button
                    type="button"
                    className="profile-text-btn"
                    onClick={handleResendEmailChange}
                    disabled={Boolean(emailActionLoading)}
                  >
                    {emailActionLoading === 'resend' ? 'Sending…' : 'Resend link'}
                  </button>
                  <button
                    type="button"
                    className="profile-text-btn profile-text-btn-muted"
                    onClick={handleCancelEmailChange}
                    disabled={Boolean(emailActionLoading)}
                  >
                    {emailActionLoading === 'cancel' ? 'Cancelling…' : 'Cancel change'}
                  </button>
                </div>
              </div>
            ) : null}

            <form className="profile-edit-form" onSubmit={handleProfileSubmit} noValidate>
              <div className="profile-edit-grid">
                <div className="profile-field">
                  <label htmlFor={nameId}>Name</label>
                  <input
                    id={nameId}
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={profileForm.name}
                    onChange={updateProfileField('name')}
                    disabled={profileSaving}
                    aria-invalid={Boolean(profileErrors.name)}
                    aria-describedby={profileErrors.name ? `${nameId}-error` : undefined}
                  />
                  {profileErrors.name ? (
                    <p id={`${nameId}-error`} className="profile-field-error">
                      {profileErrors.name}
                    </p>
                  ) : null}
                </div>

                <div className="profile-field">
                  <label htmlFor={emailId}>Email</label>
                  <input
                    id={emailId}
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={profileForm.email}
                    onChange={updateProfileField('email')}
                    disabled={profileSaving}
                    aria-invalid={Boolean(profileErrors.email)}
                    aria-describedby={
                      profileErrors.email
                        ? `${emailId}-error`
                        : pendingEmail
                          ? `${emailId}-hint`
                          : undefined
                    }
                  />
                  {profileErrors.email ? (
                    <p id={`${emailId}-error`} className="profile-field-error">
                      {profileErrors.email}
                    </p>
                  ) : null}
                  {pendingEmail && !profileErrors.email ? (
                    <p id={`${emailId}-hint`} className="profile-field-hint">
                      Pending confirmation for this address.
                    </p>
                  ) : null}
                </div>

                <div className="profile-field">
                  <label htmlFor={phoneId}>
                    Phone <span className="profile-optional">(optional)</span>
                  </label>
                  <input
                    id={phoneId}
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={profileForm.phone}
                    onChange={updateProfileField('phone')}
                    disabled={profileSaving}
                    placeholder="+923001234567"
                  />
                </div>
              </div>

              <div className="profile-edit-actions">
                <button type="submit" className="profile-save-btn" disabled={profileSaving}>
                  {profileSaving ? 'Saving…' : 'Save profile'}
                </button>
              </div>
            </form>
          </Reveal>

          <Reveal
            as="section"
            className="profile-section"
            variant="fade-up"
            delay={90}
            id="profile-security"
          >
            <h2 className="profile-section-title">Password &amp; security</h2>
            <p className="profile-helper">
              {customer?.hasPassword
                ? 'Change your password below, or use the forgot-password email link if you cannot sign in.'
                : 'Your account has no password yet (for example Google sign-in). Set one below to also sign in with email.'}
            </p>

            <form className="profile-edit-form" onSubmit={handlePasswordSubmit} noValidate>
              <div className="profile-edit-grid">
                {customer?.hasPassword ? (
                  <div className="profile-field">
                    <label htmlFor={currentPasswordId}>Current password</label>
                    <input
                      id={currentPasswordId}
                      name="currentPassword"
                      type="password"
                      autoComplete="current-password"
                      value={passwordForm.currentPassword}
                      onChange={updatePasswordField('currentPassword')}
                      disabled={passwordSaving}
                      aria-invalid={Boolean(passwordErrors.currentPassword)}
                      aria-describedby={
                        passwordErrors.currentPassword
                          ? `${currentPasswordId}-error`
                          : undefined
                      }
                    />
                    {passwordErrors.currentPassword ? (
                      <p id={`${currentPasswordId}-error`} className="profile-field-error">
                        {passwordErrors.currentPassword}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="profile-field">
                  <label htmlFor={newPasswordId}>New password</label>
                  <input
                    id={newPasswordId}
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={passwordForm.newPassword}
                    onChange={updatePasswordField('newPassword')}
                    disabled={passwordSaving}
                    aria-invalid={Boolean(passwordErrors.newPassword)}
                    aria-describedby={
                      passwordErrors.newPassword ? `${newPasswordId}-error` : undefined
                    }
                  />
                  {passwordErrors.newPassword ? (
                    <p id={`${newPasswordId}-error`} className="profile-field-error">
                      {passwordErrors.newPassword}
                    </p>
                  ) : null}
                </div>

                <div className="profile-field">
                  <label htmlFor={confirmPasswordId}>Confirm new password</label>
                  <input
                    id={confirmPasswordId}
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={passwordForm.confirmPassword}
                    onChange={updatePasswordField('confirmPassword')}
                    disabled={passwordSaving}
                    aria-invalid={Boolean(passwordErrors.confirmPassword)}
                    aria-describedby={
                      passwordErrors.confirmPassword
                        ? `${confirmPasswordId}-error`
                        : undefined
                    }
                  />
                  {passwordErrors.confirmPassword ? (
                    <p id={`${confirmPasswordId}-error`} className="profile-field-error">
                      {passwordErrors.confirmPassword}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="profile-edit-actions profile-edit-actions-split">
                <button type="submit" className="profile-save-btn" disabled={passwordSaving}>
                  {passwordSaving ? 'Updating…' : 'Update password'}
                </button>
                <Link to={ROUTES.forgetPassword} className="profile-text-link">
                  Forgot password?
                </Link>
              </div>
            </form>
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

            {addressesError ? (
              <div className="profile-error-banner" role="alert">
                <p>{addressesError}</p>
                <button type="button" className="profile-retry-btn" onClick={loadAddresses}>
                  Retry
                </button>
              </div>
            ) : null}

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
