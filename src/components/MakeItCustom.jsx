import './MakeItCustom.css';
import { ROUTES } from '../utils/navigation';
import SafeImage from './SafeImage.jsx';

const CUSTOM_CARDS = [
  {
    label: 'NECKLACES',
    title: 'Minimal Necklace',
    image: '/images/necklace image 1.png',
    alt: 'Minimal necklace close-up',
    showButton: true,
  },
  {
    label: 'RINGS',
    title: 'Minimal Rings',
    image: '/images/Minimal Rings.png',
    alt: 'Minimal rings on hand',
    showButton: false,
    bakedText: true,
  },
  {
    label: 'EARRINGS',
    title: 'Minimal Earrings',
    image: '/images/Rectangle 3298.png',
    alt: 'Minimal earrings close-up',
    showButton: false,
  },
];

export default function MakeItCustom() {
  return (
    <section className="custom-section">
      <div className="custom-inner">
        <header className="custom-header">
          <div className="custom-label-row">
            <span className="custom-label-line" />
            <span className="custom-label-text">MAKE IT CUSTOM</span>
            <span className="custom-label-line" />
          </div>
          <h2 className="custom-heading">Upgrade the Way You Relax</h2>
          <p className="custom-subtext">
            Experience premium comfort designed to help you relax, recharge, and feel your best every day.
          </p>
        </header>

        <div className="custom-mobile-stack">
          {CUSTOM_CARDS.map((card) => (
            <a key={card.label} href={ROUTES.collection} className="custom-overlay-card">
              <SafeImage src={card.image} alt={card.alt} className="custom-overlay-image" />
              {!card.bakedText && (
                <div className="custom-overlay custom-overlay-mobile">
                  <div className="custom-overlay-label-row">
                    <span className="custom-overlay-line" />
                    <span className="custom-overlay-label">{card.label}</span>
                    {card.showButton && <span className="custom-overlay-line custom-overlay-line-right" />}
                  </div>
                  <h3 className="custom-overlay-title">{card.title}</h3>
                  {card.showButton && (
                    <span className="custom-shop-btn">Shop Collection</span>
                  )}
                </div>
              )}
            </a>
          ))}
        </div>

        <div className="custom-image-grid">
          <div className="custom-left-image-block">
            <a href={ROUTES.collection} className="custom-image-link">
              <SafeImage
                src="/images/necklace image 1.png"
                alt="Minimal necklace close-up"
                className="custom-grid-image"
              />
              <div className="custom-overlay">
                <div className="custom-overlay-label-row">
                  <span className="custom-overlay-line" />
                  <span className="custom-overlay-label">NECKLACES</span>
                </div>
                <h3 className="custom-overlay-title">Minimal Necklace</h3>
                <span className="custom-shop-btn">Shop Collection</span>
              </div>
            </a>
          </div>

          <div className="custom-right-column">
            <div className="custom-right-top-block">
              <a href={ROUTES.collection} className="custom-image-link">
                <SafeImage
                  src="/images/Minimal Rings.png"
                  alt="Minimal rings on hand"
                  className="custom-grid-image"
                />
              </a>
            </div>

            <div className="custom-right-bottom-block">
              <a href={ROUTES.collection} className="custom-image-link">
                <SafeImage
                  src="/images/Rectangle 3298.png"
                  alt="Minimal earrings close-up"
                  className="custom-grid-image"
                />
                <div className="custom-overlay">
                  <div className="custom-overlay-label-row">
                    <span className="custom-overlay-line" />
                    <span className="custom-overlay-label">EARRINGS</span>
                  </div>
                  <h3 className="custom-overlay-title">Minimal Earrings</h3>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
