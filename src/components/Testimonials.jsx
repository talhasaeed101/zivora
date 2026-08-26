import { useEffect, useRef, useState } from 'react';
import { StarIcon } from './icons';
import { AVATAR_PLACEHOLDER } from '../utils/images.js';
import { TESTIMONIALS } from '../data/testimonials.js';
import './Testimonials.css';

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [animClass, setAnimClass] = useState('');
  const animTimeout = useRef(null);

  const goTo = (nextIndex, direction) => {
    if (animClass) return; // prevent rapid clicks mid-animation
    setAnimClass(direction === 'next' ? 'slide-in-right' : 'slide-in-left');
    clearTimeout(animTimeout.current);
    animTimeout.current = setTimeout(() => {
      setCurrent(nextIndex);
      setAnimClass('');
    }, 420);
  };

  const prev = () => {
    const nextIndex = current === 0 ? TESTIMONIALS.length - 1 : current - 1;
    goTo(nextIndex, 'prev');
  };

  const next = () => {
    const nextIndex = current === TESTIMONIALS.length - 1 ? 0 : current + 1;
    goTo(nextIndex, 'next');
  };

  // Auto-advance every 3 seconds
  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrent((c) => {
        const nextIndex = c === TESTIMONIALS.length - 1 ? 0 : c + 1;
        setAnimClass('slide-in-right');
        clearTimeout(animTimeout.current);
        animTimeout.current = setTimeout(() => {
          setCurrent(nextIndex);
          setAnimClass('');
        }, 420);
        return c; // keep old index until animation completes
      });
    }, 3000);
    return () => {
      window.clearInterval(interval);
      clearTimeout(animTimeout.current);
    };
  }, []);

  const t = TESTIMONIALS[current];

  return (
    <section id="testimonials" className="testimonial-section">
      <div className="testimonial-inner">
        <div className="testimonial-slider-row">
          {/* Left arrow — desktop only */}
          <img
            onClick={prev}
            src="/images/left.svg"
            alt="Previous testimonial"
            className="testimonial-quote-icon testimonial-arrow-desktop"
          />

          {/* Clipping viewport */}
          <div className="testimonial-track-outer">
            <div className={`testimonial-content-block ${animClass}`}>
              <div className="testimonial-profile-row">
                <img
                  src="/images/avatar.svg"
                  alt={t.name}
                  className="testimonial-profile-image"
                  onError={(e) => { e.target.src = AVATAR_PLACEHOLDER; }}
                />
                <div className="testimonial-profile-meta">
                  <div className="testimonial-stars-row" aria-label={`${t.rating} out of 5 stars`}>
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        viewBox="0 0 20 20"
                        className={`testimonial-star ${i < t.rating ? 'testimonial-star-filled' : 'testimonial-star-empty'}`}
                        fill={i < t.rating ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="1.2"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="testimonial-author-name">{t.name}</p>
                </div>
              </div>

              <blockquote className="testimonial-quote-text">&ldquo;{t.quote}&rdquo;</blockquote>

              {/* Mobile-only arrows — centered below quote */}
              <div className="testimonial-arrows-mobile">
                <img onClick={prev} src="/images/left.svg" alt="Previous" className="testimonial-quote-icon" />
                <img onClick={next} src="/images/rught.svg" alt="Next" className="testimonial-quote-icon" />
              </div>
            </div>
          </div>

          {/* Right arrow — desktop only */}
          <img
            onClick={next}
            src="/images/rught.svg"
            alt="Next testimonial"
            className="testimonial-quote-icon testimonial-arrow-desktop"
          />
        </div>
      </div>
    </section>
  );
}
