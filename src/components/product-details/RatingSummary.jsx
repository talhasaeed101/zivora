import { StarIcon } from '../icons';

const RATING_BREAKDOWN = [
  { stars: 5, percent: 62 },
  { stars: 4, percent: 22 },
  { stars: 3, percent: 8 },
  { stars: 2, percent: 5 },
  { stars: 1, percent: 3 },
];

const ATTRIBUTE_RATINGS = [
  { label: 'Sizing', value: 85 },
  { label: 'Quality', value: 92 },
];

export default function RatingSummary() {
  return (
    <div className="pd-rating-summary">
      <div className="pd-rating-overview">
        <div className="pd-rating-score-card">
          <span className="pd-rating-score">4.0</span>
          <div className="pd-rating-score-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                filled={star <= 4}
                className={`w-4 h-4 ${star <= 4 ? 'pd-star-filled' : 'pd-star-empty'}`}
              />
            ))}
          </div>
          <p className="pd-rating-count">Based on 1,015 reviews</p>
        </div>

        <div className="pd-rating-breakdown">
          {RATING_BREAKDOWN.map((row) => (
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
          Customers love the elegant design and comfortable fit of these minimal stacked rings.
          Most reviewers highlight the premium craftsmanship and how effortlessly the rings
          complement everyday outfits. A few mention checking sizing before ordering.
        </p>

        <div className="pd-rating-attributes">
          {ATTRIBUTE_RATINGS.map((attr) => (
            <div key={attr.label} className="pd-rating-attribute">
              <div className="pd-rating-attribute-header">
                <span className="pd-rating-attribute-label">{attr.label}</span>
                <span className="pd-rating-attribute-value">{attr.value}%</span>
              </div>
              <div className="pd-rating-attribute-bar">
                <div className="pd-rating-attribute-fill" style={{ width: `${attr.value}%` }} />
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="pd-btn pd-btn-outline">Write a product review</button>
      </div>
    </div>
  );
}
