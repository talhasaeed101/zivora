import { useState } from 'react';
import { InstagramIcon, TikTokIcon, FacebookIcon } from './icons';
import { FOOTER_LINKS, ROUTES } from '../utils/navigation';
import { publicEngagementApi } from '../services/api.js';
import './Footer.css';

const footerLinks = ['Home', 'Collection', 'Gifts', 'Testimonials', 'Contact', 'About'];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setSubmitting(true);

    try {
      await publicEngagementApi.subscribeNewsletter({ email, source: 'footer' });
      setMessage('Subscribed successfully.');
      setEmail('');
    } catch (err) {
      setMessage(err.message || 'Subscription failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer id="contact" className="footer-section">
      <div className="footer-inner">
        <p className="footer-logo">
          <a href={ROUTES.home} className="footer-logo-link">ZIVORAH</a>
        </p>

        <form className="footer-newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter Your Email Address"
            className="footer-email-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={submitting}
          />
          <button type="submit" className="footer-submit-btn" disabled={submitting}>
            {submitting ? '...' : 'Submit'}
          </button>
        </form>
        {message && <p className="footer-newsletter-message">{message}</p>}

        <nav className="footer-nav-row">
          {footerLinks.map((link) => (
            <span key={link} className="footer-nav-item">
              <span className="footer-nav-dot">• </span>
              <a href={FOOTER_LINKS[link]} className="footer-nav-link">{link}</a>
            </span>
          ))}
        </nav>

        <div className="footer-support-row">
          <a href="tel:+923392215181" className="footer-support-link">+92 339 2215181</a>
          <span className="footer-support-dot">•</span>
          <a href="mailto:Zivorah.store@gmail.com" className="footer-support-link">Zivorah.store@gmail.com</a>
        </div>

        <div className="footer-bottom-bar">
          <p className="footer-copyright">© 2026 ZIVORA. ALL RIGHTS RESERVED.</p>
          <div className="footer-legal-links">
            <a href={ROUTES.privacyPolicy} className="footer-legal-link">Privacy Policy</a>
            <a href={ROUTES.termsOfUse} className="footer-legal-link">Terms of Use</a>
          </div>
          <div className="footer-social-row">
            <a
              href="https://www.instagram.com/zivorah.store?igsh=b2kxcmZrYjlxc2hn&utm_source=qr"
              className="footer-social-link"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://vt.tiktok.com/ZSCvChaAS/"
              className="footer-social-link"
              aria-label="TikTok"
              target="_blank"
              rel="noopener noreferrer"
            >
              <TikTokIcon />
            </a>
            <a
              href="https://www.facebook.com"
              className="footer-social-link"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FacebookIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
