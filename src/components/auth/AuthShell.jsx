import { Link } from 'react-router-dom';
import Reveal from '../Reveal.jsx';
import { ROUTES } from '../../utils/navigation';
import '../../Pages/Auth.css';

/** Existing storefront jewelry assets in /public/images */
const AUTH_SIDE_IMAGE = '/images/Rectangle 3298.png';
const AUTH_SIDE_FALLBACK = '/images/image 1 (3).png';

export default function AuthShell({
  children,
  showTrust = true,
  imageSrc = AUTH_SIDE_IMAGE,
}) {
  return (
    <div className="auth-shell">
      <div className="auth-split">
        <aside className="auth-split-visual" aria-hidden="true">
          <img
            src={imageSrc}
            alt=""
            className="auth-split-image"
            onError={(event) => {
              const img = event.currentTarget;
              if (!img.dataset.fallbackApplied) {
                img.dataset.fallbackApplied = '1';
                img.src = AUTH_SIDE_FALLBACK;
              }
            }}
          />
          <div className="auth-split-visual-overlay" />
        </aside>

        <main id="main-content" className="auth-split-form">
          <Reveal className="auth-panel" variant="fade-up">
            <Link to={ROUTES.home} className="auth-logo">
              ZIVORAH
            </Link>

            <div className="auth-panel-body">
              {children}
              {showTrust ? (
                <p className="auth-trust">
                  Secure account access · Manage orders and wishlist · Your information stays within
                  your account
                </p>
              ) : null}
            </div>
          </Reveal>
        </main>
      </div>
    </div>
  );
}
