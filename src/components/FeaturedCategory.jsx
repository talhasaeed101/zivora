import { useEffect, useState } from 'react';
import './FeaturedCategory.css';
import SafeImage from './SafeImage.jsx';
import { categoryPath } from '../utils/navigation';
import { publicCatalogApi } from '../services/api.js';
import { SectionMessage } from './ProductSectionStates.jsx';

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

  useEffect(() => {
    let isMounted = true;

    publicCatalogApi
      .getPublicCategories()
      .then((response) => {
        if (isMounted) {
          const items = response.data || [];
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

  const featuredDescription = categories[0]?.description;

  return (
    <section className="featured-section">
      <div className="featured-inner">
        <h2 className="featured-heading">Featured Category</h2>

        {error && (
          <SectionMessage
            message={error}
            className="section-state-message section-state-error featured-state-message"
          />
        )}

        <div className="featured-content-grid">
          <ul className="featured-category-list">
            {loading ? (
              <li className="featured-category-item">
                <span className="featured-category-name">Loading categories...</span>
              </li>
            ) : (
              categories.map((category) => (
                <li key={category._id || category.slug || category.name} className="featured-category-item">
                  <a href={categoryPath(category.slug)} className="featured-category-link">
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
                  </a>
                </li>
              ))
            )}
          </ul>

          <div className="featured-image-zone">
            <div className="featured-organic-image-wrap">
              <SafeImage
                src={FEATURED_IMAGE}
                alt={categories[0]?.name || 'Featured category'}
                className="featured-organic-image"
              />
            </div>

            {featuredDescription && (
              <p className="featured-category-description">{featuredDescription}</p>
            )}

            <a
              href={categoryPath(categories[0]?.slug)}
              className="featured-circular-badge-container"
              aria-label="Shop the collection"
            >
              <svg
                viewBox="0 0 100 100"
                width="120"
                height="120"
                className="featured-circular-rotating-svg"
                aria-hidden="true"
              >
                <defs>
                  <path
                    id="featuredCirclePath"
                    d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                  />
                </defs>
                <text fontSize="9.5" fontWeight="500" letterSpacing="1.5px" fill="#000">
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
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
