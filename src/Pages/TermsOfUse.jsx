import { Link } from 'react-router-dom';
import InfoPageShell from '../components/info/InfoPageShell.jsx';
import { STORE_CONTACT } from '../constants/storeContact.js';
import { ROUTES } from '../utils/navigation';
import './Legal.css';

const SECTIONS = [
  { id: 'agreement-to-terms', label: 'Agreement to Terms' },
  { id: 'use-of-our-website', label: 'Use of Our Website' },
  { id: 'products-and-orders', label: 'Products and Orders' },
  { id: 'pricing-and-payment', label: 'Pricing and Payment' },
  { id: 'intellectual-property', label: 'Intellectual Property' },
  { id: 'limitation-of-liability', label: 'Limitation of Liability' },
  { id: 'changes-to-these-terms', label: 'Changes to These Terms' },
  { id: 'contact', label: 'Contact' },
];

export default function TermsOfUse() {
  return (
    <InfoPageShell
      title="Terms of Use"
      breadcrumbCurrent="Terms of Use"
      path="/terms-of-use"
      description="The terms that govern your use of the Zivorah website and related jewelry shopping services."
      intro="The terms that govern your use of the Zivorah website and related services."
      cta={
        <Link to={ROUTES.contact} className="info-btn info-btn-primary">
          Contact Us
        </Link>
      }
    >
      <p className="info-updated">Last updated: June 2026</p>

      <nav className="info-toc" aria-label="Terms of Use contents">
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
        <section className="info-section legal-section" id="agreement-to-terms">
          <h2>Agreement to Terms</h2>
          <p>
            By accessing or using the Zivorah website, you agree to be bound by these Terms of Use. If you do not
            agree with any part of these terms, please do not use our website or services.
          </p>
        </section>

        <section className="info-section legal-section" id="use-of-our-website">
          <h2>Use of Our Website</h2>
          <p>You agree to use our website only for lawful purposes and in a manner that does not:</p>
          <ul>
            <li>Infringe the rights of others or restrict their use of the site</li>
            <li>Attempt to gain unauthorized access to our systems or customer accounts</li>
            <li>Transmit harmful, fraudulent, or misleading content</li>
            <li>Interfere with the proper functioning of the website</li>
          </ul>
        </section>

        <section className="info-section legal-section" id="products-and-orders">
          <h2>Products and Orders</h2>
          <p>
            All jewelry products displayed on our website are subject to availability. We reserve the right to
            limit quantities, refuse orders, or cancel transactions where necessary. Product images are for
            illustrative purposes; slight variations in color, finish, or appearance may occur due to photography
            and natural materials.
          </p>
        </section>

        <section className="info-section legal-section" id="pricing-and-payment">
          <h2>Pricing and Payment</h2>
          <p>
            Prices are listed in the currency shown at checkout and may change without notice. We strive to ensure
            pricing accuracy, but errors may occur. In such cases, we reserve the right to cancel or adjust affected
            orders and will notify you promptly.
          </p>
        </section>

        <section className="info-section legal-section" id="intellectual-property">
          <h2>Intellectual Property</h2>
          <p>
            All content on this website, including product photography, branding, text, and design elements, is
            owned by or licensed to Zivorah and is protected by applicable intellectual property laws. You may not
            reproduce or distribute our content without prior written consent.
          </p>
        </section>

        <section className="info-section legal-section" id="limitation-of-liability">
          <h2>Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Zivorah shall not be liable for any indirect, incidental, or
            consequential damages arising from your use of the website or purchase of our products.
          </p>
        </section>

        <section className="info-section legal-section" id="changes-to-these-terms">
          <h2>Changes to These Terms</h2>
          <p>
            We may update these Terms of Use from time to time. Continued use of the website after changes are
            posted constitutes acceptance of the revised terms.
          </p>
        </section>

        <section className="info-section legal-section" id="contact">
          <h2>Contact</h2>
          <p>
            For questions regarding these Terms of Use, please contact us at{' '}
            <a href={`mailto:${STORE_CONTACT.email}`}>{STORE_CONTACT.email}</a>.
          </p>
        </section>
      </article>
    </InfoPageShell>
  );
}
