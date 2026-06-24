import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { orderApi } from '../services/api.js';
import { ROUTES } from '../utils/navigation';
import { formatPrice } from '../utils/products.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { ShimmerOrderDetails } from '../components/Shimmer.jsx';
import SafeImage from '../components/SafeImage.jsx';
import { PLACEHOLDER_IMAGE } from '../utils/products.js';
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

  return method || '—';
}

export default function OrderDetails() {
  usePageTitle('Order Details | Zivora');

  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    orderApi
      .getOrder(id)
      .then((response) => {
        if (isMounted) {
          setOrder(response.data);
          setError('');
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
  }, [id]);

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
                <span className="order-details-badge">{order.paymentStatus}</span>
              </div>
            </div>

            <section className="order-details-section">
              <h2 className="order-details-section-title">Payment</h2>
              <p className="order-details-address">{formatPaymentMethod(order.paymentMethod)}</p>
            </section>

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
                    <div>
                      <p className="order-details-item-title">{item.title}</p>
                      <p className="order-details-item-meta">
                        Qty: {item.quantity}
                        {item.ringSize ? ` · Size: ${item.ringSize}` : ''}
                        {item.metalColor ? ` · ${item.metalColor}` : ''}
                      </p>
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

      <Footer />
    </div>
  );
}
