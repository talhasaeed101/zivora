import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePageTitle } from '../hooks/usePageTitle';
import { ticketApi } from '../services/api';
import { ROUTES, ticketPath } from '../utils/navigation';
import './TicketDetail.css';

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

export default function TicketDetail() {
  usePageTitle('Support Ticket | Zivorah');
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTicket = async () => {
    setLoading(true);
    try {
      const res = await ticketApi.getTicket(id);
      setTicket(res.data);
    } catch (err) {
      console.error('Failed to load ticket:', err);
      navigate(ROUTES.supportTickets);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;

    setSubmitting(true);
    try {
      await ticketApi.replyToTicket(id, reply);
      setReply('');
      loadTicket();
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar homeHref={ROUTES.home} />
        <main className="ticket-detail-page">
          <div className="ticket-detail-inner">
            <div className="ticket-detail-loading">Loading ticket...</div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!ticket) return null;

  return (
    <>
      <Navbar homeHref={ROUTES.home} />
      <main className="ticket-detail-page">
        <div className="ticket-detail-inner">
          <div className="ticket-detail-header">
            <Link to={ticketPath()} className="ticket-back-link">← Back to Tickets</Link>
            <div className="ticket-detail-title-row">
              <h1 className="ticket-detail-title">{ticket.subject}</h1>
              <span
                className="ticket-detail-status"
                style={{ backgroundColor: TICKET_STATUSES[ticket.status]?.color }}
              >
                {TICKET_STATUSES[ticket.status]?.label}
              </span>
            </div>
            <div className="ticket-detail-meta">
              <span className="ticket-detail-category">
                {TICKET_CATEGORIES.find(c => c.value === ticket.category)?.label}
              </span>
              <span className="ticket-detail-date">Created {formatDate(ticket.createdAt)}</span>
              {ticket.order?.orderNumber && (
                <span className="ticket-detail-order">Order: {ticket.order.orderNumber}</span>
              )}
            </div>
          </div>

          <div className="ticket-messages">
            {ticket.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`ticket-message ${msg.messageSenderModel === 'Admin' ? 'admin-message' : 'customer-message'}`}
              >
                <div className="ticket-message-header">
                  <span className="ticket-message-sender">
                    {msg.messageSenderModel === 'Admin' ? 'Zivora Support' : 'You'}
                  </span>
                  <span className="ticket-message-date">{formatDate(msg.createdAt)}</span>
                </div>
                <div className="ticket-message-content">
                  {msg.message.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {ticket.status !== 'closed' && (
            <div className="ticket-reply-container">
              <form className="ticket-reply-form" onSubmit={handleSubmitReply}>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  rows={4}
                  required
                />
                <button
                  type="submit"
                  className="ticket-reply-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send Reply'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
