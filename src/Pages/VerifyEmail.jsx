import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell.jsx';
import OtpInput from '../components/auth/OtpInput.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePrivatePageSeo } from '../hooks/useSEO.js';
import { ROUTES } from '../utils/navigation';
import { customerAuthApi } from '../services/api';
import { friendlyAuthError } from '../utils/authUi.js';
import { toast } from '../context/ToastContext.jsx';
import './Auth.css';

const RESET_TOKEN_KEY = 'zivora_reset_token';
const RESET_EMAIL_KEY = 'zivora_reset_email';

export default function VerifyEmail() {
  const { token: legacyToken } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, refreshCustomer } = useAuth();

  const purpose = location.state?.purpose === 'reset' ? 'reset' : 'signup';
  const email = location.state?.email || '';

  usePrivatePageSeo({
    title: 'Email Verification',
    path: '/verify-email',
  });

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [loading, setLoading] = useState(false);
  const [legacyStatus, setLegacyStatus] = useState(legacyToken ? 'verifying' : null);
  const [legacyMessage, setLegacyMessage] = useState('');
  const [emailChanged, setEmailChanged] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showResendModal, setShowResendModal] = useState(false);

  useEffect(() => {
    if (!legacyToken) return undefined;

    let cancelled = false;
    (async () => {
      try {
        const response = await customerAuthApi.verifyEmail(legacyToken);
        if (cancelled) return;
        const changed = Boolean(response?.data?.emailChanged);
        setEmailChanged(changed);
        setLegacyStatus('success');
        toast.success(
          changed
            ? 'Your email has been updated successfully.'
            : 'Your email has been verified. You can now sign in.'
        );
        if (isAuthenticated) {
          try {
            await refreshCustomer();
          } catch {
            // best-effort
          }
        }
      } catch {
        if (cancelled) return;
        setLegacyStatus('error');
        setLegacyMessage('This verification link is invalid or has expired.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [legacyToken, isAuthenticated, refreshCustomer]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async (event) => {
    event.preventDefault();
    if (loading) return;

    if (!email) {
      toast.error('Open this page from registration or forgot password to verify.');
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setCodeError('Enter the 6-digit verification code');
      return;
    }

    setCodeError('');
    setLoading(true);

    try {
      if (purpose === 'reset') {
        const response = await customerAuthApi.verifyResetCode(email, code);
        const resetToken = response?.data?.resetToken;
        if (!resetToken) {
          throw new Error('Missing reset session');
        }
        sessionStorage.setItem(RESET_TOKEN_KEY, resetToken);
        sessionStorage.setItem(RESET_EMAIL_KEY, email);
        toast.success('Code verified. Create your new password.');
        navigate(ROUTES.createNewPassword, {
          replace: true,
          state: { email, resetToken },
        });
        return;
      }

      const response = await customerAuthApi.verifyEmailCode(email, code);
      const changed = Boolean(response?.data?.emailChanged);
      setEmailChanged(changed);
      toast.success(
        changed
          ? 'Your email has been updated successfully.'
          : 'Your email has been verified. You can now sign in.'
      );
      if (isAuthenticated) {
        try {
          await refreshCustomer();
        } catch {
          // best-effort
        }
        navigate(ROUTES.profile, { replace: true });
      } else {
        navigate(ROUTES.login, { replace: true });
      }
    } catch (error) {
      setCodeError(friendlyAuthError(error, 'Invalid or expired verification code'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendLoading || resendCooldown > 0) return;

    setResendLoading(true);
    try {
      if (purpose === 'reset') {
        await customerAuthApi.forgotPassword(email);
      } else {
        await customerAuthApi.resendVerificationEmail(email);
      }
      setShowResendModal(true);
      setResendCooldown(60);
      setCode('');
      setCodeError('');
    } catch {
      // toast from api.js
    } finally {
      setResendLoading(false);
    }
  };

  if (legacyStatus) {
    return (
      <AuthShell>
        <h1 className="auth-heading">
          {legacyStatus === 'verifying'
            ? 'Verifying Email'
            : legacyStatus === 'success'
              ? emailChanged
                ? 'Email Updated'
                : 'Email Verified'
              : 'Verification Failed'}
        </h1>
        {legacyStatus === 'verifying' ? (
          <p className="auth-status-copy" aria-busy="true">
            Please wait while we verify your email address.
          </p>
        ) : null}
        {legacyStatus === 'success' ? (
          <>
            <p className="auth-status-copy">
              {emailChanged
                ? 'Your new email address is confirmed and active on your account.'
                : 'Your email has been verified! You can now sign in.'}
            </p>
            <Link
              to={isAuthenticated ? ROUTES.profile : ROUTES.login}
              className="auth-submit"
            >
              {isAuthenticated ? 'Back to account' : 'Sign in'}
            </Link>
          </>
        ) : null}
        {legacyStatus === 'error' ? (
          <>
            <div className="auth-error-banner" role="alert">
              {legacyMessage}
            </div>
            <Link to={ROUTES.forgetPassword} className="auth-submit">
              Request a new code
            </Link>
          </>
        ) : null}
        <Link
          to={isAuthenticated ? ROUTES.profile : ROUTES.login}
          className="auth-submit auth-submit-secondary"
        >
          {isAuthenticated ? 'Back to account' : 'Back to sign in'}
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className="auth-heading">Email Verification</h1>
      <p className="auth-subheading">
        Please enter 6-digit verification code that was sent to your email
        {email ? (
          <>
            {' '}
            (<strong>{email}</strong>)
          </>
        ) : null}
        .
      </p>

      {!email ? (
        <p className="auth-field-hint auth-resend-hint">
          Open this page from registration or forgot password to enter your code.
        </p>
      ) : (
        <form onSubmit={handleVerify} noValidate>
          <OtpInput
            value={code}
            onChange={(next) => {
              setCode(next);
              if (codeError) setCodeError('');
            }}
            disabled={loading}
            error={Boolean(codeError)}
          />
          {codeError ? (
            <p className="auth-field-error" role="alert">
              {codeError}
            </p>
          ) : null}

          <p className="auth-otp-resend">
            Didn&apos;t receive an email?{' '}
            <button
              type="button"
              className="auth-otp-resend-btn"
              onClick={handleResend}
              disabled={resendLoading || resendCooldown > 0 || !email}
            >
              {resendLoading
                ? 'Sending…'
                : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend'}
            </button>
          </p>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading || code.length !== 6}
            aria-busy={loading || undefined}
          >
            {loading ? 'Verifying…' : 'Continue'}
          </button>
        </form>
      )}

      <Link
        to={isAuthenticated ? ROUTES.profile : ROUTES.login}
        className="auth-submit auth-submit-secondary"
      >
        {isAuthenticated ? 'Back to account' : 'Back to sign in'}
      </Link>

      {showResendModal ? (
        <div className="auth-resend-modal" role="dialog" aria-modal="true" aria-labelledby="auth-resend-title">
          <div className="auth-resend-modal-card">
            <div className="auth-resend-modal-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="5" width="18" height="14" rx="1" />
                <path d="M3 7l9 7 9-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 id="auth-resend-title" className="auth-resend-modal-title">
              Resend Verification Code
            </h2>
            <p className="auth-resend-modal-copy">
              We have just sent an email with a new verification code to{' '}
              <strong>{email}</strong>.
            </p>
            <div className="auth-resend-modal-actions">
              <button
                type="button"
                className="auth-submit auth-submit-secondary"
                onClick={() => setShowResendModal(false)}
              >
                Got it
              </button>
              <button
                type="button"
                className="auth-submit"
                onClick={() => {
                  setShowResendModal(false);
                  handleResend();
                }}
                disabled={resendLoading || resendCooldown > 0}
              >
                Send again
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AuthShell>
  );
}
