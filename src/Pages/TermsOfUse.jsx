import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ROUTES } from '../utils/navigation';
import { usePageTitle } from '../hooks/usePageTitle.js';
import './Legal.css';

export default function TermsOfUse() {
  usePageTitle('Terms of Use | Zivora');
  return (
    <>
      <Navbar homeHref={ROUTES.home} />
      <main className="legal-page">
        <div className="legal-inner">
          <h1 className="legal-title">Terms of Use</h1>
          <p className="legal-updated">Last updated: June 2026</p>

          <section className="legal-section">
            <h2>Agreement to Terms</h2>
            <p>
              By accessing or using the Zivora website, you agree to be bound by these Terms of Use. If you do not
              agree with any part of these terms, please do not use our website or services.
            </p>
          </section>

          <section className="legal-section">
            <h2>Use of Our Website</h2>
            <p>You agree to use our website only for lawful purposes and in a manner that does not:</p>
            <ul>
              <li>Infringe the rights of others or restrict their use of the site</li>
              <li>Attempt to gain unauthorized access to our systems or customer accounts</li>
              <li>Transmit harmful, fraudulent, or misleading content</li>
              <li>Interfere with the proper functioning of the website</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Products and Orders</h2>
            <p>
              All jewelry products displayed on our website are subject to availability. We reserve the right to
              limit quantities, refuse orders, or cancel transactions where necessary. Product images are for
              illustrative purposes; slight variations in color, finish, or appearance may occur due to photography
              and natural materials.
            </p>
          </section>

          <section className="legal-section">
            <h2>Pricing and Payment</h2>
            <p>
              Prices are listed in the currency shown at checkout and may change without notice. We strive to ensure
              pricing accuracy, but errors may occur. In such cases, we reserve the right to cancel or adjust affected
              orders and will notify you promptly.
            </p>
          </section>

          <section className="legal-section">
            <h2>Intellectual Property</h2>
            <p>
              All content on this website, including product photography, branding, text, and design elements, is
              owned by or licensed to Zivora and is protected by applicable intellectual property laws. You may not
              reproduce or distribute our content without prior written consent.
            </p>
          </section>

          <section className="legal-section">
            <h2>Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Zivora shall not be liable for any indirect, incidental, or
              consequential damages arising from your use of the website or purchase of our products.
            </p>
          </section>

          <section className="legal-section">
            <h2>Changes to These Terms</h2>
            <p>
              We may update these Terms of Use from time to time. Continued use of the website after changes are
              posted constitutes acceptance of the revised terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>Contact</h2>
            <p>
              For questions regarding these Terms of Use, please contact us at support@zivora.com.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
