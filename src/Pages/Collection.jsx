import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CatalogProductCard from '../components/catalog/CatalogProductCard.jsx';
import CatalogPagination from '../components/catalog/CatalogPagination.jsx';
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
    <span className={`catalog-checkbox ${checked ? 'catalog-checkbox-checked' : ''}`}>
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
  usePageTitle('Zivora Collection');

  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, [searchQuery, categoryFilter, sort, minPrice, maxPrice, productFlag, page]);

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

  const handleApplyCustomPrice = () => {
    setPriceRangeId('');
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
    setPage(1);
  };

  const hasActiveFilters =
    categoryFilter || priceRangeId || customMinPrice || customMaxPrice || productFlag;

  const filterSidebar = (
    <>
      <div className="catalog-filter-section">
        <h2 className="catalog-filter-heading">CATEGORIES</h2>
        <ul className="catalog-filter-list">
          {categories.map((cat) => (
            <li key={cat._id || cat.slug}>
              <button
                type="button"
                className="catalog-filter-item"
                onClick={() => handleCategoryChange(cat._id)}
              >
                <Checkbox checked={categoryFilter === cat._id} />
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="catalog-filter-section">
        <h2 className="catalog-filter-heading">PRICE</h2>
        <ul className="catalog-filter-list">
          {PRICE_RANGES.map((range) => (
            <li key={range.id}>
              <button
                type="button"
                className="catalog-filter-item"
                onClick={() => handlePriceRangeChange(range.id)}
              >
                <Checkbox checked={priceRangeId === range.id} />
                {range.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="catalog-price-inputs">
          <input
            type="number"
            min="0"
            placeholder="Min"
            className="catalog-price-input"
            value={customMinPrice}
            onChange={(event) => setCustomMinPrice(event.target.value)}
          />
          <input
            type="number"
            min="0"
            placeholder="Max"
            className="catalog-price-input"
            value={customMaxPrice}
            onChange={(event) => setCustomMaxPrice(event.target.value)}
          />
        </div>
        <button type="button" className="catalog-price-apply" onClick={handleApplyCustomPrice}>
          Apply Price
        </button>
      </div>

      <div className="catalog-filter-section">
        <h2 className="catalog-filter-heading">COLLECTION</h2>
        <ul className="catalog-filter-list">
          {PRODUCT_FLAG_FILTERS.map((filter) => (
            <li key={filter.key}>
              <button
                type="button"
                className="catalog-filter-item"
                onClick={() => handleFlagChange(filter.key)}
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

  const sortMenu = (isMobile = false) => (
    <div className={`catalog-sort-menu ${isMobile ? '' : ''}`}>
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
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

      <main className="catalog-main">
        <p className="catalog-breadcrumbs">
          <a href={ROUTES.home}>Home</a> &gt; <span>Collection</span>
          {activeCategory && (
            <>
              {' '}
              &gt; <a href={categoryPath(activeCategory.slug)}>{activeCategory.name}</a>
            </>
          )}
        </p>

        <h1 className="catalog-page-title">
          {activeCategory ? activeCategory.name : 'Our Collection'}
        </h1>
        <p className="catalog-page-count">
          {loading ? 'Loading products...' : `${pagination?.total ?? products.length} products`}
        </p>

        <form className="catalog-search-form" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            className="catalog-search-input"
            placeholder="Search jewelry..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            aria-label="Search collection"
          />
          <button type="submit" className="catalog-search-btn">
            Search
          </button>
        </form>

        <div className="catalog-toolbar">
          <span className="catalog-filters-label">FILTERS</span>
          <div className="catalog-sort-wrap">
            <button
              type="button"
              className="catalog-sort-btn"
              onClick={() => setSortMenuOpen((open) => !open)}
            >
              Sort by: <strong>{getSortLabel(sort)}</strong>
              <ChevronDownIcon className="w-3.5 h-3.5" />
            </button>
            {sortMenuOpen && sortMenu()}
          </div>
        </div>

        <div className="catalog-mobile-controls">
          <button
            type="button"
            className="catalog-mobile-filter-btn"
            onClick={() => setMobileFiltersOpen(true)}
          >
            Filters
            <FilterIcon className="w-4 h-4" />
          </button>
          <div className="catalog-sort-wrap" style={{ flex: 1.4 }}>
            <button
              type="button"
              className="catalog-mobile-sort-btn"
              onClick={() => setMobileSortOpen((open) => !open)}
            >
              <span>
                Sort by: <strong>{getSortLabel(sort)}</strong>
              </span>
              <ChevronDownIcon className="w-3.5 h-3.5" />
            </button>
            {mobileSortOpen && sortMenu(true)}
          </div>
        </div>

        {mobileFiltersOpen && (
          <button
            type="button"
            className="catalog-mobile-filter-overlay"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
          />
        )}

        <div className="catalog-content-row">
          <aside className={`catalog-sidebar ${mobileFiltersOpen ? 'catalog-sidebar-mobile-open' : ''}`}>
            {filterSidebar}
          </aside>

          <div className="catalog-grid-wrap">
            {error && <p className="catalog-state-message catalog-state-error">{error}</p>}

            {loading ? (
              <ShimmerProductGrid count={6} />
            ) : !error && products.length === 0 ? (
              <p className="catalog-state-message">No products match your filters.</p>
            ) : (
              <>
                <div className="catalog-product-grid">
                  {products.map((product) => (
                    <CatalogProductCard key={product._id} product={product} variant="desktop" />
                  ))}
                </div>
                <div className="catalog-product-grid-mobile">
                  {products.map((product) => (
                    <CatalogProductCard key={product._id} product={product} variant="mobile" />
                  ))}
                </div>
              </>
            )}

            <CatalogPagination
              pagination={pagination}
              page={page}
              onPageChange={setPage}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
