import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './FeaturedCategory.css';
import SafeImage from './SafeImage.jsx';
import { categoryPath } from '../utils/navigation';
import { loadPublicCategories } from '../services/catalogCache.js';
import { SectionMessage } from './ProductSectionStates.jsx';
import Reveal from './Reveal.jsx';

const FEATURED_IMAGE = '/images/features categoruy image 1.png';

const FALLBACK_CATEGORIES = [
  { name: 'Rings', slug: 'rings' },
  { name: 'Bracelets', slug: 'bracelets' },
  { name: 'Necklaces', slug: 'necklaces' },
  { name: 'Earrings', slug: 'earrings' },
  { name: 'Anklets', slug: 'anklets' },
];

export default function FeaturedCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    let isMounted = true;

    loadPublicCategories()
      .then((items) => {
        if (isMounted) {
          setCategories(items.length > 0 ? items : FALLBACK_CATEGORIES);
          setError('');
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Unable to load categories.');
          setCategories(FALLBACK_CATEGORIES);
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
  }, []);

  const activeCategory = hoveredCategory;
  const displayImage = activeCategory?.image || FEATURED_IMAGE;
  const displayName = activeCategory?.name || 'Featured category';
  const displaySlug = activeCategory?.slug;

  return (
    <section className="featured-section">
      <div className="featured-inner">
        <Reveal as="h2" className="featured-heading" variant="fade-up">
          Featured Category
        </Reveal>

        {error && (
          <SectionMessage
            message={error}
            className="section-state-message section-state-error featured-state-message"
          />
        )}

        <div className="featured-content-grid">
          <Reveal as="ul" className="featured-category-list" variant="slide-left">
            {loading ? (
              <li className="featured-category-item">
                <span className="featured-category-name">Loading categories...</span>
              </li>
            ) : (
              categories.map((category) => (
                <li
                  key={category._id || category.slug || category.name}
                  className="featured-category-item"
                  onMouseEnter={() => setHoveredCategory(category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link to={categoryPath(category.slug)} prefetch="intent" className="featured-category-link">
                    <span className="featured-category-name">{category.name}</span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="featured-category-arrow"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 12h14M13 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </li>
              ))
            )}
          </Reveal>

          <Reveal className="featured-image-zone" variant="scale-in" delay={120}>
            <div className="featured-image-stack">
              <div className="featured-organic-image-wrap">
                <SafeImage
                  key={displayImage}
                  src={displayImage}
                  alt={displayName}
                  className="featured-organic-image"
                />
              </div>

              <Link
                to={categoryPath(displaySlug)}
                className="featured-circular-badge-container"
                aria-label="Shop the collection"
                prefetch="intent"
              >
                <svg
                  viewBox="0 0 100 100"
                  className="featured-circular-rotating-svg"
                  aria-hidden="true"
                >
                  <defs>
                    <path
                      id="featuredCirclePath"
                      d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                    />
                  </defs>
                  <text fontSize="8" fontWeight="600" letterSpacing="1px" fill="#000">
                    <textPath href="#featuredCirclePath" startOffset="0%">
                      SHOP THE COLLECTION • SHOP THE COLLECTION •
                    </textPath>
                  </text>
                </svg>
                <div className="featured-circular-inner-button">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
