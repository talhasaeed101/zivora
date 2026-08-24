import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';
import { ROUTES } from '../utils/navigation';
import SafeImage from './SafeImage.jsx';

const HERO_ARCH_IMAGE = '/images/hero00.png';
const HERO_PILL_IMAGE_SVG = '/images/hero1.svg';
const HERO_PILL_IMAGE = '/images/hero111.png';

const HERO_TAGLINE =
  'From everyday elegance to unforgettable celebrations, discover jewelry crafted with exceptional artistry.';



function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function useHeroTaglineTypewriter(text) {
  const reducedMotion = prefersReducedMotion();
  const [displayed, setDisplayed] = useState(reducedMotion ? text : '');
  const [done, setDone] = useState(reducedMotion);

  useEffect(() => {
    if (prefersReducedMotion()) {
      return undefined;
    }

    let index = 0;
    let intervalId;

    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        index += 1;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) {
          window.clearInterval(intervalId);
          setDone(true);
        }
      }, 28);
    }, 450);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [text]);

  return { displayed, done };
}

function HeroTagline({ displayed, done }) {
  return (
    <h1 className="hero-tagline-text" aria-label={HERO_TAGLINE}>
      <span className="sr-only">{HERO_TAGLINE}</span>
      <span aria-hidden="true">{displayed}</span>
      {!done && <span className="hero-tagline-caret" aria-hidden="true" />}
    </h1>
  );
}
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

      <div className='djdjdjdjdjdjddj'>
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
          <SafeImage
            src="/images/collection.svg"
            alt="Collection preview"
            className="hero-collection-thumbnail-single"
            style={{ width: '180px', height: '60px', objectFit: 'cover' }}
          />
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const { displayed, done } = useHeroTaglineTypewriter(HERO_TAGLINE);

  return (
    <section className="hero-section">
      <div className="hero-main-wrapper">
        <div className="hero-left-zone-container">
          <div className="hero-left-column-1">
            <div className="hero-pill-image-wrapper">
              <SafeImage
                src={HERO_PILL_IMAGE}
                alt="Zivorah jewelry collection"
                className="hero-pill-image"
                eager
                fetchPriority="high"
                width={420}
                height={640}
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
          <HeroTagline displayed={displayed} done={done} />

          <CollectionRow />
        </div>

        <div className="hero-right-zone-container">
          <div className="hero-arch-image-wrapper">
            <SafeImage
              src={HERO_ARCH_IMAGE}
              alt="Featured jewelry"
              className="hero-arch-image"
              eager
              fetchPriority="high"
              width={720}
              height={900}
            />
          </div>

          <Link to={ROUTES.collection} className="hero-circular-badge-container" aria-label="Shop the collection" prefetch="intent">
            {SHOP_BADGE}
          </Link>
        </div>
      </div>

      <div className="mobile-hero-container">
        <div className="mobile-hero-top">
          <div className="hero-left-zone-container">
            <div className="hero-left-column-1">
              <div className="hero-pill-image-wrapper">
                <SafeImage
                  src={HERO_PILL_IMAGE}
                  alt="Zivorah jewelry collection"
                  className="hero-pill-image"
                  eager
                  fetchPriority="high"
                  width={420}
                  height={640}
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
            <HeroTagline displayed={displayed} done={done} />

            <Link
              to={ROUTES.collection}
              className="hero-circular-badge-container mobile-hero-badge"
              aria-label="Shop the collection"
              prefetch="intent"
            >
              {SHOP_BADGE}
            </Link>

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
              eager
              fetchPriority="high"
              width={720}
              height={900}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
