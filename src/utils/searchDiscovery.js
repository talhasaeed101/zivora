/**
 * Curated discovery labels for empty-state / popular searches.
 * Not statistical popularity — derived from common catalog jewelry types.
 */
export const CURATED_POPULAR_SEARCHES = [
  'necklace',
  'ring',
  'earrings',
  'bracelet',
  'pendant',
  'gold',
  'silver',
  'rose gold',
  'diamond',
];

export function getPopularSearchLabels({ categories = [], limit = 8 } = {}) {
  const fromCategories = (categories || [])
    .map((category) => String(category?.name || '').trim())
    .filter(Boolean);

  const merged = [];
  const seen = new Set();

  [...fromCategories, ...CURATED_POPULAR_SEARCHES].forEach((label) => {
    const key = label.toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    merged.push(label);
  });

  return merged.slice(0, limit);
}
