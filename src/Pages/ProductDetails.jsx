import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductGallery from '../components/product-details/ProductGallery';
import ProductInfo from '../components/product-details/ProductInfo';
import ProductReviewsSection from '../components/product-details/ProductReviewsSection';
import ProductDiscoveryRail from '../components/catalog/ProductDiscoveryRail.jsx';
import ProductConversionBlock from '../components/product-details/ProductConversionBlock.jsx';

import Reveal from '../components/Reveal.jsx';
import JsonLd from '../components/seo/JsonLd.jsx';
import PageBreadcrumbs from '../components/seo/PageBreadcrumbs.jsx';
import { ROUTES, categoryPath } from '../utils/navigation';
import {
  loadPublicProductBySlug,
  loadRelatedProducts,
  loadProductsByIds,
} from '../services/catalogCache.js';
import {
  LEGACY_STATIC_PRODUCT,
  getCategoryName,
  PLACEHOLDER_IMAGE,
} from '../utils/products.js';
import { useSeo } from '../hooks/useSeo.js';
import { productJsonLd } from '../utils/structuredData.js';
import { truncateText } from '../utils/seo.js';
import {
  trackProductView,
  trackRelatedProductClick,
  trackRecentlyViewedClick,
} from '../utils/analytics.js';
import {
  recordRecentlyViewed,
  getRecentlyViewedIds,
} from '../utils/recentlyViewed.js';
import './Collection.css';
import './ProductDetails.css';

function ProductDetailsSkeleton() {
  return (
    <div className="pd-skeleton" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading product</span>
      <div className="pd-skeleton-breadcrumb" />
      <div className="pd-hero-grid">
        <div className="pd-skeleton-gallery">
          <div className="pd-skeleton-main" />
          <div className="pd-skeleton-thumbs">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="pd-skeleton-info">
          <div className="pd-skeleton-line pd-skeleton-line-sm" />
          <div className="pd-skeleton-line pd-skeleton-line-lg" />
          <div className="pd-skeleton-line" />
          <div className="pd-skeleton-line pd-skeleton-line-md" />
          <div className="pd-skeleton-block" />
          <div className="pd-skeleton-block" />
          <div className="pd-skeleton-actions">
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductAccordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`pd-accordion${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="pd-accordion-trigger"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{title}</span>
        <span className="pd-accordion-icon" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>
      <div className="pd-accordion-panel" hidden={!open}>
        {children}
      </div>
    </div>
  );
}

const DESCRIPTION_PREVIEW_LENGTH = 220;

function ProductDescription({ text }) {
  const [expanded, setExpanded] = useState(false);
  const fullText = text?.trim() || 'No description available for this product.';
  const needsToggle = fullText.length > DESCRIPTION_PREVIEW_LENGTH;
  const displayText =
    !needsToggle || expanded
      ? fullText
      : `${fullText.slice(0, DESCRIPTION_PREVIEW_LENGTH).replace(/\s+\S*$/, '').trimEnd()}…`;

  return (
    <div className="pd-description-body">
      <p className="pd-description-text">{displayText}</p>
      {needsToggle ? (
        <button
          type="button"
          className="pd-description-toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'See less' : 'See more'}
        </button>
      ) : null}
    </div>
  );
}

export default function ProductDetails() {
  const { slug: routeSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);
  const [loading, setLoading] = useState(Boolean(routeSlug));
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [selectedColor, setSelectedColor] = useState('gold');
  const [reviewSummary, setReviewSummary] = useState(null);

  useEffect(() => {
    if (!routeSlug) {
      setProduct(LEGACY_STATIC_PRODUCT);
      setLoading(false);
      return undefined;
    }

    let isMounted = true;
    setLoading(true);
    setError('');
    setReviewSummary(null);

    loadPublicProductBySlug(routeSlug)
      .then((data) => {
        if (!isMounted) {
          return;
        }

        if (!data) {
          setError('Unable to load product.');
          setProduct(null);
          return;
        }

        setProduct(data);
        setError('');
        trackProductView(data);
        if (data._id) {
          recordRecentlyViewed(data._id);
        }
      })
      .catch((err) => {
        if (!isMounted) {
          return;
        }

        setError(err.message || 'Unable to load product.');
        setProduct(null);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [routeSlug, reloadToken]);

  useEffect(() => {
    if (!product?._id) {
      setRelatedProducts([]);
      return undefined;
    }

    let isMounted = true;

    loadRelatedProducts(product._id, { limit: 8 })
      .then((items) => {
        if (!isMounted) return;
        setRelatedProducts(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (isMounted) setRelatedProducts([]);
      });

    return () => {
      isMounted = false;
    };
  }, [product?._id]);

  useEffect(() => {
    if (!product?._id) {
      setRecentlyViewedProducts([]);
      return undefined;
    }

    const ids = getRecentlyViewedIds({ excludeId: product._id });
    if (!ids.length) {
      setRecentlyViewedProducts([]);
      return undefined;
    }

    let isMounted = true;

    loadProductsByIds(ids)
      .then((items) => {
        if (!isMounted) return;
        // Preserve newest-first order from localStorage; drop inactive/missing
        const byId = new Map((items || []).map((item) => [String(item._id), item]));
        setRecentlyViewedProducts(ids.map((id) => byId.get(String(id))).filter(Boolean));
      })
      .catch(() => {
        if (isMounted) setRecentlyViewedProducts([]);
      });

    return () => {
      isMounted = false;
    };
  }, [product?._id]);

  const activeProduct = product;
  const categoryName = getCategoryName(activeProduct?.category);
  const categorySlug =
    typeof activeProduct?.category === 'object' ? activeProduct.category?.slug : null;
  const productPathValue = activeProduct?.slug ? `/product/${activeProduct.slug}` : '/product';
  const productImage = Array.isArray(activeProduct?.images) ? activeProduct.images[0] : null;
  const ratingCount = Number(reviewSummary?.reviewCount ?? activeProduct?.reviewCount) || 0;
  const ratingValue = Number(reviewSummary?.averageRating ?? activeProduct?.averageRating) || 0;

  useSeo({
    title: activeProduct?.title || (loading ? 'Product' : 'Product'),
    description: truncateText(
      activeProduct?.shortDescription ||
        activeProduct?.description ||
        (activeProduct?.title
          ? `${activeProduct.title} from Zivorah — premium jewelry.`
          : 'View this Zivorah jewelry piece.'),
      160
    ),
    path: productPathValue,
    robots: activeProduct?.slug ? 'index, follow' : 'noindex, follow',
    type: 'product',
    image: productImage,
    prefetch: ['/collection'],
  });

  const productCrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Jewelry', path: '/collection' },
    ...(categoryName
      ? [{ name: categoryName, path: categorySlug ? categoryPath(categorySlug) : '/collection' }]
      : []),
    ...(activeProduct?.title ? [{ name: activeProduct.title }] : []),
  ];

  const galleryImages = activeProduct?.images?.length
    ? activeProduct.images
    : activeProduct
      ? [PLACEHOLDER_IMAGE]
      : [];

  if (loading) {
    return (
      <div className="pd-page">
        <Navbar activeLink="COLLECTION" homeHref="/?home=true" />
        <main id="main-content" className="pd-main">
          <ProductDetailsSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !product) {
    const isNotFound = /not found/i.test(error);
    return (
      <div className="pd-page">
        <Navbar activeLink="COLLECTION" homeHref="/?home=true" />
        <main id="main-content" className="pd-main">
          <div className="pd-state-panel" role="alert">
            <h1 className="pd-state-title">
              {isNotFound ? 'Product not found' : 'We couldn’t load this product'}
            </h1>
            <p className="pd-state-copy">
              {isNotFound
                ? 'This piece may have been moved or is no longer available.'
                : 'Please try again in a moment.'}
            </p>
            <div className="pd-state-actions">
              {!isNotFound && (
                <button
                  type="button"
                  className="pd-btn pd-btn-primary"
                  onClick={() => setReloadToken((value) => value + 1)}
                >
                  Retry
                </button>
              )}
              <Link to={ROUTES.collection} className="pd-btn pd-btn-secondary">
                Browse Collection
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!activeProduct) {
    return (
      <div className="pd-page">
        <Navbar activeLink="COLLECTION" homeHref="/?home=true" />
        <main id="main-content" className="pd-main">
          <div className="pd-state-panel">
            <h1 className="pd-state-title">Product unavailable</h1>
            <p className="pd-state-copy">This piece could not be displayed.</p>
            <div className="pd-state-actions">
              <Link to={ROUTES.collection} className="pd-btn pd-btn-primary">
                Browse Collection
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const detailItems = [
    activeProduct.material,
    ...(activeProduct.tags || []),
  ].filter(Boolean);

  return (
    <div className="pd-page">
      <Navbar activeLink="COLLECTION" homeHref="/?home=true" />

      <main id="main-content" className="pd-main">
        <Reveal as="div" className="pd-breadcrumb" variant="fade-up">
          <PageBreadcrumbs items={productCrumbs} />
        </Reveal>

        <section className="pd-hero-section">
          <div className="pd-hero-grid">
            <Reveal variant="fade-up" className="pd-gallery-reveal">
              <ProductGallery
                key={`${activeProduct._id || activeProduct.slug}-${selectedColor}`}
                images={galleryImages}
                title={activeProduct.title}
                productId={activeProduct._id}
              />
            </Reveal>
            <Reveal variant="fade-up" delay={80} className="pd-info-reveal">
              <ProductInfo
                product={activeProduct}
                reviewSummary={reviewSummary}
                onColorChange={setSelectedColor}
              />
            </Reveal>
          </div>
        </section>

        <Reveal as="section" className="pd-description-section" variant="fade-up">
          <h2 className="pd-section-title" style={{ fontSize: '24px', marginBottom: '16px' }}>Description</h2>
          <ProductDescription
            key={activeProduct._id || activeProduct.slug}
            text={activeProduct.description}
          />
          
          {detailItems.length > 0 && (
            <ul className="pd-description-list" style={{ color: '#767676' }}>
              {detailItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}

          <div className="pd-features-row">
            {activeProduct.guarantee && (
              <div className="pd-feature-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Guarantee for <span style={{ fontWeight: 600, color: '#000' }}>{activeProduct.guarantee}</span></span>
              </div>
            )}
            {activeProduct.shippingDate && (
              <div className="pd-feature-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Shipped on <span style={{ fontWeight: 600, color: '#000' }}>{activeProduct.shippingDate}</span></span>
              </div>
            )}
            {activeProduct.isMadeToOrder && (
              <div className="pd-feature-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Made to order jewelry</span>
              </div>
            )}
          </div>
        </Reveal>

        <Reveal as="div" variant="fade-up">
          <ProductConversionBlock product={activeProduct} />
        </Reveal>

        <Reveal variant="fade-up">
          <ProductReviewsSection
            productId={activeProduct._id || activeProduct.id}
            onSummaryChange={setReviewSummary}
          />
        </Reveal>

        {relatedProducts.length > 0 && (
          <Reveal as="div" variant="fade-up">
            <ProductDiscoveryRail
              title="You May Also Like"
              products={relatedProducts.slice(0, 8)}
              viewAllHref={ROUTES.collection}
              onProductClick={(relatedProduct) =>
                trackRelatedProductClick({
                  productId: relatedProduct._id,
                  sourceProductId: activeProduct._id,
                })
              }
            />
          </Reveal>
        )}

        {recentlyViewedProducts.length > 0 && (
          <Reveal as="div" variant="fade-up">
            <ProductDiscoveryRail
              title="Recently Viewed"
              products={recentlyViewedProducts}
              onProductClick={(viewedProduct) =>
                trackRecentlyViewedClick({ productId: viewedProduct._id })
              }
            />
          </Reveal>
        )}
      </main>

      <Footer />
      <JsonLd
        data={productJsonLd(
          {
            ...activeProduct,
            reviewCount: ratingCount,
            averageRating: ratingValue,
          },
          { url: productPathValue }
        )}
      />
    </div>
  );
}
