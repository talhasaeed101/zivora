import { useId, useState } from 'react';

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  disabled = false,
  autoComplete = 'new-password',
  required = false,
  labelAside = null,
}) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`auth-field${error ? ' is-invalid' : ''}`}>
      {label || labelAside ? (
        <div className={labelAside ? 'auth-field-row' : undefined}>
          {label ? (
            <label htmlFor={inputId}>
              {label}
              {required ? (
                <span className="auth-required" aria-hidden="true">
                  {' '}
                  *
                </span>
              ) : null}
            </label>
          ) : (
            <label htmlFor={inputId} className="sr-only">
              Password
            </label>
          )}
          {labelAside}
        </div>
      ) : null}
      <div className="auth-password-wrap">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        <button
          type="button"
          className="auth-password-toggle"
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {hint && !error ? (
        <span id={hintId} className="auth-field-hint">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className="auth-field-error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
