import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StarIcon } from '../icons';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatReviewDate, getReviewerName } from '../../utils/reviews.js';

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

export default function ReviewCard({ review, onLike, onDislike, reacting = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [actionError, setActionError] = useState('');

  const handleReaction = async (type) => {
    setActionError('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    try {
      if (type === 'like') {
        await onLike?.(review._id);
      } else {
        await onDislike?.(review._id);
      }
    } catch (error) {
      setActionError(error.message || 'Unable to update reaction.');
    }
  };

  const reviewerName = getReviewerName(review);
  const initials = reviewerName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="pd-review-card">
      <div className="pd-review-card-header">
        <div className="pd-review-avatar pd-review-avatar-fallback" aria-hidden="true">
          {initials}
        </div>
        <div className="pd-review-meta">
          <p className="pd-review-name">{reviewerName}</p>
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
        <time className="pd-review-date" dateTime={review.createdAt}>
          {formatReviewDate(review.createdAt)}
        </time>
      </div>

      {review.title && <h4 className="pd-review-title">{review.title}</h4>}
      <p className="pd-review-text">{review.comment || review.text}</p>

      {actionError && <p className="pd-review-action-error">{actionError}</p>}

      <div className="pd-review-reactions">
        <button
          type="button"
          className="pd-review-reaction"
          onClick={() => handleReaction('like')}
          disabled={reacting}
        >
          <ThumbsUpIcon />
          <span>{review.likes ?? 0}</span>
        </button>
        <button
          type="button"
          className="pd-review-reaction"
          onClick={() => handleReaction('dislike')}
          disabled={reacting}
        >
          <ThumbsDownIcon />
          <span>{review.dislikes ?? 0}</span>
        </button>
      </div>
    </article>
  );
}
