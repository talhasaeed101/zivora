import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RatingSummary from './RatingSummary.jsx';
import ReviewCard from './ReviewCard.jsx';
import ReviewModal from './ReviewModal.jsx';
import { reviewApi } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { FALLBACK_REVIEWS, FALLBACK_REVIEW_SUMMARY } from '../../utils/reviews.js';

const REVIEWS_PER_PAGE = 4;

export default function ProductReviewsSection({ productId, onSummaryChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const useApi = Boolean(productId);
  const [summary, setSummary] = useState(useApi ? null : FALLBACK_REVIEW_SUMMARY);
  const [reviews, setReviews] = useState(useApi ? [] : FALLBACK_REVIEWS);
  const [customerReview, setCustomerReview] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(useApi);
  const [loadingReviews, setLoadingReviews] = useState(useApi);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [modalError, setModalError] = useState('');
  const [reactingReviewId, setReactingReviewId] = useState(null);

  const loadSummary = useCallback(async () => {
    if (!productId) {
      setSummary(FALLBACK_REVIEW_SUMMARY);
      onSummaryChange?.(FALLBACK_REVIEW_SUMMARY);
      return;
    }

    setLoadingSummary(true);

    try {
      const response = await reviewApi.getProductReviewSummary(productId);
      setSummary(response.data);
      onSummaryChange?.(response.data);
      setError('');
    } catch (err) {
      setSummary(FALLBACK_REVIEW_SUMMARY);
      onSummaryChange?.(FALLBACK_REVIEW_SUMMARY);
      setError(err.message || 'Unable to load review summary.');
    } finally {
      setLoadingSummary(false);
    }
  }, [productId, onSummaryChange]);

  const loadReviews = useCallback(async () => {
    if (!productId) {
      setReviews(FALLBACK_REVIEWS);
      setPagination(null);
      return;
    }

    setLoadingReviews(true);

    try {
      const response = await reviewApi.getProductReviews(productId, {
        page: currentPage,
        limit: REVIEWS_PER_PAGE,
        sort: 'newest',
      });
      setReviews(response.data?.reviews || []);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      setReviews([]);
      setPagination(null);
      setError(err.message || 'Unable to load reviews.');
    } finally {
      setLoadingReviews(false);
    }
  }, [productId, currentPage]);

  const loadCustomerReview = useCallback(async () => {
    if (!productId || !isAuthenticated) {
      setCustomerReview(null);
      return;
    }

    try {
      const response = await reviewApi.getMyReviewForProduct(productId);
      setCustomerReview(response.data || null);
    } catch {
      setCustomerReview(null);
    }
  }, [productId, isAuthenticated]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    loadCustomerReview();
  }, [loadCustomerReview]);

  const refreshAll = async () => {
    await Promise.all([loadSummary(), loadReviews(), loadCustomerReview()]);
  };

  const handleWriteReview = () => {
    if (!productId) {
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

  const handleLike = async (reviewId) => {
    setReactingReviewId(reviewId);

    try {
      const response = await reviewApi.likeReview(reviewId);
      setReviews((current) =>
        current.map((review) => (review._id === reviewId ? response.data : review))
      );
    } finally {
      setReactingReviewId(null);
    }
  };

  const handleDislike = async (reviewId) => {
    setReactingReviewId(reviewId);

    try {
      const response = await reviewApi.dislikeReview(reviewId);
      setReviews((current) =>
        current.map((review) => (review._id === reviewId ? response.data : review))
      );
    } finally {
      setReactingReviewId(null);
    }
  };

  const totalPages = pagination?.totalPages || 1;
  const usingFallback = !productId;

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
      <section className="pd-reviews-section">
        <h2 className="pd-section-title">Customer Reviews</h2>

        {successMessage && <div className="pd-review-success-banner">{successMessage}</div>}
        {error && !loadingSummary && !loadingReviews && (
          <div className="pd-review-error-banner">{error}</div>
        )}

        {loadingSummary ? (
          <div className="pd-state-message">Loading review summary...</div>
        ) : (
          <RatingSummary
            summary={summary}
            usingFallback={usingFallback}
            customerReview={customerReview}
            onWriteReview={handleWriteReview}
            onEditReview={handleEditReview}
          />
        )}

        {loadingReviews ? (
          <div className="pd-state-message">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="pd-state-message">
            {usingFallback
              ? 'Sample reviews shown for this demo product.'
              : 'No reviews yet. Be the first to write one.'}
          </div>
        ) : (
          <div className="pd-reviews-grid">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                onLike={handleLike}
                onDislike={handleDislike}
                reacting={reactingReviewId === review._id}
              />
            ))}
          </div>
        )}
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
        productId={productId}
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
