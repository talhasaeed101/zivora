import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Reveal from '../components/Reveal.jsx';
import SafeImage from '../components/SafeImage.jsx';
import { useCompare } from '../context/CompareContext.jsx';
import { loadProductsByIds } from '../services/catalogCache.js';
import { buildCompareRows } from '../utils/compareStorage.js';
import { formatPrice, getProductImage } from '../utils/products.js';
import { productPath, ROUTES } from '../utils/navigation';
import { useSeo } from '../hooks/useSEO.js';
import './Compare.css';

export default function Compare() {
  const { ids, count, remove, clear, max } = useCompare();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useSeo({
    title: 'Compare Products',
    description: 'Compare Zivorah jewelry side by side.',
    path: ROUTES.compare,
    robots: 'noindex, follow',
  });

  useEffect(() => {
    let mounted = true;

    if (!ids.length) {
      setProducts([]);
      setLoading(false);
      setError('');
      return undefined;
    }

    setLoading(true);
    loadProductsByIds(ids)
      .then((list) => {
        if (!mounted) return;
        const byId = new Map((list || []).map((p) => [String(p._id), p]));
        const ordered = ids.map((id) => byId.get(String(id))).filter(Boolean);
        setProducts(ordered);
        setError('');
      })
      .catch((err) => {
        if (!mounted) return;
        setProducts([]);
        setError(err?.message || 'Unable to load compared products.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [ids]);

  const rows = useMemo(() => buildCompareRows(products), [products]);
  const canCompare = products.length >= 2;

  return (
    <div className="compare-page">
      <Navbar homeHref={ROUTES.home} />
      <main id="main-content" className="compare-main">
        <Reveal className="compare-container" variant="fade-up">
          <header className="compare-header">
            <div>
              <p className="compare-breadcrumb">
                <Link to={ROUTES.home}>Home</Link>
                <span aria-hidden="true"> / </span>
                <span>Compare</span>
              </p>
              <h1 className="compare-title">Compare</h1>
              <p className="compare-subtitle">
                Compare up to {max} pieces side by side. Guest selections are saved on this device.
              </p>
            </div>
            {count > 0 ? (
              <button type="button" className="compare-clear-all" onClick={clear}>
                Clear all
              </button>
            ) : null}
          </header>

          {loading ? (
            <p className="compare-state">Loading compared products…</p>
          ) : error ? (
            <p className="compare-state compare-state-error" role="alert">
              {error}
            </p>
          ) : count === 0 ? (
            <div className="compare-empty">
              <h2 className="compare-empty-title">No products to compare</h2>
              <p className="compare-empty-copy">
                Add products from the collection or a product page using Compare, then return here.
              </p>
              <Link to={ROUTES.collection} className="compare-empty-cta">
                Browse collection
              </Link>
            </div>
          ) : !canCompare ? (
            <div className="compare-empty">
              <h2 className="compare-empty-title">Select at least 2 products</h2>
              <p className="compare-empty-copy">
                You have {count} product selected. Add one more to start comparing.
              </p>
              <div className="compare-single-preview">
                {products.map((product) => (
                  <article key={product._id} className="compare-column">
                    <button
                      type="button"
                      className="compare-remove"
                      onClick={() => remove(product._id)}
                      aria-label={`Remove ${product.title || 'product'}`}
                    >
                      Remove
                    </button>
                    <Link to={productPath(product.slug)} className="compare-image-link">
                      <SafeImage
                        src={getProductImage(product)}
                        alt={product.title || 'Product'}
                        className="compare-image"
                        width={320}
                        height={400}
                      />
                    </Link>
                    <h2 className="compare-product-name">
                      <Link to={productPath(product.slug)}>{product.title}</Link>
                    </h2>
                    <p className="compare-product-price">{formatPrice(product.price)}</p>
                  </article>
                ))}
              </div>
              <Link to={ROUTES.collection} className="compare-empty-cta">
                Add another product
              </Link>
            </div>
          ) : (
            <div className="compare-table-wrap">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th scope="col" className="compare-attr-col">
                      Attribute
                    </th>
                    {products.map((product) => (
                      <th scope="col" key={product._id} className="compare-product-col">
                        <div className="compare-column">
                          <button
                            type="button"
                            className="compare-remove"
                            onClick={() => remove(product._id)}
                            aria-label={`Remove ${product.title || 'product'}`}
                          >
                            Remove
                          </button>
                          <Link to={productPath(product.slug)} className="compare-image-link">
                            <SafeImage
                              src={getProductImage(product)}
                              alt={product.title || 'Product'}
                              className="compare-image"
                              width={320}
                              height={400}
                            />
                          </Link>
                          <h2 className="compare-product-name">
                            <Link to={productPath(product.slug)}>{product.title}</Link>
                          </h2>
                          <p className="compare-product-price">{formatPrice(product.price)}</p>
                          {product.oldPrice && product.oldPrice > product.price ? (
                            <p className="compare-product-price-old">
                              {formatPrice(product.oldPrice)}
                            </p>
                          ) : null}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.key}>
                      <th scope="row" className="compare-attr-label">
                        {row.label}
                      </th>
                      {row.values.map((value, index) => (
                        <td key={`${row.key}-${products[index]?._id || index}`}>
                          {row.type === 'price' && value != null
                            ? formatPrice(value)
                            : value || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
