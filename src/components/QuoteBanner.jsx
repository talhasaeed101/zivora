import { useState } from 'react';
import SafeImage from './SafeImage.jsx';
import { AVATAR_PLACEHOLDER } from '../utils/images.js';
import { TESTIMONIALS } from '../data/testimonials.js';
import './QuoteBanner.css';

export default function QuoteBanner() {
  const [current, setCurrent] = useState(0);
  const quote = TESTIMONIALS[current];

  const prev = () => setCurrent((index) => (index === 0 ? TESTIMONIALS.length - 1 : index - 1));
  const next = () => setCurrent((index) => (index === TESTIMONIALS.length - 1 ? 0 : index + 1));

  return (
    <section className="quote-banner-section">
      <button type="button" className="quote-nav-btn prev" onClick={prev} aria-label="Previous quote">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 12H6M10 16l-4-4 4-4"/>
        </svg>
      </button>

      <div className="quote-content">
        <div className="quote-author-row">
          <SafeImage src={AVATAR_PLACEHOLDER} alt={quote.name} className="quote-avatar" />
          <div className="quote-author-details">
            <div className="quote-stars">
              {[...Array(5)].map((_, index) => (
                <span key={index} style={{ color: index < quote.rating ? '#FABB05' : '#ddd' }}>★</span>
              ))}
            </div>
            <div className="quote-author-name">{quote.name}</div>
          </div>
        </div>
        <p className="quote-banner-text">&ldquo;{quote.quote}&rdquo;</p>
      </div>

      <button type="button" className="quote-nav-btn next" onClick={next} aria-label="Next quote">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 12h12M14 8l4 4-4 4"/>
        </svg>
      </button>
    </section>
  );
}
