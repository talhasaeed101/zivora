import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductGallery from '../components/product-details/ProductGallery';
import ProductInfo from '../components/product-details/ProductInfo';
import ProductCard from '../components/product-details/ProductCard';
import ProductReviewsSection from '../components/product-details/ProductReviewsSection';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/icons';
import { ROUTES, searchPath } from '../utils/navigation';
import { publicCatalogApi } from '../services/api.js';
import {
  LEGACY_STATIC_PRODUCT,
  getCategoryName,
  PLACEHOLDER_IMAGE,
} from '../utils/products.js';
import { FALLBACK_REVIEW_SUMMARY } from '../utils/reviews.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { trackProductView } from '../utils/analytics.js';
import './ProductDetails.css';

export default function ProductDetails() {
  const { slug: routeSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(Boolean(routeSlug));
  const [error, setError] = useState('');
  const [selectedColor, setSelectedColor] = useState('gold');
  const [reviewSummary, setReviewSummary] = useState(FALLBACK_REVIEW_SUMMARY);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (!routeSlug) {
      setProduct(LEGACY_STATIC_PRODUCT);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError('');

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
  }, [routeSlug]);

  useEffect(() => {
    if (!product?.category) {
      setRelatedProducts([]);
      return;
    }

    const categoryId =
      typeof product.category === 'object' ? product.category._id : product.category;

    if (!categoryId) {
      setRelatedProducts([]);
      return;
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

  const activeProduct = product || LEGACY_STATIC_PRODUCT;
  const categoryName = getCategoryName(activeProduct.category) || 'Rings';

  usePageTitle(`${activeProduct.title || 'Product'} | Zivora`);
  const galleryImages = activeProduct.images?.length
    ? activeProduct.images
    : [PLACEHOLDER_IMAGE];

  const displayGalleryImages = galleryImages;

  const scrollSlider = (direction) => {
    if (!sliderRef.current) return;
    const cardWidth = sliderRef.current.querySelector('.pd-product-card')?.offsetWidth || 280;
    sliderRef.current.scrollBy({ left: direction * (cardWidth + 20), behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="pd-page">
        <Navbar activeLink="COLLECTION" homeHref="/?home=true" />
        <main className="pd-main">
          <p className="pd-state-message">Loading product...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="pd-page">
        <Navbar activeLink="COLLECTION" homeHref="/?home=true" />
        <main className="pd-main">
          <p className="pd-state-message pd-state-error">{error}</p>
          <a href={searchPath()} className="pd-view-all-link">Browse products</a>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="pd-page">
      <Navbar activeLink="COLLECTION" showWishlist homeHref="/?home=true" />

      <main className="pd-main">
        <nav className="pd-breadcrumb" aria-label="Breadcrumb">
          <a href={ROUTES.home}>Home</a>
          <span className="pd-breadcrumb-sep">&gt;</span>
          <a href={searchPath()}>Products</a>
          <span className="pd-breadcrumb-sep">&gt;</span>
          <a href={searchPath({ q: categoryName })}>{categoryName}</a>
          <span className="pd-breadcrumb-sep">&gt;</span>
          <span className="pd-breadcrumb-current">{activeProduct.title}</span>
        </nav>

        <section className="pd-hero-section">
          <div className="pd-hero-grid">
            <ProductGallery
              key={selectedColor}
              images={displayGalleryImages}
              title={activeProduct.title}
              productId={activeProduct._id}
            />
            <ProductInfo
              product={activeProduct}
              reviewSummary={reviewSummary}
              onColorChange={setSelectedColor}
            />
          </div>
        </section>

        <section className="pd-description-section">
          <h2 className="pd-section-title">Description</h2>
          <p className="pd-description-text">
            {activeProduct.description ||
              'Crafted with meticulous attention to detail, our jewelry embodies understated luxury with refined finishes made for everyday wear.'}
          </p>
          <ul className="pd-description-list">
            {activeProduct.material && <li>{activeProduct.material}</li>}
            {activeProduct.tags?.length > 0 ? (
              activeProduct.tags.map((tag) => <li key={tag}>{tag}</li>)
            ) : (
              <>
                <li>Premium craftsmanship</li>
                <li>Hypoallergenic materials</li>
                <li>Everyday wear comfort</li>
                <li>Handmade detailing</li>
              </>
            )}
          </ul>
          <div className="pd-features-row">
            <div className="pd-feature-item">
              <span className="pd-feature-check">✓</span>
              Guarantee for 30 days
            </div>
            <div className="pd-feature-item">
              <span className="pd-feature-check">✓</span>
              Shipped in 25 June, 2026
            </div>
            <div className="pd-feature-item">
              <span className="pd-feature-check">✓</span>
              Made to order jewelry
            </div>
          </div>
        </section>

        <section className="pd-related-section">
          <div className="pd-related-header">
            <h2 className="pd-section-title">You might also like</h2>
            <a href={searchPath()} className="pd-view-all-link">
              View All <ArrowRightIcon className="w-3.5 h-3.5" />
            </a>
          </div>
          {relatedProducts.length > 0 ? (
            <>
              <div className="pd-slider-wrap">
                <button type="button" className="pd-slider-btn pd-slider-btn-prev" onClick={() => scrollSlider(-1)} aria-label="Previous products">
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <div className="pd-slider" ref={sliderRef}>
                  {relatedProducts.map((relatedProduct) => (
                    <ProductCard key={relatedProduct._id} product={relatedProduct} />
                  ))}
                </div>
                <button type="button" className="pd-slider-btn pd-slider-btn-next" onClick={() => scrollSlider(1)} aria-label="Next products">
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="pd-related-mobile">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct._id} product={relatedProduct} variant="mobile" />
                ))}
              </div>
            </>
          ) : (
            <p className="pd-state-message">No related products available.</p>
          )}
        </section>

        <ProductReviewsSection
          productId={activeProduct._id}
          onSummaryChange={setReviewSummary}
        />
      </main>

      <Footer />
    </div>
  );
}
