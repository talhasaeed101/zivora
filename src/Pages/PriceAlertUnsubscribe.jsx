import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { priceAlertApi } from '../services/api.js';
import { ROUTES } from '../utils/navigation';

export default function PriceAlertUnsubscribe() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.title = 'Unsubscribe Price Alert | Zivorah';
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid unsubscribe link.');
        return;
      }

      try {
        await priceAlertApi.unsubscribe(token);
        if (!cancelled) {
          setStatus('success');
          setMessage('Your price alert has been cancelled.');
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('error');
          setMessage(error?.message || 'Unable to cancel this price alert.');
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="account-page">
      <Navbar homeHref={ROUTES.home} />
      <main id="main-content" className="account-main" style={{ padding: '48px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Teneka, Georgia, serif', fontWeight: 400, fontSize: 28 }}>
            Price alert
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#5f5f5f', marginTop: 12 }}>
            {status === 'loading' ? 'Cancelling your alert…' : message}
          </p>
          {status !== 'loading' ? (
            <p style={{ marginTop: 24 }}>
              <Link to={ROUTES.collection} style={{ color: '#967259' }}>
                Continue shopping
              </Link>
            </p>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
