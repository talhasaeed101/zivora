import { StarIcon } from '../icons';
import { getFilledStars } from '../../utils/reviews.js';
import { selectReviewSnippets } from '../../utils/conversionFacts.js';

/**
 * Real review snippets only — hidden when there is nothing substantive to show.
 * No photos (review schema has no images). No fabricated quotes.
 */
export default function ReviewSocialProof({ reviews = [], reviewCount = 0, averageRating = 0 }) {
  const snippets = selectReviewSnippets(reviews, { limit: 3, minRating: 4 });

  if (!snippets.length || !reviewCount) {
    return null;
  }

  return (
    <section className="pd-social-proof" aria-label="Customer love">
      <div className="pd-social-proof-header">
        <h2 className="pd-conversion-heading">Loved by Zivorah customers</h2>
        <p className="pd-social-proof-meta">
          {averageRating.toFixed(1)} average · {reviewCount.toLocaleString()} review
          {reviewCount === 1 ? '' : 's'}
        </p>
      </div>
      <div className="pd-social-proof-grid">
        {snippets.map((review) => {
          const filled = getFilledStars(review.rating);
          const name =
            (typeof review.customer === 'object' && review.customer?.name) || 'Customer';
          return (
            <blockquote key={review._id} className="pd-social-proof-card">
              <div className="pd-social-proof-stars" aria-label={`${review.rating} out of 5`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    filled={star <= filled}
                    className={`w-3.5 h-3.5 ${star <= filled ? 'pd-star-filled' : 'pd-star-empty'}`}
                  />
                ))}
              </div>
              {review.title ? <p className="pd-social-proof-title">{review.title}</p> : null}
              <p className="pd-social-proof-quote">
                “{String(review.comment).trim().slice(0, 180)}
                {String(review.comment).trim().length > 180 ? '…' : ''}”
              </p>
              <footer className="pd-social-proof-author">{name}</footer>
            </blockquote>
          );
        })}
      </div>
    </section>
  );
}
