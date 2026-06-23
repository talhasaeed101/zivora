import { InstagramIcon, TikTokIcon, FacebookIcon } from './icons';
import './Footer.css';

const footerLinks = ['Home', 'Collection', 'Gifts', 'Testimonials', 'Contact'];

export default function Footer() {
  return (
    <footer id="contact" className="footer-section">
      <div className="footer-inner">
        <p className="footer-logo">ZIVORA</p>

        <form className="footer-newsletter-form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Enter Your Email Address"
            className="footer-email-input"
          />
          <button type="submit" className="footer-submit-btn">Submit</button>
        </form>

        <nav className="footer-nav-row">
          {footerLinks.map((link) => (
            <span key={link} className="footer-nav-item">
              <span className="footer-nav-dot">• </span>
              <a href="#" className="footer-nav-link">{link}</a>
            </span>
          ))}
        </nav>

        <div className="footer-bottom-bar">
          <p className="footer-copyright">© 2026 ZIVORA. ALL RIGHTS RESERVED.</p>
          <div className="footer-legal-links">
            <a href="#" className="footer-legal-link">Privacy Policy</a>
            <a href="#" className="footer-legal-link">Terms of Uses</a>
          </div>
          <div className="footer-social-row">
            <a href="#" className="footer-social-link" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="#" className="footer-social-link" aria-label="TikTok">
              <TikTokIcon />
            </a>
            <a href="#" className="footer-social-link" aria-label="Facebook">
              <FacebookIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
