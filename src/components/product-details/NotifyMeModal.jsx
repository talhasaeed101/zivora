import { useEffect, useId, useRef, useState } from 'react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFocusable(container) {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

export default function NotifyMeModal({
  isOpen,
  onClose,
  onSubmit,
  submitting = false,
  ringSize,
  metalColor,
}) {
  const titleId = useId();
  const emailId = useId();
  const dialogRef = useRef(null);
  const emailRef = useRef(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    setEmail('');
    setError('');

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      emailRef.current?.focus();
    }, 0);

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !submitting) {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return;
      }

      const focusable = getFocusable(dialogRef.current);
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose, submitting]);

  if (!isOpen) {
    return null;
  }

  const variantBits = [ringSize, metalColor].filter(Boolean);
  const variantLabel = variantBits.length > 0 ? variantBits.join(' · ') : 'this exact option';

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const normalizedEmail = String(email || '')
      .trim()
      .toLowerCase();

    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      emailRef.current?.focus();
      return;
    }

    setError('');
    await onSubmit?.(normalizedEmail);
  };

  return (
    <div
      className="pd-review-modal-overlay pd-notify-modal-overlay"
      onClick={() => {
        if (!submitting) {
          onClose?.();
        }
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="pd-review-modal pd-notify-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pd-review-modal-header">
          <h2 id={titleId} className="pd-review-modal-title">
            Notify Me When Available
          </h2>
          <button
            type="button"
            className="pd-review-modal-close"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p className="pd-notify-modal-copy">
          Enter your email and we&apos;ll let you know when {variantLabel} is back in stock.
        </p>

        <form className="pd-review-modal-form" onSubmit={handleSubmit} noValidate>
          <div className="pd-review-field">
            <label className="pd-review-field-label" htmlFor={emailId}>
              Email address
            </label>
            <input
              ref={emailRef}
              id={emailId}
              type="email"
              className="pd-review-input"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) {
                  setError('');
                }
              }}
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
              disabled={submitting}
              required
            />
          </div>

          {error ? (
            <p className="pd-review-modal-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="pd-review-modal-actions">
            <button
              type="button"
              className="pd-btn pd-btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="pd-btn pd-btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Notify Me'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
