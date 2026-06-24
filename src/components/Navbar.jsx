import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchIcon, ShoppingBagIcon, UserIcon, HeartIcon } from './icons';
import { NAV_ROUTES, ROUTES, getAccountRoute, searchPath } from '../utils/navigation';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import './Navbar.css';

const NAV_ITEMS = [
  { label: 'HOME', href: NAV_ROUTES.HOME, hash: 'HOME' },
  { label: 'COLLECTION', href: NAV_ROUTES.COLLECTION, hash: 'COLLECTION' },
  { label: 'BUNDLES', href: NAV_ROUTES.BUNDLES, hash: 'BUNDLES' },
  { label: 'TESTIMONIALS', href: NAV_ROUTES.TESTIMONIALS, hash: 'TESTIMONIALS' },
  { label: 'CONTACT', href: NAV_ROUTES.CONTACT, hash: 'CONTACT' },
];

export default function Navbar({ activeLink = 'HOME', homeHref = '#' }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const { isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const accountPath = getAccountRoute(isAuthenticated);
  const cartCount = isAuthenticated ? totalItems : 0;
  const wishlistBadgeCount = isAuthenticated ? wishlistCount : 0;

  const navLinks = NAV_ITEMS.map((item) => ({
    ...item,
    href: item.hash === 'HOME' ? homeHref : item.href,
    active: item.hash === activeLink,
  }));

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchInput.trim();
    setMenuOpen(false);
    navigate(searchPath({ q: query }));
  };

  return (
    <header className="navbar-header">
      <div className="navbar-inner">
        <a href={homeHref} className="navbar-logo">ZIVORA</a>

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
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
              <input
                type="search"
                placeholder="Search"
                className="navbar-search-input"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              <button type="submit" aria-label="Submit search" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: 'inherit' }}>
                <SearchIcon className="w-5 h-5" />
              </button>
            </form>
          </div>
          {isAuthenticated ? (
            <Link to={ROUTES.wishlist} className="navbar-wishlist-btn" aria-label="Wishlist">
              <HeartIcon className="w-4 h-4" />
              {wishlistBadgeCount > 0 && (
                <span className="navbar-wishlist-badge">{wishlistBadgeCount}</span>
              )}
            </Link>
          ) : (
            <Link
              to={ROUTES.login}
              state={{ from: ROUTES.wishlist }}
              className="navbar-wishlist-btn"
              aria-label="Wishlist"
            >
              <HeartIcon className="w-4 h-4" />
            </Link>
          )}
          <Link to={ROUTES.cart} className="navbar-cart-btn" aria-label="Cart">
            <ShoppingBagIcon />
            {cartCount > 0 && <span className="navbar-cart-badge">{cartCount}</span>}
          </Link>
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
        <form className="navbar-mobile-search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Search jewelry..."
            className="navbar-mobile-search-input"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            aria-label="Search"
          />
          <button type="submit" className="navbar-mobile-search-btn" aria-label="Submit search">
            <SearchIcon className="w-5 h-5" />
          </button>
        </form>

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
