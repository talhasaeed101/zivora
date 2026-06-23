import { ROUTES, NAV_ROUTES, FOOTER_LINKS, getAccountRoute } from './utils/navigation';
import { useAuth } from './context/AuthContext.jsx';

const products = [
  { id: 1, image: '/images/stack1.png', showSale: false },
  { id: 2, image: '/images/stack2.png', showSale: false },
  { id: 3, image: '/images/stack3.png', showSale: true },
  { id: 4, image: '/images/stack4.png', showSale: true },
  { id: 5, image: '/images/stack5.png', showSale: true },
  { id: 6, image: '/images/stack1.png', showSale: false },
];

const categories = [
  { label: 'Rings', count: 124, checked: true },
  { label: 'Bracelets', count: 86, checked: false },
  { label: 'Necklaces', count: 72, checked: false },
  { label: 'Earrings', count: 54, checked: false },
  { label: 'Anklets', count: 32, checked: false },
];

const priceRanges = [
  { label: 'Rs. 500 to 999', checked: true },
  { label: 'Rs. 1,000 to 1,499', checked: false },
  { label: 'Rs. 1,500 to 1,999', checked: false },
  { label: 'Rs. 2,000 to 2,499', checked: false },
  { label: 'Rs. 2,500 and above', checked: false },
];

const footerLinks = ['Home', 'Collection', 'Gifts', 'Testimonials', 'Contact'];

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L16 16" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 21s-7-4.5-9.5-8.5C.5 7.5 3.5 4 7.5 4c2 0 3.5 1.5 4.5 3 1-1.5 2.5-3 4.5-3 4 0 7 3.5 5 6.5C19 16.5 12 21 12 21z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShoppingBagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 7h12l-1.2 12H7.2L6 7z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 7V5a3 3 0 016 0v2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
      <circle cx="18" cy="6" r="2" fill="currentColor" stroke="none" />
      <circle cx="6" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="14" cy="18" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13.4a8.16 8.16 0 005.58 2.18V12a4.83 4.83 0 003.82-1.84z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 8h3V4h-3c-2.76 0-5 2.24-5 5v2H6v4h3v8h4v-8h3l1-4h-4V9c0-.55.45-1 1-1z" />
    </svg>
  );
}

function ProductCard({ product, variant }) {
  const cardContent = variant === 'mobile' ? (
    <>
        <div className="sr-product-image-wrap sr-product-image-wrap-mobile">
          <img src={product.image} alt="Minimal stacked rings" className="sr-product-image" />
          {product.showSale && <span className="sr-sale-badge">Sale!</span>}
          <div className="sr-product-overlay">
            <div className="sr-product-info-row">
              <h3 className="sr-product-name sr-product-name-mobile">Minimal stacked rings</h3>
              <button type="button" className="sr-wishlist-btn" aria-label="Add to wishlist" onClick={(e) => e.preventDefault()}>
                <HeartIcon />
              </button>
            </div>
            <div className="sr-price-row">
              <span className="sr-price-current">Rs. 1,999</span>
              <span className="sr-price-original">Rs. 2,499</span>
            </div>
          </div>
        </div>
    </>
  ) : (
    <>
      <div className="sr-product-image-wrap">
        <img src={product.image} alt="Minimal stacked rings" className="sr-product-image" />
        {product.showSale && <span className="sr-sale-badge">Sale!</span>}
      </div>
      <div className="sr-product-info-row">
        <h3 className="sr-product-name">Minimal stacked rings</h3>
        <button type="button" className="sr-wishlist-btn" aria-label="Add to wishlist" onClick={(e) => e.preventDefault()}>
          <HeartIcon />
        </button>
      </div>
      <div className="sr-price-row">
        <span className="sr-price-current">Rs. 1,999</span>
        <span className="sr-price-original">Rs. 2,499</span>
      </div>
    </>
  );

  return (
    <a href={ROUTES.product} className={`sr-product-card-link ${variant === 'mobile' ? 'sr-product-card-link-mobile' : ''}`}>
      <article className={`sr-product-card ${variant === 'mobile' ? 'sr-product-card-mobile' : ''}`}>
        {cardContent}
      </article>
    </a>
  );
}

export default function SearchResults() {
  const { isAuthenticated } = useAuth();
  const accountPath = getAccountRoute(isAuthenticated);

  return (
    <>
      <style>{`
        @font-face {
          font-family: 'Teneka';
          src: url('/fonts/tenaka.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
        }
        @font-face {
          font-family: 'Teneka';
          src: url('/fonts/tenaka-italic.otf') format('opentype');
          font-weight: normal;
          font-style: italic;
        }

        .sr-page {
          --sr-accent: #967259;
          --sr-black: #000000;
          --sr-white: #ffffff;
          --sr-gray: #767676;
          --sr-gray-light: #999999;
          --sr-border: #e5e5e5;
          --sr-border-input: #dddddd;
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          color: var(--sr-black);
          background: var(--sr-white);
          min-height: 100vh;
        }

        .sr-page *,
        .sr-page *::before,
        .sr-page *::after {
          box-sizing: border-box;
        }

        /* ── Desktop Header ── */
        .sr-header-desktop {
          display: block;
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--sr-white);
          border-bottom: 1px solid var(--sr-border);
        }

        .sr-header-mobile {
          display: none;
        }

        .sr-header-inner {
          max-width: 1440px;
          margin: 0 auto;
          height: 90px;
          padding: 0 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sr-logo {
          font-family: Teneka, serif;
          font-size: 28px;
          letter-spacing: 2px;
          color: var(--sr-black);
          text-decoration: none;
          flex: 1;
        }

        .sr-nav {
          display: flex;
          align-items: center;
          gap: 40px;
          flex: 2;
          justify-content: center;
        }

        .sr-nav-link {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 1.5px;
          color: var(--sr-black);
          text-decoration: none;
        }

        .sr-nav-link-active {
          color: var(--sr-accent);
          font-weight: 600;
        }

        .sr-header-actions {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
          justify-content: flex-end;
        }

        .sr-product-card {
          display: flex;
          flex-direction: column;
        }

        .sr-product-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .sr-search-wrap {
          display: flex;
          align-items: center;
          border-bottom: 1px solid var(--sr-border-input);
          padding-bottom: 4px;
          width: 180px;
          gap: 8px;
        }

        .sr-search-input {
          flex: 1;
          font-size: 13px;
          font-style: italic;
          border: none;
          outline: none;
          background: transparent;
          color: var(--sr-black);
          font-family: inherit;
        }

        .sr-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          padding: 0;
          text-decoration: none;
          box-sizing: border-box;
        }

        .sr-cart-btn {
          background: var(--sr-black);
          color: var(--sr-white);
        }

        .sr-user-btn {
          background: var(--sr-white);
          border: 1px solid var(--sr-border-input);
          color: var(--sr-black);
        }

        /* ── Main Content ── */
        .sr-main {
          max-width: 1440px;
          margin: 0 auto;
          padding: 32px 80px 64px;
        }

        .sr-breadcrumbs {
          font-size: 12px;
          color: var(--sr-gray);
          margin-bottom: 16px;
        }

        .sr-breadcrumbs a {
          color: inherit;
          text-decoration: none;
        }

        .sr-breadcrumbs a:hover {
          color: var(--sr-black);
        }

        .sr-breadcrumbs span {
          color: var(--sr-black);
        }

        .sr-page-title {
          font-family: Teneka, serif;
          font-size: 32px;
          font-weight: 400;
          line-height: 1.3;
          margin: 0 0 24px;
        }

        .sr-page-title em {
          font-family: Teneka, serif;
          font-style: italic;
        }

        .sr-page-title-count {
          font-family: Inter, sans-serif;
          font-weight: 400;
          font-size: 32px;
        }

        .sr-page-title-count-mobile {
          display: none;
        }

        .sr-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-top: 1px solid var(--sr-border);
          border-bottom: 1px solid var(--sr-border);
          margin-bottom: 32px;
        }

        .sr-filters-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1.5px;
        }

        .sr-sort-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-family: inherit;
          background: var(--sr-white);
          border: 1px solid var(--sr-border-input);
          padding: 8px 16px;
          cursor: pointer;
          color: var(--sr-black);
        }

        .sr-sort-btn strong {
          font-weight: 600;
        }

        .sr-mobile-controls {
          display: none;
        }

        .sr-content-row {
          display: flex;
          gap: 48px;
        }

        /* ── Sidebar ── */
        .sr-sidebar {
          width: 220px;
          flex-shrink: 0;
        }

        .sr-filter-section {
          padding: 20px 0;
          border-bottom: 1px solid var(--sr-border);
        }

        .sr-filter-section:first-child {
          padding-top: 0;
        }

        .sr-filter-heading {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.2px;
          margin: 0 0 16px;
        }

        .sr-filter-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sr-filter-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--sr-black);
          cursor: pointer;
        }

        .sr-checkbox {
          width: 16px;
          height: 16px;
          border: 1px solid var(--sr-border-input);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sr-checkbox-checked {
          background: var(--sr-accent);
          border-color: var(--sr-accent);
        }

        .sr-checkbox-checked svg {
          display: block;
        }

        .sr-checkbox svg {
          display: none;
        }

        .sr-filter-count {
          color: var(--sr-gray);
        }

        .sr-color-swatches {
          display: flex;
          gap: 12px;
        }

        .sr-color-swatch {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid transparent;
        }

        .sr-color-swatch-gray {
          background: #d4d4d4;
        }

        .sr-color-swatch-gold {
          background: #c9a84c;
        }

        .sr-color-swatch-selected {
          border-color: var(--sr-black);
        }

        /* ── Product Grid ── */
        .sr-grid-wrap {
          flex: 1;
          min-width: 0;
        }

        .sr-product-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px 24px;
        }

        .sr-product-grid-mobile {
          display: none;
        }

        .sr-product-card {
          position: relative;
        }

        .sr-product-image-wrap {
          position: relative;
          border-top-left-radius: 200px;
          border-top-right-radius: 200px;
          overflow: hidden;
        }

        .sr-product-image {
          width: 100%;
          aspect-ratio: 368 / 470;
          object-fit: cover;
          display: block;
          background: #f0ebe4;
        }

        .sr-sale-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: var(--sr-black);
          color: var(--sr-white);
          font-family: Teneka, serif;
          font-size: 10px;
          font-style: italic;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          z-index: 2;
        }

        .sr-product-info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 12px;
          gap: 8px;
        }

        .sr-product-name {
          font-family: Teneka, serif;
          font-size: 16px;
          font-weight: 400;
          margin: 0;
          line-height: 1.4;
        }

        .sr-wishlist-btn {
          background: none;
          border: none;
          color: var(--sr-gray-light);
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .sr-price-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
        }

        .sr-price-current {
          font-size: 14px;
          font-weight: 600;
        }

        .sr-price-original {
          font-size: 12px;
          color: var(--sr-gray-light);
          text-decoration: line-through;
        }

        /* ── Pagination ── */
        .sr-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 48px;
          padding: 24px 0;
        }

        .sr-page-btn {
          font-family: inherit;
          font-size: 13px;
          padding: 10px 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sr-page-btn-prev {
          background: var(--sr-white);
          border: 1px solid var(--sr-border-input);
          color: var(--sr-gray);
        }

        .sr-page-btn-next {
          background: var(--sr-black);
          border: 1px solid var(--sr-black);
          color: var(--sr-white);
          font-weight: 500;
        }

        .sr-page-numbers {
          display: flex;
          align-items: center;
          gap: 20px;
          margin: 0 16px;
        }

        .sr-page-num {
          font-size: 14px;
          color: var(--sr-gray);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          position: relative;
          font-family: inherit;
        }

        .sr-page-num-active {
          color: var(--sr-black);
          font-weight: 600;
        }

        .sr-page-num-active::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--sr-black);
        }

        /* ── Footer ── */
        .sr-footer {
          background: var(--sr-black);
          color: var(--sr-white);
        }

        .sr-footer-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 64px 80px 32px;
        }

        .sr-footer-logo {
          font-family: Teneka, serif;
          font-size: 32px;
          text-align: center;
          margin: 0 0 32px;
        }

        .sr-footer-form {
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 420px;
          margin: 0 auto 40px;
        }

        .sr-footer-email {
          flex: 1;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.4);
          color: var(--sr-white);
          padding: 12px 20px;
          font-size: 14px;
          outline: none;
          font-family: inherit;
        }

        .sr-footer-email::placeholder {
          color: #888;
        }

        .sr-footer-submit {
          background: var(--sr-white);
          color: var(--sr-black);
          border: none;
          font-size: 14px;
          padding: 13px 28px;
          cursor: pointer;
          font-family: inherit;
        }

        .sr-footer-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 32px;
          margin-bottom: 40px;
        }

        .sr-footer-nav-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: var(--sr-white);
          text-decoration: none;
        }

        .sr-footer-bottom {
          border-top: 1px solid #2a2a2a;
          padding-top: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #888;
        }

        .sr-footer-legal {
          display: flex;
          gap: 24px;
        }

        .sr-footer-legal a {
          color: #888;
          text-decoration: none;
        }

        .sr-footer-social {
          display: flex;
          gap: 16px;
          color: var(--sr-white);
        }

        .sr-footer-social a {
          color: var(--sr-white);
          display: flex;
        }

        .sr-footer-nav-mobile {
          display: none;
        }

        .sr-footer-bottom-mobile {
          display: none;
        }

        /* ── Mobile (768px and below) ── */
        @media (max-width: 768px) {
          .sr-header-desktop {
            display: none;
          }

          .sr-header-mobile {
            display: block;
            background: var(--sr-white);
            border-bottom: 1px solid var(--sr-border);
            padding: 16px 20px;
          }

          .sr-mobile-header-row {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .sr-mobile-search {
            flex: 1;
            display: flex;
            align-items: center;
            border: 1px solid var(--sr-border-input);
            border-radius: 24px;
            padding: 10px 16px;
            gap: 8px;
          }

          .sr-mobile-search input {
            flex: 1;
            border: none;
            outline: none;
            font-size: 14px;
            font-family: inherit;
            color: var(--sr-gray);
            background: transparent;
          }

          .sr-mobile-search input::placeholder {
            color: #aaa;
          }

          .sr-mobile-menu-btn {
            width: 44px;
            height: 44px;
            border: 1px solid var(--sr-border-input);
            border-radius: 8px;
            background: var(--sr-white);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 5px;
            cursor: pointer;
            flex-shrink: 0;
            padding: 0;
          }

          .sr-mobile-menu-btn span {
            display: block;
            width: 18px;
            height: 2px;
            background: var(--sr-black);
          }

          .sr-main {
            padding: 20px 20px 48px;
          }

          .sr-breadcrumbs {
            font-size: 11px;
            margin-bottom: 12px;
          }

          .sr-page-title {
            font-size: 22px;
            margin-bottom: 8px;
          }

          .sr-page-title-count {
            display: none;
          }

          .sr-page-title-count-mobile {
            display: block;
            font-family: Inter, sans-serif;
            font-size: 12px;
            color: var(--sr-gray);
            margin: 0 0 20px;
          }

          .sr-toolbar {
            display: none;
          }

          .sr-mobile-controls {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
          }

          .sr-mobile-filter-btn,
          .sr-mobile-sort-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 13px;
            font-family: inherit;
            background: var(--sr-white);
            border: 1px solid var(--sr-border-input);
            border-radius: 4px;
            padding: 12px 14px;
            cursor: pointer;
            color: var(--sr-black);
          }

          .sr-mobile-sort-btn {
            flex: 1.4;
            justify-content: space-between;
          }

          .sr-mobile-sort-btn strong {
            font-weight: 600;
          }

          .sr-content-row {
            flex-direction: column;
            gap: 0;
          }

          .sr-sidebar {
            display: none;
          }

          .sr-product-grid {
            display: none;
          }

          .sr-product-grid-mobile {
            display: flex;
            flex-direction: column;
            gap: 32px;
          }

          .sr-product-image-wrap-mobile {
            border-top-left-radius: 180px;
            border-top-right-radius: 180px;
          }

          .sr-product-image-wrap-mobile .sr-product-image {
            aspect-ratio: 390 / 480;
          }

          .sr-product-overlay {
            position: absolute;
            bottom: 16px;
            left: 16px;
            right: 16px;
            background: var(--sr-white);
            padding: 14px 16px 12px;
            box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
          }

          .sr-product-overlay .sr-product-info-row {
            margin-top: 0;
          }

          .sr-product-overlay .sr-price-row {
            margin-top: 6px;
          }

          .sr-product-name-mobile {
            font-family: Inter, sans-serif;
            font-size: 14px;
            font-weight: 500;
          }

          .sr-pagination {
            margin-top: 32px;
            gap: 4px;
            flex-wrap: wrap;
          }

          .sr-page-btn {
            font-size: 12px;
            padding: 8px 14px;
          }

          .sr-page-numbers {
            gap: 14px;
            margin: 0 8px;
          }

          .sr-page-num {
            font-size: 13px;
          }

          .sr-footer-inner {
            padding: 48px 24px 24px;
          }

          .sr-footer-nav {
            display: none;
          }

          .sr-footer-nav-mobile {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 16px 28px;
            max-width: 300px;
            margin: 0 auto 32px;
          }

          .sr-footer-nav-mobile .sr-footer-nav-item {
            font-size: 13px;
            white-space: nowrap;
          }

          .sr-footer-bottom {
            display: none;
          }

          .sr-footer-bottom-mobile {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            border-top: 1px solid #2a2a2a;
            padding-top: 24px;
          }

          .sr-footer-social-mobile {
            display: flex;
            gap: 20px;
          }

          .sr-footer-legal-mobile {
            display: flex;
            gap: 24px;
            font-size: 10px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #888;
          }

          .sr-footer-legal-mobile a {
            color: #888;
            text-decoration: none;
          }

          .sr-footer-copyright-mobile {
            font-size: 10px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #888;
            margin: 0;
          }
        }

        /* ── Desktop only (1024px+) fine-tuning ── */
        @media (min-width: 769px) and (max-width: 1023px) {
          .sr-header-inner,
          .sr-main,
          .sr-footer-inner {
            padding-left: 40px;
            padding-right: 40px;
          }

          .sr-product-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <div className="sr-page">
        {/* Desktop Header */}
        <header className="sr-header-desktop">
          <div className="sr-header-inner">
            <a href={ROUTES.home} className="sr-logo">ZIVORA</a>
            <nav className="sr-nav">
              <a href={NAV_ROUTES.HOME} className="sr-nav-link">HOME</a>
              <a href={NAV_ROUTES.COLLECTION} className="sr-nav-link sr-nav-link-active">COLLECTION</a>
              <a href={NAV_ROUTES.BUNDLES} className="sr-nav-link">BUNDLES</a>
              <a href={NAV_ROUTES.TESTIMONIALS} className="sr-nav-link">TESTIMONIALS</a>
              <a href={NAV_ROUTES.CONTACT} className="sr-nav-link">CONTACT</a>
            </nav>
            <div className="sr-header-actions">
              <form className="sr-search-wrap" onSubmit={(e) => { e.preventDefault(); window.location.href = ROUTES.search; }}>
                <input type="search" defaultValue="Rings" className="sr-search-input" aria-label="Search" />
                <button type="submit" aria-label="Search" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
                  <SearchIcon />
                </button>
              </form>
              <a href={ROUTES.cart} className="sr-icon-btn sr-cart-btn" aria-label="Cart">
                <ShoppingBagIcon />
              </a>
              <a href={accountPath} className="sr-icon-btn sr-user-btn" aria-label="Account">
                <UserIcon />
              </a>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="sr-header-mobile">
          <div className="sr-mobile-header-row">
            <div className="sr-mobile-search">
              <input type="search" placeholder="Search" aria-label="Search" />
              <SearchIcon />
            </div>
            <button type="button" className="sr-mobile-menu-btn" aria-label="Menu">
              <span />
              <span />
            </button>
          </div>
        </header>

        <main className="sr-main">
          <p className="sr-breadcrumbs">
            <a href={ROUTES.home}>Home</a> &gt; <a href={ROUTES.search}>Products</a> &gt; <span>Rings</span>
          </p>

          <h1 className="sr-page-title">
            Showing product for <em>&apos;Rings&apos;</em>
            <span className="sr-page-title-count"> (24 Products)</span>
          </h1>
          <p className="sr-page-title-count-mobile">(124 Products)</p>

          <div className="sr-toolbar">
            <span className="sr-filters-label">FILTERS</span>
            <button type="button" className="sr-sort-btn">
              Short by: <strong>Recommended</strong>
              <ChevronDownIcon />
            </button>
          </div>

          <div className="sr-mobile-controls">
            <button type="button" className="sr-mobile-filter-btn">
              Filters
              <FilterIcon />
            </button>
            <button type="button" className="sr-mobile-sort-btn">
              <span>Short by: <strong>Recommended</strong></span>
              <ChevronDownIcon />
            </button>
          </div>

          <div className="sr-content-row">
            <aside className="sr-sidebar">
              <div className="sr-filter-section">
                <h2 className="sr-filter-heading">CATEGORIES</h2>
                <ul className="sr-filter-list">
                  {categories.map((cat) => (
                    <li key={cat.label} className="sr-filter-item">
                      <span className={`sr-checkbox ${cat.checked ? 'sr-checkbox-checked' : ''}`}>
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {cat.label} <span className="sr-filter-count">({cat.count} items)</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sr-filter-section">
                <h2 className="sr-filter-heading">PRICE</h2>
                <ul className="sr-filter-list">
                  {priceRanges.map((range) => (
                    <li key={range.label} className="sr-filter-item">
                      <span className={`sr-checkbox ${range.checked ? 'sr-checkbox-checked' : ''}`}>
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {range.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sr-filter-section">
                <h2 className="sr-filter-heading">COLOR</h2>
                <div className="sr-color-swatches">
                  <span className="sr-color-swatch sr-color-swatch-gray" aria-label="Gray" />
                  <span className="sr-color-swatch sr-color-swatch-gold sr-color-swatch-selected" aria-label="Gold" />
                </div>
              </div>
            </aside>

            <div className="sr-grid-wrap">
              <div className="sr-product-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} variant="desktop" />
                ))}
              </div>

              <div className="sr-product-grid-mobile">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} variant="mobile" />
                ))}
              </div>

              <nav className="sr-pagination" aria-label="Pagination">
                <button type="button" className="sr-page-btn sr-page-btn-prev">
                  &lt; Previous
                </button>
                <div className="sr-page-numbers">
                  <button type="button" className="sr-page-num sr-page-num-active">1</button>
                  <button type="button" className="sr-page-num">2</button>
                  <button type="button" className="sr-page-num">3</button>
                  <span className="sr-page-num">...</span>
                  <button type="button" className="sr-page-num">10</button>
                </div>
                <button type="button" className="sr-page-btn sr-page-btn-next">
                  Next &gt;
                </button>
              </nav>
            </div>
          </div>
        </main>

        <footer className="sr-footer">
          <div className="sr-footer-inner">
            <a href={ROUTES.home} className="sr-footer-logo">ZIVORA</a>

            <form className="sr-footer-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter Your Email Address" className="sr-footer-email" />
              <button type="submit" className="sr-footer-submit">Submit</button>
            </form>

            <nav className="sr-footer-nav">
              {footerLinks.map((link) => (
                <a key={link} href={FOOTER_LINKS[link]} className="sr-footer-nav-item">
                  <span>•</span> {link}
                </a>
              ))}
            </nav>

            <nav className="sr-footer-nav-mobile">
              <a href={FOOTER_LINKS.Home} className="sr-footer-nav-item"><span>•</span> Home</a>
              <a href={FOOTER_LINKS.Collections} className="sr-footer-nav-item"><span>•</span> Collections</a>
              <a href={FOOTER_LINKS.Gifts} className="sr-footer-nav-item"><span>•</span> Gifts</a>
              <a href={FOOTER_LINKS.Testimonials} className="sr-footer-nav-item"><span>•</span> Testimonials</a>
              <a href={FOOTER_LINKS.Contact} className="sr-footer-nav-item"><span>•</span> Contact</a>
            </nav>

            <div className="sr-footer-bottom">
              <p>©2026 ZIVORA. ALL RIGHTS RESERVED</p>
              <div className="sr-footer-legal">
                <a href={ROUTES.home}>PRIVACY POLICY</a>
                <a href={ROUTES.home}>TERMS OF USES</a>
              </div>
              <div className="sr-footer-social">
                <a href={ROUTES.home} aria-label="Instagram"><InstagramIcon /></a>
                <a href={ROUTES.home} aria-label="TikTok"><TikTokIcon /></a>
                <a href={ROUTES.home} aria-label="Facebook"><FacebookIcon /></a>
              </div>
            </div>

            <div className="sr-footer-bottom-mobile">
              <div className="sr-footer-social-mobile">
                <a href={ROUTES.home} aria-label="Instagram"><InstagramIcon /></a>
                <a href={ROUTES.home} aria-label="TikTok"><TikTokIcon /></a>
                <a href={ROUTES.home} aria-label="Facebook"><FacebookIcon /></a>
              </div>
              <div className="sr-footer-legal-mobile">
                <a href={ROUTES.home}>PRIVACY POLICY</a>
                <a href={ROUTES.home}>TERMS OF USES</a>
              </div>
              <p className="sr-footer-copyright-mobile">©2026 ZIVORA. ALL RIGHTS RESERVED</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
