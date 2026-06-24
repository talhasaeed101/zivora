import { useEffect, useState } from 'react';
import { StarIcon } from '../icons';

function RatingSelector({ label, value, onChange, disabled = false }) {
  return (
    <div className="pd-review-field">
      <label className="pd-review-field-label">{label}</label>
      <div className="pd-review-rating-select">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`pd-review-rating-btn ${star <= value ? 'pd-review-rating-btn-active' : ''}`}
            onClick={() => onChange(star)}
            disabled={disabled}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <StarIcon
              filled={star <= value}
              className={`w-4 h-4 ${star <= value ? 'pd-star-filled' : 'pd-star-empty'}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

const defaultForm = {
  rating: 5,
  title: '',
  comment: '',
  sizingRating: 5,
  qualityRating: 5,
};

export default function ReviewModal({
  open,
  productId,
  review,
  onClose,
  onSubmit,
  saving = false,
  error = '',
}) {
  const [form, setForm] = useState(defaultForm);
  const isEditing = Boolean(review?._id);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (review) {
      setForm({
        rating: review.rating || 5,
        title: review.title || '',
        comment: review.comment || '',
        sizingRating: review.sizingRating || 5,
        qualityRating: review.qualityRating || 5,
      });
      return;
    }

    setForm(defaultForm);
  }, [open, review]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      productId,
      rating: form.rating,
      title: form.title.trim(),
      comment: form.comment.trim(),
      sizingRating: form.sizingRating,
      qualityRating: form.qualityRating,
    });
  };

  return (
    <div className="pd-review-modal-overlay" onClick={onClose}>
      <div
        className="pd-review-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pd-review-modal-header">
          <h3 id="review-modal-title" className="pd-review-modal-title">
            {isEditing ? 'Edit your review' : 'Write a product review'}
          </h3>
          <button type="button" className="pd-review-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form className="pd-review-modal-form" onSubmit={handleSubmit}>
          {error && <div className="pd-review-modal-error">{error}</div>}

          <RatingSelector
            label="Overall rating"
            value={form.rating}
            onChange={(rating) => setForm((prev) => ({ ...prev, rating }))}
            disabled={saving}
          />

          <div className="pd-review-field">
            <label className="pd-review-field-label" htmlFor="review-title">
              Title
            </label>
            <input
              id="review-title"
              type="text"
              className="pd-review-input"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Summarize your experience"
              disabled={saving}
            />
          </div>

          <div className="pd-review-field">
            <label className="pd-review-field-label" htmlFor="review-comment">
              Comment
            </label>
            <textarea
              id="review-comment"
              className="pd-review-textarea"
              rows={4}
              value={form.comment}
              onChange={(event) => setForm((prev) => ({ ...prev, comment: event.target.value }))}
              placeholder="Tell others what you liked about this product"
              disabled={saving}
            />
          </div>

          <RatingSelector
            label="Sizing"
            value={form.sizingRating}
            onChange={(sizingRating) => setForm((prev) => ({ ...prev, sizingRating }))}
            disabled={saving}
          />

          <RatingSelector
            label="Quality"
            value={form.qualityRating}
            onChange={(qualityRating) => setForm((prev) => ({ ...prev, qualityRating }))}
            disabled={saving}
          />

          <div className="pd-review-modal-actions">
            <button type="button" className="pd-btn pd-btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="pd-btn pd-btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
