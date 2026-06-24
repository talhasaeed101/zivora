import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../utils/navigation';
import { usePageTitle } from '../hooks/usePageTitle.js';
import './Auth.css';

export default function Register() {
  usePageTitle('Create Account | Zivora');
  const navigate = useNavigate();
  const { register, isAuthenticated, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return <div className="auth-page-loading"><p>Loading...</p></div>;
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
    setApiError('');

    if (!validate()) return;

    setLoading(true);

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      });
      navigate(ROUTES.home, { replace: true });
    } catch (error) {
      setApiError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar homeHref={ROUTES.home} />
      <main className="auth-page">
        <div className="auth-card">
          <h1 className="auth-heading">Create account</h1>
          <p className="auth-subheading">Join Zivora for a personalized jewelry experience</p>

          <form onSubmit={handleSubmit} noValidate>
            {apiError && <div className="auth-error-banner">{apiError}</div>}

            <div className="auth-field">
              <label htmlFor="register-name">Name</label>
              <input
                id="register-name"
                type="text"
                value={form.name}
                onChange={updateField('name')}
                placeholder="Your full name"
                autoComplete="name"
                disabled={loading}
              />
              {errors.name && <span className="auth-field-error">{errors.name}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                value={form.email}
                onChange={updateField('email')}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
              />
              {errors.email && <span className="auth-field-error">{errors.email}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="register-phone">Phone</label>
              <input
                id="register-phone"
                type="tel"
                value={form.phone}
                onChange={updateField('phone')}
                placeholder="+923001234567"
                autoComplete="tel"
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                value={form.password}
                onChange={updateField('password')}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                disabled={loading}
              />
              {errors.password && <span className="auth-field-error">{errors.password}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="register-confirm-password">Confirm Password</label>
              <input
                id="register-confirm-password"
                type="password"
                value={form.confirmPassword}
                onChange={updateField('confirmPassword')}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                disabled={loading}
              />
              {errors.confirmPassword && (
                <span className="auth-field-error">{errors.confirmPassword}</span>
              )}
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to={ROUTES.login}>Sign in</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
