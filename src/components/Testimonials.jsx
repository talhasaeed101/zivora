import { useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from './icons';
import SafeImage from './SafeImage.jsx';
import Reveal from './Reveal.jsx';
import { AVATAR_PLACEHOLDER } from '../utils/images.js';
import { TESTIMONIALS } from '../data/testimonials.js';
import './Testimonials.css';

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [switching, setSwitching] = useState(false);
  const isFirstRender = useRef(true);
  const t = TESTIMONIALS[current];

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return undefined;
    }

    setSwitching(true);
    const timer = window.setTimeout(() => setSwitching(false), 480);
    return () => window.clearTimeout(timer);
  }, [current]);

  const prev = () => setCurrent((c) => (c === 0 ? TESTIMONIALS.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === TESTIMONIALS.length - 1 ? 0 : c + 1));

  return (
    <section id="testimonials" className="testimonial-section">
      <Reveal className="testimonial-inner" variant="fade-up">
        <div className="testimonial-slider-container">
          <div
            key={current}
            className={`testimonial-content-block${switching ? ' is-switching' : ''}`}
          >
            <div className="testimonial-profile-row">
              <img src ="/images/avatar.svg" alt={t.name} className="testimonial-profile-image" onError={(e) => { e.target.src = AVATAR_PLACEHOLDER; }} />
              <div className="testimonial-profile-meta">
                <div className="testimonial-stars-row" aria-label={`${t.rating} out of 5 stars`}>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      filled={i < t.rating}
                      className={`w-3.5 h-3.5 ${i < t.rating ? 'testimonial-star-filled' : 'testimonial-star-empty'}`}
                    />
                  ))}
                </div>
                <p className="testimonial-author-name">{t.name}</p>
              </div>
            </div>
            <blockquote className="testimonial-quote-text">&ldquo;{t.quote}&rdquo;</blockquote>
          </div>
          <div className="testimonial-nav-row">
            <img onClick={prev} src="/images/left.svg" alt="Previous" className="testimonial-quote-icon" style={{ cursor: 'pointer' }} />
            <img onClick={next} src="/images/rught.svg" alt="Next" className="testimonial-quote-icon" style={{ cursor: 'pointer' }} />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
