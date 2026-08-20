import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AccountShell from '../components/account/AccountShell.jsx';
import Reveal from '../components/Reveal.jsx';
import SafeImage from '../components/SafeImage.jsx';
import StatusBadge from '../components/orders/StatusBadge.jsx';
import { usePrivatePageSeo } from '../hooks/useSeo.js';
import { orderApi } from '../services/api.js';
import { ROUTES, orderPath } from '../utils/navigation';
import { PLACEHOLDER_IMAGE, formatPrice } from '../utils/products.js';
import {
  formatOrderDate,
  friendlyOrderError,
  getCourierName,
  getTrackingUrl,
  hasCustomerShippingInfo,
} from '../utils/orderDisplay.js';
import '../components/orders/orderStatus.css';
import './Orders.css';

function OrdersSkeleton() {
  return (
    <div className="orders-skeleton" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your orders</span>
      {[0, 1, 2].map((index) => (
        <div key={index} className="orders-skeleton-card">
          <div className="orders-skeleton-top">
            <span className="orders-skeleton-line orders-skeleton-line-lg" />
            <span className="orders-skeleton-pill" />
          </div>
          <div className="orders-skeleton-thumbs">
            <span />
            <span />
            <span />
          </div>
          <div className="orders-skeleton-bottom">
            <span className="orders-skeleton-line" />
            <span className="orders-skeleton-line orders-skeleton-line-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderCard({ order, index }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const thumbs = items.slice(0, 4);
  const extraCount = Math.max(0, items.length - thumbs.length);
  const trackingUrl = getTrackingUrl(order);
  const showTrack = Boolean(trackingUrl);
  const shipmentStatus = order.shipping?.shipmentStatus;
  const itemLabel = order.totalItems === 1 ? '1 item' : `${order.totalItems || items.length} items`;

  return (
    <Reveal as="article" className="orders-card" variant="fade-up" delay={Math.min(index, 7) * 40}>
      <div className="orders-card-top">
        <div className="orders-card-identity">
          <p className="orders-card-number">{order.orderNumber}</p>
          <p className="orders-card-date">{formatOrderDate(order.createdAt)}</p>
        </div>
        <div className="orders-card-badges">
          <StatusBadge type="order" status={order.orderStatus} />
          <StatusBadge
            type="payment"
            status={order.paymentStatus}
            paymentMethod={order.paymentMethod}
          />
          {shipmentStatus && hasCustomerShippingInfo(order) ? (
            <StatusBadge type="shipment" status={shipmentStatus} />
          ) : null}
        </div>
      </div>

      {thumbs.length > 0 ? (
        <div className="orders-card-thumbs" aria-hidden="true">
          {thumbs.map((item, thumbIndex) => (
            <div key={`${order._id}-thumb-${thumbIndex}`} className="orders-card-thumb">
              <SafeImage
                src={item.image || PLACEHOLDER_IMAGE}
                alt=""
                className="orders-card-thumb-image"
              />
            </div>
          ))}
          {extraCount > 0 ? (
            <div className="orders-card-thumb orders-card-thumb-more">+{extraCount}</div>
          ) : null}
        </div>
      ) : null}

      <div className="orders-card-bottom">
        <div className="orders-card-meta">
          <span>{itemLabel}</span>
          <span className="orders-card-total">{formatPrice(order.total)}</span>
          {getCourierName(order) ? (
            <span className="orders-card-courier">{getCourierName(order)}</span>
          ) : null}
        </div>

        <div className="orders-card-actions">
          {showTrack ? (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="orders-card-btn orders-card-btn-secondary"
              aria-label={`Track shipment for order ${order.orderNumber} (opens in a new tab)`}
            >
              Track Shipment
            </a>
          ) : null}
          <Link
            to={orderPath(order._id)}
            className="orders-card-btn orders-card-btn-primary"
            aria-label={`View order ${order.orderNumber}`}
          >
            View Order
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

export default function Orders() {
  usePrivatePageSeo({ title: 'My Orders', path: '/orders' });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await orderApi.getOrders();
      setOrders(response.data || []);
      setStatusMessage('');
    } catch (err) {
      setOrders([]);
      setError(friendlyOrderError(err.message, 'Unable to load your orders right now.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const orderCountLabel =
    orders.length === 1 ? '1 order' : `${orders.length} orders`;

  return (
    <AccountShell
      active="orders"
      title="My Orders"
      description="Track purchases, review shipment updates, and revisit past orders."
      countLabel={!loading && !error && orders.length > 0 ? orderCountLabel : undefined}
    >
      <div className="orders-page">
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {statusMessage}
        </div>

        {loading ? <OrdersSkeleton /> : null}

        {!loading && error ? (
          <div className="orders-state orders-state-error" role="alert">
            <h2 className="orders-state-title">Unable to load orders</h2>
            <p className="orders-state-copy">{error}</p>
            <button
              type="button"
              className="orders-state-btn"
              onClick={() => {
                setStatusMessage('Refreshing orders…');
                loadOrders();
              }}
            >
              Retry
            </button>
          </div>
        ) : null}

        {!loading && !error && orders.length === 0 ? (
          <Reveal className="orders-state orders-state-empty" variant="fade-up">
            <h2 className="orders-state-title">No orders yet</h2>
            <p className="orders-state-copy">
              When you place an order, it will appear here with status and tracking updates.
            </p>
            <Link to={ROUTES.collection} className="orders-state-btn">
              Browse Collection
            </Link>
          </Reveal>
        ) : null}

        {!loading && !error && orders.length > 0 ? (
          <div className="orders-list">
            {orders.map((order, index) => (
              <OrderCard key={order._id} order={order} index={index} />
            ))}
          </div>
        ) : null}
      </div>
    </AccountShell>
  );
}
