import Navbar from '../Navbar';
import Footer from '../Footer';
import Reveal from '../Reveal.jsx';
import AccountNav from './AccountNav.jsx';
import { ROUTES } from '../../utils/navigation';
import { Link } from 'react-router-dom';
import './account.css';

export default function AccountShell({
  active = 'overview',
  title,
  description,
  countLabel,
  children,
  hideHeader = false,
}) {
  return (
    <div className="account-page">
      <Navbar homeHref={ROUTES.home} />

      <main id="main-content" className="account-main">
        <div className="account-container">
          <Reveal className="account-sidebar" variant="fade-up">
            <AccountNav active={active} />
          </Reveal>

          <div className="account-content">
            {!hideHeader && title ? (
              <Reveal className="account-content-header" variant="fade-up" delay={40}>
                <nav className="account-breadcrumb" aria-label="Breadcrumb">
                  <Link to={ROUTES.profile}>Account</Link>
                  {active !== 'overview' ? (
                    <>
                      <span className="account-breadcrumb-sep" aria-hidden="true">
                        /
                      </span>
                      <span className="account-breadcrumb-current">{title}</span>
                    </>
                  ) : (
                    <>
                      <span className="account-breadcrumb-sep" aria-hidden="true">
                        /
                      </span>
                      <span className="account-breadcrumb-current">Overview</span>
                    </>
                  )}
                </nav>
                <h1 className="account-page-title">{title}</h1>
                {description ? <p className="account-page-description">{description}</p> : null}
                {countLabel ? <p className="account-page-count">{countLabel}</p> : null}
              </Reveal>
            ) : null}

            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
