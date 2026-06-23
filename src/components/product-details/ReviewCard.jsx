import { StarIcon } from '../icons';

function ThumbsUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 10v12M7 10l4-6 2 2 4-1v5H7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ThumbsDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 14V2M17 14l-4 6-2-2-4 1v-5h10z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ReviewCard({ review }) {
  return (
    <article className="pd-review-card">
      <div className="pd-review-card-header">
        <img src={review.avatar} alt={review.name} className="pd-review-avatar" />
        <div className="pd-review-meta">
          <p className="pd-review-name">{review.name}</p>
          <div className="pd-review-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                filled={star <= review.rating}
                className={`w-3 h-3 ${star <= review.rating ? 'pd-star-filled' : 'pd-star-empty'}`}
              />
            ))}
          </div>
        </div>
        <time className="pd-review-date" dateTime={review.dateISO}>{review.date}</time>
      </div>
      <p className="pd-review-text">{review.text}</p>
      <div className="pd-review-reactions">
        <button type="button" className="pd-review-reaction">
          <ThumbsUpIcon />
          <span>{review.likes}</span>
        </button>
        <button type="button" className="pd-review-reaction">
          <ThumbsDownIcon />
          <span>{review.dislikes}</span>
        </button>
      </div>
    </article>
  );
}
