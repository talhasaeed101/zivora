import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GuestRoute from '../components/GuestRoute.jsx';
import { customerAuthApi } from '../services/api.js';
import { ROUTES } from '../utils/navigation';
import { usePageTitle } from '../hooks/usePageTitle.js';
import './Auth.css';

const GENERIC_SUCCESS_MESSAGE = 'If this email exists, a reset link has been sent.';

export default function ForgetPassword() {
  usePageTitle('Forgot Password | Zivora');

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setApiError('');
    setSuccessMessage('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await customerAuthApi.forgotPassword(email.trim());
      setSuccessMessage(response.message || GENERIC_SUCCESS_MESSAGE);
      setEmail('');
    } catch (error) {
      if (error.message?.toLowerCase().includes('too many requests')) {
        setApiError('Too many reset attempts. Please wait a few minutes and try again.');
      } else {
        setApiError(error.message || 'Unable to process your request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestRoute>
      <Navbar homeHref={ROUTES.home} />
      <main className="auth-page">
        <div className="auth-card">
          <h1 className="auth-heading">Forgot password</h1>
          <p className="auth-subheading">
            Enter your email and we&apos;ll send you a secure link to reset your password.
          </p>

          {successMessage ? (
            <div className="auth-success-banner">{successMessage}</div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {apiError && <div className="auth-error-banner">{apiError}</div>}

              <div className="auth-field">
                <label htmlFor="forgot-email">Email</label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                />
                {errors.email && <span className="auth-field-error">{errors.email}</span>}
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Sending link...' : 'Send reset link'}
              </button>
            </form>
          )}

          <p className="auth-switch">
            <Link to={ROUTES.login}>Back to sign in</Link>
          </p>
        </div>
      </main>
      <Footer />
    </GuestRoute>
  );
}
