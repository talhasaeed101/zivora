import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, ShoppingBagIcon, UserIcon, HeartIcon } from './icons';
import { NAV_ROUTES, ROUTES, getAccountRoute } from '../utils/navigation';
import { useAuth } from '../context/AuthContext.jsx';
import './Navbar.css';

const NAV_ITEMS = [
  { label: 'HOME', href: NAV_ROUTES.HOME, hash: 'HOME' },
  { label: 'COLLECTION', href: NAV_ROUTES.COLLECTION, hash: 'COLLECTION' },
  { label: 'BUNDLES', href: NAV_ROUTES.BUNDLES, hash: 'BUNDLES' },
  { label: 'TESTIMONIALS', href: NAV_ROUTES.TESTIMONIALS, hash: 'TESTIMONIALS' },
  { label: 'CONTACT', href: NAV_ROUTES.CONTACT, hash: 'CONTACT' },
];

export default function Navbar({ activeLink = 'HOME', showWishlist = false, homeHref = '#' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const accountPath = getAccountRoute(isAuthenticated);

  const navLinks = NAV_ITEMS.map((item) => ({
    ...item,
    href: item.hash === 'HOME' ? homeHref : item.href,
    active: item.hash === activeLink,
  }));

  return (
    <header className="navbar-header">
      <div className="navbar-inner">
        <a href={homeHref} className="navbar-logo">ZIVORAH</a>

        <nav className="navbar-links">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`navbar-link ${link.active ? 'navbar-link-active' : ''}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="navbar-actions">
          <div className="navbar-search-wrap">
            <form onSubmit={(e) => { e.preventDefault(); window.location.href = ROUTES.search; }} style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
              <input type="search" placeholder="Search" className="navbar-search-input" />
              <button type="submit" aria-label="Submit search" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: 'inherit' }}>
                <SearchIcon className="w-5 h-5" />
              </button>
            </form>
          </div>
          {showWishlist && (
            <a href={ROUTES.home} className="navbar-wishlist-btn" aria-label="Wishlist">
              <HeartIcon className="w-4 h-4" />
            </a>
          )}
          <a href={ROUTES.cart} className="navbar-cart-btn" aria-label="Cart">
            <ShoppingBagIcon />
          </a>
          <Link to={accountPath} className="navbar-user-btn" aria-label="Account">
            <UserIcon />
          </Link>
        </div>

        <button
          type="button"
          className="navbar-mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="navbar-mobile-bar" />
          <span className="navbar-mobile-bar" />
          <span className="navbar-mobile-bar" />
        </button>
      </div>

      <nav className={`navbar-mobile-menu ${menuOpen ? 'navbar-mobile-menu-open' : ''}`}>
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={`navbar-link ${link.active ? 'navbar-link-active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
