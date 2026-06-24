import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CatalogProductCard from '../components/catalog/CatalogProductCard.jsx';
import CatalogPagination from '../components/catalog/CatalogPagination.jsx';
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
  }, [category, page]);

  const categoryImage = category?.image || PLACEHOLDER_IMAGE;

  usePageTitle(category?.name ? `${category.name} | Zivora` : 'Category | Zivora');

  return (
    <div className="catalog-page">
      <Navbar activeLink="COLLECTION" homeHref={ROUTES.home} />

      <main className="catalog-main">
        <p className="catalog-breadcrumbs">
          <a href={ROUTES.home}>Home</a> &gt; <a href="/collection">Collection</a> &gt;{' '}
          <span>{category?.name || slug}</span>
        </p>

        {loading && !category && <ShimmerCategoryHero />}

        {category && (
          <div className="category-hero">
            <div className="category-hero-image-wrap">
              <SafeImage src={categoryImage} alt={category.name} className="category-hero-image" />
            </div>
            <div className="category-hero-copy">
              <h1 className="category-hero-title">{category.name}</h1>
              {category.description && (
                <p className="category-hero-description">{category.description}</p>
              )}
            </div>
          </div>
        )}

        {!category && !loading && (
          <h1 className="catalog-page-title">Category not found</h1>
        )}

        <p className="catalog-page-count">
          {loading ? 'Loading products...' : `${pagination?.total ?? products.length} products`}
        </p>

        {categories.length > 0 && (
          <div className="catalog-filter-section" style={{ borderBottom: 'none', paddingTop: 0 }}>
            <h2 className="catalog-filter-heading">OTHER CATEGORIES</h2>
            <ul className="catalog-filter-list" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '16px' }}>
              {categories
                .filter((item) => item.slug !== slug)
                .map((item) => (
                  <li key={item._id || item.slug}>
                    <a href={categoryPath(item.slug)} className="catalog-filter-item" style={{ textDecoration: 'none' }}>
                      {item.name}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <div className="catalog-grid-wrap" style={{ marginTop: '32px' }}>
          {error && <p className="catalog-state-message catalog-state-error">{error}</p>}

          {loading ? (
            <ShimmerProductGrid count={6} />
          ) : !error && products.length === 0 ? (
            <p className="catalog-state-message">No products in this category yet.</p>
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

          <CatalogPagination pagination={pagination} page={page} onPageChange={setPage} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
