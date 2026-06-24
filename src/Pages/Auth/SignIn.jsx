import React from 'react';
import { Link } from 'react-router-dom';
import './AuthLayout.css';
import { ROUTES } from '../../utils/navigation';

export default function SignIn() {
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
            <button className="auth-social-btn">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="auth-social-icon" />
              Google
            </button>
            <button className="auth-social-btn">
              <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="auth-social-icon" />
              Apple
            </button>
            <button className="auth-social-btn">
              <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="auth-social-icon" />
              Facebook
            </button>
          </div>

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
