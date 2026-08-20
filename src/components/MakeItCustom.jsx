import { Link } from 'react-router-dom';
import './MakeItCustom.css';
import { ROUTES } from '../utils/navigation';
import SafeImage from './SafeImage.jsx';
import Reveal from './Reveal.jsx';

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
    image: '/images/aaa.png',
    alt: 'Minimal rings on hand',
    showButton: false,
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
        <Reveal as="header" className="custom-header" variant="fade-up">
          <div className="custom-label-row">
            <span className="custom-label-line" />
            <span className="custom-label-text">MAKE IT CUSTOM</span>
            <span className="custom-label-line" />
          </div>
          <h2 className="custom-heading">Upgrade the Way You Relax</h2>
          <p className="custom-subtext">
            Experience premium comfort designed to help you relax, recharge, and feel your best every day.
          </p>
        </Reveal>

        <div className="custom-mobile-stack reveal-stagger">
          {CUSTOM_CARDS.map((card, index) => (
            <Reveal
              key={card.label}
              as={Link}
              to={ROUTES.collection}
              prefetch="intent"
              className="custom-overlay-card"
              variant="fade-up"
              delay={index * 90}
            >
              <SafeImage src={card.image} alt={card.alt} className="custom-overlay-image" />
              <div className="custom-overlay custom-overlay-mobile">
                <div className="custom-overlay-label-row">
                  <span className="custom-overlay-line" />
                  <span className="custom-overlay-label">{card.label}</span>
                  {card.showButton && (
                    <span className="custom-overlay-line custom-overlay-line-right" />
                  )}
                </div>
                <h3 className="custom-overlay-title">{card.title}</h3>
                {card.showButton && <span className="custom-shop-btn">Shop Collection</span>}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="custom-image-grid" variant="fade-up" delay={80}>
          <div className="custom-left-image-block">
            <Link to={ROUTES.collection} prefetch="intent" className="custom-image-link">
              <SafeImage
                src="/images/necklace image 1.png"
                alt="Minimal necklace close-up"
                className="custom-grid-image"
                width={720}
                height={900}
              />
              <div className="custom-overlay">
                <div className="custom-overlay-label-row">
                  <span className="custom-overlay-line" />
                  <span className="custom-overlay-label">NECKLACES</span>
                </div>
                <h3 className="custom-overlay-title">Minimal Necklace</h3>
                <span className="custom-shop-btn">Shop Collection</span>
              </div>
            </Link>
          </div>

          <div className="custom-right-column">
            <div className="custom-right-top-block">
              <Link to={ROUTES.collection} prefetch="intent" className="custom-image-link" aria-label="Shop rings collection">
                <SafeImage
                  src="/images/aaa.png"
                  alt="Minimal rings on hand"
                  className="custom-grid-image"
                  width={640}
                  height={480}
                />
              </Link>
            </div>

            <div className="custom-right-bottom-block">
              <Link to={ROUTES.collection} prefetch="intent" className="custom-image-link">
                <SafeImage
                  src="/images/Rectangle 3298.png"
                  alt="Minimal earrings close-up"
                  className="custom-grid-image"
                  width={640}
                  height={480}
                />
                <div className="custom-overlay">
                  <div className="custom-overlay-label-row">
                    <span className="custom-overlay-line" />
                    <span className="custom-overlay-label">EARRINGS</span>
                  </div>
                  <h3 className="custom-overlay-title">Minimal Earrings</h3>
                </div>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
