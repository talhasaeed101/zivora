import { useId, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthShell from '../components/auth/AuthShell.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import SocialLoginButtons from '../components/SocialLoginButtons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { ROUTES } from '../utils/navigation';
import { toast } from '../context/ToastContext.jsx';
import './Auth.css';

export default function Register() {
  usePageTitle('Create Account | Zivorah');
  const navigate = useNavigate();
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const errorRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="auth-page-loading" aria-busy="true" aria-live="polite">
        <p>Loading…</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />;
  }

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Name is required';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!form.password) {
      nextErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) {
      return;
    }

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      });
      navigate(ROUTES.verifyEmail, {
        replace: true,
        state: { email: form.email.trim() },
      });
    } catch (error) {
      // Error toast is automatically handled by api.js
      window.requestAnimationFrame(() => errorRef.current?.focus?.());
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell imageSrc="/images/signup.png">
      <h1 className="auth-heading">Create Account</h1>
      <p className="auth-subheading">
        Join Zivorah to save favorites, track orders, and manage your account.
      </p>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {loading ? 'Creating account' : ''}
      </div>

      <SocialLoginButtons
        onSuccess={() => navigate(ROUTES.home, { replace: true })}
        onError={(msg) => {
          toast.error('Social sign-in failed. Please try again.');
          window.requestAnimationFrame(() => errorRef.current?.focus?.());
        }}
      />

      <div className="auth-divider">Or</div>

      <form onSubmit={handleSubmit} noValidate>
        <div className={`auth-field${errors.name ? ' is-invalid' : ''}`}>
          <label htmlFor={nameId}>
            Full name <span className="auth-required" aria-hidden="true">*</span>
          </label>
          <input
            id={nameId}
            type="text"
            value={form.name}
            onChange={updateField('name')}
            placeholder="Your full name"
            autoComplete="name"
            disabled={loading}
            required
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${nameId}-error` : undefined}
          />
          {errors.name ? (
            <span id={`${nameId}-error`} className="auth-field-error" role="alert">
              {errors.name}
            </span>
          ) : null}
        </div>

        <div className={`auth-field${errors.email ? ' is-invalid' : ''}`}>
          <label htmlFor={emailId}>
            Email <span className="auth-required" aria-hidden="true">*</span>
          </label>
          <input
            id={emailId}
            type="email"
            value={form.email}
            onChange={updateField('email')}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={loading}
            required
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${emailId}-error` : undefined}
          />
          {errors.email ? (
            <span id={`${emailId}-error`} className="auth-field-error" role="alert">
              {errors.email}
            </span>
          ) : null}
        </div>

        <div className="auth-field">
          <label htmlFor={phoneId}>
            Phone <span className="auth-optional">(optional)</span>
          </label>
          <input
            id={phoneId}
            type="tel"
            value={form.phone}
            onChange={updateField('phone')}
            placeholder="+923001234567"
            autoComplete="tel"
            disabled={loading}
          />
        </div>

        <PasswordInput
          id="register-password"
          label="Password"
          value={form.password}
          onChange={updateField('password')}
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          error={errors.password}
          hint="Use at least 8 characters."
          disabled={loading}
          required
        />

        <PasswordInput
          id="register-confirm-password"
          label="Confirm password"
          value={form.confirmPassword}
          onChange={updateField('confirmPassword')}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword}
          disabled={loading}
          required
        />

        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
          aria-busy={loading || undefined}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to={ROUTES.login}>Sign in</Link>
      </p>
    </AuthShell>
  );
}
