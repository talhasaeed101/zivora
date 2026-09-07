const STORAGE_KEY = 'zivora_recent_searches';
export const MAX_RECENT_SEARCHES = 10;

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const normalizeTerm = (value = '') =>
  String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 80);

export function getRecentSearches() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => normalizeTerm(entry))
      .filter(Boolean)
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

export function addRecentSearch(term) {
  const normalized = normalizeTerm(term);
  if (!normalized || !canUseStorage()) {
    return getRecentSearches();
  }

  const next = [
    normalized,
    ...getRecentSearches().filter((entry) => entry.toLowerCase() !== normalized.toLowerCase()),
  ].slice(0, MAX_RECENT_SEARCHES);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota / private-mode failures
  }

  return next;
}

export function removeRecentSearch(term) {
  const normalized = normalizeTerm(term).toLowerCase();
  if (!normalized || !canUseStorage()) {
    return getRecentSearches();
  }

  const next = getRecentSearches().filter((entry) => entry.toLowerCase() !== normalized);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore
  }

  return next;
}

export function clearRecentSearches() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }

  return [];
}
