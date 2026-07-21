function formatAddressLine(address) {
  if (!address) {
    return '';
  }

  return [address.street, address.city, address.province, address.postalCode]
    .filter(Boolean)
    .join(', ');
}

export default function DeliveryAddressSection({
  address,
  addresses = [],
  loading = false,
  error = '',
  onAddClick,
  onEditClick,
  onSelectAddress,
  selectingId = null,
}) {
  if (loading) {
    return (
      <section
        id="checkout-delivery"
        className="checkout-section cart-delivery-section"
        aria-labelledby="checkout-delivery-title"
        aria-busy="true"
      >
        <div className="checkout-section-header">
          <span className="checkout-step-num" aria-hidden="true">
            1
          </span>
          <div>
            <h2 id="checkout-delivery-title" className="checkout-section-title">
              Delivery address
            </h2>
            <p className="checkout-section-hint">Where should we send your order?</p>
          </div>
        </div>
        <div className="cart-delivery-skeleton" aria-live="polite">
          <span className="sr-only">Loading delivery addresses</span>
          <span className="cart-delivery-skeleton-block" />
          <span className="cart-delivery-skeleton-block cart-delivery-skeleton-block-sm" />
        </div>
      </section>
    );
  }

  if (!addresses.length) {
    return (
      <section
        id="checkout-delivery"
        className="checkout-section cart-delivery-section"
        aria-labelledby="checkout-delivery-title"
      >
        <div className="checkout-section-header">
          <span className="checkout-step-num" aria-hidden="true">
            1
          </span>
          <div>
            <h2 id="checkout-delivery-title" className="checkout-section-title">
              Delivery address
            </h2>
            <p className="checkout-section-hint">Add an address to continue placing your order.</p>
          </div>
        </div>
        <div className="cart-delivery-empty-state">
          <p>You have not saved a delivery address yet.</p>
          <button type="button" className="cart-delivery-primary-btn" onClick={onAddClick}>
            Add Address
          </button>
        </div>
        {error ? (
          <p className="checkout-section-error" role="alert">
            {error}
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <section
      id="checkout-delivery"
      className="checkout-section cart-delivery-section"
      aria-labelledby="checkout-delivery-title"
    >
      <div className="checkout-section-header">
        <span className="checkout-step-num" aria-hidden="true">
          1
        </span>
        <div className="checkout-section-header-text">
          <h2 id="checkout-delivery-title" className="checkout-section-title">
            Delivery address
          </h2>
          <p className="checkout-section-hint">Select where this order should be delivered.</p>
        </div>
        <button type="button" className="cart-delivery-text-btn" onClick={onAddClick}>
          Add new
        </button>
      </div>

      <div className="cart-address-list" role="listbox" aria-label="Saved delivery addresses">
        {addresses.map((item) => {
          const selected = address?.id === item.id;
          const busy = selectingId === item.id;
          const line = formatAddressLine(item);

          return (
            <div
              key={item.id}
              role="option"
              aria-selected={selected}
              className={`cart-address-option${selected ? ' is-selected' : ''}${busy ? ' is-busy' : ''}`}
            >
              <button
                type="button"
                className="cart-address-option-main"
                onClick={() => {
                  if (!selected && !selectingId) {
                    onSelectAddress?.(item.id);
                  }
                }}
                disabled={Boolean(selectingId)}
                aria-pressed={selected}
              >
                <span className="cart-address-option-top">
                  <strong className="cart-address-option-name">{item.name}</strong>
                  {item.isDefault ? (
                    <span className="cart-address-default-badge">Default</span>
                  ) : null}
                  {selected ? (
                    <span className="cart-address-selected-badge">Selected</span>
                  ) : null}
                </span>
                {item.phone ? <span className="cart-address-option-line">{item.phone}</span> : null}
                {line ? <span className="cart-address-option-line">{line}</span> : null}
              </button>
              <button
                type="button"
                className="cart-address-edit-btn"
                onClick={() => onEditClick?.(item)}
                disabled={Boolean(selectingId)}
                aria-label={`Edit address for ${item.name}`}
              >
                Edit
              </button>
            </div>
          );
        })}
      </div>

      {error ? (
        <p className="checkout-section-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
