import { useState } from 'react';
import './NewsletterOffer.css';
import { publicEngagementApi } from '../services/api.js';
import Reveal from './Reveal.jsx';

export default function NewsletterOffer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      await publicEngagementApi.subscribeNewsletter({ email, source: 'offer-banner' });
      setMessage('Subscribed successfully. Check your inbox for your discount.');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Subscription failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="offer-section" aria-label="Newsletter offer">
      <Reveal className="offer-content" variant="fade-up">
        <div className="offer-label-row">
          <span className="offer-label-line" />
          <span className="offer-label-text">OFFER</span>
          <span className="offer-label-line" />
        </div>
        <h2 className="offer-heading">Get 10% Off Your First<br />Purchase</h2>
        <p className="offer-text">Subscribe to our newsletter and get 10% discount</p>
        <form className="offer-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Your Email Address"
            required
            className="offer-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
            aria-label="Email address"
          />
          <button
            type="submit"
            className={`offer-submit-btn${submitting ? ' is-loading' : ''}`}
            disabled={submitting}
          >
            {submitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        {message && (
          <p className="offer-feedback offer-feedback-success" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="offer-feedback offer-feedback-error" role="alert">
            {error}
          </p>
        )}
      </Reveal>
    </section>
  );
}
