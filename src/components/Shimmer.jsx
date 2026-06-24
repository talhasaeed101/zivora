import './Shimmer.css';

export function ShimmerBlock({ className = '', ...props }) {
  return <div className={`shimmer ${className}`.trim()} {...props} aria-hidden="true" />;
}

export function ShimmerProductGrid({ count = 6, className = '' }) {
  const cards = Array.from({ length: count }, (_, index) => (
    <article key={index} className="shimmer-product-card">
      <ShimmerBlock className="shimmer-product-image" />
      <ShimmerBlock className="shimmer-product-line" />
      <ShimmerBlock className="shimmer-product-line shimmer-product-line-short" />
    </article>
  ));

  return (
    <div className={className}>
      <div className="shimmer-product-grid">{cards}</div>
      <div className="shimmer-product-grid-mobile">{cards}</div>
    </div>
  );
}

export function ShimmerTableRows({ count = 4 }) {
  return (
    <div className="shimmer-table">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="shimmer-table-row">
          <div className="shimmer-table-row-main">
            <ShimmerBlock className="shimmer-table-line" />
            <ShimmerBlock className="shimmer-table-line shimmer-table-line-sm" />
          </div>
          <ShimmerBlock className="shimmer-table-btn" />
        </div>
      ))}
    </div>
  );
}

export function ShimmerProfilePage() {
  return (
    <div className="shimmer-profile-page">
      <div className="shimmer-profile-header">
        <ShimmerBlock className="shimmer-profile-avatar" />
        <div className="shimmer-profile-header-copy">
          <ShimmerBlock className="shimmer-profile-name" />
          <ShimmerBlock className="shimmer-profile-email" />
          <ShimmerBlock className="shimmer-profile-member" />
        </div>
      </div>

      <div className="shimmer-stats-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <ShimmerBlock key={index} className="shimmer-stat-card" />
        ))}
      </div>

      <div className="shimmer-section-card">
        <ShimmerBlock className="shimmer-section-title" />
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="shimmer-address-block">
            <ShimmerBlock className="shimmer-table-line" />
            <ShimmerBlock className="shimmer-table-line shimmer-table-line-sm" />
            <ShimmerBlock className="shimmer-table-line shimmer-table-line-sm" />
          </div>
        ))}
      </div>

      <div className="shimmer-section-card">
        <ShimmerBlock className="shimmer-section-title" />
        <ShimmerTableRows count={3} />
      </div>
    </div>
  );
}

export function ShimmerCategoryHero() {
  return (
    <div className="shimmer-category-hero">
      <ShimmerBlock className="shimmer-category-image" />
      <div className="shimmer-category-copy">
        <ShimmerBlock className="shimmer-category-title" />
        <ShimmerBlock className="shimmer-category-text" />
        <ShimmerBlock className="shimmer-category-text" />
        <ShimmerBlock className="shimmer-category-text shimmer-product-line-short" />
      </div>
    </div>
  );
}

export function ShimmerOrderDetails() {
  return (
    <div className="shimmer-order-details">
      <div className="shimmer-order-header">
        <div className="shimmer-profile-header-copy">
          <ShimmerBlock className="shimmer-profile-name" />
          <ShimmerBlock className="shimmer-profile-member" />
        </div>
        <ShimmerBlock className="shimmer-table-btn" />
      </div>

      <div>
        <ShimmerBlock className="shimmer-section-title" />
        <ShimmerBlock className="shimmer-table-line shimmer-table-line-sm" />
        <ShimmerBlock className="shimmer-table-line shimmer-table-line-sm" />
      </div>

      <div>
        <ShimmerBlock className="shimmer-section-title" />
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="shimmer-order-item">
            <ShimmerBlock className="shimmer-order-item-image" />
            <div className="shimmer-profile-header-copy">
              <ShimmerBlock className="shimmer-table-line" />
              <ShimmerBlock className="shimmer-table-line shimmer-table-line-sm" />
            </div>
            <ShimmerBlock className="shimmer-table-line shimmer-product-line-short" />
          </div>
        ))}
      </div>
    </div>
  );
}
