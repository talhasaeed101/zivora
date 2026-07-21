import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CatalogProductCard from '../components/catalog/CatalogProductCard.jsx';
import CatalogPagination from '../components/catalog/CatalogPagination.jsx';
import Reveal from '../components/Reveal.jsx';
import { publicCatalogApi } from '../services/api.js';
import { ROUTES, categoryPath } from '../utils/navigation';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { ShimmerCategoryHero, ShimmerProductGrid } from '../components/Shimmer.jsx';
import SafeImage from '../components/SafeImage.jsx';
import { PLACEHOLDER_IMAGE } from '../utils/products.js';
import './CategoryPage.css';

const PAGE_SIZE = 12;

export default function CategoryPage() {
  const { slug } = useParams();
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [trackedSlug, setTrackedSlug] = useState(slug);

  if (slug !== trackedSlug) {
    setTrackedSlug(slug);
    setPage(1);
    setError('');
  }

  useEffect(() => {
    let isMounted = true;

    publicCatalogApi
      .getPublicCategories()
      .then((response) => {
        if (isMounted) {
          const list = response.data || [];
          setCategories(list);
          const match = list.find((item) => item.slug === slug);
          setCategory(match || null);
          if (!match) {
            setError('Category not found.');
            setLoading(false);
          } else {
            setError('');
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setCategories([]);
          setCategory(null);
          setError(err.message || 'Unable to load category.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!category?._id) {
      return undefined;
    }

    let isMounted = true;
    setLoading(true);

    publicCatalogApi
      .getPublicProducts({
        category: category._id,
        page,
        limit: PAGE_SIZE,
        sort: 'newest',
      })
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
  }, [category, page, reloadToken]);

  const categoryImage = category?.image || PLACEHOLDER_IMAGE;
  const productCount = pagination?.total ?? products.length;
  const otherCategories = categories.filter((item) => item.slug !== slug);

  usePageTitle(category?.name ? `${category.name} | Zivorah` : 'Category | Zivorah');

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            <a href="/collection">Collection</a>
            <span className="catalog-breadcrumb-sep" aria-hidden="true">
              /
            </span>
            <span>{category?.name || slug}</span>
          </p>
        </Reveal>

        {loading && !category && <ShimmerCategoryHero />}

        {category && (
          <Reveal className="category-hero" variant="fade-up">
            <div className="category-hero-image-wrap">
              <SafeImage src={categoryImage} alt={category.name} className="category-hero-image" />
            </div>
            <div className="category-hero-copy">
              <h1 className="category-hero-title">{category.name}</h1>
              {category.description && (
                <p className="category-hero-description">{category.description}</p>
              )}
              <p className="catalog-page-count">
                {loading
                  ? 'Loading products…'
                  : `${productCount} ${productCount === 1 ? 'piece' : 'pieces'}`}
              </p>
            </div>
          </Reveal>
        )}

        {!category && !loading && (
          <div className="catalog-state">
            <h1 className="catalog-state-title">Category not found</h1>
            <p className="catalog-state-copy">
              This category may have moved. Browse the full collection instead.
            </p>
            <a href={ROUTES.collection} className="catalog-state-link">
              Browse All Jewelry
            </a>
          </div>
        )}

        {otherCategories.length > 0 && category && (
          <Reveal className="category-other-wrap" variant="fade-up" delay={60}>
            <h2 className="catalog-filter-heading">Other categories</h2>
            <ul className="category-other-list">
              {otherCategories.map((item) => (
                <li key={item._id || item.slug}>
                  <a href={categoryPath(item.slug)} className="category-other-link">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        <div className="catalog-grid-wrap category-grid-wrap">
          {error && category && (
            <div className="catalog-state catalog-state-error-panel" role="alert">
              <h2 className="catalog-state-title">We couldn’t load these pieces</h2>
              <p className="catalog-state-copy">Please try again in a moment.</p>
              <button
                type="button"
                className="catalog-state-btn"
                onClick={() => setReloadToken((value) => value + 1)}
              >
                Retry
              </button>
            </div>
          )}

          {category && loading ? (
            <div aria-busy="true" aria-live="polite">
              <span className="sr-only">Loading products</span>
              <ShimmerProductGrid count={8} />
            </div>
          ) : null}

          {category && !loading && !error && products.length === 0 ? (
            <div className="catalog-state">
              <h2 className="catalog-state-title">No products in this category yet</h2>
              <p className="catalog-state-copy">
                Explore other collections while we prepare new pieces.
              </p>
              <a href={ROUTES.collection} className="catalog-state-link">
                Browse All Jewelry
              </a>
            </div>
          ) : null}

          {category && !loading && !error && products.length > 0 ? (
            <div key={`${slug}-${page}`} className="catalog-results-fade">
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
          ) : null}

          {category && !loading && !error && (
            <CatalogPagination pagination={pagination} page={page} onPageChange={handlePageChange} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
