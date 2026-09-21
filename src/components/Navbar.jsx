import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  SearchIcon,
  ShoppingCartIcon,
  UserIcon,
  HeartIcon,
} from './icons';
import { ROUTES } from '../utils/navigation';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { loadPublicCategories } from '../services/catalogCache.js';
// import { isLaunchTimerActive } from './LaunchTimer.jsx';
import AnnouncementBar from './AnnouncementBar.jsx';
import HeaderSearch from './header/HeaderSearch.jsx';
import AccountMenu from './header/AccountMenu.jsx';
import MobileDrawer from './header/MobileDrawer.jsx';
import './Navbar.css';

const PRIMARY_NAV = [
  { label: 'Home', to: '/', end: true },
  { label: 'Collection', to: ROUTES.collection },
  // { label: 'About', to: ROUTES.about },
  { label: 'Contact', to: ROUTES.contact },
];

function formatBadgeCount(count) {
  if (!count || count < 1) {
    return null;
  }
  return count > 99 ? '99+' : String(count);
}

export default function Navbar({ homeHref = ROUTES.home }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();

  // Launch timer lock disabled — was: useState(isLaunchTimerActive)
  const [locked] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const menuTriggerRef = useRef(null);
  const accountTriggerRef = useRef(null);
  const shopTriggerRef = useRef(null);
  const shopMenuRef = useRef(null);

  const cartCount = isAuthenticated ? totalItems : 0;
  const wishlistBadge = formatBadgeCount(isAuthenticated ? wishlistCount : 0);
  const cartBadge = formatBadgeCount(cartCount);

  const closeOverlays = useCallback(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setAccountOpen(false);
    setShopOpen(false);
  }, []);

  // useEffect(() => {
  //   if (!locked) {
  //     return undefined;
  //   }
  //
  //   const unlock = () => {
  //     if (!isLaunchTimerActive()) {
  //       setLocked(false);
  //     }
  //   };
  //
  //   unlock();
  //   const timer = window.setInterval(unlock, 1000);
  //   return () => window.clearInterval(timer);
  // }, [locked]);
  //
  // useEffect(() => {
  //   if (locked) {
  //     closeOverlays();
  //   }
  // }, [locked, closeOverlays]);

  useEffect(() => {
    closeOverlays();
  }, [location.pathname, location.search, closeOverlays]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let mounted = true;
    loadPublicCategories()
      .then((items) => {
        if (mounted) {
          setCategories(items);
        }
      })
      .catch(() => {
        if (mounted) {
          setCategories([]);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!shopOpen || locked) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShopOpen(false);
        shopTriggerRef.current?.focus?.();
      }
    };

    const onPointerDown = (event) => {
      if (
        shopMenuRef.current &&
        !shopMenuRef.current.contains(event.target) &&
        !shopTriggerRef.current?.contains?.(event.target)
      ) {
        setShopOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onPointerDown);
    };
  }, [shopOpen, locked]);

  const blockIfLocked = (event) => {
    if (locked) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const openSearch = () => {
    if (locked) {
      return;
    }
    setAccountOpen(false);
    setShopOpen(false);
    setMenuOpen(false);
    setSearchOpen(true);
  };

  const toggleAccount = () => {
    if (locked) {
      return;
    }
    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: location.pathname } });
      return;
    }
    setSearchOpen(false);
    setShopOpen(false);
    setAccountOpen((value) => !value);
  };

  const toggleMenu = () => {
    if (locked) {
      return;
    }
    setSearchOpen(false);
    setAccountOpen(false);
    setShopOpen(false);
    setMenuOpen((value) => !value);
  };

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <header
        className={`navbar-header${scrolled ? ' is-scrolled' : ''}${locked ? ' is-locked' : ''}`}
        aria-disabled={locked || undefined}
      >
        <AnnouncementBar />
        <div
          className="navbar-shell"
          onClickCapture={blockIfLocked}
          onKeyDownCapture={locked ? blockIfLocked : undefined}
        >
          <div className="navbar-inner">
            <button
              type="button"
              ref={menuTriggerRef}
              className="navbar-mobile-toggle"
              onClick={toggleMenu}
              disabled={locked}
              aria-disabled={locked || undefined}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              <span className="navbar-mobile-bar" />
              <span className="navbar-mobile-bar" />
              <span className="navbar-mobile-bar" />
            </button>

            <Link
              to={homeHref}
              className="navbar-logo"
              aria-label="Zivorah home"
              aria-disabled={locked || undefined}
              tabIndex={locked ? -1 : undefined}
              onClick={blockIfLocked}
            >
              ZIVORAH
            </Link>

            <nav className="navbar-links" aria-label="Primary">
              {PRIMARY_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  prefetch="intent"
                  end={Boolean(item.end)}
                  className={({ isActive }) =>
                    `navbar-link${isActive ? ' is-active' : ''}`
                  }
                  aria-disabled={locked || undefined}
                  tabIndex={locked ? -1 : undefined}
                  onClick={blockIfLocked}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="navbar-actions">
              <button
                type="button"
                className="navbar-icon-btn"
                onClick={openSearch}
                disabled={locked}
                aria-disabled={locked || undefined}
                aria-label="Search"
              >
                <SearchIcon className="w-6 h-6" />
              </button>

              <Link
                to={isAuthenticated ? ROUTES.wishlist : ROUTES.login}
                state={isAuthenticated ? undefined : { from: ROUTES.wishlist }}
                className="navbar-icon-btn navbar-icon-desktop"
                aria-label={
                  wishlistBadge ? `Wishlist, ${wishlistBadge} items` : 'Wishlist'
                }
                aria-disabled={locked || undefined}
                tabIndex={locked ? -1 : undefined}
                onClick={blockIfLocked}
              >
                <HeartIcon className="w-6 h-6" />
                {wishlistBadge ? (
                  <span className="navbar-badge" aria-hidden="true">
                    {wishlistBadge}
                  </span>
                ) : null}
              </Link>

              <Link
                to={ROUTES.cart}
                className="navbar-icon-btn navbar-cart-btn"
                aria-label={cartBadge ? `Cart, ${cartBadge} items` : 'Cart'}
                aria-disabled={locked || undefined}
                tabIndex={locked ? -1 : undefined}
                onClick={blockIfLocked}
              >
                <ShoppingCartIcon className="w-6 h-6" />
                {cartBadge ? (
                  <span className="navbar-badge" aria-hidden="true">
                    {cartBadge}
                  </span>
                ) : null}
              </Link>

              <div className="navbar-account-wrap">
                <button
                  type="button"
                  ref={accountTriggerRef}
                  className="navbar-icon-btn navbar-icon-desktop"
                  aria-label="Account"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  disabled={locked}
                  aria-disabled={locked || undefined}
                  onClick={toggleAccount}
                >
                  <UserIcon className="w-6 h-6" />
                </button>
                {!locked ? (
                  <AccountMenu
                    open={accountOpen}
                    onClose={() => setAccountOpen(false)}
                    triggerRef={accountTriggerRef}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="navbar-spacer" aria-hidden="true" />

      {!locked ? (
        <>
          <HeaderSearch
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            categories={categories}
          />

          <MobileDrawer
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            categories={categories}
            navItems={PRIMARY_NAV}
            triggerRef={menuTriggerRef}
          />
        </>
      ) : null}
    </>
  );
}
