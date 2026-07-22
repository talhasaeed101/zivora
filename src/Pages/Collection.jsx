import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CatalogProductCard from '../components/catalog/CatalogProductCard.jsx';
import CatalogPagination from '../components/catalog/CatalogPagination.jsx';
import Reveal from '../components/Reveal.jsx';
import { ChevronDownIcon, FilterIcon } from '../components/icons';
import { publicCatalogApi } from '../services/api.js';
import {
  SORT_OPTIONS,
  PRICE_RANGES,
  PRODUCT_FLAG_FILTERS,
  getSortLabel,
} from '../utils/catalogFilters.js';
import { ShimmerProductGrid } from '../components/Shimmer.jsx';
import { ROUTES, categoryPath } from '../utils/navigation';
import { usePageTitle } from '../hooks/usePageTitle.js';
import './Collection.css';

const PAGE_SIZE = 12;

function Checkbox({ checked }) {
  return (
    <span className={`catalog-checkbox ${checked ? 'catalog-checkbox-checked' : ''}`} aria-hidden="true">
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path
          d="M1 4L3.5 6.5L9 1"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function Collection() {
  usePageTitle('Zivorah Collection');

  const [searchParams, setSearchParams] = useSearchParams();
  const filterButtonRef = useRef(null);
  const filterPanelRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [priceRangeId, setPriceRangeId] = useState(searchParams.get('price') || '');
  const [customMinPrice, setCustomMinPrice] = useState(searchParams.get('minPrice') || '');
  const [customMaxPrice, setCustomMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [productFlag, setProductFlag] = useState(searchParams.get('flag') || '');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));

  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const selectedPriceRange = PRICE_RANGES.find((range) => range.id === priceRangeId);
  const minPrice = selectedPriceRange
    ? selectedPriceRange.minPrice
    : customMinPrice
      ? Number(customMinPrice)
      : undefined;
  const maxPrice = selectedPriceRange
    ? selectedPriceRange.maxPrice ?? undefined
    : customMaxPrice
      ? Number(customMaxPrice)
      : undefined;

  useEffect(() => {
    let isMounted = true;

    publicCatalogApi
      .getPublicCategories()
      .then((response) => {
        if (isMounted) {
          setCategories(response.data || []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCategories([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const params = {
      search: searchQuery || undefined,
      category: categoryFilter || undefined,
      sort,
      minPrice: minPrice ?? undefined,
      maxPrice: maxPrice ?? undefined,
      page,
      limit: PAGE_SIZE,
    };

    if (productFlag === 'isFeatured') params.isFeatured = true;
    if (productFlag === 'isTrending') params.isTrending = true;
    if (productFlag === 'isNewArrival') params.isNewArrival = true;

    publicCatalogApi
      .getPublicProducts(params)
      .then((response) => {
        if (isMounted) {
          setProducts(response.data?.products || []);
          setPagination(response.data?.pagination || null);
          setError('');
        }
      })
      .catch((err) => {
        if (isMounted) {
          setProducts([]);
          setPagination(null);
          setError(err.message || 'Unable to load products.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery, categoryFilter, sort, minPrice, maxPrice, productFlag, page, reloadToken]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (searchQuery) next.set('q', searchQuery);
    if (categoryFilter) next.set('category', categoryFilter);
    if (sort && sort !== 'newest') next.set('sort', sort);
    if (priceRangeId) next.set('price', priceRangeId);
    if (!priceRangeId && customMinPrice) next.set('minPrice', customMinPrice);
    if (!priceRangeId && customMaxPrice) next.set('maxPrice', customMaxPrice);
    if (productFlag) next.set('flag', productFlag);
    if (page > 1) next.set('page', String(page));
    setSearchParams(next, { replace: true });
  }, [
    searchQuery,
    categoryFilter,
    sort,
    priceRangeId,
    customMinPrice,
    customMaxPrice,
    productFlag,
    page,
    setSearchParams,
  ]);

  useEffect(() => {
    if (!mobileFiltersOpen) {
      return undefined;
    }

    const filterButton = filterButtonRef.current;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileFiltersOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    filterPanelRef.current?.querySelector('button')?.focus();

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
      filterButton?.focus();
    };
  }, [mobileFiltersOpen]);

  const activeCategory = useMemo(
    () => categories.find((cat) => cat._id === categoryFilter),
    [categories, categoryFilter]
  );

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
    setPage(1);
  };

  const handleCategoryChange = (categoryId) => {
    setCategoryFilter((current) => (current === categoryId ? '' : categoryId));
    setPage(1);
  };

  const handlePriceRangeChange = (rangeId) => {
    setPriceRangeId((current) => (current === rangeId ? '' : rangeId));
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setPage(1);
  };

  const handleFlagChange = (flagKey) => {
    setProductFlag((current) => (current === flagKey ? '' : flagKey));
    setPage(1);
  };

  const handleSortChange = (value) => {
    setSort(value);
    setSortMenuOpen(false);
    setMobileSortOpen(false);
    setPage(1);
  };

  const handleClearFilters = () => {
    setCategoryFilter('');
    setPriceRangeId('');
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setProductFlag('');
    setSearchQuery('');
    setSearchInput('');
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = Boolean(
    categoryFilter || priceRangeId || customMinPrice || customMaxPrice || productFlag || searchQuery
  );

  const activeChips = useMemo(() => {
    const chips = [];

    if (searchQuery) {
      chips.push({
        id: 'search',
        label: `“${searchQuery}”`,
        onRemove: () => {
          setSearchQuery('');
          setSearchInput('');
          setPage(1);
        },
      });
    }

    if (activeCategory) {
      chips.push({
        id: 'category',
        label: activeCategory.name,
        onRemove: () => {
          setCategoryFilter('');
          setPage(1);
        },
      });
    }

    if (selectedPriceRange) {
      chips.push({
        id: 'price',
        label: selectedPriceRange.label,
        onRemove: () => {
          setPriceRangeId('');
          setPage(1);
        },
      });
    } else if (customMinPrice || customMaxPrice) {
      chips.push({
        id: 'custom-price',
        label: `PKR ${customMinPrice || '0'}–${customMaxPrice || '∞'}`,
        onRemove: () => {
          setCustomMinPrice('');
          setCustomMaxPrice('');
          setPage(1);
        },
      });
    }

    if (productFlag) {
      const flag = PRODUCT_FLAG_FILTERS.find((item) => item.key === productFlag);
      if (flag) {
        chips.push({
          id: 'flag',
          label: flag.label,
          onRemove: () => {
            setProductFlag('');
            setPage(1);
          },
        });
      }
    }

    return chips;
  }, [
    searchQuery,
    activeCategory,
    selectedPriceRange,
    customMinPrice,
    customMaxPrice,
    productFlag,
  ]);

  const productCount = pagination?.total ?? products.length;
  const headerDescription = activeCategory?.description
    || 'Explore refined jewelry designed for everyday elegance and unforgettable celebrations.';

  const filterSidebar = (
    <>
      <div className="catalog-filter-section">
        <h2 className="catalog-filter-heading" id="catalog-filter-categories">Categories</h2>
        <ul className="catalog-filter-list" aria-labelledby="catalog-filter-categories">
          {categories.map((cat) => (
            <li key={cat._id || cat.slug}>
              <button
                type="button"
                className={`catalog-filter-item${categoryFilter === cat._id ? ' is-active' : ''}`}
                onClick={() => handleCategoryChange(cat._id)}
                aria-pressed={categoryFilter === cat._id}
              >
                <Checkbox checked={categoryFilter === cat._id} />
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="catalog-filter-section">
        <h2 className="catalog-filter-heading" id="catalog-filter-price">Price</h2>
        <ul className="catalog-filter-list" aria-labelledby="catalog-filter-price">
          {PRICE_RANGES.map((range) => (
            <li key={range.id}>
              <button
                type="button"
                className={`catalog-filter-item${priceRangeId === range.id ? ' is-active' : ''}`}
                onClick={() => handlePriceRangeChange(range.id)}
                aria-pressed={priceRangeId === range.id}
              >
                <Checkbox checked={priceRangeId === range.id} />
                {range.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="catalog-filter-section">
        <h2 className="catalog-filter-heading" id="catalog-filter-collection">Collection</h2>
        <ul className="catalog-filter-list" aria-labelledby="catalog-filter-collection">
          {PRODUCT_FLAG_FILTERS.map((filter) => (
            <li key={filter.key}>
              <button
                type="button"
                className={`catalog-filter-item${productFlag === filter.key ? ' is-active' : ''}`}
                onClick={() => handleFlagChange(filter.key)}
                aria-pressed={productFlag === filter.key}
              >
                <Checkbox checked={productFlag === filter.key} />
                {filter.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {hasActiveFilters && (
        <button type="button" className="catalog-clear-filters" onClick={handleClearFilters}>
          Clear all filters
        </button>
      )}
    </>
  );

  const sortMenu = (
    <div className="catalog-sort-menu" role="listbox" aria-label="Sort products">
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="option"
          aria-selected={sort === option.value}
          className={`catalog-sort-option ${sort === option.value ? 'catalog-sort-option-active' : ''}`}
          onClick={() => handleSortChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="catalog-page">
      <Navbar activeLink="COLLECTION" homeHref={ROUTES.home} />

      <main id="main-content" className="catalog-main">
        <Reveal className="catalog-header" variant="fade-up">
          <p className="catalog-breadcrumbs">
            <a href={ROUTES.home}>Home</a>
            <span className="catalog-breadcrumb-sep" aria-hidden="true">
              /
            </span>
            <span>Collection</span>
            {activeCategory && (
              <>
                <span className="catalog-breadcrumb-sep" aria-hidden="true">
                  /
                </span>
                <a href={categoryPath(activeCategory.slug)}>{activeCategory.name}</a>
              </>
            )}
          </p>

          <h1 className="catalog-page-title">
            {activeCategory ? activeCategory.name : 'Our Collection'}
          </h1>
          <p className="catalog-page-description">{headerDescription}</p>
          <p className="catalog-page-count" aria-live="polite">
            {loading ? 'Loading products…' : `${productCount} ${productCount === 1 ? 'piece' : 'pieces'}`}
          </p>
        </Reveal>

        <Reveal className="catalog-search-form-wrap" variant="fade-up" delay={60}>
          <form className="catalog-search-form" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              className="catalog-search-input"
              placeholder="Search jewelry…"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              aria-label="Search collection"
            />
            <button type="submit" className="catalog-search-btn">
              Search
            </button>
          </form>
        </Reveal>

        <Reveal className="catalog-toolbar" variant="fade-up" delay={90}>
          <div className="catalog-toolbar-left">
            <span className="catalog-filters-label">Filters</span>
            {hasActiveFilters && (
              <button type="button" className="catalog-toolbar-clear" onClick={handleClearFilters}>
                Clear all
              </button>
            )}
          </div>
          <div className="catalog-sort-wrap">
            <button
              type="button"
              className="catalog-sort-btn"
              onClick={() => setSortMenuOpen((open) => !open)}
              aria-expanded={sortMenuOpen}
              aria-haspopup="listbox"
            >
              Sort by: <strong>{getSortLabel(sort)}</strong>
              <ChevronDownIcon className="w-3.5 h-3.5" />
            </button>
            {sortMenuOpen && sortMenu}
          </div>
        </Reveal>

        <div className="catalog-mobile-controls">
          <button
            ref={filterButtonRef}
            type="button"
            className="catalog-mobile-filter-btn"
            onClick={() => setMobileFiltersOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={mobileFiltersOpen}
          >
            Filters
            {activeChips.length > 0 && (
              <span className="catalog-mobile-filter-count">{activeChips.length}</span>
            )}
            <FilterIcon className="w-4 h-4" />
          </button>
          <div className="catalog-sort-wrap catalog-mobile-sort-wrap">
            <button
              type="button"
              className="catalog-mobile-sort-btn"
              onClick={() => setMobileSortOpen((open) => !open)}
              aria-expanded={mobileSortOpen}
              aria-haspopup="listbox"
            >
              <span>
                Sort: <strong>{getSortLabel(sort)}</strong>
              </span>
              <ChevronDownIcon className="w-3.5 h-3.5" />
            </button>
            {mobileSortOpen && sortMenu}
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="catalog-active-chips" aria-label="Active filters">
            {activeChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                className="catalog-chip"
                onClick={chip.onRemove}
                aria-label={`Remove filter ${chip.label}`}
              >
                <span>{chip.label}</span>
                <span aria-hidden="true">×</span>
              </button>
            ))}
            <button type="button" className="catalog-chip-clear" onClick={handleClearFilters}>
              Clear all
            </button>
          </div>
        )}

        {mobileFiltersOpen && (
          <button
            type="button"
            className="catalog-mobile-filter-overlay"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
          />
        )}

        <div className="catalog-content-row">
          <aside
            ref={filterPanelRef}
            className={`catalog-sidebar${mobileFiltersOpen ? ' catalog-sidebar-mobile-open' : ''}`}
            {...(mobileFiltersOpen
              ? {
                  role: 'dialog',
                  'aria-modal': true,
                  'aria-label': 'Product filters',
                }
              : {})}
          >
            <div className="catalog-sidebar-mobile-header">
              <h2 className="catalog-sidebar-mobile-title">Filters</h2>
              <button
                type="button"
                className="catalog-sidebar-close"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
              >
                ×
              </button>
            </div>
            {filterSidebar}
            <div className="catalog-sidebar-mobile-actions">
              <button
                type="button"
                className="catalog-sidebar-secondary"
                onClick={handleClearFilters}
              >
                Clear
              </button>
              <button
                type="button"
                className="catalog-sidebar-primary"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Apply
              </button>
            </div>
          </aside>

          <div className="catalog-grid-wrap">
            {error ? (
              <div className="catalog-state catalog-state-error-panel" role="alert">
                <h2 className="catalog-state-title">We couldn’t load this collection</h2>
                <p className="catalog-state-copy">
                  Please try again in a moment. Your filters have been kept.
                </p>
                <button
                  type="button"
                  className="catalog-state-btn"
                  onClick={() => setReloadToken((value) => value + 1)}
                >
                  Retry
                </button>
              </div>
            ) : loading ? (
              <div aria-busy="true" aria-live="polite">
                <span className="sr-only">Loading products</span>
                <ShimmerProductGrid count={8} />
              </div>
            ) : products.length === 0 ? (
              <div className="catalog-state">
                <h2 className="catalog-state-title">No pieces match your selection</h2>
                <p className="catalog-state-copy">
                  Try adjusting filters or browse the full collection for more jewelry.
                </p>
                <div className="catalog-state-actions">
                  {hasActiveFilters && (
                    <button type="button" className="catalog-state-btn" onClick={handleClearFilters}>
                      Clear Filters
                    </button>
                  )}
                  <a href={ROUTES.collection} className="catalog-state-link">
                    Browse All Jewelry
                  </a>
                </div>
              </div>
            ) : (
              <div key={`${sort}-${categoryFilter}-${priceRangeId}-${productFlag}-${searchQuery}-${page}`} className="catalog-results-fade">
                <div className="catalog-product-grid">
                  {products.map((product, index) => (
                    <Reveal
                      key={product._id}
                      variant="fade-up"
                      delay={Math.min(index, 7) * 40}
                      className="catalog-card-reveal"
                    >
                      <CatalogProductCard product={product} variant="desktop" />
                    </Reveal>
                  ))}
                </div>
                <div className="catalog-product-grid-mobile">
                  {products.map((product, index) => (
                    <Reveal
                      key={`${product._id}-m`}
                      variant="fade-up"
                      delay={Math.min(index, 7) * 40}
                      className="catalog-card-reveal"
                    >
                      <CatalogProductCard product={product} variant="mobile" />
                    </Reveal>
                  ))}
                </div>
              </div>
            )}

            {!loading && !error && (
              <CatalogPagination
                pagination={pagination}
                page={page}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
