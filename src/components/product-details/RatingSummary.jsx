import { StarIcon } from '../icons';
import { getFilledStars } from '../../utils/reviews.js';

const FALLBACK_INSIGHT =
  'Customers love the elegant design and comfortable fit of these minimal stacked rings. Most reviewers highlight the premium craftsmanship and how effortlessly the rings complement everyday outfits.';

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
      <div className="pd-rating-overview">
        <div className="pd-rating-score-card">
          <span className="pd-rating-score">{averageRating.toFixed(1)}</span>
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
            Based on {reviewCount.toLocaleString()} review{reviewCount === 1 ? '' : 's'}
          </p>
        </div>

        <div className="pd-rating-breakdown">
          {breakdown.map((row) => (
            <div key={row.stars} className="pd-rating-breakdown-row">
              <span className="pd-rating-breakdown-label">{row.stars}.0</span>
              <div className="pd-rating-breakdown-bar">
                <div className="pd-rating-breakdown-fill" style={{ width: `${row.percent}%` }} />
              </div>
              <span className="pd-rating-breakdown-pct">{row.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pd-rating-insights">
        <h3 className="pd-rating-insights-title">Customers Say</h3>
        <p className="pd-rating-insights-text">
          {usingFallback
            ? FALLBACK_INSIGHT
            : reviewCount > 0
              ? `Customers rate this product ${averageRating.toFixed(1)} out of 5 across ${reviewCount} verified reviews, with strong scores for sizing and quality.`
              : 'Be the first to share your experience with this product.'}
        </p>

        <div className="pd-rating-attributes">
          <div className="pd-rating-attribute">
            <div className="pd-rating-attribute-header">
              <span className="pd-rating-attribute-label">Sizing</span>
              <span className="pd-rating-attribute-value">
                {summary?.averageSizingRating
                  ? `${summary.averageSizingRating.toFixed(1)}/5`
                  : `${sizingPercent}%`}
              </span>
            </div>
            <div className="pd-rating-attribute-bar">
              <div className="pd-rating-attribute-fill" style={{ width: `${sizingPercent}%` }} />
            </div>
          </div>
          <div className="pd-rating-attribute">
            <div className="pd-rating-attribute-header">
              <span className="pd-rating-attribute-label">Quality</span>
              <span className="pd-rating-attribute-value">
                {summary?.averageQualityRating
                  ? `${summary.averageQualityRating.toFixed(1)}/5`
                  : `${qualityPercent}%`}
              </span>
            </div>
            <div className="pd-rating-attribute-bar">
              <div className="pd-rating-attribute-fill" style={{ width: `${qualityPercent}%` }} />
            </div>
          </div>
        </div>

        {customerReview ? (
          <button type="button" className="pd-btn pd-btn-outline" onClick={onEditReview}>
            Edit your review
          </button>
        ) : (
          <button type="button" className="pd-btn pd-btn-outline" onClick={onWriteReview}>
            Write a product review
          </button>
        )}
      </div>
    </div>
  );
}
