import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '../icons';

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

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  province: '',
  city: '',
  street: '',
  postalCode: '',
};

export default function DeliveryAddressModal({ isOpen, address, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: address.name || '',
        email: address.email || '',
        phone: address.phone?.replace(/^\(\d{3}\)\s?/, '') || '',
        province: address.province || '',
        city: address.city || '',
        street: address.street || '',
        postalCode: address.postalCode || '',
      });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, address]);

  if (!isOpen) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      province: form.province,
      city: form.city.trim(),
      street: form.street.trim(),
      postalCode: form.postalCode.trim(),
    });
    onClose();
  };

  return (
    <div className="cart-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="cart-modal cart-address-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-modal-title"
      >
        <div className="cart-modal-header">
          <h2 id="address-modal-title" className="cart-modal-title">Add Delivery Address</h2>
          <button type="button" className="cart-modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <form className="cart-address-form" onSubmit={handleSubmit}>
          <div className="cart-form-group">
            <label htmlFor="addr-name" className="cart-form-label">Name</label>
            <input
              id="addr-name"
              type="text"
              className="cart-form-input"
              placeholder="Enter your Name"
              value={form.name}
              onChange={handleChange('name')}
              required
            />
          </div>

          <div className="cart-form-row">
            <div className="cart-form-group">
              <label htmlFor="addr-email" className="cart-form-label">Email</label>
              <input
                id="addr-email"
                type="email"
                className="cart-form-input"
                placeholder="Enter your Email"
                value={form.email}
                onChange={handleChange('email')}
                required
              />
            </div>
            <div className="cart-form-group">
              <label htmlFor="addr-phone" className="cart-form-label">Phone Number</label>
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
                  required
                />
              </div>
            </div>
          </div>

          <div className="cart-form-row">
            <div className="cart-form-group">
              <label htmlFor="addr-province" className="cart-form-label">Province</label>
              <div className="cart-select-wrap">
                <select
                  id="addr-province"
                  className="cart-form-input cart-form-select"
                  value={form.province}
                  onChange={handleChange('province')}
                  required
                >
                  <option value="" disabled>Select Province</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <ChevronDownIcon className="cart-select-chevron w-3.5 h-3.5" />
              </div>
            </div>
            <div className="cart-form-group">
              <label htmlFor="addr-city" className="cart-form-label">City</label>
              <input
                id="addr-city"
                type="text"
                className="cart-form-input"
                placeholder="Enter your City"
                value={form.city}
                onChange={handleChange('city')}
                required
              />
            </div>
          </div>

          <div className="cart-form-group">
            <label htmlFor="addr-street" className="cart-form-label">Address</label>
            <input
              id="addr-street"
              type="text"
              className="cart-form-input"
              placeholder="Enter your Address"
              value={form.street}
              onChange={handleChange('street')}
              required
            />
          </div>

          <div className="cart-form-group">
            <label htmlFor="addr-postal" className="cart-form-label">Postal Code</label>
            <input
              id="addr-postal"
              type="text"
              className="cart-form-input"
              placeholder="Enter your Postal Code"
              value={form.postalCode}
              onChange={handleChange('postalCode')}
              required
            />
          </div>

          <button type="submit" className="cart-modal-primary-btn">Save Address</button>
        </form>
      </div>
    </div>
  );
}
