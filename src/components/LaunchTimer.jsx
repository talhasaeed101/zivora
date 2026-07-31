import { useState, useEffect } from 'react';
import './LaunchTimer.css';

export default function LaunchTimer({ onTimerEnd }) {
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute for testing

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onTimerEnd) onTimerEnd();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimerEnd]);

  if (timeLeft <= 0) {
    return (
      <section className="launch-timer-section">
        <div className="launch-timer-inner">
          <p className="timer-ended-text">“Don't just follow trends. Let your jewelry reflect your story, your style, and the elegance that makes you unique.”</p>
        </div>
      </section>
    );
  }

  const days = 0;
  const hours = 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formatNumber = (num) => num.toString().padStart(2, '0');

  return (
    <section className="launch-timer-section">
      <div className="launch-timer-inner">
        <h2 className="timer-title">Launching Soon</h2>
        <p className="timer-subtitle">Website will be live in</p>

        <div className="timer-boxes">
          <div className="timer-box-wrapper">
            <div className="timer-box">{formatNumber(days)}</div>
            <span className="timer-label">Days</span>
          </div>
          <div className="timer-box-wrapper">
            <div className="timer-box">{formatNumber(hours)}</div>
            <span className="timer-label">Hours</span>
          </div>
          <div className="timer-box-wrapper">
            <div className="timer-box">{formatNumber(minutes)}</div>
            <span className="timer-label">Minutes</span>
          </div>
          <div className="timer-box-wrapper">
            <div className="timer-box">{formatNumber(seconds)}</div>
            <span className="timer-label">Seconds</span>
          </div>
        </div>
      </div>
    </section>
  );
}
