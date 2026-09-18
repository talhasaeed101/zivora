import { useId, useState } from 'react';
import { EyeIcon, EyeOffIcon } from './icons.jsx';
import './PasswordInput.css';

export default function PasswordInput({
  id,
  name,
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
  fieldClassName = 'auth-field',
  errorClassName = 'auth-field-error',
  hintClassName = 'auth-field-hint',
}) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`${fieldClassName}${error ? ' is-invalid' : ''}`}>
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
          name={name}
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
          {visible ? (
            <EyeOffIcon className="auth-password-toggle-icon" />
          ) : (
            <EyeIcon className="auth-password-toggle-icon" />
          )}
        </button>
      </div>
      {hint && !error ? (
        <span id={hintId} className={hintClassName}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className={errorClassName} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
