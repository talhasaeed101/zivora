import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GuestRoute from '../components/GuestRoute.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { customerAuthApi } from '../services/api.js';
import { ROUTES } from '../utils/navigation';
import { usePageTitle } from '../hooks/usePageTitle.js';
import './Auth.css';

const INVALID_TOKEN_MESSAGE =
  'This reset link is invalid or has expired. Please request a new one.';

export default function ResetPassword() {
  usePageTitle('Reset Password | Zivora');

  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const isTokenMissing = !token?.trim();

  const showResendLink = useMemo(() => {
    if (isTokenMissing) {
      return true;
    }

    return (
      apiError?.toLowerCase().includes('invalid') ||
      apiError?.toLowerCase().includes('expired')
    );
  }, [apiError, isTokenMissing]);

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

    if (loading) {
      return;
    }

    setApiError('');

    if (isTokenMissing) {
      setApiError(INVALID_TOKEN_MESSAGE);
      return;
    }

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const response = await customerAuthApi.resetPassword(token, password, confirmPassword);
      navigate(ROUTES.login, {
        replace: true,
        state: {
          successMessage:
            response.message || 'Your password has been reset successfully. You can now sign in.',
        },
      });
    } catch (error) {
      setApiError(error.message || INVALID_TOKEN_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestRoute>
      <Navbar homeHref={ROUTES.home} />
      <main className="auth-page">
        <div className="auth-card">
          <h1 className="auth-heading">Create new password</h1>
          <p className="auth-subheading">
            Choose a strong password with at least 8 characters.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {(apiError || isTokenMissing) && (
              <div className="auth-error-banner">
                <p>{apiError || INVALID_TOKEN_MESSAGE}</p>
                {showResendLink && (
                  <p className="auth-inline-action">
                    <Link to={ROUTES.forgetPassword}>Request a new reset link</Link>
                  </p>
                )}
              </div>
            )}

            <PasswordInput
              id="reset-password"
              label="New password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 characters"
              error={errors.password}
              disabled={loading || isTokenMissing}
            />

            <PasswordInput
              id="reset-confirm-password"
              label="Confirm password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              error={errors.confirmPassword}
              disabled={loading || isTokenMissing}
            />

            <button
              type="submit"
              className="auth-submit"
              disabled={loading || isTokenMissing}
            >
              {loading ? 'Updating password...' : 'Reset password'}
            </button>
          </form>

          <p className="auth-switch">
            <Link to={ROUTES.login}>Back to sign in</Link>
          </p>
        </div>
      </main>
      <Footer />
    </GuestRoute>
  );
}
