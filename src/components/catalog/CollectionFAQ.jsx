import { useState } from 'react';
import './CollectionFAQ.css';

const FAQS = [
  {
    id: 'faq-1',
    question: 'What types of jewelry does Zivora offer?',
    answer:
      'Zivora offers a curated range of fine jewelry including rings, necklaces, earrings, bracelets, and bangles. Each piece is crafted with premium materials — from sterling silver and gold vermeil to genuine gemstones — designed to elevate everyday elegance.',
  },
  {
    id: 'faq-2',
    question: 'Are Zivora pieces made with real gold or silver?',
    answer:
      'Yes! Our jewelry uses high-quality sterling silver (925) and gold-plated or gold-vermeil finishes. Certain collections feature solid gold options. Product details always specify the exact metal and purity so you can shop with confidence.',
  },
  {
    id: 'faq-3',
    question: 'How do I find my correct ring size?',
    answer:
      'You can use our Ring Size Guide available on every ring product page. We recommend measuring at the end of the day when fingers are slightly larger. If you are between sizes, we suggest ordering half a size up. Our team is also available on WhatsApp to guide you.',
  },
  {
    id: 'faq-4',
    question: 'Can I customize or personalize a piece?',
    answer:
      'Absolutely! Many Zivora products support personalization — such as engraving, custom metal color, and stone selection. Look for the "Customize" button on eligible product pages, or reach out to us directly via WhatsApp for bespoke requests.',
  },
  {
    id: 'faq-5',
    question: 'What payment methods does Zivora accept?',
    answer:
      'We accept major credit and debit cards, bank transfers, and cash-on-delivery (where available). For bank transfers, our order confirmation flow provides all bank details and guides you through sending your payment confirmation screenshot on WhatsApp for quick verification.',
  },
  {
    id: 'faq-6',
    question: 'How long does delivery take?',
    answer:
      'Standard delivery within Pakistan typically takes 3–5 business days. Express options may be available at checkout. Once your order is dispatched, you will receive a tracking number via email or SMS.',
  },
  {
    id: 'faq-7',
    question: "What is Zivora's return and exchange policy?",
    answer:
      'We offer hassle-free returns and exchanges within 7 days of delivery, provided the item is unused and in its original packaging. Customized or personalized pieces are non-refundable unless there is a manufacturing defect. Contact our team on WhatsApp or email for assistance.',
  },
  {
    id: 'faq-8',
    question: 'How do I care for my Zivora jewelry?',
    answer:
      'To keep your jewelry looking its best: store pieces separately to avoid scratching, keep them away from water, perfumes, and harsh chemicals, and polish gently with a soft cloth. Gold-plated pieces should not be exposed to chlorine or saltwater.',
  },
];

const WA_HREF = `https://wa.me/923392215181?text=${encodeURIComponent(
  'Hi! I have a question about Zivora.',
)}`;

export default function CollectionFAQ() {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section className="cfaq-section" aria-labelledby="cfaq-heading">
      <div className="cfaq-inner">
        <div className="cfaq-layout">

          {/* ── Left sidebar ── */}
          <aside className="cfaq-sidebar">
            <span className="cfaq-eyebrow">Support</span>
            <h2 id="cfaq-heading" className="cfaq-title">
              Frequently<br />
              <em>Asked</em><br />
              Questions
            </h2>
            <div className="cfaq-divider" />
            <p className="cfaq-subtitle">
              Everything you need to know about Zivora jewelry, orders, and care.
            </p>
            <div className="cfaq-sidebar-cta">
              <span className="cfaq-sidebar-cta-label">Still have a question?</span>
              <a
                href={WA_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="cfaq-cta-btn"
              >
                <svg
                  className="cfaq-wa-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </aside>

          {/* ── Right accordion ── */}
          <div className="cfaq-list" role="list">
            {FAQS.map((faq, index) => {
              const isOpen = openId === faq.id;
              const num = String(index + 1).padStart(2, '0');
              return (
                <div
                  key={faq.id}
                  className={`cfaq-item${isOpen ? ' cfaq-item--open' : ''}`}
                  role="listitem"
                >
                  <button
                    id={faq.id}
                    className="cfaq-question"
                    aria-expanded={isOpen}
                    aria-controls={`${faq.id}-answer`}
                    onClick={() => toggle(faq.id)}
                    type="button"
                  >
                    <span className="cfaq-num" aria-hidden="true">{num}</span>
                    <span className="cfaq-question-text">{faq.question}</span>
                    <span className="cfaq-chevron" aria-hidden="true">
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 7.5L10 12.5L15 7.5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>

                  <div
                    id={`${faq.id}-answer`}
                    className="cfaq-answer"
                    role="region"
                    aria-labelledby={faq.id}
                    hidden={!isOpen}
                  >
                    <div className="cfaq-answer-body">
                      <span className="cfaq-answer-bar" aria-hidden="true" />
                      <p className="cfaq-answer-text">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
