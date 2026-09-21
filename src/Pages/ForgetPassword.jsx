import { useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell.jsx';
import GuestRoute from '../components/GuestRoute.jsx';
import { customerAuthApi } from '../services/api.js';
import { ROUTES } from '../utils/navigation';
import { usePrivatePageSeo } from '../hooks/useSEO.js';
import { toast } from '../context/ToastContext.jsx';
import './Auth.css';

export default function ForgetPassword() {
  usePrivatePageSeo({ title: 'Forgot Password', path: '/forget-password' });
  const navigate = useNavigate();
  const emailId = useId();
  const errorRef = useRef(null);

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
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
      const trimmed = email.trim();
      await customerAuthApi.forgotPassword(trimmed);
      toast.success('If an account exists for this email, a verification code has been sent.');
      navigate(ROUTES.verifyEmail, {
        replace: true,
        state: { email: trimmed, purpose: 'reset' },
      });
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
          Provide your account&apos;s email for which you want to reset your password.
        </p>

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {loading ? 'Sending verification code' : ''}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={`auth-field${errors.email ? ' is-invalid' : ''}`}>
            <label htmlFor={emailId}>
              Email <span className="auth-required" aria-hidden="true">
               
              </span>
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
            {loading ? 'Sending code…' : 'Continue'}
          </button>
        </form>

        <Link to={ROUTES.login} className="auth-submit auth-submit-secondary">
          Back to sign in
        </Link>
      </AuthShell>
    </GuestRoute>
  );
}
