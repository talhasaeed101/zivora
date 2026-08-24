import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthLayout.css';

export default function ResendVerification() {
  const navigate = useNavigate();

  return (
    <div className="auth-layout-container">
      <div className="auth-layout-left">
        <img src="/images/Rectangle 3298.png" alt="Resend Verification" className="auth-image" />
      </div>
      <div className="auth-layout-right">
        
        <div className="auth-content-wrapper" style={{ alignItems: 'center' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: '#9b5110', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '1.5rem',
            color: 'white'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
              <circle cx="18" cy="18" r="4" fill="white" stroke="none"></circle>
              <path d="M16 18h4" stroke="#9b5110" strokeWidth="2"></path>
              <path d="M18 16v4" stroke="#9b5110" strokeWidth="2"></path>
            </svg>
          </div>

          <h2 className="auth-heading">Resend Verification Code</h2>
          <p className="auth-subheading">
            We have just sent an email with a new verification code to<br/>
            <span style={{ color: '#9b5110', fontWeight: '500' }}>yourmail@gmail.com</span>
          </p>

          <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
            <button 
              className="auth-submit-btn" 
              style={{ flex: 1, backgroundColor: 'white', color: '#111', border: '1px solid #eaeaea' }}
              onClick={() => navigate('/login')}
            >
              Got it
            </button>
            <button 
              className="auth-submit-btn" 
              style={{ flex: 1 }}
            >
              Send Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
