import { useEffect, useRef } from 'react';
import './OtpInput.css';

const OTP_LENGTH = 6;

export default function OtpInput({
  value = '',
  onChange,
  disabled = false,
  error = false,
  autoFocus = true,
  idPrefix = 'otp',
}) {
  const inputsRef = useRef([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] || '');

  useEffect(() => {
    if (autoFocus && !disabled) {
      inputsRef.current[0]?.focus();
    }
  }, [autoFocus, disabled]);

  const emit = (nextDigits) => {
    onChange?.(nextDigits.join('').slice(0, OTP_LENGTH));
  };

  const focusIndex = (index) => {
    const el = inputsRef.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const handleChange = (index, event) => {
    if (disabled) return;

    const raw = event.target.value.replace(/\D/g, '');
    if (!raw) {
      const next = [...digits];
      next[index] = '';
      emit(next);
      return;
    }

    const chars = raw.split('');
    const next = [...digits];
    let cursor = index;

    chars.forEach((char) => {
      if (cursor < OTP_LENGTH) {
        next[cursor] = char;
        cursor += 1;
      }
    });

    emit(next);
    focusIndex(Math.min(cursor, OTP_LENGTH - 1));
  };

  const handleKeyDown = (index, event) => {
    if (disabled) return;

    if (event.key === 'Backspace') {
      event.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = '';
        emit(next);
      } else if (index > 0) {
        next[index - 1] = '';
        emit(next);
        focusIndex(index - 1);
      }
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
    }

    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusIndex(index + 1);
    }
  };

  const handlePaste = (event) => {
    if (disabled) return;
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] || '');
    emit(next);
    focusIndex(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  return (
    <div
      className={`otp-input${error ? ' is-invalid' : ''}`}
      role="group"
      aria-label="6-digit verification code"
    >
      {digits.map((digit, index) => (
        <input
          key={`${idPrefix}-${index}`}
          id={`${idPrefix}-${index}`}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          className={`otp-input-box${digit ? ' is-filled' : ''}`}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
        />
      ))}
    </div>
  );
}
