export const FALLBACK_REVIEW_SUMMARY = {
  averageRating: 4,
  reviewCount: 1015,
  ratingBreakdown: [
    { stars: 5, count: 629, percent: 62 },
    { stars: 4, count: 223, percent: 22 },
    { stars: 3, count: 81, percent: 8 },
    { stars: 2, count: 51, percent: 5 },
    { stars: 1, count: 31, percent: 3 },
  ],
  averageSizingRating: 4.3,
  averageQualityRating: 4.6,
  sizingPercent: 85,
  qualityPercent: 92,
};

export const FALLBACK_REVIEWS = [
  {
    _id: 'fallback-1',
    customer: { name: 'Sarah Mitchell' },
    rating: 5,
    title: 'Stunning everyday rings',
    comment:
      'Absolutely stunning rings! The quality exceeded my expectations. They stack beautifully and feel comfortable for all-day wear.',
    likes: 24,
    dislikes: 1,
    createdAt: '2026-06-12T00:00:00.000Z',
  },
  {
    _id: 'fallback-2',
    customer: { name: 'Ayesha Khan' },
    rating: 4,
    title: 'Elegant minimalist design',
    comment:
      'Beautiful minimalist design. The gold finish is elegant and pairs well with other jewelry. Would definitely recommend to friends.',
    likes: 18,
    dislikes: 0,
    createdAt: '2026-06-10T00:00:00.000Z',
  },
  {
    _id: 'fallback-3',
    customer: { name: 'Emily Chen' },
    rating: 5,
    title: 'My new everyday favorites',
    comment:
      'These rings are my new everyday favorites. Lightweight, hypoallergenic, and the craftsmanship is impeccable.',
    likes: 31,
    dislikes: 2,
    createdAt: '2026-06-08T00:00:00.000Z',
  },
  {
    _id: 'fallback-4',
    customer: { name: 'Olivia Parker' },
    rating: 4,
    title: 'Subtle elegance',
    comment:
      'Love the subtle elegance. Perfect for stacking or wearing alone. Shipping was fast and packaging felt very premium.',
    likes: 12,
    dislikes: 0,
    createdAt: '2026-06-05T00:00:00.000Z',
  },
];

export const formatReviewDate = (value) => {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
};

export const getReviewerName = (review) => {
  if (review?.customer && typeof review.customer === 'object') {
    return review.customer.name || 'Customer';
  }

  return review?.name || 'Customer';
};

export const getFilledStars = (rating) => Math.max(0, Math.min(5, Math.round(rating || 0)));
