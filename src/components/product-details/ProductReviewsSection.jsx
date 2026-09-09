import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RatingSummary from './RatingSummary.jsx';
import ReviewCard from './ReviewCard.jsx';
import ReviewModal from './ReviewModal.jsx';
import ReviewSocialProof from './ReviewSocialProof.jsx';
import { reviewApi } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { StarIcon } from '../icons';
import { formatReviewDate, getReviewerName } from '../../utils/reviews.js';

const REVIEWS_PER_PAGE = 4;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
  { value: 'helpful', label: 'Most Helpful' },
];

const normalizeProductId = (productId) => {
  if (!productId) {
    return null;
  }

  const value = String(productId);

  if (/^[a-f\d]{24}$/i.test(value)) {
    return value;
  }

  return null;
};

function HighlightStrip({ title, reviews }) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return null;
  }

  return (
    <div className="pd-review-highlight-group">
      <h3 className="pd-review-highlight-title">{title}</h3>
      <div className="pd-review-highlight-list">
        {reviews.map((review) => (
          <article key={review._id} className="pd-review-highlight-card">
            <div className="pd-review-highlight-meta">
              <span>{getReviewerName(review)}</span>
              <span className="pd-review-highlight-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    filled={star <= review.rating}
                    className={`w-3 h-3 ${star <= review.rating ? 'pd-star-filled' : 'pd-star-empty'}`}
                  />
                ))}
              </span>
            </div>
            {review.verifiedPurchase ? (
              <span className="pd-review-verified">✓ Verified Purchase</span>
            ) : null}
            <p className="pd-review-highlight-text">
              {(review.comment || review.title || '').slice(0, 140)}
              {(review.comment || review.title || '').length > 140 ? '…' : ''}
            </p>
            <time dateTime={review.createdAt}>{formatReviewDate(review.createdAt)}</time>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function ProductReviewsSection({ productId, onSummaryChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const resolvedProductId = normalizeProductId(productId);
  const useApi = Boolean(resolvedProductId);
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [highlights, setHighlights] = useState(null);
  const [customerReview, setCustomerReview] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(useApi);
  const [loadingReviews, setLoadingReviews] = useState(useApi);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [ratingFilter, setRatingFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [modalOpen, setModalOpen] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [modalError, setModalError] = useState('');
  const [reactingReviewId, setReactingReviewId] = useState(null);

  const loadSummary = useCallback(async () => {
    if (!resolvedProductId) {
      setSummary(null);
      onSummaryChange?.(null);
      setLoadingSummary(false);
      return;
    }

    setLoadingSummary(true);

    try {
      const response = await reviewApi.getProductReviewSummary(resolvedProductId);
      setSummary(response.data);
      onSummaryChange?.(response.data);
      setError('');
    } catch (err) {
      setSummary(null);
      onSummaryChange?.(null);
      setError(err.message || 'Unable to load review summary.');
    } finally {
      setLoadingSummary(false);
    }
  }, [resolvedProductId, onSummaryChange]);

  const loadHighlights = useCallback(async () => {
    if (!resolvedProductId) {
      setHighlights(null);
      return;
    }

    try {
      const response = await reviewApi.getProductReviewHighlights(resolvedProductId);
      setHighlights(response.data || null);
    } catch {
      setHighlights(null);
    }
  }, [resolvedProductId]);

  const loadReviews = useCallback(async () => {
    if (!resolvedProductId) {
      setReviews([]);
      setPagination(null);
      setLoadingReviews(false);
      return;
    }

    setLoadingReviews(true);

    try {
      const response = await reviewApi.getProductReviews(resolvedProductId, {
        page: currentPage,
        limit: REVIEWS_PER_PAGE,
        sort,
        rating: ratingFilter || undefined,
      });
      setReviews(response.data?.reviews || []);
      setPagination(response.data?.pagination || null);
      setError('');
    } catch (err) {
      setReviews([]);
      setPagination(null);
      setError(err.message || 'Unable to load reviews.');
    } finally {
      setLoadingReviews(false);
    }
  }, [resolvedProductId, currentPage, sort, ratingFilter]);

  const loadCustomerReview = useCallback(async () => {
    if (!resolvedProductId || !isAuthenticated) {
      setCustomerReview(null);
      return;
    }

    try {
      const response = await reviewApi.getMyReviewForProduct(resolvedProductId);
      setCustomerReview(response.data || null);
    } catch {
      setCustomerReview(null);
    }
  }, [resolvedProductId, isAuthenticated]);

  useEffect(() => {
    loadSummary();
    loadHighlights();
  }, [loadSummary, loadHighlights]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    loadCustomerReview();
  }, [loadCustomerReview]);

  const refreshAll = async () => {
    await Promise.all([loadSummary(), loadReviews(), loadCustomerReview(), loadHighlights()]);
  };

  const handleWriteReview = () => {
    if (!resolvedProductId) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    setModalError('');
    setSuccessMessage('');
    setModalOpen(true);
  };

  const handleEditReview = () => {
    setModalError('');
    setSuccessMessage('');
    setModalOpen(true);
  };

  const handleSubmitReview = async (payload) => {
    setSavingReview(true);
    setModalError('');

    try {
      if (customerReview?._id) {
        await reviewApi.updateReview(customerReview._id, payload);
        setSuccessMessage('Your review has been updated.');
      } else {
        await reviewApi.createReview(payload);
        setSuccessMessage('Thank you! Your review has been submitted.');
      }

      setModalOpen(false);
      await refreshAll();
    } catch (err) {
      setModalError(err.message || 'Failed to save review.');
    } finally {
      setSavingReview(false);
    }
  };

  const patchReview = (reviewId, nextReview) => {
    setReviews((current) =>
      current.map((review) => (review._id === reviewId ? nextReview : review))
    );
  };

  const handleLike = async (reviewId) => {
    setReactingReviewId(reviewId);

    try {
      const response = await reviewApi.likeReview(reviewId);
      patchReview(reviewId, response.data);
    } finally {
      setReactingReviewId(null);
    }
  };

  const handleDislike = async (reviewId) => {
    setReactingReviewId(reviewId);

    try {
      const response = await reviewApi.dislikeReview(reviewId);
      patchReview(reviewId, response.data);
    } finally {
      setReactingReviewId(null);
    }
  };

  const handleRemoveVote = async (reviewId) => {
    setReactingReviewId(reviewId);

    try {
      const response = await reviewApi.removeVote(reviewId);
      patchReview(reviewId, response.data);
    } finally {
      setReactingReviewId(null);
    }
  };

  const handleRatingFilterChange = (next) => {
    setCurrentPage(1);
    setRatingFilter(next);
  };

  const handleSortChange = (event) => {
    setCurrentPage(1);
    setSort(event.target.value);
  };

  const totalPages = pagination?.totalPages || 1;
  const usingFallback = !resolvedProductId;

  const pageNumbers = (() => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 2) {
      return [1, 2, 3];
    }

    if (currentPage >= totalPages - 1) {
      return [totalPages - 2, totalPages - 1, totalPages];
    }

    return [currentPage - 1, currentPage, currentPage + 1];
  })();

  return (
    <>
      <section id="reviews" className="pd-reviews-section">
        <h2 className="pd-section-title">Customer Reviews</h2>

        {successMessage && (
          <div className="pd-review-success-banner" role="status">
            {successMessage}
          </div>
        )}
        {error && !loadingSummary && !loadingReviews && (
          <div className="pd-review-error-banner" role="alert">
            <span>{error}</span>
            <button type="button" className="pd-btn pd-btn-secondary" onClick={refreshAll}>
              Retry
            </button>
          </div>
        )}

        {!usingFallback && !loadingReviews && reviews.length > 0 ? (
          <ReviewSocialProof
            reviews={reviews}
            reviewCount={summary?.reviewCount || reviews.length}
            averageRating={summary?.averageRating || 0}
          />
        ) : null}

        {usingFallback ? (
          <div className="pd-reviews-empty">
            <p>Reviews will appear here once this product is available in the catalog.</p>
          </div>
        ) : loadingSummary ? (
          <div className="pd-review-skeleton" aria-busy="true" aria-label="Loading review summary">
            <div className="pd-review-skeleton-block" />
            <div className="pd-review-skeleton-block" />
          </div>
        ) : (
          <RatingSummary
            summary={summary || { averageRating: 0, reviewCount: 0, ratingBreakdown: [] }}
            usingFallback={false}
            customerReview={customerReview}
            onWriteReview={handleWriteReview}
            onEditReview={handleEditReview}
            activeRatingFilter={ratingFilter}
            onRatingFilterChange={handleRatingFilterChange}
          />
        )}

        {!usingFallback && highlights ? (
          <div className="pd-review-highlights">
            <HighlightStrip title="Most helpful" reviews={highlights.mostHelpful} />
            <HighlightStrip title="Verified purchases" reviews={highlights.verified} />
            <HighlightStrip title="Recent reviews" reviews={highlights.recent} />
          </div>
        ) : null}

        {!usingFallback ? (
          <div className="pd-review-toolbar">
            <div className="pd-review-filters" role="group" aria-label="Filter by rating">
              <button
                type="button"
                className={`pd-review-filter-chip${ratingFilter === '' ? ' is-active' : ''}`}
                onClick={() => handleRatingFilterChange('')}
              >
                All
              </button>
              {[5, 4, 3, 2, 1].map((stars) => (
                <button
                  key={stars}
                  type="button"
                  className={`pd-review-filter-chip${String(ratingFilter) === String(stars) ? ' is-active' : ''}`}
                  onClick={() => handleRatingFilterChange(String(stars))}
                >
                  {stars} star{stars === 1 ? '' : 's'}
                </button>
              ))}
            </div>
            <label className="pd-review-sort">
              <span className="sr-only">Sort reviews</span>
              <select value={sort} onChange={handleSortChange}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        {!usingFallback && loadingReviews ? (
          <div className="pd-review-skeleton" aria-busy="true" aria-label="Loading reviews">
            <div className="pd-review-skeleton-card" />
            <div className="pd-review-skeleton-card" />
          </div>
        ) : null}

        {!usingFallback && !loadingReviews && reviews.length === 0 ? (
          <div className="pd-reviews-empty">
            <p>
              {ratingFilter
                ? `No ${ratingFilter}-star reviews yet.`
                : 'No reviews yet. Be the first to share your experience.'}
            </p>
          </div>
        ) : null}

        {!usingFallback && !loadingReviews && reviews.length > 0 ? (
          <div className="pd-reviews-grid">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                onLike={handleLike}
                onDislike={handleDislike}
                onRemoveVote={handleRemoveVote}
                reacting={reactingReviewId === review._id}
              />
            ))}
          </div>
        ) : null}
      </section>

      {!usingFallback && totalPages > 1 && (
        <nav className="pd-pagination" aria-label="Review pagination">
          <button
            type="button"
            className="pd-page-btn pd-page-btn-prev"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            &lt; Previous
          </button>
          <div className="pd-page-numbers">
            {pageNumbers.map((num) => (
              <button
                key={num}
                type="button"
                className={`pd-page-num ${currentPage === num ? 'pd-page-num-active' : ''}`}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}
            {totalPages > 3 && currentPage < totalPages - 1 && (
              <>
                <span className="pd-page-ellipsis">...</span>
                <button type="button" className="pd-page-num" onClick={() => setCurrentPage(totalPages)}>
                  {totalPages}
                </button>
              </>
            )}
          </div>
          <button
            type="button"
            className="pd-page-btn pd-page-btn-next"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          >
            Next &gt;
          </button>
        </nav>
      )}

      <ReviewModal
        open={modalOpen}
        productId={resolvedProductId}
        review={customerReview}
        onClose={() => {
          setModalOpen(false);
          setModalError('');
        }}
        onSubmit={handleSubmitReview}
        saving={savingReview}
        error={modalError}
      />
    </>
  );
}
