import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell.jsx';
import { usePrivatePageSeo } from '../hooks/useSeo.js';
import { ROUTES } from '../utils/navigation';
import { customerAuthApi } from '../services/api';
import { friendlyAuthError } from '../utils/authUi.js';
import { toast } from '../context/ToastContext.jsx';
import './Auth.css';

export default function VerifyEmail() {
  const { token } = useParams();
  const location = useLocation();
  const email = location.state?.email || '';

  usePrivatePageSeo({
    title: token ? 'Verifying Email' : 'Check Your Email',
    path: '/verify-email',
  });

  const [status, setStatus] = useState(token ? 'verifying' : 'pending');
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const hasCalledAPI = useRef(false);

  const verify = async (verificationToken) => {
    try {
      await customerAuthApi.verifyEmail(verificationToken);
      setStatus('success');
      toast.success('Your email has been verified. You can now sign in.');
    } catch (error) {
      setStatus('error');
      setMessage(
        friendlyAuthError(error, 'This verification link is invalid or has expired.')
      );
    }
  };

  useEffect(() => {
    if (token && !hasCalledAPI.current) {
      hasCalledAPI.current = true;
      verify(token);
    }
  }, [token]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!email || resendLoading || resendCooldown > 0) {
      return;
    }

    setResendLoading(true);
    try {
      await customerAuthApi.resendVerificationEmail(email);
      toast.success('A new verification link has been sent to your email.');
      setResendCooldown(60);
    } catch (error) {
      // Error toast handled automatically by api.js
    } finally {
      setResendLoading(false);
    }
  };

  const maskEmail = (emailStr) => {
    if (!emailStr) return '';
    const [name, domain] = emailStr.split('@');
    if (!domain) return emailStr;
    const maskedName = name.length > 2 ? `${name.substring(0, 2)}***` : `${name[0]}***`;
    return `${maskedName}@${domain}`;
  };

  const heading =
    status === 'verifying'
      ? 'Verifying Email'
      : status === 'success'
        ? 'Email Verified'
        : status === 'error'
          ? 'Verification Failed'
          : 'Check Your Email';

  return (
    <AuthShell>
      <h1 className="auth-heading">{heading}</h1>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {status === 'verifying' ? 'Verifying your email' : message}
      </div>

      {status === 'verifying' ? (
        <p className="auth-status-copy" aria-busy="true">
          Please wait while we verify your email address.
        </p>
      ) : null}

      {status === 'success' ? (
        <p className="auth-status-copy">
          Your email has been verified! You can now sign in.
        </p>
      ) : null}

      {status === 'error' ? (
        <div className="auth-error-banner" role="alert">
          {message}
        </div>
      ) : null}

      {status === 'pending' ? (
        <>
          <p className="auth-status-copy">
            We sent a verification link to{' '}
            {email ? <strong>{maskEmail(email)}</strong> : 'your email address'}. Check your inbox
            and verify to continue.
          </p>
        </>
      ) : null}

      {(status === 'success' || status === 'error') && (
        <Link to={ROUTES.login} className="auth-submit">
          Sign in
        </Link>
      )}

      {status === 'pending' ? (
        <button
          type="button"
          className="auth-submit"
          onClick={handleResend}
          disabled={resendLoading || resendCooldown > 0 || !email}
          aria-busy={resendLoading || undefined}
        >
          {resendLoading
            ? 'Sending…'
            : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : 'Resend verification email'}
        </button>
      ) : null}

      {status === 'pending' && !email ? (
        <p className="auth-field-hint auth-resend-hint">
          Open this page from registration or sign-in to enable resending.
        </p>
      ) : null}

      <p className="auth-switch">
        <Link to={ROUTES.login}>Back to sign in</Link>
      </p>
    </AuthShell>
  );
}
