import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductGallery from '../components/product-details/ProductGallery';
import ProductInfo from '../components/product-details/ProductInfo';
import ProductReviewsSection from '../components/product-details/ProductReviewsSection';
import CatalogProductCard from '../components/catalog/CatalogProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import { ArrowRightIcon } from '../components/icons';
import { ROUTES, categoryPath, searchPath } from '../utils/navigation';
import { publicCatalogApi } from '../services/api.js';
import {
  LEGACY_STATIC_PRODUCT,
  getCategoryName,
  PLACEHOLDER_IMAGE,
} from '../utils/products.js';
import { useSEO } from '../hooks/useSEO.js';
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

    publicCatalogApi
      .getPublicProductBySlug(routeSlug)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setProduct(response.data);
        setError('');
        trackProductView(response.data);
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

    publicCatalogApi
      .getPublicProducts({ category: categoryId, limit: 8 })
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

  const productUrl = `https://zivorah.store${productPath(activeProduct?.slug)}`;
  
  useSEO({
    title: `${activeProduct?.title || 'Product'} | Zivorah Pakistan`,
    description: activeProduct?.description || `Buy ${activeProduct?.title} at Zivorah Pakistan. Premium quality jewelry.`,
    url: productUrl,
    image: activeProduct?.images?.[0] || 'https://zivorah.store/favicon.ico',
    type: 'product',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Product',
          name: activeProduct?.title,
          image: activeProduct?.images || [],
          description: activeProduct?.description,
          sku: activeProduct?.sku || activeProduct?._id,
          brand: {
            '@type': 'Brand',
            name: 'Zivorah',
          },
          offers: {
            '@type': 'Offer',
            url: productUrl,
            priceCurrency: 'PKR',
            price: activeProduct?.price,
            availability: (activeProduct?.stock > 0 || activeProduct?.stock === undefined) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition'
          }
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://zivorah.store/'
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Collection',
              item: 'https://zivorah.store/collection'
            },
            ...(categoryName ? [{
              '@type': 'ListItem',
              position: 3,
              name: categoryName,
              item: `https://zivorah.store${categorySlug ? categoryPath(categorySlug) : searchPath({ q: categoryName })}`
            }] : []),
            {
              '@type': 'ListItem',
              position: categoryName ? 4 : 3,
              name: activeProduct?.title,
              item: productUrl
            }
          ]
        }
      ]
    }
  });

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
              <a href={ROUTES.collection} className="pd-btn pd-btn-secondary">
                Browse Collection
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!activeProduct) {
    return null;
  }

  const detailItems = [
    activeProduct.material,
    ...(activeProduct.tags || []),
  ].filter(Boolean);

  return (
    <div className="pd-page">
      <Navbar activeLink="COLLECTION" homeHref="/?home=true" />

      <main id="main-content" className="pd-main">
        <Reveal as="nav" className="pd-breadcrumb" variant="fade-up" aria-label="Breadcrumb">
          <a href={ROUTES.home}>Home</a>
          <span className="pd-breadcrumb-sep" aria-hidden="true">
            /
          </span>
          <a href={ROUTES.collection}>Collection</a>
          {categoryName && (
            <>
              <span className="pd-breadcrumb-sep" aria-hidden="true">
                /
              </span>
              <a href={categorySlug ? categoryPath(categorySlug) : searchPath({ q: categoryName })}>
                {categoryName}
              </a>
            </>
          )}
          <span className="pd-breadcrumb-sep" aria-hidden="true">
            /
          </span>
          <span className="pd-breadcrumb-current">{activeProduct.title}</span>
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
              <a href={ROUTES.collection} className="pd-view-all-link">
                View All <ArrowRightIcon className="w-3.5 h-3.5" />
              </a>
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
    </div>
  );
}
