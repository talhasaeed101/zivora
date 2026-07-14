import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { notificationApi } from '../services/api.js';
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

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const [notificationsResponse, countResponse] = await Promise.all([
        notificationApi.getNotifications(),
        notificationApi.getUnreadCount(),
      ]);
      setNotifications(notificationsResponse.data?.notifications || []);
      setUnreadCount(countResponse.data?.count || 0);
    } catch (err) {
      setError(err.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    setMarkingRead(id);
    try {
      await notificationApi.markAsRead(id);
      await loadNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    } finally {
      setMarkingRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAllRead(true);
    try {
      await notificationApi.markAllAsRead();
      await loadNotifications();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    } finally {
      setMarkingAllRead(false);
    }
  };

  return (
    <>
      <Navbar homeHref={ROUTES.home} />
      <main className="notifications-page">
        <div className="notifications-inner">
          <div className="notifications-header">
            <div>
              <h1 className="notifications-title">My Notifications</h1>
              <p className="notifications-subtitle">Stay updated on your order statuses.</p>
            </div>
            <div className="notifications-actions">
              <Link to={ROUTES.profile} className="notifications-back-link">
                Back to Profile
              </Link>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead} 
                  disabled={markingAllRead}
                  className="notifications-mark-all-btn"
                >
                  {markingAllRead ? 'Marking...' : 'Mark All as Read'}
                </button>
              )}
            </div>
          </div>

          {loading && <ShimmerTableRows count={4} />}
          {error && <p className="notifications-error">{error}</p>}

          {!loading && !error && notifications.length === 0 && (
            <div className="notifications-empty">
              <p>You have no notifications yet.</p>
              <a href={ROUTES.collection} className="notifications-shop-btn">
                Shop Collection
              </a>
            </div>
          )}

          {!loading && notifications.length > 0 && (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <article key={notification._id} className={`notifications-card ${!notification.read ? 'notifications-card-unread' : ''}`}>
                  <div className="notifications-card-main">
                    <div className="notifications-card-header">
                      <p className="notifications-card-title">{notification.title}</p>
                      {!notification.read && (
                        <button 
                          onClick={() => handleMarkAsRead(notification._id)} 
                          disabled={markingRead === notification._id}
                          className="notifications-mark-read-btn"
                          aria-label="Mark as read"
                        >
                          {markingRead === notification._id ? '...' : 'Mark as Read'}
                        </button>
                      )}
                    </div>
                    <p className="notifications-card-message">{notification.message}</p>
                    <div className="notifications-card-footer">
                      <span className="notifications-card-date">{formatNotificationDate(notification.createdAt)}</span>
                      {notification.link && (
                        <Link to={notification.link} className="notifications-card-link">
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
