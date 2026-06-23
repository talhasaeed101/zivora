import { useState } from 'react';
import { SearchIcon, ShoppingBagIcon, UserIcon } from './icons';
import './Navbar.css';

const navLinks = [
  { label: 'HOME', href: '#', active: true },
  { label: 'COLLECTION', href: '#collection' },
  { label: 'BUNDLES', href: '#bundles' },
  { label: 'TESTIMONIALS', href: '#testimonials' },
  { label: 'CONTACT', href: '#contact' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar-header">
      <div className="navbar-inner">
        <a href="#" className="navbar-logo">ZIVORAH</a>

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
            <input type="search" placeholder="Search" className="navbar-search-input" />
            <SearchIcon className="w-5 h-5" />
          </div>
          <button type="button" className="navbar-cart-btn" aria-label="Cart">
            <ShoppingBagIcon />
          </button>
          <button type="button" className="navbar-user-btn" aria-label="Account">
            <UserIcon />
          </button>
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
