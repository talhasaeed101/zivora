import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePageTitle } from '../hooks/usePageTitle';
import { ticketApi } from '../services/api';
import { ROUTES, ticketPath } from '../utils/navigation';
import './Tickets.css';

const TICKET_CATEGORIES = [
  { value: 'order_issue', label: 'Order Issue' },
  { value: 'product_question', label: 'Product Question' },
  { value: 'return_refund', label: 'Return & Refund' },
  { value: 'payment_issue', label: 'Payment Issue' },
  { value: 'account_issue', label: 'Account Issue' },
  { value: 'general', label: 'General Inquiry' },
];

const TICKET_STATUSES = {
  open: { label: 'Open', color: '#967259' },
  in_progress: { label: 'In Progress', color: '#e4a853' },
  waiting_for_customer: { label: 'Waiting for You', color: '#c75050' },
  resolved: { label: 'Resolved', color: '#5e9e6e' },
  closed: { label: 'Closed', color: '#888' },
};

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function Tickets() {
  usePageTitle('Support Tickets | Zivorah');
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ subject: '', category: 'general', message: '', orderId: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await ticketApi.getTickets();
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ticketApi.submitTicket(formData);
      setFormData({ subject: '', category: 'general', message: '', orderId: '' });
      setShowForm(false);
      loadTickets();
    } catch (err) {
      console.error('Failed to submit ticket:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar homeHref={ROUTES.home} />
      <main className="tickets-page">
        <div className="tickets-inner">
          <div className="tickets-header">
            <div>
              <h1 className="tickets-title">Support Tickets</h1>
              <p className="tickets-subtitle">Get help with your orders and questions</p>
            </div>
            <button
              className="tickets-create-btn"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancel' : 'Create Ticket'}
            </button>
          </div>

          {showForm && (
            <div className="ticket-form-container">
              <form className="ticket-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      {TICKET_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Order ID (optional)</label>
                    <input
                      type="text"
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                      placeholder="Related order ID"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    placeholder="Describe your issue in detail..."
                    rows={6}
                  />
                </div>
                <button
                  type="submit"
                  className="ticket-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </form>
            </div>
          )}

          {loading && <div className="tickets-loading">Loading tickets...</div>}
          {!loading && tickets.length === 0 && (
            <div className="tickets-empty">
              <p>You haven't created any support tickets yet.</p>
            </div>
          )}
          {!loading && tickets.length > 0 && (
            <div className="tickets-list">
              {tickets.map((ticket) => (
                <Link
                  key={ticket._id}
                  to={ticketPath(ticket._id)}
                  className="ticket-card"
                >
                  <div className="ticket-card-main">
                    <div className="ticket-card-header">
                      <h3 className="ticket-card-subject">{ticket.subject}</h3>
                      <span
                        className="ticket-status"
                        style={{ backgroundColor: TICKET_STATUSES[ticket.status]?.color }}
                      >
                        {TICKET_STATUSES[ticket.status]?.label}
                      </span>
                    </div>
                    <div className="ticket-card-meta">
                      <span className="ticket-category">
                        {TICKET_CATEGORIES.find(c => c.value === ticket.category)?.label}
                      </span>
                      <span className="ticket-date">
                        Updated {formatDate(ticket.lastMessageAt)}
                      </span>
                    </div>
                    {ticket.order?.orderNumber && (
                      <div className="ticket-order">
                        Order: {ticket.order.orderNumber}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
