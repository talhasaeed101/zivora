import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES, categoryPath } from '../../utils/navigation';

export default function MobileDrawer({
  open,
  onClose,
  categories = [],
  navItems = [],
  triggerRef,
}) {
  const navigate = useNavigate();
  const { isAuthenticated, logout, customer } = useAuth();
  const [shopOpen, setShopOpen] = useState(false);
  const drawerRef = useRef(null);
  const closeId = useId();
  const firstName = customer?.name?.trim().split(/\s+/)[0] || '';

  useEffect(() => {
    if (!open) {
      setShopOpen(false);
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
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
              className={({ isActive }) =>
                `mobile-drawer-link${isActive ? ' is-active' : ''}`
              }
              onClick={onClose}
            >
              {item.label}
            </NavLink>
          ))}

          {categories.length > 0 ? (
            <div className="mobile-drawer-accordion">
              <button
                type="button"
                className="mobile-drawer-accordion-trigger"
                aria-expanded={shopOpen}
                onClick={() => setShopOpen((value) => !value)}
              >
                Categories
                <span aria-hidden="true">{shopOpen ? '−' : '+'}</span>
              </button>
              {shopOpen ? (
                <div className="mobile-drawer-accordion-panel">
                  {categories.map((category) => (
                    <Link
                      key={category._id || category.slug}
                      to={categoryPath(category.slug)}
                      className="mobile-drawer-sublink"
                      onClick={onClose}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <Link to={ROUTES.collection} className="mobile-drawer-link" onClick={onClose}>
            Shop Collection
          </Link>
          <Link
            to={isAuthenticated ? ROUTES.wishlist : ROUTES.login}
            state={isAuthenticated ? undefined : { from: ROUTES.wishlist }}
            className="mobile-drawer-link"
            onClick={onClose}
          >
            Wishlist
          </Link>
          {isAuthenticated ? (
            <>
              <Link to={ROUTES.orders} className="mobile-drawer-link" onClick={onClose}>
                My Orders
              </Link>
              <Link to={ROUTES.profile} className="mobile-drawer-link" onClick={onClose}>
                Account
              </Link>
              <Link to={ROUTES.notifications} className="mobile-drawer-link" onClick={onClose}>
                Notifications
              </Link>
              <Link to={ROUTES.supportTickets} className="mobile-drawer-link" onClick={onClose}>
                Support
              </Link>
            </>
          ) : (
            <Link to={ROUTES.login} className="mobile-drawer-link" onClick={onClose}>
              Sign In
            </Link>
          )}
          <Link to={ROUTES.contact} className="mobile-drawer-link" onClick={onClose}>
            Contact
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
