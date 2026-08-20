import { Link } from 'react-router-dom';
import InfoPageShell from '../components/info/InfoPageShell.jsx';
import { STORE_CONTACT } from '../constants/storeContact.js';
import { ROUTES } from '../utils/navigation';
import './Legal.css';

const SECTIONS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'information-we-collect', label: 'Information We Collect' },
  { id: 'how-we-use-your-information', label: 'How We Use Your Information' },
  { id: 'data-sharing', label: 'Data Sharing' },
  { id: 'data-security', label: 'Data Security' },
  { id: 'your-rights', label: 'Your Rights' },
  { id: 'contact-us', label: 'Contact Us' },
];

export default function PrivacyPolicy() {
  return (
    <InfoPageShell
      title="Privacy Policy"
      breadcrumbCurrent="Privacy Policy"
      path="/privacy-policy"
      description="How Zivorah collects, uses, and protects personal information when you visit our website or purchase jewelry."
      intro="How Zivorah collects, uses, and protects personal information when you visit our website or purchase jewelry."
      cta={
        <Link to={ROUTES.contact} className="info-btn info-btn-primary">
          Contact Us
        </Link>
      }
    >
      <p className="info-updated">Last updated: June 2026</p>

      <nav className="info-toc" aria-label="Privacy Policy contents">
        <p className="info-toc-title">Contents</p>
        <ol className="info-toc-list">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`}>{section.label}</a>
            </li>
          ))}
        </ol>
      </nav>

      <article className="info-article">
        <section className="info-section legal-section" id="introduction">
          <h2>Introduction</h2>
          <p>
            Zivorah (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) respects your privacy and is committed to protecting
            your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when
            you visit our website or purchase our jewelry products.
          </p>
        </section>

        <section className="info-section legal-section" id="information-we-collect">
          <h2>Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li>Contact details such as your name, email address, phone number, and shipping address</li>
            <li>Account credentials when you register on our website</li>
            <li>Order and payment information required to process your purchases</li>
            <li>Website usage data, including pages visited and device information</li>
          </ul>
        </section>

        <section className="info-section legal-section" id="how-we-use-your-information">
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

        <section className="info-section legal-section" id="data-sharing">
          <h2>Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share data with trusted service providers who assist
            with payment processing, shipping, and website operations, subject to appropriate confidentiality
            obligations.
          </p>
        </section>

        <section className="info-section legal-section" id="data-security">
          <h2>Data Security</h2>
          <p>
            We implement reasonable technical and organizational measures to protect your personal information.
            However, no method of transmission over the internet is completely secure, and we cannot guarantee
            absolute security.
          </p>
        </section>

        <section className="info-section legal-section" id="your-rights">
          <h2>Your Rights</h2>
          <p>
            Depending on your location, you may have the right to access, correct, or delete your personal data,
            or to withdraw consent for marketing communications. To exercise these rights, please contact us using
            the details below.
          </p>
        </section>

        <section className="info-section legal-section" id="contact-us">
          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or how we handle your data, please contact us at{' '}
            <a href={`mailto:${STORE_CONTACT.email}`}>{STORE_CONTACT.email}</a>.
          </p>
        </section>
      </article>
    </InfoPageShell>
  );
}
