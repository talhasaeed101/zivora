import { Link } from 'react-router-dom';
import JsonLd from './JsonLd.jsx';
import { absoluteUrl } from '../../utils/seo.js';
import './PageBreadcrumbs.css';

function buildBreadcrumbJsonLd(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path ? absoluteUrl(item.path) : undefined,
    })),
  };
}

export default function PageBreadcrumbs({ items = [], className = '' }) {
  if (!items.length) {
    return null;
  }

  return (
    <>
      <nav
        className={`page-breadcrumbs${className ? ` ${className}` : ''}`}
        aria-label="Breadcrumb"
      >
        <ol className="page-breadcrumbs-list">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.name}-${index}`} className="page-breadcrumbs-item">
                {index > 0 ? (
                  <span className="page-breadcrumbs-sep" aria-hidden="true">
                    /
                  </span>
                ) : null}
                {isLast || !item.path ? (
                  <span className="page-breadcrumbs-current" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link to={item.path}>{item.name}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={buildBreadcrumbJsonLd(items)} />
    </>
  );
}
