import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from './icons';
import SafeImage from './SafeImage.jsx';
import { AVATAR_PLACEHOLDER } from '../utils/images.js';
import { TESTIMONIALS } from '../data/testimonials.js';
import './Testimonials.css';

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const t = TESTIMONIALS[current];

  const prev = () => setCurrent((c) => (c === 0 ? TESTIMONIALS.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === TESTIMONIALS.length - 1 ? 0 : c + 1));

  return (
    <section id="testimonials" className="testimonial-section">
      <div className="testimonial-inner">
        <div className="testimonial-slider-row">
          <button type="button" className="testimonial-nav-btn" onClick={prev} aria-label="Previous testimonial">
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          <div className="testimonial-content-block">
            <div className="testimonial-profile-row">
              <SafeImage src={AVATAR_PLACEHOLDER} alt={t.name} className="testimonial-avatar" />
              <div className="testimonial-profile-meta">
                <div className="testimonial-stars-row">
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

          <button type="button" className="testimonial-nav-btn" onClick={next} aria-label="Next testimonial">
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
