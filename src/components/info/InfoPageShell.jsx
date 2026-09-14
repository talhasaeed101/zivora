import Navbar from '../Navbar';
import Footer from '../Footer';
import Reveal from '../Reveal.jsx';
import JsonLd from '../seo/JsonLd.jsx';
import PageBreadcrumbs from '../seo/PageBreadcrumbs.jsx';
import { useSeo } from '../../hooks/useSEO.js';
import '../../Pages/Legal.css';

export default function InfoPageShell({
  title,
  intro,
  breadcrumbCurrent,
  children,
  cta = null,
  variant = 'default',
  description,
  path,
  jsonLd = null,
  robots = 'index, follow',
  hideHeader = false,
}) {
  useSeo({
    title,
    description: description || intro,
    path,
    robots,
  });

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: breadcrumbCurrent || title, path: path || undefined },
  ];

  return (
    <div className={`info-shell info-shell--${variant}`}>
      <Navbar homeHref="/" />
      <main id="main-content" className="info-page">
        <div className="info-inner">
          {!hideHeader ? (
            <Reveal className="info-header" variant="fade-up">
              <PageBreadcrumbs items={crumbs} />
              <h1 className="info-title">{title}</h1>
              {intro ? <p className="info-intro">{intro}</p> : null}
            </Reveal>
          ) : (
            <Reveal className="info-header info-header--crumbs-only" variant="fade-up">
              <PageBreadcrumbs items={crumbs} />
            </Reveal>
          )}

          <div className="info-content">{children}</div>

          {cta ? (
            <Reveal className="info-cta" variant="fade-up">
              {cta}
            </Reveal>
          ) : null}
        </div>
      </main>
      <Footer />
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
    </div>
  );
}
