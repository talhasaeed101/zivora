import React, { useState } from 'react';
import './AuthLayout.css';

export default function EmailVerification() {
  const [code, setCode] = useState(['4', '8', '1', '', '', '']);

  const handleChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    if (value && index < 5) {
      document.getElementById(`code-input-${index + 1}`).focus();
    }
  };

  return (
    <div className="auth-layout-container">
      <div className="auth-layout-left">
        <img src="/images/Rectangle 3298.png" alt="Email Verification" className="auth-image" />
      </div>
      <div className="auth-layout-right">
        <h1 className="auth-logo">ZIVORAH</h1>
        
        <div className="auth-content-wrapper">
          <h2 className="auth-heading">Email Verification</h2>
          <p className="auth-subheading">
            Please enter <strong>6-digit</strong> verification code that was sent<br/>to your email
          </p>

          <div className="verification-code-row">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-input-${index}`}
                type="text"
                className={`verification-input ${digit ? 'filled' : ''}`}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                maxLength="1"
              />
            ))}
          </div>

          <p className="auth-footer-text" style={{ marginTop: '0', marginBottom: '1.5rem', fontSize: '0.75rem' }}>
            Didn't receive an email? <a href="#resend" className="auth-link">Resend</a>
          </p>

          <button className="auth-submit-btn">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
