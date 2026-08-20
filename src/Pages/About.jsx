import { Link } from 'react-router-dom';
import InfoPageShell from '../components/info/InfoPageShell.jsx';
import Reveal from '../components/Reveal.jsx';
import SafeImage from '../components/SafeImage.jsx';
import { aboutFaqJsonLd } from '../utils/structuredData.js';
import { ROUTES } from '../utils/navigation';
import './About.css';

const ABOUT_IMAGE = '/images/image 3.png';
const ABOUT_IMAGE_FALLBACK = '/images/image 1 (3).png';

export default function About() {
  return (
    <InfoPageShell
      title="About Zivorah"
      breadcrumbCurrent="About"
      path="/about"
      description="Zivorah is a premium jewelry house dedicated to timeless design, refined craftsmanship, and pieces that feel personal from the first wear."
      jsonLd={aboutFaqJsonLd()}
      intro="A premium jewelry house dedicated to timeless design, refined craftsmanship, and pieces that feel personal from the first wear."
      variant="wide"
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
      <Reveal className="about-split" variant="fade-up">
        <div className="about-split-copy">
          <section className="info-section" aria-labelledby="about-story">
            <h2 id="about-story">Our approach</h2>
            <p>
              Zivorah creates jewelry for people who value quality over trends. Every collection is
              designed to complement everyday moments and milestone celebrations alike — from minimal
              rings and delicate necklaces to statement earrings crafted to last.
            </p>
          </section>
        </div>
        <div className="about-split-media">
          <SafeImage
            src={ABOUT_IMAGE}
            fallback={ABOUT_IMAGE_FALLBACK}
            alt="Zivorah jewelry styling"
            className="about-split-image"
            width={720}
            height={900}
          />
        </div>
      </Reveal>

      <Reveal className="info-section" variant="fade-up" as="section" aria-labelledby="about-design">
        <h2 id="about-design">Design &amp; craftsmanship</h2>
        <p>
          Each Zivorah piece is thoughtfully designed and finished with care. We focus on clean lines,
          balanced proportions, and details you can feel — smooth edges, secure clasps, and settings
          that protect your stones. Luxury should be wearable, comfortable, and made to become part of
          your story.
        </p>
      </Reveal>

      <Reveal className="info-section" variant="fade-up" as="section" aria-labelledby="about-materials">
        <h2 id="about-materials">Materials</h2>
        <p>
          We work with high-quality metals and finishes selected for durability and beauty. Many
          pieces are available in gold, silver, and rose gold tones. Product pages include specific
          material details so you can choose with confidence.
        </p>
      </Reveal>

      <Reveal className="info-section" variant="fade-up" as="section" aria-labelledby="about-principles">
        <h2 id="about-principles">Why Zivorah</h2>
        <div className="info-principles">
          <div className="info-principle">
            <h3>Timeless design</h3>
            <p>Collections built around lasting silhouettes rather than short-lived trends.</p>
          </div>
          <div className="info-principle">
            <h3>Clear product detail</h3>
            <p>Honest descriptions and imagery so you know what you are purchasing.</p>
          </div>
          <div className="info-principle">
            <h3>Attentive care</h3>
            <p>Support that helps from browsing to delivery and beyond.</p>
          </div>
        </div>
      </Reveal>

      <Reveal className="info-section" variant="fade-up" as="section" aria-labelledby="about-experience">
        <h2 id="about-experience">Your experience</h2>
        <p>
          Zivorah stands behind every order with attentive customer care, secure packaging, and a
          commitment to honest product representation. Whether you are treating yourself or choosing a
          gift, we want your experience to feel as considered as the jewelry itself.
        </p>
      </Reveal>
    </InfoPageShell>
  );
}
