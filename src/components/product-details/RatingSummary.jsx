import { StarIcon } from '../icons';
import { getFilledStars } from '../../utils/reviews.js';

export default function RatingSummary({
  summary,
  usingFallback = false,
  customerReview,
  onWriteReview,
  onEditReview,
}) {
  const averageRating = summary?.averageRating ?? 0;
  const reviewCount = summary?.reviewCount ?? 0;
  const filledStars = getFilledStars(averageRating);
  const breakdown = summary?.ratingBreakdown || [];
  const sizingPercent = summary?.sizingPercent ?? 0;
  const qualityPercent = summary?.qualityPercent ?? 0;

  return (
    <div className="pd-rating-summary">
      <div className="pd-rating-overview-box">
        <div className="pd-rating-score-card">
          <span className="pd-rating-score-large">{averageRating.toFixed(1)}</span>
          <div className="pd-rating-score-details">
            <div className="pd-rating-score-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  filled={star <= filledStars}
                  className={`w-4 h-4 ${star <= filledStars ? 'pd-star-filled' : 'pd-star-empty'}`}
                />
              ))}
            </div>
            <p className="pd-rating-count">
              {reviewCount.toLocaleString()} local ratings
            </p>
          </div>
        </div>

        <div className="pd-rating-breakdown-boxes">
          {[5, 4, 3, 2, 1].map((stars) => {
            const row = breakdown.find((r) => r.stars === stars) || { stars, count: 0 };
            return (
              <div key={stars} className="pd-rating-breakdown-box">
                <StarIcon filled className="w-3.5 h-3.5 pd-star-filled" />
                <span className="pd-rating-breakdown-val">{stars}.0</span>
                <span className="pd-rating-breakdown-count">({row.count || 0} reviews)</span>
              </div>
            );
          })}
        </div>

        <div className="pd-rating-breakdown-bars" aria-hidden="true">
          {[5, 4, 3, 2, 1].map((stars) => {
            const row = breakdown.find((r) => r.stars === stars) || { stars, count: 0 };
            const percent = reviewCount > 0 ? Math.round(((row.count || 0) / reviewCount) * 100) : 0;
            return (
              <div key={`bar-${stars}`} className="pd-rating-bar-row">
                <span className="pd-rating-bar-label">{stars}</span>
                <StarIcon filled className="w-3 h-3 pd-star-filled" />
                <div className="pd-rating-bar-track">
                  <div className="pd-rating-bar-fill" style={{ width: `${percent}%` }} />
                </div>
                <span className="pd-rating-bar-count">{row.count || 0}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pd-rating-insights-grid">
        <div className="pd-rating-insights-left">
          <h3 className="pd-rating-insights-title">Customers say</h3>
          <p className="pd-rating-insights-text">
            {usingFallback
              ? 'Reviews will appear here once this product is available in the catalog.'
              : summary?.customersSay
                ? summary.customersSay
                : reviewCount > 0
                  ? `Customers rate this product ${averageRating.toFixed(1)} out of 5 stars across ${reviewCount.toLocaleString()} review${reviewCount === 1 ? '' : 's'}.`
                  : 'Be the first to share your experience with this product.'}
          </p>

          {customerReview ? (
            <button type="button" className="pd-btn pd-btn-primary pd-review-btn" onClick={onEditReview}>
              Edit your review
            </button>
          ) : (
            <button type="button" className="pd-btn pd-btn-primary pd-review-btn" onClick={onWriteReview}>
              Write a product review <span style={{ marginLeft: '8px' }}>&gt;</span>
            </button>
          )}
        </div>

        <div className="pd-rating-attributes">
          <div className="pd-rating-attribute">
            <span className="pd-rating-attribute-label">Sizing</span>
            <div className="pd-rating-attribute-slider">
              <div className="pd-rating-slider-track">
                <div className="pd-rating-slider-fill" style={{ width: `${Math.min(100, Math.max(0, sizingPercent))}%` }} />
                <div className="pd-rating-slider-thumb" style={{ left: `${Math.min(100, Math.max(0, sizingPercent))}%` }} />
              </div>
              <div className="pd-rating-slider-labels">
                <span>Too Small</span>
                <span className="pd-rating-slider-label-center">True to Size</span>
                <span>Too Big</span>
              </div>
            </div>
          </div>

          <div className="pd-rating-attribute">
            <span className="pd-rating-attribute-label">Quality</span>
            <div className="pd-rating-attribute-slider">
              <div className="pd-rating-slider-track">
                <div className="pd-rating-slider-fill" style={{ width: `${Math.min(100, Math.max(0, qualityPercent))}%` }} />
                <div className="pd-rating-slider-thumb" style={{ left: `${Math.min(100, Math.max(0, qualityPercent))}%` }} />
              </div>
              <div className="pd-rating-slider-labels">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
