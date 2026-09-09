import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../icons';
import CatalogProductCard from '../catalog/CatalogProductCard.jsx';
import { ROUTES, searchPath } from '../../utils/navigation';
import {
  loadPublicProducts,
  loadRelatedProducts,
  loadGiftIdeas,
} from '../../services/catalogCache.js';
import '../../Pages/Collection.css';

/**
 * Cart conversion rails — related to bag contents when possible, else featured.
 * Gift ideas only when real gift sections exist.
 */
export default function RecommendedProducts({ cartItems = [] }) {
  const [products, setProducts] = useState([]);
  const [giftProducts, setGiftProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const seedProductId = useMemo(() => {
    const first = cartItems[0];
    const raw = first?.productId || first?.product?._id || first?.product;
    return raw ? String(raw) : null;
  }, [cartItems]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        let next = [];
        if (seedProductId) {
          next = await loadRelatedProducts(seedProductId, { limit: 8 });
        }
        if (!next?.length) {
          const response = await loadPublicProducts({ isFeatured: true, limit: 8 });
          next = response.data?.products || [];
        }

        const giftSections = await loadGiftIdeas({ limit: 4 }).catch(() => []);
        const gifts = [];
        const seen = new Set((next || []).map((p) => String(p._id)));
        for (const section of giftSections || []) {
          for (const product of section.products || []) {
            const id = String(product._id);
            if (seen.has(id)) continue;
            seen.add(id);
            gifts.push(product);
            if (gifts.length >= 4) break;
          }
          if (gifts.length >= 4) break;
        }

        if (isMounted) {
          setProducts(Array.isArray(next) ? next : []);
          setGiftProducts(gifts);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setProducts([]);
          setGiftProducts([]);
          setError(err.message || 'Unable to load recommendations.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [seedProductId]);

  return (
    <section className="cart-recommended">
      <div className="cart-recommended-inner">
        <div className="cart-recommended-header">
          <h2 className="cart-section-title">You may also like</h2>
          <Link to={searchPath()} className="cart-view-all">
            View All <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <p className="cart-rec-state-message">Loading recommendations…</p>
        ) : error ? (
          <p className="cart-rec-state-message cart-rec-state-error">{error}</p>
        ) : products.length === 0 ? (
          <p className="cart-rec-state-message">No recommendations available right now.</p>
        ) : (
          <div className="catalog-product-grid cart-rec-catalog-grid">
            {products.slice(0, 8).map((product) => (
              <CatalogProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {giftProducts.length > 0 ? (
          <div className="cart-gift-ideas">
            <div className="cart-recommended-header">
              <h2 className="cart-section-title">Gift ideas</h2>
              <Link to={ROUTES.collection} className="cart-view-all">
                Browse collection <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="catalog-product-grid cart-rec-catalog-grid">
              {giftProducts.map((product) => (
                <CatalogProductCard key={`gift-${product._id}`} product={product} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
