import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from './icons';
import './Testimonials.css';

const testimonials = [
  {
    name: 'Jenny Wilson',
    avatar: '/images/testimonial-jenny-wilson.png',
    rating: 4,
    quote:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    name: 'Sarah Mitchell',
    avatar: '/images/testimonial-sarah-mitchell.png',
    rating: 5,
    quote:
      'The craftsmanship is absolutely stunning. Every piece feels luxurious and timeless.',
  },
  {
    name: 'Emily Chen',
    avatar: '/images/testimonial-emily-chen.png',
    rating: 4,
    quote:
      'Beautiful jewelry with exceptional attention to detail. Highly recommend.',
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const t = testimonials[current];

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  return (
    <section id="testimonials" className="testimonial-section">
      <div className="testimonial-inner">
        <div className="testimonial-slider-row">
          <button type="button" className="testimonial-nav-btn" onClick={prev} aria-label="Previous testimonial">
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          <div className="testimonial-content-block">
            <div className="testimonial-profile-row">
              <img src={t.avatar} alt={t.name} className="testimonial-avatar" />
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
