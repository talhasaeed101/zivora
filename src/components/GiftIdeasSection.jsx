import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CatalogProductCard from './catalog/CatalogProductCard.jsx';
import Reveal from './Reveal.jsx';
import { loadGiftIdeas } from '../services/catalogCache.js';
import { categoryPath } from '../utils/navigation';
import { trackGiftIdeaClick } from '../utils/analytics.js';
import '../Pages/Collection.css';
import './GiftIdeasSection.css';

/**
 * Gift discovery from real categories / customizable products only.
 * Hidden entirely when the backend returns no matching sections.
 */
export default function GiftIdeasSection() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadGiftIdeas({ limit: 4 })
      .then((data) => {
        if (mounted) setSections(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (mounted) setSections([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading || sections.length === 0) {
    return null;
  }

  return (
    <Reveal as="section" className="gift-ideas-section" variant="fade-up">
      {/* <div className="gift-ideas-inner">
        <header className="gift-ideas-header">
          <h2 className="gift-ideas-title">Gift Ideas</h2>
          <p className="gift-ideas-subtitle">
            Curated from our collection for meaningful moments.
          </p>
        </header>

        {sections.map((section) => (
          <div key={section.key} className="gift-ideas-block">
            <div className="gift-ideas-block-header">
              <h3 className="gift-ideas-block-title">{section.label}</h3>
              {section.category?.slug ? (
                <Link to={categoryPath(section.category.slug)} className="gift-ideas-link">
                  Browse {section.category.name}
                </Link>
              ) : null}
            </div>
            <div className="catalog-product-grid gift-ideas-grid">
              {(section.products || []).slice(0, 4).map((product) => (
                <div
                  key={product._id}
                  className="gift-ideas-card-wrap"
                  onClick={() =>
                    trackGiftIdeaClick({ productId: product._id, sectionKey: section.key })
                  }
                  role="presentation"
                >
                  <CatalogProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div> */}
    </Reveal>
  );
}
