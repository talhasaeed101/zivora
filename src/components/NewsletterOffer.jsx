import './NewsletterOffer.css';

export default function NewsletterOffer() {
  return (
    <section className="offer-section" aria-label="Newsletter offer">
      <div className="offer-content">
        <div className="offer-label-row">
          <span className="offer-label-line" />
          <span className="offer-label-text">OFFER</span>
          <span className="offer-label-line" />
        </div>
        <h2 className="offer-heading">Get 10% Off Your First<br />Purchase</h2>
        <p className="offer-text">
          Subscribe to our newsletter and get 10% discount
        </p>
        <form className="offer-form" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Your Email Address" required className="offer-input" />
          <button type="submit" className="offer-submit-btn">Subscribe</button>
        </form>
      </div>
    </section>
  );
}
