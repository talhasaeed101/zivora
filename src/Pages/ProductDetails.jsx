import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductGallery from '../components/product-details/ProductGallery';
import ProductInfo from '../components/product-details/ProductInfo';
import ProductReviewsSection from '../components/product-details/ProductReviewsSection';
import CatalogProductCard from '../components/catalog/CatalogProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import JsonLd from '../components/seo/JsonLd.jsx';
import PageBreadcrumbs from '../components/seo/PageBreadcrumbs.jsx';
import { ArrowRightIcon } from '../components/icons';
import { ROUTES, categoryPath } from '../utils/navigation';
import { loadPublicProductBySlug, loadPublicProducts } from '../services/catalogCache.js';
import {
  LEGACY_STATIC_PRODUCT,
  getCategoryName,
  PLACEHOLDER_IMAGE,
} from '../utils/products.js';
import { useSeo } from '../hooks/useSeo.js';
import { productJsonLd } from '../utils/structuredData.js';
import { truncateText } from '../utils/seo.js';
import { trackProductView } from '../utils/analytics.js';
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

export default function ProductDetails() {
  const { slug: routeSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
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
    if (!product?.category) {
      setRelatedProducts([]);
      return undefined;
    }

    const categoryId =
      typeof product.category === 'object' ? product.category._id : product.category;

    if (!categoryId) {
      setRelatedProducts([]);
      return undefined;
    }

    let isMounted = true;

    loadPublicProducts({ category: categoryId, limit: 8 })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        const items = (response.data?.products || []).filter(
          (item) => item.slug !== product.slug
        );
        setRelatedProducts(items);
      })
      .catch(() => {
        if (isMounted) {
          setRelatedProducts([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [product]);

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

        <Reveal as="section" className="pd-details-section" variant="fade-up">
          <ProductAccordion title="Description" defaultOpen>
            <p className="pd-description-text">
              {activeProduct.description ||
                'Crafted with meticulous attention to detail, this Zivorah piece is designed for refined everyday wear.'}
            </p>
          </ProductAccordion>

          {detailItems.length > 0 && (
            <ProductAccordion title="Details">
              <ul className="pd-description-list">
                {detailItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </ProductAccordion>
          )}

          {activeProduct.isCustomizable && (
            <ProductAccordion title="Customization">
              <p className="pd-description-text">
                This piece can be customized. Use Customize Now to choose engraving and personal
                options before adding it to your bag.
              </p>
            </ProductAccordion>
          )}
        </Reveal>

        {relatedProducts.length > 0 && (
          <Reveal as="section" className="pd-related-section catalog-page" variant="fade-up">
            <div className="pd-related-header">
              <h2 className="pd-section-title">You might also like</h2>
              <Link to={ROUTES.collection} prefetch="intent" className="pd-view-all-link">
                View All <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="pd-related-grid">
              {relatedProducts.slice(0, 4).map((relatedProduct, index) => (
                <Reveal
                  key={relatedProduct._id}
                  variant="fade-up"
                  delay={Math.min(index, 3) * 50}
                  className="catalog-card-reveal"
                >
                  <CatalogProductCard product={relatedProduct} variant="desktop" />
                </Reveal>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal variant="fade-up">
          <ProductReviewsSection
            productId={activeProduct._id || activeProduct.id}
            onSummaryChange={setReviewSummary}
          />
        </Reveal>
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
