import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ROUTES } from '../utils/navigation';
import { usePageTitle } from '../hooks/usePageTitle.js';
import './Legal.css';

export default function PrivacyPolicy() {
  usePageTitle('Privacy Policy | Zivora');
  return (
    <>
      <Navbar homeHref={ROUTES.home} />
      <main className="legal-page">
        <div className="legal-inner">
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-updated">Last updated: June 2026</p>

          <section className="legal-section">
            <h2>Introduction</h2>
            <p>
              Zivora (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) respects your privacy and is committed to protecting
              your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when
              you visit our website or purchase our jewelry products.
            </p>
          </section>

          <section className="legal-section">
            <h2>Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul>
              <li>Contact details such as your name, email address, phone number, and shipping address</li>
              <li>Account credentials when you register on our website</li>
              <li>Order and payment information required to process your purchases</li>
              <li>Website usage data, including pages visited and device information</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Process and deliver your jewelry orders</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Send order confirmations, shipping updates, and service-related communications</li>
              <li>Improve our website, products, and shopping experience</li>
              <li>Send marketing communications where you have opted in</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Data Sharing</h2>
            <p>
              We do not sell your personal information. We may share data with trusted service providers who assist
              with payment processing, shipping, and website operations, subject to appropriate confidentiality
              obligations.
            </p>
          </section>

          <section className="legal-section">
            <h2>Data Security</h2>
            <p>
              We implement reasonable technical and organizational measures to protect your personal information.
              However, no method of transmission over the internet is completely secure, and we cannot guarantee
              absolute security.
            </p>
          </section>

          <section className="legal-section">
            <h2>Your Rights</h2>
            <p>
              Depending on your location, you may have the right to access, correct, or delete your personal data,
              or to withdraw consent for marketing communications. To exercise these rights, please contact us using
              the details below.
            </p>
          </section>

          <section className="legal-section">
            <h2>Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or how we handle your data, please contact us at
              support@zivora.com.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
