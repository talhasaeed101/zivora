import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext.jsx';
import './AuthLayout.css';
import { ROUTES } from '../../utils/navigation';

export default function SignUp() {
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
      setGoogleError(err.message || 'Google sign-up failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleError('Google sign-up was cancelled or failed. Please try again.');
  };

  return (
    <div className="auth-layout-container">
      <div className="auth-layout-left">
        <img src="/images/Rectangle 3298.png" alt="Sign Up" className="auth-image" />
      </div>
      <div className="auth-layout-right">
        <h1 className="auth-logo">ZIVORAH</h1>
        
        <div className="auth-content-wrapper">
          <h2 className="auth-heading">Sign up</h2>
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
              <label className="auth-label">Name</label>
              <div className="auth-input-container">
                <input 
                  type="text" 
                  className="auth-input" 
                  placeholder="Enter your Name" 
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <div className="auth-input-container">
                <input 
                  type="email" 
                  className="auth-input" 
                  placeholder="Enter your Email" 
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-container" style={{ justifyContent: 'space-between' }}>
                <input 
                  type="password" 
                  className="auth-input" 
                  placeholder="Enter your Password" 
                />
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer' }}>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </div>
            </div>

            <div className="auth-forgot-password">
              <Link to="/forget-password" style={{ color: '#666', textDecoration: 'none' }}>Forgot your password?</Link>
            </div>

            <button type="submit" className="auth-submit-btn">
              Sign Up
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <Link to={ROUTES.login || '/login'} className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
