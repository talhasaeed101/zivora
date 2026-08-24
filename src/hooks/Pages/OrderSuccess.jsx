import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Reveal from '../components/Reveal.jsx';
import { orderApi } from '../services/api.js';
import { ROUTES, orderPath } from '../utils/navigation';
import { formatPrice } from '../utils/products.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { ORDER_STATUS_LABELS } from '../constants/orderConstants.js';
import {
  BANK_TRANSFER_DETAILS,
  formatPaymentMethodLabel,
} from '../constants/bankTransfer.js';
import './OrderSuccess.css';

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="copy-btn-success"
      aria-label={`Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          /* ignore */
        }
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function OrderSuccess() {
  usePageTitle('Order Confirmed | Zivorah');
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
          const message = err.message || '';
          setError(
            message.length > 140 || !message
              ? 'Unable to load order details.'
              : message
          );
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

  const address = order?.deliveryAddress;
  const addressLine = address
    ? [address.address || address.street, address.city, address.province, address.postalCode]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <div className="order-success-page">
      <Navbar homeHref={ROUTES.home} />

      <main id="main-content" className="order-success-main">
        {loading ? (
          <p className="order-success-message" aria-busy="true" aria-live="polite">
            Confirming your order…
          </p>
        ) : null}

        {!loading && error ? (
          <Reveal className="order-success-card" variant="fade-up">
            <h1 className="order-success-title">Order unavailable</h1>
            <p className="order-success-text">{error}</p>
            <div className="order-success-actions">
              <Link to={ROUTES.orders} className="order-success-btn order-success-btn-primary">
                View Orders
              </Link>
              <Link to={ROUTES.collection} className="order-success-btn order-success-btn-secondary">
                Continue Shopping
              </Link>
            </div>
          </Reveal>
        ) : null}

        {!loading && order ? (
          <Reveal className="order-success-card" variant="fade-up">
            <p className="order-success-kicker">Order confirmed</p>
            <h1 className="order-success-title">Thank you for your order</h1>

            {order.paymentMethod === 'bank_transfer' ? (
              <p className="order-success-text">
                Transfer the total amount using the details below, then send your payment screenshot
                with your order number on WhatsApp. Your order remains pending until payment is
                verified.
              </p>
            ) : (
              <p className="order-success-text">
                We have received your order. You will pay when it is delivered. Tracking information
                will appear once your order has been dispatched.
              </p>
            )}

            <div className="order-success-details">
              <div className="order-success-row">
                <span>Order number</span>
                <strong>{order.orderNumber}</strong>
              </div>
              <div className="order-success-row">
                <span>Total</span>
                <strong>{formatPrice(order.total)}</strong>
              </div>
              <div className="order-success-row">
                <span>Payment</span>
                <strong>{formatPaymentMethodLabel(order.paymentMethod)}</strong>
              </div>
              <div className="order-success-row">
                <span>Status</span>
                <strong>{ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus}</strong>
              </div>
            </div>

            {order.paymentMethod === 'bank_transfer' ? (
              <>
                <div className="success-bank-card">
                  <h2 className="success-bank-title">Bank transfer details</h2>
                  <div className="success-bank-grid">
                    <div className="success-bank-row">
                      <span className="label">Bank name</span>
                      <strong className="value">{BANK_TRANSFER_DETAILS.bankName}</strong>
                    </div>
                    <div className="success-bank-row">
                      <span className="label">Account title</span>
                      <strong className="value">{BANK_TRANSFER_DETAILS.accountTitle}</strong>
                    </div>
                    <div className="success-bank-row">
                      <span className="label">Account number</span>
                      <strong className="value flex-row">
                        <span>{BANK_TRANSFER_DETAILS.accountNumber}</span>
                        <CopyButton
                          value={BANK_TRANSFER_DETAILS.accountNumber}
                          label="account number"
                        />
                      </strong>
                    </div>
                    <div className="success-bank-row">
                      <span className="label">IBAN</span>
                      <strong className="value flex-row">
                        <span>{BANK_TRANSFER_DETAILS.iban}</span>
                        <CopyButton value={BANK_TRANSFER_DETAILS.iban} label="IBAN" />
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="whatsapp-verification-box">
                  <p className="whatsapp-note-text">
                    After transferring, send your payment screenshot and order number via WhatsApp.
                  </p>
                  <a
                    href={`https://wa.me/${BANK_TRANSFER_DETAILS.whatsappNumber}?text=${encodeURIComponent(
                      `Hello Zivorah,\n\nI have completed my payment.\n\nOrder number:\n${order.orderNumber}\n\nName:\n${address?.name || ''}\n\nPlease find my payment screenshot attached.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="order-success-whatsapp-btn"
                  >
                    Send payment screenshot
                  </a>
                </div>
              </>
            ) : null}

            {address ? (
              <div className="order-success-address">
                <h2>Delivery address</h2>
                {address.name ? <p>{address.name}</p> : null}
                {address.phone ? <p>{address.phone}</p> : null}
                {addressLine ? <p>{addressLine}</p> : null}
              </div>
            ) : null}

            <p className="order-success-tracking-note">
              Your tracking information will appear once your order has been dispatched.
            </p>

            <div className="order-success-actions">
              <Link to={orderPath(order._id)} className="order-success-btn order-success-btn-primary">
                View Order
              </Link>
              <Link to={ROUTES.collection} className="order-success-btn order-success-btn-secondary">
                Continue Shopping
              </Link>
            </div>
          </Reveal>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
