/**
 * Phase 6B — Conversion facts from real product/catalog data only.
 * Never invent scarcity, ratings, shipping promises, or discounts.
 */

const METAL_LABELS = {
  silver: 'Silver',
  gold: 'Gold',
  'rose-gold': 'Rose Gold',
};

const labelMetal = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;
  return METAL_LABELS[raw.toLowerCase()] || raw;
};

export const buildWhyYoullLoveIt = (product) => {
  if (!product) return [];

  const points = [];
  const material = String(product.material || '').trim();
  if (material) {
    points.push(`Crafted with ${material}`);
  }

  const finishes = (Array.isArray(product.metalColors) ? product.metalColors : [])
    .map(labelMetal)
    .filter(Boolean);
  if (finishes.length === 1) {
    points.push(`Available in ${finishes[0]} finish`);
  } else if (finishes.length > 1) {
    points.push(`Available finishes: ${finishes.join(', ')}`);
  }

  if (product.isCustomizable) {
    points.push('Personalization options available for this piece');
  }

  const giftEnabled = Boolean(product.customizationOptions?.giftOptions?.enabled);
  if (giftEnabled || product.isCustomizable) {
    points.push('Gift-ready options available at checkout customization');
  }

  const ringSizes = Array.isArray(product.ringSizes) ? product.ringSizes.filter(Boolean) : [];
  if (ringSizes.length > 0) {
    points.push('Multiple ring sizes to find your fit');
  }

  return points.slice(0, 5);
};

/**
 * Soft delivery / gift / returns messaging grounded in existing storefront behavior.
 * No free-shipping claims. No guaranteed delivery dates.
 */
export const buildPdpConversionAssurances = (product) => {
  const items = [];

  if (product?.isCustomizable) {
    items.push('Personalized engraving and options where offered');
  }

  const finishes = (Array.isArray(product?.metalColors) ? product.metalColors : [])
    .map(labelMetal)
    .filter(Boolean);
  if (finishes.length) {
    items.push(`Finish options: ${finishes.join(', ')}`);
  }

  items.push('Nationwide delivery · Tracking shared once dispatched');

  if (product?.customizationOptions?.giftOptions?.enabled || product?.isCustomizable) {
    items.push('Gift-ready packaging options when customization is enabled');
  }

  items.push('Returns or exchanges — contact Support anytime');
  items.push('Secure checkout');

  return items;
};

/** Prefer reviews with substantive comments for snippet display. */
export const selectReviewSnippets = (reviews = [], { limit = 3, minRating = 4 } = {}) => {
  if (!Array.isArray(reviews)) return [];

  return reviews
    .filter((review) => {
      const rating = Number(review?.rating) || 0;
      const comment = String(review?.comment || '').trim();
      return rating >= minRating && comment.length >= 24;
    })
    .slice(0, limit);
};
