import { useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell.jsx';
import GuestRoute from '../components/GuestRoute.jsx';
import { customerAuthApi } from '../services/api.js';
import { friendlyAuthError } from '../utils/authUi.js';
import { ROUTES } from '../utils/navigation';
import { usePrivatePageSeo } from '../hooks/useSeo.js';
import { toast } from '../context/ToastContext.jsx';
import './Auth.css';

const GENERIC_SUCCESS_MESSAGE =
  'If an account exists for this email, password reset instructions have been sent.';

export default function ForgetPassword() {
  usePrivatePageSeo({ title: 'Forgot Password', path: '/forget-password' });
  const emailId = useId();
  const errorRef = useRef(null);

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSent, setIsSent] = useState(false);
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

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      await customerAuthApi.forgotPassword(email.trim());
      setIsSent(true);
      toast.success(GENERIC_SUCCESS_MESSAGE);
    } catch (error) {
      window.requestAnimationFrame(() => errorRef.current?.focus?.());
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestRoute>
      <AuthShell>
        <h1 className="auth-heading">Forgot Password</h1>
        <p className="auth-subheading">
          Enter your email and we&apos;ll send a secure link to reset your password if an account
          exists.
        </p>

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {loading ? 'Sending reset link' : ''}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={`auth-field${errors.email ? ' is-invalid' : ''}`}>
            <label htmlFor={emailId}>
              Email <span className="auth-required" aria-hidden="true">*</span>
            </label>
            <input
              id={emailId}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
              required
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? `${emailId}-error` : undefined}
            />
            {errors.email ? (
              <span id={`${emailId}-error`} className="auth-field-error" role="alert">
                {errors.email}
              </span>
            ) : null}
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
            aria-busy={loading || undefined}
          >
            {loading ? 'Sending link…' : isSent ? 'Send again' : 'Send reset link'}
          </button>
        </form>

        <p className="auth-switch">
          <Link to={ROUTES.login}>Back to sign in</Link>
        </p>
      </AuthShell>
    </GuestRoute>
  );
}
