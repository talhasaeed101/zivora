import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { ROUTES } from '../utils/navigation';
import { publicEngagementApi } from '../services/api.js';
import './Contact.css';

export default function Contact() {
  usePageTitle('Contact Zivorah');

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

    const trimmedMessage = form.message.trim();
    if (trimmedMessage.length < 10) {
      setError('Message must be at least 10 characters.');
      setSaving(false);
      return;
    }

    try {
      await publicEngagementApi.submitContact({
        name: form.name.trim(),
        email: form.email.trim(),
        message: trimmedMessage,
      });
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
                    minLength={10}
                    disabled={saving}
                    placeholder="Tell us how we can help (at least 10 characters)"
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
              <p className="contact-info-value">zivorah.store@gmail.com</p>
            </div>
            <div className="contact-info-item">
              <p className="contact-info-label">Phone</p>
              <p className="contact-info-value">03392215181</p>
            </div>
            <div className="contact-info-item">
              <p className="contact-info-label">Hours</p>
              <p className="contact-info-value">Mon–Sat, 10am–6pm PKT</p>
            </div>
            <div className="contact-info-item">
              <a
                id="contact-whatsapp-btn"
                href="https://wa.me/923392215181"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-whatsapp-btn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
