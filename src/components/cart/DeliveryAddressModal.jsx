import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '../icons';
import { EMPTY_ADDRESS_FORM } from '../../utils/addresses.js';

const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Gilgit-Baltistan',
  'Azad Jammu and Kashmir',
];

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

function PakistanFlag() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
      <rect width="20" height="14" fill="#01411C" />
      <rect width="5" height="14" fill="#fff" />
      <circle cx="9" cy="7" r="3.2" fill="#fff" />
      <circle cx="10" cy="7" r="2.6" fill="#01411C" />
      <polygon points="13.5,7 14.8,7.6 14.3,6.2 15.3,5.2 13.8,5.1 13.5,3.7 13.2,5.1 11.7,5.2 12.7,6.2 12.2,7.6" fill="#fff" />
    </svg>
  );
}

export default function DeliveryAddressModal({
  isOpen,
  address,
  onClose,
  onSave,
  saving = false,
  error = '',
}) {
  const [form, setForm] = useState(EMPTY_ADDRESS_FORM);
  const firstFieldRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement;
      setForm({
        name: address?.name || '',
        email: address?.email || '',
        phone: address?.phone || '',
        province: address?.province || '',
        city: address?.city || '',
        street: address?.street || '',
        postalCode: address?.postalCode || '',
      });
      document.body.style.overflow = 'hidden';
      window.requestAnimationFrame(() => {
        firstFieldRef.current?.focus?.();
      });
    } else {
      document.body.style.overflow = '';
      if (previouslyFocused.current && typeof previouslyFocused.current.focus === 'function') {
        previouslyFocused.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, address]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !saving) {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, saving]);

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) {
      return;
    }

    await onSave({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      province: form.province,
      city: form.city.trim(),
      street: form.street.trim(),
      postalCode: form.postalCode.trim(),
    });
  };

  const handleOverlayClick = () => {
    if (!saving) {
      onClose();
    }
  };

  const title = address?.id ? 'Edit delivery address' : 'Add delivery address';

  return createPortal(
    <div className="cart-modal-overlay cart-address-overlay" onClick={handleOverlayClick} role="presentation">
      <div
        className="cart-modal cart-address-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-modal-title"
      >
        <div className="cart-modal-header">
          <h2 id="address-modal-title" className="cart-modal-title">{title}</h2>
          <button
            type="button"
            className="cart-modal-close"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {error ? (
          <p className="cart-modal-error" role="alert">
            {error}
          </p>
        ) : null}

        <form className="cart-address-form" onSubmit={handleSubmit} noValidate={false}>
          <div className="cart-form-group">
            <label htmlFor="addr-name" className="cart-form-label">
              Name <span aria-hidden="true">*</span>
            </label>
            <input
              id="addr-name"
              ref={firstFieldRef}
              type="text"
              className="cart-form-input"
              placeholder="Enter your Name"
              value={form.name}
              onChange={handleChange('name')}
              autoComplete="name"
              required
              disabled={saving}
            />
          </div>

          <div className="cart-form-row">
            <div className="cart-form-group">
              <label htmlFor="addr-email" className="cart-form-label">
                Email <span aria-hidden="true">*</span>
              </label>
              <input
                id="addr-email"
                type="email"
                className="cart-form-input"
                placeholder="Enter your Email"
                value={form.email}
                onChange={handleChange('email')}
                autoComplete="email"
                required
                disabled={saving}
              />
            </div>
            <div className="cart-form-group">
              <label htmlFor="addr-phone" className="cart-form-label">
                Phone Number <span aria-hidden="true">*</span>
              </label>
              <div className="cart-phone-input-wrap">
                <span className="cart-phone-prefix">
                  <PakistanFlag />
                  <span>+92</span>
                  <span className="cart-phone-separator">|</span>
                </span>
                <input
                  id="addr-phone"
                  type="tel"
                  className="cart-form-input cart-phone-input"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  autoComplete="tel-national"
                  required
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <div className="cart-form-row">
            <div className="cart-form-group">
              <label htmlFor="addr-province" className="cart-form-label">
                Province <span aria-hidden="true">*</span>
              </label>
              <div className="cart-select-wrap">
                <select
                  id="addr-province"
                  className="cart-form-input cart-form-select"
                  value={form.province}
                  onChange={handleChange('province')}
                  autoComplete="address-level1"
                  required
                  disabled={saving}
                >
                  <option value="" disabled>
                    Select Province
                  </option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="cart-select-chevron w-3.5 h-3.5" />
              </div>
            </div>
            <div className="cart-form-group">
              <label htmlFor="addr-city" className="cart-form-label">
                City <span aria-hidden="true">*</span>
              </label>
              <input
                id="addr-city"
                type="text"
                className="cart-form-input"
                placeholder="Enter your City"
                value={form.city}
                onChange={handleChange('city')}
                autoComplete="address-level2"
                required
                disabled={saving}
              />
            </div>
          </div>

          <div className="cart-form-group">
            <label htmlFor="addr-street" className="cart-form-label">
              Address <span aria-hidden="true">*</span>
            </label>
            <input
              id="addr-street"
              type="text"
              className="cart-form-input"
              placeholder="Enter your Address"
              value={form.street}
              onChange={handleChange('street')}
              autoComplete="street-address"
              required
              disabled={saving}
            />
          </div>

          <div className="cart-form-group">
            <label htmlFor="addr-postal" className="cart-form-label">
              Postal Code <span aria-hidden="true">*</span>
            </label>
            <input
              id="addr-postal"
              type="text"
              className="cart-form-input"
              placeholder="Enter your Postal Code"
              value={form.postalCode}
              onChange={handleChange('postalCode')}
              autoComplete="postal-code"
              required
              disabled={saving}
            />
          </div>

          <div className="cart-modal-actions-row">
            <button
              type="button"
              className="cart-modal-secondary-btn"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cart-modal-primary-btn"
              disabled={saving}
              aria-busy={saving || undefined}
            >
              {saving ? 'Saving…' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
