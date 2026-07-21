import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/navigation';

const ACCOUNT_LINKS = [
  { label: 'Account Overview', to: ROUTES.profile },
  { label: 'My Orders', to: ROUTES.orders },
  { label: 'Wishlist', to: ROUTES.wishlist },
  { label: 'Notifications', to: ROUTES.notifications },
  { label: 'Support Tickets', to: ROUTES.supportTickets },
];

export default function AccountMenu({ open, onClose, triggerRef }) {
  const navigate = useNavigate();
  const { customer, logout, isAuthenticated } = useAuth();
  const menuRef = useRef(null);
  const firstName = customer?.name?.trim().split(/\s+/)[0] || '';

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        triggerRef?.current?.focus?.();
      }
    };

    const onPointerDown = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !triggerRef?.current?.contains?.(event.target)
      ) {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onPointerDown);
    };
  }, [open, onClose, triggerRef]);

  if (!open || !isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    onClose();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <div
      className="header-account-menu"
      ref={menuRef}
      role="menu"
      aria-label="Account"
    >
      {firstName ? <p className="header-account-greeting">Hello, {firstName}</p> : null}
      <ul className="header-account-list">
        {ACCOUNT_LINKS.map((item) => (
          <li key={item.to} role="none">
            <Link
              role="menuitem"
              to={item.to}
              className="header-account-link"
              onClick={onClose}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <button
        type="button"
        role="menuitem"
        className="header-account-logout"
        onClick={handleLogout}
      >
        Log out
      </button>
    </div>
  );
}
