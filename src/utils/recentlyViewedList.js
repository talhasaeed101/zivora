/**
 * Pure helpers for recently viewed lists (also covered by backend Phase 6A tests).
 */
export const pushRecentlyViewedId = (list, productId, { max = 8 } = {}) => {
  const id = String(productId || '').trim();
  if (!id) return Array.isArray(list) ? [...list] : [];
  return [id, ...(Array.isArray(list) ? list : []).filter((entry) => entry !== id)].slice(0, max);
};

export const excludeCurrentFromRecentlyViewed = (list, currentId) => {
  const exclude = currentId ? String(currentId) : null;
  return (Array.isArray(list) ? list : []).filter((id) => id !== exclude);
};
