import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import InfoPageShell from '../components/info/InfoPageShell.jsx';
import Reveal from '../components/Reveal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { STORE_CONTACT } from '../constants/storeContact.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { publicEngagementApi } from '../services/api.js';
import { ROUTES } from '../utils/navigation';
import './Contact.css';

export default function Contact() {
  usePageTitle('Contact Zivorah | Customer Care');

  const { isAuthenticated } = useAuth();
  const formId = useId();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const nameId = `${formId}-name`;
  const emailId = `${formId}-email`;
  const messageId = `${formId}-message`;
  const errorId = `${formId}-error`;

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) {
      next.name = 'Please enter your name.';
    }
    if (!form.email.trim()) {
      next.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Please enter a valid email address.';
    }
    if (form.message.trim().length < 10) {
      next.message = 'Message must be at least 10 characters.';
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) {
      return;
    }

    setError('');
    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      await publicEngagementApi.submitContact({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
      setFieldErrors({});
    } catch (err) {
      if (err.status === 429) {
        setError(
          'You have sent too many messages. Please wait about 15 minutes, then try again — or reach us on WhatsApp or email.'
        );
      } else {
        setError('We could not send your message right now. Please try again, or contact us by email or WhatsApp.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <InfoPageShell
      title="Contact Us"
      breadcrumbCurrent="Contact"
      intro="Questions about an order, a piece from our collection, or something else? Reach out and we will help."
      variant="wide"
      cta={
        isAuthenticated ? (
          <>
            <Link to={ROUTES.supportTickets} className="info-btn info-btn-primary">
              View Support Tickets
            </Link>
            <Link
              to={ROUTES.supportTickets}
              state={{ openForm: true }}
              className="info-btn info-btn-secondary"
            >
              Create Support Ticket
            </Link>
          </>
        ) : (
          <Link to={ROUTES.collection} className="info-btn info-btn-secondary">
            Browse Collection
          </Link>
        )
      }
    >
      <div className="contact-layout">
        <Reveal className="contact-main" variant="fade-up">
          <p className="contact-note">
            For help with an existing order, include your order number in your message
            {isAuthenticated ? ', or create a support ticket from your account.' : '.'}
          </p>

          {isAuthenticated ? (
            <div className="contact-support-banner">
              <p>
                Signed in? For order-specific help, use support tickets so our team can follow up in
                one place.
              </p>
              <div className="contact-support-actions">
                <Link to={ROUTES.supportTickets} className="contact-support-link">
                  View tickets
                </Link>
                <span aria-hidden="true">·</span>
                <Link
                  to={ROUTES.supportTickets}
                  state={{ openForm: true }}
                  className="contact-support-link"
                >
                  Create ticket
                </Link>
              </div>
            </div>
          ) : null}

          {submitted ? (
            <div className="contact-success" role="status" aria-live="polite">
              <p className="contact-success-title">Message sent</p>
              <p>
                Thank you. Our team will review your message and get back to you. For urgent order
                questions, you can also reach us by email or WhatsApp.
              </p>
              <button
                type="button"
                className="contact-success-reset"
                onClick={() => setSubmitted(false)}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-live" aria-live="polite" aria-atomic="true">
                {error ? (
                  <p id={errorId} className="contact-error" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>

              <div className="contact-field">
                <label htmlFor={nameId}>
                  Name <span className="contact-required" aria-hidden="true">*</span>
                  <span className="visually-hidden"> (required)</span>
                </label>
                <input
                  id={nameId}
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange('name')}
                  required
                  disabled={saving}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? `${nameId}-error` : undefined}
                />
                {fieldErrors.name ? (
                  <p id={`${nameId}-error`} className="contact-field-error">
                    {fieldErrors.name}
                  </p>
                ) : null}
              </div>

              <div className="contact-field">
                <label htmlFor={emailId}>
                  Email <span className="contact-required" aria-hidden="true">*</span>
                  <span className="visually-hidden"> (required)</span>
                </label>
                <input
                  id={emailId}
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  required
                  disabled={saving}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? `${emailId}-error` : undefined}
                />
                {fieldErrors.email ? (
                  <p id={`${emailId}-error`} className="contact-field-error">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div className="contact-field">
                <label htmlFor={messageId}>
                  Message <span className="contact-required" aria-hidden="true">*</span>
                  <span className="visually-hidden"> (required)</span>
                </label>
                <textarea
                  id={messageId}
                  name="message"
                  value={form.message}
                  onChange={handleChange('message')}
                  required
                  minLength={10}
                  disabled={saving}
                  placeholder="Tell us how we can help (at least 10 characters)"
                  aria-invalid={Boolean(fieldErrors.message)}
                  aria-describedby={fieldErrors.message ? `${messageId}-error` : undefined}
                />
                {fieldErrors.message ? (
                  <p id={`${messageId}-error`} className="contact-field-error">
                    {fieldErrors.message}
                  </p>
                ) : null}
              </div>

              <button type="submit" className="contact-submit" disabled={saving}>
                {saving ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </Reveal>

        <Reveal className="contact-aside" variant="fade-up" delay={80} as="aside" aria-label="Customer care details">
          <h2 className="contact-aside-title">Customer care</h2>

          <div className="contact-methods">
            <div className="contact-method">
              <p className="contact-info-label">Support email</p>
              <a className="contact-info-value contact-info-link" href={`mailto:${STORE_CONTACT.email}`}>
                {STORE_CONTACT.email}
              </a>
            </div>
            <div className="contact-method">
              <p className="contact-info-label">Phone</p>
              <a className="contact-info-value contact-info-link" href={`tel:${STORE_CONTACT.phoneTel}`}>
                {STORE_CONTACT.phoneDisplay}
              </a>
            </div>
            <div className="contact-method">
              <p className="contact-info-label">Hours</p>
              <p className="contact-info-value">{STORE_CONTACT.hours}</p>
            </div>
          </div>

          <a
            href={`https://wa.me/${STORE_CONTACT.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-whatsapp-btn"
          >
            Chat on WhatsApp
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </Reveal>
      </div>
    </InfoPageShell>
  );
}
