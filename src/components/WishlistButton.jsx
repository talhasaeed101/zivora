import { useLocation, useNavigate } from 'react-router-dom';
import { HeartIcon } from './icons';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import './WishlistButton.css';

export default function WishlistButton({
  productId,
  className = '',
  activeClassName = '',
  iconClassName = 'w-4 h-4',
  showLabel = false,
  stopPropagation = true,
  loginRedirectPath,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();

  const active = isInWishlist(productId);
  const loading = isToggling(productId);

  const handleClick = async (event) => {
    if (stopPropagation) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!productId) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: loginRedirectPath || location.pathname },
      });
      return;
    }

    try {
      await toggleWishlist(productId);
    } catch {
      // Wishlist errors can be surfaced by page-level state if needed.
    }
  };

  return (
    <button
      type="button"
      className={`${className} ${active ? activeClassName : ''} ${loading ? 'wishlist-btn-loading' : ''}`}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={active}
      onClick={handleClick}
      disabled={loading}
    >
      <HeartIcon className={iconClassName} />
      {showLabel && <span>Wishlist</span>}
    </button>
  );
}
