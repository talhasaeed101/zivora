import { Link } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';
import Reveal from '../Reveal.jsx';
import { ROUTES } from '../../utils/navigation';
import '../../Pages/Legal.css';

export default function InfoPageShell({
  title,
  intro,
  breadcrumbCurrent,
  children,
  cta = null,
  variant = 'default',
}) {
  return (
    <div className={`info-shell info-shell--${variant}`}>
      <Navbar homeHref={ROUTES.home} />
      <main id="main-content" className="info-page">
        <div className="info-inner">
          <Reveal className="info-header" variant="fade-up">
            <nav className="info-breadcrumb" aria-label="Breadcrumb">
              <Link to={ROUTES.home}>Home</Link>
              <span className="info-breadcrumb-sep" aria-hidden="true">
                /
              </span>
              <span className="info-breadcrumb-current">{breadcrumbCurrent || title}</span>
            </nav>
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
    </div>
  );
}
