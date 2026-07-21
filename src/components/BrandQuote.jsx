import './BrandQuote.css';
import Reveal from './Reveal.jsx';

export default function BrandQuote() {
  return (
    <section className="brand-quote-section">
      <Reveal as="div" className="brand-quote-inner" variant="fade-up">
        <p className="brand-quote-text">
          &ldquo;Don&apos;t just follow trends. Let your jewelry reflect your story, your style, and the elegance that makes you unique.&rdquo;
        </p>
      </Reveal>
    </section>
  );
}
