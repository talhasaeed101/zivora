import { useState, useEffect, useRef } from 'react';
import './LaunchTimer.css';

const LAUNCH_DATE = new Date(2026, 8, 10, 0, 0, 0);

function getTimeLeft() {
  const diff = LAUNCH_DATE.getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export function isLaunchTimerActive() {
  return Date.now() < LAUNCH_DATE.getTime();
}

export default function LaunchTimer({ onTimerEnd }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);
  const hasEndedRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const remaining = getTimeLeft();
      setTimeLeft(remaining);

      if (!remaining && !hasEndedRef.current) {
        hasEndedRef.current = true;
        if (onTimerEnd) onTimerEnd();
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [onTimerEnd]);

  if (!timeLeft) {
    return (
      <section className="launch-timer-section">
        <div className="launch-timer-inner">
          <p className="timer-ended-text">
            &ldquo;Don&apos;t just follow trends. Let your jewelry reflect your story, your style, and the elegance that makes you unique.&rdquo;
          </p>
        </div>
      </section>
    );
  }

  const formatNumber = (num) => num.toString().padStart(2, '0');

  return (
    <section className="launch-timer-section">
      <div className="launch-timer-inner">
        <h2 className="timer-title">Launching Soon</h2>
        <p className="timer-subtitle">Website will be live in</p>

        <div className="timer-boxes">
          <div className="timer-box-wrapper">
            <div className="timer-box">{formatNumber(timeLeft.days)}</div>
            <span className="timer-label">Days</span>
          </div>
          <div className="timer-box-wrapper">
            <div className="timer-box">{formatNumber(timeLeft.hours)}</div>
            <span className="timer-label">Hours</span>
          </div>
          <div className="timer-box-wrapper">
            <div className="timer-box">{formatNumber(timeLeft.minutes)}</div>
            <span className="timer-label">Minutes</span>
          </div>
          <div className="timer-box-wrapper">
            <div className="timer-box">{formatNumber(timeLeft.seconds)}</div>
            <span className="timer-label">Seconds</span>
          </div>
        </div>
      </div>
    </section>
  );
}
