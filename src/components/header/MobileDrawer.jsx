import { useEffect, useId, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES, scrollToHomeSection } from '../../utils/navigation';

const SECTION_HASHES = new Set(['#bundles', '#testimonials']);

export default function MobileDrawer({
  open,
  onClose,
  navItems = [],
  cartBadge = null,
  wishlistBadge = null,
  triggerRef,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, customer } = useAuth();
  const drawerRef = useRef(null);
  const closeId = useId();
  const firstName = customer?.name?.trim().split(/\s+/)[0] || '';

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        triggerRef?.current?.focus?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.requestAnimationFrame(() => {
      drawerRef.current?.querySelector('button, a')?.focus?.();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose, triggerRef]);

  if (!open) {
    return null;
  }

  const handleLogout = () => {
    logout();
    onClose();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <div className="mobile-drawer-root" role="presentation">
      <button
        type="button"
        className="mobile-drawer-backdrop"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        id="mobile-navigation"
        className="mobile-drawer-panel"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={closeId}
      >
        <div className="mobile-drawer-header">
          <p id={closeId} className="mobile-drawer-brand">
            Zivorah
          </p>
          <button
            type="button"
            className="mobile-drawer-close"
            onClick={() => {
              onClose();
              triggerRef?.current?.focus?.();
            }}
            aria-label="Close navigation menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {isAuthenticated && firstName ? (
          <p className="mobile-drawer-greeting">Hello, {firstName}</p>
        ) : null}

        <nav className="mobile-drawer-nav" aria-label="Mobile">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => {
                let active = isActive;
                if (item.sectionId) {
                  active =
                    location.pathname === '/' && location.hash === `#${item.sectionId}`;
                } else if (item.end) {
                  active = isActive && !SECTION_HASHES.has(location.hash);
                }
                return `mobile-drawer-link${active ? ' is-active' : ''}`;
              }}
              onClick={() => {
                onClose();
                if (item.sectionId && location.pathname === '/') {
                  window.setTimeout(() => scrollToHomeSection(item.sectionId), 0);
                }
              }}
            >
              {item.label}
            </NavLink>
          ))}

          <Link
            to={isAuthenticated ? ROUTES.wishlist : ROUTES.login}
            state={isAuthenticated ? undefined : { from: ROUTES.wishlist }}
            className="mobile-drawer-link"
            onClick={onClose}
          >
            <span>Wishlist</span>
            {wishlistBadge ? (
              <span className="mobile-drawer-count" aria-hidden="true">
                {wishlistBadge}
              </span>
            ) : null}
          </Link>

          <Link to={ROUTES.cart} className="mobile-drawer-link" onClick={onClose}>
            <span>Cart</span>
            {cartBadge ? (
              <span className="mobile-drawer-count" aria-hidden="true">
                {cartBadge}
              </span>
            ) : null}
          </Link>

          <Link
            to={isAuthenticated ? ROUTES.profile : ROUTES.login}
            state={isAuthenticated ? undefined : { from: ROUTES.profile }}
            className="mobile-drawer-link"
            onClick={onClose}
          >
            Account
          </Link>
        </nav>

        {isAuthenticated ? (
          <button type="button" className="mobile-drawer-logout" onClick={handleLogout}>
            Log out
          </button>
        ) : null}
      </div>
    </div>
  );
}
