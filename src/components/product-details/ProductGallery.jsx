import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons';
import WishlistButton from '../WishlistButton.jsx';
import SafeImage from '../SafeImage.jsx';
import { PLACEHOLDER_IMAGE } from '../../utils/products.js';

export default function ProductGallery({ images, title = 'Product image', productId }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayImages = images?.length ? images : [PLACEHOLDER_IMAGE];

  const prev = () => {
    setCurrentIndex((i) => (i === 0 ? displayImages.length - 1 : i - 1));
  };

  const next = () => {
    setCurrentIndex((i) => (i === displayImages.length - 1 ? 0 : i + 1));
  };

  const goTo = (index) => setCurrentIndex(index);

  return (
    <div className="pd-gallery">
      <div className="pd-gallery-main-wrap">
        <SafeImage
          src={displayImages[currentIndex]}
          alt={title}
          className="pd-gallery-main-image"
        />
        <WishlistButton
          productId={productId}
          className="pd-gallery-wishlist"
          activeClassName="pd-gallery-wishlist-active"
          stopPropagation={false}
        />
      </div>

      <div className="pd-gallery-nav">
        <button type="button" className="pd-gallery-nav-btn" onClick={prev} aria-label="Previous image">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <div className="pd-gallery-dots">
          {displayImages.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`pd-gallery-dot ${index === currentIndex ? 'pd-gallery-dot-active' : ''}`}
              onClick={() => goTo(index)}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
        <button type="button" className="pd-gallery-nav-btn" onClick={next} aria-label="Next image">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
