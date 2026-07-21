import { useEffect, useId, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import AccountShell from '../components/account/AccountShell.jsx';
import { usePageTitle } from '../hooks/usePageTitle';
import { ticketApi } from '../services/api';
import { ROUTES } from '../utils/navigation';
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
  in_progress: { label: 'In Progress', color: '#a67c52' },
  waiting_for_customer: { label: 'Waiting for You', color: '#8f4a45' },
  resolved: { label: 'Resolved', color: '#5e7a66' },
  closed: { label: 'Closed', color: '#888' },
};

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function friendlyTicketError(err) {
  const status = err?.status;
  const message = (err?.message || '').trim();

  if (status === 404) {
    return 'This ticket could not be found.';
  }

  if (status === 401 || status === 403) {
    return 'Please sign in again to continue.';
  }

  if (
    !message ||
    message.length > 140 ||
    /^request failed \(\d+\)$/i.test(message)
  ) {
    return 'Something went wrong. Please try again.';
  }

  return message;
}

export default function TicketDetail() {
  usePageTitle('Support Ticket | Zivorah');
  const { id } = useParams();
  const navigate = useNavigate();
  const replyId = useId();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

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
    if (!reply.trim() || submitting) return;

    setSubmitting(true);
    setReplyError('');

    try {
      await ticketApi.replyToTicket(id, reply);
      setReply('');
      setStatusMessage('Reply sent.');
      await loadTicket();
    } catch (err) {
      console.error('Failed to send reply:', err);
      setReplyError(friendlyTicketError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AccountShell
      active="support"
      title={ticket?.subject || 'Support Ticket'}
      description={
        ticket
          ? `${TICKET_CATEGORIES.find((c) => c.value === ticket.category)?.label || 'Support'} · Created ${formatDate(ticket.createdAt)}`
          : 'Conversation with Zivorah support.'
      }
    >
      <div className="ticket-detail-page">
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {statusMessage}
        </div>

        <Link to={ROUTES.supportTickets} className="ticket-back-link">
          ← Back to Tickets
        </Link>

        {loading ? (
          <div className="ticket-detail-loading" aria-busy="true" aria-live="polite">
            Loading ticket…
          </div>
        ) : null}

        {!loading && ticket ? (
          <>
            <div className="ticket-detail-header">
              <div className="ticket-detail-title-row">
                <span
                  className="ticket-detail-status"
                  style={{ backgroundColor: TICKET_STATUSES[ticket.status]?.color }}
                >
                  {TICKET_STATUSES[ticket.status]?.label}
                </span>
              </div>
              <div className="ticket-detail-meta">
                <span className="ticket-detail-category">
                  {TICKET_CATEGORIES.find((c) => c.value === ticket.category)?.label}
                </span>
                {ticket.order?.orderNumber ? (
                  <span className="ticket-detail-order">Order: {ticket.order.orderNumber}</span>
                ) : null}
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
                      {msg.messageSenderModel === 'Admin' ? 'Zivorah Support' : 'You'}
                    </span>
                    <span className="ticket-message-date">{formatDate(msg.createdAt)}</span>
                  </div>
                  <div className="ticket-message-content">
                    {msg.message.split('\n').map((line, i) => (
                      <p key={i}>{line || '\u00A0'}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {ticket.status !== 'closed' ? (
              <div className="ticket-reply-container">
                <form className="ticket-reply-form" onSubmit={handleSubmitReply}>
                  <label htmlFor={replyId} className="ticket-reply-label">
                    Your reply
                  </label>
                  <textarea
                    id={replyId}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply…"
                    rows={4}
                    required
                    disabled={submitting}
                  />
                  {replyError ? (
                    <p className="ticket-reply-error" role="alert">
                      {replyError}
                    </p>
                  ) : null}
                  <button type="submit" className="ticket-reply-btn" disabled={submitting}>
                    {submitting ? 'Sending…' : 'Send Reply'}
                  </button>
                </form>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </AccountShell>
  );
}
