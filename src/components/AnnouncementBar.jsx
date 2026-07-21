import { useEffect, useState } from 'react';
import { STORE_ANNOUNCEMENTS } from '../constants/storefrontCopy.js';
import './AnnouncementBar.css';

const ROTATE_MS = 4200;

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (STORE_ANNOUNCEMENTS.length < 2) {
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
        setIndex((current) => (current + 1) % STORE_ANNOUNCEMENTS.length);
        setVisible(true);
      }, 260);
    }, ROTATE_MS);

    return () => window.clearInterval(timer);
  }, []);

  if (!STORE_ANNOUNCEMENTS.length) {
    return null;
  }

  return (
    <div
      className="announcement-bar"
      role="region"
      aria-label="Store announcements"
      aria-live="polite"
    >
      <p className={`announcement-bar-text${visible ? ' is-visible' : ''}`}>
        {STORE_ANNOUNCEMENTS[index]}
      </p>
    </div>
  );
}
