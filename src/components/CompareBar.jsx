import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCompare } from '../context/CompareContext.jsx';
import { loadProductsByIds } from '../services/catalogCache.js';
import { getProductImage } from '../utils/products.js';
import { ROUTES } from '../utils/navigation';
import SafeImage from './SafeImage.jsx';
import './CompareBar.css';

export default function CompareBar() {
  const location = useLocation();
  const { ids, count, clear, remove, max } = useCompare();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let mounted = true;
    if (!ids.length) {
      setProducts([]);
      return undefined;
    }

    loadProductsByIds(ids)
      .then((list) => {
        if (!mounted) return;
        const byId = new Map((list || []).map((p) => [String(p._id), p]));
        setProducts(ids.map((id) => byId.get(String(id))).filter(Boolean));
      })
      .catch(() => {
        if (mounted) setProducts([]);
      });

    return () => {
      mounted = false;
    };
  }, [ids]);

  if (count < 1) {
    return null;
  }

  if (location.pathname === ROUTES.compare) {
    return null;
  }

  return (
    <div className="compare-bar" role="region" aria-label="Compare products">
      <div className="compare-bar-inner">
        <div className="compare-bar-thumbs">
          {products.map((product) => (
            <div key={product._id} className="compare-bar-thumb">
              <SafeImage
                src={getProductImage(product)}
                alt=""
                className="compare-bar-thumb-image"
                width={48}
                height={48}
              />
              <button
                type="button"
                className="compare-bar-thumb-remove"
                aria-label={`Remove ${product.title || 'product'} from compare`}
                onClick={() => remove(product._id)}
              >
                ×
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, max - products.length) }).map((_, index) => (
            <div key={`empty-${index}`} className="compare-bar-thumb is-empty" aria-hidden="true" />
          ))}
        </div>

        <div className="compare-bar-meta">
          <p className="compare-bar-count">
            {count} {count === 1 ? 'product' : 'products'} selected
          </p>
          <p className="compare-bar-hint">
            {count < 2 ? 'Select at least 2 to compare' : 'Ready to compare'}
          </p>
        </div>

        <div className="compare-bar-actions">
          <button type="button" className="compare-bar-clear" onClick={clear}>
            Clear
          </button>
          <Link
            to={ROUTES.compare}
            className={`compare-bar-cta${count < 2 ? ' is-disabled' : ''}`}
            aria-disabled={count < 2}
            onClick={(event) => {
              if (count < 2) event.preventDefault();
            }}
          >
            Compare
          </Link>
        </div>
      </div>
    </div>
  );
}
