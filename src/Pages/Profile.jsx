import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../utils/navigation';
import './Auth.css';

export default function Profile() {
  const navigate = useNavigate();
  const { customer, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <>
      <Navbar homeHref={ROUTES.home} />
      <main className="profile-page">
        <div className="profile-inner">
          <h1 className="profile-title">My Profile</h1>

          <div className="profile-card">
            <div className="profile-row">
              <span className="profile-label">Name</span>
              <span className="profile-value">{customer?.name || '—'}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Email</span>
              <span className="profile-value">{customer?.email || '—'}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Phone</span>
              <span className="profile-value">{customer?.phone || '—'}</span>
            </div>
          </div>

          <button type="button" className="profile-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
