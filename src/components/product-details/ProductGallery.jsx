import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, HeartIcon } from '../icons';

export default function ProductGallery({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);

  const displayImages = images.length ? images : ['/images/stack1.png'];

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
        <img
          src={displayImages[currentIndex]}
          alt="Minimal Stacked Rings"
          className="pd-gallery-main-image"
        />
        <button
          type="button"
          className={`pd-gallery-wishlist ${wishlisted ? 'pd-gallery-wishlist-active' : ''}`}
          aria-label="Add to wishlist"
          onClick={() => setWishlisted(!wishlisted)}
        >
          <HeartIcon className="w-4 h-4" />
        </button>
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
