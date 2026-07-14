import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { ROUTES } from '../utils/navigation';
import { customerAuthApi } from '../services/api';
import './Auth.css';

export default function VerifyEmail() {
  const { token } = useParams();
  const location = useLocation();
  const email = location.state?.email || '';
  
  usePageTitle(token ? 'Verifying Email | Zivorah' : 'Check Your Email | Zivorah');

  const [status, setStatus] = useState(token ? 'verifying' : 'pending');
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const hasCalledAPI = useRef(false);

  const verify = async (verificationToken) => {
    try {
      await customerAuthApi.verifyEmail(verificationToken);
      setStatus('success');
      setMessage('Your email has been successfully verified! You can now sign in.');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'The verification link is invalid or has expired.');
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
    if (!email) {
      setMessage('Please enter your email on the login page to resend the link.');
      return;
    }
    setResendLoading(true);
    try {
      await customerAuthApi.resendVerificationEmail(email);
      setMessage('A new verification link has been sent to your email.');
      setResendCooldown(60); // 60s cooldown
    } catch (error) {
      setMessage(error.message || 'Failed to resend verification link.');
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

  return (
    <>
      <Navbar homeHref={ROUTES.home} />
      <main className="auth-page">
        <div className="auth-card">
          <h1 className="auth-heading">
            {status === 'verifying' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified'}
            {status === 'error' && 'Verification Failed'}
            {status === 'pending' && 'Check Your Email'}
          </h1>
          
          <div className="auth-subheading">
            {status === 'verifying' && <p>Please wait while we verify your email address.</p>}
            
            {status === 'success' && (
              <div style={{ color: 'green', marginBottom: '20px' }}>
                {message}
              </div>
            )}
            
            {status === 'error' && (
              <div style={{ color: 'red', marginBottom: '20px' }}>
                {message}
              </div>
            )}
            
            {status === 'pending' && (
              <div>
                <p>
                  We have sent a verification link to {email ? <strong>{maskEmail(email)}</strong> : 'your email address'}.
                  Please check your inbox and verify to continue.
                </p>
                {message && <div style={{ color: 'green', marginTop: '10px' }}>{message}</div>}
              </div>
            )}
          </div>

          {(status === 'success' || status === 'error') && (
            <Link to={ROUTES.login} className="auth-submit" style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}>
              Sign In
            </Link>
          )}

          {status === 'pending' && (
            <button 
              className="auth-submit" 
              onClick={handleResend} 
              disabled={resendLoading || resendCooldown > 0 || !email}
              style={{ marginTop: '20px' }}
            >
              {resendLoading ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email'}
            </button>
          )}

          <p className="auth-switch">
            <Link to={ROUTES.login}>Back to Sign In</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
