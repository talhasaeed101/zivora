import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/navigation';
import './account.css';

const NAV_ITEMS = [
  { id: 'overview', label: 'Account Overview', to: ROUTES.profile, end: true },
  { id: 'orders', label: 'My Orders', to: ROUTES.orders },
  { id: 'wishlist', label: 'Wishlist', to: ROUTES.wishlist },
  { id: 'notifications', label: 'Notifications', to: ROUTES.notifications },
  { id: 'support', label: 'Support Tickets', to: ROUTES.supportTickets },
];

export default function AccountNav({ active }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    if (loggingOut) {
      return;
    }
    setLoggingOut(true);
    logout();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <nav className="account-nav" aria-label="Account">
      <p className="account-nav-label">Account</p>

      <div className="account-nav-mobile">
        <label htmlFor="account-nav-select" className="sr-only">
          Account section
        </label>
        <select
          id="account-nav-select"
          className="account-nav-select"
          value={active}
          onChange={(event) => {
            const item = NAV_ITEMS.find((entry) => entry.id === event.target.value);
            if (item) {
              navigate(item.to);
            }
          }}
        >
          {NAV_ITEMS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <ul className="account-nav-list">
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <NavLink
              to={item.to}
              end={Boolean(item.end)}
              className={({ isActive }) =>
                `account-nav-link${isActive || active === item.id ? ' is-active' : ''}`
              }
              aria-current={active === item.id ? 'page' : undefined}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="account-nav-logout"
        onClick={handleLogout}
        disabled={loggingOut}
        aria-busy={loggingOut || undefined}
      >
        {loggingOut ? 'Signing out…' : 'Log out'}
      </button>
    </nav>
  );
}
