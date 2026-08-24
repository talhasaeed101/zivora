import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell.jsx';
import GuestRoute from '../components/GuestRoute.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { customerAuthApi } from '../services/api.js';
import { friendlyAuthError } from '../utils/authUi.js';
import { ROUTES } from '../utils/navigation';
import { usePrivatePageSeo } from '../hooks/useSeo.js';
import { toast } from '../context/ToastContext.jsx';
import './Auth.css';

const INVALID_TOKEN_MESSAGE =
  'This reset link is invalid or has expired. Please request a new one.';

export default function ResetPassword() {
  usePrivatePageSeo({ title: 'Reset Password', path: '/reset-password' });

  const navigate = useNavigate();
  const { token } = useParams();
  const errorRef = useRef(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [tokenError, setTokenError] = useState('');
  const [loading, setLoading] = useState(false);

  const isTokenMissing = !token?.trim();

  const showResendLink = useMemo(() => {
    if (isTokenMissing) {
      return true;
    }
    return (
      tokenError?.toLowerCase().includes('invalid') ||
      tokenError?.toLowerCase().includes('expired')
    );
  }, [tokenError, isTokenMissing]);

  const validate = () => {
    const nextErrors = {};

    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading || isTokenMissing) {
      return;
    }

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await customerAuthApi.resetPassword(token, password, confirmPassword);
      setPassword('');
      setConfirmPassword('');
      const successMsg =
        response.message && response.message.length < 140
          ? response.message
          : 'Your password has been reset successfully. You can now sign in.';
      toast.success(successMsg);
      navigate(ROUTES.login, { replace: true });
    } catch (error) {
      setTokenError(friendlyAuthError(error, INVALID_TOKEN_MESSAGE));
      window.requestAnimationFrame(() => errorRef.current?.focus?.());
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestRoute>
      <AuthShell>
        <h1 className="auth-heading">Create New Password</h1>
        <p className="auth-subheading">Choose a strong password with at least 8 characters.</p>

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {loading ? 'Updating password' : ''}
        </div>

        {(tokenError || isTokenMissing) && (
          <div className="auth-error-banner" role="alert" tabIndex={-1} ref={errorRef}>
            <p>{tokenError || INVALID_TOKEN_MESSAGE}</p>
            {showResendLink ? (
              <p className="auth-inline-action">
                <Link to={ROUTES.forgetPassword}>Request a new reset link</Link>
              </p>
            ) : null}
          </div>
        )}

        {!isTokenMissing ? (
          <form onSubmit={handleSubmit} noValidate>
            <PasswordInput
              id="reset-password"
              label="New password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              error={errors.password}
              hint="Use at least 8 characters."
              disabled={loading}
              required
            />

            <PasswordInput
              id="reset-confirm-password"
              label="Confirm password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              error={errors.confirmPassword}
              disabled={loading}
              required
            />

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
              aria-busy={loading || undefined}
            >
              {loading ? 'Updating password…' : 'Reset password'}
            </button>
          </form>
        ) : null}

        <p className="auth-switch">
          <Link to={ROUTES.login}>Back to sign in</Link>
        </p>
      </AuthShell>
    </GuestRoute>
  );
}
