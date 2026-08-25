import { useState } from 'react';
import { Link } from 'react-router-dom';
import { InstagramIcon, FacebookIcon } from './icons';
import { ROUTES } from '../utils/navigation';
import { publicEngagementApi } from '../services/api.js';
import './Footer.css';

const MAIN_LINKS = [
  { label: 'Home', to: ROUTES.home },
  { label: 'Collection', to: ROUTES.collection },
  { label: 'Gifts', to: ROUTES.home }, 
  { label: 'Testimonials', to: ROUTES.home }, 
  { label: 'Contact', to: ROUTES.contact },
];

const TikTokImageIcon = () => (
  <img src="/images/tiktok.svg" alt="TikTok" width="22" height="22" style={{ display: 'block' }} />
);

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/zivorah.store?igsh=b2kxcmZrYjlxc2hn&utm_source=qr',
    Icon: InstagramIcon,
  },
  {
    label: 'TikTok',
    href: 'https://vt.tiktok.com/ZSCvChaAS/',
    Icon: TikTokImageIcon,
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61591280865014',
    Icon: FacebookIcon,
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

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
        <div className="footer-top">
          <Link to={ROUTES.home} className="footer-logo-link">
            ZIVORAH
          </Link>

          <div className="footer-newsletter-wrapper">
            <form className="footer-newsletter-form" onSubmit={handleSubmit}>
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                className="footer-email-input"
                placeholder="Enter Your Email Address"
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
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
            <div className="sr-only" aria-live="polite">
              {message || error}
            </div>
            {message && <p className="footer-newsletter-message is-success">{message}</p>}
            {error && (
              <p className="footer-newsletter-message is-error" role="alert">
                {error}
              </p>
            )}
          </div>

          <ul className="footer-main-links">
            {MAIN_LINKS.map((item, index) => (
              <li key={item.label} className="footer-main-link-item">
                <span className="footer-link-dot">•</span>
                <Link to={item.to} className="footer-main-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom-bar">
          <div className="footer-legal-group">
            <span className="footer-copyright">
              ©2026 ZIVORA. ALL RIGHTS RESERVED
            </span>
            <Link to={ROUTES.privacyPolicy} className="footer-legal-link">
              PRIVACY POLICY
            </Link>
            <Link to={ROUTES.termsOfUse} className="footer-legal-link">
              TERMS OF USES
            </Link>
          </div>
          
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
      </div>
    </footer>
  );
}
