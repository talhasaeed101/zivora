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
            {order.paymentMethod === 'bank_transfer' ? (
              <p className="order-success-text">
                Please transfer the total amount to the bank account below. After completing the payment, send your payment screenshot along with your Order ID to our WhatsApp. Your order will be confirmed after payment verification.
              </p>
            ) : (
              <p className="order-success-text">
                We&apos;ve received your order and will contact you for cash on delivery confirmation.
              </p>
            )}

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
                <strong>{order.paymentMethod === 'bank_transfer' ? 'Direct Bank Transfer' : 'Cash on Delivery'}</strong>
              </div>
              <div className="order-success-row">
                <span>Status</span>
                <strong>{order.orderStatus}</strong>
              </div>
            </div>

            {order.paymentMethod === 'bank_transfer' && (
              <>
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
                    Have you completed the payment? Click the button below to send your payment screenshot and Order ID via WhatsApp.
                  </p>
                  <a
                    href={`https://wa.me/923380113919?text=${encodeURIComponent(
                      `Hello Zivora,\n\nI have completed my payment.\n\nOrder ID:\n${order.orderNumber}\n\nName:\n${order.deliveryAddress?.name || ''}\n\nPlease find my payment screenshot attached.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="order-success-whatsapp-btn"
                  >
                    <svg className="whatsapp-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.381 9.805-9.782.001-2.592-1.01-5.031-2.846-6.87C16.398 2.113 13.96 1.1 11.39 1.1c-5.41 0-9.81 4.386-9.813 9.79 0 1.629.475 3.21 1.372 4.618l-.938 3.43 3.536-.924zm13.72-7.142c-.07-.117-.258-.187-.539-.327-.281-.14-1.661-.82-1.919-.914-.258-.094-.446-.14-.633.14-.188.28-.727.914-.89 1.092-.164.18-.328.201-.609.061-.28-.14-1.186-.438-2.26-1.395-.835-.745-1.4-1.664-1.563-1.944-.164-.28-.018-.431.122-.571.127-.125.281-.327.422-.49.14-.164.188-.28.281-.467.094-.187.047-.35-.023-.49-.07-.14-.633-1.523-.867-2.086-.228-.547-.46-.473-.633-.482-.164-.008-.352-.01-.539-.01-.188 0-.492.07-.75.35-.258.28-.984.962-.984 2.343 0 1.382 1.008 2.72 1.148 2.907.14.188 1.984 3.03 4.81 4.249.67.29 1.195.463 1.602.592.673.214 1.285.184 1.768.112.539-.08 1.661-.678 1.895-1.332.234-.655.234-1.218.164-1.332z"/>
                    </svg>
                    Send Payment Screenshot
                  </a>
                </div>
              </>
            )}

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
