import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Reveal from '../components/Reveal.jsx';
import { orderApi, reviewApi } from '../services/api.js';
import { ROUTES } from '../utils/navigation';
import { formatPrice, PLACEHOLDER_IMAGE } from '../utils/products.js';
import { buildCustomizationSummaryLines } from '../utils/customizationSummary.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import SafeImage from '../components/SafeImage.jsx';
import ReviewModal from '../components/product-details/ReviewModal.jsx';
import OrderProgressTracker from '../components/OrderProgressTracker.jsx';
import StatusBadge from '../components/orders/StatusBadge.jsx';
import {
  buildCustomerShipmentHistory,
  formatMetalLabel,
  formatOrderDate,
  formatPaymentMethod,
  friendlyOrderError,
  getCourierName,
  getTrackingId,
  getTrackingUrl,
  hasCustomerShippingInfo,
} from '../utils/orderDisplay.js';
import { ORDER_STATUS } from '../constants/orderConstants.js';
import { useAuth } from '../context/AuthContext.jsx';
import '../components/orders/orderStatus.css';
import './OrderDetails.css';

function OrderDetailsSkeleton() {
  return (
    <div className="od-skeleton" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading order details</span>
      <div className="od-skeleton-header">
        <span className="od-skeleton-line od-skeleton-line-lg" />
        <span className="od-skeleton-line od-skeleton-line-md" />
        <div className="od-skeleton-pills">
          <span />
          <span />
        </div>
      </div>
      <div className="od-skeleton-timeline" />
      <div className="od-skeleton-items">
        {[0, 1].map((index) => (
          <div key={index} className="od-skeleton-item">
            <span className="od-skeleton-image" />
            <div className="od-skeleton-item-lines">
              <span className="od-skeleton-line od-skeleton-line-lg" />
              <span className="od-skeleton-line" />
              <span className="od-skeleton-line od-skeleton-line-sm" />
            </div>
          </div>
        ))}
      </div>
      <div className="od-skeleton-grid">
        <span className="od-skeleton-block" />
        <span className="od-skeleton-block" />
      </div>
    </div>
  );
}

export default function OrderDetails() {
  usePageTitle('Order Details | Zivorah');
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [currentProductForReview, setCurrentProductForReview] = useState(null);
  const [customerReviewForProduct, setCustomerReviewForProduct] = useState(null);
  const [customerReviews, setCustomerReviews] = useState({});
  const [savingReview, setSavingReview] = useState(false);
  const [reviewModalError, setReviewModalError] = useState('');
  const [trackingCopyFeedback, setTrackingCopyFeedback] = useState('');

  const loadProductReviews = useCallback(async (items) => {
    if (!isAuthenticated || !items?.length) {
      return;
    }

    const reviews = {};
    await Promise.all(
      items.map(async (item) => {
        try {
          const response = await reviewApi.getMyReviewForProduct(item.product);
          if (response.data) {
            reviews[item.product] = response.data;
          }
        } catch {
          // No review yet
        }
      })
    );
    setCustomerReviews(reviews);
  }, [isAuthenticated]);

  const openReviewModal = async (productId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    setCurrentProductForReview(productId);
    setReviewModalError('');
    setCustomerReviewForProduct(customerReviews[productId] || null);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (payload) => {
    setSavingReview(true);
    setReviewModalError('');

    try {
      if (customerReviewForProduct?._id) {
        await reviewApi.updateReview(customerReviewForProduct._id, payload);
      } else {
        await reviewApi.createReview(payload);
      }

      setReviewModalOpen(false);
      if (order) {
        await loadProductReviews(order.items);
      }
      setStatusMessage('Review saved.');
    } catch (err) {
      setReviewModalError(err.message || 'Failed to save review.');
    } finally {
      setSavingReview(false);
    }
  };

  const fetchOrder = useCallback(async (isRefresh = false) => {
    if (!id) {
      setError('Invalid order link.');
      setOrder(null);
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const response = await orderApi.getOrder(id);
      setOrder(response.data);
      if (response.data.orderStatus === ORDER_STATUS.DELIVERED) {
        await loadProductReviews(response.data.items);
      }
      if (isRefresh) {
        setStatusMessage('Order status refreshed.');
      }
    } catch (err) {
      setError(friendlyOrderError(err.message, 'Unable to load this order.'));
      setOrder(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, loadProductReviews]);

  useEffect(() => {
    fetchOrder();

    const handleFocus = () => {
      fetchOrder(true);
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchOrder]);

  const shipmentHistory = useMemo(
    () => (order ? buildCustomerShipmentHistory(order) : []),
    [order]
  );

  const trackingId = order ? getTrackingId(order) : '';
  const trackingUrl = order ? getTrackingUrl(order) : '';
  const courierName = order ? getCourierName(order) : '';
  const showShippingSection = order ? hasCustomerShippingInfo(order) : false;
  const isCancelled = order?.orderStatus === ORDER_STATUS.CANCELLED;
  const showTrackingPlaceholder =
    order &&
    !showShippingSection &&
    !isCancelled &&
    [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING].includes(
      order.orderStatus
    );

  const handleCopyTracking = async () => {
    if (!trackingId) {
      return;
    }

    try {
      await navigator.clipboard.writeText(trackingId);
      setTrackingCopyFeedback('Copied');
      setStatusMessage('Tracking ID copied.');
    } catch {
      setTrackingCopyFeedback('Unable to copy');
    }

    window.setTimeout(() => setTrackingCopyFeedback(''), 2000);
  };

  const address = order?.deliveryAddress;
  const needsBankVerification =
    order?.paymentMethod === 'bank_transfer' &&
    (order.paymentStatus === 'pending' ||
      order.paymentStatus === 'Pending Payment Verification');

  return (
    <div className="order-details-page">
      <Navbar homeHref={ROUTES.home} />

      <main id="main-content" className="order-details-main">
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {statusMessage}
        </div>

        {loading ? <OrderDetailsSkeleton /> : null}

        {!loading && error ? (
          <Reveal className="od-state" variant="fade-up">
            <h1 className="od-state-title">Order unavailable</h1>
            <p className="od-state-copy" role="alert">
              {error}
            </p>
            <div className="od-state-actions">
              <button type="button" className="od-btn od-btn-primary" onClick={() => fetchOrder()}>
                Retry
              </button>
              <Link to={ROUTES.orders} className="od-btn od-btn-secondary">
                Back to My Orders
              </Link>
              <Link to={ROUTES.collection} className="od-btn od-btn-ghost">
                Browse Collection
              </Link>
            </div>
          </Reveal>
        ) : null}

        {!loading && order ? (
          <div className="od-layout">
            <Reveal className="od-header" variant="fade-up">
              <nav className="od-breadcrumb" aria-label="Breadcrumb">
                <Link to={ROUTES.orders}>My Orders</Link>
                <span className="od-breadcrumb-sep" aria-hidden="true">
                  /
                </span>
                <span className="od-breadcrumb-current">{order.orderNumber}</span>
              </nav>

              <div className="od-header-row">
                <div>
                  <h1 className="od-title">Order {order.orderNumber}</h1>
                  <p className="od-date">
                    Placed on {formatOrderDate(order.createdAt, { withTime: true })}
                  </p>
                </div>

                <div className="od-header-actions">
                  <div className="od-badges">
                    <StatusBadge type="order" status={order.orderStatus} />
                    <StatusBadge
                      type="payment"
                      status={order.paymentStatus}
                      paymentMethod={order.paymentMethod}
                    />
                    {order.shipping?.shipmentStatus && showShippingSection ? (
                      <StatusBadge type="shipment" status={order.shipping.shipmentStatus} />
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="od-btn od-btn-secondary od-btn-compact"
                    onClick={() => fetchOrder(true)}
                    disabled={refreshing}
                    aria-busy={refreshing || undefined}
                  >
                    {refreshing ? 'Refreshing…' : 'Refresh'}
                  </button>
                </div>
              </div>

              <div className="od-header-links">
                <Link to={ROUTES.orders} className="od-text-link">
                  Back to My Orders
                </Link>
                <Link
                  to={ROUTES.supportTickets}
                  state={{
                    openForm: true,
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                    category: 'order_issue',
                    subject: `Help with order ${order.orderNumber}`,
                  }}
                  className="od-text-link"
                >
                  Need Help?
                </Link>
              </div>
            </Reveal>

            <Reveal className="od-panel" variant="fade-up" delay={40}>
              <h2 className="od-section-title">Order progress</h2>
              <OrderProgressTracker order={order} />
            </Reveal>

            {showShippingSection ? (
              <Reveal className="od-panel" variant="fade-up" delay={60}>
                <h2 className="od-section-title">Shipping &amp; tracking</h2>
                <div className="od-tracking-grid">
                  {courierName ? (
                    <div className="od-tracking-field">
                      <span className="od-field-label">Courier</span>
                      <strong>{courierName}</strong>
                    </div>
                  ) : null}
                  {trackingId ? (
                    <div className="od-tracking-field">
                      <span className="od-field-label">Tracking ID</span>
                      <strong className="od-tracking-id">{trackingId}</strong>
                    </div>
                  ) : null}
                  {order.shipping?.shipmentStatus ? (
                    <div className="od-tracking-field">
                      <span className="od-field-label">Shipment status</span>
                      <StatusBadge type="shipment" status={order.shipping.shipmentStatus} />
                    </div>
                  ) : null}
                  {(order.shipping?.bookedAt || order.shippedAt) ? (
                    <div className="od-tracking-field">
                      <span className="od-field-label">Shipped</span>
                      <strong>
                        {formatOrderDate(order.shipping?.bookedAt || order.shippedAt, {
                          withTime: true,
                        })}
                      </strong>
                    </div>
                  ) : null}
                  {order.shipping?.lastUpdatedAt ? (
                    <div className="od-tracking-field">
                      <span className="od-field-label">Last update</span>
                      <strong>
                        {formatOrderDate(order.shipping.lastUpdatedAt, { withTime: true })}
                      </strong>
                    </div>
                  ) : null}
                  {(order.shipping?.deliveredAt || order.deliveredAt) ? (
                    <div className="od-tracking-field">
                      <span className="od-field-label">Delivered</span>
                      <strong>
                        {formatOrderDate(order.shipping?.deliveredAt || order.deliveredAt, {
                          withTime: true,
                        })}
                      </strong>
                    </div>
                  ) : null}
                </div>

                <div className="od-tracking-actions">
                  {trackingId ? (
                    <button
                      type="button"
                      className="od-btn od-btn-secondary od-btn-compact"
                      onClick={handleCopyTracking}
                      aria-label={`Copy tracking ID ${trackingId}`}
                    >
                      {trackingCopyFeedback || 'Copy Tracking ID'}
                    </button>
                  ) : null}
                  {trackingUrl ? (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="od-btn od-btn-primary od-btn-compact"
                      aria-label="Track shipment on courier website (opens in a new tab)"
                    >
                      Track Shipment
                    </a>
                  ) : null}
                </div>

                {shipmentHistory.length > 0 ? (
                  <div className="od-shipment-history">
                    <h3 className="od-subsection-title">Shipment history</h3>
                    <ol className="od-history-list">
                      {shipmentHistory.map((entry, index) => (
                        <Reveal
                          as="li"
                          key={`${entry.status}-${entry.changedAt}-${index}`}
                          className="od-history-item"
                          variant="fade-up"
                          delay={Math.min(index, 6) * 35}
                        >
                          <div className="od-history-marker" aria-hidden="true" />
                          <div className="od-history-body">
                            <strong>{entry.label}</strong>
                            {entry.changedAt ? (
                              <time dateTime={new Date(entry.changedAt).toISOString()}>
                                {formatOrderDate(entry.changedAt, { withTime: true })}
                              </time>
                            ) : null}
                            {entry.note ? <p>{entry.note}</p> : null}
                          </div>
                        </Reveal>
                      ))}
                    </ol>
                  </div>
                ) : null}
              </Reveal>
            ) : null}

            {showTrackingPlaceholder ? (
              <Reveal className="od-panel od-panel-soft" variant="fade-up" delay={60}>
                <h2 className="od-section-title">Shipping &amp; tracking</h2>
                <p className="od-muted-copy">
                  Tracking information will appear here once your order has been dispatched.
                </p>
              </Reveal>
            ) : null}

            <div className="od-two-col">
              <Reveal className="od-panel" variant="fade-up" delay={80}>
                <h2 className="od-section-title">Delivery address</h2>
                {address ? (
                  <div className="od-address">
                    {address.name ? <p className="od-address-name">{address.name}</p> : null}
                    {address.phone ? <p>{address.phone}</p> : null}
                    {address.address ? <p>{address.address}</p> : null}
                    <p>
                      {[address.city, address.province, address.postalCode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                ) : (
                  <p className="od-muted-copy">Address unavailable for this order.</p>
                )}
              </Reveal>

              <Reveal className="od-panel" variant="fade-up" delay={100}>
                <h2 className="od-section-title">Payment</h2>
                <div className="od-payment-rows">
                  {formatPaymentMethod(order.paymentMethod) ? (
                    <div className="od-payment-row">
                      <span>Method</span>
                      <strong>{formatPaymentMethod(order.paymentMethod)}</strong>
                    </div>
                  ) : null}
                  <div className="od-payment-row">
                    <span>Status</span>
                    <StatusBadge
                      type="payment"
                      status={order.paymentStatus}
                      paymentMethod={order.paymentMethod}
                    />
                  </div>
                </div>
              </Reveal>
            </div>

            {needsBankVerification ? (
              <Reveal className="od-panel" variant="fade-up" delay={110}>
                <h2 className="od-section-title">Verify your payment</h2>
                <p className="od-muted-copy">
                  Please transfer <strong>{formatPrice(order.total)}</strong> to the account below,
                  then send your payment screenshot on WhatsApp.
                </p>
                <div className="od-bank-card">
                  <div className="od-bank-row">
                    <span>Bank</span>
                    <strong>Meezan Bank</strong>
                  </div>
                  <div className="od-bank-row">
                    <span>Account title</span>
                    <strong>TALHA SAEED</strong>
                  </div>
                  <div className="od-bank-row">
                    <span>Account number</span>
                    <strong>03380113919907</strong>
                  </div>
                  <div className="od-bank-row">
                    <span>IBAN</span>
                    <strong className="od-tracking-id">PK62MEZN0003380113919907</strong>
                  </div>
                </div>
                <a
                  href={`https://wa.me/923392215181?text=${encodeURIComponent(
                    `Hello Zivorah,\n\nI have completed my payment.\n\nOrder ID:\n${order.orderNumber}\n\nName:\n${address?.name || ''}\n\nPlease find my payment screenshot attached.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="od-whatsapp-btn"
                >
                  Send Payment Screenshot
                </a>
              </Reveal>
            ) : null}

            <Reveal className="od-panel" variant="fade-up" delay={120}>
              <h2 className="od-section-title">Items</h2>
              <ul className="od-items">
                {(order.items || []).map((item, index) => {
                  const customizationLines = item.isCustomized
                    ? buildCustomizationSummaryLines(null, item.customization).filter(
                        (line) => line?.label && line?.value != null && String(line.value).trim()
                      )
                    : [];
                  const metal = formatMetalLabel(item.metalColor);
                  const lineTotal = (item.price || 0) * (item.quantity || 0);

                  return (
                    <li key={`${item.product}-${index}`} className="od-item">
                      <div className="od-item-image-wrap">
                        <SafeImage
                          src={item.image || PLACEHOLDER_IMAGE}
                          alt={item.title || 'Order item'}
                          className="od-item-image"
                        />
                      </div>
                      <div className="od-item-body">
                        <p className="od-item-title">{item.title}</p>
                        <ul className="od-item-meta">
                          {item.ringSize ? <li>Size: {item.ringSize}</li> : null}
                          {metal ? <li>Metal: {metal}</li> : null}
                          <li>Qty: {item.quantity}</li>
                          <li>Unit: {formatPrice(item.price)}</li>
                          {item.extraPrice > 0 ? (
                            <li>Customization extras: {formatPrice(item.extraPrice)}</li>
                          ) : null}
                        </ul>
                        {customizationLines.length > 0 ? (
                          <ul className="od-item-customization">
                            {customizationLines.map((line) => (
                              <li key={`${line.label}-${line.value}`}>
                                <strong>{line.label}:</strong> {line.value}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        {order.orderStatus === ORDER_STATUS.DELIVERED ? (
                          <button
                            type="button"
                            className="od-text-btn"
                            onClick={() => openReviewModal(item.product)}
                          >
                            {customerReviews[item.product] ? 'Edit Review' : 'Write a Review'}
                          </button>
                        ) : null}
                      </div>
                      <div className="od-item-total">{formatPrice(lineTotal)}</div>
                    </li>
                  );
                })}
              </ul>
            </Reveal>

            <Reveal className="od-panel od-summary-panel" variant="fade-up" delay={140}>
              <h2 className="od-section-title">Order summary</h2>
              <div className="od-summary-rows">
                <div className="od-summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 ? (
                  <div className="od-summary-row od-summary-discount">
                    <span>Discount{order.promoCode ? ` (${order.promoCode})` : ''}</span>
                    <span>−{formatPrice(order.discount)}</span>
                  </div>
                ) : null}
                {order.taxFee > 0 ? (
                  <div className="od-summary-row">
                    <span>Tax / fee</span>
                    <span>{formatPrice(order.taxFee)}</span>
                  </div>
                ) : null}
                <div className="od-summary-row od-summary-total">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </Reveal>

            <div className="od-footer-actions">
              <Link to={ROUTES.orders} className="od-btn od-btn-secondary">
                Back to My Orders
              </Link>
              <Link to={ROUTES.collection} className="od-btn od-btn-primary">
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : null}
      </main>

      <ReviewModal
        open={reviewModalOpen}
        productId={currentProductForReview}
        review={customerReviewForProduct}
        onClose={() => {
          setReviewModalOpen(false);
          setReviewModalError('');
        }}
        onSubmit={handleSubmitReview}
        saving={savingReview}
        error={reviewModalError}
      />

      <Footer />
    </div>
  );
}
