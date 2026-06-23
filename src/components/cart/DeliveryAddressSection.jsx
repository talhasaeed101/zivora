function LocationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 21s7-4.5 7-10a7 7 0 10-14 0c0 5.5 7 10 7 10z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DeliveryAddressSection({ address, onChangeClick }) {
  return (
    <section className="cart-delivery-section">
      <h2 className="cart-delivery-label">DELIVERY ADDRESS</h2>
      <div className="cart-delivery-card">
        <div className="cart-delivery-info">
          <p className="cart-delivery-name">{address.name}</p>
          <div className="cart-delivery-details">
            <span className="cart-delivery-detail">
              <LocationIcon />
              {address.street}
            </span>
            <span className="cart-delivery-divider" aria-hidden="true" />
            <span className="cart-delivery-detail">
              <PhoneIcon />
              {address.phone}
            </span>
          </div>
        </div>
        <button type="button" className="cart-delivery-change-btn" onClick={onChangeClick}>
          Change
        </button>
      </div>
    </section>
  );
}
