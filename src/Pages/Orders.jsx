import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { orderApi } from '../services/api.js';
import { ROUTES, orderPath } from '../utils/navigation';
import { ShimmerTableRows } from '../components/Shimmer.jsx';
import { formatPrice } from '../utils/products.js';
import './Orders.css';

function formatOrderDate(value) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function Orders() {
  usePageTitle('My Orders | Zivora');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    orderApi
      .getOrders()
      .then((response) => {
        if (isMounted) {
          setOrders(response.data || []);
          setError('');
        }
      })
      .catch((err) => {
        if (isMounted) {
          setOrders([]);
          setError(err.message || 'Unable to load orders.');
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
  }, []);

  return (
    <>
      <Navbar homeHref={ROUTES.home} />
      <main className="orders-page">
        <div className="orders-inner">
          <div className="orders-header">
            <div>
              <h1 className="orders-title">My Orders</h1>
              <p className="orders-subtitle">View and track your jewelry orders.</p>
            </div>
            <Link to={ROUTES.profile} className="orders-back-link">
              Back to Profile
            </Link>
          </div>

          {loading && <ShimmerTableRows count={4} />}
          {error && <p className="orders-error">{error}</p>}

          {!loading && !error && orders.length === 0 && (
            <div className="orders-empty">
              <p>You have not placed any orders yet.</p>
              <a href={ROUTES.collection} className="orders-shop-btn">
                Shop Collection
              </a>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div className="orders-list">
              {orders.map((order) => (
                <article key={order._id} className="orders-card">
                  <div className="orders-card-main">
                    <p className="orders-card-number">{order.orderNumber}</p>
                    <div className="orders-card-meta">
                      <span>{formatOrderDate(order.createdAt)}</span>
                      <span>{formatPrice(order.total)}</span>
                      <span>{order.totalItems} items</span>
                      <span className="orders-card-status">{order.orderStatus}</span>
                    </div>
                  </div>
                  <Link to={orderPath(order._id)} className="orders-view-btn">
                    View Details
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
