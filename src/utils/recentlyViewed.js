const STORAGE_KEY = 'zivora_recently_viewed';
export const RECENTLY_VIEWED_MAX = 8;

const readRaw = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((id) => String(id)).filter(Boolean);
  } catch {
    return [];
  }
};

const writeRaw = (ids) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, RECENTLY_VIEWED_MAX)));
  } catch {
    // quota / private mode — ignore
  }
};

/** Record a product view. Newest first, deduped, max 8. */
export const recordRecentlyViewed = (productId) => {
  const id = String(productId || '').trim();
  if (!id) return readRaw();
  const next = [id, ...readRaw().filter((entry) => entry !== id)].slice(0, RECENTLY_VIEWED_MAX);
  writeRaw(next);
  return next;
};

/** IDs newest first, optionally excluding the current PDP product. */
export const getRecentlyViewedIds = ({ excludeId = null } = {}) => {
  const exclude = excludeId ? String(excludeId) : null;
  return readRaw().filter((id) => id !== exclude).slice(0, RECENTLY_VIEWED_MAX);
};
