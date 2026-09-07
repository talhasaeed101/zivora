import { useEffect, useId, useRef, useState } from 'react';
import { StarIcon } from '../icons';
import { uploadApi } from '../../services/api.js';

const MAX_REVIEW_IMAGES = 5;

function RatingSelector({ label, value, onChange, disabled = false, labelledBy }) {
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = hoverValue || value;

  return (
    <div className="pd-review-field">
      <span className="pd-review-field-label" id={labelledBy}>
        {label}
      </span>
      <div
        className="pd-review-rating-select"
        role="group"
        aria-labelledby={labelledBy}
        onMouseLeave={() => setHoverValue(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`pd-review-rating-btn ${star <= displayValue ? 'pd-review-rating-btn-active' : ''}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => !disabled && setHoverValue(star)}
            disabled={disabled}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            aria-pressed={value === star}
          >
            <StarIcon
              filled={star <= displayValue}
              className={star <= displayValue ? 'pd-star-filled' : 'pd-star-empty'}
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
  images: [],
};

function formFromReview(review) {
  if (!review) {
    return defaultForm;
  }

  return {
    rating: review.rating || 5,
    title: review.title || '',
    comment: review.comment || '',
    sizingRating: review.sizingRating || 5,
    qualityRating: review.qualityRating || 5,
    images: Array.isArray(review.images) ? review.images.filter(Boolean) : [],
  };
}

function getFocusable(container) {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

function ReviewModalContent({
  productId,
  review,
  onClose,
  onSubmit,
  saving = false,
  error = '',
}) {
  const [form, setForm] = useState(() => formFromReview(review));
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const isEditing = Boolean(review?._id);
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);
  const fileInputRef = useRef(null);
  const titleFieldId = useId();
  const commentFieldId = useId();
  const overallId = useId();
  const sizingId = useId();
  const qualityId = useId();
  const photosId = useId();

  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.requestAnimationFrame(() => {
      const focusables = getFocusable(dialogRef.current);
      (focusables[0] || dialogRef.current)?.focus?.();
    });

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !saving) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return;
      }

      const focusables = getFocusable(dialogRef.current);
      if (!focusables.length) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused.current && typeof previouslyFocused.current.focus === 'function') {
        previouslyFocused.current.focus();
      }
    };
  }, [onClose, saving]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (saving || uploadingImage) {
      return;
    }

    if (!form.comment.trim()) {
      return;
    }

    onSubmit({
      productId,
      rating: form.rating,
      title: form.title.trim(),
      comment: form.comment.trim(),
      sizingRating: form.sizingRating,
      qualityRating: form.qualityRating,
      images: form.images,
    });
  };

  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (form.images.length >= MAX_REVIEW_IMAGES) {
      setImageError(`You can upload up to ${MAX_REVIEW_IMAGES} photos.`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setImageError('Please choose a JPG, PNG, or WebP image.');
      return;
    }

    setImageError('');
    setUploadingImage(true);

    try {
      const response = await uploadApi.uploadReviewImage(file);
      const url = response.data?.url;
      if (!url) {
        throw new Error('Upload did not return an image URL.');
      }
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, url].slice(0, MAX_REVIEW_IMAGES),
      }));
    } catch (err) {
      setImageError(err.message || 'Unable to upload photo.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (url) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((image) => image !== url),
    }));
  };

  return (
    <div
      className="pd-review-modal-overlay"
      onClick={saving ? undefined : onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="pd-review-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pd-review-modal-header">
          <h3 id="review-modal-title" className="pd-review-modal-title">
            {isEditing ? 'Edit your review' : 'Write a product review'}
          </h3>
          <button
            type="button"
            className="pd-review-modal-close"
            onClick={onClose}
            aria-label="Close review dialog"
            disabled={saving}
          >
            ×
          </button>
        </div>

        <form className="pd-review-modal-form" onSubmit={handleSubmit} noValidate>
          {error ? (
            <div className="pd-review-modal-error" role="alert">
              {error}
            </div>
          ) : null}

          <RatingSelector
            label="Overall rating"
            labelledBy={overallId}
            value={form.rating}
            onChange={(rating) => setForm((prev) => ({ ...prev, rating }))}
            disabled={saving}
          />

          <div className="pd-review-field">
            <label className="pd-review-field-label" htmlFor={titleFieldId}>
              Title
            </label>
            <input
              id={titleFieldId}
              type="text"
              className="pd-review-input"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Summarize your experience"
              disabled={saving}
              autoComplete="off"
            />
          </div>

          <div className="pd-review-field">
            <label className="pd-review-field-label" htmlFor={commentFieldId}>
              Comment <span aria-hidden="true">*</span>
              <span className="sr-only"> (required)</span>
            </label>
            <textarea
              id={commentFieldId}
              className="pd-review-textarea"
              rows={4}
              value={form.comment}
              onChange={(event) => setForm((prev) => ({ ...prev, comment: event.target.value }))}
              placeholder="Tell others what you liked about this product"
              disabled={saving}
              required
            />
          </div>

          <RatingSelector
            label="Sizing"
            labelledBy={sizingId}
            value={form.sizingRating}
            onChange={(sizingRating) => setForm((prev) => ({ ...prev, sizingRating }))}
            disabled={saving}
          />

          <RatingSelector
            label="Quality"
            labelledBy={qualityId}
            value={form.qualityRating}
            onChange={(qualityRating) => setForm((prev) => ({ ...prev, qualityRating }))}
            disabled={saving || uploadingImage}
          />

          <div className="pd-review-field">
            <span className="pd-review-field-label" id={photosId}>
              Photos (optional)
            </span>
            <p className="pd-review-photo-hint">Add up to {MAX_REVIEW_IMAGES} photos of your purchase.</p>
            <div className="pd-review-photo-row" role="group" aria-labelledby={photosId}>
              {form.images.map((url) => (
                <div key={url} className="pd-review-photo-thumb-wrap">
                  <img src={url} alt="" className="pd-review-photo-thumb" />
                  <button
                    type="button"
                    className="pd-review-photo-remove"
                    onClick={() => removeImage(url)}
                    disabled={saving || uploadingImage}
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}
              {form.images.length < MAX_REVIEW_IMAGES ? (
                <button
                  type="button"
                  className="pd-review-photo-add"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving || uploadingImage}
                >
                  {uploadingImage ? 'Uploading…' : '+ Add'}
                </button>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="sr-only"
              onChange={handleImageSelect}
              disabled={saving || uploadingImage}
            />
            {imageError ? (
              <p className="pd-review-modal-error" role="alert">
                {imageError}
              </p>
            ) : null}
          </div>

          <div className="pd-review-modal-actions">
            <button
              type="button"
              className="pd-btn pd-btn-secondary"
              onClick={onClose}
              disabled={saving || uploadingImage}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pd-btn pd-btn-primary"
              disabled={saving || uploadingImage}
            >
              {saving ? 'Saving…' : isEditing ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ReviewModal({
  open,
  productId,
  review,
  onClose,
  onSubmit,
  saving = false,
  error = '',
}) {
  if (!open) {
    return null;
  }

  return (
    <ReviewModalContent
      key={review?._id || 'new-review'}
      productId={productId}
      review={review}
      onClose={onClose}
      onSubmit={onSubmit}
      saving={saving}
      error={error}
    />
  );
}
