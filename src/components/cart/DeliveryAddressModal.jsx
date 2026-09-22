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
}) {
  const [form, setForm] = useState(EMPTY_ADDRESS_FORM);
  const [provinceOpen, setProvinceOpen] = useState(false);
  const firstFieldRef = useRef(null);
  const previouslyFocused = useRef(null);
  const provinceWrapRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement;
      setForm({
        name: address?.name || '',
        email: address?.email || '',
        phone: String(address?.phone || '').replace(/\D/g, ''),
        province: address?.province || '',
        city: address?.city || '',
        street: address?.street || '',
        postalCode: address?.postalCode || '',
      });
      setProvinceOpen(false);
      document.body.style.overflow = 'hidden';
      window.requestAnimationFrame(() => {
        firstFieldRef.current?.focus?.();
      });
    } else {
      document.body.style.overflow = '';
      setProvinceOpen(false);
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
        if (provinceOpen) {
          setProvinceOpen(false);
          return;
        }
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, saving, provinceOpen]);

  useEffect(() => {
    if (!provinceOpen) {
      return undefined;
    }

    const onPointerDown = (event) => {
      if (!provinceWrapRef.current?.contains(event.target)) {
        setProvinceOpen(false);
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, [provinceOpen]);

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePhoneChange = (e) => {
    const digits = String(e.target.value || '').replace(/\D/g, '');
    setForm((prev) => ({ ...prev, phone: digits }));
  };

  const handleProvinceSelect = (province) => {
    setForm((prev) => ({ ...prev, province }));
    setProvinceOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) {
      return;
    }

    if (!form.province) {
      setProvinceOpen(true);
      return;
    }

    await onSave({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: String(form.phone || '').replace(/\D/g, ''),
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

        <form className="cart-address-form" onSubmit={handleSubmit} noValidate={false}>
          <div className="cart-form-group">
            <label htmlFor="addr-name" className="cart-form-label">
              Name
            </label>
            <input
              id="addr-name"
              ref={firstFieldRef}
              type="text"
              className="cart-form-input"
              placeholder="Enter your name"
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
                Email
              </label>
              <input
                id="addr-email"
                type="email"
                className="cart-form-input"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange('email')}
                autoComplete="email"
                required
                disabled={saving}
              />
            </div>
            <div className="cart-form-group">
              <label htmlFor="addr-phone" className="cart-form-label">
                Phone Number
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
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="cart-form-input cart-phone-input"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = e.clipboardData?.getData('text') || '';
                    const digits = pasted.replace(/\D/g, '');
                    setForm((prev) => ({ ...prev, phone: digits }));
                  }}
                  autoComplete="tel-national"
                  required
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <div className="cart-form-row">
            <div className="cart-form-group">
              <span className="cart-form-label" id="addr-province-label">
                Province
              </span>
              <div className="cart-dropdown-wrap" ref={provinceWrapRef}>
                <button
                  type="button"
                  id="addr-province"
                  className={`cart-dropdown-btn${!form.province ? ' is-placeholder' : ''}`}
                  onClick={() => !saving && setProvinceOpen((open) => !open)}
                  aria-expanded={provinceOpen}
                  aria-haspopup="listbox"
                  aria-labelledby="addr-province-label"
                  disabled={saving}
                >
                  <span>{form.province || 'Select province'}</span>
                  <ChevronDownIcon className="cart-dropdown-chevron w-3.5 h-3.5" />
                </button>
                {provinceOpen ? (
                  <div
                    className="cart-dropdown-menu"
                    role="listbox"
                    aria-label="Select province"
                  >
                    {PROVINCES.map((province) => (
                      <button
                        key={province}
                        type="button"
                        role="option"
                        aria-selected={form.province === province}
                        className={`cart-dropdown-option${
                          form.province === province ? ' is-active' : ''
                        }`}
                        onClick={() => handleProvinceSelect(province)}
                      >
                        {province}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="cart-form-group">
              <label htmlFor="addr-city" className="cart-form-label">
                City
              </label>
              <input
                id="addr-city"
                type="text"
                className="cart-form-input"
                placeholder="Enter your city"
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
              Address
            </label>
            <input
              id="addr-street"
              type="text"
              className="cart-form-input"
              placeholder="Enter your address"
              value={form.street}
              onChange={handleChange('street')}
              autoComplete="street-address"
              required
              disabled={saving}
            />
          </div>

          <div className="cart-form-group">
            <label htmlFor="addr-postal" className="cart-form-label">
              Postal Code
            </label>
            <input
              id="addr-postal"
              type="text"
              inputMode="numeric"
              className="cart-form-input"
              placeholder="Enter postal code"
              value={form.postalCode}
              onChange={(e) => {
                const digits = String(e.target.value || '').replace(/\D/g, '');
                setForm((prev) => ({ ...prev, postalCode: digits }));
              }}
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
