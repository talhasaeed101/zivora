import './Hero.css';
import { ROUTES } from '../utils/navigation';
import SafeImage from './SafeImage.jsx';

const HERO_ARCH_IMAGE = '/images/image 3.png';
const HERO_PILL_IMAGE = '/images/image 1 (3).png';

const THUMBNAIL_IMAGES = [
  '/images/stack1.png',
  '/images/stack2.png',
  '/images/stack3.png',
  '/images/stack4.png',
];

const SHOP_BADGE = (
  <>
    <svg viewBox="0 0 100 100" width="120" height="120" className="hero-circular-rotating-svg" aria-hidden="true">
      <defs>
        <path id="heroCirclePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
      </defs>
      <text fontSize="8" fontWeight="600" letterSpacing="1px" fill="#000">
        <textPath href="#heroCirclePath" startOffset="0%">
          SHOP THE COLLECTION • SHOP THE COLLECTION •
        </textPath>
      </text>
    </svg>
    <div className="hero-circular-inner-button">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M9 18L15 12L9 6"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  </>
);

function CollectionRow() {
  return (
    <div className="hero-collection-row-container">
      <p className="hero-collection-title-text">COLLECTION</p>
      <div className="hero-collection-separator-line" />
      <div className="hero-collection-arrow-icon-wrapper">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 12H19M19 12L12 5M19 12L12 19"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="hero-collection-thumbnails-container">
        {THUMBNAIL_IMAGES.map((src, index) => (
          <SafeImage
            key={src}
            src={src}
            alt={`Collection preview ${index + 1}`}
            className="hero-collection-thumbnail"
          />
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-main-wrapper">
        <div className="hero-left-zone-container">
          <div className="hero-left-column-1">
            <div className="hero-pill-image-wrapper">
              <SafeImage
                src={HERO_PILL_IMAGE}
                alt="Zivora jewelry collection"
                className="hero-pill-image"
              />
            </div>
            <div className="hero-vertical-text-container">
              <p className="hero-vertical-text">PERFECT</p>
            </div>
          </div>

          <div className="hero-left-column-2">
            <div className="hero-vertical-text-container">
              <p className="hero-vertical-text">COLLECTIONS</p>
            </div>
          </div>
        </div>

        <div className="hero-content-column">
          <p className="hero-tagline-text">
            From everyday elegance to unforgettable celebrations, discover jewelry
            crafted with exceptional artistry.
          </p>

          <CollectionRow />
        </div>

        <div className="hero-right-zone-container">
          <div className="hero-arch-image-wrapper">
            <SafeImage
              src={HERO_ARCH_IMAGE}
              alt="Featured jewelry"
              className="hero-arch-image"
            />
          </div>

          <a href={ROUTES.collection} className="hero-circular-badge-container" aria-label="Shop the collection">
            {SHOP_BADGE}
          </a>
        </div>
      </div>

      <div className="mobile-hero-container">
        <div className="mobile-hero-top">
          <div className="hero-left-zone-container">
            <div className="hero-left-column-1">
              <div className="hero-pill-image-wrapper">
                <SafeImage
                  src={HERO_PILL_IMAGE}
                  alt="Zivora jewelry collection"
                  className="hero-pill-image"
                />
              </div>
              <div className="hero-vertical-text-container">
                <p className="hero-vertical-text">PERFECT</p>
              </div>
            </div>

            <div className="hero-left-column-2">
              <div className="hero-vertical-text-container">
                <p className="hero-vertical-text">COLLECTIONS</p>
              </div>
            </div>
          </div>

          <div className="mobile-hero-copy-block">
            <p className="hero-tagline-text">
              From everyday elegance to unforgettable celebrations, discover
              jewelry crafted with exceptional artistry.
            </p>

            <a
              href={ROUTES.collection}
              className="hero-circular-badge-container mobile-hero-badge"
              aria-label="Shop the collection"
            >
              {SHOP_BADGE}
            </a>

            <div className="mobile-collection-row">
              <CollectionRow />
            </div>
          </div>
        </div>

        <div className="mobile-hero-arch">
          <div className="hero-arch-image-wrapper">
            <SafeImage
              src={HERO_ARCH_IMAGE}
              alt="Featured jewelry"
              className="hero-arch-image"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
