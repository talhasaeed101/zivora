import './NewsletterOffer.css';

export default function NewsletterOffer() {
  return (
    <section className="offer-section">
      <img
        src="/images/newsletter-offer-bg.png"
        alt="Gold rings with baby's breath flowers"
        className="offer-background-image"
      />
      <div className="offer-overlay-tint" />

      <div className="offer-content-wrap">
        <div className="offer-text-block">
          <div className="offer-label-row">
            <span className="offer-label-line" />
            <span className="offer-label-text">OFFER</span>
            <span className="offer-label-line" />
          </div>
          <h2 className="offer-heading">Get 10% Off Your First Purchase</h2>
          <p className="offer-subtext">Subscribe to our newsletter and get 10% discount</p>
          <form className="offer-form-row" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your Email Address"
              className="offer-email-input"
            />
            <button type="submit" className="offer-subscribe-btn">Subscribe</button>
          </form>
        </div>
      </div>
    </section>
  );
}
