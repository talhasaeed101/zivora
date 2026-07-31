import { useId, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import SocialLoginButtons from '../components/SocialLoginButtons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { getSafeReturnPath, friendlyAuthError } from '../utils/authUi.js';
import { ROUTES } from '../utils/navigation';
import './Auth.css';

export default function Login() {
  usePageTitle('Sign In | Zivorah');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const emailId = useId();
  const errorRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="auth-page-loading" aria-busy="true" aria-live="polite">
        <p>Loading…</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getSafeReturnPath(location.state?.from, ROUTES.profile)} replace />;
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

  const focusError = () => {
    window.requestAnimationFrame(() => {
      errorRef.current?.focus?.();
    });
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
      await login(email.trim(), password);
      const redirectTo = getSafeReturnPath(location.state?.from, ROUTES.home);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error.data?.errorCode === 'EMAIL_NOT_VERIFIED' || error.message === 'Email not verified') {
        navigate(ROUTES.verifyEmail, { state: { email: email.trim() } });
      } else {
        setApiError(
          friendlyAuthError(error, 'Unable to sign in with those details. Please check and try again.')
        );
        focusError();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell imageSrc="/images/signin.png">
      <h1 className="auth-heading">Welcome Back</h1>
      <p className="auth-subheading">
        Sign in to view your orders, wishlist, and account details.
      </p>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {loading ? 'Signing in' : apiError || successMessage || ''}
      </div>

      {successMessage ? (
        <div className="auth-success-banner" role="status">
          {successMessage}
        </div>
      ) : null}

      {apiError ? (
        <div className="auth-error-banner" role="alert" tabIndex={-1} ref={errorRef}>
          {apiError}
        </div>
      ) : null}

      <SocialLoginButtons
        onSuccess={() => {
          const redirectTo = getSafeReturnPath(location.state?.from, ROUTES.home);
          navigate(redirectTo, { replace: true });
        }}
        onError={(msg) => {
          setApiError(
            friendlyAuthError({ message: msg }, 'Social sign-in failed. Please try again.')
          );
          focusError();
        }}
      />

      <div className="auth-divider">Or</div>

      <form onSubmit={handleSubmit} noValidate>
        <div className={`auth-field${errors.email ? ' is-invalid' : ''}`}>
          <label htmlFor={emailId}>
            Email <span className="auth-required" aria-hidden="true">*</span>
          </label>
          <input
            id={emailId}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <PasswordInput
          id="login-password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password}
          disabled={loading}
          required
          labelAside={
            <Link to={ROUTES.forgetPassword} className="auth-forgot-link">
              Forgot password?
            </Link>
          }
        />

        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
          aria-busy={loading || undefined}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="auth-switch">
        Don&apos;t have an account? <Link to={ROUTES.register}>Create one</Link>
      </p>
    </AuthShell>
  );
}
