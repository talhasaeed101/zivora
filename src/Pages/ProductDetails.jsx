import { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductGallery from '../components/product-details/ProductGallery';
import ProductInfo from '../components/product-details/ProductInfo';
import ProductCard from '../components/product-details/ProductCard';
import RatingSummary from '../components/product-details/RatingSummary';
import ReviewCard from '../components/product-details/ReviewCard';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/icons';
import { ROUTES } from '../utils/navigation';
import './ProductDetails.css';

const GALLERY_IMAGES = [
  '/images/stack1.png',
  '/images/stack2.png',
  '/images/stack3.png',
  '/images/stack4.png',
  '/images/stack5.png',
];

const COLOR_IMAGES = {
  silver: '/images/stack2.png',
  gold: '/images/stack1.png',
  'rose-gold': '/images/stack3.png',
};

const RELATED_PRODUCTS = [
  { id: 1, image: '/images/stack1.png', name: 'Minimal stacked rings', price: 'Rs. 1,999', originalPrice: 'Rs. 2,499', showSale: true },
  { id: 2, image: '/images/stack2.png', name: 'Minimal stacked rings', price: 'Rs. 1,999', originalPrice: 'Rs. 2,499', showSale: false },
  { id: 3, image: '/images/stack3.png', name: 'Minimal stacked rings', price: 'Rs. 1,999', originalPrice: 'Rs. 2,499', showSale: true },
  { id: 4, image: '/images/stack4.png', name: 'Minimal stacked rings', price: 'Rs. 1,999', originalPrice: 'Rs. 2,499', showSale: true },
  { id: 5, image: '/images/stack5.png', name: 'Minimal stacked rings', price: 'Rs. 1,999', originalPrice: 'Rs. 2,499', showSale: false },
  { id: 6, image: '/images/stack1.png', name: 'Minimal stacked rings', price: 'Rs. 1,999', originalPrice: 'Rs. 2,499', showSale: true },
];

const REVIEWS = [
  { id: 1, name: 'Sarah Mitchell', avatar: '/images/testimonial-sarah-mitchell.png', rating: 5, text: 'Absolutely stunning rings! The quality exceeded my expectations. They stack beautifully and feel comfortable for all-day wear.', date: '12 Jun, 2026', dateISO: '2026-06-12', likes: 24, dislikes: 1 },
  { id: 2, name: 'Jenny Wilson', avatar: '/images/testimonial-jenny-wilson.png', rating: 4, text: 'Beautiful minimalist design. The gold finish is elegant and pairs well with other jewelry. Would definitely recommend to friends.', date: '10 Jun, 2026', dateISO: '2026-06-10', likes: 18, dislikes: 0 },
  { id: 3, name: 'Emily Chen', avatar: '/images/testimonial-emily-chen.png', rating: 5, text: 'These rings are my new everyday favorites. Lightweight, hypoallergenic, and the craftsmanship is impeccable.', date: '8 Jun, 2026', dateISO: '2026-06-08', likes: 31, dislikes: 2 },
  { id: 4, name: 'Olivia Parker', avatar: '/images/testimonial-jenny-wilson.png', rating: 4, text: 'Love the subtle elegance. Perfect for stacking or wearing alone. Shipping was fast and packaging felt very premium.', date: '5 Jun, 2026', dateISO: '2026-06-05', likes: 12, dislikes: 0 },
  { id: 5, name: 'Mia Thompson', avatar: '/images/testimonial-sarah-mitchell.png', rating: 5, text: 'Received so many compliments! The rose gold option is gorgeous. True to size and very comfortable.', date: '2 Jun, 2026', dateISO: '2026-06-02', likes: 27, dislikes: 1 },
  { id: 6, name: 'Ava Rodriguez', avatar: '/images/testimonial-emily-chen.png', rating: 4, text: 'Great value for handmade jewelry. The silver finish is sleek and modern. Will be ordering more from Zivora.', date: '28 May, 2026', dateISO: '2026-05-28', likes: 15, dislikes: 0 },
  { id: 7, name: 'Isabella Moore', avatar: '/images/testimonial-jenny-wilson.png', rating: 5, text: 'Exceeded expectations in every way. The rings feel substantial without being heavy. Perfect gift for my sister.', date: '25 May, 2026', dateISO: '2026-05-25', likes: 22, dislikes: 0 },
  { id: 8, name: 'Sophia Lee', avatar: '/images/testimonial-sarah-mitchell.png', rating: 4, text: 'Elegant and versatile. I wear them to work and on weekends. The quality is consistent with luxury brands.', date: '20 May, 2026', dateISO: '2026-05-20', likes: 19, dislikes: 1 },
];

export default function ProductDetails() {
  const [selectedColor, setSelectedColor] = useState('gold');
  const [currentPage, setCurrentPage] = useState(1);
  const sliderRef = useRef(null);

  const galleryImages = GALLERY_IMAGES.map((img) =>
    selectedColor === 'gold' ? img : COLOR_IMAGES[selectedColor] || img
  );

  const scrollSlider = (direction) => {
    if (!sliderRef.current) return;
    const cardWidth = sliderRef.current.querySelector('.pd-product-card')?.offsetWidth || 280;
    sliderRef.current.scrollBy({ left: direction * (cardWidth + 20), behavior: 'smooth' });
  };

  return (
    <div className="pd-page">
      <Navbar activeLink="COLLECTION" showWishlist homeHref="/?home=true" />

      <main className="pd-main">
        <nav className="pd-breadcrumb" aria-label="Breadcrumb">
          <a href={ROUTES.home}>Home</a>
          <span className="pd-breadcrumb-sep">&gt;</span>
          <a href={ROUTES.search}>Products</a>
          <span className="pd-breadcrumb-sep">&gt;</span>
          <a href={ROUTES.search}>Rings</a>
          <span className="pd-breadcrumb-sep">&gt;</span>
          <span className="pd-breadcrumb-current">Minimal stacked rings</span>
        </nav>

        <section className="pd-hero-section">
          <div className="pd-hero-grid">
            <ProductGallery key={selectedColor} images={galleryImages} />
            <ProductInfo onColorChange={setSelectedColor} />
          </div>
        </section>

        <section className="pd-description-section">
          <h2 className="pd-section-title">Description</h2>
          <p className="pd-description-text">
            Crafted with meticulous attention to detail, our Minimal Stacked Rings embody the essence
            of understated luxury. Each ring is individually handmade using premium materials, designed
            to be worn alone or layered for a personalized look. The sleek silhouette and refined finish
            make these rings a timeless addition to any jewelry collection.
          </p>
          <ul className="pd-description-list">
            <li>Premium craftsmanship</li>
            <li>Hypoallergenic materials</li>
            <li>Everyday wear comfort</li>
            <li>Handmade detailing</li>
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
            <a href={ROUTES.search} className="pd-view-all-link">
              View All <ArrowRightIcon className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="pd-slider-wrap">
            <button type="button" className="pd-slider-btn pd-slider-btn-prev" onClick={() => scrollSlider(-1)} aria-label="Previous products">
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div className="pd-slider" ref={sliderRef}>
              {RELATED_PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <button type="button" className="pd-slider-btn pd-slider-btn-next" onClick={() => scrollSlider(1)} aria-label="Next products">
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="pd-related-mobile">
            {RELATED_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} variant="mobile" />
            ))}
          </div>
        </section>

        <section className="pd-reviews-section">
          <h2 className="pd-section-title">Customer Reviews</h2>
          <RatingSummary />
          <div className="pd-reviews-grid">
            {REVIEWS.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>

        <nav className="pd-pagination" aria-label="Review pagination">
          <button type="button" className="pd-page-btn pd-page-btn-prev" disabled={currentPage === 1}>
            &lt; Previous
          </button>
          <div className="pd-page-numbers">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                type="button"
                className={`pd-page-num ${currentPage === num ? 'pd-page-num-active' : ''}`}
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}
            <span className="pd-page-ellipsis">...</span>
            <button type="button" className="pd-page-num" onClick={() => setCurrentPage(10)}>10</button>
          </div>
          <button type="button" className="pd-page-btn pd-page-btn-next" onClick={() => setCurrentPage((p) => Math.min(10, p + 1))}>
            Next &gt;
          </button>
        </nav>
      </main>

      <Footer />
    </div>
  );
}
