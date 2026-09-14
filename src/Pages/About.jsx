import { Link } from 'react-router-dom';
import InfoPageShell from '../components/info/InfoPageShell.jsx';
import Reveal from '../components/Reveal.jsx';
import SafeImage from '../components/SafeImage.jsx';
import { aboutFaqJsonLd } from '../utils/structuredData.js';
import { ROUTES } from '../utils/navigation';
import './About.css';

const ABOUT_IMAGE = '/images/hero00.png';
const ABOUT_IMAGE_FALLBACK = '/images/image 3.png';
const ABOUT_DETAIL_IMAGE = '/images/hero111.png';

const PRINCIPLES = [
  {
    title: 'Timeless design',
    body: 'Collections built around lasting silhouettes rather than short-lived trends.',
  },
  {
    title: 'Clear product detail',
    body: 'Honest descriptions and imagery so you know exactly what you are purchasing.',
  },
  {
    title: 'Attentive care',
    body: 'Support that helps from browsing to delivery — and every question after.',
  },
];

export default function About() {
  return (
    <InfoPageShell
      title="About Zivorah"
      breadcrumbCurrent="About"
      path="/about"
      description="Zivorah is a premium jewelry house dedicated to timeless design, refined craftsmanship, and pieces that feel personal from the first wear."
      jsonLd={aboutFaqJsonLd()}
      intro="A premium jewelry house dedicated to timeless design, refined craftsmanship, and pieces that feel personal from the first wear."
      variant="about"
      hideHeader
      cta={
        <>
          <Link to={ROUTES.collection} className="info-btn info-btn-primary">
            Explore Collection
          </Link>
          <Link to={ROUTES.contact} className="info-btn info-btn-secondary">
            Contact Us
          </Link>
        </>
      }
    >
      <Reveal className="about-hero" variant="fade-up">
        <div className="about-hero-copy">
          <p className="about-eyebrow">Our house</p>
          <h1 className="about-title">About Zivorah</h1>
          <p className="about-lead">
            A premium jewelry house dedicated to timeless design, refined craftsmanship, and pieces
            that feel personal from the first wear.
          </p>

          <section className="about-story" aria-labelledby="about-story">
            <h2 id="about-story">Our approach</h2>
            <p>
              Zivorah creates jewelry for people who value quality over trends. Every collection is
              designed to complement everyday moments and milestone celebrations alike — from minimal
              rings and delicate necklaces to statement earrings crafted to last.
            </p>
            <p>
              We believe luxury should feel effortless: considered proportions, honest materials, and
              finishes that stay beautiful through daily wear.
            </p>
          </section>
        </div>

        <div className="about-hero-media">
          <div className="about-hero-arch">
            <SafeImage
              src={ABOUT_IMAGE}
              fallback={ABOUT_IMAGE_FALLBACK}
              alt="Zivorah editorial portrait in garden light"
              className="about-hero-arch-image"
              width={713}
              height={971}
            />
          </div>
        
        </div>
      </Reveal>

      <Reveal className="about-statement" variant="fade-up" as="blockquote">
        <p>
          Don&apos;t just follow trends. Let your jewelry reflect your story, your style, and the
          elegance that makes you unique.
        </p>
      </Reveal>

      <Reveal className="about-grid" variant="fade-up" as="section" aria-label="Craft and materials">
        <article className="about-panel" aria-labelledby="about-design">
          <h2 id="about-design">Design &amp; craftsmanship</h2>
          <p>
            Each Zivorah piece is thoughtfully designed and finished with care. We focus on clean
            lines, balanced proportions, and details you can feel — smooth edges, secure clasps, and
            settings that protect your stones.
          </p>
          <p>Luxury should be wearable, comfortable, and made to become part of your story.</p>
        </article>

        <article className="about-panel" aria-labelledby="about-materials">
          <h2 id="about-materials">Materials</h2>
          <p>
            We work with high-quality metals and finishes selected for durability and beauty. Many
            pieces are available in gold, silver, and rose gold tones.
          </p>
          <p>
            Product pages include specific material details so you can choose with confidence.
          </p>
        </article>
      </Reveal>

      <Reveal
        className="about-principles"
        variant="fade-up"
        as="section"
        aria-labelledby="about-principles"
      >
        <div className="about-principles-intro">
          <p className="about-eyebrow">What guides us</p>
          <h2 id="about-principles">Why Zivorah</h2>
        </div>
        <ul className="about-principle-list">
          {PRINCIPLES.map((item, index) => (
            <li key={item.title} className="about-principle">
              <span className="about-principle-index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal
        className="about-closing"
        variant="fade-up"
        as="section"
        aria-labelledby="about-experience"
      >
        <h2 id="about-experience">Your experience</h2>
        <p>
          Zivorah stands behind every order with attentive customer care, secure packaging, and a
          commitment to honest product representation. Whether you are treating yourself or choosing
          a gift, we want your experience to feel as considered as the jewelry itself.
        </p>
      </Reveal>
    </InfoPageShell>
  );
}
