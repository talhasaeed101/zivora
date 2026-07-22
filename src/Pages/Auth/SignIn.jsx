import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext.jsx';
import './AuthLayout.css';
import { ROUTES } from '../../utils/navigation';

export default function SignIn() {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleError('');
    setGoogleLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/');
    } catch (err) {
      setGoogleError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleError('Google sign-in was cancelled or failed. Please try again.');
  };

  return (
    <div className="auth-layout-container">
      <div className="auth-layout-left">
        <img src="/images/image 1 (3).png" alt="Sign In" className="auth-image" />
      </div>
      <div className="auth-layout-right">
        <h1 className="auth-logo">ZIVORAH</h1>
        
        <div className="auth-content-wrapper">
          <h2 className="auth-heading">Sign in</h2>
          <div style={{ marginBottom: '2rem' }}></div>

          <div className="auth-social-row">
            {/* Google — real OAuth button, styled to match */}
            <div style={{ width: '100%' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="continue_with"
                theme="outline"
                size="large"
                width="100%"
                disabled={googleLoading}
              />
            </div>
            <button className="auth-social-btn">
              <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="auth-social-icon" />
              Apple
            </button>
            <button className="auth-social-btn">
              <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="auth-social-icon" />
              Facebook
            </button>
          </div>

          {googleError && (
            <p style={{ color: '#c0392b', fontSize: '13px', marginTop: '8px', textAlign: 'center' }}>
              {googleError}
            </p>
          )}

          <div className="auth-divider">or</div>

          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            <div className="auth-field">
              <label className="auth-label">Phone Number</label>
              <div className="auth-input-container">
                <div className="phone-prefix">
                  <span role="img" aria-label="Pakistan Flag">🇵🇰</span> +92
                </div>
                <input 
                  type="tel" 
                  className="auth-input" 
                  placeholder="Enter your Phone Number" 
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn">
              Sign in
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account? <Link to={ROUTES.register || '/register'} className="auth-link">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
