import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../utils/navigation';

export default function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-page-loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.profile} replace />;
  }

  return children;
}
