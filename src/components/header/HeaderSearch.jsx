import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SafeImage from '../SafeImage.jsx';
import { SearchIcon } from '../icons.jsx';
import { loadProductSuggestions } from '../../services/catalogCache.js';
import { ROUTES, productPath, searchPath, categoryPath } from '../../utils/navigation';
import { formatPrice, getProductImage, hasSale } from '../../utils/products.js';
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
} from '../../utils/recentSearches.js';
import { getPopularSearchLabels } from '../../utils/searchDiscovery.js';

const MIN_QUERY = 2;
const DEBOUNCE_MS = 320;
const RESULT_LIMIT = 6;

export default function HeaderSearch({ open, onClose, categories = [] }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const requestId = useRef(0);
  const abortRef = useRef(null);
  const inputId = useId();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [matchedCategories, setMatchedCategories] = useState([]);
  const [typeSuggestions, setTypeSuggestions] = useState([]);
  const [correctedQuery, setCorrectedQuery] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  const popularSearches = getPopularSearchLabels({ categories, limit: 8 });

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setRecentSearches(getRecentSearches());

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => inputRef.current?.focus());

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY) {
      setResults([]);
      setMatchedCategories([]);
      setTypeSuggestions([]);
      setCorrectedQuery(null);
      setLoading(false);
      setError('');
      setSearched(false);
      return undefined;
    }

    const currentRequest = ++requestId.current;
    abortRef.current?.abort();
    setLoading(true);
    setError('');

    const timer = window.setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const response = await loadProductSuggestions(
          {
            q: trimmed,
            limit: RESULT_LIMIT,
          },
          { signal: controller.signal }
        );
        if (currentRequest !== requestId.current) {
          return;
        }
        const data = response.data || {};
        setResults((data.products || []).slice(0, RESULT_LIMIT));
        setMatchedCategories((data.categories || []).slice(0, 4));
        setTypeSuggestions((data.suggestions || []).slice(0, 4));
        setCorrectedQuery(data.correctedQuery || null);
        setSearched(true);
      } catch (err) {
        if (err?.name === 'AbortError' || currentRequest !== requestId.current) {
          return;
        }
        setResults([]);
        setMatchedCategories([]);
        setTypeSuggestions([]);
        setCorrectedQuery(null);
        setSearched(true);
        setError('Unable to search right now. Please try again.');
      } finally {
        if (currentRequest === requestId.current) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query, open, retryToken]);

  if (!open) {
    return null;
  }

  const goToSearch = (term) => {
    const trimmed = String(term || '').trim();
    if (trimmed) {
      setRecentSearches(addRecentSearch(trimmed));
    }
    onClose();
    navigate(searchPath({ q: trimmed || undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    goToSearch(query);
  };

  const clearQuery = () => {
    setQuery('');
    setResults([]);
    setMatchedCategories([]);
    setTypeSuggestions([]);
    setCorrectedQuery(null);
    setSearched(false);
    setError('');
    inputRef.current?.focus();
  };

  const handleRemoveRecent = (term) => {
    setRecentSearches(removeRecentSearch(term));
  };

  const handleClearRecent = () => {
    setRecentSearches(clearRecentSearches());
  };

  const showIdleHints = !query.trim();
  const hasAutocompleteGroups =
    matchedCategories.length > 0 || typeSuggestions.length > 0 || Boolean(correctedQuery);

  return (
    <div className="header-search-overlay" role="presentation" onClick={onClose}>
      <div
        className="header-search-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Search jewelry"
        onClick={(event) => event.stopPropagation()}
      >
        <form className="header-search-form" onSubmit={handleSubmit}>
          <label htmlFor={inputId} className="sr-only">
            Search jewelry
          </label>
          <SearchIcon className="header-search-icon w-5 h-5" />
          <input
            id={inputId}
            ref={inputRef}
            type="search"
            className="header-search-input"
            placeholder="Search rings, necklaces, earrings…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            enterKeyHint="search"
          />
          {query ? (
            <button type="button" className="header-search-clear" onClick={clearQuery}>
              Clear
            </button>
          ) : null}
          <button type="submit" className="header-search-submit">
            Search
          </button>
          <button type="button" className="header-search-close" onClick={onClose} aria-label="Close search">
            Close
          </button>
        </form>

        <div className="header-search-body" aria-live="polite">
          {showIdleHints ? (
            <div className="header-search-empty-hint">
              {recentSearches.length > 0 ? (
                <div className="header-search-section">
                  <div className="header-search-section-head">
                    <p className="header-search-section-title">Recent searches</p>
                    <button
                      type="button"
                      className="header-search-section-action"
                      onClick={handleClearRecent}
                    >
                      Clear all
                    </button>
                  </div>
                  <ul className="header-search-recent-list">
                    {recentSearches.map((term) => (
                      <li key={term} className="header-search-recent-row">
                        <button
                          type="button"
                          className="header-search-recent-term"
                          onClick={() => goToSearch(term)}
                        >
                          {term}
                        </button>
                        <button
                          type="button"
                          className="header-search-recent-remove"
                          aria-label={`Remove ${term}`}
                          onClick={() => handleRemoveRecent(term)}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="header-search-section">
                <p className="header-search-section-title">Popular searches</p>
                <div className="header-search-shortcuts">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      className="header-search-chip"
                      onClick={() => goToSearch(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {categories.length > 0 ? (
                <div className="header-search-section">
                  <p className="header-search-section-title">Shop by category</p>
                  <div className="header-search-shortcuts">
                    {categories.slice(0, 6).map((category) => (
                      <Link
                        key={category._id || category.slug}
                        to={categoryPath(category.slug)}
                        className="header-search-chip"
                        onClick={onClose}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link to={ROUTES.collection} className="header-search-chip" onClick={onClose}>
                  Browse Collection
                </Link>
              )}
            </div>
          ) : null}

          {loading ? (
            <div className="header-search-skeleton" aria-busy="true">
              <span className="sr-only">Searching</span>
              {[0, 1, 2].map((item) => (
                <div key={item} className="header-search-skeleton-row" />
              ))}
            </div>
          ) : null}

          {error ? (
            <div className="header-search-state" role="alert">
              <p>{error}</p>
              <button
                type="button"
                className="header-search-retry"
                onClick={() => setRetryToken((value) => value + 1)}
              >
                Retry
              </button>
            </div>
          ) : null}

          {!loading && !error && searched && hasAutocompleteGroups ? (
            <div className="header-search-suggest-meta">
              {correctedQuery ? (
                <button
                  type="button"
                  className="header-search-correction"
                  onClick={() => goToSearch(correctedQuery)}
                >
                  Did you mean <strong>{correctedQuery}</strong>?
                </button>
              ) : null}

              {matchedCategories.length > 0 ? (
                <div className="header-search-section">
                  <p className="header-search-section-title">Categories</p>
                  <div className="header-search-shortcuts">
                    {matchedCategories.map((category) => (
                      <Link
                        key={category._id || category.slug}
                        to={categoryPath(category.slug)}
                        className="header-search-chip"
                        onClick={onClose}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              {typeSuggestions.length > 0 ? (
                <div className="header-search-section">
                  <p className="header-search-section-title">Suggestions</p>
                  <div className="header-search-shortcuts">
                    {typeSuggestions.map((term) => (
                      <button
                        key={term}
                        type="button"
                        className="header-search-chip"
                        onClick={() => goToSearch(term)}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {!loading && !error && searched && results.length === 0 ? (
            <div className="header-search-state">
              <p>No pieces found for “{query.trim()}”.</p>
              <div className="header-search-state-actions">
                <button type="button" className="header-search-clear" onClick={clearQuery}>
                  Clear Search
                </button>
                <Link to={ROUTES.collection} className="header-search-chip" onClick={onClose}>
                  Browse Collection
                </Link>
              </div>
            </div>
          ) : null}

          {!loading && results.length > 0 ? (
            <ul className="header-search-results">
              {results.map((product) => {
                const image = getProductImage(product);
                const onSale = hasSale(product);
                return (
                  <li key={product._id}>
                    <Link
                      to={productPath(product.slug)}
                      className="header-search-result"
                      onClick={() => {
                        addRecentSearch(query.trim());
                        onClose();
                      }}
                    >
                      <SafeImage
                        src={image}
                        alt=""
                        className="header-search-result-image"
                        loading="lazy"
                      />
                      <span className="header-search-result-copy">
                        <span className="header-search-result-title">{product.title}</span>
                        <span className="header-search-result-price">
                          {formatPrice(product.price)}
                          {onSale && product.oldPrice ? (
                            <span className="header-search-result-old">
                              {formatPrice(product.oldPrice)}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {!loading && results.length > 0 ? (
            <Link
              to={searchPath({ q: query.trim() })}
              className="header-search-view-all"
              onClick={() => {
                addRecentSearch(query.trim());
                onClose();
              }}
            >
              View all results
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
