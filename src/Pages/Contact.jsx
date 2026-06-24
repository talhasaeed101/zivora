import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { ROUTES } from '../utils/navigation';
import './Contact.css';

export default function Contact() {
  usePageTitle('Contact Zivora');

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
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
                <div className="contact-field">
                  <label htmlFor="contact-name">Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    value={form.name}
                    onChange={handleChange('name')}
                    required
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
                  />
                </div>
                <div className="contact-field">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    value={form.message}
                    onChange={handleChange('message')}
                    required
                  />
                </div>
                <button type="submit" className="contact-submit">
                  Send Message
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
              <p className="contact-info-label">Business Hours</p>
              <p className="contact-info-value">
                Monday – Saturday: 10:00 AM – 7:00 PM
                <br />
                Sunday: Closed
              </p>
            </div>
            <div className="contact-info-item">
              <p className="contact-info-label">Location</p>
              <p className="contact-info-value">
                Zivora Studio
                <br />
                Main Boulevard, Gulberg III
                <br />
                Lahore, Pakistan
              </p>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
