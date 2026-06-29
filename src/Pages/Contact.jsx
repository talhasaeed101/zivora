import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { ROUTES } from '../utils/navigation';
import { publicEngagementApi } from '../services/api.js';
import './Contact.css';

export default function Contact() {
  usePageTitle('Contact Zivora');

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      await publicEngagementApi.submitContact(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar homeHref={ROUTES.home} />
      <main className="contact-page">
        <div className="contact-inner">
          <div>
            <h1 className="contact-title">Contact Us</h1>
            <p className="contact-intro">
              Have a question about an order, a piece from our collection, or a custom request?
              Send us a message and our team will get back to you.
            </p>

            {submitted ? (
              <div className="contact-success">
                Thank you. Our team will contact you shortly.
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                {error && <p className="contact-error">{error}</p>}
                <div className="contact-field">
                  <label htmlFor="contact-name">Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    value={form.name}
                    onChange={handleChange('name')}
                    required
                    disabled={saving}
                  />
                </div>
                <div className="contact-field">
                  <label htmlFor="contact-email">Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    required
                    disabled={saving}
                  />
                </div>
                <div className="contact-field">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    value={form.message}
                    onChange={handleChange('message')}
                    required
                    disabled={saving}
                  />
                </div>
                <button type="submit" className="contact-submit" disabled={saving}>
                  {saving ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          <aside className="contact-info-block">
            <h2>Customer Care</h2>
            <div className="contact-info-item">
              <p className="contact-info-label">Support Email</p>
              <p className="contact-info-value">support@zivora.com</p>
            </div>
            <div className="contact-info-item">
              <p className="contact-info-label">Hours</p>
              <p className="contact-info-value">Mon–Sat, 10am–6pm PKT</p>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
