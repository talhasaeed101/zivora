import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AccountShell from '../components/account/AccountShell.jsx';
import Reveal from '../components/Reveal.jsx';
import { usePageTitle } from '../hooks/usePageTitle';
import { ticketApi } from '../services/api';
import { ROUTES, ticketPath } from '../utils/navigation';
import { toast } from '../context/ToastContext.jsx';
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

function buildInitialForm(state) {
  return {
    subject: state?.subject || '',
    category: state?.category || 'general',
    message: state?.orderNumber
      ? `I need help with order ${state.orderNumber}.\n\n`
      : '',
    orderId: state?.orderId || '',
  };
}

function friendlyTicketError(err) {
  const status = err?.status;
  const message = (err?.message || '').trim();
  const isGenericNotFound =
    !message ||
    /^not found$/i.test(message) ||
    /^request failed \(404\)$/i.test(message);

  // Prefer the API message for business errors (e.g. order/ticket not found).
  if (
    message &&
    message.length <= 160 &&
    !/^request failed \(\d+\)$/i.test(message) &&
    !message.toLowerCase().includes('failed to fetch') &&
    !(status === 404 && isGenericNotFound)
  ) {
    return message;
  }

  if (status === 404) {
    return 'Support is temporarily unavailable. Please try again in a moment, or contact us by email.';
  }

  if (status === 401 || status === 403) {
    return 'Please sign in again to continue with support tickets.';
  }

  if (status === 429) {
    return 'Too many requests. Please wait a few minutes and try again.';
  }

  if (
    !message ||
    message.length > 160 ||
    /^request failed \(\d+\)$/i.test(message) ||
    message.toLowerCase().includes('failed to fetch')
  ) {
    return 'Something went wrong. Please try again.';
  }

  return message;
}

export default function Tickets() {
  usePageTitle('Support Tickets | Zivorah');
  const location = useLocation();
  const entryState = location.state || null;
  const formId = useId();
  const subjectRef = useRef(null);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showForm, setShowForm] = useState(Boolean(entryState?.openForm));
  const [formData, setFormData] = useState(() => buildInitialForm(entryState));
  const [formError, setFormError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await ticketApi.getTickets();
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
      setTickets([]);
      setLoadError(friendlyTicketError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (showForm && subjectRef.current) {
      subjectRef.current.focus();
    }
  }, [showForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await ticketApi.submitTicket(formData);
      setFormData({ subject: '', category: 'general', message: '', orderId: '' });
      setShowForm(false);
      toast.success('Ticket submitted. Our team will follow up soon.');
      setStatusMessage('Support ticket submitted.');
      await loadTickets();
    } catch (err) {
      console.error('Failed to submit ticket:', err);
      // Error toast handled automatically by api.js
    } finally {
      setSubmitting(false);
    }
  };

  const countLabel =
    !loading && !loadError && tickets.length > 0
      ? tickets.length === 1
        ? '1 ticket'
        : `${tickets.length} tickets`
      : undefined;

  return (
    <AccountShell
      active="support"
      title="Support Tickets"
      description="Get help with orders, returns, and account questions."
      countLabel={countLabel}
    >
      <div className="tickets-page">
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {statusMessage}
        </div>

        <div className="tickets-toolbar">
          <button
            type="button"
            className="tickets-create-btn"
            onClick={() => {
              setShowForm((open) => !open);
              setFormError('');
            }}
            aria-expanded={showForm}
            aria-controls={`${formId}-panel`}
          >
            {showForm ? 'Cancel' : 'Create Ticket'}
          </button>
        </div>

        {showForm ? (
          <Reveal
            className="ticket-form-container"
            variant="fade-up"
            id={`${formId}-panel`}
          >
            <form className="ticket-form" onSubmit={handleSubmit} noValidate={false}>
              <div className="ticket-form-group">
                <label htmlFor={`${formId}-subject`}>
                  Subject <span aria-hidden="true">*</span>
                </label>
                <input
                  id={`${formId}-subject`}
                  ref={subjectRef}
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  autoComplete="off"
                  placeholder="Brief description of your issue"
                />
              </div>
              <div className="ticket-form-row">
                <div className="ticket-form-group">
                  <label htmlFor={`${formId}-category`}>
                    Category <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id={`${formId}-category`}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    {TICKET_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="ticket-form-group">
                  <label htmlFor={`${formId}-order`}>Order number (optional)</label>
                  <input
                    id={`${formId}-order`}
                    type="text"
                    value={formData.orderId}
                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                    autoComplete="off"
                    placeholder="From your Orders page"
                  />
                  <p className="ticket-form-hint">
                    Leave blank if this is not about a specific order.
                  </p>
                </div>
              </div>
              <div className="ticket-form-group">
                <label htmlFor={`${formId}-message`}>
                  Message <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id={`${formId}-message`}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  placeholder="Describe your issue in detail..."
                  rows={6}
                />
              </div>
              <button type="submit" className="ticket-submit-btn" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Ticket'}
              </button>
            </form>
          </Reveal>
        ) : null}

        {loading ? (
          <div className="tickets-loading" aria-busy="true" aria-live="polite">
            <span className="sr-only">Loading support tickets</span>
            <div className="tickets-skeleton" />
            <div className="tickets-skeleton" />
            <div className="tickets-skeleton" />
          </div>
        ) : null}

        {!loading && loadError ? (
          <div className="tickets-state tickets-state-error" role="alert">
            <p className="tickets-state-title">Unable to load tickets</p>
            <p className="tickets-state-copy">{loadError}</p>
            <button type="button" className="tickets-retry-btn" onClick={loadTickets}>
              Retry
            </button>
          </div>
        ) : null}

        {!loading && !loadError && tickets.length === 0 ? (
          <Reveal className="tickets-empty" variant="fade-up">
            <p className="tickets-empty-title">No support tickets yet</p>
            <p className="tickets-empty-copy">
              When you need help with an order or product question, create a ticket and our team will
              follow up here.
            </p>
            {!showForm ? (
              <button
                type="button"
                className="tickets-create-btn"
                onClick={() => setShowForm(true)}
              >
                Create Ticket
              </button>
            ) : null}
          </Reveal>
        ) : null}

        {!loading && !loadError && tickets.length > 0 ? (
          <div className="tickets-list">
            {tickets.map((ticket, index) => (
              <Reveal
                key={ticket._id}
                variant="fade-up"
                delay={Math.min(index, 6) * 30}
              >
                <Link to={ticketPath(ticket._id)} className="ticket-card">
                  <div className="ticket-card-main">
                    <div className="ticket-card-header">
                      <h2 className="ticket-card-subject">{ticket.subject}</h2>
                      <span
                        className="ticket-status"
                        style={{
                          backgroundColor: TICKET_STATUSES[ticket.status]?.color,
                        }}
                      >
                        {TICKET_STATUSES[ticket.status]?.label}
                      </span>
                    </div>
                    <div className="ticket-card-meta">
                      <span className="ticket-category">
                        {TICKET_CATEGORIES.find((c) => c.value === ticket.category)?.label}
                      </span>
                      <span className="ticket-date">
                        Updated {formatDate(ticket.lastMessageAt)}
                      </span>
                    </div>
                    {ticket.order?.orderNumber ? (
                      <div className="ticket-order">Order: {ticket.order.orderNumber}</div>
                    ) : null}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : null}
      </div>
    </AccountShell>
  );
}
