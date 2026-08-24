import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthLayout.css';

export default function ForgetPasswordSelection() {
  const navigate = useNavigate();

  return (
    <div className="auth-layout-container">
      <div className="auth-layout-left">
        <img src="/images/Rectangle 3298.png" alt="Forget Password" className="auth-image" />
      </div>
      <div className="auth-layout-right">
        <h1 className="auth-logo">ZIVORAH</h1>
        
        <div className="auth-content-wrapper">
          <h2 className="auth-heading">Forget Password</h2>
          <p className="auth-subheading">
            Select which contact detail should we use to reset<br/>your password?
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="forget-option-btn">
              <div className="forget-option-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
              </div>
              <div className="forget-option-text">
                <span className="forget-option-title">Via SMS</span>
                <span className="forget-option-value">+92 312 3456789</span>
              </div>
            </button>

            <button 
              className="forget-option-btn"
              onClick={() => navigate('/forget-password/email')}
            >
              <div className="forget-option-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div className="forget-option-text">
                <span className="forget-option-title">Via Email</span>
                <span className="forget-option-value">support@gmail.com</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
