import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext.jsx';
import SocialLoginButtons from '../components/SocialLoginButtons.jsx';
import { ROUTES } from '../utils/navigation';
import { usePageTitle } from '../hooks/usePageTitle.js';
import './Auth.css';

export default function Login() {
  usePageTitle('Sign In | Zivorah');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');
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
    setSuccessMessage('');

    if (!validate()) return;

    if (loading) return;

    setLoading(true);

    try {
      await login(email.trim(), password);
      const redirectTo = location.state?.from || ROUTES.home;
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error.data?.errorCode === 'EMAIL_NOT_VERIFIED' || error.message === 'Email not verified') {
        navigate(ROUTES.verifyEmail, { state: { email: email.trim() } });
      } else {
        setApiError(error.message || 'Login failed');
      }
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
          <p className="auth-subheading">Sign in to your Zivorah account</p>

          {successMessage && <div className="auth-success-banner">{successMessage}</div>}
          {apiError && <div className="auth-error-banner">{apiError}</div>}

          <SocialLoginButtons 
            onSuccess={() => {
              const redirectTo = location.state?.from || ROUTES.home;
              navigate(redirectTo, { replace: true });
            }}
            onError={(msg) => setApiError(msg)}
          />

          <div className="auth-divider">OR</div>

          <form onSubmit={handleSubmit} noValidate>

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
              <div className="auth-field-row">
                <label htmlFor="login-password">Password</label>
                <Link to="/forget-password" className="auth-forgot-link">
                  Forgot password?
                </Link>
              </div>
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
