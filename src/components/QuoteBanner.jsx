import './QuoteBanner.css';

export default function QuoteBanner() {
  return (
    <section className="quote-banner-section">
      <button className="quote-nav-btn prev" aria-label="Previous quote">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 12H6M10 16l-4-4 4-4"/>
        </svg>
      </button>

      <div className="quote-content">
        <div className="quote-author-row">
          <img src="/images/Ellipse 519.png" alt="Jenny Wilson" className="quote-avatar" />
          <div className="quote-author-details">
            <div className="quote-stars">
              <span style={{ color: '#FABB05' }}>★</span>
              <span style={{ color: '#FABB05' }}>★</span>
              <span style={{ color: '#FABB05' }}>★</span>
              <span style={{ color: '#FABB05' }}>★</span>
              <span style={{ color: '#e0e0e0' }}>★</span>
            </div>
            <div className="quote-author-name">Jenny Wilson</div>
          </div>
        </div>
        <p className="quote-banner-text">
          “Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.”
        </p>
      </div>

      <button className="quote-nav-btn next" aria-label="Next quote">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 12h12M14 8l4 4-4 4"/>
        </svg>
      </button>
    </section>
  );
}
