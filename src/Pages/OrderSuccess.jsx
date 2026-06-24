import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { orderApi } from '../services/api.js';
import { ROUTES } from '../utils/navigation';
import { formatPrice } from '../utils/products.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import './OrderSuccess.css';

export default function OrderSuccess() {
  usePageTitle('Order Confirmed | Zivora');
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
    <div className="order-success-page">
      <Navbar homeHref={ROUTES.home} />

      <main className="order-success-main">
        {loading ? (
          <p className="order-success-message">Loading order details...</p>
        ) : error ? (
          <div className="order-success-card">
            <h1 className="order-success-title">Order unavailable</h1>
            <p className="order-success-text">{error}</p>
            <Link to="/collection" className="order-success-btn order-success-btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="order-success-card">
            <p className="order-success-kicker">Thank you for your order</p>
            <h1 className="order-success-title">Your order is confirmed</h1>
            <p className="order-success-text">
              We&apos;ve received your order and will contact you for cash on delivery confirmation.
            </p>

            <div className="order-success-details">
              <div className="order-success-row">
                <span>Order Number</span>
                <strong>{order.orderNumber}</strong>
              </div>
              <div className="order-success-row">
                <span>Total Amount</span>
                <strong>{formatPrice(order.total)}</strong>
              </div>
              <div className="order-success-row">
                <span>Payment</span>
                <strong>Cash on Delivery</strong>
              </div>
              <div className="order-success-row">
                <span>Status</span>
                <strong>{order.orderStatus}</strong>
              </div>
            </div>

            <div className="order-success-address">
              <h2>Delivery Address</h2>
              <p>{order.deliveryAddress.name}</p>
              <p>{order.deliveryAddress.phone}</p>
              <p>{order.deliveryAddress.email}</p>
              <p>
                {order.deliveryAddress.address}, {order.deliveryAddress.city},{' '}
                {order.deliveryAddress.province} {order.deliveryAddress.postalCode}
              </p>
            </div>

            <div className="order-success-actions">
            <Link to="/collection" className="order-success-btn order-success-btn-primary">
              Continue Shopping
            </Link>
            <Link to="/profile" className="order-success-btn order-success-btn-secondary">
              View Orders
            </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
