import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { ROUTES } from '../utils/navigation';
import './Auth.css';

export default function AuthComingSoon({ title, message }) {
  usePageTitle(`${title} | Zivora`);

  return (
    <>
      <Navbar homeHref={ROUTES.home} />
      <main className="auth-page">
        <div className="auth-card">
          <h1 className="auth-heading">{title}</h1>
          <p className="auth-subheading">
            {message ||
              'This feature is coming soon. For account help, please contact support@zivora.com.'}
          </p>
          <p className="auth-switch">
            <Link to={ROUTES.login}>Back to Sign In</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
