import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { ROUTES } from '../utils/navigation';
import './About.css';

export default function About() {
  usePageTitle('About Zivora');

  return (
    <>
      <Navbar homeHref={ROUTES.home} />
      <main className="legal-page">
        <div className="legal-inner">
          <div className="about-hero">
            <h1 className="legal-title">About Zivora</h1>
            <p className="about-lead">
              Zivora is a premium jewelry house dedicated to timeless design, refined craftsmanship,
              and pieces that feel personal from the first wear.
            </p>
          </div>

          <section className="legal-section">
            <h2>Our Story</h2>
            <p>
              Founded with a passion for modern elegance, Zivora creates jewelry for people who value
              quality over trends. Every collection is designed to complement everyday moments and
              milestone celebrations alike — from minimal rings and delicate necklaces to statement
              earrings crafted to last.
            </p>
          </section>

          <section className="legal-section">
            <h2>Craftsmanship</h2>
            <p>
              Each Zivora piece is thoughtfully designed and finished with care. Our artisans focus on
              clean lines, balanced proportions, and details you can feel — smooth edges, secure
              clasps, and settings that protect your stones. We believe luxury should be wearable,
              comfortable, and made to become part of your story.
            </p>
          </section>

          <section className="legal-section">
            <h2>Materials</h2>
            <p>
              We work with high-quality metals and finishes selected for durability and beauty. Many
              pieces are available in gold, silver, and rose gold tones, with options tailored to
              different styles and skin sensitivities. Product pages include specific material details
              so you can choose with confidence.
            </p>
          </section>

          <section className="legal-section">
            <h2>Our Promise</h2>
            <p>
              Zivora stands behind every order with attentive customer care, secure packaging, and a
              commitment to honest product representation. Whether you are treating yourself or
              choosing a gift for someone special, we want your experience to feel as premium as the
              jewelry itself.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
