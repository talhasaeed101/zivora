import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AccountShell from '../components/account/AccountShell.jsx';
import Reveal from '../components/Reveal.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useSocket } from '../context/SocketContext.jsx';
import { ROUTES } from '../utils/navigation';
import { ShimmerTableRows } from '../components/Shimmer.jsx';
import './Notifications.css';

function formatNotificationDate(value) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Notifications() {
  usePageTitle('My Notifications | Zivorah');

  const { notifications, unreadCount, refreshNotifications, markRead, markAllRead } = useSocket();
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await refreshNotifications();
        setError('');
      } catch (err) {
        setError(
          err.message && err.message.length < 140
            ? err.message
            : 'Unable to load notifications.'
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshNotifications]);

  const handleMarkAsRead = async (id) => {
    if (markingRead) {
      return;
    }
    setMarkingRead(id);
    try {
      await markRead(id);
      setStatusMessage('Notification marked as read.');
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      setStatusMessage('Unable to mark notification as read.');
    } finally {
      setMarkingRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (markingAllRead) {
      return;
    }
    setMarkingAllRead(true);
    try {
      await markAllRead();
      setStatusMessage('All notifications marked as read.');
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      setStatusMessage('Unable to mark all notifications as read.');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const countLabel =
    !loading && !error && notifications.length > 0
      ? unreadCount > 0
        ? `${unreadCount} unread`
        : `${notifications.length} notifications`
      : undefined;

  return (
    <AccountShell
      active="notifications"
      title="My Notifications"
      description="Stay updated on your order statuses."
      countLabel={countLabel}
    >
      <div className="notifications-page">
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {statusMessage}
        </div>

        {unreadCount > 0 ? (
          <div className="notifications-toolbar">
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={markingAllRead}
              className="notifications-mark-all-btn"
            >
              {markingAllRead ? 'Marking…' : 'Mark All as Read'}
            </button>
          </div>
        ) : null}

        {loading ? (
          <div aria-busy="true" aria-live="polite">
            <span className="sr-only">Loading notifications</span>
            <ShimmerTableRows count={4} />
          </div>
        ) : null}

        {error ? (
          <div className="notifications-error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="notifications-retry-btn"
              onClick={async () => {
                setLoading(true);
                setError('');
                try {
                  await refreshNotifications();
                } catch (err) {
                  setError(
                    err.message && err.message.length < 140
                      ? err.message
                      : 'Unable to load notifications.'
                  );
                } finally {
                  setLoading(false);
                }
              }}
            >
              Retry
            </button>
          </div>
        ) : null}

        {!loading && !error && notifications.length === 0 ? (
          <Reveal className="notifications-empty" variant="fade-up">
            <p>You have no notifications yet.</p>
            <Link to={ROUTES.collection} className="notifications-shop-btn">
              Browse Collection
            </Link>
          </Reveal>
        ) : null}

        {!loading && !error && notifications.length > 0 ? (
          <div className="notifications-list">
            {notifications.map((notification, index) => (
              <Reveal
                as="article"
                key={notification._id}
                className={`notifications-card${!notification.read ? ' notifications-card-unread' : ''}`}
                variant="fade-up"
                delay={Math.min(index, 6) * 30}
              >
                <div className="notifications-card-main">
                  <div className="notifications-card-header">
                    <p className="notifications-card-title">{notification.title}</p>
                    {!notification.read ? (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notification._id)}
                        disabled={markingRead === notification._id}
                        className="notifications-mark-read-btn"
                        aria-label="Mark as read"
                      >
                        {markingRead === notification._id ? '…' : 'Mark as Read'}
                      </button>
                    ) : null}
                  </div>
                  <p className="notifications-card-message">{notification.message}</p>
                  <div className="notifications-card-footer">
                    <span className="notifications-card-date">
                      {formatNotificationDate(notification.createdAt)}
                    </span>
                    {notification.link ? (
                      <Link to={notification.link} className="notifications-card-link">
                        View Details
                      </Link>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : null}
      </div>
    </AccountShell>
  );
}
