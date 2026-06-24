import React from 'react';
import './AuthLayout.css';

export default function ForgetPasswordEmail() {
  return (
    <div className="auth-layout-container">
      <div className="auth-layout-left">
        <img src="/images/Rectangle 3298.png" alt="Forget Password Email" className="auth-image" />
      </div>
      <div className="auth-layout-right">
        <h1 className="auth-logo">ZIVORAH</h1>
        
        <div className="auth-content-wrapper">
          <h2 className="auth-heading">Forget Password</h2>
          <p className="auth-subheading">
            Provide your account's email for which you want to<br/>reset your password!
          </p>

          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
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

            <button type="submit" className="auth-submit-btn" style={{ marginTop: '1.5rem' }}>
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
