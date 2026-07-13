import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { orderApi, reviewApi } from '../services/api.js';
import { ROUTES, productPath } from '../utils/navigation';
import { formatPrice } from '../utils/products.js';
import { buildCustomizationSummaryLines } from '../utils/customizationSummary.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { ShimmerOrderDetails } from '../components/Shimmer.jsx';
import SafeImage from '../components/SafeImage.jsx';
import { PLACEHOLDER_IMAGE } from '../utils/products.js';
import ReviewModal from '../components/product-details/ReviewModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import './OrderDetails.css';

function formatOrderDate(value) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPaymentMethod(method) {
  if (method === 'cod') {
    return 'Cash on Delivery';
  }

  if (method === 'online') {
    return 'Online Payment';
  }

  if (method === 'bank_transfer') {
    return 'Direct Bank Transfer (Meezan Bank)';
  }

  return method || '—';
}

function getPaymentStatusLabel(status, paymentMethod) {
  if (status === 'Pending Payment Verification') {
    return 'Pending Verification';
  }

  if (status === 'pending' && paymentMethod === 'bank_transfer') {
    return 'Pending Verification';
  }

  if (status === 'paid') {
    return 'Paid';
  }

  if (status === 'pending') {
    return 'Pending';
  }

  if (status === 'failed') {
    return 'Failed';
  }

  return status;
}

export default function OrderDetails() {
  usePageTitle('Order Details | Zivorah');
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Review state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [currentProductForReview, setCurrentProductForReview] = useState(null);
  const [customerReviewForProduct, setCustomerReviewForProduct] = useState(null);
  const [customerReviews, setCustomerReviews] = useState({}); // key: productId, value: review
  const [savingReview, setSavingReview] = useState(false);
  const [reviewModalError, setReviewModalError] = useState('');

  // Load all reviews for the order's products
  const loadProductReviews = useCallback(async (items) => {
    if (!isAuthenticated || !items.length) return;

    const reviews = {};
    await Promise.all(
      items.map(async (item) => {
        try {
          const response = await reviewApi.getMyReviewForProduct(item.product);
          if (response.data) {
            reviews[item.product] = response.data;
          }
        } catch {
          // No review, ignore
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
      // Refresh all product reviews in the order
      if (order) {
        await loadProductReviews(order.items);
      }
    } catch (err) {
      setReviewModalError(err.message || 'Failed to save review.');
    } finally {
      setSavingReview(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    orderApi
      .getOrder(id)
      .then(async (response) => {
        if (isMounted) {
          const orderData = response.data;
          setOrder(orderData);
          setError('');
          // Load reviews for items if order is delivered
          if (orderData.orderStatus === 'delivered') {
            await loadProductReviews(orderData.items);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Unable to load order details.');
          setOrder(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, loadProductReviews]);

  return (
    <div className="order-details-page">
      <Navbar homeHref={ROUTES.home} />

      <main className="order-details-main">
        {loading ? (
          <ShimmerOrderDetails />
        ) : error ? (
          <div className="order-details-card">
            <h1 className="order-details-title">Order unavailable</h1>
            <p className="order-details-error-text">{error}</p>
            <div className="order-details-actions">
              <Link to="/collection" className="order-details-btn">
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="order-details-card">
            <div className="order-details-header">
              <div>
                <h1 className="order-details-title">Order {order.orderNumber}</h1>
                <p className="order-details-date">Placed on {formatOrderDate(order.createdAt)}</p>
              </div>
              <div className="order-details-badges">
                <span className="order-details-badge">{order.orderStatus}</span>
                <span className={`payment-status-badge ${(order.paymentStatus || '').toLowerCase().replace(/\s+/g, '-')}`}>
                  {getPaymentStatusLabel(order.paymentStatus, order.paymentMethod)}
                </span>
              </div>
            </div>

            <section className="order-details-section">
              <h2 className="order-details-section-title">Payment</h2>
              <p className="order-details-address">{formatPaymentMethod(order.paymentMethod)}</p>
            </section>

            {order.paymentMethod === 'bank_transfer' &&
              (order.paymentStatus === 'pending' ||
                order.paymentStatus === 'Pending Payment Verification') && (
              <section className="order-details-section order-details-bank-section">
                <h2 className="order-details-section-title">Verify Your Payment</h2>
                <p className="order-details-help-text" style={{ fontSize: '13px', color: '#767676', marginBottom: '14px', fontFamily: 'Inter, sans-serif' }}>
                  Please transfer the total amount of <strong>{formatPrice(order.total)}</strong> to the bank account below and click the button to send the screenshot on WhatsApp.
                </p>
                <div className="success-bank-card">
                  <h3>Meezan Bank Account Details</h3>
                  <div className="success-bank-grid">
                    <div className="success-bank-row">
                      <span className="label">Bank Name</span>
                      <strong className="value">Meezan Bank</strong>
                    </div>
                    <div className="success-bank-row">
                      <span className="label">Account Title</span>
                      <strong className="value">TALHA SAEED</strong>
                    </div>
                    <div className="success-bank-row">
                      <span className="label">Account Number</span>
                      <strong className="value flex-row">
                        <span>03380113919907</span>
                        <button
                          type="button"
                          className="copy-btn-success"
                          onClick={() => {
                            navigator.clipboard.writeText('03380113919907');
                            alert('Account Number copied!');
                          }}
                        >
                          Copy
                        </button>
                      </strong>
                    </div>
                    <div className="success-bank-row">
                      <span className="label">IBAN</span>
                      <strong className="value flex-row">
                        <span>PK62MEZN0003380113919907</span>
                        <button
                          type="button"
                          className="copy-btn-success"
                          onClick={() => {
                            navigator.clipboard.writeText('PK62MEZN0003380113919907');
                            alert('IBAN copied!');
                          }}
                        >
                          Copy
                        </button>
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="whatsapp-verification-box">
                  <p className="whatsapp-note-text">
                    Send your screenshot and Order ID via WhatsApp to confirm your order.
                  </p>
                  <a
                    href={`https://wa.me/923392215181?text=${encodeURIComponent(
                      `Hello Zivorah,\n\nI have completed my payment.\n\nOrder ID:\n${order.orderNumber}\n\nName:\n${order.deliveryAddress?.name || ''}\n\nPlease find my payment screenshot attached.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="order-success-whatsapp-btn"
                  >
                    Send Payment Screenshot
                  </a>
                </div>
              </section>
            )}

            <section className="order-details-section order-details-address">
              <h2 className="order-details-section-title">Delivery Address</h2>
              <p>{order.deliveryAddress.name}</p>
              <p>{order.deliveryAddress.phone}</p>
              <p>{order.deliveryAddress.email}</p>
              <p>
                {order.deliveryAddress.address}, {order.deliveryAddress.city},{' '}
                {order.deliveryAddress.province} {order.deliveryAddress.postalCode}
              </p>
            </section>

            <section className="order-details-section">
              <h2 className="order-details-section-title">Items</h2>
              <div className="order-details-items">
                {(order.items || []).map((item, index) => (
                  <div key={`${item.product}-${index}`} className="order-details-item">
                    <SafeImage
                      src={item.image || PLACEHOLDER_IMAGE}
                      alt={item.title}
                      className="order-details-item-image"
                    />
                    <div style={{ flex: 1 }}>
                      <p className="order-details-item-title">{item.title}</p>
                      <p className="order-details-item-meta">
                        Qty: {item.quantity}
                        {item.ringSize ? ` · Size: ${item.ringSize}` : ''}
                        {item.metalColor ? ` · ${item.metalColor}` : ''}
                        {item.extraPrice > 0 ? ` · Extras: ${formatPrice(item.extraPrice)}` : ''}
                      </p>
                      {item.isCustomized && (
                        <ul className="order-details-customization">
                          {buildCustomizationSummaryLines(null, item.customization).map((line) => (
                            <li key={`${line.label}-${line.value}`}>
                              <strong>{line.label}:</strong> {line.value}
                            </li>
                          ))}
                        </ul>
                      )}
                      {order.orderStatus === 'delivered' && (
                        <div style={{ marginTop: '0.5rem' }}>
                          {customerReviews[item.product] ? (
                            <button
                              type="button"
                              className="order-details-btn"
                              style={{ padding: '0.3rem 0.8rem', fontSize: '0.875rem' }}
                              onClick={() => openReviewModal(item.product)}
                            >
                              Edit Review
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="order-details-btn"
                              style={{ padding: '0.3rem 0.8rem', fontSize: '0.875rem' }}
                              onClick={() => openReviewModal(item.product)}
                            >
                              Write a Review
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="order-details-item-price">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="order-details-section order-details-summary">
              <div className="order-details-summary-row">
                <span>Subtotal</span>
                <strong>{formatPrice(order.subtotal)}</strong>
              </div>
              {order.discount > 0 && (
                <div className="order-details-summary-row">
                  <span>Discount{order.promoCode ? ` (${order.promoCode})` : ''}</span>
                  <strong>-{formatPrice(order.discount)}</strong>
                </div>
              )}
              <div className="order-details-summary-row">
                <span>Tax / Fee</span>
                <strong>{formatPrice(order.taxFee)}</strong>
              </div>
              <div className="order-details-summary-row order-details-summary-total">
                <span>Total</span>
                <strong>{formatPrice(order.total)}</strong>
              </div>
            </section>

            <div className="order-details-actions">
              <Link to="/collection" className="order-details-btn">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
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
