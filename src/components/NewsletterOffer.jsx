import './NewsletterOffer.css';

export default function NewsletterOffer() {
  return (
    <section className="offer-section" aria-label="Newsletter offer">
      <div className="offer-content">
        <img 
          src="/images/Get 10% Off Your First Purchase.png" 
          alt="Get 10% Off Your First Purchase - Subscribe to receive styling inspiration, new collection previews, and a welcome discount on your first Zivora order."
          style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
        />
      </div>
    </section>
  );
}
