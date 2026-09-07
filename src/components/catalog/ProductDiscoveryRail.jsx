import { Link } from 'react-router-dom';
import CatalogProductCard from './CatalogProductCard.jsx';
import { ArrowRightIcon } from '../icons';
import '../../Pages/Collection.css';

/**
 * Lightweight product rail for PDP / home / order success.
 * Reuses CatalogProductCard (campaign badges via CampaignContext).
 */
export default function ProductDiscoveryRail({
  title,
  products = [],
  viewAllHref = null,
  viewAllLabel = 'View All',
  onProductClick = null,
  className = '',
  emptyHidden = true,
}) {
  if (emptyHidden && (!products || products.length === 0)) {
    return null;
  }

  return (
    <section className={`pd-related-section product-discovery-rail ${className}`.trim()}>
      <div className="pd-related-header">
        <h2 className="pd-section-title">{title}</h2>
        {viewAllHref ? (
          <Link to={viewAllHref} className="pd-view-all-link">
            {viewAllLabel} <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        ) : null}
      </div>
      <div className="catalog-product-grid product-discovery-grid">
        {products.map((product) => (
          <div
            key={product._id}
            className="product-discovery-card-wrap"
            onClick={() => onProductClick?.(product)}
            onKeyDown={undefined}
            role="presentation"
          >
            <CatalogProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
