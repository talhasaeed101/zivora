import { useEffect, useRef, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext.jsx';
import './SocialLoginButtons.css';

function GoogleMark() {
  return (
    <svg className="google-mark" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 4.88 2.56 12.02l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 43.12 14.62 48 24 48z" />
    </svg>
  );
}

export default function SocialLoginButtons({ onSuccess, onError }) {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [btnWidth, setBtnWidth] = useState(0);
  const wrapperRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) {
      return undefined;
    }

    const updateWidth = () => {
      const nextWidth = Math.round(el.getBoundingClientRect().width);
      if (nextWidth > 0) {
        setBtnWidth(nextWidth);
      }
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  if (!googleClientId) {
    return null;
  }

  return (
    <div className={`social-login-container ${loading ? 'loading' : ''}`}>
      <div className="google-btn-wrapper" ref={wrapperRef}>
        <div className="custom-google-btn" aria-hidden="true">
          <GoogleMark />
          <span>Continue with Google</span>
        </div>
        {btnWidth > 0 ? (
          <div className="google-official-overlay">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => onError('Google login was cancelled or failed')}
              useOneTap={false}
              text="continue_with"
              shape="rectangular"
              theme="outline"
              size="large"
              width={String(Math.min(400, btnWidth))}
              logo_alignment="center"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
