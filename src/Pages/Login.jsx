import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../utils/navigation';
import { usePageTitle } from '../hooks/usePageTitle.js';
import './Auth.css';

export default function Login() {
  usePageTitle('Sign In | Zivora');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return <div className="auth-page-loading"><p>Loading...</p></div>;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.profile} replace />;
  }

  const validate = () => {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError('');

    if (!validate()) return;

    setLoading(true);

    try {
      await login(email.trim(), password);
      const redirectTo = location.state?.from || ROUTES.home;
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setApiError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar homeHref={ROUTES.home} />
      <main className="auth-page">
        <div className="auth-card">
          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-subheading">Sign in to your Zivora account</p>

          <form onSubmit={handleSubmit} noValidate>
            {apiError && <div className="auth-error-banner">{apiError}</div>}

            <div className="auth-field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
              />
              {errors.email && <span className="auth-field-error">{errors.email}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />
              {errors.password && <span className="auth-field-error">{errors.password}</span>}
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account? <Link to={ROUTES.register}>Create one</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
