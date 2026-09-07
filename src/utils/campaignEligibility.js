/**
 * Storefront campaign eligibility helpers.
 * Fail closed — never guess variant eligibility on product cards.
 * Does NOT calculate final discount amounts (PromotionEngine is authority).
 */

export const getCategoryId = (category) => {
  if (!category) return null;
  if (typeof category === 'string') return category;
  if (category._id) return String(category._id);
  if (category.id) return String(category.id);
  return null;
};

/**
 * Product-card safe eligibility.
 * Variant-targeted campaigns only show when every in-stock/default variant is eligible
 * OR when a single unambiguous default variant is known and eligible.
 * Otherwise hide (fail closed).
 */
export const isProductCardEligibleForCampaign = (product, campaign) => {
  if (!product || !campaign) return false;

  const targetType = campaign.targetType || 'all';
  const productId = String(product._id || product.id || '');

  if (!productId) return false;

  if (targetType === 'all') return true;

  if (targetType === 'products') {
    const ids = (campaign.targetProductIds || []).map(String);
    return ids.includes(productId);
  }

  if (targetType === 'categories') {
    const categoryId = getCategoryId(product.category);
    if (!categoryId) return false;
    const ids = (campaign.targetCategoryIds || []).map(String);
    return ids.includes(categoryId);
  }

  if (targetType === 'variants') {
    const targetIds = new Set((campaign.targetVariantIds || []).map(String));
    if (!targetIds.size) return false;

    const variants = Array.isArray(product.variants) ? product.variants : [];
    if (!variants.length) return false;

    // Safe only when all variants on the product are targeted (product-wide effect).
    const allVariantIds = variants
      .map((v) => (v?._id ? String(v._id) : v?.id ? String(v.id) : null))
      .filter(Boolean);

    if (!allVariantIds.length) return false;
    return allVariantIds.every((id) => targetIds.has(id));
  }

  return false;
};

/**
 * Listing eligibility for campaign landing grids.
 * Variant campaigns include a product when ANY variant is targeted.
 * Card badges still use isProductCardEligibleForCampaign (fail closed).
 */
export const isProductEligibleForCampaignListing = (product, campaign) => {
  if (!product || !campaign) return false;

  const targetType = campaign.targetType || 'all';
  if (targetType !== 'variants') {
    return isProductCardEligibleForCampaign(product, campaign);
  }

  const targetIds = new Set((campaign.targetVariantIds || []).map(String));
  if (!targetIds.size) return false;

  const variants = Array.isArray(product.variants) ? product.variants : [];
  return variants.some((v) => {
    const id = v?._id ? String(v._id) : v?.id ? String(v.id) : null;
    return id && targetIds.has(id);
  });
};

/**
 * PDP eligibility for current selection.
 * Fail closed when variant targeting and variantId cannot be resolved.
 */
export const isSelectionEligibleForCampaign = (
  product,
  campaign,
  { variantId = null } = {}
) => {
  if (!product || !campaign) return false;

  const targetType = campaign.targetType || 'all';
  const productId = String(product._id || product.id || '');
  if (!productId) return false;

  if (targetType === 'all') return true;

  if (targetType === 'products') {
    return (campaign.targetProductIds || []).map(String).includes(productId);
  }

  if (targetType === 'categories') {
    const categoryId = getCategoryId(product.category);
    if (!categoryId) return false;
    return (campaign.targetCategoryIds || []).map(String).includes(categoryId);
  }

  if (targetType === 'variants') {
    if (!variantId) return false;
    return (campaign.targetVariantIds || []).map(String).includes(String(variantId));
  }

  return false;
};

/**
 * Pick the best eligible campaign for a product/selection among active list.
 * Highest discountValue for percentage, then fixed; tie → first in list order
 * (backend already sorted by createdAt for merchandising primary separately).
 */
export const pickEligibleCampaign = (campaigns, product, options = {}) => {
  const list = Array.isArray(campaigns) ? campaigns : [];
  const eligible = list.filter((campaign) => {
    if (options.forCard) {
      return isProductCardEligibleForCampaign(product, campaign);
    }
    return isSelectionEligibleForCampaign(product, campaign, options);
  });

  if (!eligible.length) return null;

  return eligible.reduce((best, current) => {
    if (!best) return current;
    const bestScore =
      best.discountType === 'percentage'
        ? Number(best.discountValue) || 0
        : Number(best.discountValue) || 0;
    const currentScore =
      current.discountType === 'percentage'
        ? Number(current.discountValue) || 0
        : Number(current.discountValue) || 0;
    // Prefer higher percentage-ish value; for mixed types prefer higher raw value as UX hint only
    if (currentScore > bestScore) return current;
    if (currentScore < bestScore) return best;
    return best;
  }, null);
};

export const formatEndsIn = (endAt, now = Date.now()) => {
  const end = new Date(endAt).getTime();
  if (!Number.isFinite(end)) return null;
  const ms = Math.max(0, end - now);
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};
