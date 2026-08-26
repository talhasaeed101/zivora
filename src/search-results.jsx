import { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ROUTES, getSearchQueryFromUrl, getSearchCategoryFromUrl } from './utils/navigation';
import { useSeo } from './hooks/useSeo.js';
import { useMediaQuery } from './hooks/useMediaQuery.js';
import { loadPublicCategories, loadPublicProducts } from './services/catalogCache.js';
import { PRICE_RANGES, SORT_OPTIONS, getSortLabel } from './utils/catalogFilters.js';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import PageBreadcrumbs from './components/seo/PageBreadcrumbs.jsx';
import { ShimmerProductGrid } from './components/Shimmer.jsx';
import CatalogProductCard from './components/catalog/CatalogProductCard.jsx';
import CatalogPagination from './components/catalog/CatalogPagination.jsx';
import Reveal from './components/Reveal.jsx';
import { ChevronDownIcon, FilterIcon } from './components/icons';
import './Pages/Collection.css';

const PAGE_SIZE = 24;

function Checkbox({ checked }) {
  return (
    <span className="catalog-checkbox" aria-hidden="true">
      <img src={checked ? "/images/check.svg" : "/images/uncheck.svg"} alt="" />
    </span>
  );
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = getSearchQueryFromUrl();
  const initialCategory = getSearchCategoryFromUrl();
  const filtersRef = useRef(null);
  const isMobileCatalog = useMediaQuery('(max-width: 768px)');
  const [reloadToken, setReloadToken] = useState(0);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [categoryFilter, setCategoryFilter] = useState(initialCategory || searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [priceRangeId, setPriceRangeId] = useState(searchParams.get('price') || '');
  const [customMinPrice, setCustomMinPrice] = useState(searchParams.get('minPrice') || '');
  const [customMaxPrice, setCustomMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [appliedMinPrice, setAppliedMinPrice] = useState(searchParams.get('minPrice') || '');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const selectedPriceRange = PRICE_RANGES.find((range) => range.id === priceRangeId);
  const minPrice = selectedPriceRange
    ? selectedPriceRange.minPrice
    : appliedMinPrice
      ? Number(appliedMinPrice)
      : undefined;
  const maxPrice = selectedPriceRange
    ? selectedPriceRange.maxPrice ?? undefined
    : appliedMaxPrice
      ? Number(appliedMaxPrice)
      : undefined;

  useEffect(() => {
    let isMounted = true;
    loadPublicCategories()
      .then((items) => {
        if (isMounted) {
          setCategories(items);
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
    const controller = new AbortController();
    setLoading(true);

    loadPublicProducts(
      {
        search: searchQuery || undefined,
        category: categoryFilter || undefined,
        sort,
        minPrice: minPrice ?? undefined,
        maxPrice: maxPrice ?? undefined,
        page,
        limit: PAGE_SIZE,
      },
      { signal: controller.signal }
    )
      .then((response) => {
        setProducts(response.data?.products || []);
        setPagination(response.data?.pagination || null);
        setError('');
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setError(err.message || 'Unable to load products.');
        setProducts([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [searchQuery, categoryFilter, sort, minPrice, maxPrice, page, reloadToken]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (searchQuery) next.set('q', searchQuery);
    if (categoryFilter) next.set('category', categoryFilter);
    if (sort && sort !== 'newest') next.set('sort', sort);
    if (priceRangeId) next.set('price', priceRangeId);
    if (!priceRangeId && appliedMinPrice) next.set('minPrice', appliedMinPrice);
    if (!priceRangeId && appliedMaxPrice) next.set('maxPrice', appliedMaxPrice);
    if (page > 1) next.set('page', String(page));
    setSearchParams(next, { replace: true });
  }, [
    searchQuery,
    categoryFilter,
    sort,
    priceRangeId,
    appliedMinPrice,
    appliedMaxPrice,
    page,
    setSearchParams,
  ]);

  const handleCategoryChange = (categoryId) => {
    setCategoryFilter((current) => (current === categoryId ? '' : categoryId));
    setPage(1);
  };

  const handlePriceRangeChange = (rangeId) => {
    setPriceRangeId((current) => (current === rangeId ? '' : rangeId));
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
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
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = Boolean(categoryFilter || priceRangeId || appliedMinPrice || appliedMaxPrice);

  const activeChips = useMemo(() => {
    const chips = [];

    if (categoryFilter) {
      const cat = categories.find((c) => c._id === categoryFilter);
      if (cat) {
        chips.push({
          id: 'category',
          label: cat.name,
          onRemove: () => {
            setCategoryFilter('');
            setPage(1);
          },
        });
      }
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
    } else if (appliedMinPrice || appliedMaxPrice) {
      chips.push({
        id: 'custom-price',
        label: `PKR ${appliedMinPrice || '0'}–${appliedMaxPrice || '∞'}`,
        onRemove: () => {
          setAppliedMinPrice('');
          setAppliedMaxPrice('');
          setCustomMinPrice('');
          setCustomMaxPrice('');
          setPage(1);
        },
      });
    }

    return chips;
  }, [categoryFilter, categories, selectedPriceRange, appliedMinPrice, appliedMaxPrice]);

  const displayQuery = searchQuery || 'all products';
  const productCount = pagination?.total ?? products.length;

  useSeo({
    title: searchQuery ? `Search: ${searchQuery}` : 'Search jewelry',
    description: searchQuery
      ? `Search results for “${searchQuery}” at Zivorah. Shop rings, necklaces, earrings, and more.`
      : 'Search Zivorah premium jewelry by name, style, or category.',
    path: searchQuery ? `/search?q=${encodeURIComponent(searchQuery)}` : '/search',
    robots: 'noindex, follow',
    prefetch: ['/collection'],
  });

  const searchCrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Search', path: '/search' },
    { name: displayQuery },
  ];

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
      <Navbar homeHref={ROUTES.home} />

      <main id="main-content" className="catalog-main">
        <Reveal className="catalog-header" variant="fade-up">
          <PageBreadcrumbs items={searchCrumbs} className="catalog-breadcrumbs" />

          <h1 className="catalog-page-title">
            Showing products for{' '}
            <em className="catalog-page-title-query">
              &ldquo;{displayQuery}&rdquo;
            </em>
          </h1>
          <p className="catalog-page-count" aria-live="polite">
            {loading ? 'Loading products…' : `(${productCount} ${productCount === 1 ? 'Product' : 'Products'})`}
          </p>
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
            ref={filtersRef}
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
                <h2 className="catalog-state-title">We couldn’t load these products</h2>
                <p className="catalog-state-copy">
                  Please try again in a moment.
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
                <h2 className="catalog-state-title">No pieces match your search</h2>
                <p className="catalog-state-copy">
                  Try adjusting filters or search query to see more jewelry.
                </p>
                <div className="catalog-state-actions">
                  {hasActiveFilters && (
                    <button type="button" className="catalog-state-btn" onClick={handleClearFilters}>
                      Clear Filters
                    </button>
                  )}
                  <Link to={ROUTES.collection} className="catalog-state-link">
                    Browse All Jewelry
                  </Link>
                </div>
              </div>
            ) : (
              <div key={`${sort}-${categoryFilter}-${priceRangeId}-${page}`} className="catalog-results-fade">
                <div className={isMobileCatalog ? 'catalog-product-grid-mobile' : 'catalog-product-grid'}>
                  {products.map((product, index) => (
                    <Reveal
                      key={product._id}
                      variant="fade-up"
                      delay={Math.min(index, 7) * 40}
                      className="catalog-card-reveal"
                    >
                      <CatalogProductCard
                        product={product}
                        variant={isMobileCatalog ? 'mobile' : 'desktop'}
                      />
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
