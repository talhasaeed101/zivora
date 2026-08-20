import Navbar from '../Navbar';
import Footer from '../Footer';
import Reveal from '../Reveal.jsx';
import JsonLd from '../seo/JsonLd.jsx';
import PageBreadcrumbs from '../seo/PageBreadcrumbs.jsx';
import { useSeo } from '../../hooks/useSeo.js';
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
          <Reveal className="info-header" variant="fade-up">
            <PageBreadcrumbs items={crumbs} />
            <h1 className="info-title">{title}</h1>
            {intro ? <p className="info-intro">{intro}</p> : null}
          </Reveal>

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
