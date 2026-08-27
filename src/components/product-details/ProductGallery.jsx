import { useEffect, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons';
import SafeImage from '../SafeImage.jsx';
import { PLACEHOLDER_IMAGE } from '../../utils/products.js';

export default function ProductGallery({ images, title = 'Product image', productId }) {
  const imageKey = Array.isArray(images) ? images.join('|') : String(images || '');
  return (
    <ProductGalleryInner
      key={imageKey}
      images={images}
      title={title}
      productId={productId}
    />
  );
}

function ProductGalleryInner({ images, title = 'Product image', productId }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const displayImages = images?.length ? images : [PLACEHOLDER_IMAGE];
  const hasMultiple = displayImages.length > 1;

  const goTo = (index) => {
    setCurrentIndex(index);
    setFadeKey((value) => value + 1);
  };

  const prev = () => {
    goTo(currentIndex === 0 ? displayImages.length - 1 : currentIndex - 1);
  };

  const next = () => {
    goTo(currentIndex === displayImages.length - 1 ? 0 : currentIndex + 1);
  };

  useEffect(() => {
    if (!lightboxOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setLightboxOpen(false);
      }
      if (event.key === 'ArrowLeft' && hasMultiple) {
        setCurrentIndex((i) => (i === 0 ? displayImages.length - 1 : i - 1));
        setFadeKey((value) => value + 1);
      }
      if (event.key === 'ArrowRight' && hasMultiple) {
        setCurrentIndex((i) => (i === displayImages.length - 1 ? 0 : i + 1));
        setFadeKey((value) => value + 1);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxOpen, hasMultiple, displayImages.length]);

  return (
    <div className="pd-gallery">
      <div className="pd-gallery-main-wrap">
        <button
          type="button"
          className="pd-gallery-main-btn"
          onClick={() => setLightboxOpen(true)}
          aria-label={`View larger image of ${title}`}
        >
          <SafeImage
            key={fadeKey}
            src={displayImages[currentIndex]}
            alt={`${title} — image ${currentIndex + 1} of ${displayImages.length}`}
            className="pd-gallery-main-image"
            eager
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, 50vw"
            width={720}
            height={900}
          />
        </button>



        {hasMultiple && (
          <div className="pd-gallery-nav-arrows">
            <button
              type="button"
              className="pd-gallery-arrow pd-gallery-arrow-prev"
              onClick={prev}
              aria-label="Previous image"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="pd-gallery-arrow pd-gallery-arrow-next"
              onClick={next}
              aria-label="Next image"
            >
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        <span className="pd-gallery-zoom-hint" aria-hidden="true">
          <SearchIcon className="w-4 h-4" />
        </span>
      </div>

      {hasMultiple && (
        <div className="pd-gallery-dots" role="tablist" aria-label="Product images">
          {displayImages.map((_, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              role="tab"
              className={`pd-gallery-dot${index === currentIndex ? ' pd-gallery-dot-active' : ''}`}
              aria-label={`Show image ${index + 1}`}
              aria-selected={index === currentIndex}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="pd-gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} gallery`}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="pd-gallery-lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close gallery"
          >
            ×
          </button>
          {hasMultiple && (
            <button
              type="button"
              className="pd-gallery-lightbox-nav pd-gallery-lightbox-prev"
              onClick={(event) => {
                event.stopPropagation();
                prev();
              }}
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
          )}
          <div className="pd-gallery-lightbox-stage" onClick={(event) => event.stopPropagation()}>
            <SafeImage
              key={`lb-${fadeKey}`}
              src={displayImages[currentIndex]}
              alt={`${title} — image ${currentIndex + 1}`}
              className="pd-gallery-lightbox-image"
              eager
              width={1200}
              height={1500}
            />
          </div>
          {hasMultiple && (
            <button
              type="button"
              className="pd-gallery-lightbox-nav pd-gallery-lightbox-next"
              onClick={(event) => {
                event.stopPropagation();
                next();
              }}
              aria-label="Next image"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
