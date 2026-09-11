import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AccountShell from '../../components/account/AccountShell.jsx';
import Reveal from '../../components/Reveal.jsx';
import { usePrivatePageSeo } from '../../hooks/useSeo.js';
import { priceAlertApi } from '../../services/api.js';
import { ROUTES, productPath } from '../../utils/navigation';
import { formatPrice } from '../../utils/products.js';
import { ShimmerTableRows } from '../../components/Shimmer.jsx';
import { toast } from '../../context/ToastContext.jsx';
import '../Notifications.css';
import './PriceAlerts.css';

function formatOption(value) {
  const trimmed = String(value || '').trim();
  return trimmed || null;
}

export default function PriceAlerts() {
  usePrivatePageSeo({ title: 'Price Alerts', path: '/account/price-alerts' });

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await priceAlertApi.listMine({ suppressErrorToast: true });
      setAlerts(response.data?.alerts || []);
      setError('');
    } catch (err) {
      setError(
        err.message && err.message.length < 140
          ? err.message
          : 'Unable to load your price alerts.'
      );
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleCancel = async (id) => {
    if (!id || cancellingId) {
      return;
    }

    setCancellingId(id);
    try {
      await priceAlertApi.cancelMine(id);
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
      toast.success('Price alert cancelled.');
    } catch (err) {
      toast.error(err?.message || 'Unable to cancel this alert.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <AccountShell
      active="price-alerts"
      title="Price Alerts"
      description="We’ll email you when a watched item’s catalog price drops below the price you subscribed at."
      countLabel={loading ? undefined : `${alerts.length} active`}
    >
      <div className="notifications-page price-alerts-page">
        {loading ? <ShimmerTableRows count={4} /> : null}

        {!loading && error ? (
          <div className="notifications-empty" role="alert">
            <p className="notifications-empty-title">Unable to load price alerts</p>
            <p className="notifications-empty-copy">{error}</p>
            <button type="button" className="notifications-retry-btn" onClick={loadAlerts}>
              Try Again
            </button>
          </div>
        ) : null}

        {!loading && !error && alerts.length === 0 ? (
          <div className="notifications-empty">
            <p className="notifications-empty-title">No active price alerts</p>
            <p className="notifications-empty-copy">
              On any in-stock product page, choose “Notify me when price drops” to watch an item.
            </p>
            <Link to={ROUTES.collection} className="notifications-shop-btn">
              Browse Collection
            </Link>
          </div>
        ) : null}

        {!loading && !error && alerts.length > 0 ? (
          <ul className="notifications-list price-alerts-list">
            {alerts.map((alert, index) => {
              const optionBits = [formatOption(alert.ringSize), formatOption(alert.metalColor)].filter(
                Boolean
              );
              const href = alert.product?.slug ? productPath(alert.product.slug) : ROUTES.collection;

              return (
                <Reveal
                  key={alert.id}
                  as="li"
                  className="notifications-card price-alerts-card"
                  variant="fade-up"
                  delay={Math.min(index * 40, 200)}
                >
                  <div className="notifications-card-main price-alerts-card-main">
                    {alert.product?.image ? (
                      <Link to={href} className="price-alerts-thumb">
                        <img src={alert.product.image} alt="" />
                      </Link>
                    ) : null}
                    <div className="price-alerts-copy">
                      <Link to={href} className="notifications-card-title price-alerts-title">
                        {alert.product?.title || 'Product'}
                      </Link>
                      {optionBits.length > 0 ? (
                        <p className="notifications-card-meta">{optionBits.join(' · ')}</p>
                      ) : null}
                      <p className="notifications-card-meta">
                        Watching below {formatPrice(alert.subscribedPrice)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="notifications-mark-all-btn price-alerts-cancel-btn"
                    onClick={() => handleCancel(alert.id)}
                    disabled={cancellingId === alert.id}
                  >
                    {cancellingId === alert.id ? 'Cancelling…' : 'Cancel alert'}
                  </button>
                </Reveal>
              );
            })}
          </ul>
        ) : null}
      </div>
    </AccountShell>
  );
}
