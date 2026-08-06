import "./MakeItCustom.css";
import { ROUTES } from "../utils/navigation";
import SafeImage from "./SafeImage.jsx";
import Reveal from "./Reveal.jsx";

const CUSTOM_CARDS = [
  {
    label: "NECKLACES",
    title: "Minimal Necklace",
    image: "/images/Minimal Necklace.png",
    alt: "Minimal necklace close-up",
    showButton: true,
  },
  {
    label: "RINGS",
    title: "Minimal Rings",
    image: "/images/mmrings.png",
    alt: "Minimal rings on hand",
    showButton: false,
  },
  {
    label: "EARRINGS",
    title: "Minimal Earrings",
    image: "/images/mmearning.png",
    alt: "Minimal earrings close-up",
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
            Experience premium comfort designed to help you relax, recharge, and
            feel your best every day.
          </p>
        </Reveal>

        <div className="custom-mobile-stack reveal-stagger">
          {CUSTOM_CARDS.map((card, index) => (
            <Reveal
              key={card.label}
              as="a"
              href={ROUTES.collection}
              className="custom-overlay-card"
              variant="fade-up"
              delay={index * 90}
            >
              <SafeImage
                src={card.image}
                alt={card.alt}
                className="custom-overlay-image"
              />
              <div className="custom-overlay custom-overlay-mobile">
                <div className="custom-overlay-label-row">
                  <span className="custom-overlay-line" />
                  <span className="custom-overlay-label">{card.label}</span>
                  {card.showButton && (
                    <span className="custom-overlay-line custom-overlay-line-right" />
                  )}
                </div>
                <h3 className="custom-overlay-title">{card.title}</h3>
                {card.showButton && (
                  <span className="custom-shop-btn">Shop Collection</span>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="custom-image-grid" variant="fade-up" delay={80}>
          <div className="custom-left-image-block">
            <a href={ROUTES.collection} className="custom-image-link">
              <SafeImage
                src="/images/Minimal Necklace.png"
                alt="Minimal necklace close-up"
                className="custom-grid-image"
              />
              <div className="custom-overlay custom-overlay--main">
                <div className="custom-overlay-label-row">
                  <span className="custom-overlay-line" />
                  <span className="custom-overlay-label">NECKLACES</span>
                  <span className="custom-overlay-line" />
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
                  src="/images/mmrings.png"
                  alt="Minimal rings on hand"
                  className="custom-grid-image"
                />
                <div className="custom-overlay">
                  <div className="custom-overlay-label-row">
                    <span className="custom-overlay-line" />
                    <span className="custom-overlay-label">RINGS</span>
                    <span className="custom-overlay-line" />
                  </div>

                  <h3 className="custom-overlay-title">Minimal Rings</h3>
                </div>
              </a>
            </div>

            <div className="custom-right-bottom-block">
              <a href={ROUTES.collection} className="custom-image-link">
                <SafeImage
                  src="/images/mmearning.png"
                  alt="Minimal earrings close-up"
                  className="custom-grid-image"
                />
                <div className="custom-overlay">
                  <div className="custom-overlay-label-row">
                    <span className="custom-overlay-line" />
                    <span className="custom-overlay-label">EARRINGS</span>
                    <span className="custom-overlay-line" />
                  </div>

                  <h3 className="custom-overlay-title">Minimal Earrings</h3>
                </div>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
