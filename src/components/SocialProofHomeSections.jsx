import { useEffect, useState } from 'react';
import CatalogProductCard from './catalog/CatalogProductCard.jsx';
import Reveal from './Reveal.jsx';
import { socialProofApi } from '../services/api.js';
import '../Pages/Collection.css';
import './SocialProofHomeSections.css';

const SECTION_DEFS = [
  { key: 'trending', title: 'Trending', dataKey: 'trending' },
  { key: 'favorites', title: 'Customer Favorites', dataKey: 'favorites' },
  { key: 'mostGifted', title: 'Most Gifted', dataKey: 'mostGifted' },
  { key: 'highestRated', title: 'Highest Rated', dataKey: 'highestRated' },
];

/**
 * Home social-proof product groups from real MongoDB aggregates.
 * Each section renders only when it contains products.
 */
export default function SocialProofHomeSections() {
  const [datasets, setDatasets] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    socialProofApi
      .getHome()
      .then((response) => {
        if (!mounted) return;
        setDatasets(response?.data || null);
      })
      .catch(() => {
        if (mounted) setDatasets(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading || !datasets) {
    return null;
  }

  const visibleSections = SECTION_DEFS.map((section) => ({
    ...section,
    products: Array.isArray(datasets[section.dataKey]) ? datasets[section.dataKey] : [],
  })).filter((section) => section.products.length > 0);

  if (visibleSections.length === 0) {
    return null;
  }

  return (
    <Reveal as="section" className="sp-home-sections" variant="fade-up">
      <div className="sp-home-inner">
        {visibleSections.map((section) => (
          <div key={section.key} className="sp-home-block">
            <header className="sp-home-block-header">
              <h2 className="sp-home-block-title">{section.title}</h2>
            </header>
            <div className="catalog-product-grid sp-home-grid">
              {section.products.slice(0, 8).map((product) => (
                <CatalogProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
