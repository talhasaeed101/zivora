import { useState } from 'react';
import { Link } from 'react-router-dom';
import { InstagramIcon, TikTokIcon, FacebookIcon } from './icons';
import { ROUTES } from '../utils/navigation';
import { publicEngagementApi } from '../services/api.js';
import './Footer.css';

const SHOP_LINKS = [
  { label: 'Collection', to: ROUTES.collection },
  { label: 'Wishlist', to: ROUTES.wishlist },
];

const CARE_LINKS = [
  { label: 'My Orders', to: ROUTES.orders },
  { label: 'Account', to: ROUTES.profile },
  { label: 'Support Tickets', to: ROUTES.supportTickets },
  { label: 'Contact', to: ROUTES.contact },
];

const INFO_LINKS = [
  { label: 'About', to: ROUTES.about },
  { label: 'Privacy Policy', to: ROUTES.privacyPolicy },
  { label: 'Terms of Use', to: ROUTES.termsOfUse },
];

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/zivorah.store?igsh=b2kxcmZrYjlxc2hn&utm_source=qr',
    Icon: InstagramIcon,
  },
  {
    label: 'TikTok',
    href: 'https://vt.tiktok.com/ZSCvChaAS/',
    Icon: TikTokIcon,
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61591280865014',
    Icon: FacebookIcon,
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      await publicEngagementApi.subscribeNewsletter({ email, source: 'footer' });
      setMessage('Thank you — you are subscribed.');
      setEmail('');
    } catch (err) {
      const text = err.message || '';
      setError(
        text.length > 120 || !text
          ? 'Unable to subscribe right now. Please try again.'
          : text
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer id="contact" className="footer-section">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <Link to={ROUTES.home} className="footer-logo-link">
              ZIVORAH
            </Link>
            <p className="footer-brand-copy">
              Refined jewelry for everyday elegance.
            </p>
            <div className="footer-social-row">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  className="footer-social-link"
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h2 className="footer-col-title">Shop</h2>
            <ul className="footer-col-list">
              {SHOP_LINKS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} prefetch="intent" className="footer-col-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h2 className="footer-col-title">Customer Care</h2>
            <ul className="footer-col-list">
              {CARE_LINKS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="footer-col-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h2 className="footer-col-title">Information</h2>
            <ul className="footer-col-list">
              {INFO_LINKS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} prefetch="intent" className="footer-col-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col footer-newsletter-col">
            <h2 className="footer-col-title">Newsletter</h2>
            <p className="footer-newsletter-copy">
              Occasional notes on new pieces and collection updates.
            </p>
            <form className="footer-newsletter-form" onSubmit={handleSubmit}>
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                className="footer-email-input"
                placeholder="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                disabled={submitting}
              />
              <button
                type="submit"
                className="footer-submit-btn"
                disabled={submitting}
                aria-busy={submitting || undefined}
              >
                {submitting ? 'Joining…' : 'Subscribe'}
              </button>
            </form>
            <div className="sr-only" aria-live="polite">
              {message || error}
            </div>
            {message ? <p className="footer-newsletter-message is-success">{message}</p> : null}
            {error ? (
              <p className="footer-newsletter-message is-error" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p className="footer-copyright">
            © {year} Zivorah. All rights reserved.
          </p>
          <div className="footer-legal-links">
            <Link to={ROUTES.privacyPolicy} prefetch="intent" className="footer-legal-link">
              Privacy Policy
            </Link>
            <Link to={ROUTES.termsOfUse} prefetch="intent" className="footer-legal-link">
              Terms of Use
            </Link>
          </div>
          <p className="footer-payment-note">Cash on Delivery · Bank Transfer</p>
        </div>
      </div>
    </footer>
  );
}
