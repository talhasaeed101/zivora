import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Reveal from '../components/Reveal.jsx';
import { useSeo } from '../hooks/useSeo.js';
import { ROUTES } from '../utils/navigation';
import './NotFound.css';

export default function NotFound() {
  const location = useLocation();
  useSeo({
    title: 'Page Not Found',
    description: 'This Zivorah page does not exist. Continue shopping from the jewelry collection.',
    path: location.pathname,
    robots: 'noindex, follow',
  });

  return (
    <div className="not-found-page">
      <Navbar homeHref={ROUTES.home} />
      <main id="main-content" className="not-found-main">
        <Reveal className="not-found-inner" variant="fade-up">
          <p className="not-found-code">404</p>
          <h1 className="not-found-title">Page not found</h1>
          <p className="not-found-copy">
            This page does not exist or may have moved. Continue shopping from the collection, or
            return home.
          </p>
          <div className="not-found-actions">
            <Link to={ROUTES.home} className="not-found-btn not-found-btn-primary">
              Back to Home
            </Link>
            <Link to={ROUTES.collection} className="not-found-btn not-found-btn-secondary">
              Browse Collection
            </Link>
            <Link to={ROUTES.search} className="not-found-btn not-found-btn-secondary">
              Search
            </Link>
          </div>
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
