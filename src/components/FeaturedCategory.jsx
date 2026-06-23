import './FeaturedCategory.css';

const categories = ['Rings', 'Bracelets', 'Necklaces', 'Earrings', 'Anklets'];

export default function FeaturedCategory() {
  return (
    <section className="featured-section">
      <div className="featured-inner">
        <h2 className="featured-heading">Featured Category</h2>

        <div className="featured-content-grid">
          <ul className="featured-category-list">
            {categories.map((cat) => (
              <li key={cat} className="featured-category-item">
                <a href="#" className="featured-category-link">
                  <span className="featured-category-name">{cat}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="featured-category-arrow" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>

          <div className="featured-image-zone">
            <div className="featured-organic-image-wrap">
              <img
                src="/images/featured-category-model.png"
                alt="Woman wearing necklace holding flowers"
                className="featured-organic-image"
              />
            </div>

            <button type="button" className="featured-circular-badge-container" aria-label="Shop the collection">
              <svg viewBox="0 0 100 100" width="120" height="120" className="featured-circular-rotating-svg" aria-hidden="true">
                <defs>
                  <path id="featuredCirclePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                </defs>
                <text fontSize="8" fontWeight="600" letterSpacing="1px" fill="#fff">
                  <textPath href="#featuredCirclePath" startOffset="0%">
                    SHOP THE COLLECTION • SHOP THE COLLECTION •
                  </textPath>
                </text>
              </svg>
              <div className="featured-circular-inner-button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
