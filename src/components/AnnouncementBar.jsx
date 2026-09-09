import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { STORE_ANNOUNCEMENTS } from '../constants/storefrontCopy.js';
import { useCampaigns } from '../context/CampaignContext.jsx';
import { resolveCampaignCtaHref } from '../utils/campaignCta.js';
import './AnnouncementBar.css';

const ROTATE_MS = 4200;

export default function AnnouncementBar() {
  const { primary, refresh } = useCampaigns();
  const campaignAnnouncement =
    primary?.merchandising?.showAnnouncement && primary?.merchandising?.announcementText
      ? primary.merchandising.announcementText
      : null;
  const badgeText = primary?.merchandising?.badgeText || null;

  const messages = useMemo(() => {
    // During an active sale, keep the campaign message locked (no rotate-away).
    if (campaignAnnouncement) {
      return [campaignAnnouncement];
    }
    return STORE_ANNOUNCEMENTS;
  }, [campaignAnnouncement]);

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setIndex(0);
  }, [campaignAnnouncement]);

  useEffect(() => {
    if (messages.length < 2) {
      return undefined;
    }

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % messages.length);
        setVisible(true);
      }, 260);
    }, ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [messages]);

  useEffect(() => {
    if (!primary?.endAt || !campaignAnnouncement) {
      return undefined;
    }

    const end = new Date(primary.endAt).getTime();
    if (!Number.isFinite(end)) return undefined;

    const remaining = end - Date.now();
    if (remaining <= 0) {
      refresh();
      return undefined;
    }

    const timer = window.setTimeout(() => {
      refresh();
    }, Math.min(remaining + 500, 2147483647));

    return () => window.clearTimeout(timer);
  }, [primary?.endAt, campaignAnnouncement, refresh]);

  if (!messages.length) {
    return null;
  }

  const href = resolveCampaignCtaHref(primary?.merchandising, primary?.slug);

  const text = messages[index] || messages[0];
  const isCampaign = Boolean(campaignAnnouncement);

  return (
    <div
      className={`announcement-bar${isCampaign ? ' announcement-bar--sale' : ''}`}
      role="region"
      aria-label="Store announcements"
      aria-live="polite"
    >
      {isCampaign ? (
        <Link
          to={href}
          className={`announcement-bar-text announcement-bar-link announcement-bar-sale-row${
            visible ? ' is-visible' : ''
          }`}
        >
          {badgeText ? <span className="announcement-bar-chip">{badgeText}</span> : null}
          <span>{text}</span>
          <span className="announcement-bar-shop">Shop sale</span>
        </Link>
      ) : (
        <p className={`announcement-bar-text${visible ? ' is-visible' : ''}`}>{text}</p>
      )}
    </div>
  );
}
