import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import { useAuth } from '../context/AuthContext.jsx';
import './SocialLoginButtons.css';

export default function SocialLoginButtons({ onSuccess, onError }) {
  const { googleLogin, facebookLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      await googleLogin(credentialResponse.credential);
      onSuccess();
    } catch (err) {
      onError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSuccess = async (response) => {
    if (!response.accessToken) {
      onError('Facebook login failed');
      return;
    }
    try {
      setLoading(true);
      await facebookLogin(response.accessToken);
      onSuccess();
    } catch (err) {
      onError(err.message || 'Facebook login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`social-login-container ${loading ? 'loading' : ''}`}>
      <div className="google-btn-wrapper">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => onError('Google login failed')}
          text="continue_with"
          theme="outline"
          size="large"
          width="100%"
        />
      </div>
      
      <FacebookLogin
        appId={import.meta.env.VITE_FACEBOOK_APP_ID || 'dummy_id'}
        onSuccess={handleFacebookSuccess}
        onFail={(error) => onError('Facebook login failed')}
        onProfileSuccess={(response) => {}}
        render={({ onClick }) => (
          <button 
            type="button" 
            onClick={onClick} 
            disabled={loading}
            className="facebook-btn"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.312h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
            </svg>
            <span>Continue with Facebook</span>
          </button>
        )}
      />
    </div>
  );
}
