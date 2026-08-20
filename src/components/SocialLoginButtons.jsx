import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext.jsx';
import './SocialLoginButtons.css';

export default function SocialLoginButtons({ onSuccess, onError }) {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      onError('Google login failed');
      return;
    }

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

  return (
    <div className={`social-login-container ${loading ? 'loading' : ''}`}>
      {googleClientId ? (
        <div className="google-btn-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => onError('Google login was cancelled or failed')}
            useOneTap={false}
            text="continue_with"
            shape="rectangular"
            theme="outline"
            size="large"
            width="320"
          />
        </div>
      ) : null}
    </div>
  );
}
