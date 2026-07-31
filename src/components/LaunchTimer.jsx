import { useState, useEffect } from 'react';
import './LaunchTimer.css';

export default function LaunchTimer({ onTimerEnd }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Fixed target date: August 14, 2026, 00:00:00 local time
    const targetTime = new Date('2026-08-14T00:00:00').getTime();

    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = targetTime - now;
      
      if (difference <= 0) {
        setTimeLeft(0);
        setIsEnded(true);
        if (onTimerEnd) onTimerEnd();
      } else {
        setTimeLeft(Math.floor(difference / 1000));
      }
      setIsLoaded(true);
    };

    calculateTimeLeft(); // Initial calculation
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [onTimerEnd]);

  if (!isLoaded) return null;

  if (isEnded) {
    return (
      <section className="launch-timer-section">
        <div className="launch-timer-inner">
          <p className="timer-ended-text">“Don't just follow trends. Let your jewelry reflect your story, your style, and the elegance that makes you unique.”</p>
        </div>
      </section>
    );
  }

  const days = Math.floor(timeLeft / (3600 * 24));
  const hours = Math.floor((timeLeft % (3600 * 24)) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
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
