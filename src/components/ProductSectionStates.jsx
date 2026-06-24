import './ProductSectionStates.css';

export function ProductRowSkeleton({ count = 5, rowClassName, cardClassName, imageWrapClassName }) {
  return (
    <div className={rowClassName}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`${cardClassName} product-skeleton-card`}>
          <div className={`${imageWrapClassName} product-skeleton-image skeleton-shimmer`} />
          <div className="product-skeleton-line skeleton-shimmer" />
          <div className="product-skeleton-line product-skeleton-line-short skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}

export function SectionMessage({ message, className = 'section-state-message' }) {
  return <p className={className}>{message}</p>;
}
